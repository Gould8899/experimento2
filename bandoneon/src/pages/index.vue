<template>
  <div
    class="relative h-full overflow-x-hidden overflow-y-auto p-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:overflow-hidden lg:overflow-y-hidden lg:p-1.5 lg:pb-1.5"
  >
    <div
      v-if="mobilePanelOpen"
      class="fixed inset-0 z-40 bg-neutral-950/25 lg:hidden"
      aria-hidden="true"
      @click="mobilePanelOpen = false"
    />

    <div
      class="grid min-h-full gap-1.5 lg:h-full lg:min-h-0 lg:grid-cols-[10.75rem_minmax(0,1fr)] xl:grid-cols-[11.25rem_minmax(0,1fr)]"
    >
      <aside :class="sidebarClasses">
        <div class="flex items-center justify-between gap-2 lg:hidden">
          <span
            class="text-[11px] font-semibold tracking-[0.12em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            {{ t('open_controls') }}
          </span>
          <button
            type="button"
            class="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-neutral-300 dark:hover:bg-neutral-800"
            @click="mobilePanelOpen = false"
          >
            {{ t('close_controls') }}
          </button>
        </div>

        <section class="min-w-0 overflow-x-hidden rounded-xl border border-neutral-200 p-1.5 dark:border-neutral-800">
          <NavVariant compact />
          <div class="my-1.5 border-t border-neutral-200/80 dark:border-neutral-800" />
          <NavDisplay
            compact
            :can-reset="canResetSelection"
            :show-scale-guides="showScaleGuides"
            :reset-title="resetActionLabel"
            :reset-shortcut="resetActionShortcut"
            :reset-search-shortcut="resetSearchShortcut"
            @reset="onReset"
            @reset-search="onResetSearch"
            @download="onDownload"
            @toggle-scale-guides="setScaleGuidesVisibility"
          />
        </section>

        <div class="grid grid-cols-2 gap-1">
          <Button
            class="w-full px-1 text-[11px]"
            :title="`${t('open_settings')} (${t('settings_open_shortcut')})`"
            @click="openSettings"
          >
            {{ t('open_settings') }}
          </Button>
          <button
            type="button"
            class="rounded-lg border border-neutral-300 px-1 py-1.5 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
            @click="openCredits"
          >
            {{ t('credits') }}
          </button>
        </div>
      </aside>

      <section
        class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="grid min-h-0 flex-1 gap-1.5 lg:grid-rows-[minmax(0,1fr)_auto]"
        >
          <div
            ref="bandoneonPanelEl"
            class="grid min-h-0 gap-1.5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
          >
            <div
              class="flex min-h-[12rem] min-w-0 items-stretch justify-center overflow-hidden rounded-xl bg-neutral-100/70 p-0.5 dark:bg-neutral-800/40"
            >
              <SvgKeyboard ref="keyboardEl" class="h-full w-full" :side="side" :mode="viewMode">
                  <SvgButton
                    v-for="([x, y, tonal], idx) in keyPositions"
                    :key="idx"
                    :selected="highlightedNotes[tonal]"
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
                    @start="(options) => onBandoneonStart(tonal, options)"
                    @hover="onBandoneonHover(tonal)"
                  />
                  <template v-if="showScaleGuides">
                    <SvgPath
                      v-for="(guide, index) in scaleGuidePaths"
                      :key="`${guide.octave}-${index}`"
                      :stroke="guide.stroke"
                      :d="guide.d"
                    />
                  </template>
                </SvgKeyboard>
            </div>

            <div ref="staffPanelEl" class="min-h-0 min-w-0">
              <StaffDisplay
                :notes="staffNotes"
                :note-staffs="staffNoteStaffs"
                :group-breaks="staffGroupBreaks"
                :note-colors="pianoNoteColors"
                :hand="side"
                :tonic="tonic"
                :scale-type="scaleType"
                :chord-type="chordType"
                :prefer-flats="showEnharmonics"
                :treble-playable-notes="treblePlayableNotes"
                :bass-playable-notes="bassPlayableNotes"
                :active-notes="staffActiveNotes"
                :show-melody-trail="staffShowMelodyTrail"
                :gesture-focus-note="gestureFocusNote"
                :gesture-active="gestureActive"
                :gesture-mode="gestureMode"
                @start="onStaffStart"
                @hover="onStaffHover"
                @reflect="onStaffReflect"
              />
            </div>
          </div>

          <div ref="pianoPanelEl" class="min-w-0">
            <div class="mb-1.5 flex items-center justify-end gap-1 px-0.5">
              <span
                class="text-[10px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400"
              >
                {{ t('keyboard_octave') }}
              </span>
              <span
                class="min-w-[1.75rem] rounded-md bg-neutral-100 px-1 py-0.5 text-center text-xs font-semibold tabular-nums text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {{ keyboardEffectiveBaseOctave }}
              </span>
              <Button
                class="min-w-7 px-1.5 py-1 text-sm"
                :aria-label="t('keyboard_octave_down')"
                @click="shiftKeyboardOctave(-1)"
              >
                {{ '{' }}
              </Button>
              <Button
                class="min-w-7 px-1.5 py-1 text-sm"
                :aria-label="t('keyboard_octave_up')"
                @click="shiftKeyboardOctave(1)"
              >
                {{ '}' }}
              </Button>
            </div>
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
              :prefer-flats="showEnharmonics"
              @start="onPianoStart"
              @hover="onPianoHover"
            />
          </div>
        </div>
      </section>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-1.5 border-t border-neutral-200 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-900/95 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
      :aria-label="t('open_controls')"
    >
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none aria-pressed:bg-sky-600 aria-pressed:text-white dark:text-neutral-200 dark:hover:bg-neutral-800 dark:aria-pressed:bg-sky-500"
        :aria-expanded="mobilePanelOpen"
        :aria-pressed="mobilePanelOpen"
        @click="mobilePanelOpen = !mobilePanelOpen"
      >
        <IconBars3 class="h-5 w-5" />
        <span class="text-[10px] font-semibold">{{ t('open_controls') }}</span>
      </button>
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none aria-pressed:bg-sky-600 aria-pressed:text-white dark:text-neutral-200 dark:hover:bg-neutral-800 dark:aria-pressed:bg-sky-500"
        :aria-label="t('toggle_sound')"
        :aria-pressed="soundEnabled"
        @click="toggleSound"
      >
        <IconSpeakerWave v-if="soundEnabled" class="h-5 w-5" />
        <IconSpeakerX v-else class="h-5 w-5" />
        <span class="text-[10px] font-semibold">{{
          soundEnabled ? t('on') : t('off')
        }}</span>
      </button>
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-neutral-200 dark:hover:bg-neutral-800"
        :title="`${t('open_settings')} (${t('settings_open_shortcut')})`"
        @click="openSettings"
      >
        <IconPalette class="h-5 w-5" />
        <span class="text-[10px] font-semibold">{{ t('open_settings') }}</span>
      </button>
    </nav>

    <AppSettings
      v-if="showSettings"
      @close="showSettings = false"
      @open-credits="openCredits"
    />
    <AppCredits v-if="showCredits" @close="showCredits = false" />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { Note } from 'tonal';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import AppCredits from '../components/AppCredits.vue';
