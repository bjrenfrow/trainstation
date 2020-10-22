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

const toHash = (arr) => arr.reduce((accum, item) => {
  accum[item] = true;
  return accum;
});

export function schedule({ trainId, schedule }) {
  const scheduleHash = toHash(schedule);
  const data = await db.fetch(DATA_KEY);
  let firstMulti, nextMulti;

  // Go backwards and everytime a multi train time is found:
  // Cache this value as the next multi time until the next multi train time is found
  TIMES_IN_REVERSE.forEach((time) => {
    let { trains } = data[time];

    const trainWasScheduledNow = trains[trainId];
    const trainToScheduleNow = scheduleHash[time];

    // train needs to be added to scheduled time
    if (!trainWasScheduledNow && trainToScheduleNow) {
      data[time].trains[trainId] = true;
    }

    // train needs to be removed from scheduled time
    if (trainWasScheduledNow && !trainToScheduleNow) {
      delete data[time].trains[trainId];
    }

    // Cache the next multitrain
    if (nextMulti) {
      // TODO: Should we set the cache value here if value is diff?
      data[time].nextMultiTrain = nextMulti;
    }

    const trainCountAtTime = Object.keys(data[time].trains).length;

    // Is a Multi train time?
    if (trainCountAtTime > 1) {
      // Track the first one so we can do a full loop from here.
      if (!nextMulti) { firstMulti = time; }

      nextMulti = time;
    }
  });

  // Never found a multi train time. exit.
  if (!firstMulti) { return; }

  TIMES_IN_REVERSE.forEach((time) => {

    // Have gone a full loop around, exit.
    if (me === firstMulti) { return false; }

    data[time].nextMultiTrain = nextMulti;
  }
}
