import 'fake-indexeddb/auto';
import persistentLocalstorage from '../src/interfaces/persistent-localstorage';
import persistentIdb from '../src/interfaces/persistent-idb';

// Common contract shared by all persistent drivers.
function driverContract(driver, getPrefix) {
  beforeEach(() => {
    driver.init(getPrefix());
  });

  it('returns undefined and false for a missing item', async () => {
    expect(await driver.get('missing')).toBeUndefined();
    expect(await driver.exists('missing')).toBe(false);
  });

  it('stores and retrieves values', async () => {
    const value = { scene: 'start', vars: { gold: 10 }, list: [1, 2] };
    await driver.set('save', value);
    expect(await driver.exists('save')).toBe(true);
    expect(await driver.get('save')).toEqual(value);
  });

  it('stores falsy values', async () => {
    await driver.set('zero', 0);
    await driver.set('null', null);
    expect(await driver.get('zero')).toBe(0);
    expect(await driver.exists('null')).toBe(true);
  });

  it('overwrites values', async () => {
    await driver.set('k', 1);
    await driver.set('k', 2);
    expect(await driver.get('k')).toBe(2);
  });

  it('removes items', async () => {
    await driver.set('k', 1);
    await driver.remove('k');
    expect(await driver.exists('k')).toBe(false);
    expect(await driver.get('k')).toBeUndefined();
  });

  it('lists keys', async () => {
    await driver.set('a', 1);
    await driver.set('b', 2);
    expect((await driver.keys()).sort()).toEqual(['a', 'b']);
  });

  it('isolates storages with different prefixes', async () => {
    await driver.set('shared', 'first');
    driver.init(`${getPrefix()}-other`);
    expect(await driver.exists('shared')).toBe(false);
    expect(await driver.keys()).toEqual([]);
    await driver.set('shared', 'second');
    driver.init(getPrefix());
    expect(await driver.get('shared')).toBe('first');
  });
}

let counter = 0;
const uniquePrefix = () => `game-${counter}`;

beforeEach(() => {
  counter += 1;
});

describe('persistent-localstorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has driver name', () => {
    expect(persistentLocalstorage.driver).toBe('localstorage');
  });

  driverContract(persistentLocalstorage, uniquePrefix);

  it('stores values as prefixed JSON', async () => {
    persistentLocalstorage.init('pfx');
    await persistentLocalstorage.set('item', { a: 1 });
    expect(localStorage.getItem('pfx:item')).toBe('{"a":1}');
  });

  it('ignores keys from other prefixes', async () => {
    persistentLocalstorage.init('pfx');
    localStorage.setItem('pfx-long:x', '1');
    localStorage.setItem('unrelated', '1');
    localStorage.setItem('pfx:mine', '1');
    expect(await persistentLocalstorage.keys()).toEqual(['mine']);
  });
});

describe('persistent-idb', () => {
  it('has driver name', () => {
    expect(persistentIdb.driver).toBe('idb');
  });

  driverContract(persistentIdb, uniquePrefix);
});
