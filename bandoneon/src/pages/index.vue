<template>
  <div class="h-full overflow-auto p-2 md:p-3 lg:overflow-hidden">
    <div
      class="grid min-h-full gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[18.5rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <aside
        class="grid content-start gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm lg:min-h-0 lg:overflow-y-auto dark:border-neutral-800 dark:bg-neutral-900"
      >
        <OtherPanel
          summary-title="Workspace"
          :summary-primary="selectionSummary"
          :summary-meta="`${instrumentLabel} · ${sideLabel} · ${directionLabel}`"
          :summary-secondary="`${viewModeLabel} · ${interactionHint}`"
        />

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            {{ t('interaction') }}
          </div>
          <div class="mb-2 flex flex-wrap gap-1.5">
            <button
              v-for="mode in interactionModes"
              :key="mode.value"
              :aria-pressed="interactionMode === mode.value"
              class="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white dark:border-neutral-700 dark:hover:bg-neutral-800 dark:aria-pressed:border-neutral-100 dark:aria-pressed:bg-neutral-100 dark:aria-pressed:text-neutral-900"
              type="button"
              @click="interactionMode = mode.value"
            >
              {{ t(mode.label) }}
            </button>
            <button
              :disabled="!isModified"
              class="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
              type="button"
              @click="clearHeldNotes"
            >
              {{ t('interaction_clear_held') }}
            </button>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ interactionModeHint }}
          </p>
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Manual
          </div>
          <NavVariant compact />
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="mb-2 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            Tonic
          </div>
          <NavTonic compact />
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <NavDisplay
            compact
            :modified="isModified"
            :can-reset="canResetSelection"
            :can-save="canSaveVoicing"
            :reset-title="resetActionLabel"
            @reset="onReset"
            @reset-search="onResetSearch"
            @download="onDownload"
            @save="onSave"
          />
        </section>
      </aside>

      <section
        class="flex min-h-0 flex-col rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm lg:overflow-hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="grid min-h-0 flex-1 gap-3 lg:grid-rows-[minmax(0,1fr)_auto]"
        >
          <div
            class="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)] xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]"
          >
            <div
              class="flex min-h-[26rem] min-w-0 items-center justify-center overflow-visible rounded-2xl bg-neutral-100/80 px-2 py-4 sm:min-h-[32rem] lg:min-h-[36rem] dark:bg-neutral-800/40"
            >
              <div class="flex h-full w-full items-center justify-center">
                <SvgKeyboard ref="keyboardEl" :side="side" :mode="viewMode">
                  <SvgButton
                    v-for="([x, y, tonal], idx) in keyPositions"
                    :key="idx"
                    :selected="selected[tonal]"
                    :muted="
                      scaleFilterActive &&
                      !chromaticScaleActive &&
                      !isScaleNote(tonal)
                    "
                    :x="x"
                    :y="y"
                    :tonal="tonal"
                    :color="color(tonal)"
                    :label-rotation="labelRotation"
                    @start="onBandoneonStart(tonal)"
                    @click="onBandoneonPress(tonal)"
                    @hover="onBandoneonHover(tonal)"
                  />
                  <SvgPath
                    v-for="(path, index) in scalePaths"
                    :key="index"
                    :stroke="getScaleColor(index)"
                    :d="path"
                  />
                </SvgKeyboard>
              </div>
            </div>

            <div class="min-h-0 min-w-0 lg:flex lg:items-stretch">
              <StaffDisplay
                :notes="staffNotes"
                :subtitle="staffSubtitle"
                :note-colors="pianoNoteColors"
                :hand="side"
              />
            </div>
          </div>

          <div class="min-w-0">
            <PianoKeyboard
              compact
              :notes="instrumentFullNoteRange"
              :available-notes="visibleNotes"
              :active-notes="pianoActiveNotes"
              :secondary-notes="pianoSecondaryNotes"
              :muted-notes="pianoMutedNotes"
              :note-colors="pianoNoteColors"
              :pitch-notation="settings.pitchNotation"
              :sound-enabled="settings.soundEnabled"
              @start="onPianoStart"
              @press="onPianoPress"
              @hover="onPianoHover"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { Note, Scale } from 'tonal';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import NavDisplay from '../components/NavDisplay.vue';
import NavTonic from '../components/NavTonic.vue';
import NavVariant from '../components/NavVariant.vue';
import OtherPanel from '../components/OtherPanel.vue';
import PianoKeyboard from '../components/PianoKeyboard.vue';
import StaffDisplay from '../components/StaffDisplay.vue';
import SvgButton from '../components/SvgButton.vue';
import SvgKeyboard from '../components/SvgKeyboard.vue';
import SvgPath from '../components/SvgPath.vue';
import { useKeyboard } from '../composables/useKeyboard';
import { useSynth } from '../composables/useSynth';
import {
  colors,
  findHarmonicType,
  getInstrumentNotesForSide,
  instrumentFullNoteRange,
  isArpeggioType,
  scaleTypes,
  usesFormulaChordType,
} from '../data/index';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';

