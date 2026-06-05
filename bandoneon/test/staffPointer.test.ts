import { describe, expect, it } from 'vitest';
import {
  handForStaff,
  hitStaffDisplayNote,
  isPointInStaffArea,
  matchStaffPointerNote,
  resolveStaffFromY,
  resolveStaffPitchFromY,
  staffForHand,
  staffForNoteRegister,
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

  it('maps staff and hand helpers', () => {
    expect(staffForHand('right')).toBe('treble');
    expect(staffForHand('left')).toBe('bass');
    expect(handForStaff('treble')).toBe('right');
    expect(handForStaff('bass')).toBe('left');
  });

  it('places notes on treble or bass by register', () => {
    expect(staffForNoteRegister('B3')).toBe('bass');
    expect(staffForNoteRegister('C4')).toBe('treble');
    expect(staffForNoteRegister('G4')).toBe('treble');
  });

  it('resolves treble vs bass from vertical position', () => {
    const trebleY = staffY('G4', 'treble');
    const bassY = staffY('G2', 'bass');

    expect(resolveStaffFromY(trebleY, ['G4'], ['G2'])).toBe('treble');
    expect(resolveStaffFromY(bassY, ['G4'], ['G2'])).toBe('bass');
  });

  it('prefers bass in overlap when the bass note is closer', () => {
    const y = staffY('B5', 'bass');

    expect(
      resolveStaffFromY(y, ['G4', 'A4'], ['B5', 'G5'], 'bass'),
    ).toBe('bass');
  });

  it('hits an existing displayed note head before empty-staff matching', () => {
    const hit = hitStaffDisplayNote(500, staffY('G4', 'treble'), 'treble', [
      { note: 'G4', x: 500, y: staffY('G4', 'treble'), staff: 'treble' },
      { note: 'A4', x: 540, y: staffY('A4', 'treble'), staff: 'treble' },
    ]);

    expect(hit?.note).toBe('G4');
  });

  it('returns null when the click misses every note head', () => {
    const hit = hitStaffDisplayNote(
      500,
      staffY('G4', 'treble') + 40,
      'treble',
      [{ note: 'G4', x: 500, y: staffY('G4', 'treble'), staff: 'treble' }],
    );

    expect(hit).toBeNull();
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
