/* global window */

import atrament from '@atrament/core';

import loader from './interfaces/loader-web-fflate';
import persistentWeb from './interfaces/persistent-idb';
import persistentNeutralino from './interfaces/persistent-neutralino';
import sound from './interfaces/sound-howler';
import state from './interfaces/state-nanostores';
import platformWeb from './interfaces/platform-web';
import platformNeutralino from './interfaces/platform-neutralino';

atrament.defineInterfaces({
  loader,
  persistent: window.Neutralino ? persistentNeutralino : persistentWeb,
  sound,
  state,
  platform: window.Neutralino ? platformNeutralino : platformWeb
});

export default atrament;
