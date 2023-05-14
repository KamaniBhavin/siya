import { z } from 'zod';

export const AuthorizationSchema = z.object({
  code: z.string(),
});
