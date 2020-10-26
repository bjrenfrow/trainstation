import * as db from '../models/db.js';
import { STORE_KEY } from '../models/schedule.js';

async function dbIsEmpty() {
  const keys = await db.keys();
  return keys.length === 0;
}

// make an empty store object in the DB
export async function initStore({ times }) {
  const isEmpty = await dbIsEmpty();

  if (!isEmpty) { return; }

  const store = {};

  times.forEach(time => {
    store[time] = {
      nextMultiTrain: undefined,
      trains: {},
    }
  });

  await db.set(STORE_KEY, store);
  return store;
}

const toHash = (arr) => arr.reduce((accum, item) => {
  accum[item] = true;
  return accum;
}, {});

/**
 *
 * @param  {[type]} store    [The main data structure]
 * @param  {[type]} trainId  [The unique trainId]
 * @param  {[type]} schedule [The new schedule for the train]
 * @param  {[type]} times    [an array of times in the format HHMM, usually representing a full day]
 * @return {[type]}          [The store updated with the new schedule]
 */
export function schedule({ store, trainId, schedule, times }) {
  const timesDesc = times.reverse();
  const scheduleHash = toHash(schedule);
  let firstMulti, nextMulti;

  // Go backwards in time
  timesDesc.forEach((time) => {
    let { trains } = store[time];

    const trainWasScheduledNow = trains[trainId];
    const trainToScheduleNow = scheduleHash[time];

    // train needs to be added to scheduled time
    if (!trainWasScheduledNow && trainToScheduleNow) {
      store[time].trains[trainId] = true;
    }

    // train needs to be removed from scheduled time
    if (trainWasScheduledNow && !trainToScheduleNow) {
      delete store[time].trains[trainId];
    }

    // if multi train in the future assign it now
    if (nextMulti) {
      store[time].nextMultiTrain = nextMulti;
    }

    const trainCountAtTime = Object.keys(store[time].trains).length;

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
    store[time].nextMultiTrain = nextMulti;

    // Have gone a full loop around, exit.
    if (time === firstMulti) { break; }
  }

  return store;
}
