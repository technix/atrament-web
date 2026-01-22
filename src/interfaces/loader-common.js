/* global window, document */

let $onProgress = () => {};

export async function loadFromJSON(filename) {
  const JSONContent = await fetchWithProgress(filename);
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(JSONContent);
}

export async function appendScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.addEventListener('load', resolve);
    el.addEventListener('error', reject);
    document.body.append(el);
  });
}

export async function loadFromJS(filename) {
  let inkscript = '';
  try {
    await appendScript(filename);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to fetch file: ${filename}`);
  }
  try {
    inkscript = JSON.stringify(window.storyContent);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to parse Ink script: ${filename}`);
  }
  return inkscript;
}

export async function fetchWithProgress(path) {
  const response = await fetch(path, { responseType: 'arraybuffer' });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch file: ${path}. Error ${response.status} ${errorBody}`);
  }
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  const chunks = [];
  let receivedLength = 0;
  for (;;) {
    const { done, value } = await reader.read(); // eslint-disable-line no-await-in-loop
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

export function onProgress(cb) {
  $onProgress = cb;
}
