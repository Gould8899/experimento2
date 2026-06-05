import { Note } from 'tonal';

export const KEYBOARD_OCTAVE_MIN = 2;
export const KEYBOARD_OCTAVE_MAX = 6;

/** Semitone index of La (A) on the Do-row layout — used to center the span. */
const KEYBOARD_ROW_CENTER_SEMITONE = 9;

export function inferDefaultKeyboardBaseOctave(candidates: string[]): number {
  if (candidates.length === 0) return 4;

  const midis = candidates.map((note) => Note.midi(note) ?? 60);
  const centerMidi = (Math.min(...midis) + Math.max(...midis)) / 2;

  // Place Do-row key `y` (A, +9 semitones) near the hand's pitch center.
  const inferred =
    Math.round((centerMidi - KEYBOARD_ROW_CENTER_SEMITONE) / 12) - 1;
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
