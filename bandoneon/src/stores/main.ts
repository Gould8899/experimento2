import { defineStore } from 'pinia';
import { Note } from 'tonal';
import chords from '../data/chords';
import {
  getInstrumentKeys,
  instruments,
  normalizeChordType,
  usesFormulaChordType,
} from '../data/index';
import {
  calculateExplicitPositions,
  calculateFormulaPositions,
} from '../utils/keyboardLayout';
import { scaleTypeUsesTonic } from '../utils/scaleType';
import { useSettingsStore } from './settings';

// Central store for the currently visible side, direction and selected musical context.

// Interval formulas used to build chord notes on-the-fly for voicings that are
// not stored in the chord data table (arpeggios, augmented, and any future
// formula-driven chord types).
// NOTE: the same intervals also exist in utils/tonality.ts (tonalChordIntervals)
// for key-signature resolution.  Both copies are intentional: tonality.ts drives
// staff key-signature logic while this copy drives note highlighting on the keys.
// If the interval definitions ever diverge they should be extracted to a shared
// constant in data/index.ts.

const chordIntervals: Record<string, string[]> = {
  M: ['1P', '3M', '5P'],
  m: ['1P', '3m', '5P'],
  aug: ['1P', '3M', '5A'],
  dim: ['1P', '3m', '5d'],
  'arp:dim': ['1P', '3m', '5d', '7d'],
  '7': ['1P', '3M', '5P', '7m'],
  m7: ['1P', '3m', '5P', '7m'],
  M7: ['1P', '3M', '5P', '7M'],
};

function buildChordFormula(tonic: string, chordType: string | null) {
  if (chordType && chordIntervals[chordType]) {
    return chordIntervals[chordType].map((interval) =>
      Note.simplify(Note.transpose(`${tonic}4`, interval)),
    );
  }

  const normalizedChordType = normalizeChordType(chordType);
  if (!normalizedChordType) return [];

  const intervals = chordIntervals[normalizedChordType];
  if (!intervals) return [];

  return intervals.map((interval) =>
    Note.simplify(Note.transpose(`${tonic}4`, interval)),
  );
}

function getChordPitchClasses(notes: string[]) {
  return new Set(
    notes
      .map((note) => Note.get(note).chroma)
      .filter((chroma): chroma is number => typeof chroma === 'number'),
  );
}

export const useStore = defineStore('main', {
  state: () => ({
    showColors: true,
    showEnharmonics: false,
    side: 'right' as 'right' | 'left',
    direction: 'open' as 'open' | 'close',
    tonic: null as null | string,
    chordType: null as null | string,
    scaleType: 'white-keys' as null | string,
    resetNonce: 0,
  }),

  getters: {
    chordName(state) {
      if (state.tonic && state.chordType) {
        return `${state.tonic}${state.chordType}`;
      }
      return null;
    },

    chordFormulaNotes(): string[] {
      if (!this.tonic || !this.chordType) return [];
      return buildChordFormula(this.tonic, this.chordType);
    },

    chordNotes(): string[] {
      const settings = useSettingsStore();

      if (this.side && this.direction && this.chordName) {
        if (usesFormulaChordType(this.chordType)) {
          const pitchClasses = getChordPitchClasses(
            buildChordFormula(this.tonic ?? 'C', this.chordType),
          );

          return this.keyPositions
            .map(([, , note]) => note)
            .filter((note) => {
              const chroma = Note.get(note).chroma;
              return typeof chroma === 'number' && pitchClasses.has(chroma);
            });
        }

        const sideUserChords = settings.userChords[this.side];

        if (sideUserChords && sideUserChords[this.chordName]) {
          return sideUserChords[this.chordName];
        }

        return chords[`${this.side}-${this.direction}`][this.chordName] ?? [];
      }
      return [];
    },

    isUserChord() {
      const settings = useSettingsStore();

      if (this.side && this.direction && this.chordName) {
        const sideUserChords = settings.userChords[this.side];

        if (sideUserChords && sideUserChords[this.chordName]) return true;
      }
      return false;
    },

    keyPositions(state): [number, number, string][] {
      const settings = useSettingsStore();

      if (!settings.instrument) return [];

      const keys = getInstrumentKeys(
        instruments[settings.instrument],
        state.side,
        state.direction,
      );

      if (!keys) return [];

      if (settings.instrument === 'rheinische142') {
        const explicitPositions = calculateExplicitPositions(keys, state.side);
        if (explicitPositions) return explicitPositions;
      }

      return calculateFormulaPositions(keys);
    },
  },

  actions: {
    setTonic(tonic: string | null) {
      if (tonic) {
        this.tonic = tonic;
      } else {
        this.resetSearch();
      }
    },

    setScaleType(scaleType: string | null) {
      if (this.chordType) this.chordType = null;
      if (!this.tonic && scaleTypeUsesTonic(scaleType)) this.tonic = 'C';
      this.scaleType = scaleType;
    },

    setChordType(chordType: string | null) {
      if (this.scaleType) this.scaleType = null;
      if (!this.tonic) this.tonic = 'C';
      this.chordType = chordType;
    },

    resetSearch() {
      this.direction = 'open';
      this.tonic = null;
      this.chordType = null;
      this.scaleType = 'white-keys';
      this.showEnharmonics = false;
      this.showColors = true;
      this.resetNonce += 1;
    },
  },
});
