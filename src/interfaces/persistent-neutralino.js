import murmur from 'murmurhash-js';

const KEY_STORAGE = '__atrament_storage';

// Neutralino error code for a storage key that doesn't exist.
// Used by storage.getData in the Neutralino source (api/storage/storage.cpp).
const ERR_KEY_NOT_FOUND = 'NE_ST_NOSTKEX';

// storage keys update queue
let storageLock = Promise.resolve();

// neutralino functions

async function neuGetData(key) {
  let data;
  try {
    data = await window.Neutralino.storage.getData(key);
  } catch (e) {
    if (e?.code === ERR_KEY_NOT_FOUND) {
      return undefined;
    }
    throw e;
  }
  return JSON.parse(data);
}

async function neuSetData(key, value) {
  const v = JSON.stringify(value);
  await window.Neutralino.storage.setData(key, v);
  return v;
}

async function neuDeleteData(key) {
  await window.Neutralino.storage.setData(key, null);
  return true;
}

// key handling

function normalizeKey(key) {
  return `storage_${murmur(key)}`;
}

// Runs an update of the key index in the queue. The index is rewritten
// only after a successful read (or if it doesn't exist yet), so a failed
// read can't wipe it. Errors are passed to the caller.
function updateStorageKeys(updateFn) {
  const operation = storageLock.then(async () => {
    const storageKeys = (await neuGetData(KEY_STORAGE)) ?? {};
    updateFn(storageKeys);
    await neuSetData(KEY_STORAGE, storageKeys);
  });
  storageLock = operation.catch(() => {});
  return operation;
}

async function neuSetKey(key, item) {
  return updateStorageKeys((storageKeys) => {
    storageKeys[item] = key;
  });
}

async function neuDeleteKey(item) {
  return updateStorageKeys((storageKeys) => {
    delete storageKeys[item];
  });
}

// interface functions

function init() {
}

async function exists(item) {
  const persistentKeys = await keys();
  return persistentKeys.includes(item);
}

async function get(item) {
  return neuGetData(normalizeKey(item));
}

async function set(item, value) {
  const key = normalizeKey(item);
  try {
    await neuSetData(key, value);
    await neuSetKey(key, item);
  } catch (e) {
    console.error(e.message);
  }
}

async function remove(item) {
  const key = normalizeKey(item);
  try {
    await neuDeleteData(key);
    await neuDeleteKey(item);
  } catch (e) {
    console.error(e.message);
  }
}

async function keys() {
  const storageKeys = await neuGetData(KEY_STORAGE);
  return Object.keys(storageKeys ?? {});
}

export default {
  driver: 'neutralino',
  init,
  exists,
  get,
  set,
  remove,
  keys
};
