import { describe, expect, it } from 'vitest';
import {
  formatDisplayedNote,
  resolveStaffDisplayNote,
} from '../src/utils/staffNotation';

describe('staff notation helpers', () => {
  it('keeps sharps when flat preference is disabled', () => {
    expect(resolveStaffDisplayNote('A#4', false)).toEqual({
      normalizedNote: 'A#4',
      accidental: '♯',
    });
  });

  it('converts enharmonic notes to flats when flat preference is enabled', () => {
    expect(resolveStaffDisplayNote('A#4', true)).toEqual({
      normalizedNote: 'Bb4',
      accidental: '♭',
    });
  });

  it('formats scientific labels with flats when requested', () => {
    expect(formatDisplayedNote('A#4', 'scientific', true)).toBe('B♭4');
    expect(
      formatDisplayedNote('A#4', 'scientific', true, { includeOctave: false }),
    ).toBe('B♭');
  });

  it('formats solfege labels with flats when requested', () => {
    expect(formatDisplayedNote('A#4', 'solfege', true)).toBe('Si♭4');
  });
});
