let state;

beforeEach(async () => {
  vi.resetModules();
  state = (await import('../src/interfaces/state-nanostores')).default;
});

describe('state-nanostores', () => {
  it('has the initial state', () => {
    expect(state.get()).toEqual({
      settings: {},
      game: {},
      metadata: {},
      scenes: [],
      vars: {}
    });
  });

  it('exposes the nanostores store', () => {
    const store = state.store();
    expect(typeof store.subscribe).toBe('function');
    expect(store.get()).toBe(state.get());
  });

  it('setKey sets a value and returns the state', () => {
    const result = state.setKey('game', { title: 'Demo' });
    expect(result.game).toEqual({ title: 'Demo' });
    expect(state.get().game).toEqual({ title: 'Demo' });
  });

  it('toggleKey toggles a boolean', () => {
    expect(state.toggleKey('flag').flag).toBe(true);
    expect(state.toggleKey('flag').flag).toBe(false);
  });

  it('appendKey appends to an array immutably', () => {
    const before = state.get().scenes;
    state.appendKey('scenes', 'a');
    state.appendKey('scenes', 'b');
    expect(state.get().scenes).toEqual(['a', 'b']);
    expect(before).toEqual([]);
  });

  it('setSubkey sets a nested value immutably', () => {
    state.setSubkey('vars', 'gold', 10);
    const before = state.get().vars;
    state.setSubkey('vars', 'hp', 5);
    expect(state.get().vars).toEqual({ gold: 10, hp: 5 });
    expect(before).toEqual({ gold: 10 });
  });

  it('toggleSubkey toggles a nested boolean', () => {
    expect(state.toggleSubkey('settings', 'mute').settings.mute).toBe(true);
    expect(state.toggleSubkey('settings', 'mute').settings.mute).toBe(false);
  });

  it('appendSubkey appends to a nested array', () => {
    state.setSubkey('vars', 'items', []);
    state.appendSubkey('vars', 'items', 'sword');
    state.appendSubkey('vars', 'items', 'shield');
    expect(state.get().vars.items).toEqual(['sword', 'shield']);
  });

  it('notifies subscribers on change', () => {
    const listener = vi.fn();
    const unsubscribe = state.store().listen(listener);
    state.setKey('game', { a: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
