import { map } from 'nanostores';

const $state = map({
  settings: {},
  game: {},
  metadata: {},
  scenes: [],
  vars: {}
});

function store() {
  return $state;
}

function get() {
  return $state.get();
}

const setKey = (key, value) => {
  $state.setKey(key, value);
  return $state.get();
};

const toggleKey = (key) => {
  $state.setKey(key, !$state.get()[key]);
  return $state.get();
};

const appendKey = (key, value) => {
  $state.setKey(key, [...$state.get()[key], value]);
  return $state.get();
};

const setSubkey = (key, subkey, value) => {
  $state.setKey(key, { ...$state.get()[key], [subkey]: value });
  return $state.get();
};

const toggleSubkey = (key, subkey) => {
  $state.setKey(key, { ...$state.get()[key], [subkey]: !$state.get()[key][subkey] });
  return $state.get();
};

const appendSubkey = (key, subkey, value) => {
  $state.setKey(key, { ...$state.get()[key], [subkey]: [...$state.get()[key][subkey], value] });
  return $state.get();
};

export default {
  store,
  get,
  setKey,
  toggleKey,
  appendKey,
  setSubkey,
  toggleSubkey,
  appendSubkey
};
