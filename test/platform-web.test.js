let fullscreenElement;
let platform;

async function loadPlatform() {
  vi.resetModules();
  return (await import('../src/interfaces/platform-web')).default;
}

function setFullscreenElement(el) {
  fullscreenElement = el;
}

function fireFullscreenChange(type = 'fullscreenchange') {
  document.dispatchEvent(new Event(type));
}

beforeEach(async () => {
  fullscreenElement = null;
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenElement
  });
  document.documentElement.requestFullscreen = vi.fn(async () => {
    setFullscreenElement(document.documentElement);
  });
  document.exitFullscreen = vi.fn(async () => {
    setFullscreenElement(null);
  });
  platform = await loadPlatform();
});

afterEach(() => {
  delete document.fullscreenElement;
  delete document.documentElement.requestFullscreen;
  delete document.documentElement.webkitRequestFullscreen;
  delete document.exitFullscreen;
  delete document.webkitExitFullscreen;
  delete document.webkitFullscreenElement;
});

describe('setFullscreen', () => {
  it('requests fullscreen and reports success', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('does not request fullscreen when already in fullscreen', async () => {
    setFullscreenElement(document.documentElement);
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('exits fullscreen', async () => {
    setFullscreenElement(document.documentElement);
    const cb = vi.fn();
    await platform.setFullscreen(false, cb);
    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('does not exit fullscreen when not in fullscreen', async () => {
    await platform.setFullscreen(false, vi.fn());
    expect(document.exitFullscreen).not.toHaveBeenCalled();
  });

  it('reports the actual state when the request fails', async () => {
    document.documentElement.requestFullscreen.mockRejectedValueOnce(new Error('denied'));
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('reports false when the Fullscreen API is unsupported', async () => {
    delete document.documentElement.requestFullscreen;
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('uses webkit-prefixed APIs as a fallback', async () => {
    delete document.fullscreenElement;
    delete document.documentElement.requestFullscreen;
    delete document.exitFullscreen;
    let webkitElement = null;
    Object.defineProperty(document, 'webkitFullscreenElement', {
      configurable: true,
      get: () => webkitElement
    });
    // Safari may return undefined instead of a promise
    document.documentElement.webkitRequestFullscreen = vi.fn(() => {
      webkitElement = document.documentElement;
    });
    document.webkitExitFullscreen = vi.fn(() => {
      webkitElement = null;
    });
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(cb).toHaveBeenLastCalledWith(true);
    await platform.setFullscreen(false, cb);
    expect(document.webkitExitFullscreen).toHaveBeenCalled();
    expect(cb).toHaveBeenLastCalledWith(false);
  });

  it('works without a callback', async () => {
    await expect(platform.setFullscreen(true)).resolves.toBeUndefined();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });
});

describe('external fullscreen changes', () => {
  it('reports changes made outside the app', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    cb.mockClear();
    setFullscreenElement(null); // user pressed Esc
    fireFullscreenChange();
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('does not report the same state twice', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    cb.mockClear();
    fireFullscreenChange();
    expect(cb).not.toHaveBeenCalled();
  });

  it('handles webkit fullscreen change events', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(false, cb);
    cb.mockClear();
    setFullscreenElement(document.documentElement);
    fireFullscreenChange('webkitfullscreenchange');
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('keeps the last callback when called without one', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    await platform.setFullscreen(false);
    cb.mockClear();
    setFullscreenElement(document.documentElement);
    fireFullscreenChange();
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('ignores events before any callback is registered', () => {
    setFullscreenElement(document.documentElement);
    expect(() => fireFullscreenChange()).not.toThrow();
  });
});

describe('setTitle', () => {
  it('sets the document title', () => {
    platform.setTitle('My Game');
    expect(document.title).toBe('My Game');
  });
});

describe('exitApp', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.standalone;
  });

  const mockDisplayMode = (activeMode) => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === `(display-mode: ${activeMode})`
    }));
  };

  it('is not provided without matchMedia', async () => {
    delete window.matchMedia;
    expect((await loadPlatform()).exitApp).toBeUndefined();
  });

  it('is not provided in a browser tab', async () => {
    mockDisplayMode('browser');
    expect((await loadPlatform()).exitApp).toBeUndefined();
  });

  it.each([
    'standalone',
    'minimal-ui',
    'window-controls-overlay'
  ])(
    'is provided for an installed PWA (%s)',
    async (mode) => {
      mockDisplayMode(mode);
      const web = await loadPlatform();
      const close = vi.spyOn(window, 'close').mockImplementation(() => {});
      web.exitApp();
      expect(close).toHaveBeenCalled();
    }
  );

  it('is not provided for an iOS home screen app', async () => {
    mockDisplayMode('standalone');
    navigator.standalone = true;
    expect((await loadPlatform()).exitApp).toBeUndefined();
  });
});