// Main exploration view for the instrument: chords, scales, overlays and manual edits.
useHead({ title: 'Bandoneon keyboard, chords and scales – Bandoneon.app' });

useKeyboard();

const { t } = useI18n({ useScope: 'global' });
const { playNote, stopAll } = useSynth();

const keyboardEl = ref<typeof SvgKeyboard>();

const store = useStore();
const {
  chordFormulaNotes,
  chordName,
  chordNotes,
  chordType,
  direction,
  keyPositions,
  resetNonce,
  scaleType,
  showColors,
  side,
  tonic,
} = storeToRefs(store);

const settings = useSettingsStore();
const { instrument, soundEnabled, viewMode } = storeToRefs(settings);

const instrumentLabel = computed(() => t(instrument.value));
const sideLabel = computed(() => t(side.value));
const directionLabel = computed(() => t(direction.value));
const viewModeLabel = computed(() =>
  viewMode.value === 'real' ? t('view_real') : t('view_flat'),
);
const interactionHint = computed(() =>
  isModified.value ? t('custom_layout') : t('click_buttons_hint'),
);
const canResetSelection = computed(() => isModified.value || store.isUserChord);
const isArpeggioSelection = computed(() => isArpeggioType(chordType.value));
const usesFormulaChordSelection = computed(() =>
  usesFormulaChordType(chordType.value),
);
const canSaveVoicing = computed(
  () =>
    Boolean(chordType.value) &&
    isModified.value &&
    !usesFormulaChordSelection.value,
);
const resetActionLabel = computed(() =>
  store.isUserChord ? t('reset_voicing') : t('clear_selection'),
);
const chordLabel = computed(() => {
  const harmonicType = findHarmonicType(chordType.value);
  if (!harmonicType) return chordType.value;

  return 'text' in harmonicType
    ? harmonicType.text
    : t(harmonicType.label ?? harmonicType.value);
});
const interactionModes = [
  { value: 'paint-on', label: 'interaction_paint_on' },
  { value: 'toggle', label: 'interaction_toggle' },
] as const;
const selectionSummary = computed(() => {
  if (tonic.value && chordLabel.value)
    return `${tonic.value} ${chordLabel.value}`;
  if (tonic.value && scaleType.value) {
    const scale = scaleTypes.find((item) => item.value === scaleType.value);
    return `${tonic.value} ${scale ? t(scale.label) : scaleType.value}`;
  }
  if (tonic.value) return tonic.value;
  return t('workspace_idle');
});

const isModified = ref(false);
const userSelection = ref<Record<string, boolean>>({});
const interactionMode =
  ref<(typeof interactionModes)[number]['value']>('paint-on');
const gestureActive = ref(false);
const gestureSelection = ref<Record<string, boolean>>({});
const gestureTrace = ref<string[]>([]);
const lastGestureNote = ref<string | null>(null);

const visibleNotes = computed(() => keyPositions.value.map((item) => item[2]));
const currentHand = computed(() => side.value);
const otherHand = computed(() => (side.value === 'right' ? 'left' : 'right'));

const labelRotation = computed(() => {
  if (viewMode.value !== 'real') return 0;
  return side.value === 'left' ? 90 : -90;
});

const scalePitchClasses = computed(() => {
  if (!tonic.value || !scaleType.value) return new Set<number>();

  const scale = Scale.get(scaleType.value);
  if (scale.empty) return new Set<number>();

  return new Set(
    scale.intervals
      .map(
        (interval) =>
          Note.get(Note.transpose(`${tonic.value}4`, interval)).chroma,
      )
      .filter((chroma): chroma is number => typeof chroma === 'number'),
  );
});

const scaleFilterActive = computed(
  () => Boolean(scaleType.value) && scalePitchClasses.value.size > 0,
);
const chromaticScaleActive = computed(
  () => scaleFilterActive.value && scalePitchClasses.value.size === 12,
);
const currentHandNotes = computed(() =>
  getInstrumentNotesForSide(instrument.value, currentHand.value),
);
const otherHandNotes = computed(() =>
  getInstrumentNotesForSide(instrument.value, otherHand.value),
);

function isScaleNote(note: string) {
  if (!scaleFilterActive.value) return false;

  const chroma = Note.get(note).chroma;
  return typeof chroma === 'number' && scalePitchClasses.value.has(chroma);
}

