import { z } from 'zod';

// All Slack interactions are sent as form data with a payload field
// containing a JSON string. This schema merely validates that the payload
// field is present and is a string.
export const InteractionsSchema = z.object({
  payload: z.string(),
});
