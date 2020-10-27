import chai from 'chai';
import MockDate from 'mockdate'

import { generateTimeKeys, getISODateFrom } from '../../src/utils/time.js';

const { expect } = chai;

describe('Time Keys Util', function() {
  describe('generateTimeKeys', function() {
    it('generates the keys', function() {
      const keys = generateTimeKeys();
      expect(keys).to.have.lengthOf(60 * 24);
      expect(keys[0]).to.equal('0000');
      expect(keys[60]).to.equal('0100');
      expect(keys[601]).to.equal('1001');
      expect(keys[keys.length - 1]).to.equal('2359');
    });
  });

  describe('getISODateFrom', function() {
    beforeEach(function() {
      MockDate.set(new Date('2020-10-01T01:00:00'));
    });

    afterEach(function() {
      MockDate.reset();
    });

    it('gets the right iso for a future time', function() {
      const iso = getISODateFrom({currentTimeOfDay: '0800', nextTimeOfDay: '1600' });
      expect(iso).to.equal('2020-10-01T16:00:00.000+00:00');
    });

    it('get the tomorrows time when the time is prior in the day', function() {
      MockDate.set(new Date('2020-10-01T12:00:00'));
      const iso = getISODateFrom({currentTimeOfDay: '1600', nextTimeOfDay: '0800' });
      expect(iso).to.equal('2020-10-02T08:00:00.000+00:00');
    });

    it('gets tomorrows time if there they are the same time', function() {
      MockDate.set(new Date('2020-10-01T01:00:00'));
      const iso = getISODateFrom({currentTimeOfDay: '1200', nextTimeOfDay: '1200' });
      expect(iso).to.equal('2020-10-02T12:00:00.000+00:00');
    });
  });
});
