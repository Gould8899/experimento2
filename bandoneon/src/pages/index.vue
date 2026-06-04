<template>
  <div
    class="relative h-full overflow-x-hidden overflow-y-auto p-1.5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:p-2 md:pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:overflow-hidden lg:overflow-y-hidden lg:pb-0"
  >
    <div
      v-if="mobilePanelOpen"
      class="fixed inset-0 z-40 bg-neutral-950/25 lg:hidden"
      aria-hidden="true"
      @click="mobilePanelOpen = false"
    />

    <div
      class="grid min-h-full gap-2 lg:h-full lg:min-h-0 lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[14.5rem_minmax(0,1fr)]"
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

        <header class="flex items-start justify-between gap-2 px-0.5">
          <div class="min-w-0">
            <h1
              class="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              {{ t('app_title') }}
            </h1>
            <p
              class="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400"
              :title="workspaceSummary"
            >
              {{ workspaceSummary }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none aria-pressed:border-sky-600 aria-pressed:bg-sky-600 aria-pressed:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:aria-pressed:border-sky-500 dark:aria-pressed:bg-sky-500"
              :aria-label="t('toggle_sound')"
              :aria-pressed="soundEnabled"
              :title="t('toggle_sound')"
              @click="toggleSound"
            >
              <IconSpeakerWave v-if="soundEnabled" class="h-5 w-5" />
              <IconSpeakerX v-else class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              :aria-label="isDark ? t('light') : t('dark')"
              :title="isDark ? t('light') : t('dark')"
              @click="isDark = !isDark"
            >
              <IconSun v-if="isDark" class="h-5 w-5" />
              <IconMoon v-else class="h-5 w-5" />
            </button>
          </div>
        </header>

        <section
          class="min-w-0 overflow-x-hidden rounded-2xl border border-neutral-200 p-2 dark:border-neutral-800"
        >
          <div class="grid gap-2.5">
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

        <section
          class="min-w-0 overflow-x-hidden rounded-2xl border border-neutral-200 p-2 dark:border-neutral-800"
        >
          <Button
            class="w-full"
            :title="`${t('open_settings')} (${t('settings_open_shortcut')})`"
            @click="openSettings"
          >
            {{ t('open_settings') }}
          </Button>
        </section>

        <AppFooter @open-credits="openCredits" />
      </aside>

      <section
        class="flex min-h-0 flex-col rounded-3xl border border-neutral-200 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="grid min-h-0 flex-1 gap-2.5 lg:grid-rows-[minmax(0,1fr)_auto]"
        >
          <div
            ref="bandoneonPanelEl"
            class="grid min-h-0 gap-2.5 xl:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.98fr)] 2xl:grid-cols-[minmax(0,1.16fr)_minmax(22rem,1fr)]"
          >
            <div
              class="flex min-h-[16rem] min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100/80 px-1 py-2 sm:min-h-[20rem] lg:min-h-[22rem] xl:min-h-[24rem] 2xl:min-h-[28rem] dark:bg-neutral-800/40"
            >
              <div
                class="flex h-full min-h-0 w-full items-center justify-center"
              >
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
                      :stroke="scaleGuideStroke"
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
              :subtitle="pianoSubtitle"
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import AppCredits from '../components/AppCredits.vue';
import AppFooter from '../components/AppFooter.vue';
import AppSettings from '../components/AppSettings.vue';
import Button from '../components/Button.vue';
import IconBars3 from '../components/icons/IconBars3.vue';
import IconMoon from '../components/icons/IconMoon.vue';
import IconPalette from '../components/icons/IconPalette.vue';
import IconSpeakerWave from '../components/icons/IconSpeakerWave.vue';
import IconSpeakerX from '../components/icons/IconSpeakerX.vue';
import IconSun from '../components/icons/IconSun.vue';
import NavDisplay from '../components/NavDisplay.vue';
import NavVariant from '../components/NavVariant.vue';
import PianoKeyboard from '../components/PianoKeyboard.vue';
import StaffDisplay from '../components/StaffDisplay.vue';
import SvgButton from '../components/SvgButton.vue';
import SvgKeyboard from '../components/SvgKeyboard.vue';
import SvgPath from '../components/SvgPath.vue';
import { useKeyboard } from '../composables/useKeyboard';
import { useSynth } from '../composables/useSynth';
import { useDark } from '../composables/useDark';
import {
  arpeggioTypes,
  colors,
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
import {
  appendRecentPlaybackNotes,
  resolveStaffState,
  takeRecentPlaybackNotes,
} from '../utils/staffState';

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
  'grid min-w-0 content-start gap-2 overflow-x-hidden rounded-3xl border border-neutral-200 bg-white p-2.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900',
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
const { isDark } = useDark();

const pianoSubtitle = computed(() =>
  t('piano_subtitle', { instrument: t(instrument.value) }),
);

const workspaceSummary = computed(() => {
  const parts: string[] = [];

  if (tonic.value) {
    parts.push(tonic.value);
  }

  if (scaleType.value) {
    const scale = scaleTypes.find((item) => item.value === scaleType.value);
    if (scale) parts.push(t(scale.label));
  }

  if (chordType.value) {
    const arpeggio = arpeggioTypes.find((item) => item.value === chordType.value);
    parts.push(t(arpeggio?.label ?? chordType.value));
  }

  return parts.length > 0 ? parts.join(' · ') : t('workspace_idle');
});

const scaleGuideStroke = computed(() =>
  isDark.value ? 'rgba(56, 189, 248, 0.88)' : 'rgba(2, 132, 199, 0.92)',
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

useKeyboard({
  onEscape: handleEscapeShortcut,
  onOpenSettings: handleOpenSettingsShortcut,
});

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
