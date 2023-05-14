import { z } from 'zod';

export const CreateSchema = z.object({
  trigger_id: z.string(),
  user_id: z.string(),
  team_id: z.string(),
});
