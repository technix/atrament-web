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
    el.addEventListener('load', () => resolve(el));
    el.addEventListener('error', (e) => {
      el.remove();
      reject(e);
    });
    document.body.append(el);
  });
}

// Ink JS exports declare `var storyContent`, which creates a non-configurable
// global property; `delete` on it throws in strict mode, so fall back to
// resetting it to undefined.
function clearStoryContent() {
  try {
    delete window.storyContent;
  } catch {
    window.storyContent = undefined;
  }
}

export async function loadFromJS(filename) {
  clearStoryContent();
  let scriptElement;
  try {
    scriptElement = await appendScript(filename);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to fetch file: ${filename}`);
  }
  // remove temporary script element and storyContent variable
  scriptElement.remove();
  const { storyContent } = window;
  clearStoryContent();
  if (storyContent === undefined) {
    throw Error(`Ink script does not define storyContent: ${filename}`);
  }
  try {
    return JSON.stringify(storyContent);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to parse Ink script: ${filename}`);
  }
}

export async function fetchWithProgress(path) {
  const response = await fetch(path, { responseType: 'arraybuffer' });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch file: ${path}. Error ${response.status} ${errorBody}`);
  }
  const reader = response.body.getReader();
  const headerLength = Number(response.headers.get('Content-Length'));
  const contentLength = Number.isFinite(headerLength) && headerLength > 0 ? headerLength : null;
  const chunks = [];
  let receivedLength = 0;
  for (;;) {
    const { done, value } = await reader.read(); // eslint-disable-line no-await-in-loop
    if (done) {
      break;
    }
    chunks.push(value);
    receivedLength += value.length;
    const percent = contentLength === null
      ? null
      : Math.min(100, Math.round((receivedLength * 100) / contentLength));
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
