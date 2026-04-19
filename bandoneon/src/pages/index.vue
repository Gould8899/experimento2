<template>
  <div class="h-full overflow-auto p-1.5 md:p-2 lg:overflow-hidden">
    <div
      class="grid min-h-full gap-2.5 lg:h-full lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] 2xl:grid-cols-[17rem_minmax(0,1fr)]"
    >
      <aside
        class="grid content-start gap-2.5 rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm lg:min-h-0 lg:overflow-y-auto dark:border-neutral-800 dark:bg-neutral-900"
      >
        <section
          class="rounded-2xl border border-neutral-200 p-2.5 dark:border-neutral-800"
        >
          <div class="grid gap-3">
            <NavVariant compact />
            <div
              class="border-t border-neutral-200/80 dark:border-neutral-800"
            ></div>
            <NavDisplay
              compact
              :can-reset="canResetSelection"
              :show-scale-guides="showScaleGuides"
              :reset-title="resetActionLabel"
              :reset-shortcut="resetActionShortcut"
              :reset-search-shortcut="resetSearchShortcut"
              :actions-hint="actionsShortcutHint"
              @reset="onReset"
              @reset-search="onResetSearch"
              @download="onDownload"
              @toggle-scale-guides="setScaleGuidesVisibility"
            />
          </div>
        </section>

        <OtherPanel
          :summary-title="t('workspace')"
          :summary-primary="selectionSummary"
          :summary-meta="`${instrumentLabel} · ${sideLabel} · ${directionLabel}`"
          :summary-secondary="`${viewModeLabel} · ${soundStatusLabel}`"
        />
      </aside>

      <section
        class="flex min-h-0 flex-col rounded-3xl border border-neutral-200 bg-white p-1.5 shadow-sm lg:overflow-hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="grid min-h-0 flex-1 gap-2.5 lg:grid-rows-[minmax(0,1fr)_auto]"
        >
          <div
            ref="bandoneonPanelEl"
            class="grid min-h-0 gap-2.5 lg:grid-cols-[minmax(0,1.28fr)_minmax(22rem,1.08fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(26rem,1.18fr)]"
          >
            <div
              class="flex min-h-[24rem] min-w-0 items-center justify-center overflow-visible rounded-2xl bg-neutral-100/80 px-1.5 py-3 sm:min-h-[29rem] lg:min-h-[33rem] dark:bg-neutral-800/40"
            >
              <div class="flex h-full w-full items-center justify-center">
                <SvgKeyboard ref="keyboardEl" :side="side" :mode="viewMode">
                  <SvgButton
                    v-for="([x, y, tonal], idx) in keyPositions"
                    :key="idx"
                    :selected="selected[tonal]"
                    :focused="gestureFocusNote === tonal"
                    :interactive-mode="interactionMode"
                    :gesture-active="gestureActive"
                    :gesture-mode="gestureMode"
                    :playable="isPlayableBandoneonNote(tonal)"
                    :muted="
                      harmonicFilterActive &&
                      !allPitchClassesActive &&
                      !isHarmonicNote(tonal)
                    "
                    :x="x"
                    :y="y"
                    :tonal="tonal"
                    :color="color(tonal)"
                    :label-rotation="labelRotation"
                    @start="onBandoneonStart(tonal)"
                    @hover="onBandoneonHover(tonal)"
                  />
                  <template v-if="showScaleGuides">
                    <SvgPath
                      v-for="(path, index) in scalePaths"
                      :key="index"
                      :stroke="getScaleColor()"
                      :d="path"
                    />
                  </template>
                </SvgKeyboard>
              </div>
            </div>

            <div
              ref="staffPanelEl"
              class="min-h-0 min-w-0 lg:flex lg:items-stretch"
            >
              <StaffDisplay
                :notes="staffNotes"
                :group-breaks="staffGroupBreaks"
                :subtitle="staffSubtitle"
                :note-colors="pianoNoteColors"
                :hand="side"
                :tonic="tonic"
                :scale-type="scaleType"
                :chord-type="chordType"
                :prefer-flats="showEnharmonics"
                :interactive-notes="visibleNotes"
                @start="onStaffStart"
                @hover="onStaffHover"
              />
            </div>
          </div>

          <div ref="pianoPanelEl" class="min-w-0">
            <PianoKeyboard
              compact
              :notes="instrumentFullNoteRange"
              :interaction-mode="interactionMode"
              :gesture-active="gestureActive"
              :gesture-mode="gestureMode"
              :gesture-note="gestureFocusNote"
              :available-notes="visibleNotes"
              :active-notes="pianoActiveNotes"
              :secondary-notes="pianoSecondaryNotes"
              :muted-notes="pianoMutedNotes"
              :note-colors="pianoNoteColors"
              :pitch-notation="settings.pitchNotation"
              :sound-enabled="settings.soundEnabled"
              :prefer-flats="showEnharmonics"
              @start="onPianoStart"
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
import { Note } from 'tonal';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import NavDisplay from '../components/NavDisplay.vue';
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
import { buildKeyboardExportFilename } from '../utils/export';
import {
  buildHarmonicPitchClasses,
  noteMatchesPitchClasses,
} from '../utils/harmonic';
import {
  applyPaintGestureStep,
  resolvePaintGestureMode,
  selectionsEqual,
  type PaintGestureMode,
} from '../utils/paintGesture';
import { isSpecialScaleType } from '../utils/scaleType';
import { formatDisplayedNote } from '../utils/staffNotation';
import {
  appendRecentPlaybackNotes,
  resolveStaffState,
  takeRecentPlaybackNotes,
} from '../utils/staffState';

