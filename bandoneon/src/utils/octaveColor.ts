import { colors } from '../data/index';

export const OCTAVE_COLORS = colors;

export function octaveColorForNote(note: string): string {
  let octave = +note.slice(1);
  if (note[1] === '#') octave = +note.slice(2);
  return OCTAVE_COLORS[((octave % OCTAVE_COLORS.length) + OCTAVE_COLORS.length) % OCTAVE_COLORS.length]!;
}

export function octaveColorMap(notes: readonly string[]): Record<string, string> {
  return Object.fromEntries(notes.map((note) => [note, octaveColorForNote(note)]));
}

export function withHexAlpha(color: string, alpha: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return `${color}${alpha}`;
  }

  return color;
}
