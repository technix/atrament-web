// Builds a fetch Response that streams the given chunks.
export function streamResponse(chunks, { status = 200, contentLength } = {}) {
  const encoder = new TextEncoder();
  const data = chunks.map((c) => (typeof c === 'string' ? encoder.encode(c) : c));
  const stream = new ReadableStream({
    start(controller) {
      data.forEach((c) => controller.enqueue(c));
      controller.close();
    }
  });
  const headers = {};
  if (contentLength !== undefined) {
    headers['Content-Length'] = String(contentLength);
  }
  return new Response(stream, { status, headers });
}

export function mockFetch(impl) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// In-memory replacement for window.Neutralino.storage.
export function createNeutralinoStorage() {
  const data = new Map();
  return {
    data,
    getData: vi.fn(async (key) => {
      if (!data.has(key)) {
        const error = new Error('Storage key not found');
        error.code = 'NE_ST_NOSTKEX';
        throw error;
      }
      return data.get(key);
    }),
    setData: vi.fn(async (key, value) => {
      if (value === null) {
        data.delete(key);
      } else {
        data.set(key, value);
      }
    })
  };
}
