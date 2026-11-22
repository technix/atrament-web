async function detect() {
  vi.resetModules();
  const { default: detectPersistent } = await import('../src/persistent');
  return detectPersistent();
}

beforeEach(() => {
  delete window.Neutralino;
});

afterEach(() => {
  delete window.Neutralino;
});

describe('detectPersistent', () => {
  it('prefers Neutralino storage', async () => {
    window.Neutralino = {};
    vi.stubGlobal('indexedDB', {});
    expect((await detect()).driver).toBe('neutralino');
  });

  it('uses IndexedDB when available', async () => {
    vi.stubGlobal('indexedDB', {});
    expect((await detect()).driver).toBe('idb');
  });

  it('falls back to localStorage', async () => {
    vi.stubGlobal('indexedDB', undefined);
    expect((await detect()).driver).toBe('localstorage');
  });

  it('falls back to localStorage when IndexedDB access throws', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      get() { throw new Error('SecurityError'); }
    });
    try {
      expect((await detect()).driver).toBe('localstorage');
    } finally {
      delete globalThis.indexedDB;
    }
  });

  it('returns null when no storage is usable', async () => {
    vi.stubGlobal('indexedDB', undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(await detect()).toBeNull();
  });
});
