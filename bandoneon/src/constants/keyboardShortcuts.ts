import { Note } from 'tonal';

export type PianoLayoutEntry = {
  pc: string;
  octaveOffset: number;
};

function entry(pc: string, octaveOffset = 0): PianoLayoutEntry {
  return { pc, octaveOffset };
}

/** Chromatic row starting on La (A). */
export const PIANO_LAYOUT_A_KEYS = {
  '<': entry('A'),
  a: entry('A#'),
  z: entry('B'),
  x: entry('C'),
  d: entry('C#'),
  c: entry('D'),
  f: entry('D#'),
  v: entry('E'),
  b: entry('F'),
  h: entry('F#'),
  n: entry('G'),
  j: entry('G#'),
  m: entry('A', 1),
  k: entry('A#', 1),
  ',': entry('B', 1),
  l: entry('C', 1),
  '.': entry('C#', 1),
  ñ: entry('D', 1),
  '-': entry('D#', 1),
} as const satisfies Record<string, PianoLayoutEntry>;

/** Chromatic row starting on Do (C) up to Fa# (F#). */
export const PIANO_LAYOUT_C_KEYS = {
  q: entry('C'),
  '2': entry('C#'),
  w: entry('D'),
  '3': entry('D#'),
  e: entry('E'),
  r: entry('F'),
  '5': entry('F#'),
  t: entry('G'),
  '6': entry('G#'),
  y: entry('A'),
  '7': entry('A#'),
  u: entry('B'),
  i: entry('C', 1),
  '9': entry('C#', 1),
  o: entry('D', 1),
  '0': entry('D#', 1),
  p: entry('E', 1),
  '´': entry('F', 1),
  '¿': entry('F#', 1),
} as const satisfies Record<string, PianoLayoutEntry>;

export const PIANO_LAYOUT_KEYS = {
  ...PIANO_LAYOUT_A_KEYS,
  ...PIANO_LAYOUT_C_KEYS,
} as const;

export type PianoLayoutKey = keyof typeof PIANO_LAYOUT_KEYS;

export const PIANO_LAYOUT_KEY_ALIASES: Record<string, PianoLayoutKey> = {
  Ñ: 'ñ',
  "'": '´',
  '`': '´',
  Dead: '´',
};

export type PianoShortcutKeyDisplay = {
  key: PianoLayoutKey;
  displayKey: string;
  pitchClass: string;
  isBlack: boolean;
  whiteIndex: number;
};

function isBlackPitchClass(pitchClass: string) {
  return Boolean(Note.get(pitchClass).acc);
}

export const PIANO_LAYOUT_A_ORDER = [
  '<',
  'a',
  'z',
  'x',
  'd',
  'c',
  'f',
  'v',
  'b',
  'h',
  'n',
  'j',
  'm',
  'k',
  ',',
  'l',
  '.',
  'ñ',
  '-',
] as const satisfies readonly PianoLayoutKey[];

export const PIANO_LAYOUT_C_ORDER = [
  'q',
  '2',
  'w',
  '3',
  'e',
  'r',
  '5',
  't',
  '6',
  'y',
  '7',
  'u',
  'i',
  '9',
  'o',
  '0',
  'p',
  '´',
  '¿',
] as const satisfies readonly PianoLayoutKey[];

function buildPianoVisualLayout(
  order: readonly PianoLayoutKey[],
): {
  whiteKeys: PianoShortcutKeyDisplay[];
  blackKeys: PianoShortcutKeyDisplay[];
  whiteKeyCount: number;
} {
  const whiteKeys: PianoShortcutKeyDisplay[] = [];
  const blackKeys: PianoShortcutKeyDisplay[] = [];
  let whiteCursor = 0;

  for (const key of order) {
    const layout = PIANO_LAYOUT_KEYS[key];
    const pitchClass = layout.pc;
    const isBlack = isBlackPitchClass(pitchClass);

    if (isBlack) {
      blackKeys.push({
        key,
        displayKey: key,
        pitchClass,
        isBlack,
        whiteIndex: whiteCursor - 0.35,
      });
      continue;
    }

    whiteKeys.push({
      key,
      displayKey: key,
      pitchClass,
      isBlack,
      whiteIndex: whiteCursor,
    });
    whiteCursor += 1;
  }

  return { whiteKeys, blackKeys, whiteKeyCount: whiteCursor };
}

export const PIANO_SHORTCUT_LAYOUTS = [
  {
    id: 'a',
    labelKey: 'shortcut_piano_row_a',
    ...buildPianoVisualLayout(PIANO_LAYOUT_A_ORDER),
  },
  {
    id: 'c',
    labelKey: 'shortcut_piano_row_c',
    ...buildPianoVisualLayout(PIANO_LAYOUT_C_ORDER),
  },
] as const;

/** Scales use Shift + number row so they never overlap piano keys. */
export const SCALE_SHORTCUT_KEYS = [
  { code: 'Digit1', value: 'white-keys', labelKey: 'white_keys' },
  { code: 'Digit2', value: 'black-keys', labelKey: 'black_keys' },
  { code: 'Digit3', value: 'major', labelKey: 'major' },
  { code: 'Digit4', value: 'minor', labelKey: 'minor' },
  { code: 'Digit5', value: 'chromatic', labelKey: 'chromatic' },
  { code: 'Digit6', value: 'whole tone', labelKey: 'whole_tone' },
  { code: 'Digit7', value: 'diminished', labelKey: 'diminished' },
  { code: 'Digit8', value: 'augmented', labelKey: 'augmented' },
] as const;

export const ARPEGGIO_SHORTCUT_KEYS = [
  { key: '[', value: 'arp:M', labelKey: 'arpeggio_major' },
  { key: ']', value: 'arp:m', labelKey: 'arpeggio_minor' },
  { key: '\\', value: 'arp:dim', labelKey: 'arpeggio_diminished' },
  { key: '=', value: 'arp:aug', labelKey: 'arpeggio_augmented' },
] as const;

export type ShortcutRow = {
  keys: string;
  labelKey: string;
};

export const WORKSPACE_SHORTCUT_ROWS: ShortcutRow[] = [
  { keys: '← →', labelKey: 'shortcut_hand_lr' },
  { keys: '↑ ↓', labelKey: 'shortcut_bellows_ud' },
  { keys: 'Shift+1 … Shift+8', labelKey: 'shortcut_scales' },
  { keys: '[ ] \\ =', labelKey: 'shortcut_arpeggios' },
  { keys: '{ }', labelKey: 'shortcut_octave_ud' },
  { keys: 'Esc', labelKey: 'shortcut_escape' },
  { keys: '?', labelKey: 'shortcut_open_settings' },
];
