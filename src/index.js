/* global window */

import atrament from '@atrament/core';

import loader from './interfaces/loader-web-fflate';
import persistentWeb from './interfaces/persistent-localforage';
import persistentNeutralino from './interfaces/persistent-neutralino';
import sound from './interfaces/sound-howler';
import state from './interfaces/state-nanostores';

atrament.defineInterfaces({
  loader,
  persistent: window.Neutralino ? persistentNeutralino : persistentWeb,
  sound,
  state
});

export default atrament;
