import atrament from '@atrament/core';

import loader from './interfaces/loader-web-fflate';
import detectPersistent from './persistent';
import sound from './interfaces/sound-howler';
import state from './interfaces/state-nanostores';
import platformWeb from './interfaces/platform-web';
import platformNeutralino from './interfaces/platform-neutralino';

const interfaces = {
  loader,
  sound,
  state,
  platform: window.Neutralino ? platformNeutralino : platformWeb
};

const persistentDriver = detectPersistent();
if (persistentDriver) {
  interfaces.persistent = persistentDriver;
}

atrament.defineInterfaces();

export default atrament;