const currentHandScaleNotes = computed(() => {
  if (!scaleFilterActive.value) return [] as string[];
  return currentHandNotes.value.filter((note) => isScaleNote(note));
});

const otherHandOnlyScaleNotes = computed(() => {
  if (!scaleFilterActive.value) return [] as string[];

  const currentHandSet = new Set(currentHandNotes.value);
  return otherHandNotes.value.filter(
    (note) => isScaleNote(note) && !currentHandSet.has(note),
  );
});

const getScaleColor = (octave: number) => {
  return colors[(octave - 1) % colors.length];
};

const scalePaths = computed(() => {
  if (!tonic.value || !scaleType.value) return [];
  const { intervals, empty } = Scale.get(scaleType.value);
  if (empty) return [];
  const paths = [];
  for (let o = -1; o < 7; o++) {
    const scaleNotes = intervals.map((i) =>
      Note.transpose(`${tonic.value}${o}`, i),
    );
    scaleNotes.push(`${tonic.value}${o + 1}`);
    let pathString = '';
    for (const note of scaleNotes) {
      const no = Note.get(note);
      const pos = keyPositions.value.find(
        (v) => Note.get(v[2]).height === no.height,
      );
      if (pos) {
        pathString += `${pathString === '' ? 'M' : 'L'}${pos[0] + 30},${pos[1] + 30}`;
      }
    }
    paths.push(pathString);
  }
  return paths;
});

const onDownload = () => {
  const chordSlug = chordType.value
    ? chordType.value.replace(/:/g, '-').replace(/#/g, 's')
    : '';
  const filename =
    `bandoneon-${instrument.value}-${side.value}-${direction.value}` +
    (tonic.value ? '-' + tonic.value.replace('#', 's') : '') +
    chordSlug +
    (scaleType.value ? '-' + scaleType.value : '') +
    (isModified.value ? '-custom' : '') +
    '.png';

  keyboardEl.value?.download(filename);
};

const resetUserSelection = () => {
  userSelection.value = {};
  isModified.value = false;
  gestureActive.value = false;
  gestureSelection.value = {};
  gestureTrace.value = [];
  lastGestureNote.value = null;
  stopAll();
};

watch(
  [side, direction, tonic, chordType, scaleType, resetNonce],
  resetUserSelection,
);

const selected = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;

  const result: Record<string, boolean> = {};

  const chord = chordNotes.value;
  if (chord) {
    for (const note of chord) {
      result[note] = true;
    }
  }
  return result;
});

const pianoActiveNotes = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;
  if (!scaleFilterActive.value) return selected.value;

  return Object.fromEntries(
    currentHandScaleNotes.value.map((note) => [note, true]),
  );
});

const pianoNoteColors = computed(() => {
  if (!showColors.value) return {} as Record<string, string>;

  return Object.fromEntries(
    instrumentFullNoteRange.map((note) => [
      note,
      color(note).replace('80', ''),
    ]),
  );
});

const pianoMutedNotes = computed(() => {
  if (!scaleFilterActive.value || chromaticScaleActive.value) return [];

  return instrumentFullNoteRange.filter((note) => {
    const chroma = Note.get(note).chroma;
    return typeof chroma === 'number' && !scalePitchClasses.value.has(chroma);
  });
});

const pianoSecondaryNotes = computed(() => {
  if (!scaleFilterActive.value) return [] as string[];
  return otherHandOnlyScaleNotes.value;
});

const pianoMutedNoteSet = computed(() => new Set(pianoMutedNotes.value));
const pianoSecondaryNoteSet = computed(
  () => new Set(pianoSecondaryNotes.value),
);

function isPlayablePianoNote(note: string) {
  if (!visibleNotes.value.includes(note)) return false;
  if (pianoMutedNoteSet.value.has(note)) return false;
  if (pianoSecondaryNoteSet.value.has(note)) return false;
  return true;
}

const staffNotes = computed(() => {
  if (gestureActive.value && gestureTrace.value.length > 0) {
    return gestureTrace.value;
  }

  if (isModified.value) {
    return Object.keys(userSelection.value).sort((left, right) => {
      const leftMidi = Note.midi(left) ?? 0;
      const rightMidi = Note.midi(right) ?? 0;
      return leftMidi - rightMidi;
    });
  }

  if (chordNotes.value.length > 0) {
    if (usesFormulaChordSelection.value) {
      return [...chordFormulaNotes.value];
    }

    return [...chordNotes.value].sort((left, right) => {
      const leftMidi = Note.midi(left) ?? 0;
      const rightMidi = Note.midi(right) ?? 0;
      return leftMidi - rightMidi;
    });
  }

  if (tonic.value && scaleType.value) {
    const scale = Scale.get(scaleType.value);
    if (!scale.empty) {
      return [
        ...scale.intervals.map((interval) =>
          Note.simplify(Note.transpose(`${tonic.value}4`, interval)),
        ),
        Note.simplify(`${tonic.value}5`),
      ];
    }
  }

  if (tonic.value) {
    return [`${tonic.value}4`];
  }

  return [] as string[];
});

