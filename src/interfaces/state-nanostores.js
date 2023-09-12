import { map, action } from 'nanostores';

const atramentState = map({
  settings: {},
  game: {},
  metadata: {},
  scenes: [],
  vars: {}
});

function store() {
  return atramentState;
}

function get() {
  return atramentState.get();
}

const setKey = action(atramentState, 'setKey', (s, key, value) => {
  s.setKey(key, value);
  return s.get();
});

const toggleKey = action(atramentState, 'toggleKey', (s, key) => {
  s.setKey(key, !s.get()[key]);
  return s.get();
});

const appendKey = action(atramentState, 'appendKey', (s, key, value) => {
  s.setKey(key, [...s.get()[key], value]);
  return s.get();
});

const setSubkey = action(atramentState, 'setSubkey', (s, key, subkey, value) => {
  s.setKey(key, { ...s.get()[key], [subkey]: value });
  return s.get();
});

const toggleSubkey = action(atramentState, 'toggleSubkey', (s, key, subkey) => {
  s.setKey(key, { ...s.get()[key], [subkey]: !s.get()[key][subkey] });
  return s.get();
});

const appendSubkey = action(atramentState, 'appendSubkey', (s, key, subkey, value) => {
  s.setKey(key, { ...s.get()[key], [subkey]: [...s.get()[key][subkey], value] });
  return s.get();
});

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
