import { describe, expect, it } from 'vitest';
import {
  resolveKeyboardNote,
  resolveKeyboardNoteAtOctave,
  resolvePianoLayoutNote,
} from '../src/utils/keyboardNote';
import { inferDefaultKeyboardBaseOctave } from '../src/utils/pianoKeyboardOctave';

describe('keyboardNote', () => {
  const candidates = ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

  it('resolves a pitch class to an available instrument note', () => {
    expect(resolveKeyboardNote('E', candidates)).toBe('E4');
    expect(resolvePianoLayoutNote('v', candidates, 3)).toBe('E4');
  });

  it('resolves the La row from A', () => {
    expect(resolvePianoLayoutNote('<', candidates, 3)).toBe('A3');
    expect(resolvePianoLayoutNote('x', candidates, 3)).toBe('C4');
    expect(resolvePianoLayoutNote('m', candidates, 3)).toBe('A4');
  });

  it('resolves the Do row up to F#', () => {
    expect(resolvePianoLayoutNote('q', candidates, 3)).toBe('C4');
    expect(resolvePianoLayoutNote('r', candidates, 3)).toBe('F4');
    expect(resolvePianoLayoutNote('¿', [...candidates, 'F#4'], 3)).toBe('F#4');
  });

  it('resolves notes at a requested octave', () => {
    expect(resolveKeyboardNoteAtOctave('C', 4, candidates)).toBe('C4');
    expect(resolvePianoLayoutNote('i', candidates, 3)).toBe('C4');
  });

  it('returns null when the pitch is unavailable', () => {
    expect(resolvePianoLayoutNote('z', ['C4', 'D4'], 3)).toBeNull();
  });
});

describe('pianoKeyboardOctave', () => {
  it('anchors the base octave to the lower register of the hand', () => {
    expect(
      inferDefaultKeyboardBaseOctave(['A3', 'C4', 'E4', 'G4', 'B4']),
    ).toBe(3);
    expect(
      inferDefaultKeyboardBaseOctave(['C2', 'E2', 'G2', 'B2', 'D3']),
    ).toBe(2);
  });
});