// Main exploration view for the instrument: chords, scales, overlays and manual edits.
useHead({ title: 'Bandoneon keyboard, chords and scales – Bandoneon.app' });

const { t } = useI18n({ useScope: 'global' });
const { playNote, stopAll, stopNote } = useSynth();

const keyboardEl = ref<typeof SvgKeyboard>();
const bandoneonPanelEl = ref<HTMLDivElement | null>(null);
const staffPanelEl = ref<HTMLDivElement | null>(null);
const pianoPanelEl = ref<HTMLDivElement | null>(null);

const store = useStore();
const {
  chordFormulaNotes,
  chordName,
  chordNotes,
  chordType,
  direction,
  keyPositions,
  resetNonce,
  showEnharmonics,
  scaleType,
  showColors,
  side,
  tonic,
} = storeToRefs(store);

const settings = useSettingsStore();
const { instrument, showScaleGuides, soundEnabled, soundMode, viewMode } =
  storeToRefs(settings);

const instrumentLabel = computed(() => t(instrument.value));
const sideLabel = computed(() => t(side.value));
const directionLabel = computed(() => t(direction.value));
const viewModeLabel = computed(() =>
  viewMode.value === 'real' ? t('view_real') : t('view_flat'),
);
const soundStatusLabel = computed(() =>
  soundEnabled.value ? t('sound') : `${t('sound')} ${t('off')}`,
);
const canResetSelection = computed(() => isModified.value || store.isUserChord);
const isArpeggioSelection = computed(() => isArpeggioType(chordType.value));
const usesFormulaChordSelection = computed(() =>
  usesFormulaChordType(chordType.value),
);
const hasManualSelectionToClear = computed(
  () =>
    gestureActive.value ||
    isModified.value ||
    recentPlaybackNotes.value.length > 0,
);
const hasSearchContextToReset = computed(
  () =>
    side.value !== 'right' ||
    direction.value !== 'open' ||
    tonic.value !== null ||
    chordType.value !== null ||
    scaleType.value !== null ||
    showEnharmonics.value ||
    !showColors.value,
);
const escapeResetArmed = ref(false);
const resetActionLabel = computed(() =>
  store.isUserChord ? t('reset_voicing') : t('clear_selection'),
);
const resetActionShortcut = computed(() =>
  !store.isUserChord && hasManualSelectionToClear.value ? 'Esc' : undefined,
);
const resetSearchShortcut = computed(() =>
  hasSearchContextToReset.value ? 'Esc Esc' : undefined,
);
const actionsShortcutHint = computed(() => t('actions_escape_hint'));
const chordLabel = computed(() => {
  const harmonicType = findHarmonicType(chordType.value);
  if (!harmonicType) return chordType.value;

  return 'text' in harmonicType
    ? harmonicType.text
    : t(harmonicType.label ?? harmonicType.value);
});
const formattedTonic = computed(() => {
  if (!tonic.value) return null;

  return formatDisplayedNote(
    `${tonic.value}4`,
    settings.pitchNotation,
    showEnharmonics.value,
    { includeOctave: false },
  );
});
const selectionSummary = computed(() => {
  if (formattedTonic.value && chordLabel.value) {
    return isArpeggioSelection.value
      ? `${formattedTonic.value} ${t('arpeggio')} ${chordLabel.value}`
      : `${formattedTonic.value} ${chordLabel.value}`;
  }
  if (scaleType.value) {
    const scale = scaleTypes.find((item) => item.value === scaleType.value);

    if (isSpecialScaleType(scaleType.value)) {
      return scale ? t(scale.label) : scaleType.value;
    }

    if (!tonic.value) {
      return scale ? t(scale.label) : scaleType.value;
    }

    return `${formattedTonic.value} ${scale ? t(scale.label) : scaleType.value}`;
  }
  if (formattedTonic.value) return formattedTonic.value;
  return t('workspace_idle');
});

