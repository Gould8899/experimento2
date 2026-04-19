import { describe, expect, it } from 'vitest';
import {
  buildHarmonicPitchClasses,
  buildScalePitchClasses,
  noteMatchesPitchClasses,
} from '../src/utils/harmonic';

describe('harmonic helpers', () => {
  it('builds pitch classes for scales', () => {
    expect(
      [...buildScalePitchClasses('C', 'major')].sort((a, b) => a - b),
    ).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('builds pitch classes for white piano keys', () => {
    expect(
      [...buildScalePitchClasses(null, 'white-keys')].sort((a, b) => a - b),
    ).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('builds pitch classes for black piano keys', () => {
    expect(
      [...buildScalePitchClasses(null, 'black-keys')].sort((a, b) => a - b),
    ).toEqual([1, 3, 6, 8, 10]);
  });

  it('falls back to chord formula notes when no scale is active', () => {
    expect(
      [
        ...buildHarmonicPitchClasses({
          tonic: 'C',
          scaleType: null,
          chordFormulaNotes: ['C4', 'E4', 'G4'],
        }),
      ].sort((a, b) => a - b),
    ).toEqual([0, 4, 7]);
  });

  it('matches notes against the active pitch classes', () => {
    const pitchClasses = buildHarmonicPitchClasses({
      tonic: 'A',
      scaleType: 'major',
      chordFormulaNotes: [],
    });

    expect(noteMatchesPitchClasses('A4', pitchClasses)).toBe(true);
    expect(noteMatchesPitchClasses('C5', pitchClasses)).toBe(false);
  });
});
