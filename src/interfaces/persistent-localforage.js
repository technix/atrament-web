import localforage from 'localforage';

let storage;

function init(prefix) {
  storage = localforage.createInstance(`${prefix}-atrament`);
  storage.config({
    name: prefix
  });
  storage.setDriver([localforage.INDEXEDDB, localforage.LOCALSTORAGE]);
}

async function exists(item) {
  const value = await storage.getItem(item);
  return value !== null;
}

async function get(item) {
  const value = await storage.getItem(item);
  return value;
}

async function set(item, value) {
  await storage.setItem(item, value);
}

async function remove(item) {
  await storage.removeItem(item);
}

async function keys() {
  const storageKeys = await storage.keys();
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