const isModified = ref(false);
const userSelection = ref<Record<string, boolean>>({});
const interactionMode = ref<'paint-on'>('paint-on');
const gestureActive = ref(false);
const gestureSelection = ref<Record<string, boolean>>({});
const gestureBaseSelection = ref<Record<string, boolean>>({});
const gestureMode = ref<PaintGestureMode>('paint');
const gestureTrace = ref<string[]>([]);
const lastGestureNote = ref<string | null>(null);
const recentPlaybackNotes = ref<string[]>([]);
const recentPlaybackGroups = ref<number[]>([]);
const currentGesturePlaybackCount = ref(0);
const activePreviewNote = ref<string | null>(null);
const gestureFocusNote = computed(() => lastGestureNote.value);
const staffDismissed = ref(true);

const visibleNotes = computed(() => keyPositions.value.map((item) => item[2]));
const currentHand = computed(() => side.value);
const otherHand = computed(() => (side.value === 'right' ? 'left' : 'right'));

const labelRotation = computed(() => {
  if (viewMode.value !== 'real') return 0;
  return side.value === 'left' ? 90 : -90;
});

const harmonicPitchClasses = computed(() =>
  buildHarmonicPitchClasses({
    tonic: tonic.value,
    scaleType: scaleType.value,
    chordFormulaNotes: chordFormulaNotes.value,
  }),
);
const harmonicFilterActive = computed(
  () => harmonicPitchClasses.value.size > 0,
);
const allPitchClassesActive = computed(
  () => harmonicFilterActive.value && harmonicPitchClasses.value.size === 12,
);
const currentHandNotes = computed(() =>
  getInstrumentNotesForSide(instrument.value, currentHand.value),
);
const otherHandNotes = computed(() =>
  getInstrumentNotesForSide(instrument.value, otherHand.value),
);

function isHarmonicNote(note: string) {
  return noteMatchesPitchClasses(note, harmonicPitchClasses.value);
}

const visibleHarmonicNotes = computed(() => {
  if (!harmonicFilterActive.value) return [] as string[];
  return visibleNotes.value.filter((note) => isHarmonicNote(note));
});

const otherHandExclusiveNotes = computed(() => {
  const currentHandSet = new Set(currentHandNotes.value);
  return otherHandNotes.value.filter((note) => !currentHandSet.has(note));
});

const harmonicGuideNotes = computed(() => {
  if (!showScaleGuides.value || !harmonicFilterActive.value) {
    return [] as string[];
  }

  const uniqueByMidi = new Map<number, string>();

  for (const note of visibleNotes.value) {
    if (!isHarmonicNote(note)) continue;

    const midi = Note.midi(note);
    if (midi === null || uniqueByMidi.has(midi)) continue;
    uniqueByMidi.set(midi, note);
  }

  return [...uniqueByMidi.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, note]) => note);
});

