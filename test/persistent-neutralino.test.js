import murmur from 'murmurhash-js';
import driver from '../src/interfaces/persistent-neutralino';
import { createNeutralinoStorage } from './helpers';

let storage;

beforeEach(() => {
  storage = createNeutralinoStorage();
  window.Neutralino = { storage };
  driver.init('Atrament://127.0.0.1:12345/game');
});

afterEach(() => {
  delete window.Neutralino;
});

// keys without namespace, same as in @atrament/web 2.2.1
const indexKey = '__atrament_storage';
const dataKey = (item) => `storage_${murmur(item)}`;

describe('persistent-neutralino', () => {
  it('has driver name', () => {
    expect(driver.driver).toBe('neutralino');
  });

  it('returns undefined and false for a missing item', async () => {
    expect(await driver.get('missing')).toBeUndefined();
    expect(await driver.exists('missing')).toBe(false);
    expect(await driver.keys()).toEqual([]);
  });

  it('stores values under hashed keys and indexes them', async () => {
    await driver.set('save 1', { a: 1 });
    expect(storage.data.get(dataKey('save 1'))).toBe('{"a":1}');
    expect(JSON.parse(storage.data.get(indexKey))).toEqual({ 'save 1': dataKey('save 1') });
    expect(await driver.get('save 1')).toEqual({ a: 1 });
    expect(await driver.exists('save 1')).toBe(true);
  });

  it('removes values and their index entries', async () => {
    await driver.set('a', 1);
    await driver.set('b', 2);
    await driver.remove('a');
    expect(storage.data.has(dataKey('a'))).toBe(false);
    expect(await driver.keys()).toEqual(['b']);
    expect(await driver.exists('a')).toBe(false);
  });

  it('serializes concurrent index updates', async () => {
    const items = Array.from({ length: 10 }, (_, i) => `item${i}`);
    await Promise.all(items.map((item, i) => driver.set(item, i)));
    expect((await driver.keys()).sort()).toEqual([...items].sort());
  });

  it('reads data written in the 2.2.1 key format', async () => {
    storage.data.set(dataKey('settings'), '{"mute":false}');
    storage.data.set(indexKey, JSON.stringify({ settings: dataKey('settings') }));
    expect(await driver.exists('settings')).toBe(true);
    expect(await driver.get('settings')).toEqual({ mute: false });
  });

  it('does not depend on the prefix (random Neutralino port)', async () => {
    await driver.set('k', 'first');
    driver.init('Atrament://127.0.0.1:54321/game');
    expect(await driver.keys()).toEqual(['k']);
    expect(await driver.get('k')).toBe('first');
  });

  it('isolates explicitly set namespaces', async () => {
    const ns = murmur('game');
    await driver.set('k', 'plain');
    driver.init('any prefix', 'game');
    expect(await driver.keys()).toEqual([]);
    await driver.set('k', 'namespaced');
    expect(storage.data.get(`storage_${ns}_${murmur('k')}`)).toBe('"namespaced"');
    expect(JSON.parse(storage.data.get(`__atrament_storage_${ns}`))).toEqual({ k: `storage_${ns}_${murmur('k')}` });
    driver.init('any prefix');
    expect(await driver.get('k')).toBe('plain');
  });

  it('rethrows errors other than a missing key', async () => {
    const error = new Error('boom');
    storage.getData.mockRejectedValueOnce(error);
    await expect(driver.get('k')).rejects.toBe(error);
  });

  it('does not overwrite the index after a failed read', async () => {
    await driver.set('kept', 1);
    const original = storage.data.get(indexKey);
    // first getData call is for the index in updateStorageKeys
    storage.setData.mockImplementationOnce(async () => {}); // data write
    storage.getData.mockRejectedValueOnce(new Error('read failed'));
    await expect(driver.set('new', 2)).rejects.toThrow('read failed');
    expect(storage.data.get(indexKey)).toBe(original);
  });

  it('keeps processing the queue after a failed update', async () => {
    storage.getData.mockRejectedValueOnce(new Error('read failed'));
    await expect(driver.set('a', 1)).rejects.toThrow('read failed');
    await driver.set('b', 2);
    expect(await driver.keys()).toContain('b');
  });
});
