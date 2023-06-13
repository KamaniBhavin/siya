import { Frequency } from '@prisma/client';

export function frequencyText(frequency: Frequency): string {
  switch (frequency) {
    case Frequency.MONDAY_TO_FRIDAY:
      return 'Monday to Friday';
    case Frequency.MONDAY_TO_SATURDAY:
      return 'Monday to Saturday';
    case Frequency.EVERYDAY:
      return 'Everyday';
  }
}
