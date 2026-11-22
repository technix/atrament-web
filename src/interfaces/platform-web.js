function getFullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

async function requestFullscreen(element) {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    // Safari: may return undefined instead of a promise
    await element.webkitRequestFullscreen();
  } else {
    throw new Error('Fullscreen API is not supported');
  }
}

async function exitFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    await document.webkitExitFullscreen();
  }
}

// last callback passed to setFullscreen and the last state reported to it
let fullscreenStateCallback = null;
let reportedFullscreenState = null;

function reportFullscreenState() {
  const state = !!getFullscreenElement();
  if (fullscreenStateCallback && state !== reportedFullscreenState) {
    reportedFullscreenState = state;
    fullscreenStateCallback(state);
  }
}

// fullscreen can also be changed outside the app (Esc, browser UI)
document.addEventListener('fullscreenchange', reportFullscreenState);
document.addEventListener('webkitfullscreenchange', reportFullscreenState);

// setFullscreenState(value) is called with the resulting fullscreen state:
// `enabled` on success, or the actual state if the request failed.
// It is also called later if the user enters or leaves fullscreen
// with the browser controls.
async function setFullscreen(enabled, setFullscreenState) {
  if (setFullscreenState) {
    fullscreenStateCallback = setFullscreenState;
  }
  // the caller has just set its value to `enabled`
  reportedFullscreenState = enabled;
  const isFullscreen = !!getFullscreenElement();
  try {
    if (enabled) {
      if (!isFullscreen) {
        await requestFullscreen(document.documentElement);
      }
    } else if (isFullscreen) {
      await exitFullscreen();
    }
  } catch (_e) {
    // the actual state is reported below
  }
  if (setFullscreenState) {
    reportedFullscreenState = !!getFullscreenElement();
    setFullscreenState(reportedFullscreenState);
  }
}

function setTitle(title) {
  document.title = title;
}

// check if the app is an installed PWA
function isInstalledApp() {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  const appDisplayModes = [
    'standalone',
    'minimal-ui',
    'window-controls-overlay'
  ];
  return appDisplayModes.some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches
  );
}

function exitApp() {
  window.close();
}

export default {
  setFullscreen,
  setTitle,
  // exitApp is only provided for an installed PWA
  ...(isInstalledApp() && !navigator.standalone ? { exitApp } : {})
};
