import { Context } from 'hono';
import { Bindings } from '../bindings';
import { IntegrationSchema } from '../schemas/integration_schema';
import { db } from '../../../prisma-data-proxy';
import { Atlassian } from '../client/atlassian';

export async function integration(context: Context<{ Bindings: Bindings }>) {
  const {
    key,
    email,
    api_key: apiKey,
    response_url: responseUrl,
    project_id: projectId,
  } = IntegrationSchema.parse(await context.req.json());

  // Check if the credentials are valid
  const atlassianClient = new Atlassian(projectId, btoa(`${email}:${apiKey}`));
  try {
    await atlassianClient.myself();
  } catch (e) {
    const request = new Request(responseUrl, {
      method: 'POST',
      body: JSON.stringify({
        text: 'Could not integrate with Jira. Please check your credentials!',
      }),
    });

    await fetch(request);

    return context.json(null, 200);
  }

  // key is in the format of slackUserId@standUpId
  const [slackUserId, standUpId] = key.split('@');

  await db(context.env.DATABASE_URL).atlassianApiToken.create({
    data: {
      slackUserId: slackUserId,
      slackStandUpId: standUpId,
      projectId: projectId,
      email: email,
      token: btoa(`${email}:${apiKey}`),
    },
  });

  // Send a success message to the user
  // This will replace the original message with the integration message
  // to prevent the user from clicking the button again
  const request = new Request(responseUrl, {
    method: 'POST',
    body: JSON.stringify({
      replace_original: true,
      text: 'Successfully integrated with Jira',
    }),
  });

  await fetch(request);

  return context.json(null, 200);
}
