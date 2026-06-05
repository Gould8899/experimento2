import { describe, expect, it } from 'vitest';
import { Note } from 'tonal';
import { getInstrumentNotesForSide } from '../src/data/index';
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

  it('resolves the La row from A chromatically', () => {
    expect(resolvePianoLayoutNote('<', candidates, 3)).toBe('A3');
    expect(resolvePianoLayoutNote('x', candidates, 3)).toBe('C4');
    expect(resolvePianoLayoutNote('m', candidates, 3)).toBe('A4');
  });

  it('does not jump an octave mid keyboard row', () => {
    const wide = [
      'G4',
      'G#4',
      'A4',
      'A#4',
      'B4',
      'C5',
      'C#5',
      'D5',
      'D#5',
    ];
    expect(resolvePianoLayoutNote('n', wide, 3)).toBe('G4');
    expect(resolvePianoLayoutNote('j', wide, 3)).toBe('G#4');
    expect(resolvePianoLayoutNote('m', wide, 3)).toBe('A4');
    expect(resolvePianoLayoutNote('.', wide, 3)).toBe('C5');
  });

  it('keeps the Do row chromatic between 6 and y', () => {
    const wide = [
      'G4',
      'G#4',
      'A4',
      'A#4',
      'B4',
      'C5',
      'C#5',
      'D5',
      'D#5',
    ];

    expect(resolvePianoLayoutNote('t', wide, 4)).toBe('G4');
    expect(resolvePianoLayoutNote('6', wide, 4)).toBe('G#4');
    expect(resolvePianoLayoutNote('y', wide, 4)).toBe('A4');
  });

  it('resolves the Do row up to Fa', () => {
    expect(resolvePianoLayoutNote('q', candidates, 3)).toBe('C4');
    expect(resolvePianoLayoutNote('r', candidates, 3)).toBe('F4');
    expect(resolvePianoLayoutNote('´', [...candidates, 'F4'], 3)).toBe('F4');
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
  it('centers the default base octave on the hand range', () => {
    expect(
      inferDefaultKeyboardBaseOctave(['A3', 'C4', 'E4', 'G4', 'B4']),
    ).toBe(4);
    expect(
      inferDefaultKeyboardBaseOctave(['C2', 'E2', 'G2', 'B2', 'D3']),
    ).toBe(2);
  });

  it('aligns the Do row with real instrument notes', () => {
    const candidates = getInstrumentNotesForSide('rheinische142', 'right');
    const base = inferDefaultKeyboardBaseOctave(candidates);

    const gSharp = resolvePianoLayoutNote('6', candidates, base);
    const a = resolvePianoLayoutNote('y', candidates, base);

    expect(gSharp).toBeTruthy();
    expect(a).toBeTruthy();
    expect(Note.midi(a!)).toBe((Note.midi(gSharp!) ?? 0) + 1);
  });
});
