<template>
  <div
    :class="['print:hidden', compact ? 'w-full' : 'mb-3 flex justify-center']"
  >
    <div
      :class="[
        'relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-950',
        compact ? 'h-22 w-full' : 'h-28 w-[22rem]',
      ]"
    >
      <button
        v-for="key in whiteKeys"
        :key="key.note"
        :aria-label="format(key.note)"
        :aria-pressed="key.note === tonic"
        :disabled="disabled"
        :class="[
          'absolute top-0 bottom-0 rounded-b-lg border border-neutral-300 bg-white transition dark:border-neutral-700 dark:bg-neutral-100',
          key.note === tonic
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-900 dark:bg-neutral-900'
            : 'hover:border-neutral-500',
        ]"
        :style="whiteKeyStyle(key)"
        type="button"
        @click.prevent="store.setTonic(key.note === tonic ? null : key.note)"
      >
        <span
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium"
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
          'absolute top-0 z-10 rounded-b-lg border border-neutral-950 bg-neutral-950 text-white shadow-sm transition',
          key.note === tonic
            ? 'ring-2 ring-sky-400/70 ring-offset-1 ring-offset-neutral-100 dark:ring-offset-neutral-950'
            : 'hover:border-neutral-700',
        ]"
        :style="blackKeyStyle(key)"
        type="button"
        @click.prevent="store.setTonic(key.note === tonic ? null : key.note)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Note } from 'tonal';
import { computed } from 'vue';
import { notes } from '../data/index';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import { scientificToSolfegeNotation } from '../utils/solfege';

withDefaults(defineProps<{ disabled?: boolean; compact?: boolean }>(), {
  compact: false,
});

const store = useStore();
const { tonic, showEnharmonics } = storeToRefs(store);

const settings = useSettingsStore();

const tonicKeys = notes.map((note) => ({
  note,
  isBlack: note.includes('#'),
}));

const whiteKeys = computed(() => tonicKeys.filter((item) => !item.isBlack));
const blackKeys = computed(() => tonicKeys.filter((item) => item.isBlack));
const whiteKeyWidth = computed(() => 100 / whiteKeys.value.length);

const format = (noteName: string): string => {
  if (settings.pitchNotation === 'solfege') {
    if (!showEnharmonics.value) {
      return scientificToSolfegeNotation(noteName).replace('#', '♯');
    }

    if (noteName.length === 2 && noteName[1] === '#') {
      return scientificToSolfegeNotation(Note.enharmonic(noteName)).replace(
        'b',
        '♭',
      );
    }

    return scientificToSolfegeNotation(noteName);
  }

  if (!showEnharmonics.value) {
    return noteName.replace('#', '♯');
  }

  if (noteName.length === 2 && noteName[1] === '#') {
    return Note.enharmonic(noteName).replace('b', '♭');
  }

  return noteName;
};

const compactLabel = (noteName: string) => {
  return format(noteName).replace(/[0-9]/g, '');
};

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
    height: '60%',
  };
};
</script>
