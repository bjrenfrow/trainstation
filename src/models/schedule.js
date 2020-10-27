import * as db from './db.js';
import { Mutex } from 'async-mutex';
import { TIME_KEYS, getISODateFrom } from '../utils/time.js';
import * as utils from '../utils/schedule.js';

export const STORE_KEY = 'store';

// This is used to differentiated between an empty cache and no next multi train time
export const NO_TIME_VALUE = 'NO_TIME';

// Read Thru Cache
export function getNextMultiTrain(time) {
  let nextTime = db.fetch(time);

  // No value in cache, grab value and put in cache
  if (!nextTime) {
    const store = db.fetch(STORE_KEY);
    nextTime = store[time]?.nextMultiTrain || NO_TIME_VALUE;
    db.set(time, nextTime);
  }

  // There are no multi train time slots coming up
  if (nextTime === NO_TIME_VALUE) {
    return null;
  }

  //  calulate time from hour minute of next multi train
  return getISODateFrom({ currentTimeOfDay: time, nextTimeOfDay: nextTime});
}

function flushCache({ times }) {
  for (let key of times) {
    db.set(key, undefined);
  }
}

const lock = new Mutex();

export async function scheduleNextTrain({ trainId, schedule, times = TIME_KEYS }) {
  // locking is important so the main data state is not being overwritten
  // simultaneously by multiple requests.
  let release = await lock.acquire();

  try {
    const store = db.fetch(STORE_KEY);
    const updatedStore = utils.schedule({ trainId, schedule, store, times });
    db.set(STORE_KEY, updatedStore);
    flushCache({ times });
  } catch (e) {
    console.error(e);
  } finally {
    release();
  }
}
