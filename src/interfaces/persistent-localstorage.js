let storagePrefix;

function init(prefix) {
  storagePrefix = prefix;
}

function getKey(item) {
  return `${storagePrefix}:${item}`;
}

async function exists(item) {
  return localStorage.getItem(getKey(item)) !== null;
}

async function get(item) {
  const value = localStorage.getItem(getKey(item));
  return value === null ? undefined : JSON.parse(value);
}

async function set(item, value) {
  localStorage.setItem(getKey(item), JSON.stringify(value));
}

async function remove(item) {
  localStorage.removeItem(getKey(item));
}

async function keys() {
  const prefix = `${storagePrefix}:`;
  const storageKeys = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key.startsWith(prefix)) {
      storageKeys.push(key.slice(prefix.length));
    }
  }

  return storageKeys;
}

export default {
  driver: 'localstorage',
  init,
  exists,
  get,
  set,
  remove,
  keys
};
