async function load(path) {
  const response = await fetch(path);
  if (response.ok) {
    return response.text();
  }
  throw new Error(`Failed to load ink file: ${path}`);
}

export default {
  load
};
