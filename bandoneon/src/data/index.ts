import einheitsbandonion144 from './instruments/einheitsbandonion144';
import einheitskonzertina128 from './instruments/einheitskonzertina128';
import manouri148 from './instruments/manouri148';
import peguri146 from './instruments/peguri146';
import rheinische142 from './instruments/rheinische142';
import rheinische152 from './instruments/rheinische152';

// Musical datasets and shared type helpers used across pages and stores.
export type KeyboardSide = 'right' | 'left';
export type BellowsDirection = 'open' | 'close';
export type NoteMatrix = string[][];
export type BisonoricLayout = Record<BellowsDirection, NoteMatrix>;
export type InstrumentSideLayout = NoteMatrix | BisonoricLayout;
export type Instrument = Record<KeyboardSide, InstrumentSideLayout>;

export const instruments: Record<string, Instrument> = {
  rheinische142,
  rheinische152,
  einheitsbandonion144,
  peguri146,
  manouri148,
  einheitskonzertina128,
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

export const difficulties = <Array<'easy' | 'medium'>>['easy', 'medium'];

export const pitchNotations = <Array<'scientific' | 'helmholtz' | 'solfege'>>[
  'scientific',
  'helmholtz',
  'solfege',
];

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

export const scaleTypes = ['major', 'minor', 'chromatic'];

export const chordTypes = ['M', 'm', '7', 'dim', 'm7', 'M7'];

export const colors = [
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#0ea5e9', // sky-500
  '#ef4444', // red-500
];
