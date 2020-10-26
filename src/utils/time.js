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


function toHourAndMinute(time) {
  return {
    hour: time.substring(0,1),
    minute: time.substring(2,3),
  };
}

function happensTomorrow(now, next) {
  const hourIsEarlier = now.hour > next.hour;
  const minuteIsEarlier = now.hour === next.hour && now.minute > next.minute;

  return hourIsEarlier || minuteIsEarlier;
}

/**
 * Convert nextTime in HHMM format to the next isodate from now.
 *
 * @param  {[type]} nextTime [HHMM time to calulate next isodate]
 * @return {[type]}          [isodate]
 */
export function getISODateFrom(nextTime) {
   const  next = toHourAndMinute(nextTime);
   let now = DateTime.local();

   const minuteDelta = Math.abs(now.minute - next.minute);
   const hourDelta = Math.abs(now.hour - next.hour);

   if (happensTomorrow(now, next)) {
     now = now.plus({ day: 1 }).minus({ minutes: minuteDelta }).minus({ hours: hourDelta});
   } else {
     now = now.plus({ minutes: minuteDelta }).plus({ hours: hourDelta});
   }

   return now.toIso();
}
