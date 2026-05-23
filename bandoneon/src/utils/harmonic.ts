import { Note } from 'tonal';
import { getScalePitchClasses } from './scaleType';

// Extracts the set of chroma values (0–11) from an array of full note names.
// Used to compare notes by pitch class independently of octave.
export function getPitchClasses(notes: string[]) {
  return new Set(
    notes
      .map((note) => Note.get(note).chroma)
      .filter((chroma): chroma is number => typeof chroma === 'number'),
  );
}

// Thin alias kept for call-site clarity: builds pitch classes from a tonic + scale type.
// Delegates entirely to scaleType.getScalePitchClasses.
export function buildScalePitchClasses(
  tonic: string | null,
  scaleType: string | null,
) {
  return getScalePitchClasses(tonic, scaleType);
}

// Returns the active pitch classes for harmonic highlighting.
// Priority: scale pitch classes first; if none (no scale selected), falls back to
// the chord formula pitch classes so arpeggios also drive the key colouring.
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

// Returns true if the given note's pitch class is present in the provided set.
export function noteMatchesPitchClasses(
  note: string,
  pitchClasses: Set<number>,
) {
  if (pitchClasses.size === 0) return false;

  const chroma = Note.get(note).chroma;
  return typeof chroma === 'number' && pitchClasses.has(chroma);
}
