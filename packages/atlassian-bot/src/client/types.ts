import { z } from 'zod';

export const AtlassianWorkLogSchema = z.object({
  comment: z.string(),
  started: z.string(),
  timeSpent: z.string(),
});
export type AtlassianWorkLog = z.infer<typeof AtlassianWorkLogSchema>;
