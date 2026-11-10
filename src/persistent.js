import persistentLocalstorage from './interfaces/persistent-localstorage';
import persistentIdb from './interfaces/persistent-idb';
import persistentNeutralino from './interfaces/persistent-neutralino';

const isNeutralino = !!window.Neutralino;

const isIndexedDB = (() => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
})();

const isLocalStorage = (() => {
  try {
    const ls = window.localStorage;
    const k = '__probe__';
    ls.setItem(k, k);
    ls.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

const driverInfo = (driver) => console.log(`Atrament persistent driver: ${driver}`);

export default function detectPersistent() {
  if (isNeutralino) {
    driverInfo('neutralino');
    return persistentNeutralino;
  }
  if (isIndexedDB) {
    driverInfo('indexeddb');
    return persistentIdb;
  }
  if (isLocalStorage) {
    driverInfo('localstorage');
    return persistentLocalstorage;
  }
  driverInfo('memory');
  return null;
}
