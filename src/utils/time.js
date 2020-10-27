import { DateTime } from 'luxon';

function addLeadingZero(number) {
  const strNumber = `${number}`;
  return strNumber.length === 1 ? `0${strNumber}` : strNumber;
}

export function generateTimeKeys({ hours = 24, minutes = 60 } = {}) {
  const keys = [];

  for(let hour = 0; hour < hours; hour++) {
    for (let minute = 0; minute < minutes; minute++) {
      keys.push(addLeadingZero(hour) + addLeadingZero(minute));
    }
  }

  return keys;
}

export const TIME_KEYS = generateTimeKeys();

const toHourAndMinute = (time) => ({
  hour: time.substring(0,2),
  minute: time.substring(2,4),
});

function happensTomorrow(now, next) {
  console.log({ now, next });
  const hourIsEarlier = now.hour > next.hour;
  const minuteIsEarlier = now.hour === next.hour && now.minute >= next.minute;

  return hourIsEarlier || minuteIsEarlier;
}

/**
 * Convert nextTimeOfDay in HHMM format to the next isodate from now.
 *
 * @param  {[type]} nextTimeOfDay [HHMM time to calulate next isodate]
 * @return {[type]}          [isodate]
 */
export function getISODateFrom({ currentTimeOfDay, nextTimeOfDay }) {
  const now = toHourAndMinute(currentTimeOfDay);
  const next = toHourAndMinute(nextTimeOfDay);

  const minuteDelta = Math.abs(now.minute - next.minute);
  const hourDelta = Math.abs(now.hour - next.hour);

  console.log({ minuteDelta, hourDelta });

  let today = DateTime.local().set({ hours: now.hour }).set({ minutes: now.minute });

  console.log(today.toISO());

  if (happensTomorrow(now, next)) {
    console.log('tomorrow');
   today = today.plus({ day: 1 }).minus({ minutes: minuteDelta }).minus({ hours: hourDelta});
  } else {
    console.log('today');
   today = today.plus({ minutes: minuteDelta }).plus({ hours: hourDelta});
  }

  // zero out seconds and milliseconds to return minute percision
  return today.set({ seconds: 0, milliseconds: 0 }).toISO();
}