import AppSettings from '../components/AppSettings.vue';
import Button from '../components/Button.vue';
import IconBars3 from '../components/icons/IconBars3.vue';
import IconPalette from '../components/icons/IconPalette.vue';
import IconSpeakerWave from '../components/icons/IconSpeakerWave.vue';
import IconSpeakerX from '../components/icons/IconSpeakerX.vue';
import NavDisplay from '../components/NavDisplay.vue';
import NavVariant from '../components/NavVariant.vue';
import PianoKeyboard from '../components/PianoKeyboard.vue';
import StaffDisplay from '../components/StaffDisplay.vue';
import SvgButton from '../components/SvgButton.vue';
import SvgKeyboard from '../components/SvgKeyboard.vue';
import SvgPath from '../components/SvgPath.vue';
import { useKeyboard } from '../composables/useKeyboard';
import { useSynth } from '../composables/useSynth';
import {
  getInstrumentNotesForSide,
  instrumentFullNoteRange,
  isArpeggioType,
  usesFormulaChordType,
} from '../data/index';
import { octaveColorForNote, octaveColorMap, withHexAlpha } from '../utils/octaveColor';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import { buildKeyboardExportFilename } from '../utils/export';
import {
  buildHarmonicPitchClasses,
  noteMatchesPitchClasses,
} from '../utils/harmonic';
import {
  clampKeyboardBaseOctave,
  inferDefaultKeyboardBaseOctave,
} from '../utils/pianoKeyboardOctave';
import {
  buildColoredScaleGuidePaths,
} from '../utils/scaleGuides';
import {
  applyPaintGestureStep,
  resolvePaintGestureMode,
  selectionsEqual,
  type PaintGestureMode,
} from '../utils/paintGesture';
import {
  appendRecentPlaybackNotes,
  sortNotesByMidi,
  takeRecentPlaybackNotes,
} from '../utils/staffState';
import { handForStaff, staffForHand, staffForNoteRegister, type StaffName } from '../utils/staffPointer';

