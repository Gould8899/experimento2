import { describe, expect, it } from 'vitest';
import {
  chordTypes,
  chordUiEnabled,
  findHarmonicType,
} from '../src/data/index';

describe('harmonic configuration', () => {
  it('keeps chord UI disabled in the current edition', () => {
    expect(chordUiEnabled).toBe(false);
  });

  it('preserves harmonic lookups while the chord UI is hidden', () => {
    expect(chordTypes).toHaveLength(7);
    expect(findHarmonicType('arp:M')?.value).toBe('arp:M');
    expect(findHarmonicType('M7')?.value).toBe('M7');
  });
});
