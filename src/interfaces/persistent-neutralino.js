
/* global window */
import murmur from 'murmurhash-js';

const KEY_STORAGE = '__atrament_storage';

// storage keys update queue
let storageLock = Promise.resolve();

// neutralino functions

async function neuGetData(key) {
  try {
    const data = await window.Neutralino.storage.getData(key);
    return JSON.parse(data);
  } catch (e) {
    console.warn(e.message);
    return null;
  }
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

async function neuSetKey(key, item) {
  storageLock = storageLock.then(async () => {
    let storageKeys = await neuGetData(KEY_STORAGE);
    if (storageKeys === null) {
      storageKeys = {};
    }
    storageKeys[item] = key;
    await neuSetData(KEY_STORAGE, storageKeys);
  }).catch((e) => console.error(e.message));
  return storageLock;
}

async function neuDeleteKey(item) {
  storageLock = storageLock.then(async () => {
    let storageKeys = await neuGetData(KEY_STORAGE);
    if (storageKeys === null) {
      storageKeys = {};
    }
    delete storageKeys[item];
    await neuSetData(KEY_STORAGE, storageKeys);
  }).catch((e) => console.error(e.message));
  return storageLock;
}

// interface functions

function init() {
}

async function exists(item) {
  const persistentKeys = await keys();
  return persistentKeys.includes(item);
}

async function get(item) {
  const storageKeys = await neuGetData(KEY_STORAGE);
  const key = storageKeys === null ? normalizeKey(item) : storageKeys[item];
  const value = await neuGetData(key);
  return value;
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
  return storageKeys === null ? [] : Object.keys(storageKeys);
}

export default {
  init,
  exists,
  get,
  set,
  remove,
  keys
};
