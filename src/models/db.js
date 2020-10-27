let store = {};

export const reset = () => {
  store = {};
}

// CORE API
export const set = (key, value) => {
  store[key] = value;
};

export const fetch = (key) => {
  return store[key] || undefined;
}

export const keys = () => {
  return Object.keys(store);
}
