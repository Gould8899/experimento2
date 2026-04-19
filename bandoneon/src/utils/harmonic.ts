import { Note } from 'tonal';
import { getScalePitchClasses } from './scaleType';

export function getPitchClasses(notes: string[]) {
  return new Set(
    notes
      .map((note) => Note.get(note).chroma)
      .filter((chroma): chroma is number => typeof chroma === 'number'),
  );
}

export function buildScalePitchClasses(
  tonic: string | null,
  scaleType: string | null,
) {
  return getScalePitchClasses(tonic, scaleType);
}

export function buildHarmonicPitchClasses({
  tonic,
  scaleType,
  chordFormulaNotes,
}: {
  tonic: string | null;
  scaleType: string | null;
  chordFormulaNotes: string[];
}) {
  const scalePitchClasses = buildScalePitchClasses(tonic, scaleType);
  if (scalePitchClasses.size > 0) return scalePitchClasses;

  return getPitchClasses(chordFormulaNotes);
}

export function noteMatchesPitchClasses(
  note: string,
  pitchClasses: Set<number>,
) {
  if (pitchClasses.size === 0) return false;

  const chroma = Note.get(note).chroma;
  return typeof chroma === 'number' && pitchClasses.has(chroma);
}
