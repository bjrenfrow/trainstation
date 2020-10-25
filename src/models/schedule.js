import { schedule } from '../utils/schedule';
import * as db from './db.js';
import { Mutex } from 'async-mutex';
import { TIME_KEYS } from '../utils/time-keys';

export const STORE_KEY = 'store';

// this is used to differentiated between an empty cache and no next multi train time
export const NO_TIME_VALUE = 'NO_TIME';

// Read Thru Cache
export async function getNextMultiTrain(time) {
  let nextTime = await db.fetch(time);

  // No value in cache, grab value and put in cache
  if (!nextTime) {
    const store = await db.fetch(STORE_KEY);
    nextTime = store[time]?.nextMultiTrain || NO_TIME_VALUE;
    await db.set(time, nextTime);
  }

  // There are no multi trains time slots coming up
  if (nextTime === NO_TIME_VALUE) {
    return null;
  }

  return nextTime;
}

const lock = new Mutex();

export function flushCache({ times }) {
  for (key of TIME_KEYS) {
    await db.set(key, undefined);
  }
}

export function scheduleNextTrain({ trainId, schedule, times = TIME_KEYS }) {
  // locking is important so the main data state is not being overwritten
  // simultaneously by multiple requests.
  let release = await lock.acquire();

  try {
    const store = await db.fetch(STORE_KEY);
    const updatedStore = schedule({ trainId, schedule, data: store, times });
    await db.set(STORE_KEY, updatedStore);
    await flushCache({ times });
  } catch (e) {
    console.error(e);
  } finally () {
    release();
  }
}
