/* global window */

async function setFullscreen(enabled, setFullscreenState) {
  if (enabled) {
    await window.Neutralino.window.setFullScreen();
  } else {
    await window.Neutralino.window.exitFullScreen();
  }
  const newFullScreenStatus = await window.Neutralino.window.isFullScreen();
  setFullscreenState(newFullScreenStatus);
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
