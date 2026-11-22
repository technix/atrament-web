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

async function setFullscreen(enabled, setFullscreenState) {
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
    // report the actual state back to the caller
    setFullscreenState?.(!!getFullscreenElement());
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
