
/* global window */

function init() {
}

async function exists(item) {
  const value = await window.Neutralino.storage.getData(item);
  return !!value;
}

async function get(item) {
  const value = await window.Neutralino.storage.getData(item);
  return JSON.parse(value);
}

async function set(item, value) {
  await window.Neutralino.storage.setData(item, JSON.stringify(value));
}

async function remove(item) {
  await window.Neutralino.storage.setData(item, null);
}

async function keys() {
  const storageKeys = await window.Neutralino.storage.getKeys();
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
