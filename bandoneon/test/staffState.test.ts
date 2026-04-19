import { describe, expect, it } from 'vitest';
import {
  appendRecentPlaybackNotes,
  resolveStaffState,
  takeRecentPlaybackNotes,
} from '../src/utils/staffState';

describe('staffState helpers', () => {
  it('keeps only the latest recent playback notes', () => {
    expect(
      takeRecentPlaybackNotes([
        'G3',
        'A3',
        'B3',
        'C4',
        'D4',
        'E4',
        'F4',
        'G4',
        'A4',
        'B4',
        'C5',
        'D5',
        'E5',
        'F5',
        'G5',
        'A5',
      ]),
    ).toEqual([
      'G3',
      'A3',
      'B3',
      'C4',
      'D4',
      'E4',
      'F4',
      'G4',
      'A4',
      'B4',
      'C5',
      'D5',
      'E5',
      'F5',
      'G5',
      'A5',
    ]);
  });

  it('appends separate played notes preserving their order', () => {
    const played = appendRecentPlaybackNotes(['D4'], ['G#4', 'A4']);

    expect(played).toEqual(['D4', 'G#4', 'A4']);
  });

  it('keeps a longer melodic history when appending notes', () => {
    const played = appendRecentPlaybackNotes(
      [
        'C4',
        'D4',
        'E4',
        'F4',
        'G4',
        'A4',
        'B4',
        'C5',
        'D5',
        'E5',
        'F5',
        'G5',
        'A5',
        'B5',
        'C6',
      ],
      ['D6', 'E6'],
    );

    expect(played).toEqual([
      'D4',
      'E4',
      'F4',
      'G4',
      'A4',
      'B4',
      'C5',
      'D5',
      'E5',
      'F5',
      'G5',
      'A5',
      'B5',
      'C6',
      'D6',
      'E6',
    ]);
  });

  it('prioritizes the most recent playback over tonic fallback', () => {
    const state = resolveStaffState({
      gestureActive: false,
      gestureTrace: [],
      isModified: false,
      userSelection: {},
      recentPlaybackNotes: ['G4', 'B4'],
      chordNotes: [],
      chordFormulaNotes: [],
      chordType: null,
      usesFormulaChordSelection: false,
      tonic: 'C',
      scaleType: null,
      preferFlats: false,
    });

    expect(state).toEqual({ notes: ['G4', 'B4'], source: 'recent' });
  });

  it('prioritizes recent played order over sorted manual notes', () => {
    const state = resolveStaffState({
      gestureActive: false,
      gestureTrace: [],
      isModified: true,
      userSelection: { G4: true, C4: true, E4: true },
      recentPlaybackNotes: ['D4', 'G#4', 'A4'],
      chordNotes: [],
      chordFormulaNotes: [],
      chordType: null,
      usesFormulaChordSelection: false,
      tonic: 'D',
      scaleType: null,
      preferFlats: false,
    });

    expect(state).toEqual({
      notes: ['D4', 'G#4', 'A4'],
      source: 'recent',
    });
  });

  it('returns white-key notes for the special piano-key scale', () => {
    const state = resolveStaffState({
      gestureActive: false,
      gestureTrace: [],
      isModified: false,
      userSelection: {},
      recentPlaybackNotes: [],
      chordNotes: [],
      chordFormulaNotes: [],
      chordType: null,
      usesFormulaChordSelection: false,
      tonic: null,
      scaleType: 'white-keys',
      preferFlats: false,
    });

    expect(state).toEqual({
      notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
      source: 'scale',
    });
  });

  it('spells tonal arpeggios canonically for the staff when using formulas', () => {
    const state = resolveStaffState({
      gestureActive: false,
      gestureTrace: [],
      isModified: false,
      userSelection: {},
      recentPlaybackNotes: [],
      chordNotes: ['D#4', 'G4', 'A#4'],
      chordFormulaNotes: ['D#4', 'G4', 'A#4'],
      chordType: 'arp:M',
      usesFormulaChordSelection: true,
      tonic: 'D#',
      scaleType: null,
      preferFlats: true,
    });

    expect(state).toEqual({
      notes: ['Eb4', 'G4', 'Bb4'],
      source: 'voicing',
    });
  });
});
