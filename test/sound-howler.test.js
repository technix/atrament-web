const howls = [];

vi.mock('howler/src/howler.core', () => {
  class Howl {
    constructor(options) {
      this.options = options;
      this.isPlaying = false;
      this.loadState = 'loaded';
      this.vol = 1;
      this.loopValue = options.loop ?? false;
      this.play = vi.fn(() => { this.isPlaying = true; });
      this.stop = vi.fn(() => { this.isPlaying = false; });
      this.unload = vi.fn();
      this.playing = vi.fn(() => this.isPlaying);
      this.state = vi.fn(() => this.loadState);
      this.fade = vi.fn();
      this.loop = vi.fn((v) => { this.loopValue = v; });
      this.volume = vi.fn((v) => {
        if (v !== undefined) this.vol = v;
        return this.vol;
      });
      howls.push(this);
    }
  }
  const Howler = {
    _muted: false,
    _volume: 1,
    mute: vi.fn((state) => { Howler._muted = state; }), // eslint-disable-line no-underscore-dangle
    volume: vi.fn((v) => {
      if (v !== undefined) Howler._volume = v; // eslint-disable-line no-underscore-dangle
      return Howler._volume; // eslint-disable-line no-underscore-dangle
    })
  };
  return { Howl, Howler };
});

let sound;

beforeEach(async () => {
  howls.length = 0;
  vi.resetModules();
  sound = (await import('../src/interfaces/sound-howler')).default;
});

describe('volume and mute', () => {
  it('init applies mute and volume', () => {
    sound.init({ mute: true, volume: 40 });
    expect(sound.isMuted()).toBe(true);
    expect(sound.getVolume()).toBeCloseTo(40);
  });

  it('init unmutes unless mute is strictly true', () => {
    sound.init({ mute: 'yes', volume: 100 });
    expect(sound.isMuted()).toBe(false);
  });

  it('mute defaults to true', () => {
    sound.mute(false);
    expect(sound.isMuted()).toBe(false);
    sound.mute();
    expect(sound.isMuted()).toBe(true);
  });

  it('converts volume between 0-100 and 0-1', async () => {
    const { Howler } = await import('howler/src/howler.core');
    sound.setVolume(25);
    expect(Howler.volume).toHaveBeenLastCalledWith(0.25);
    expect(sound.getVolume()).toBeCloseTo(25);
  });
});

describe('sounds', () => {
  it('creates a Howl once per file and plays it', () => {
    sound.playSound('a.mp3');
    sound.playSound('a.mp3');
    expect(howls).toHaveLength(1);
    expect(howls[0].options).toEqual({ src: ['a.mp3'] });
    expect(howls[0].play).toHaveBeenCalledTimes(2);
  });

  it('stops a single sound', () => {
    sound.playSound('a.mp3');
    sound.playSound('b.mp3');
    sound.stopSound('a.mp3');
    expect(howls[0].stop).toHaveBeenCalled();
    expect(howls[1].stop).not.toHaveBeenCalled();
  });

  it('stops all sounds', () => {
    sound.playSound('a.mp3');
    sound.playSound('b.mp3');
    sound.stopSound();
    howls.forEach((h) => expect(h.stop).toHaveBeenCalled());
  });

  it('ignores stopping an unknown sound', () => {
    expect(() => sound.stopSound('unknown.mp3')).not.toThrow();
  });

  it('fades out a playing sound and restores its volume', () => {
    sound.playSound('a.mp3');
    const howl = howls[0];
    howl.vol = 0.7;
    sound.stopSound('a.mp3');
    expect(howl.fade).toHaveBeenCalledWith(0.7, 0, 1);
    expect(howl.vol).toBe(0.7);
  });

  it('does not fade a sound that is not playing', () => {
    sound.playSound('a.mp3');
    howls[0].isPlaying = false;
    sound.stopSound('a.mp3');
    expect(howls[0].fade).not.toHaveBeenCalled();
    expect(howls[0].stop).toHaveBeenCalled();
  });
});

describe('music', () => {
  it('creates a streaming looped Howl by default', () => {
    sound.playMusic('m.mp3');
    expect(howls[0].options).toEqual({ src: ['m.mp3'], html5: true, loop: true });
    expect(howls[0].play).toHaveBeenCalledTimes(1);
  });

  it('respects the loop parameter', () => {
    sound.playMusic('m.mp3', false);
    expect(howls[0].loop).toHaveBeenCalledWith(false);
  });

  it('does not restart music that is already playing', () => {
    sound.playMusic('m.mp3');
    sound.playMusic('m.mp3');
    expect(howls).toHaveLength(1);
    expect(howls[0].play).toHaveBeenCalledTimes(1);
  });

  it('does not queue play twice while loading', () => {
    sound.playMusic('m.mp3');
    howls[0].isPlaying = false;
    howls[0].loadState = 'loading';
    sound.playMusic('m.mp3');
    expect(howls[0].play).toHaveBeenCalledTimes(1);
  });

  it('updates loop on an already cached track', () => {
    sound.playMusic('m.mp3', true);
    sound.playMusic('m.mp3', false);
    expect(howls[0].loopValue).toBe(false);
  });

  it('stops and unloads a single track', () => {
    sound.playMusic('a.mp3');
    sound.playMusic('b.mp3');
    sound.stopMusic('a.mp3');
    expect(howls[0].stop).toHaveBeenCalled();
    expect(howls[0].unload).toHaveBeenCalled();
    expect(howls[1].unload).not.toHaveBeenCalled();
    sound.playMusic('a.mp3');
    expect(howls).toHaveLength(3); // re-created after unload
  });

  it('stops and unloads all tracks', () => {
    sound.playMusic('a.mp3');
    sound.playMusic('b.mp3');
    sound.stopMusic();
    howls.forEach((h) => expect(h.unload).toHaveBeenCalled());
  });

  it('ignores stopping unknown music', () => {
    expect(() => sound.stopMusic('unknown.mp3')).not.toThrow();
  });
});

describe('reset', () => {
  it('unloads all sounds and music and clears caches', () => {
    sound.playSound('s.mp3');
    sound.playMusic('m.mp3');
    sound.reset();
    howls.forEach((h) => expect(h.unload).toHaveBeenCalled());
    sound.playSound('s.mp3');
    sound.playMusic('m.mp3');
    expect(howls).toHaveLength(4);
  });
});