const getScaleColor = () => {
  return '#111111';
};

function setScaleGuidesVisibility(visible: boolean) {
  showScaleGuides.value = visible;
}

function buildScalePath(notes: string[]) {
  let pathString = '';

  for (const note of notes) {
    const noteData = Note.get(note);
    const pos = keyPositions.value.find(
      (value) => Note.get(value[2]).height === noteData.height,
    );

    if (pos) {
      pathString += `${pathString === '' ? 'M' : 'L'}${pos[0] + 30},${pos[1] + 30}`;
    }
  }

  return pathString;
}

const scalePaths = computed(() => {
  if (harmonicGuideNotes.value.length === 0) return [];

  const path = buildScalePath(harmonicGuideNotes.value);
  return path ? [path] : [];
});

const onDownload = () => {
  const filename = buildKeyboardExportFilename({
    instrument: instrument.value,
    side: side.value,
    direction: direction.value,
    tonic: tonic.value,
    chordType: chordType.value,
    scaleType: scaleType.value,
    isModified: isModified.value,
  });

  keyboardEl.value?.download(filename);
};

function rememberRecentPlayback(
  notes: string[],
  options?: { replace?: boolean },
) {
  const previousLength = recentPlaybackNotes.value.length;

  recentPlaybackNotes.value = options?.replace
    ? takeRecentPlaybackNotes(notes)
    : appendRecentPlaybackNotes(recentPlaybackNotes.value, notes);

  if (options?.replace) {
    recentPlaybackGroups.value = recentPlaybackNotes.value.length
      ? [recentPlaybackNotes.value.length]
      : [];
    currentGesturePlaybackCount.value = recentPlaybackNotes.value.length;
    return;
  }

  if (notes.length === 0) {
    return;
  }

  currentGesturePlaybackCount.value += notes.length;

  const nextGroups = [...recentPlaybackGroups.value];
  if (currentGesturePlaybackCount.value === notes.length) {
    nextGroups.push(currentGesturePlaybackCount.value);
  } else if (nextGroups.length > 0) {
    nextGroups[nextGroups.length - 1] = currentGesturePlaybackCount.value;
  }

  let overflow =
    previousLength + notes.length - recentPlaybackNotes.value.length;

  while (overflow > 0 && nextGroups.length > 0) {
    if (nextGroups[0] <= overflow) {
      overflow -= nextGroups[0];
      nextGroups.shift();
      continue;
    }

    nextGroups[0] -= overflow;
    overflow = 0;
  }

  recentPlaybackGroups.value = nextGroups;
}

function clearRecentPlayback() {
  recentPlaybackNotes.value = [];
  recentPlaybackGroups.value = [];
  currentGesturePlaybackCount.value = 0;
}

const resetUserSelection = () => {
  userSelection.value = {};
  isModified.value = false;
  gestureActive.value = false;
  gestureSelection.value = {};
  gestureBaseSelection.value = {};
  gestureMode.value = 'paint';
  gestureTrace.value = [];
  lastGestureNote.value = null;
  activePreviewNote.value = null;
  clearRecentPlayback();
  staffDismissed.value = true;
  stopAll();
};

watch(
  [side, direction, tonic, chordType, scaleType, showEnharmonics, resetNonce],
  resetUserSelection,
);

watch(soundEnabled, (enabled) => {
  if (!enabled) {
    activePreviewNote.value = null;
    stopAll();
  }
});

watch(soundMode, () => {
  activePreviewNote.value = null;
  stopAll();
});

watch(
  [side, direction, tonic, chordType, scaleType, showEnharmonics, showColors],
  () => {
    escapeResetArmed.value = false;
  },
);

