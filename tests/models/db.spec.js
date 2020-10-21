import * as db from '../../src/models/db.js';
import chai from 'chai';

const { expect } = chai;

describe('DB', function() {
  beforeEach(async () => {
    await db.reset();
  });

  it('gets and sets', async function() {
    const anyObject = { a: 'b' };
    await db.set('abc', anyObject);
    const value1 = await db.fetch('abc');
    expect(value1).to.deep.equal(anyObject)
  });

  it('list keys', async function() {
    const anyObject = { a: 'b' };

    await db.set('abc', anyObject);
    await db.set('def', anyObject);
    await db.set('ghi', anyObject);

    const keys = await db.keys();
    expect(keys).to.deep.equal(['abc', 'def', 'ghi']);
  });
});
