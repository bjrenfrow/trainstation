import chai from 'chai';
import { generateTimeKeys } from '../../src/utils/time-keys.js';

const { expect } = chai;

describe('Time Keys Util', function() {
  it('generates the keys', function() {
    const keys = generateTimeKeys();
    expect(keys).to.have.lengthOf(60 * 24);
    expect(keys[0]).to.equal('0000');
    expect(keys[60]).to.equal('0100');
    expect(keys[601]).to.equal('1001');
    expect(keys[keys.length - 1]).to.equal('2359');
  });
});
