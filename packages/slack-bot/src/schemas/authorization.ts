import { z } from 'zod';

export const authorizationSchema = z.object({
  code: z.string(),
});
