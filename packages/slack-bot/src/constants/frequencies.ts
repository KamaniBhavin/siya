import { PlainTextOption } from '@slack/types';
import { Frequency } from '@prisma/client';

export const FREQUENCIES: PlainTextOption[] = [
  {
    text: {
      type: 'plain_text',
      text: 'Monday - Friday',
      emoji: true,
    },
    value: Frequency.MONDAY_TO_FRIDAY,
  },
  {
    text: {
      type: 'plain_text',
      text: 'Monday - Saturday',
      emoji: true,
    },
    value: Frequency.MONDAY_TO_SATURDAY,
  },
  {
    text: {
      type: 'plain_text',
      text: 'Everyday',
      emoji: true,
    },
    value: Frequency.EVERYDAY,
  },
];
