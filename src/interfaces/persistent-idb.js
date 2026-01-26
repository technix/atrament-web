import { get as getItem, set as setItem, del, keys as storeKeys, createStore } from 'idb-keyval';

let storage;

function init(prefix) {
  storage = createStore(prefix, 'keyvaluepairs');
}

async function exists(item) {
  const value = await getItem(item, storage);
  return value !== undefined;
}

async function get(item) {
  const value = await getItem(item, storage);
  return value;
}

async function set(item, value) {
  await setItem(item, value, storage);
}

async function remove(item) {
  await del(item, storage);
}

async function keys() {
  const storageKeys = await storeKeys(storage);
  return storageKeys;
}

export default {
  init,
  exists,
  get,
  set,
  remove,
  keys
};
