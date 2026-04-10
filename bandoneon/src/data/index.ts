import { Note } from 'tonal';
import rheinische142 from './instruments/rheinische142';

// Musical datasets and shared type helpers used across pages and stores.
export type KeyboardSide = 'right' | 'left';
export type BellowsDirection = 'open' | 'close';
export type NoteMatrix = string[][];
export type BisonoricLayout = Record<BellowsDirection, NoteMatrix>;
export type InstrumentSideLayout = NoteMatrix | BisonoricLayout;
export type Instrument = Record<KeyboardSide, InstrumentSideLayout>;

export const instruments: Record<string, Instrument> = {
  rheinische142,
};

export type InstrumentName = keyof typeof instruments;

export const DEFAULT_INSTRUMENT: InstrumentName = 'rheinische142';
export const instrumentNames = Object.keys(instruments) as InstrumentName[];

export function getInstrumentKeys(
  instrument: Instrument,
  side: KeyboardSide,
  direction: BellowsDirection,
): NoteMatrix {
  const layout = instrument[side];
  return Array.isArray(layout) ? layout : layout[direction];
}

function flattenNoteMatrix(layout: NoteMatrix) {
  return layout.flatMap((row) => row.filter(Boolean));
}

export function getAllInstrumentNotes(instrumentName: InstrumentName) {
  const instrument = instruments[instrumentName];
  const seen = new Set<string>();

  for (const side of ['left', 'right'] as const) {
    const sideLayout = instrument[side];
    const matrices = Array.isArray(sideLayout)
      ? [sideLayout]
      : [sideLayout.open, sideLayout.close];

    for (const matrix of matrices) {
      for (const note of flattenNoteMatrix(matrix)) {
        seen.add(note);
      }
    }
  }

  return [...seen].sort((left, right) => {
    const leftMidi = Note.midi(left) ?? 0;
    const rightMidi = Note.midi(right) ?? 0;
    return leftMidi - rightMidi;
  });
}

export function getInstrumentNotesForSide(
  instrumentName: InstrumentName,
  side: KeyboardSide,
) {
  const instrument = instruments[instrumentName];
  const sideLayout = instrument[side];
  const matrices = Array.isArray(sideLayout)
    ? [sideLayout]
    : [sideLayout.open, sideLayout.close];
  const seen = new Set<string>();

  for (const matrix of matrices) {
    for (const note of flattenNoteMatrix(matrix)) {
      seen.add(note);
    }
  }

  return [...seen].sort((left, right) => {
    const leftMidi = Note.midi(left) ?? 0;
    const rightMidi = Note.midi(right) ?? 0;
    return leftMidi - rightMidi;
  });
}

export const instrumentFullNoteRange =
  getAllInstrumentNotes(DEFAULT_INSTRUMENT);

export const difficulties = <Array<'easy' | 'medium'>>['easy', 'medium'];

export const pitchNotations = <Array<'scientific' | 'helmholtz' | 'solfege'>>[
  'scientific',
  'helmholtz',
  'solfege',
];

export type ScaleTypeOption = {
  value: string;
  label: string;
};

export type HarmonicTypeOption = {
  value: string;
  label?: string;
  text?: string;
};

export const notes = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const scaleTypes: ScaleTypeOption[] = [
  { value: 'chromatic', label: 'chromatic' },
  { value: 'whole tone', label: 'whole_tone' },
  { value: 'diminished', label: 'whole_half_diminished' },
  { value: 'augmented', label: 'augmented_tone_semitone' },
  { value: 'major', label: 'major' },
  { value: 'minor', label: 'minor' },
];

export const chordTypes: HarmonicTypeOption[] = [
  { value: 'M', label: 'major' },
  { value: 'm', label: 'minor' },
  { value: 'aug', label: 'augmented' },
  { value: 'dim', label: 'diminished' },
  { value: '7', text: '7' },
  { value: 'm7', text: 'm7' },
  { value: 'M7', text: 'M7' },
];

export const arpeggioTypes: HarmonicTypeOption[] = [
  { value: 'arp:M', label: 'arpeggio_major' },
  { value: 'arp:m', label: 'arpeggio_minor' },
  { value: 'arp:aug', label: 'arpeggio_augmented' },
  { value: 'arp:dim', label: 'arpeggio_diminished' },
];

export const harmonicTypes: HarmonicTypeOption[] = [
  ...arpeggioTypes,
  ...chordTypes,
];

export function isArpeggioType(chordType: string | null) {
  return Boolean(chordType?.startsWith('arp:'));
}

export function normalizeChordType(chordType: string | null) {
  if (!chordType) return null;
  return chordType.startsWith('arp:') ? chordType.slice(4) : chordType;
}

export function usesFormulaChordType(chordType: string | null) {
  return isArpeggioType(chordType) || normalizeChordType(chordType) === 'aug';
}

export function findHarmonicType(chordType: string | null) {
  if (!chordType) return null;
  return harmonicTypes.find((item) => item.value === chordType) ?? null;
}

export const colors = [
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#0ea5e9', // sky-500
  '#ef4444', // red-500
];
