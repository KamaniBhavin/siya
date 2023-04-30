import { Frequency } from '@prisma/client';
import { z } from 'zod';

/************ All the slack view states and their schemas ************/

export const SlackCreateStandUpModalStateSchema = z.object({
  values: z.object({
    name_block: z.object({
      name: z.object({
        type: z.literal('plain_text_input'),
        value: z.string(),
      }),
    }),
    participants_block: z.object({
      participants: z.object({
        type: z.literal('multi_users_select'),
        selected_users: z.array(z.string()),
      }),
    }),
    channel_block: z.object({
      channel: z.object({
        type: z.literal('channels_select'),
        selected_channel: z.string(),
      }),
    }),
    frequency_block: z.object({
      frequency: z.object({
        type: z.literal('static_select'),
        selected_option: z.object({
          value: z.enum([
            Frequency.EVERYDAY,
            Frequency.MONDAY_TO_FRIDAY,
            Frequency.MONDAY_TO_SATURDAY,
          ]),
        }),
      }),
    }),
    stand_up_at_block: z.object({
      stand_up_at: z.object({
        type: z.literal('timepicker'),
        selected_time: z.string(),
      }),
      timezone: z.object({
        type: z.literal('static_select'),
        selected_option: z.object({
          value: z.string(),
        }),
      }),
    }),
    questions_block: z.object({
      questions: z.object({
        type: z.literal('plain_text_input'),
        value: z.string(),
      }),
    }),
  }),
});

export type SlackCreateStandUpModalState = z.infer<
  typeof SlackCreateStandUpModalStateSchema
>;
