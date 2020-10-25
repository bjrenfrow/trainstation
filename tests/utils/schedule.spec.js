import chai from 'chai';
import * as db from '../../src/models/db.js';
import { init, schedule } from '../../src/utils/schedule.js';
import { generateTimeKeys } from '../../src/utils/time-keys.js';

const { expect } = chai;

describe('Schedule Util', function() {
  beforeEach(async () => {
    await db.reset();
  });

  it('correctly makes a simple train schedule', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let data = await init({ times });

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

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal('0005');
    expect(data['0001'].nextMultiTrain).to.equal('0005');
    expect(data['0002'].nextMultiTrain).to.equal('0005');
    expect(data['0003'].nextMultiTrain).to.equal('0005');
    expect(data['0004'].nextMultiTrain).to.equal('0005');

    expect(data['0005'].nextMultiTrain).to.equal('0010');
    expect(data['0006'].nextMultiTrain).to.equal('0010');
    expect(data['0007'].nextMultiTrain).to.equal('0010');
    expect(data['0008'].nextMultiTrain).to.equal('0010');
    expect(data['0009'].nextMultiTrain).to.equal('0010');

    expect(data['0010'].nextMultiTrain).to.equal('0015');
    expect(data['0011'].nextMultiTrain).to.equal('0015');
    expect(data['0012'].nextMultiTrain).to.equal('0015');
    expect(data['0013'].nextMultiTrain).to.equal('0015');
    expect(data['0014'].nextMultiTrain).to.equal('0015');

    expect(data['0015'].nextMultiTrain).to.equal('0000');
    expect(data['0016'].nextMultiTrain).to.equal('0000');
    expect(data['0017'].nextMultiTrain).to.equal('0000');
    expect(data['0018'].nextMultiTrain).to.equal('0000');
    expect(data['0019'].nextMultiTrain).to.equal('0000');
  });

  it('handles a single deletion properly', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let data = await init({ times });

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

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal('0010');
    expect(data['0010'].nextMultiTrain).to.equal('0000');

    data = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal('0010');
    expect(data['0005'].nextMultiTrain).to.equal('0010');
    expect(data['0010'].nextMultiTrain).to.equal('0010');
    expect(data['0015'].nextMultiTrain).to.equal('0010');
  });


  it('handles full deletion properly', async function() {
    const times = generateTimeKeys({ hours: 1, minutes: 20 });
    let data = await init({ times });

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

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train1.trainId, schedule: train1.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal(undefined);

    data = schedule({ trainId: train2.trainId, schedule: train2.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal('0010');
    expect(data['0010'].nextMultiTrain).to.equal('0000');

    data = schedule({ trainId: train3.trainId, schedule: train3.schedule, times, data });

    expect(data['0000'].nextMultiTrain).to.equal(undefined);
    expect(data['0005'].nextMultiTrain).to.equal(undefined);
    expect(data['0010'].nextMultiTrain).to.equal(undefined);
    expect(data['0015'].nextMultiTrain).to.equal(undefined);
  });
});
