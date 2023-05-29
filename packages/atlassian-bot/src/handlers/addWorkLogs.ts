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

  const parsedWorkLogs = workLogs
    .map((log) => parseWorkLog(log))
    .filter((x): x is { issueId: string } & AtlassianWorkLog => !!x);

  if (!parsedWorkLogs) {
    return context.json({
      message:
        'None of the logs matches the format `[[ISSUE_ID | START | TIME_SPENT | DESCRIPTION]]`',
    });
  }

  const atlassianClient = new Atlassian(projectId, apiToken);
  await Promise.all(
    parsedWorkLogs.map(async (logs) => {
      const { issueId, timeSpent, started, comment } = logs;
      const workLog: AtlassianWorkLog = {
        timeSpent: timeSpent,
        started: DateTime.fromFormat(started, 't', { zone: timezone }).toFormat(
          "yyyy-MM-dd'T'HH:mm:ss.SSSZZZ",
        ),
        comment: comment,
      };

      await atlassianClient.createWorkLog({ issueId }, workLog);
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
