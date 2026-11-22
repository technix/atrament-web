import { zipSync, strToU8 } from 'fflate';
import loader from '../src/interfaces/loader-web-fflate';
import { streamResponse, mockFetch } from './helpers';

let blobs;
let urlCounter;

beforeEach(() => {
  blobs = new Map();
  urlCounter = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    urlCounter += 1;
    const url = `blob:test/${urlCounter}`;
    blobs.set(url, blob);
    return url;
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    blobs.delete(url);
  });
});

function zipResponse(files) {
  const entries = Object.fromEntries(
    Object.entries(files).map(([name, content]) => [name, strToU8(content)])
  );
  return streamResponse([zipSync(entries)]);
}

describe('plain game', () => {
  beforeEach(async () => {
    await loader.init('games/demo');
  });

  it('resolves assets relative to the game path', () => {
    expect(loader.getAssetPath('img/cover.png')).toBe('games/demo/img/cover.png');
  });

  it('returns external assets unchanged', () => {
    expect(loader.getAssetPath('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(loader.getAssetPath('http://example.com/a.png')).toBe('http://example.com/a.png');
  });

  it('returns null for an empty filename', () => {
    expect(loader.getAssetPath('')).toBeNull();
    expect(loader.getAssetPath(null)).toBeNull();
    expect(loader.getAssetPath(undefined)).toBeNull();
  });

  it('loads a JSON ink story', async () => {
    const fetchMock = mockFetch(async () => streamResponse(['{"inkVersion":21}']));
    expect(await loader.loadInk('story.json')).toBe('{"inkVersion":21}');
    expect(fetchMock).toHaveBeenCalledWith('games/demo/story.json', expect.anything());
  });
});

describe('zip game', () => {
  beforeEach(async () => {
    mockFetch(async () => zipResponse({
      'story.json': '{"inkVersion":21}',
      'img/logo.svg': '<svg></svg>',
      'css/style.css': 'body{}',
      'Images/Photo.JPG': 'jpeg',
      README: 'readme',
      'empty/': ''
    }));
    await loader.init('games/demo.zip');
  });

  it('maps zip entries to blob URLs with an extension hint', () => {
    expect(loader.getAssetPath('img/logo.svg')).toMatch(/^blob:test\/\d+#file\.svg$/);
    expect(loader.getAssetPath('Images/Photo.JPG')).toMatch(/#file\.jpg$/);
  });

  it('omits the hash for files without an extension', () => {
    expect(loader.getAssetPath('README')).toMatch(/^blob:test\/\d+$/);
  });

  it('skips directory entries', () => {
    expect(loader.getAssetPath('empty/')).toBeNull();
    expect(blobs.size).toBe(5);
  });

  it('sets MIME types for SVG and CSS blobs', () => {
    const blobOf = (path) => blobs.get(loader.getAssetPath(path).split('#')[0]);
    expect(blobOf('img/logo.svg').type).toBe('image/svg+xml');
    expect(blobOf('css/style.css').type).toBe('text/css');
    expect(blobOf('Images/Photo.JPG').type).toBe('');
  });

  it('normalizes lookup paths', () => {
    const expected = loader.getAssetPath('img/logo.svg');
    expect(loader.getAssetPath('./img/logo.svg')).toBe(expected);
    expect(loader.getAssetPath('/img/logo.svg')).toBe(expected);
    expect(loader.getAssetPath('img\\logo.svg')).toBe(expected);
  });

  it('returns null for files missing from the zip', () => {
    expect(loader.getAssetPath('nope.png')).toBeNull();
  });

  it('throws when the ink file is missing', async () => {
    await expect(loader.loadInk('missing.json')).rejects.toThrow('Ink story file not found: missing.json');
  });

  it('loads the ink story from the zip', async () => {
    const storyURL = loader.getAssetPath('story.json');
    const fetchMock = mockFetch(async () => streamResponse([await blobs.get(storyURL.split('#')[0]).text()]));
    expect(await loader.loadInk('story.json')).toBe('{"inkVersion":21}');
    expect(fetchMock).toHaveBeenCalledWith(storyURL, expect.anything());
  });

  it('revokes blob URLs and clears content on re-init', async () => {
    URL.revokeObjectURL.mockClear();
    await loader.init('games/other');
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(5);
    expect(blobs.size).toBe(0);
    expect(loader.getAssetPath('img/logo.svg')).toBe('games/other/img/logo.svg');
  });
});

describe('zip entry normalization', () => {
  it('normalizes entry names with leading ./ or backslashes', async () => {
    mockFetch(async () => zipResponse({
      './a/b.txt': 'b',
      'c\\d.txt': 'd'
    }));
    await loader.init('game.zip');
    expect(loader.getAssetPath('a/b.txt')).toMatch(/#file\.txt$/);
    expect(loader.getAssetPath('c/d.txt')).toMatch(/#file\.txt$/);
  });
});

it('exposes onProgress', () => {
  expect(typeof loader.onProgress).toBe('function');
});
