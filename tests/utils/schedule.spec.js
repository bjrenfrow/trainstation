import chai from 'chai';
import * as db from '../../src/models/db.js';
import { init, schedule } from '../../src/utils/schedule.js';
import { generateTimeKeys } from '../../src/utils/time.js';

const { expect } = chai;

describe('Schedule Util', function() {
  beforeEach(async () => {
    await db.reset();
  });

  it('correctly makes a simple train schedule', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let store = await initStore({ times });

    let train1 = {
      trainId: 'ABC1',
      schedule: ['0000', '0010'],
    };

    let train2 = {
      trainId: 'ABC2',
      schedule: ['0005', '0015'],
    };

    let train3 = {
      trainId: 'ABC3',
      schedule: ['0000', '0005', '0010', '0015'],
    };

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal('0005');
    expect(store['0001'].nextMultiTrain).to.equal('0005');
    expect(store['0002'].nextMultiTrain).to.equal('0005');
    expect(store['0003'].nextMultiTrain).to.equal('0005');
    expect(store['0004'].nextMultiTrain).to.equal('0005');

    expect(store['0005'].nextMultiTrain).to.equal('0010');
    expect(store['0006'].nextMultiTrain).to.equal('0010');
    expect(store['0007'].nextMultiTrain).to.equal('0010');
    expect(store['0008'].nextMultiTrain).to.equal('0010');
    expect(store['0009'].nextMultiTrain).to.equal('0010');

    expect(store['0010'].nextMultiTrain).to.equal('0015');
    expect(store['0011'].nextMultiTrain).to.equal('0015');
    expect(store['0012'].nextMultiTrain).to.equal('0015');
    expect(store['0013'].nextMultiTrain).to.equal('0015');
    expect(store['0014'].nextMultiTrain).to.equal('0015');

    expect(store['0015'].nextMultiTrain).to.equal('0000');
    expect(store['0016'].nextMultiTrain).to.equal('0000');
    expect(store['0017'].nextMultiTrain).to.equal('0000');
    expect(store['0018'].nextMultiTrain).to.equal('0000');
    expect(store['0019'].nextMultiTrain).to.equal('0000');
  });

  it('handles a single deletion properly', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let store = await init({ times });

    let train1 = {
      trainId: 'ABC1',
      schedule: ['0000', '0010'],
    };

    let train2 = {
      trainId: 'ABC2',
      schedule: ['0000', '0010'],
    };

    let train3 = {
      trainId: 'ABC2',
      schedule: ['0010'],
    };

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal('0010');
    expect(store['0010'].nextMultiTrain).to.equal('0000');

    store = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal('0010');
    expect(store['0005'].nextMultiTrain).to.equal('0010');
    expect(store['0010'].nextMultiTrain).to.equal('0010');
    expect(store['0015'].nextMultiTrain).to.equal('0010');
  });


  it('handles full deletion properly', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let store = await init({ times });

    let train1 = {
      trainId: 'ABC1',
      schedule: ['0000', '0010'],
    };

    let train2 = {
      trainId: 'ABC2',
      schedule: ['0000', '0010'],
    };

    let train3 = {
      trainId: 'ABC2',
      schedule: [],
    };

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal(undefined);

    store = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal('0010');
    expect(store['0010'].nextMultiTrain).to.equal('0000');

    store = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, store });

    expect(store['0000'].nextMultiTrain).to.equal(undefined);
    expect(store['0005'].nextMultiTrain).to.equal(undefined);
    expect(store['0010'].nextMultiTrain).to.equal(undefined);
    expect(store['0015'].nextMultiTrain).to.equal(undefined);
  });
});
