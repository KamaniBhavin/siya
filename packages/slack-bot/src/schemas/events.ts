import { z } from 'zod';

export const eventWrapperSchema = z.object({
  token: z.string(),
  team_id: z.string(),
  api_app_id: z.string(),
  type: z.union([
    z.literal('event_callback'),
    z.literal('url_verification'),
    z.literal('app_rate_limited'),
  ]),
  event_id: z.string(),
  event_time: z.number(),
  authorizations: z.array(
    z.object({
      enterprise_id: z.string().nullable(),
      team_id: z.string(),
      user_id: z.string(),
      is_bot: z.boolean(),
      is_enterprise_install: z.boolean(),
    }),
  ),
  authed_users: z.array(z.string()).optional(),
  event: z
    .object({
      type: z.string(),
    })
    .optional(),
});

export const urlVerificationEventSchema = z.object({
  token: z.string(),
  challenge: z.string(),
});

export const eventSchema = z.union([
  eventWrapperSchema,
  urlVerificationEventSchema,
]);

export const appUninstalledEventSchema = eventWrapperSchema.extend({
  event: z.object({
    type: z.literal('app_uninstalled'),
  }),
});

export const appMentionEventSchema = eventWrapperSchema.extend({
  event: z.object({
    type: z.literal('app_mention'),
    user: z.string(),
    text: z.string(),
    ts: z.string(),
    channel: z.string(),
    event_ts: z.string(),
  }),
});

export const appHomeOpenedEventSchema = eventWrapperSchema.extend({
  event: z.object({
    type: z.literal('app_home_opened'),
    user: z.string(),
    channel: z.string(),
    event_ts: z.string(),
    tab: z.union([
      z.literal('home'),
      z.literal('messages'),
      z.literal('search'),
      z.literal('notifications'),
      z.literal('settings'),
    ]),
    view: z.unknown(),
  }),
});

export const homeMessageEventSchema = eventWrapperSchema.extend({
  event: z.object({
    type: z.literal('message'),
    client_msg_id: z.string().optional(),
    user: z.string(),
    channel: z.string(),
    text: z.string(),
    blocks: z.array(z.unknown()),
    ts: z.string(),
    event_ts: z.string(),
    channel_type: z.union([
      z.literal('im'),
      z.literal('mpim'),
      z.literal('group'),
      z.literal('channel'),
    ]),
  }),
});
