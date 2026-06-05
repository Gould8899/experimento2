import { Note } from 'tonal';
import {
  PIANO_LAYOUT_A_ORDER,
  PIANO_LAYOUT_C_ORDER,
  PIANO_LAYOUT_KEY_ALIASES,
  PIANO_LAYOUT_KEYS,
  type PianoLayoutKey,
} from '../constants/keyboardShortcuts';

export function isPianoLayoutKey(key: string): key is PianoLayoutKey {
  return key in PIANO_LAYOUT_KEYS || key in PIANO_LAYOUT_KEY_ALIASES;
}

export function normalizePianoLayoutKey(key: string): PianoLayoutKey | null {
  if (key in PIANO_LAYOUT_KEYS) {
    return key as PianoLayoutKey;
  }

  return PIANO_LAYOUT_KEY_ALIASES[key] ?? null;
}

export function resolveKeyboardNote(
  pitchClass: string,
  candidates: string[],
): string | null {
  if (candidates.length === 0) return null;

  const targetPc = Note.get(pitchClass).pc;
  if (!targetPc) return null;

  const matches = candidates.filter(
    (candidate) => Note.get(candidate).pc === targetPc,
  );

  if (matches.length === 0) return null;

  return matches[Math.floor(matches.length / 2)] ?? matches[0] ?? null;
}

export function resolveKeyboardNoteAtOctave(
  pitchClass: string,
  octave: number,
  candidates: string[],
): string | null {
  if (candidates.length === 0) return null;

  const targetPc = Note.get(pitchClass).pc;
  if (!targetPc) return null;

  const targetMidi = Note.midi(`${Note.get(pitchClass).name}${octave}`);
  if (targetMidi === null) return null;

  const matches = candidates.filter(
    (candidate) => Note.get(candidate).pc === targetPc,
  );

  if (matches.length === 0) return null;

  return matches.reduce((best, candidate) => {
    const bestDistance = Math.abs((Note.midi(best) ?? 0) - targetMidi);
    const candidateDistance = Math.abs(
      (Note.midi(candidate) ?? 0) - targetMidi,
    );

    return candidateDistance < bestDistance ? candidate : best;
  });
}

export function resolvePianoLayoutNote(
  key: PianoLayoutKey,
  candidates: string[],
  baseOctave: number,
): string | null {
  const layout = PIANO_LAYOUT_KEYS[key];
  const targetPc = Note.get(layout.pc).pc;
  if (!targetPc) return null;

  const aIndex = (PIANO_LAYOUT_A_ORDER as readonly PianoLayoutKey[]).indexOf(
    key,
  );
  const isA = aIndex >= 0;
  const semitoneOffset = isA
    ? aIndex
    : (PIANO_LAYOUT_C_ORDER as readonly PianoLayoutKey[]).indexOf(key);
  if (semitoneOffset < 0) return null;

  const anchor = isA ? 'A' : 'C';
  const anchorMidi = Note.midi(`${Note.get(anchor).name}${baseOctave}`);
  if (anchorMidi === null) return null;

  const targetMidi = anchorMidi + semitoneOffset;

  const exact = candidates.find(
    (candidate) =>
      Note.get(candidate).pc === targetPc && Note.midi(candidate) === targetMidi,
  );
  if (exact) return exact;

  const matches = candidates.filter(
    (candidate) => Note.get(candidate).pc === targetPc,
  );
  if (matches.length === 0) return null;

  return matches.reduce((best, candidate) => {
    const bestDistance = Math.abs((Note.midi(best) ?? 0) - targetMidi);
    const candidateDistance = Math.abs(
      (Note.midi(candidate) ?? 0) - targetMidi,
    );

    return candidateDistance < bestDistance ? candidate : best;
  });
}
