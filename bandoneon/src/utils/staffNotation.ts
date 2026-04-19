import { Note } from 'tonal';
import { scientificToHelmholtzNotation } from './helmholtz';
import { scientificToSolfegeNotation } from './solfege';

type PitchNotation = 'scientific' | 'helmholtz' | 'solfege';

export function resolveStaffDisplayNote(note: string, preferFlats: boolean) {
  const normalizedNote = preferFlats ? Note.enharmonic(note) : note;
  const parsed = Note.get(normalizedNote);

  return {
    normalizedNote,
    accidental: parsed.acc.replace('b', '♭').replace('#', '♯'),
  };
}

export function normalizeDisplayedNote(note: string, preferFlats: boolean) {
  return preferFlats ? Note.enharmonic(note) : note;
}

export function formatDisplayedNote(
  note: string,
  pitchNotation: PitchNotation,
  preferFlats: boolean,
  options?: { includeOctave?: boolean },
) {
  const includeOctave = options?.includeOctave ?? true;
  const normalizedNote = normalizeDisplayedNote(note, preferFlats);
  const parsed = Note.get(normalizedNote);

  if (parsed.empty) return note;

  if (pitchNotation === 'helmholtz') {
    return scientificToHelmholtzNotation(parsed.name);
  }

  if (pitchNotation === 'solfege') {
    const formatted = scientificToSolfegeNotation(parsed.name)
      .replace('b', '♭')
      .replace('#', '♯');

    return includeOctave ? formatted : formatted.replace(/[0-9]/g, '');
  }

  const scientific = parsed.name.replace('b', '♭').replace('#', '♯');
  return includeOctave ? scientific : scientific.replace(/[0-9]/g, '');
}
