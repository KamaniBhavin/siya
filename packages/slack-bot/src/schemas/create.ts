import { z } from 'zod';

export const SlashCommandSchema = z.object({
  trigger_id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  response_url: z.string(),
  text: z.string().optional(),
});
