import { Note } from 'tonal';

// Maps Tonal's chromatic step index (0 = C, 1 = D … 6 = B) to the Spanish/Italian
// solfege syllable.  The order must stay aligned with the diatonic steps C D E F G A B.
const SOLFEGE_SYLLABLES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;

// Converts a scientific pitch name (e.g. "C#4") to solfege notation (e.g. "Do#4").
export function scientificToSolfegeNotation(str: string): string {
  const n = Note.get(str);
  if (n.empty) return '';
  const { step, acc, oct } = n;
  return (
    SOLFEGE_SYLLABLES[step] + acc + (typeof oct !== 'undefined' ? oct : '')
  );
}
