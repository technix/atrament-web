/* global window, document */

export async function loadFromJSON(filename) {
  const response = await fetch(filename);
  return response;
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
  const response = {};
  try {
    await appendScript(filename);
    response.ok = true;
    response.text = () => JSON.stringify(window.storyContent);
  } catch (e) {
    console.error(e);
  }
  return response;
}
