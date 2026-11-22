/* eslint-disable no-console */
const core = vi.hoisted(() => ({ default: null }));

vi.mock('@atrament/core', () => {
  const atrament = {
    interfaces: { persistent: {} },
    defineInterfaces: vi.fn((interfaces) => {
      atrament.interfaces = { persistent: {}, ...interfaces };
    })
  };
  core.default = atrament;
  return { default: atrament };
});

vi.mock('../src/persistent', () => ({
  default: vi.fn(() => null)
}));

async function loadIndex() {
  vi.resetModules();
  return (await import('../src/index')).default;
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  delete window.Neutralino;
});

describe('index', () => {
  it('defines web interfaces and exports atrament', async () => {
    const atrament = await loadIndex();
    expect(atrament).toBe(core.default);
    const [interfaces] = atrament.defineInterfaces.mock.calls[0];
    const platformWeb = (await import('../src/interfaces/platform-web')).default;
    expect(interfaces).toEqual({
      loader: (await import('../src/interfaces/loader-web-fflate')).default,
      sound: (await import('../src/interfaces/sound-howler')).default,
      state: (await import('../src/interfaces/state-nanostores')).default,
      platform: platformWeb
    });
    expect(interfaces).not.toHaveProperty('persistent');
  });

  it('logs the memory driver when no persistent storage is available', async () => {
    await loadIndex();
    expect(console.log).toHaveBeenCalledWith('Atrament persistent driver: memory');
  });

  it('uses the detected persistent driver', async () => {
    const detect = (await import('../src/persistent')).default;
    const driver = { driver: 'idb' };
    detect.mockReturnValueOnce(driver);
    const atrament = await loadIndex();
    expect(atrament.defineInterfaces.mock.calls.at(-1)[0].persistent).toBe(driver);
    expect(console.log).toHaveBeenCalledWith('Atrament persistent driver: idb');
  });

  it('uses the Neutralino platform when running in Neutralino', async () => {
    window.Neutralino = {};
    const atrament = await loadIndex();
    const platformNeutralino = (await import('../src/interfaces/platform-neutralino')).default;
    expect(atrament.defineInterfaces.mock.calls.at(-1)[0].platform).toBe(platformNeutralino);
  });
});