// Main exploration view for the instrument: chords, scales, overlays and manual edits.
const { t } = useI18n({ useScope: 'global' });

useHead({
  title: () => `${t('page_title')} - ${t('app_title')}`,
});
const { playNote, stopAll, stopNote } = useSynth();

const keyboardEl = ref<typeof SvgKeyboard>();
const bandoneonPanelEl = ref<HTMLDivElement | null>(null);
const staffPanelEl = ref<HTMLDivElement | null>(null);
const pianoPanelEl = ref<HTMLDivElement | null>(null);
const showSettings = ref(false);
const showCredits = ref(false);
const mobilePanelOpen = ref(false);

const sidebarClasses = computed(() => [
  'grid min-w-0 content-start gap-1.5 overflow-x-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900',
  mobilePanelOpen.value
    ? 'fixed inset-x-3 top-3 z-50 max-h-[calc(100dvh-5.75rem-env(safe-area-inset-bottom))] overflow-y-auto shadow-2xl'
    : 'hidden lg:grid lg:min-h-0 lg:overflow-y-auto',
]);

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
const hasVisibleStaffContext = computed(
  () =>
    !interactionHighlightSuppressed.value &&
    !gestureActive.value &&
    !isModified.value &&
    (recentPlaybackNotes.value.length > 0 ||
      (chordNotes.value.length > 0 && !isArpeggioSelection.value)),
);
const hasSelectionToClear = computed(
  () => hasManualSelectionToClear.value || hasVisibleStaffContext.value,
);
const hasSearchContextToReset = computed(
  () =>
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
  !store.isUserChord && hasSelectionToClear.value ? 'Esc' : undefined,
);
const resetSearchShortcut = computed(() =>
  hasSearchContextToReset.value ? 'Esc Esc' : undefined,
);
const isModified = ref(false);
const interactionHighlightSuppressed = ref(false);
const userSelection = ref<Record<string, boolean>>({});
const interactionMode = ref<'paint-on'>('paint-on');
const gestureActive = ref(false);
const gestureSelection = ref<Record<string, boolean>>({});
const gestureBaseSelection = ref<Record<string, boolean>>({});
const gestureMode = ref<PaintGestureMode>('paint');
const gestureTrace = ref<string[]>([]);
const lastGestureNote = ref<string | null>(null);
const recentPlaybackNotes = ref<string[]>([]);
const recentPlaybackStaffs = ref<StaffName[]>([]);
const recentPlaybackGroups = ref<number[]>([]);
const currentGesturePlaybackCount = ref(0);
const gestureStaff = ref<StaffName | null>(null);
const activePreviewNote = ref<string | null>(null);
const soundingNotes = ref(new Set<string>());
const keyboardHeldNotes = ref(new Set<string>());
const staffReflectNote = ref<string | null>(null);
const keyboardOctaveShift = ref(0);
const keyboardHandBaseOctave = ref(4);
const gestureFocusNote = computed(
  () => lastGestureNote.value ?? staffReflectNote.value,
);

