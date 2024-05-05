let $gamePath = '';

async function init(path) {
  $gamePath = path;
}

function getAssetPath(filename) {
  return `${$gamePath}/${filename}`;
}

async function loadInk(filename) {
  const response = await fetch(getAssetPath(filename));
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
