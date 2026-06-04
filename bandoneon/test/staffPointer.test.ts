import { describe, expect, it } from 'vitest';
import {
  isPointInStaffArea,
  matchStaffPointerNote,
  resolveStaffPitchFromY,
  staffInteractionBounds,
  staffY,
} from '../src/utils/staffPointer';

describe('staffPointer', () => {
  it('round-trips treble staff positions', () => {
    const note = 'C5';
    const y = staffY(note, 'treble');
    expect(resolveStaffPitchFromY(y, 'treble')).toBe(note);
  });

  it('round-trips bass staff positions', () => {
    const note = 'C3';
    const y = staffY(note, 'bass');
    expect(resolveStaffPitchFromY(y, 'bass')).toBe(note);
  });

  it('picks the closest playable note by vertical staff position', () => {
    const y = staffY('G4', 'treble');
    const matched = matchStaffPointerNote({
      x: 500,
      y,
      staff: 'treble',
      playableNotes: ['F#4', 'G4', 'A4'],
    });

    expect(matched).toBe('G4');
  });

  it('matches notes on ledger lines above the staff', () => {
    const playableNotes = ['A5', 'B5', 'C6'];
    const y = staffY('C6', 'treble');
    const bounds = staffInteractionBounds('treble', playableNotes);

    expect(y).toBeLessThan(bounds.top + 40);
    expect(
      isPointInStaffArea(500, y, 'treble', playableNotes),
    ).toBe(true);
    expect(
      matchStaffPointerNote({
        x: 500,
        y,
        staff: 'treble',
        playableNotes,
      }),
    ).toBe('C6');
  });

  it('matches notes on ledger lines below the bass staff', () => {
    const playableNotes = ['C2', 'D2', 'E2'];
    const y = staffY('C2', 'bass');
    const bounds = staffInteractionBounds('bass', playableNotes);

    expect(y).toBeGreaterThan(bounds.bottom - 40);
    expect(
      matchStaffPointerNote({
        x: 500,
        y,
        staff: 'bass',
        playableNotes,
      }),
    ).toBe('C2');
  });

  it('returns null when the click is far from any playable note', () => {
    const y = staffY('C5', 'treble');
    const matched = matchStaffPointerNote({
      x: 500,
      y: y - 80,
      staff: 'treble',
      playableNotes: ['C3', 'D3'],
    });

    expect(matched).toBeNull();
  });
});
