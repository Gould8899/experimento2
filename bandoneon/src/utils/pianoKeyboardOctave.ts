import { Note } from 'tonal';

export const KEYBOARD_OCTAVE_MIN = 2;
export const KEYBOARD_OCTAVE_MAX = 6;

export function inferDefaultKeyboardBaseOctave(candidates: string[]): number {
  if (candidates.length === 0) return 4;

  const minMidi = Math.min(
    ...candidates.map((note) => Note.midi(note) ?? 60),
  );

  const inferred = Math.floor(minMidi / 12) - 1;
  return clampKeyboardBaseOctave(inferred);
}

export function clampKeyboardBaseOctave(octave: number): number {
  return Math.max(KEYBOARD_OCTAVE_MIN, Math.min(KEYBOARD_OCTAVE_MAX, octave));
}

export function keyboardOctaveShiftForTarget(
  handBaseOctave: number,
  targetBaseOctave: number,
): number {
  return clampKeyboardBaseOctave(targetBaseOctave) - handBaseOctave;
}
