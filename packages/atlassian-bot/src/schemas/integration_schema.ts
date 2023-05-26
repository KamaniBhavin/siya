import { z } from 'zod';

export const IntegrationSchema = z.object({
  response_url: z.string(),
  project_id: z.string(),
  key: z.string().includes('@'),
  email: z.string().email(),
  api_key: z.string(),
});
