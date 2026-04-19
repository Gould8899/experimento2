<template>
  <div
    :class="['print:hidden', compact ? 'grid w-full gap-2' : 'mb-3 grid gap-2']"
  >
    <div class="flex items-center justify-between gap-2">
      <div
        class="text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-neutral-200"
      >
        {{ t('tonic') }}
      </div>
      <div
        class="rounded-full border px-2 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase"
        :class="
          tonic
            ? 'border-sky-500 bg-sky-500 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-neutral-950'
            : 'border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300'
        "
      >
        {{ tonic ? format(tonic) : t('tonic_none') }}
      </div>
    </div>

    <div
      ref="tonicKeyboardEl"
      :class="[
        'relative isolate overflow-hidden rounded-xl border border-neutral-300 bg-linear-to-b from-neutral-50 to-neutral-100 p-1 shadow-inner dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-950',
        compact ? 'h-20 w-full' : 'h-24 w-[21rem]',
      ]"
      @pointerup="endTonicDrag"
      @pointercancel="endTonicDrag"
    >
      <button
        v-for="key in whiteKeys"
        :key="key.note"
        :aria-label="format(key.note)"
        :aria-pressed="key.note === tonic"
        :disabled="disabled"
        :class="[
          'absolute top-0 right-auto bottom-0 z-10 rounded-b-md border text-neutral-700 transition-all focus-visible:z-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed dark:text-neutral-900 dark:focus-visible:ring-sky-300 dark:focus-visible:ring-offset-neutral-950',
          key.note === tonic
            ? 'border-sky-500 bg-sky-500 text-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)] dark:border-sky-400 dark:bg-sky-400 dark:text-neutral-950 dark:shadow-[0_0_0_2px_rgba(10,10,10,0.7)]'
            : 'border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-100 dark:hover:border-neutral-500',
        ]"
        :style="whiteKeyStyle(key)"
        type="button"
        @pointerdown.prevent="beginTonicDrag($event, key.note)"
        @pointerenter="handleTonicDrag(key.note)"
      >
        <span
          class="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.04em]"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.note"
        :aria-label="format(key.note)"
        :aria-pressed="key.note === tonic"
        :disabled="disabled"
        :class="[
          'absolute top-0 z-30 rounded-b-md border border-neutral-950 bg-neutral-950 text-white shadow-sm transition-all focus-visible:z-50 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed dark:focus-visible:ring-sky-300 dark:focus-visible:ring-offset-neutral-950',
          key.note === tonic
            ? 'z-40 border-sky-300 bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-1 ring-offset-white dark:border-sky-200 dark:ring-offset-neutral-950'
            : 'hover:border-neutral-700 hover:bg-neutral-800',
        ]"
        :style="blackKeyStyle(key)"
        type="button"
        @pointerdown.prevent="beginTonicDrag($event, key.note)"
        @pointerenter="handleTonicDrag(key.note)"
      >
        <span
          class="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-[0.04em]"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { notes } from '../data/index';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import { formatDisplayedNote } from '../utils/staffNotation';

withDefaults(defineProps<{ disabled?: boolean; compact?: boolean }>(), {
  compact: false,
});

const { t } = useI18n({ useScope: 'global' });
const store = useStore();
const { tonic, showEnharmonics } = storeToRefs(store);

const settings = useSettingsStore();
const tonicKeyboardEl = ref<HTMLDivElement | null>(null);
const activePointerId = ref<number | null>(null);

const tonicKeys = notes.map((note) => ({
  note,
  isBlack: note.includes('#'),
}));

const whiteKeys = computed(() => tonicKeys.filter((item) => !item.isBlack));
const blackKeys = computed(() => tonicKeys.filter((item) => item.isBlack));
const whiteKeyWidth = computed(() => 100 / whiteKeys.value.length);

const format = (noteName: string): string => {
  const pitchNotation =
    settings.pitchNotation === 'helmholtz'
      ? 'scientific'
      : settings.pitchNotation;

  return formatDisplayedNote(
    `${noteName}4`,
    pitchNotation,
    showEnharmonics.value,
    { includeOctave: false },
  );
};

const compactLabel = (noteName: string) => {
  return format(noteName).replace(/[0-9]/g, '');
};

const selectTonic = (noteName: string) => {
  if (tonic.value === noteName) return;
  store.setTonic(noteName);
};

function beginTonicDrag(event: PointerEvent, noteName: string) {
  if (event.button !== 0) return;
  activePointerId.value = event.pointerId;
  selectTonic(noteName);
}

function handleTonicDrag(noteName: string) {
  if (activePointerId.value === null) return;
  selectTonic(noteName);
}

function endTonicDrag(event?: PointerEvent) {
  if (
    event &&
    activePointerId.value !== null &&
    event.pointerId !== activePointerId.value
  ) {
    return;
  }

  activePointerId.value = null;
}

function handleWindowPointerUp(event: PointerEvent) {
  endTonicDrag(event);
}

onMounted(() => {
  window.addEventListener('pointerup', handleWindowPointerUp);
  window.addEventListener('pointercancel', handleWindowPointerUp);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', handleWindowPointerUp);
  window.removeEventListener('pointercancel', handleWindowPointerUp);
});

const whiteKeyStyle = (key: { note: string }) => {
  const index = whiteKeys.value.findIndex((item) => item.note === key.note);
  return {
    left: `${index * whiteKeyWidth.value}%`,
    width: `${whiteKeyWidth.value}%`,
  };
};

const blackOffsets: Record<string, number> = {
  'C#': 1 - 0.33,
  'D#': 2 - 0.33,
  'F#': 4 - 0.33,
  'G#': 5 - 0.33,
  'A#': 6 - 0.33,
};

const blackKeyStyle = (key: { note: string }) => {
  return {
    left: `${((blackOffsets[key.note] ?? 0) / whiteKeys.value.length) * 100}%`,
    width: `${whiteKeyWidth.value * 0.62}%`,
    height: '62%',
  };
};
</script>
