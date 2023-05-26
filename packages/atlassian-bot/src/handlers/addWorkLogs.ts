import { Context } from 'hono';
import { Bindings } from '../bindings';
import { AddWorkLogSchema } from '../schemas/add_work_log_schema';
import { parseWorkLog } from '../utils/message_parser';
import { Atlassian } from '../client/atlassian';
import { AtlassianWorkLog } from '../client/types';
import { DateTime } from 'luxon';

export async function addWorkLogs(context: Context<{ Bindings: Bindings }>) {
  const json = await context.req.json();
  const { timezone, logs, projectId, apiToken } = AddWorkLogSchema.parse(json);

  const workLogs = logs
    .map((log) =>
      log
        .split(']]')
        .filter((x) => x)
        .map((x) => x + ']]'),
    )
    .flat();

  const parsedWorkLogs = workLogs.map((log) => parseWorkLog(log));

  if (!parsedWorkLogs) {
    return context.json({
      message:
        'None of the logs matches the format `[[ISSUE_ID | START | TIME_SPENT | DESCRIPTION]]`',
    });
  }

  const atlassianClient = new Atlassian(projectId, apiToken);
  await Promise.all(
    parsedWorkLogs.map(async (logs) => {
      if (logs) {
        const { issueId, timeSpentSeconds, startedAt, comment } = logs;
        await atlassianClient.createWorkLog({ issueId }, <AtlassianWorkLog>{
          timeSpentSeconds: timeSpentSeconds,
          started: DateTime.fromFormat(startedAt, 't')
            .setZone(timezone)
            .minus({ days: 1 })
            .toISO(),
          comment: comment,
        });
      }
    }),
  );

  if (parsedWorkLogs.length !== logs.length) {
    return context.json({
      message:
        'Some of the logs were not added. Please update them manually in JIRA`',
    });
  }

  return context.json({
    message: 'Work logs added successfully!',
  });
}
