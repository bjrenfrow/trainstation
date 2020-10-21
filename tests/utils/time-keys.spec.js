import chai from 'chai';
import TIME_KEYS from '../../src/utils/time-keys.js';

const { expect } = chai;

describe('Time Keys Util', function() {
  it('generates the keys', function() {
    expect(TIME_KEYS).to.have.lengthOf(60 * 24);
    expect(TIME_KEYS[0]).to.equal('0000');
    expect(TIME_KEYS[60]).to.equal('0100');
    expect(TIME_KEYS[601]).to.equal('1001');
    expect(TIME_KEYS[TIME_KEYS.length - 1]).to.equal('2359');
  });
});
