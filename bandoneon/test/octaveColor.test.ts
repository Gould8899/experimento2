import { describe, expect, it } from 'vitest';
import {
  octaveColorForNote,
  octaveColorMap,
  withHexAlpha,
} from '../src/utils/octaveColor';

describe('octaveColor', () => {
  it('maps notes to the shared octave palette', () => {
    expect(octaveColorForNote('C4')).toBe('#22c55e');
    expect(octaveColorForNote('C5')).toBe('#eab308');
    expect(octaveColorForNote('A#3')).toBe('#ef4444');
  });

  it('builds a note color map', () => {
    expect(octaveColorMap(['C4', 'D4'])).toEqual({
      C4: '#22c55e',
      D4: '#22c55e',
    });
  });

  it('appends alpha to hex colors', () => {
    expect(withHexAlpha('#22c55e', '80')).toBe('#22c55e80');
  });
});
