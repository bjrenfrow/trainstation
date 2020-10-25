import * as db from '../models/db.js';
import { STORE_KEY } from '../models/schedule.js';

async function dbIsEmpty() {
  const keys = await db.keys();
  return keys.length === 0;
}

// make an empty data object in the DB
export async function init({ times }) {
  const isEmpty = await dbIsEmpty();

  if (!isEmpty) { return; }

  const data = {};

  times.forEach(time => {
    data[time] = {
      nextMultiTrain: undefined,
      trains: {},
    }
  });

  await db.set(STORE_KEY, data);
  return data;
}

const toHash = (arr) => arr.reduce((accum, item) => {
  accum[item] = true;
  return accum;
}, {});

// Do everything in memory on the schedule data structure
// Then commit changes to the cache
export function schedule({ data, trainId, schedule, times }) {
  const timesDesc = times.reverse();
  const scheduleHash = toHash(schedule);
  let firstMulti, nextMulti;

  // Go backwards in time
  timesDesc.forEach((time) => {
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

    // if multi train in the future assign it now
    if (nextMulti) {
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

  for (let time of timesDesc) {
    // loop around in case the next train comes tomorrow.
    // also has the handy benefit of setting everything to undefined if no multi trains were found
    data[time].nextMultiTrain = nextMulti;

    // Have gone a full loop around, exit.
    if (time === firstMulti) { break; }
  }

  return data;
}