const selected = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;
  if (isArpeggioSelection.value) return {} as Record<string, boolean>;

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
  if (!harmonicFilterActive.value) return selected.value;

  return Object.fromEntries(
    visibleHarmonicNotes.value.map((note) => [note, true]),
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

const pianoSecondaryNotes = computed(() => {
  return otherHandExclusiveNotes.value;
});

const pianoMutedNotes = computed(() => {
  if (!harmonicFilterActive.value || allPitchClassesActive.value) return [];

  const secondarySet = new Set(pianoSecondaryNotes.value);
  return instrumentFullNoteRange.filter(
    (note) => !secondarySet.has(note) && !isHarmonicNote(note),
  );
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

function isPlayableBandoneonNote(note: string) {
  if (!visibleNotes.value.includes(note)) return false;
  if (!harmonicFilterActive.value || allPitchClassesActive.value) return true;
  return isHarmonicNote(note);
}

const staffState = computed(() => {
  if (staffDismissed.value) {
    return { notes: [], source: 'idle' as const };
  }

  if (gestureActive.value) {
    return {
      notes:
        recentPlaybackNotes.value.length > 0
          ? recentPlaybackNotes.value
          : gestureTrace.value,
      source: 'gesture' as const,
    };
  }

  return resolveStaffState({
    gestureActive: false,
    gestureTrace: gestureTrace.value,
    isModified: isModified.value,
    userSelection: userSelection.value,
    recentPlaybackNotes: recentPlaybackNotes.value,
    chordNotes: chordNotes.value,
    chordFormulaNotes: chordFormulaNotes.value,
    chordType: chordType.value,
    usesFormulaChordSelection: usesFormulaChordSelection.value,
    tonic: tonic.value,
    scaleType: scaleType.value,
    preferFlats: showEnharmonics.value,
  });
});

const staffNotes = computed(() => staffState.value.notes);
const staffGroupBreaks = computed(() => {
  if (
    staffDismissed.value ||
    (staffState.value.source !== 'gesture' &&
      staffState.value.source !== 'recent')
  ) {
    return [] as number[];
  }

  const breaks: number[] = [];
  let cursor = 0;

  for (const groupLength of recentPlaybackGroups.value.slice(0, -1)) {
    cursor += groupLength;
    if (cursor > 0 && cursor < staffNotes.value.length) {
      breaks.push(cursor);
    }
  }

  return breaks;
});

const staffSubtitle = computed(() => {
  if (staffState.value.source === 'gesture') return t('staff_live_phrase');
  if (staffState.value.source === 'manual') return t('staff_manual_selection');
  if (staffState.value.source === 'recent') return t('staff_recent_phrase');
  if (staffState.value.source === 'voicing') {
    return isArpeggioSelection.value
      ? t('staff_arpeggio_outline')
      : t('staff_current_voicing');
  }
  if (staffState.value.source === 'scale') return t('staff_scale_outline');
  return t('staff_waiting');
});

function color(tonal: string) {
  if (showColors.value) {
    let octave = +tonal.slice(1);
    if (tonal[1] === '#') octave = +tonal.slice(2);
    return colors[octave % colors.length] + '80';
  }
  return 'transparent';
}

function handleGestureNote(note: string, playable: boolean) {
  if (!playable) return;
  if (lastGestureNote.value === note) return;

  const currentState = {
    selection: gestureSelection.value,
    trace: gestureTrace.value,
  };

  const nextState = applyPaintGestureStep(
    gestureBaseSelection.value,
    gestureMode.value,
    currentState,
    note,
  );

  if (nextState === currentState) {
    return;
  }

  preview(note);

  gestureSelection.value = nextState.selection;
  gestureTrace.value = nextState.trace;
  lastGestureNote.value = nextState.trace.at(-1) ?? null;
  rememberRecentPlayback([note]);
}

function beginGesture(note: string, playable: boolean) {
  if (!playable) return;
  if (gestureActive.value && lastGestureNote.value === note) return;

  staffDismissed.value = false;
  currentGesturePlaybackCount.value = 0;
  gestureActive.value = true;
  gestureBaseSelection.value = {
    ...(isModified.value ? userSelection.value : selected.value),
  };
  gestureMode.value = resolvePaintGestureMode(note, gestureBaseSelection.value);
  gestureSelection.value = { ...gestureBaseSelection.value };
  gestureTrace.value = [];
  lastGestureNote.value = null;
  handleGestureNote(note, playable);
}

function endGesture() {
  if (!gestureActive.value) return;

  if (
    soundMode.value !== 'sustain' &&
    !selectionsEqual(gestureSelection.value, gestureBaseSelection.value)
  ) {
    userSelection.value = { ...gestureSelection.value };
    isModified.value = true;
  } else if (soundMode.value === 'sustain') {
    userSelection.value = {};
    isModified.value = false;
  }

  gestureActive.value = false;
  gestureSelection.value = {};
  gestureBaseSelection.value = {};
  gestureMode.value = 'paint';
  gestureTrace.value = [];
  lastGestureNote.value = null;
  currentGesturePlaybackCount.value = 0;
  activePreviewNote.value = null;
  stopAll();
}

function preview(note: string) {
  if (!soundEnabled.value) {
    activePreviewNote.value = null;
    return;
  }

  if (soundMode.value === 'sustain') {
    activePreviewNote.value = note;
    void playNote(note, { mode: 'sustain' });
    return;
  }

  if (activePreviewNote.value) {
    stopNote(activePreviewNote.value, 0.03);
  }

  activePreviewNote.value = note;
  void playNote(note, { mode: 'short', replace: true, duration: 0.4 });
}

function clearSelectedNotes() {
  if (!hasManualSelectionToClear.value) return;
  resetUserSelection();
}

function isSelectionControlTarget(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(
        target.closest(
          'button, a, input, select, textarea, label, [role="button"]',
        ),
      )
    : false;
}

function handleOutsideBandoneonPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;
  if (!hasManualSelectionToClear.value) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('[data-bandoneon-key="true"]')) return;
  if (staffPanelEl.value?.contains(target)) return;
  if (pianoPanelEl.value?.contains(target)) return;
  if (isSelectionControlTarget(target)) return;
  if (!bandoneonPanelEl.value?.contains(target)) return;

  clearSelectedNotes();
}

function handleEscapeShortcut() {
  if (hasManualSelectionToClear.value) {
    clearSelectedNotes();
    escapeResetArmed.value = hasSearchContextToReset.value;
    return;
  }

  if (!hasSearchContextToReset.value) {
    escapeResetArmed.value = false;
    return;
  }

  if (!escapeResetArmed.value) {
    escapeResetArmed.value = true;
    return;
  }

  escapeResetArmed.value = false;
  store.resetSearch();
}

useKeyboard({ onEscape: handleEscapeShortcut });

function handleInteractionCancel() {
  activePreviewNote.value = null;
  stopAll();
  endGesture();
}

function handleDocumentVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    handleInteractionCancel();
  }
}

