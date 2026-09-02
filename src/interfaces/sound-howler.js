import { Howl, Howler } from 'howler/src/howler.core';

const soundCache = {};
const musicCache = {};

// stop playback of given sound file or all cached sound files
function $stopPlayback(file, cache, config = {}) {
  const fadeOut = config.fadeOut;

  if (file) {
    const h = cache[file];
    if (h) {
      if (fadeOut && fadeOut > 0) {
        const from = h.volume();
        h.fade(from, 0, fadeOut);
        setTimeout(() => h.stop(), fadeOut);
      } else {
        h.stop();
      }
    }
  } else {
    Object.keys(cache).forEach((key) => {
      const h = cache[key];
      if (!h) return;
      if (fadeOut && fadeOut > 0) {
        const from = h.volume();
        h.fade(from, 0, fadeOut);
        setTimeout(() => h.stop(), fadeOut);
      } else {
        h.stop();
      }
    });
  }
}

/*
  init({
    mute: true/false,
    volume: 0-100
  }) - initialize sound with given configuration
*/
function init(cfg) {
  mute(cfg.mute);
  setVolume(cfg.volume);
}

/*
  mute(true/false) - turn sound on/off
*/
function mute(state = true) {
  Howler.mute(state);
}

/*
  isMuted() - returns true if sound is muted, false otherwise
*/
function isMuted() {
  return Howler.muted;
}

/*
  setVolume(volume) - should set sound volume (0-100)
*/
function setVolume(volume) {
  Howler.volume(volume / 100);
}

/*
  getVolume() - returns current volume
*/
function getVolume() {
  // Howler.volume is a function getter when called without args
  return Howler.volume() * 100;
}

/*
  playSound(snd, config)
  Plays sound once.
  - snd: path to a sound file.
  - config: { fadeIn?: ms, fadeOut?: ms }
*/
function playSound(snd, config = {}) {
  soundCache[snd] ||= new Howl({
    src: [snd]
  });

  const h = soundCache[snd];
  const fadeIn = config.fadeIn;

  if (fadeIn && fadeIn > 0) {
    // start from 0 and fade to the current master volume
    h.volume(0);
    const id = h.play();
    const target = Howler.volume();
    h.fade(0, target, fadeIn, id);
  } else {
    h.play();
  }
}

/*
  stopSound(snd, config)
   stop sound playback.
  - snd: path to a sound file.
  - config: { fadeOut?: ms }
  If no parameter is supplied, all sounds should be stopped
*/
function stopSound(snd, config = {}) {
  $stopPlayback(snd, soundCache, config);
}

/*
  playMusic(mus, loop, config)
  - mus: path to a music file
  - loop: is track looped? true by default
  - config: { fadeIn?: ms, fadeOut?: ms }
*/
function playMusic(mus, loop = true, config = {}) {
  musicCache[mus] ||= new Howl({
    src: [mus],
    html5: true, // streaming
    loop
  });

  const h = musicCache[mus];
  const fadeIn = config.fadeIn;

  if (fadeIn && fadeIn > 0) {
    h.volume(0);
    const id = h.play();
    const target = Howler.volume();
    h.fade(0, target, fadeIn, id);
  } else {
    h.play();
  }
}

/*
  stopMusic(mus, config)
  - mus: path to a music file
  - config: { fadeOut?: ms }
  If no parameter is supplied, all music should be stopped
*/
function stopMusic(mus, config = {}) {
  $stopPlayback(mus, musicCache, config);
}

export default {
  init,
  mute,
  isMuted,
  setVolume,
  getVolume,
  playSound,
  stopSound,
  playMusic,
  stopMusic
};
