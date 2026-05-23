import { Note } from 'tonal';

// Converts a scientific pitch name (e.g. "C#4") to Helmholtz notation (e.g. "c♯′").
// Helmholtz convention:
//   - Octaves 0-2 → uppercase + comma suffixes  (C,, C, C)
//   - Octave 3    → uppercase, no suffix         (C)
//   - Octave 4+   → lowercase + prime suffixes   (c  c′  c″ …)
export function scientificToHelmholtzNotation(str: string): string {
  const n = Note.get(str);
  if (n.empty || (!n.oct && n.oct !== 0)) return '';

  const { letter, acc, oct } = n;

  const formattedAccidental =
    acc[0] === 'b' ? acc.replace(/b/g, '♭') : acc.replace(/#/g, '♯');

  const formattedLetter = oct > 2 ? letter.toLowerCase() : letter;

  const octaveMarker =
    oct === 3 ? '' : oct > 2 ? '\u2032'.repeat(oct - 3) : ','.repeat(2 - oct);

  return formattedLetter + formattedAccidental + octaveMarker;
}
