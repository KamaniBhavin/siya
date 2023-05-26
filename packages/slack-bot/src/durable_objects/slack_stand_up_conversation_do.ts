import { SlackStandUp, SlackStandUpQuestion } from '@prisma/client/edge';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import {
  ISlackStandUpParticipantResponse,
  IStandUpResponse,
} from './stand_up_brief_do';
import { db } from '../../../prisma-data-proxy';

/************************* Types *************************/
export type SlackStandUpConversationDORequest =
  | ISlackStandUpConversationInitDORequest
  | { type: 'start_conversation' }
  | ISlackStandUpConversationResponse;

export interface ISlackStandUpConversationInitDORequest {
  type: 'initialize';
  standUp: SlackStandUp & { questions: SlackStandUpQuestion[] };
  participantSlackId: string;
}

export interface ISlackStandUpConversationResponse {
  type: 'response';
  participantSlackId: string;
  text: string;
}

export interface ISlackStandUpConversationDOData {
  timezone: string;
  standUpId: string;
  slackTeamId: string;
  participantSlackId: string;
  questions: SlackStandUpQuestion[];
}

export interface ISlackStandUpConversationDOState {
  currentQuestionIndex: number;
  isInConversation: boolean;
  responses: IStandUpResponse[];
}

/************************* Durables Object *************************/

export class SlackStandUpConversationDO {
  _id: DurableObjectId;
  _storage: DurableObjectStorage;
  _env: Bindings;
  _data: ISlackStandUpConversationDOData | undefined;
  _state: ISlackStandUpConversationDOState | undefined;

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

  // Main entry point for the Durable Object.
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

  // Handle the request.
  private async _handle(request: Request) {
    const body: SlackStandUpConversationDORequest = await request.json();

    switch (body.type) {
      case 'initialize':
        return await this._initialize(body);
      case 'start_conversation':
        return await this._startConversation();
      case 'response':
        return await this._conversationResponse(body);
      default:
        return new Response(null, { status: 500 });
    }
  }

  // Initialize the DO with the data required to start the conversation.
  private async _initialize(body: ISlackStandUpConversationInitDORequest) {
    // immutable data of the DO
    this._data = <ISlackStandUpConversationDOData>{
      timezone: body.standUp.timezone,
      standUpId: body.standUp.id,
      slackTeamId: body.standUp.slackTeamId,
      participantSlackId: body.participantSlackId,
      questions: body.standUp.questions,
    };

    // mutable state of the DO
    this._state = <ISlackStandUpConversationDOState>{
      currentQuestionIndex: 0,
      isInConversation: false,
      responses: [],
    };

    // persist the data and state
    await this._persist();

    return new Response(null, { status: 200 });
  }

  // Start a conversation with the user to submit their stand-up update.
  private async _startConversation() {
    if (!this._data || !this._state) {
      throw new Error(
        `Cannot start conversation. DO not initialized: ${this._id.toString()}`,
      );
    }

    const { slackTeamId, participantSlackId, questions } = this._data;
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    // Add the participant to the list of active conversations.
    // This helps us to locate this DO when the participant sends a message in bot DM.
    // Also, this helps us know if the participant is already in a conversation.
    await db(this._env.DATABASE_URL).slackActiveStandUpConversation.create({
      data: {
        slackUserId: participantSlackId,
        conversationDOId: this._id.toString(),
        slackStandUpId: this._data.standUpId,
      },
    });

    const slackClient = new Slack(token);
    await slackClient.postMessage({
      channel: participantSlackId,
      text: questions[0].question,
    });

    this._state.isInConversation = true;
    await this._persist();

    return new Response(null, { status: 200 });
  }

  // Handle the response from the user.
  private async _conversationResponse(body: ISlackStandUpConversationResponse) {
    if (!this._data || !this._state) {
      throw new Error(
        'Cannot handle conversation response. DO not initialized',
      );
    }

    // ignore the response if the DO is not in a conversation
    if (!this._state.isInConversation) {
      return new Response(null, { status: 200 });
    }

    const { slackTeamId, participantSlackId, questions } = this._data;
    const { currentQuestionIndex } = this._state;

    // Add the response to the list of responses for the stand-up.
    // Responses are basically the stand-up update.
    this._state.responses.push({
      question: questions[currentQuestionIndex].question,
      questionId: questions[currentQuestionIndex].id,
      response: body.text,
    });

    // If there are no more questions, end the conversation.
    if (currentQuestionIndex === questions.length - 1) {
      return this._endConversation();
    }

    // Otherwise, ask the next question.
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    const slackClient = new Slack(token);
    await slackClient.postMessage({
      channel: participantSlackId,
      text: questions[currentQuestionIndex + 1].question,
    });

    // Update the state of the DO.
    this._state.currentQuestionIndex = currentQuestionIndex + 1;
    await this._persist();

    return new Response(null, { status: 200 });
  }

  private async _endConversation() {
    if (!this._data || !this._state) {
      throw new Error('Cannot end conversation. DO not initialized');
    }

    const { SIYA_SLACK_BOT_API_URL } = this._env;
    const { standUpId, slackTeamId, participantSlackId } = this._data;
    const { responses } = this._state;

    // Send the response to stand-up brief DO.
    const doId = this._env.SLACK_STAND_UP_BRIEF_DO.idFromName(standUpId);
    const stub = this._env.SLACK_STAND_UP_BRIEF_DO.get(doId);

    const request = new Request(SIYA_SLACK_BOT_API_URL, {
      method: 'POST',
      body: JSON.stringify(<ISlackStandUpParticipantResponse>{
        type: 'response',
        participantSlackId: participantSlackId,
        data: ['submit_stand_up', responses],
      }),
    });

    await stub.fetch(request);

    // Update the state of the DO.
    this._state = {
      currentQuestionIndex: 0,
      isInConversation: false,
      responses: [],
    };
    await this._persist();

    // Remove the participant from the list of active conversations.
    await db(this._env.DATABASE_URL).slackActiveStandUpConversation.delete({
      where: {
        slackUserId: participantSlackId,
      },
    });

    // Send a message to the user that their response has been recorded.
    const token = z
      .string()
      .parse(await this._env.SLACK_BOT_TOKENS.get(slackTeamId));

    const slackClient = new Slack(token);
    await slackClient.postMessage({
      channel: participantSlackId,
      text: 'Your response has been recorded :tada:',
    });

    // Check if the participant has Jira integration enabled.
    const atlassianApiData = await db(
      this._env.DATABASE_URL,
    ).atlassianApiToken.findFirst({
      where: {
        slackUserId: participantSlackId,
        slackStandUpId: standUpId,
      },
    });

    // If the participant does not have Jira integration enabled, return.
    if (!atlassianApiData) {
      return new Response(null, { status: 200 });
    }

    // Send responses to Atlassian bot.
    // Atlassian bot will parse the responses and create a work log.
    // It will push the work log to Jira.
    const url = `${this._env.SIYA_ATLASSIAN_BOT_API_URL}/jira/add-work-logs`;
    const workLogRequest = new Request(url, {
      method: 'POST',
      body: JSON.stringify({
        projectId: atlassianApiData.projectId,
        apiToken: atlassianApiData.token,
        timezone: this._data.timezone,
        logs: responses.map((response) => response.response),
      }),
    });

    // Atlassian bot will send a message with the status of the work log.
    // This is to ensure that the participant is aware of the status of their work log.
    const workLogResponse = await fetch(workLogRequest);
    const { message } = await workLogResponse.json<{ message: string }>();

    // Forward the message to the participant's Bot DM.
    await slackClient.postMessage({
      channel: participantSlackId,
      text: message,
    });

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
}
