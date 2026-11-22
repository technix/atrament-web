import platform from '../src/interfaces/platform-neutralino';

let neuWindow;
let neuApp;

beforeEach(() => {
  neuWindow = {
    setFullScreen: vi.fn(async () => {}),
    exitFullScreen: vi.fn(async () => {}),
    setTitle: vi.fn(async () => {})
  };
  neuApp = { exit: vi.fn(async () => {}) };
  window.Neutralino = { window: neuWindow, app: neuApp };
});

afterEach(() => {
  delete window.Neutralino;
});

describe('platform-neutralino', () => {
  it('enters fullscreen and reports the state', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(neuWindow.setFullScreen).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('exits fullscreen and reports the state', async () => {
    const cb = vi.fn();
    await platform.setFullscreen(false, cb);
    expect(neuWindow.exitFullScreen).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(false);
  });

  it('does not report the state when the call fails', async () => {
    neuWindow.setFullScreen.mockRejectedValueOnce(new Error('fail'));
    const cb = vi.fn();
    await platform.setFullscreen(true, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('works without a callback', async () => {
    await expect(platform.setFullscreen(true)).resolves.toBeUndefined();
  });

  it('sets the window title', async () => {
    await platform.setTitle('My Game');
    expect(neuWindow.setTitle).toHaveBeenCalledWith('My Game');
  });

  it('exits the app', async () => {
    await platform.exitApp();
    expect(neuApp.exit).toHaveBeenCalled();
  });
});
