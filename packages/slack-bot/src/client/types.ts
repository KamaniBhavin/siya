import { HomeView, KnownBlock, ModalView } from '@slack/types';

/************ Slack API types ************/

export type SlackBlocks = {
  blocks: KnownBlock[];
};

export type SlackChannel = {
  id: string;
  created: number;
  is_archived: boolean;
  is_im: boolean;
  is_org_shared: boolean;
  context_team_id: string;
  updated: number;
  user: string;
  is_user_deleted: boolean;
  priority: number;
};

export type SlackEnterprise = {
  id: string;
  name: string;
};

export type SlackTeam = {
  id: string;
  domain: string;
  name: string;
};

export type SlackUser = {
  id: string;
  team_id: string;
  name: string;
  username: string;
};

export type SlackMessage = {
  channel: string;
  text?: string;
  blocks?: KnownBlock[];
};

export type SlackDeleteMessage = {
  channel: string;
  ts: string;
};

export type SlackHomeView = {
  user_id: string;
  view: HomeView;
};

export type SlackModal = {
  trigger_id: string;
  view: ModalView;
};

export type SlackEphemeralMessage = {
  channel: string; // can be user id for DM in BOT context
  user: string;
  text?: string;
  blocks?: KnownBlock[];
};

/********* Slack Events *********/
export interface ISlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  type: 'event_callback' | 'url_verification' | 'app_rate_limited';
  event_id: string;
  event_time: number;
  authorizations: {
    enterprise_id: string;
    team_id: string;
    user_id: string;
    is_bot: boolean;
    is_enterprise_install: boolean;
  }[];
  authed_users: string[];
  event?: {
    type: 'app_mention' | 'app_home_opened' | 'message' | 'app_uninstalled';
  };
}

export interface ISlackAppUnInstalledEvent extends ISlackEvent {
  event: {
    type: 'app_uninstalled';
  };
}

export interface ISlackAppMentionEvent extends ISlackEvent {
  event: {
    type: 'app_mention';
    user: string;
    text: string;
    ts: string;
    channel: string;
    event_ts: string;
  };
}

export interface ISlackAppHomeOpenedEvent extends ISlackEvent {
  event: {
    type: 'app_home_opened';
    user: string;
    channel: string;
    event_ts: string;
    tab: 'home' | 'messages' | 'search' | 'notifications' | 'settings';
    view: { id: string } & HomeView;
  };
}

export interface ISlackHomeMessageEvent extends ISlackEvent {
  event: {
    client_msg_id?: string;
    type: 'message';
    user: string;
    channel: string;
    text: string;
    blocks: KnownBlock[];
    ts: string;
    event_ts: string;
    channel_type: 'im' | 'mpim' | 'group' | 'channel';
  };
}

export interface ISlackUrlVerificationEvent extends ISlackEvent {
  challenge: string;
}

/********* Slack Interactions *********/
export interface ISlackInteraction {
  type:
    | 'block_actions'
    | 'shortcut'
    | 'view_submission'
    | 'view_closed'
    | 'interactive_message';
  team: SlackTeam;
  user: SlackUser;
  api_app_id: string;
  token: string;
  trigger_id: string;
  response_url: string;
}

/********* Slack Views Submission *********/
export interface ISlackViewSubmission<State> extends ISlackInteraction {
  view: ModalView & {
    id: string;
    team_id: string;
    hash: string;
    app_id: string;
    state: State;
    bot_id: string;
  };
}

/********* Slack Block Actions *********/
export interface ISlackBlockAction extends ISlackInteraction {
  actions: {
    type: 'button';
    action_id:
      | 'create_stand_up'
      | 'help'
      | 'delete_stand_up'
      | 'submit_stand_up'
      | 'skip_stand_up'
      | 'on_leave'
      | 'jira_integration'
      | 'cancel_integration';
    block_id: 'main';
    text: {
      type: 'plain_text' | 'mrkdwn';
      text: string;
      emoji: boolean;
    };
    value: string;
  }[];
}

export interface ISlackMessageBlockAction<State> extends ISlackBlockAction {
  state: State;
}

/********* Slack Responses *********/
export interface ISlackResponse {
  ok: boolean;
  error?: string;
  response_metadata?: {
    next_cursor?: string;
  };
}

export interface ISlackOAuthResponse extends ISlackResponse {
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: SlackTeam;
  enterprise?: SlackEnterprise;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
}

export interface ISlackMessageResponse extends ISlackResponse {
  channel: string;
  ts: string;
  message: {
    type: string;
    subtype: string;
    text: string;
    ts: string;
  };
}
