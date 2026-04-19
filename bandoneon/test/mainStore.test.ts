import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../src/stores/main';

describe('main store interactions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('switches from chord to scale cleanly', () => {
    const store = useStore();

    store.tonic = null;
    store.chordType = 'm7';
    store.setScaleType('major');

    expect(store.tonic).toBe('C');
    expect(store.chordType).toBeNull();
    expect(store.scaleType).toBe('major');
  });

  it('switches from scale to chord cleanly', () => {
    const store = useStore();

    store.tonic = null;
    store.scaleType = 'minor';
    store.setChordType('7');

    expect(store.tonic).toBe('C');
    expect(store.scaleType).toBeNull();
    expect(store.chordType).toBe('7');
  });

  it('resets the musical workspace to defaults', () => {
    const store = useStore();

    store.side = 'left';
    store.direction = 'close';
    store.tonic = 'G';
    store.chordType = 'M7';
    store.scaleType = null;
    store.showColors = false;
    store.showEnharmonics = true;

    store.resetSearch();

    expect(store.side).toBe('right');
    expect(store.direction).toBe('open');
    expect(store.tonic).toBeNull();
    expect(store.chordType).toBeNull();
    expect(store.scaleType).toBeNull();
    expect(store.showColors).toBe(true);
    expect(store.showEnharmonics).toBe(false);
    expect(store.resetNonce).toBe(1);
  });

  it('starts from a clean workspace by default', () => {
    const store = useStore();

    expect(store.side).toBe('right');
    expect(store.direction).toBe('open');
    expect(store.tonic).toBeNull();
    expect(store.chordType).toBeNull();
    expect(store.scaleType).toBeNull();
    expect(store.showColors).toBe(true);
    expect(store.showEnharmonics).toBe(false);
  });

  it('builds diminished arpeggios as four symmetric notes', () => {
    const store = useStore();

    store.tonic = 'C';
    store.chordType = 'arp:dim';

    expect(store.chordFormulaNotes).toEqual(['C4', 'Eb4', 'Gb4', 'A4']);
  });
});
