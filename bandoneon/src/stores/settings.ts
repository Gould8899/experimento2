import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  DEFAULT_INSTRUMENT,
  type InstrumentName,
  type KeyboardSide,
} from '../data/index';

// Persisted user preferences that shape the UI independently from the current musical session.
export const availableLocaleCodes = ['en', 'de', 'es'] as const;

export type AppLocale = (typeof availableLocaleCodes)[number];
type ViewMode = 'real' | 'flat';
type PitchNotation = 'scientific' | 'helmholtz' | 'solfege';
type Difficulty = 'medium' | 'easy';
type UserChordMap = Partial<Record<KeyboardSide, Record<string, string[]>>>;
type SoundEnabled = boolean;

export function isSupportedLocale(value: string): value is AppLocale {
  return availableLocaleCodes.includes(value as AppLocale);
}

function getDefaultLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en';

  const browserLocale = navigator.language?.split('-')[0] || 'en';
  return isSupportedLocale(browserLocale) ? browserLocale : 'en';
}

export const useSettingsStore = defineStore('settings', () => {
  const instrument = ref<InstrumentName>(DEFAULT_INSTRUMENT);
  const locale = ref<AppLocale>(getDefaultLocale());
  const viewMode = ref<ViewMode>('real');
  const pitchNotation = ref<PitchNotation>('scientific');
  const userChords = ref<UserChordMap>({});
  const difficulty = ref<Difficulty>('medium');
  const soundEnabled = ref<SoundEnabled>(true);

  function saveUserChord(
    side: KeyboardSide,
    chordName: string,
    notes: string[],
  ) {
    if (!userChords.value[side]) userChords.value[side] = {};
    userChords.value[side][chordName] = [...notes];
  }

  function resetUserChord(side: KeyboardSide, chordName: string) {
    if (userChords.value[side]) delete userChords.value[side][chordName];
  }

  return {
    instrument,
    locale,
    viewMode,
    pitchNotation,
    userChords,
    difficulty,
    soundEnabled,
    saveUserChord,
    resetUserChord,
  };
});
