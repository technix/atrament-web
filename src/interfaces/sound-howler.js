import { Howl, Howler } from 'howler/src/howler.core';

const soundCache = {};
const musicCache = {};

// stop playback of a single sound file handled by Howler
function $stopHowl(howl) {
  if (howl.fade && howl.playing()) {
    const volume = howl.volume();
    howl.fade(volume, 0, 1);
    howl.stop();
    howl.volume(volume);
  }
  howl.stop();
}

// stop playback of a given file or all files in cache
function $stopPlayback(file, cache) {
  const files = file ? [file] : Object.keys(cache);
  files.forEach((f) => {
    if (cache[f]) {
      $stopHowl(cache[f]);
    }
  });
  return files;
}

/*
  init({
    mute: true/false,
    volume: 0-100
  }) - initialize sound with given configuration
*/
function init(cfg) {
  mute(cfg.mute === true);
  setVolume(cfg.volume);
}

/*
  mute(true/false) - turn sound on/off
*/
function mute(state = true) {
  Howler.mute(state);
}

/*
  isMuted(true/false) - returns true if sound is muted, false otherwise
*/
function isMuted() {
  return Howler._muted; // eslint-disable-line no-underscore-dangle
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
  return Howler.volume() * 100;
}

/*
  playSound(snd)
  Plays sound once.
  - snd: path to a sound file.
*/
function playSound(snd) {
  soundCache[snd] ||= new Howl({
    src: [snd]
  });
  soundCache[snd].play();
}

/*
  stopSound(snd)
  Stops sound playback.
  - snd: path to a sound file.
  If no parameter is supplied, all sounds should be stopped
*/
function stopSound(snd) {
  $stopPlayback(snd, soundCache);
}

/*
  playMusic(mus, loop)
  - mus: path to a music file
  - loop: is track looped? true by default
*/
function playMusic(mus, loop = true) {
  musicCache[mus] ||= new Howl({
    src: [mus],
    html5: true, // streaming
    loop
  });
  const howl = musicCache[mus];
  howl.loop(loop);
  if (howl.playing() || howl.state() === 'loading') {
    // already playing, or play is queued
    return;
  }
  howl.play();
}

/*
  stopMusic(mus)
  - mus: path to a music file
  If no parameter is supplied, all music should be stopped
*/
function stopMusic(mus) {
  $stopPlayback(mus, musicCache).forEach((f) => {
    if (musicCache[f]) {
      // unload stopped tracks from Howler pool
      musicCache[f].unload();
      delete musicCache[f];
    }
  });
}

/*
  reset()
  Stops and unloads all sounds and music, and clears the caches.
  Call it when the game changes, before the old asset URLs are released.
*/
function reset() {
  [soundCache, musicCache].forEach((cache) => {
    Object.keys(cache).forEach((f) => {
      cache[f].unload();
      delete cache[f];
    });
  });
}

export default {
  init,
  reset,
  mute,
  isMuted,
  setVolume,
  getVolume,
  playSound,
  stopSound,
  playMusic,
  stopMusic
};