const staffSubtitle = computed(() => {
  if (gestureActive.value && gestureTrace.value.length > 0) {
    return t('staff_live_phrase');
  }

  if (isModified.value) {
    return t('staff_manual_selection');
  }

  if (chordNotes.value.length > 0) {
    return t('staff_current_voicing');
  }

  if (tonic.value && scaleType.value) {
    return t('staff_scale_outline');
  }

  return t('staff_waiting');
});

const interactionModeHint = computed(() => {
  if (interactionMode.value === 'paint-on')
    return t('interaction_paint_on_hint');
  return t('interaction_toggle_hint');
});

function color(tonal: string) {
  if (showColors.value) {
    let octave = +tonal.slice(1);
    if (tonal[1] === '#') octave = +tonal.slice(2);
    return colors[octave % colors.length] + '80';
  }
  return 'transparent';
}

const toggle = (tonal: string) => {
  if (!isModified.value) {
    userSelection.value = { ...selected.value };
    isModified.value = true;
  }
  if (userSelection.value[tonal]) {
    delete userSelection.value[tonal];
  } else {
    userSelection.value[tonal] = true;
  }
};

function setGestureNoteActive(note: string, active: boolean) {
  if (active) {
    gestureSelection.value[note] = true;
  } else {
    delete gestureSelection.value[note];
  }
}

function recordGestureNote(note: string) {
  if (lastGestureNote.value === note) return;

  lastGestureNote.value = note;
  gestureTrace.value = [...gestureTrace.value, note].slice(-16);
}

function beginGesture(note: string) {
  if (interactionMode.value === 'toggle') return;
  if (gestureActive.value && lastGestureNote.value === note) return;

  gestureActive.value = true;
  gestureSelection.value = {};
  gestureTrace.value = [];
  lastGestureNote.value = null;
  preview(note);
  recordGestureNote(note);
  setGestureNoteActive(note, interactionMode.value === 'paint-on');
}

function endGesture() {
  if (!gestureActive.value) return;

  gestureActive.value = false;
  gestureSelection.value = {};
  gestureTrace.value = [];
  lastGestureNote.value = null;
  stopAll();
}

function preview(note: string) {
  if (!soundEnabled.value) return;
  void playNote(note);
}

function clearHeldNotes() {
  if (!isModified.value) return;
  resetUserSelection();
}

function onBandoneonStart(note: string) {
  beginGesture(note);
}

function onBandoneonPress(note: string) {
  if (interactionMode.value !== 'toggle') return;

  preview(note);
  toggle(note);
}

function onPianoStart(note: string) {
  if (!isPlayablePianoNote(note)) return;
  beginGesture(note);
}

function onPianoPress(note: string) {
  if (!isPlayablePianoNote(note)) return;
  if (interactionMode.value !== 'toggle') return;

  preview(note);
  toggle(note);
}

function onBandoneonHover(note: string) {
  if (!gestureActive.value) return;
  if (lastGestureNote.value === note) return;

  preview(note);
  recordGestureNote(note);
  setGestureNoteActive(note, interactionMode.value === 'paint-on');
}

function onPianoHover(note: string) {
  if (!gestureActive.value) return;
  if (!isPlayablePianoNote(note)) return;
  if (lastGestureNote.value === note) return;

  preview(note);
  recordGestureNote(note);
  setGestureNoteActive(note, interactionMode.value === 'paint-on');
}

const onSave = () => {
  if (isModified.value && chordName.value && !usesFormulaChordSelection.value) {
    settings.saveUserChord(
      side.value,
      chordName.value,
      Object.keys(userSelection.value).filter(
        (item) => !!userSelection.value[item],
      ),
    );
  }
  resetUserSelection();
};

const onReset = () => {
  resetUserSelection();
  if (chordName.value && !isArpeggioSelection.value) {
    settings.resetUserChord(side.value, chordName.value);
  }
};

const onResetSearch = () => {
  store.resetSearch();
};

onMounted(() => {
  store.$reset();
  window.addEventListener('pointerup', endGesture);
  window.addEventListener('pointercancel', endGesture);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', endGesture);
  window.removeEventListener('pointercancel', endGesture);
  stopAll();
});
</script>
