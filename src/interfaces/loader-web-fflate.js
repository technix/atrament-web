import { unzip } from 'fflate';
import { loadFromJS, loadFromJSON, onProgress, fetchWithProgress } from './loader-common';

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
    await unzip(
      zipContent,
      (err, unzipped) => Object.entries(unzipped).forEach(([filepath, content]) => {
        $zipContent[filepath] = URL.createObjectURL(new Blob([content]));
      }));
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
  const inkScriptContent = await (fullpath.endsWith('js') ? loadFromJS(fullpath) : loadFromJSON(fullpath));
  return inkScriptContent;
}


export default {
  init,
  getAssetPath,
  loadInk,
  onProgress
};
