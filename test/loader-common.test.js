import {
  fetchWithProgress,
  loadFromJSON,
  loadFromJS,
  appendScript,
  onProgress
} from '../src/interfaces/loader-common';
import { streamResponse, mockFetch } from './helpers';

// Simulates the browser loading a <script>: runs `onLoad` and fires
// the given event once the element is appended to the document body.
function simulateScriptLoad(event = 'load', onLoad = () => {}) {
  const originalAppend = document.body.append.bind(document.body);
  return vi.spyOn(document.body, 'append').mockImplementation((el) => {
    originalAppend(el);
    setTimeout(() => {
      onLoad(el);
      el.dispatchEvent(new Event(event));
    });
  });
}

beforeEach(() => {
  onProgress(() => {});
  document.body.innerHTML = '';
  delete window.storyContent;
});

describe('fetchWithProgress', () => {
  it('concatenates streamed chunks', async () => {
    mockFetch(async () => streamResponse([
      'ab',
      'cd',
      'e'
    ]));
    const result = await fetchWithProgress('file.bin');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(result)).toBe('abcde');
  });

  it('reports progress percentages when Content-Length is known', async () => {
    mockFetch(async () => streamResponse(['ab', 'cd'], { contentLength: 4 }));
    const progress = vi.fn();
    onProgress(progress);
    await fetchWithProgress('file.bin');
    const first = { percent: 50, receivedLength: 2, contentLength: 4 };
    const second = { percent: 100, receivedLength: 4, contentLength: 4 };
    expect(progress.mock.calls.map(([p]) => p)).toEqual([first, second]);
  });

  it('caps percent at 100 when Content-Length is understated', async () => {
    mockFetch(async () => streamResponse(['abcd'], { contentLength: 2 }));
    const progress = vi.fn();
    onProgress(progress);
    await fetchWithProgress('file.bin');
    expect(progress).toHaveBeenCalledWith({ percent: 100, receivedLength: 4, contentLength: 2 });
  });

  it('reports null percent when Content-Length is missing', async () => {
    mockFetch(async () => streamResponse(['abc']));
    const progress = vi.fn();
    onProgress(progress);
    await fetchWithProgress('file.bin');
    expect(progress).toHaveBeenCalledWith({
      percent: null,
      receivedLength: 3,
      contentLength: null
    });
  });

  it('throws with status and body on a failed response', async () => {
    mockFetch(async () => streamResponse(['Not found'], { status: 404 }));
    await expect(fetchWithProgress('missing.bin'))
      .rejects.toThrow('Failed to fetch file: missing.bin. Error 404 Not found');
  });
});

describe('loadFromJSON', () => {
  it('returns decoded UTF-8 text', async () => {
    mockFetch(async () => streamResponse(['{"text":"привіт"}']));
    expect(await loadFromJSON('story.json')).toBe('{"text":"привіт"}');
  });
});

describe('appendScript', () => {
  it('resolves with the script element on load', async () => {
    simulateScriptLoad('load');
    const el = await appendScript('script.js');
    expect(el.tagName).toBe('SCRIPT');
    expect(el.getAttribute('src')).toBe('script.js');
    expect(document.body.contains(el)).toBe(true);
  });

  it('rejects and removes the element on error', async () => {
    simulateScriptLoad('error');
    await expect(appendScript('script.js')).rejects.toBeInstanceOf(Event);
    expect(document.querySelector('script')).toBeNull();
  });
});

describe('loadFromJS', () => {
  it('returns storyContent as JSON and cleans up', async () => {
    simulateScriptLoad('load', () => {
      window.storyContent = { inkVersion: 21, root: [] };
    });
    const result = await loadFromJS('story.js');
    expect(JSON.parse(result)).toEqual({ inkVersion: 21, root: [] });
    expect(window.storyContent).toBeUndefined();
    expect(document.querySelector('script')).toBeNull();
  });

  it('clears a stale storyContent before loading', async () => {
    window.storyContent = { stale: true };
    simulateScriptLoad('load');
    await expect(loadFromJS('story.js'))
      .rejects.toThrow('Ink script does not define storyContent: story.js');
  });

  it('throws when the script fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    simulateScriptLoad('error');
    await expect(loadFromJS('story.js')).rejects.toThrow('Failed to fetch file: story.js');
  });

  it('throws when storyContent cannot be serialized', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    simulateScriptLoad('load', () => {
      const circular = {};
      circular.self = circular;
      window.storyContent = circular;
    });
    await expect(loadFromJS('story.js')).rejects.toThrow('Failed to parse Ink script: story.js');
  });
});