const visibleNotes = computed(() => keyPositions.value.map((item) => item[2]));

function keyboardPlayCandidates() {
  return visibleNotes.value.filter((note) => isPlayableBandoneonNote(note));
}

function syncKeyboardHandBaseOctave() {
  keyboardHandBaseOctave.value = inferDefaultKeyboardBaseOctave(
    keyboardPlayCandidates(),
  );
}

const keyboardEffectiveBaseOctave = computed(() =>
  clampKeyboardBaseOctave(
    keyboardHandBaseOctave.value + keyboardOctaveShift.value,
  ),
);

function shiftKeyboardOctave(delta: number) {
  const nextBase = clampKeyboardBaseOctave(
    keyboardEffectiveBaseOctave.value + delta,
  );
  keyboardOctaveShift.value = nextBase - keyboardHandBaseOctave.value;
}

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

const scaleGuidePaths = computed(() =>
  buildColoredScaleGuidePaths(harmonicGuideNotes.value, (notes) => {
    const path = buildScalePath(notes);
    return path || null;
  }),
);

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
  const staff = gestureStaff.value ?? staffForHand(side.value);

  recentPlaybackNotes.value = options?.replace
    ? takeRecentPlaybackNotes(notes)
    : appendRecentPlaybackNotes(recentPlaybackNotes.value, notes);

  if (options?.replace) {
    recentPlaybackStaffs.value = recentPlaybackNotes.value.map(() => staff);
    recentPlaybackGroups.value = recentPlaybackNotes.value.length
      ? [recentPlaybackNotes.value.length]
      : [];
    currentGesturePlaybackCount.value = recentPlaybackNotes.value.length;
    return;
  }

  if (notes.length === 0) {
    return;
  }

  recentPlaybackStaffs.value = [
    ...recentPlaybackStaffs.value,
    ...notes.map(() => staff),
  ];
  recentPlaybackStaffs.value = recentPlaybackStaffs.value.slice(
    -recentPlaybackNotes.value.length,
  );

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
  recentPlaybackStaffs.value = [];
  recentPlaybackGroups.value = [];
  currentGesturePlaybackCount.value = 0;
}

function resetKeyboardSelection() {
  userSelection.value = {};
  isModified.value = false;
  keyboardHeldNotes.value.clear();
  resetGestureState();
  stopAllSounds();
}

const resetUserSelection = () => {
  clearStaffScore();
};

function suppressInteractionHighlights() {
  interactionHighlightSuppressed.value = true;
}

function clearStaffScore() {
  if (gestureActive.value) {
    resetGestureState();
  }

  keyboardHeldNotes.value.clear();
  userSelection.value = {};
  isModified.value = false;
  clearRecentPlayback();
  staffReflectNote.value = null;
  stopAllSounds();
}

watch(side, () => {
  keyboardOctaveShift.value = 0;
  syncKeyboardHandBaseOctave();
});

watch([side, direction], () => {
  if (gestureActive.value || suppressSelectionReset.value) return;
  resetKeyboardSelection();
});

watch(scaleType, (next, previous) => {
  if (next === previous) return;
  clearStaffScore();
});

watch(chordType, (next, previous) => {
  if (next === previous) return;
  clearStaffScore();
});

watch([tonic, showEnharmonics], () => {
  if (suppressSelectionReset.value) return;
  clearStaffScore();
});

watch(resetNonce, () => {
  clearStaffScore();
});

watch(soundEnabled, (enabled) => {
  if (!enabled) {
    stopAllSounds();
  }
});

watch(soundMode, () => {
  stopAllSounds();
});

watch(
  [tonic, chordType, scaleType, showEnharmonics, showColors],
  () => {
    syncKeyboardHandBaseOctave();
  },
);

watch(
  [side, direction, tonic, chordType, scaleType, showEnharmonics, showColors],
  () => {
    escapeResetArmed.value = false;
  },
);

const voicingNotes = computed(() => {
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

const selected = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;
  return voicingNotes.value;
});

