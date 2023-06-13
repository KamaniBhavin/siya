import { Context } from 'hono';
import { Bindings } from '../bindings';
import { SlashCommandSchema } from '../schemas/create';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { jiraIntegrationMessage } from '../ui/jira_integration_message';
import { db } from '../../../prisma-data-proxy';

export async function enableJiraIntegration(
  context: Context<{ Bindings: Bindings }>,
) {
  const form = await context.req.formData();
  const command = SlashCommandSchema.parse(Object.fromEntries(form.entries()));

  // This is non-blocking and will not block the response.
  context.executionCtx.waitUntil(
    sendJiraIntegrationMessage(command, context.env),
  );

  return context.newResponse(null, 200);
}

async function sendJiraIntegrationMessage(
  slashCommand: z.infer<typeof SlashCommandSchema>,
  env: Bindings,
) {
  const {
    user_id: slackUserId,
    team_id: slackTeamId,
    channel_id: channelId,
    text: standUpId,
  } = slashCommand;
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));
  const slackClient = new Slack(token);

  if (!standUpId) {
    return slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: 'Please provide a stand-up id for the Jira integration',
    });
  }

  const standUpExists = await db(env.DATABASE_URL).slackStandUp.count({
    where: {
      id: standUpId,
    },
  });

  if (!standUpExists) {
    return slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: `Stand up does not exist use \`/siya-list-stand-ups\` to see all stand ups`,
    });
  }

  await slackClient.postEphemeral({
    channel: channelId,
    user: slackUserId,
    blocks: jiraIntegrationMessage(standUpId, slackUserId).blocks,
  });
}

export async function disableJiraIntegration(
  context: Context<{ Bindings: Bindings }>,
) {
  const form = await context.req.formData();
  const command = SlashCommandSchema.parse(Object.fromEntries(form.entries()));

  // Execute this in the background
  // This is non-blocking and will not block the response.
  context.executionCtx.waitUntil(disableIntegration(command, context.env));

  return context.newResponse(null, 200);
}

async function disableIntegration(
  slashCommand: z.infer<typeof SlashCommandSchema>,
  env: Bindings,
) {
  const {
    user_id: slackUserId,
    team_id: slackTeamId,
    channel_id: channelId,
    text: standUpId,
  } = slashCommand;
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));
  const slackClient = new Slack(token);

  if (!standUpId) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: 'Please provide a stand-up id for the Jira integration',
    });

    return;
  }

  const standUp = await db(env.DATABASE_URL).slackStandUp.findUnique({
    where: {
      id: standUpId,
    },
  });

  if (!standUp) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: `Stand up does not exist use \`/siya-list-stand-ups\` to see all stand ups`,
    });

    return;
  }

  const integrationExists = await db(env.DATABASE_URL).atlassianApiToken.count({
    where: {
      slackUserId: slackUserId,
      slackStandUpId: standUpId,
    },
  });

  if (!integrationExists) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: `Jira integration for stand up ${standUp.name} is not enabled use \`/siya-enable-jira-integration [id]\` to enable it`,
    });

    return;
  }

  await db(env.DATABASE_URL).atlassianApiToken.delete({
    where: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      slackUserId_slackStandUpId: {
        slackUserId: slackUserId,
        slackStandUpId: standUpId,
      },
    },
  });

  return slackClient.postEphemeral({
    channel: channelId,
    user: slackUserId,
    text: `Jira integration for stand up ${standUp.name} disabled!`,
  });
}
