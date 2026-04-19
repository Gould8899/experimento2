import { describe, expect, it } from 'vitest';
import {
  parseStoredSettings,
  serializeSettings,
} from '../src/composables/useAppSettings';
import type { useSettingsStore } from '../src/stores/settings';

type SettingsState = ReturnType<typeof useSettingsStore>['$state'];

describe('useAppSettings persistence helpers', () => {
  it('restores only supported persisted settings', () => {
    const result = parseStoredSettings(
      JSON.stringify({
        instrument: 'manouri148',
        locale: 'es',
        viewMode: 'flat',
        pitchNotation: 'solfege',
        difficulty: 'easy',
        soundEnabled: false,
        soundMode: 'sustain',
        showScaleGuides: false,
        userChords: {
          right: {
            CM: ['C4', 'E4', 'G4'],
          },
          left: {
            Am: ['A2', 'C3', 'E3'],
            broken: ['A2', 7],
          },
        },
        extra: 'ignored',
      }),
    );

    expect(result).toEqual({
      locale: 'es',
      viewMode: 'flat',
      pitchNotation: 'solfege',
      difficulty: 'easy',
      soundEnabled: false,
      soundMode: 'sustain',
      showScaleGuides: false,
      userChords: {
        left: {
          Am: ['A2', 'C3', 'E3'],
        },
        right: {
          CM: ['C4', 'E4', 'G4'],
        },
      },
    });
  });

  it('drops invalid values and malformed payloads', () => {
    expect(
      parseStoredSettings(
        JSON.stringify({
          locale: 'fr',
          viewMode: '3d',
          pitchNotation: 'latin',
          difficulty: 'hard',
          soundEnabled: 'yes',
          soundMode: 'drone',
          showScaleGuides: 'sometimes',
          userChords: 'not-an-object',
        }),
      ),
    ).toEqual({});

    expect(parseStoredSettings('{invalid json')).toBeNull();
  });

  it('serializes only restorable settings', () => {
    const state = {
      instrument: 'rheinische142',
      locale: 'de',
      viewMode: 'real',
      pitchNotation: 'helmholtz',
      userChords: {
        right: {
          G7: ['G3', 'B3', 'D4', 'F4'],
        },
      },
      difficulty: 'medium',
      soundEnabled: true,
      soundMode: 'short',
      showScaleGuides: true,
    } as SettingsState;

    expect(serializeSettings(state)).toEqual({
      locale: 'de',
      viewMode: 'real',
      pitchNotation: 'helmholtz',
      userChords: {
        right: {
          G7: ['G3', 'B3', 'D4', 'F4'],
        },
      },
      difficulty: 'medium',
      soundEnabled: true,
      soundMode: 'short',
      showScaleGuides: true,
    });
  });
});
