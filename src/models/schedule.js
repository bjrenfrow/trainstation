import TIME_KEYS from '../utils/time-keys.js';
import db from './db.js';

const TIMES_IN_REVERSE = TIME_KEYS.reverse();
const DATA_KEY = 'state';

async function dbIsEmpty() {
  const keys = await db.keys();
  return keys.length === 0;
}

export async function init() {
  const isEmpty = await dbisEmpty();

  if (!isEmpty) { return; }

  const data = {};

  TIME_KEYS.forEach(time => {
    data[time] = {
      nextMultiTrain: undefined,
      trains: {},
    }
  });

  await db.set(DATA_KEY, data);
}

function toHash(arr) {
  return arr.reduce((accum, item) => {
    accum[item] = true;
    return accum;
  });
}

export function schedule({ trainId, schedule }) {
  const scheduleHash = toHash(schedule);
  const data = await db.fetch(DATA_KEY);
  let firstMulti, nextMulti;

  TIMES_IN_REVERSE.forEach((time) => {
    let { trains } = data[time];

    const trainWasScheduledNow = trains[trainId];
    const trainToScheduleNow = scheduleHash[time];

    // train needs to be added to schedule
    if (!trainWasScheduledNow && trainToScheduleNow) {
      data[time].trains[trainId] = true;
    }

    // train needs to be removed from schedule
    if (trainWasScheduledNow && !trainToScheduleNow) {
      delete data[time].trains[trainId];
    }

    // Next multi train time will be the last multi that was found
    if (nextMulti) {
      data[time].nextMultiTrain = nextMulti;
    }

    const trainCountAtTime = Object.keys(data[time].trains).length;

    if (trainCountAtTime > 1) {
      // Now in a multi train time!
      if (!nextMulti) {
        firstMulti = time;
      }

      nextMulti = time;
    }
  });

  TIMES_IN_REVERSE.forEach((time) => {
    if (time === firstMulti || !nextMulti) {
      return false;
    }

    data[time].nextMultiTrain = nextMulti;
  }
}
