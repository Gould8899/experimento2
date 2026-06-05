import { OCTAVE_COLORS } from '../utils/octaveColor';

/** Shared piano keyboard palette — keep in sync with bandoneon octave guides. */
export const PIANO_THEME = {
  keyboardBg: '#050505',
  inactiveHand: '#050505',
  inactiveHandEdge: '#050505',
  inactiveLabel: 'rgba(255,255,255,0.2)',
  blackKeyBody: '#101010',
  blackKeySelected: '#080808',
  keySeparator: 'rgba(0,0,0,0.14)',
  focusRing: 'rgba(255,255,255,0.92)',
  mutedStripeLight:
    'repeating-linear-gradient(-45deg, #b8b8b8 0, #b8b8b8 3px, #d9d9d9 3px, #d9d9d9 6px)',
  mutedStripeDark:
    'repeating-linear-gradient(-45deg, #3a3a40 0, #3a3a40 3px, #4a4a52 3px, #4a4a52 6px)',
  mutedBorderLight: '#9ca3af',
  mutedBorderDark: '#52525b',
  legendSelected: OCTAVE_COLORS[3] ?? '#ef4444',
  legendPlayable: OCTAVE_COLORS[0] ?? '#22c55e',
} as const;
