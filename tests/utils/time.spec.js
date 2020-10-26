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
    afterEach(function() {
      MockDate.reset();
    });

    it.only('nur', function() {
      MockDate.set(new Date('2020-10-01T01:00:00'));
      const iso = getISODateFrom('1200');
      console.log({iso});
    });
  });
});
