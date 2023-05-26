import { z } from 'zod';

export const AtlassianWorkLogSchema = z.object({
  comment: z.string(),
  started: z.string(),
  timeSpentSeconds: z.number(),
});
export type AtlassianWorkLog = z.infer<typeof AtlassianWorkLogSchema>;
