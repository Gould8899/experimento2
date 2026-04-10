import { useI18n } from 'petite-vue-i18n';
import { watchEffect } from 'vue';
import { DEFAULT_INSTRUMENT, instrumentNames } from '../data/index';
import {
  isSupportedLocale,
  useSettingsStore,
  type AppLocale,
} from '../stores/settings';

const SETTINGS_STORAGE_KEY = 'settings';

type SettingsState = ReturnType<typeof useSettingsStore>['$state'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readStoredSettings() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(SETTINGS_STORAGE_KEY);
}

function persistSettings(state: SettingsState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
}

function parseStoredSettings(rawSettings: string | null) {
  if (!rawSettings) return null;

  try {
    const parsed = JSON.parse(rawSettings) as unknown;
    if (!isPlainObject(parsed)) return null;

    const restoredSettings = parsed as Partial<SettingsState> & {
      instrument?: string;
      locale?: string;
    };

    if (
      restoredSettings.instrument &&
      !instrumentNames.includes(restoredSettings.instrument)
    ) {
      restoredSettings.instrument = DEFAULT_INSTRUMENT;
    }

    if (
      restoredSettings.locale &&
      !isSupportedLocale(restoredSettings.locale)
    ) {
      delete restoredSettings.locale;
    }

    return restoredSettings as Partial<SettingsState> & { locale?: AppLocale };
  } catch {
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

  settings.instrument = DEFAULT_INSTRUMENT;

  watchEffect(() => {
    locale.value = settings.locale;
    document.documentElement.lang = settings.locale;
  });

  settings.$subscribe((_mutation, state) => {
    persistSettings(state);
  });
}
