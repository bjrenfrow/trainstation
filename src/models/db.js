import nano from 'nano';

const connection = nano(process.env.COUCHDB_URL);

const TABLE_NAME = 'store';

let store;

const create = async () => {
  try {
    await connection.db.create(TABLE_NAME);
  } catch (e) {
    // idempontent function, so discard this error
    if (e.reason === 'The database could not be created, the file already exists.') { return; }
    console.error(e);
  }

  store = connection.use(TABLE_NAME);
}

const destroy = async () => {
  if(process.env.NODE_ENV !== 'test') {
    return console.error('Trying to destroy db outside of test!')
  }

  try {
    await connection.db.destroy(TABLE_NAME)
  } catch (e) {
    // idempontent function, so discard this error
    if (e.message === 'Database does not exist') { return; }
    console.error(e);
  }
}

export const reset = async () => {
  await destroy();
  await create();
}

// Ensure DB created on connection
create();

// CORE API
export const set = (key, value) => store.insert({value}, key);

export const fetch = async (key) => {
  const response = await store.get(key);
  return response?.value || undefined;
}

export const keys = async () => {
  const { rows } = await store.list()
  return rows.map(({ key }) => key);
}