const highlightedNotes = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;
  if (staffReflectNote.value) {
    return { [staffReflectNote.value]: true };
  }
  if (recentPlaybackNotes.value.length > 0) {
    return Object.fromEntries(
      recentPlaybackNotes.value.map((note) => [note, true]),
    );
  }
  if (interactionHighlightSuppressed.value) return {};
  return voicingNotes.value;
});

const pianoActiveNotes = computed(() => highlightedNotes.value);

const pianoNoteColors = computed(() =>
  octaveColorMap(instrumentFullNoteRange),
);

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

const suppressSelectionReset = ref(false);

function setHand(hand: 'left' | 'right', options?: { preservePlayback?: boolean }) {
  if (side.value === hand) return;

  if (options?.preservePlayback) {
    suppressSelectionReset.value = true;
  }

  store.$patch({ side: hand });

  if (options?.preservePlayback) {
    void nextTick(() => {
      suppressSelectionReset.value = false;
    });
  }
}

function playableNotesForHand(hand: 'left' | 'right') {
  const notes = getInstrumentNotesForSide(instrument.value, hand);

  return notes.filter((note) => {
    if (pianoMutedNoteSet.value.has(note)) return false;

    if (hand === currentHand.value) {
      return (
        visibleNotes.value.includes(note) &&
        !pianoSecondaryNoteSet.value.has(note)
      );
    }

    return otherHandExclusiveNotes.value.includes(note);
  });
}

const treblePlayableNotes = computed(() => playableNotesForHand('right'));
const bassPlayableNotes = computed(() => playableNotesForHand('left'));

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
  if (gestureActive.value) {
    return {
      notes:
        recentPlaybackNotes.value.length > 0
          ? recentPlaybackNotes.value
          : gestureTrace.value,
      source: 'gesture' as const,
    };
  }

  if (recentPlaybackNotes.value.length > 0) {
    return {
      notes: recentPlaybackNotes.value,
      source: 'recent' as const,
    };
  }

  if (isModified.value) {
    return {
      notes: sortNotesByMidi(
        Object.keys(userSelection.value).filter((note) => userSelection.value[note]),
      ),
      source: 'manual' as const,
    };
  }

  return { notes: [], source: 'idle' as const };
});

const staffNotes = computed(() => staffState.value.notes);

const staffActiveNotes = computed(() => {
  if (gestureActive.value) return gestureSelection.value;
  if (isModified.value) return userSelection.value;
  if (staffNotes.value.length === 0) return {};

  return Object.fromEntries(staffNotes.value.map((note) => [note, true]));
});

const staffShowMelodyTrail = computed(() => {
  const source = staffState.value.source;
  return source === 'gesture' || source === 'recent';
});

const staffNoteStaffs = computed(() => {
  const notes = staffNotes.value;
  if (notes.length === 0) return [] as StaffName[];

  const source = staffState.value.source;
  if (source === 'gesture' || source === 'recent') {
    if (recentPlaybackStaffs.value.length === notes.length) {
      return recentPlaybackStaffs.value;
    }

    if (gestureStaff.value) {
      return notes.map(() => gestureStaff.value!);
    }

    return notes.map(() => staffForHand(side.value));
  }

  return notes.map((note) => staffForNoteRegister(note));
});

