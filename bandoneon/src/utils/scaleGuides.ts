import { Note } from 'tonal';
import { OCTAVE_COLORS } from '../utils/octaveColor';

export function noteOctave(note: string): number {
  return Note.get(note).oct ?? 4;
}

export function guideColorForOctave(octave: number): string {
  const index =
    ((octave % OCTAVE_COLORS.length) + OCTAVE_COLORS.length) %
    OCTAVE_COLORS.length;
  return OCTAVE_COLORS[index] ?? OCTAVE_COLORS[0]!;
}

export function groupNotesByOctave(notes: string[]): Map<number, string[]> {
  const groups = new Map<number, string[]>();

  for (const note of notes) {
    const octave = noteOctave(note);
    const list = groups.get(octave) ?? [];
    list.push(note);
    groups.set(octave, list);
  }

  return groups;
}

export type ScaleGuidePath = {
  octave: number;
  stroke: string;
  d: string;
};

export function buildContinuousScaleGuidePath(
  notes: string[],
  buildPath: (notes: string[]) => string | null,
): ScaleGuidePath | null {
  if (notes.length === 0) return null;

  const d = buildPath(notes);
  if (!d) return null;

  const octave = noteOctave(notes[0]!);
  return {
    octave,
    stroke: guideColorForOctave(octave),
    d,
  };
}
