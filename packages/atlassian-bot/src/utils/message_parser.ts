import { z } from 'zod';

const MessageSchema = z.object({
  issueId: z.string(),
  started: z.string(),
  week: z.string().nullish(),
  day: z.string().nullish(),
  hour: z.string().nullish(),
  minute: z.string().nullish(),
  description: z.string(),
});

export function parseWorkLog(log: string) {
  const regex =
    /\[\[(?<issueId>\w+-\d+)\s*\|\s*(?<started>\d{1,2}:\d{2}\s*(AM|PM))\s*\|\s*((?<week>\d{1,2})w)?\s*((?<day>\d{1,2})d)?\s*((?<hour>\d{1,2})h)?\s*((?<minute>\d{1,2})m)?\s*\|?\s*(?<description>.*)\s*]]/;

  if (!regex.test(log)) {
    return null;
  }

  const match = log.match(regex);

  if (!match || !match.groups) {
    return null;
  }

  const parse = MessageSchema.safeParse(match.groups);

  if (!parse.success) {
    return null;
  }

  const { issueId, started, week, day, hour, minute, description } = parse.data;
  const w = week ? parseInt(week) : 0;
  const d = day ? parseInt(day) : 0;
  const h = hour ? parseInt(hour) : 0;
  const m = minute ? parseInt(minute) : 0;

  return {
    issueId: issueId,
    started: started,
    timeSpent: `${w}w ${d}d ${h}h ${m}m`,
    comment: description,
  };
}
