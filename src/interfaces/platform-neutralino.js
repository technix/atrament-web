/* global window */

async function setFullscreen(enabled) {
  if (enabled) {
    await window.Neutralino.window.setFullScreen();
  } else {
    await window.Neutralino.window.exitFullScreen();
  }
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
