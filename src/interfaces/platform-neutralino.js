// setFullscreenState(value) is called only if the state was changed successfully
async function setFullscreen(enabled, setFullscreenState) {
  try {
    if (enabled) {
      await window.Neutralino.window.setFullScreen();
    } else {
      await window.Neutralino.window.exitFullScreen();
    }
  } catch (_e) {
    return;
  }
  setFullscreenState?.(enabled);
}

async function setTitle(title) {
  await window.Neutralino.window.setTitle(title);
}

async function exitApp() {
  await window.Neutralino.app.exit();
}

export default {
  setFullscreen,
  setTitle,
  exitApp
};
