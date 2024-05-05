import atrament from '@atrament/core';

import loader from './interfaces/loader-web';
import persistent from './interfaces/persistent-localforage';
import sound from './interfaces/sound-howler';
import state from './interfaces/state-nanostores';

atrament.defineInterfaces({
  loader,
  persistent,
  sound,
  state
});

export default atrament;
