import { z } from 'zod';

export const AddWorkLogSchema = z.object({
  projectId: z.string(),
  apiToken: z.string(), // Base 64 encoded API token of format email:API_KEY corresponding to Project ID.
  timezone: z.string(),
  logs: z.array(z.string()),
});