function onBandoneonStart(note: string) {
  beginGesture(note, isPlayableBandoneonNote(note));
}

function onPianoStart(note: string) {
  beginGesture(note, isPlayablePianoNote(note));
}

function onBandoneonHover(note: string) {
  if (!gestureActive.value) return;

  handleGestureNote(note, isPlayableBandoneonNote(note));
}

function onStaffStart(note: string) {
  beginGesture(note, isPlayableBandoneonNote(note));
}

function onStaffHover(note: string) {
  if (!gestureActive.value) return;

  handleGestureNote(note, isPlayableBandoneonNote(note));
}

function onPianoHover(note: string) {
  if (!gestureActive.value) return;

  handleGestureNote(note, isPlayablePianoNote(note));
}

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
  window.addEventListener('blur', handleInteractionCancel);
  document.addEventListener('pointerdown', handleOutsideBandoneonPointerDown);
  document.addEventListener('visibilitychange', handleDocumentVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', endGesture);
  window.removeEventListener('pointercancel', endGesture);
  window.removeEventListener('blur', handleInteractionCancel);
  document.removeEventListener(
    'pointerdown',
    handleOutsideBandoneonPointerDown,
  );
  document.removeEventListener(
    'visibilitychange',
    handleDocumentVisibilityChange,
  );
  handleInteractionCancel();
});
</script>
