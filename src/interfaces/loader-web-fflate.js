/* eslint-disable no-await-in-loop */

import { unzip } from 'fflate';

import { loadFromJS, loadFromJSON } from './loader-common';

let $gameFileType = 'plain';
let $gamePath = '';
let $zipContent = {};

let $onProgress = () => {};

async function fetchWithProgress(path) {
  const response = await fetch(path, { responseType: 'arraybuffer' });
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  const chunks = [];
  let receivedLength = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    receivedLength += value.length;
    const percent = Math.round((receivedLength * 100) / contentLength);
    $onProgress({ percent, receivedLength, contentLength });
  }
  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  chunks.forEach((chunk) => {
    chunksAll.set(chunk, position);
    position += chunk.length;
  });
  return chunksAll;
}

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

function onProgress(cb) {
  $onProgress = cb;
}

export default {
  init,
  getAssetPath,
  loadInk,
  onProgress
};
