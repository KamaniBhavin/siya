import { SlackStandUp, SlackStandUpParticipant } from '@prisma/client/edge';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { DateTime, DurationLike } from 'luxon';
import { Bindings } from '../bindings';
import { standUpParticipantResponseMessage } from '../ui/stand_up_participant_response_message';
import { standUpBriefMessage } from '../ui/stand_up_brief_message';
import { db } from '../../../prisma-data-proxy';
import { Toucan } from 'toucan-js';

/*********************** Types ***********************/
export type SlackStandUpBriefDORequest =
  | ISlackStandUpBriefDOInitRequest
  | ISlackStandUpParticipantResponse;

export interface ISlackStandUpBriefDOInitRequest {
  type: 'initialize';
  standUp: SlackStandUp & { participants: SlackStandUpParticipant[] };
}

export interface ISlackStandUpParticipantResponse {
  type: 'response';
  participantSlackId: string;
  data:
    | ['submit_stand_up', IStandUpResponse[]]
    | ['skip_stand_up']
    | ['on_leave'];
}

export const StandUpResponseSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  response: z.string(),
});

export type IStandUpResponse = z.infer<typeof StandUpResponseSchema>;

export interface ISlackStandUpBriefDOData {
  standUpId: string;
  slackChannelId: string;
  slackTeamId: string;
  standUpAt: number;
  timezone: string;
  participantsSlackIds: string[];
}

export interface ISlackStandUpBriefDOState {
  responses: ISlackStandUpParticipantResponse[];
  briefed: boolean; // true if the stand-up has been briefed to the channel
}

/*********************** Durables Object ***********************
 * Durable object for accumulating stand-up responses of participants and
 * sending a summary to the channel. This DO is created when a stand-up is
 * created and is deleted when the stand-up is deleted.
 *
 * @warning Please persist the state of this Durable Object in the storage
 * This ensures that the state is not lost when the Durable Object is
 * evicted from memory.
 *
 * @param state - Durable object state
 * @param env - Environment variables
 */
export class SlackStandUpBriefDO {
  _id: DurableObjectId;
  _storage: DurableObjectStorage;
  _env: Bindings;
  _data: ISlackStandUpBriefDOData | undefined;
  _state: ISlackStandUpBriefDOState | undefined;

