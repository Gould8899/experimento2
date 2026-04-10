import { defineStore } from 'pinia';
import { Note } from 'tonal';
import chords from '../data/chords';
import {
  getInstrumentKeys,
  instruments,
  normalizeChordType,
  type NoteMatrix,
  usesFormulaChordType,
} from '../data/index';
import rheinische142Layout from '../data/layouts/rheinische142';
import { useSettingsStore } from './settings';

// Central store for the currently visible side, direction and selected musical context.

function calculateFormulaPositions(keys: NoteMatrix) {
  const positions: [number, number, string][] = [];
  let offsetX = 0;
  let offsetY = 0;

  const cols = Math.max(...keys.map((row: string[]) => row.length));
  const rows = keys.reduce(
    (acc: number, row: string[]) => acc + (row.length > 0 ? 1 : 0),
    0,
  );
  if (cols < 9) offsetX += 39 * (9 - cols);
  if (rows < 6) offsetY -= 32 * (6 - rows);
  let gapX = 79;
  if (cols >= 10) gapX = 65; // TODO: improve calculation

  for (let row = 0; row < keys.length; row++) {
    for (let col = 0; col < keys[row].length; col++) {
      const tonal = keys[row][col];
      if (tonal) {
        const x = offsetX + col * gapX + 40 - (row % 2) * 40;
        const y =
          offsetY +
          row * 60 +
          (row / 2 + 1) * 15 * (1 - Math.sin(((x / 320) * Math.PI) / 2));
        positions.push([x, y, tonal]);
      }
    }
  }

  return positions;
}

function calculateExplicitPositions(
  keys: NoteMatrix,
  side: 'right' | 'left',
): [number, number, string][] | null {
  const layout = rheinische142Layout[side];
  const positions: [number, number, string][] = [];
  let index = 0;

  for (const row of keys) {
    for (const tonal of row) {
      if (!tonal) continue;

      const coordinates = layout[index];
      if (!coordinates) return null;

      positions.push([coordinates[0], coordinates[1], tonal]);
      index++;
    }
  }

  return index === layout.length ? positions : null;
}

const chordIntervals: Record<string, string[]> = {
  M: ['1P', '3M', '5P'],
  m: ['1P', '3m', '5P'],
  aug: ['1P', '3M', '5A'],
  dim: ['1P', '3m', '5d'],
  '7': ['1P', '3M', '5P', '7m'],
  m7: ['1P', '3m', '5P', '7m'],
  M7: ['1P', '3M', '5P', '7M'],
};

function buildChordFormula(tonic: string, chordType: string | null) {
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
    tonic: 'C' as null | string,
    chordType: null as null | string,
    scaleType: 'chromatic' as null | string,
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
      if (!this.tonic) this.tonic = 'C';
      this.scaleType = scaleType;
    },

    setChordType(chordType: string | null) {
      if (this.scaleType) this.scaleType = null;
      if (!this.tonic) this.tonic = 'C';
      this.chordType = chordType;
    },

    resetSearch() {
      this.side = 'right';
      this.direction = 'open';
      this.tonic = 'C';
      this.chordType = null;
      this.scaleType = 'chromatic';
      this.showEnharmonics = false;
      this.showColors = true;
      this.resetNonce += 1;
    },
  },
});
