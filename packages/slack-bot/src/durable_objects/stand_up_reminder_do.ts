import { Frequency } from '@prisma/client';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { standUpOnBoardingMessage } from '../ui/stand_up_on_boarding_message';
import { DateTime, DurationLike } from 'luxon';
import { slackStandUpUpdateAlertMessage } from '../ui/stand_up_update_alert_message';
import { ISlackMessageResponse } from '../client/types';

/************************* Types *************************/
export interface ISlackStandUpReminderDORequest {
  data: ISlackStandUpReminderDOData | { type: 'delete_alert_message' };
}

export interface ISlackStandUpReminderDOData {
  type: 'initialize';
  standUpId: string;
  name: string;
  slackTeamId: string;
  slackChannelId: string;
  remindAt: number;
  timezone: string;
  standUpAt: string;
  frequency: Frequency;
  participantSlackId: string;
}

type SlackStandUpReminderDOState = { alerted: boolean };

/************************* Durable Object *************************/
export class SlackStandUpReminderDO {
  _id: DurableObjectId;
  _storage: DurableObjectStorage;
  _env: Bindings;
  _data: ISlackStandUpReminderDOData | undefined;
  _state: SlackStandUpReminderDOState | undefined;

  protected constructor(state: DurableObjectState, env: Bindings) {
    this._id = state.id;
    this._storage = state.storage;
    this._env = env;
    (async () => {
      await state.blockConcurrencyWhile(async () => {
        this._data = await this._storage.get('data');
        this._state = await this._storage.get('state');
      });
    })();
  }

  /**
   * This method is responsible for sending a reminder message to the participant. It
   * is called when the alarm is triggered. It sends a message to the participant
   * in the private chat with the bot. It also updates the alarm to the next day.
   * If the participant does not respond to the reminder message, it deletes the
   * reminder message after some time.
   *
   * @returns Response
   */
  async alarm() {
    if (!this._data || !this._state) {
      throw new Error('Data and state must be initialized');
    }

    const { frequency, slackTeamId, timezone } = this._data;
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));
    const slackClient = new Slack(token);
    const weekday = DateTime.now().setZone(timezone).weekday;

    if (this._state.alerted) {
      await this._reschedule();
      await this._deleteAlertMessage();
      return;
    }

    if (!this._isValidDayOfStandUp(frequency, weekday)) {
      await this._reschedule();
      return;
    }

    const response = await slackClient.postMessage({
      channel: this._data.participantSlackId,
      blocks: slackStandUpUpdateAlertMessage(
        this._data.participantSlackId,
        this._data.standUpId,
      ).blocks,
    });

    if (response.ok) {
      console.info('Stand up update alert message sent successfully');
      this._storage.put<ISlackMessageResponse>(
        'reminder_message_response',
        response,
      );
      this._state.alerted = true;
    }

    await this._persist();
    await this._reschedule({ hours: 3 });

    return new Response(null, { status: 200 });
  }

  /** Entry point for the DO. This is where the DO receive a requests.
   *
   * @param request - The request to handle
   * @returns A response to the request
   */
  fetch(request: Request): Promise<Response> {
    switch (request.method) {
      case 'DELETE':
        return this._delete();
      default:
        return this._handle(request);
    }
  }

  private async _handle(request: Request): Promise<Response> {
    const body: ISlackStandUpReminderDORequest = await request.json();

    switch (body.data.type) {
      case 'initialize':
        return this._initialize(body.data);
      case 'delete_alert_message':
        return this._deleteAlertMessage();
      default:
        return new Response(null, { status: 500 });
    }
  }

  /**
   * This method is responsible for initializing the Durable Object with the
   * data required to send the reminder message to the participant.
   *
   * @note This method is called when a stand-up is created.
   * Also, it sends an onboarding message to the participant.
   *
   * @param data - Data required to initialize the Durable Object
   *
   */
  private async _initialize(data: ISlackStandUpReminderDOData) {
    this._data = data;
    this._state = { alerted: false };

    const {
      name,
      remindAt,
      standUpAt,
      slackTeamId,
      slackChannelId,
      participantSlackId,
    } = data;

    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    await this._storage.setAlarm(remindAt);

    // Send an onboarding message to the participant.
    const slackClient = new Slack(token);
    await slackClient.postMessage({
      channel: participantSlackId,
      blocks: standUpOnBoardingMessage(name, slackChannelId, standUpAt).blocks,
    });

    // Persist the state of the DO
    await this._persist();

    return new Response(null, { status: 200 });
  }

  private async _deleteAlertMessage() {
    if (!this._data || !this._state) {
      throw new Error('Data and state must be initialized');
    }

    this._state.alerted = false;
    await this._persist();

    const { slackTeamId } = this._data;

    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    const slackClient = new Slack(token);

    const messageResponse = await this._storage.get<ISlackMessageResponse>(
      'reminder_message_response',
    );

    if (!messageResponse) {
      throw new Error('Message response not found');
    }

    const response = await slackClient.deleteMessage({
      channel: messageResponse.channel,
      ts: messageResponse.message.ts,
    });

    if (!response.ok) {
      console.error('Error deleting stand up update alert message', response);
    }

    return new Response(null, { status: 200 });
  }

  private async _reschedule(duration?: DurationLike) {
    if (!this._data) {
      throw new Error('Data must be initialized');
    }

    const { hour, minute } = DateTime.fromMillis(this._data.remindAt).setZone(
      this._data.timezone,
    );

    const remindAt = DateTime.now()
      .setZone(this._data.timezone)
      .set({ hour, minute })
      .plus(duration || { days: 1 });

    await this._storage.setAlarm(remindAt.toMillis());
  }

  // Check if the alarm went off today was a valid day for the stand-up.
  private _isValidDayOfStandUp(frequency: Frequency, weekday: number) {
    switch (frequency) {
      case Frequency.MONDAY_TO_FRIDAY:
        return weekday >= 1 && weekday <= 5;
      case Frequency.MONDAY_TO_SATURDAY:
        return weekday >= 1 && weekday <= 6;
      case Frequency.EVERYDAY:
        return true;
    }
  }

  // Delete the DO and all its data.
  protected async _delete() {
    await this._storage.deleteAlarm();
    await this._storage.deleteAll();

    return new Response(null, { status: 200 });
  }

  // Persist the state of the DO.
  protected _persist() {
    this._storage.put('data', this._data);
    this._storage.put('state', this._state);
  }
}
