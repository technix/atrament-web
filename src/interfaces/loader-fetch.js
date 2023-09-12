async function load(path) {
  const response = await fetch(path);
  return response.text();
}

export default {
  load
};
