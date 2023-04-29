import { Frequency } from '@prisma/client';

/************ All the slack view states ************/

export type SlackCreateStandUpModalState = {
  values: {
    name_block: {
      name: {
        type: 'plain_text_input';
        value: string;
      };
    };
    participants_block: {
      participants: {
        type: 'multi_users_select';
        selected_users: string[];
      };
    };
    channel_block: {
      channel: {
        type: 'channels_select';
        selected_channel: string;
      };
    };
    frequency_block: {
      frequency: {
        type: 'static_select';
        selected_option: {
          value: Frequency;
        };
      };
    };
    stand_up_at_block: {
      stand_up_at: {
        type: 'timepicker';
        selected_time: string;
      };
      timezone: {
        type: 'static_select';
        selected_option: {
          value: string;
        };
      };
    };
    timezone_block: {
      timezone: {
        type: 'static_select';
        selected_option: {
          value: string;
        };
      };
    };
    questions_block: {
      questions: {
        type: 'plain_text_input';
        value: string;
      };
    };
  };
};
