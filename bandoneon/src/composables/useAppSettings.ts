import { useI18n } from 'petite-vue-i18n';
import { watchEffect } from 'vue';
import { difficulties, pitchNotations } from '../data/index';
import {
  isSupportedLocale,
  useSettingsStore,
  type AppLocale,
} from '../stores/settings';

const SETTINGS_STORAGE_KEY = 'settings';
const viewModes = ['real', 'flat'] as const;
const soundModes = ['short', 'sustain'] as const;

type SettingsState = ReturnType<typeof useSettingsStore>['$state'];
type PersistedSettings = Omit<SettingsState, 'instrument'>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isOneOf<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): value is T {
  return typeof value === 'string' && allowedValues.includes(value as T);
}

function sanitizeUserChords(
  value: unknown,
): PersistedSettings['userChords'] | null {
  if (!isPlainObject(value)) return null;

  const sanitized: PersistedSettings['userChords'] = {};

  for (const side of ['left', 'right'] as const) {
    const sideValue = value[side];
    if (!isPlainObject(sideValue)) continue;

    const sanitizedSide: Record<string, string[]> = {};

    for (const [chordName, notes] of Object.entries(sideValue)) {
      if (typeof chordName === 'string' && isStringArray(notes)) {
        sanitizedSide[chordName] = notes;
      }
    }

    if (Object.keys(sanitizedSide).length > 0) {
      sanitized[side] = sanitizedSide;
    }
  }

  return sanitized;
}

function readStoredSettings() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(SETTINGS_STORAGE_KEY);
}

function clearStoredSettings() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

export function serializeSettings(state: SettingsState): PersistedSettings {
  return {
    locale: state.locale,
    viewMode: state.viewMode,
    pitchNotation: state.pitchNotation,
    userChords: state.userChords,
    difficulty: state.difficulty,
    soundEnabled: state.soundEnabled,
    soundMode: state.soundMode,
    showScaleGuides: state.showScaleGuides,
  };
}

function persistSettings(state: SettingsState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(serializeSettings(state)),
  );
}

export function parseStoredSettings(rawSettings: string | null) {
  if (!rawSettings) return null;

  try {
    const parsed = JSON.parse(rawSettings) as unknown;
    if (!isPlainObject(parsed)) {
      clearStoredSettings();
      return null;
    }

    const restoredSettings = parsed as Record<string, unknown>;
    const sanitizedSettings: Partial<PersistedSettings> = {};

    if (isSupportedLocale(restoredSettings.locale as string)) {
      sanitizedSettings.locale = restoredSettings.locale as AppLocale;
    }

    if (isOneOf(restoredSettings.viewMode, viewModes)) {
      sanitizedSettings.viewMode = restoredSettings.viewMode;
    }

    if (isOneOf(restoredSettings.pitchNotation, pitchNotations)) {
      sanitizedSettings.pitchNotation = restoredSettings.pitchNotation;
    }

    if (isOneOf(restoredSettings.difficulty, difficulties)) {
      sanitizedSettings.difficulty = restoredSettings.difficulty;
    }

    if (typeof restoredSettings.soundEnabled === 'boolean') {
      sanitizedSettings.soundEnabled = restoredSettings.soundEnabled;
    }

    if (isOneOf(restoredSettings.soundMode, soundModes)) {
      sanitizedSettings.soundMode = restoredSettings.soundMode;
    }

    if (typeof restoredSettings.showScaleGuides === 'boolean') {
      sanitizedSettings.showScaleGuides = restoredSettings.showScaleGuides;
    }

    const userChords = sanitizeUserChords(restoredSettings.userChords);
    if (userChords) {
      sanitizedSettings.userChords = userChords;
    }

    return sanitizedSettings;
  } catch {
    clearStoredSettings();
    return null;
  }
}

export function useAppSettings() {
  const settings = useSettingsStore();
  const { locale } = useI18n({ useScope: 'global' });

  const restoredSettings = parseStoredSettings(readStoredSettings());
  if (restoredSettings) {
    settings.$patch(restoredSettings);
  }

  watchEffect(() => {
    locale.value = settings.locale;

    if (typeof document !== 'undefined') {
      document.documentElement.lang = settings.locale;
    }
  });

  settings.$subscribe((_mutation, state) => {
    persistSettings(state);
  });
}
