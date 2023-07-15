import { Frequency } from '@prisma/client';
import { DateTime } from 'luxon';

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

export function isValidDayOfStandUp(frequency: Frequency, timezone: string) {
  const weekday = DateTime.now().setZone(timezone).weekday;

  switch (frequency) {
    case Frequency.MONDAY_TO_FRIDAY:
      return weekday >= 1 && weekday <= 5;
    case Frequency.MONDAY_TO_SATURDAY:
      return weekday >= 1 && weekday <= 6;
    case Frequency.EVERYDAY:
      return true;
  }
}
