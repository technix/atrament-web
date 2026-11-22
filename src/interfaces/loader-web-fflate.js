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
let $blobURLs = [];

// MIME types for zip assets that browsers won't render from an untyped blob
const MIME_TYPES = {
  svg: 'image/svg+xml',
  css: 'text/css'
};

function $getExtension(filename) {
  const match = /\.([^./]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : '';
}

// release blob URLs created for the previous zip game
function $revokeBlobURLs() {
  $blobURLs.forEach((url) => URL.revokeObjectURL(url));
  $blobURLs = [];
}

async function init(path) {
  $gameFileType = path.endsWith('.zip') ? 'zip' : 'plain';
  $gamePath = '';
  $revokeBlobURLs();
  $zipContent = {}; // clear zip content
  if ($gameFileType === 'zip') {
    const zipContent = await fetchWithProgress(path);
    const unzipped = unzipSync(zipContent);
    Object.entries(unzipped).forEach(([filepath, content]) => {
      if (filepath.endsWith('/')) {
        return;
      }
      const ext = $getExtension(filepath);
      const type = MIME_TYPES[ext] || '';
      const url = URL.createObjectURL(new Blob([content], { type }));
      $blobURLs.push(url);
      $zipContent[filepath] = ext ? `${url}#file.${ext}` : url;
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
