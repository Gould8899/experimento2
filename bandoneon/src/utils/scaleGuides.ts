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

export function buildColoredScaleGuidePaths(
  notes: string[],
  buildPath: (octaveNotes: string[]) => string | null,
): ScaleGuidePath[] {
  if (notes.length === 0) return [];

  return [...groupNotesByOctave(notes).entries()]
    .sort((left, right) => left[0] - right[0])
    .flatMap(([octave, octaveNotes]) => {
      const path = buildPath(octaveNotes);
      if (!path) return [];

      return [
        {
          octave,
          stroke: guideColorForOctave(octave),
          d: path,
        },
      ];
    });
}
