import { loadFromJS, loadFromJSON } from './loader-common';

let $gamePath = '';

async function init(path) {
  $gamePath = path;
}

function getAssetPath(filename) {
  return `${$gamePath}/${filename}`;
}

async function loadInk(filename) {
  const fullpath = getAssetPath(filename);
  const response = await (fullpath.endsWith('js') ? loadFromJS(fullpath) : loadFromJSON(fullpath));
  if (response.ok) {
    return response.text();
  }
  throw new Error(`Failed to load ink file: ${filename}`);
}

export default {
  init,
  getAssetPath,
  loadInk
};
