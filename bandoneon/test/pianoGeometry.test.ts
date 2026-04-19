import { describe, expect, it } from 'vitest';
import { resolvePointedPianoNote } from '../src/utils/pianoGeometry';

const whiteKeys = [
  { note: 'C4', left: 0, width: 1 / 7 },
  { note: 'D4', left: 1 / 7, width: 1 / 7 },
  { note: 'E4', left: 2 / 7, width: 1 / 7 },
  { note: 'F4', left: 3 / 7, width: 1 / 7 },
  { note: 'G4', left: 4 / 7, width: 1 / 7 },
  { note: 'A4', left: 5 / 7, width: 1 / 7 },
  { note: 'B4', left: 6 / 7, width: 1 / 7 },
];

const blackKeys = [
  { note: 'C#4', left: 1 / 7 - 0.33 / 7, width: 0.64 / 7 },
  { note: 'D#4', left: 2 / 7 - 0.33 / 7, width: 0.64 / 7 },
  { note: 'F#4', left: 4 / 7 - 0.33 / 7, width: 0.64 / 7 },
];

describe('piano geometry helpers', () => {
  it('prefers black keys when the pointer is inside their area', () => {
    expect(
      resolvePointedPianoNote({
        xRatio: 0.12,
        yRatio: 0.2,
        whiteKeys,
        blackKeys,
      }),
    ).toBe('C#4');
  });

  it('falls back to the underlying white key when the pointer is outside black keys', () => {
    expect(
      resolvePointedPianoNote({
        xRatio: 0.38,
        yRatio: 0.15,
        whiteKeys,
        blackKeys,
      }),
    ).toBe('E4');
  });

  it('clamps pointer positions at the keyboard edges', () => {
    expect(
      resolvePointedPianoNote({
        xRatio: -0.2,
        yRatio: 0.8,
        whiteKeys,
        blackKeys,
      }),
    ).toBe('C4');
    expect(
      resolvePointedPianoNote({
        xRatio: 1.2,
        yRatio: 0.8,
        whiteKeys,
        blackKeys,
      }),
    ).toBe('B4');
  });

  it('returns null outside bounds when clamping is disabled', () => {
    expect(
      resolvePointedPianoNote({
        xRatio: -0.02,
        yRatio: 0.4,
        whiteKeys,
        blackKeys,
        clampToBounds: false,
      }),
    ).toBeNull();
    expect(
      resolvePointedPianoNote({
        xRatio: 0.4,
        yRatio: 1.04,
        whiteKeys,
        blackKeys,
        clampToBounds: false,
      }),
    ).toBeNull();
  });
});