const staffGroupBreaks = computed(() => {
  if (
    staffState.value.source !== 'gesture' &&
    staffState.value.source !== 'recent'
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

function color(tonal: string) {
  if (showColors.value) {
    return withHexAlpha(octaveColorForNote(tonal), '80');
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

  startNoteSound(note);

  gestureSelection.value = nextState.selection;
  gestureTrace.value = nextState.trace;
  lastGestureNote.value = nextState.trace.at(-1) ?? null;
  rememberRecentPlayback([note]);
}

function beginGesture(
  note: string,
  playable: boolean,
  options?: { additive?: boolean },
) {
  if (!playable) return;
  if (gestureActive.value && lastGestureNote.value === note) return;

  interactionHighlightSuppressed.value = false;
  currentGesturePlaybackCount.value = 0;
  gestureActive.value = true;

  if (options?.additive) {
    gestureBaseSelection.value = {
      ...(isModified.value ? userSelection.value : {}),
    };
    gestureMode.value = 'paint';
  } else {
    gestureBaseSelection.value = {
      ...(isModified.value ? userSelection.value : selected.value),
    };
    gestureMode.value = resolvePaintGestureMode(
      note,
      gestureBaseSelection.value,
    );
  }

  gestureSelection.value = { ...gestureBaseSelection.value };
  gestureTrace.value = [];
  lastGestureNote.value = null;
  handleGestureNote(note, playable);
}

function commitGestureSelection() {
  if (!selectionsEqual(gestureSelection.value, gestureBaseSelection.value)) {
    userSelection.value = { ...gestureSelection.value };
    isModified.value = true;
  }
}

function resetGestureState() {
  gestureActive.value = false;
  gestureSelection.value = {};
  gestureBaseSelection.value = {};
  gestureMode.value = 'paint';
  gestureTrace.value = [];
  lastGestureNote.value = null;
  currentGesturePlaybackCount.value = 0;
  gestureStaff.value = null;
  activePreviewNote.value = null;
}

function endGesture() {
  if (!gestureActive.value) return;

  resetGestureState();
  stopAllSounds();
}

function startNoteSound(note: string) {
  if (!soundEnabled.value) return;
  if (soundingNotes.value.has(note)) return;

  soundingNotes.value.add(note);
  activePreviewNote.value = note;
  void playNote(note, { mode: 'sustain', replace: false });
}

function stopNoteSound(note: string) {
  if (!soundingNotes.value.has(note)) return;

  soundingNotes.value.delete(note);
  stopNote(note, 0.05);

  if (activePreviewNote.value === note) {
    activePreviewNote.value = null;
  }
}

function stopAllSounds() {
  soundingNotes.value.clear();
  activePreviewNote.value = null;
  stopAll();
}

function preview(note: string) {
  startNoteSound(note);
}

function beginKeyboardSession(additive: boolean) {
  gestureActive.value = true;
  gestureMode.value = 'paint';
  gestureTrace.value = [];
  lastGestureNote.value = null;
  currentGesturePlaybackCount.value = 0;
  gestureStaff.value = null;

  gestureBaseSelection.value = additive
    ? { ...(isModified.value ? userSelection.value : {}) }
    : {};
  gestureSelection.value = { ...gestureBaseSelection.value };
}

function onKeyboardNoteDown(note: string, additive = false) {
  if (!isPlayableBandoneonNote(note)) return;
  if (keyboardHeldNotes.value.has(note)) return;

  if (keyboardHeldNotes.value.size === 0) {
    beginKeyboardSession(additive);
  }

  keyboardHeldNotes.value.add(note);

  if (!gestureSelection.value[note]) {
    gestureSelection.value = { ...gestureSelection.value, [note]: true };
    rememberRecentPlayback([note]);
  }

  startNoteSound(note);
  lastGestureNote.value = note;
}

function onKeyboardNoteUp(note: string) {
  if (!keyboardHeldNotes.value.has(note)) return;

  keyboardHeldNotes.value.delete(note);
  stopNoteSound(note);

  if (keyboardHeldNotes.value.size === 0) {
    endGesture();
  }
}

function dismissDisplayedContext() {
  resetUserSelection();
  suppressInteractionHighlights();
}

function clearSelectedNotes() {
  if (!hasSelectionToClear.value) return;
  dismissDisplayedContext();
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
  if (gestureActive.value) return;
  if (!hasSelectionToClear.value) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('[data-bandoneon-key="true"]')) return;
  if (staffPanelEl.value?.contains(target)) return;
  if (pianoPanelEl.value?.contains(target)) return;
  if (isSelectionControlTarget(target)) return;
  if (!bandoneonPanelEl.value?.contains(target)) return;

  clearSelectedNotes();
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
}

function openSettings() {
  mobilePanelOpen.value = false;
  showCredits.value = false;
  showSettings.value = !showSettings.value;
}

function openCredits() {
  showSettings.value = false;
  mobilePanelOpen.value = false;
  showCredits.value = true;
}

function handleOpenSettingsShortcut() {
  openSettings();
}

function handleEscapeShortcut() {
  if (showCredits.value) {
    showCredits.value = false;
    return;
  }

  if (showSettings.value) {
    showSettings.value = false;
    return;
  }

  if (mobilePanelOpen.value) {
    mobilePanelOpen.value = false;
    return;
  }

  if (hasSelectionToClear.value) {
    dismissDisplayedContext();
    escapeResetArmed.value = false;
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

useKeyboard({
  onEscape: handleEscapeShortcut,
  onOpenSettings: handleOpenSettingsShortcut,
  play: {
    noteCandidates: keyboardPlayCandidates,
    getBaseOctave: () => keyboardEffectiveBaseOctave.value,
    onOctaveChange: shiftKeyboardOctave,
    onNoteDown: (note, options) => {
      onKeyboardNoteDown(note, options?.additive ?? false);
    },
    onNoteUp: (note) => {
      onKeyboardNoteUp(note);
    },
  },
});

function handleInteractionCancel() {
  clearStaffReflect();
  keyboardHeldNotes.value.clear();
  stopAllSounds();
  if (gestureActive.value) {
    resetGestureState();
    clearRecentPlayback();
  }
}

function handleDocumentVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    handleInteractionCancel();
  }
}

function onBandoneonStart(
  note: string,
  options?: { additive?: boolean },
) {
  beginGesture(note, isPlayableBandoneonNote(note), options);
}

function onPianoStart(
  note: string,
  options?: { additive?: boolean },
) {
  if (pianoSecondaryNoteSet.value.has(note)) {
    setHand(otherHand.value, { preservePlayback: true });
  }

  beginGesture(note, isPlayableBandoneonNote(note), options);
}

function onBandoneonHover(note: string) {
  if (!gestureActive.value) return;

  handleGestureNote(note, isPlayableBandoneonNote(note));
}

function clearStaffReflect() {
  if (!staffReflectNote.value) return;

  stopNoteSound(staffReflectNote.value);
  staffReflectNote.value = null;
}

function handlePointerUp() {
  clearStaffReflect();
  endGesture();
}

function maybeSwitchHandForStaffNote(note: string, staff: StaffName) {
  const staffHand = handForStaff(staff);
  if (staffHand === side.value) return;

  if (playableNotesForHand(side.value).includes(note)) return;

  if (playableNotesForHand(staffHand).includes(note)) {
    setHand(staffHand, { preservePlayback: true });
  }
}

function onStaffReflect(note: string, staff: StaffName) {
  maybeSwitchHandForStaffNote(note, staff);

  staffReflectNote.value = note;
  preview(note);
}

function onStaffStart(
  note: string,
  staff: StaffName,
  options?: { additive?: boolean },
) {
  gestureStaff.value = staff;
  maybeSwitchHandForStaffNote(note, staff);
  beginGesture(note, isPlayableBandoneonNote(note), options);
}

function onStaffHover(note: string, staff: StaffName) {
  if (!gestureActive.value) return;
  if (gestureStaff.value && staff !== gestureStaff.value) return;

  handleGestureNote(note, isPlayableBandoneonNote(note));
}

function onPianoHover(note: string) {
  if (!gestureActive.value) return;

  if (pianoSecondaryNoteSet.value.has(note)) {
    setHand(otherHand.value, { preservePlayback: true });
  }

  handleGestureNote(note, isPlayableBandoneonNote(note));
}

const onReset = () => {
  dismissDisplayedContext();
  if (chordName.value && !isArpeggioSelection.value) {
    settings.resetUserChord(side.value, chordName.value);
  }
};

const onResetSearch = () => {
  store.resetSearch();
};

onMounted(() => {
  store.$reset();
  settings.$patch({ soundMode: 'short' });
  syncKeyboardHandBaseOctave();
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('blur', handleInteractionCancel);
  document.addEventListener('pointerdown', handleOutsideBandoneonPointerDown);
  document.addEventListener('visibilitychange', handleDocumentVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('pointercancel', handlePointerUp);
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
