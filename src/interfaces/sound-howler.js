import { Howl, Howler } from 'howler/src/howler.core';

const soundCache = {};
const musicCache = {};

// stop playback of given sound file or all cached sound files
function $stopPlayback(file, cache) {
  if (file) {
    if (cache[file]) {
      cache[file].stop();
    }
  } else {
    Object.keys(cache).forEach((s) => {
      if (s && s.fade) {
        s.fade(undefined, 0, 1);
      }
      cache[s].stop();
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
  isMuted(true/false) - returns true if sound is muted, false otherwise
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
  return Howler.volume * 100;
}

/*
  playSound(snd)
  Plays sound once.
  - snd: path to a sound file.
*/
function playSound(snd) {
  if (!soundCache[snd]) {
    soundCache[snd] = new Howl({
      src: [snd]
    });
  }
  soundCache[snd].play();
}

/*
  stopSound(snd)
   sound once.
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
  if (!musicCache[mus]) {
    musicCache[mus] = new Howl({
      src: [mus],
      html5: true, // streaming
      loop
    });
  }
  musicCache[mus].play();
}

/*
  stopMusic(mus)
  - mus: path to a music file
  If no parameter is supplied, all music should be stopped
*/
function stopMusic(mus) {
  $stopPlayback(mus, musicCache);
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
