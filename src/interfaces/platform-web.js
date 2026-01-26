/* global document */

async function setFullscreen(enabled, setFullscreenState) {
  if (enabled && !document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      setFullscreenState(false);
    }
  } else if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function setTitle(title) {
  document.title = title;
}

export default {
  setFullscreen,
  setTitle
};
