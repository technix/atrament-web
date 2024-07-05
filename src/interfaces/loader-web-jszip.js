import JSZip from 'jszip';

import { loadFromJS, loadFromJSON } from './loader-common';

let $gameFileType = 'plain';
let $gamePath = '';
let $zipContent = {};

async function $handleFile(path, entry) {
  if (entry.dir) {
    return;
  }
  const content = await entry.async('blob');
  const dataUrl = URL.createObjectURL(content);
  $zipContent[path] = dataUrl;
}

async function init(path) {
  if (path.endsWith('.zip')) {
    $gameFileType = 'zip';
  }
  if ($gameFileType === 'zip') {
    $zipContent = {}; // clear zip content
    const response = await fetch(path, { responseType: 'arraybuffer' });
    const zipFileContent = await JSZip.loadAsync(response.arrayBuffer());
    const fileHandlers = [];
    zipFileContent.forEach((relativePath, content) => {
      fileHandlers.push($handleFile(relativePath, content));
    });
    await Promise.all(fileHandlers);
  } else {
    $gamePath = path;
  }
}

function getAssetPath(filename) {
  if ($gameFileType === 'zip') {
    return $zipContent[filename];
  }
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