  constructor(state: DurableObjectState, env: Bindings) {
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
   * Send a summary of responses to the stand-up channel and
   * schedule the next stand-up for the next day
   */
  async alarm() {
    if (!this._data || !this._state) {
      throw new Error('Data or state not found');
    }

    const standUpExists = await db(this._env.DATABASE_URL).slackStandUp.count({
      where: {
        id: this._data.standUpId,
      },
    });

    if (!standUpExists) {
      new Toucan({ dsn: this._env.SENTRY_DSN }).captureException(
        new Error(
          `Stand does not exist: ${this._data.standUpId}, deleting brief DO`,
        ),
      );
      await this._delete();
      return;
    }

    // If the stand-up has been briefed, then schedule the next stand-up brief
    if (this._state.briefed) {
      this._state.briefed = false;
      await this._persist();
      await this._reschedule();

      return new Response(null, { status: 200 });
    }

    const { slackTeamId, slackChannelId } = this._data;
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    const slackClient = new Slack(token);
    await slackClient.postMessage({
      channel: slackChannelId,
      blocks: standUpBriefMessage(
        this._data.participantsSlackIds,
        this._state.responses,
      ).blocks,
    });

    // clear the responses and persist the state
    this._state.responses = [];
    this._state.briefed = true;
    await this._persist();
    // Rescheduled for 8 hours later to give participants time to respond
    // to the stand-up brief even if they are late
    await this._reschedule({ hours: 8 });

    return new Response(null, { status: 200 });
  }

  // This is the entry point for the Durable Object
  // It handles all the requests to the Durable Object
  async fetch(request: Request) {
    switch (request.method) {
      case 'DELETE':
        await this._delete();
        break;
      default:
        await this._handle(request);
    }

    return new Response(null, { status: 200 });
  }

  private async _handle(request: Request) {
    const body: SlackStandUpBriefDORequest = await request.json();

    switch (body.type) {
      case 'initialize':
        await this._initialize(body);
        break;
      case 'response':
        await this._recordResponse(body);
        break;
      default:
        throw new Error('Invalid request');
    }

    return new Response(null, { status: 200 });
  }

  private async _initialize(data: ISlackStandUpBriefDOInitRequest) {
    const {
      id: standUpId,
      time,
      timezone,
      slackTeamId,
      slackChannelId,
      participants,
    } = data.standUp;

    const standUpTime = new Date(time);
    let standUpAt = DateTime.now()
      .setZone(timezone)
      .set({ hour: standUpTime.getHours(), minute: standUpTime.getMinutes() });

    // If the stand-up time has already passed, then schedule it for the next day
    if (standUpAt.diffNow().milliseconds < 0) {
      standUpAt = standUpAt.plus({ days: 1 });
    }

    await this._storage.setAlarm(standUpAt.toMillis());

    const participantsSlackIds = this._data?.participantsSlackIds ?? [];
    participants.forEach((participant) => {
      participantsSlackIds.push(participant.slackUserId);
    });

    this._data = <ISlackStandUpBriefDOData>{
      standUpId,
      slackChannelId,
      slackTeamId,
      standUpAt: standUpAt.toMillis(),
      timezone,
      participantsSlackIds: Array.from(new Set(participantsSlackIds)),
    };

    this._state = <ISlackStandUpBriefDOState>{
      responses: [],
      briefed: false,
    };

    // Persist the state of the DO
    await this._persist();
  }

  /**
   * Accumulate responses from participants to send
   * a summary at the end of the stand-up
   * @param response - The response from a participant
   * @private
   */
  private async _recordResponse(response: ISlackStandUpParticipantResponse) {
    if (!this._data || !this._state) {
      throw new Error('Data or state not initialized');
    }

    // Flush the response of the participant to the database
    // This is maintained to keep track of the responses of the participant
    // Also, this is used to send a monthly summary of the participant's responses
    await db(this._env.DATABASE_URL).slackStandUpResponse.create({
      include: {
        slackStandUp: true,
      },
      data: {
        date: DateTime.now().toJSDate(),
        slackUserId: response.participantSlackId,
        slackStandUpId: this._data.standUpId,
        skipped: response.data[0] === 'skip_stand_up',
        onLeave: response.data[0] === 'on_leave',
        updates: {
          createMany: {
            data:
              response.data[0] === 'submit_stand_up'
                ? response.data[1].map((u) => ({
                    question: u.question,
                    update: u.response,
                  }))
                : [],
          },
        },
      },
    });

    const { slackTeamId } = this._data;
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    const slackClient = new Slack(token);

    // If the stand-up has been briefed, then send the response to the channel
    // don't accumulate the response
    if (this._state.briefed) {
      await slackClient.postMessage({
        channel: this._data.slackChannelId,
        blocks: standUpParticipantResponseMessage(response).blocks,
      });

      return new Response(null, { status: 200 });
    }

    this._state.responses.push(response);
    await this._persist();

    return new Response(null, { status: 200 });
  }

  // Delete the DO and all its data.
  private async _delete() {
    await this._storage.deleteAlarm();
    await this._storage.deleteAll();
  }

  // Persist the state of the DO.
  private async _persist() {
    await this._storage.put('data', this._data);
    await this._storage.put('state', this._state);
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
      this._data.standUpAt,
    ).setZone(this._data.timezone);

    const nextStandUpAt = DateTime.now()
      .setZone(this._data.timezone)
      .set({ hour, minute, second })
      .plus({ days: 1 });

    await this._storage.setAlarm(nextStandUpAt.toMillis());
  }
}
