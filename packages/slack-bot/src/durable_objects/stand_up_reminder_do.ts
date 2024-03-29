import { Frequency } from '@prisma/client';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { standUpOnBoardingMessage } from '../ui/stand_up_on_boarding_message';
import { DateTime, DurationLike } from 'luxon';
import { slackStandUpReminderMessage } from '../ui/stand_up_reminder_message';
import { ISlackMessageResponse } from '../client/types';
import { db } from '../../../prisma-data-proxy';
import { Toucan } from 'toucan-js';
import { isValidDayOfStandUp } from '../utils';

/************************* Types *************************/
export type ISlackStandUpReminderDORequest =
  | ISlackStandUpReminderDOData
  | { type: 'delete_alert_message' };

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

    const { standUpId, participantSlackId, frequency, slackTeamId, timezone } =
      this._data;

    const standUpExists = await db(this._env.DATABASE_URL).slackStandUp.count({
      where: {
        id: standUpId,
      },
    });

    // If the stand-up does not exist, delete the reminder
    // This can happen if the stand-up is deleted by the admin, but the reminder
    // is still active and is stale
    if (!standUpExists) {
      new Toucan({ dsn: this._env.SENTRY_DSN }).captureException(
        new Error(`Stand does not exist: ${standUpId}, deleting reminder`),
      );
      await this._delete();
      return;
    }

    // Check if the participant is active in any other stand up conversation
    const isInActiveConversation = await db(
      this._env.DATABASE_URL,
    ).slackActiveStandUpConversation.count({
      where: {
        slackUserId: participantSlackId,
      },
    });

    // If the participant is active in any other stand up conversation, reschedule the reminder
    // to 5 minutes later
    if (isInActiveConversation) {
      await this._reschedule({ minutes: 5 });
      return;
    }

    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));
    const slackClient = new Slack(token);

    if (this._state.alerted) {
      await this._deleteAlertMessage();
      await slackClient.postMessage({
        channel: this._data.participantSlackId,
        text: 'Looks like you missed your stand up update :disappointed:. I will remind you again on the next stand up.',
      });

      return;
    }

    if (!isValidDayOfStandUp(frequency, timezone)) {
      await this._reschedule();
      return;
    }

    const response = await slackClient.postMessage({
      channel: this._data.participantSlackId,
      blocks: slackStandUpReminderMessage(
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
  fetch(request: Request) {
    switch (request.method) {
      case 'DELETE':
        return this._delete();
      default:
        return this._handle(request);
    }
  }

  private async _handle(request: Request) {
    const body: ISlackStandUpReminderDORequest = await request.json();

    switch (body.type) {
      case 'initialize':
        await this._initialize(body);
        break;
      case 'delete_alert_message':
        await this._deleteAlertMessage();
        break;
      default:
        throw new Error('Invalid request type');
    }

    return new Response(null, { status: 200 });
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
    // Persist the state of the DO
    await this._persist();

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

    const slackClient = new Slack(token);

    // Send an onboarding message to the participant.
    await slackClient.postMessage({
      channel: participantSlackId,
      blocks: standUpOnBoardingMessage(name, slackChannelId, standUpAt).blocks,
    });
  }

  private async _deleteAlertMessage() {
    if (!this._data || !this._state) {
      throw new Error('Data and state must be initialized');
    }

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

    this._state.alerted = false;
    await this._persist();

    // Reschedule the reminder to the next stand up
    await this._reschedule();

    const response = await slackClient.deleteMessage({
      channel: messageResponse.channel,
      ts: messageResponse.message.ts,
    });

    if (!response.ok) {
      console.error('Error deleting stand up update alert message', response);
    }
  }

  private async _reschedule(duration?: DurationLike) {
    if (!this._data) {
      throw new Error('Data must be initialized');
    }

    if (duration) {
      await this._storage.setAlarm(DateTime.now().plus(duration).toMillis());
      return;
    }

    const { hour, minute, second } = DateTime.fromMillis(
      this._data.remindAt,
    ).setZone(this._data.timezone);

    const remindAt = DateTime.now()
      .setZone(this._data.timezone)
      .set({ hour, minute, second })
      .plus({ days: 1 });

    await this._storage.setAlarm(remindAt.toMillis());
  }

  // Delete the DO and all its data.
  protected async _delete() {
    await this._storage.deleteAlarm();
    await this._storage.deleteAll();

    return new Response(null, { status: 200 });
  }

  // Persist the state of the DO.
  protected async _persist() {
    await this._storage.put('data', this._data);
    await this._storage.put('state', this._state);
  }
}
