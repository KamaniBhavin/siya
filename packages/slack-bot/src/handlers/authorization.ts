import { Context } from 'hono';
import { Bindings } from '../bindings';
import { Slack } from '../client/slack';
import { slackAppOnBoardingMessage } from '../ui/app_on_boarding_message';
import { ISlackOAuthResponse } from '../client/types';

/**
 * This handler is responsible for handling the slack authorization
 * callback. It is called when the user installs the app. It stores
 * the bot token in KV (encrypted at rest) and sends a message to
 * the user to onboard them to the app.
 *
 * @note This handler is called by slack and not by the user with a code in the query params.
 * The code is used to get the bot token for the team that installed the app.
 *
 * @param context - The context object of Hono
 *
 * @returns Response - Redirect to slack.com for now
 */
export async function authorization(context: Context<{ Bindings: Bindings }>) {
  const { code } = context.req.query();

  // Get the bot token for the team that installed the app using the code
  const response = await Slack.getInstances().oAuth({
    code,
    client_id: context.env.SLACK_CLIENT_ID,
    client_secret: context.env.SLACK_CLIENT_SECRET,
  });

  //Store the bot token in KV (it will be encrypted at rest)
  await context.env.SLACK_BOT_TOKENS.put(
    response.team.id,
    response.access_token,
    {
      metadata: {
        authed_user_id: response.authed_user.id,
      },
    },
  );

  // This is non-blocking and will be not block the response.
  context.executionCtx.waitUntil(sendAppOnBoardingMessage(response));

  //Redirect to slack.com for now. This is a temporary solution.
  //Redirect to the app's home page when it is ready.
  return context.redirect('https://slack.com');
}

async function sendAppOnBoardingMessage(response: ISlackOAuthResponse) {
  // Create a slack client instance for the team that installed the app
  const slackClient = new Slack(response.access_token);

  // Send a message to the user to onboard them to the app
  await slackClient.postMessage({
    channel: response.authed_user.id,
    blocks: slackAppOnBoardingMessage.blocks,
  });
}

export default authorization;
