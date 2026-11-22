import { unzipSync } from 'fflate';
import {
  loadFromJS,
  loadFromJSON,
  onProgress,
  fetchWithProgress
} from './loader-common';

let $gameFileType = 'plain';
let $gamePath = '';
let $zipContent = {};

async function init(path) {
  if (path.endsWith('.zip')) {
    $gameFileType = 'zip';
  }
  if ($gameFileType === 'zip') {
    $zipContent = {}; // clear zip content
    const zipContent = await fetchWithProgress(path);
    const unzipped = unzipSync(zipContent);
    Object.entries(unzipped).forEach(([filepath, content]) => {
      $zipContent[filepath] = URL.createObjectURL(new Blob([content]));
    });
  } else {
    $gamePath = path;
  }
}

function getAssetPath(filename) {
  if (!filename) {
    return null;
  }
  const asset = `${filename}`;
  if (asset.startsWith('http://') || asset.startsWith('https://')) {
    // an external asset
    return asset;
  }
  if ($gameFileType === 'zip') {
    return $zipContent[asset];
  }
  return `${$gamePath}/${asset}`;
}

async function loadInk(filename) {
  const fullpath = getAssetPath(filename);
  if (!fullpath) {
    throw new Error(`Ink story file not found: ${filename}`);
  }
  const isJS = filename.endsWith('.js');
  const inkScriptContent = await (isJS ? loadFromJS(fullpath) : loadFromJSON(fullpath));
  return inkScriptContent;
}

export default {
  init,
  getAssetPath,
  loadInk,
  onProgress
};
