<template>
  <div class="grid gap-3">
    <div
      v-for="layout in PIANO_SHORTCUT_LAYOUTS"
      :key="layout.id"
      class="rounded-xl border border-neutral-200 bg-neutral-50/80 p-2 dark:border-neutral-700 dark:bg-neutral-800/40"
    >
      <div
        class="mb-2 text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t(layout.labelKey) }}
      </div>

      <div
        class="relative overflow-hidden rounded-lg border border-neutral-300/80 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-950"
        :style="{ height: `${keyboardHeight}px` }"
      >
        <div class="absolute inset-0 flex">
          <div
            v-for="whiteKey in layout.whiteKeys"
            :key="`${layout.id}-w-${whiteKey.key}`"
            class="relative flex min-w-0 flex-1 flex-col items-center justify-end border-r border-neutral-300/90 bg-white px-0.5 pb-1.5 last:border-r-0 dark:border-neutral-700 dark:bg-neutral-100"
          >
            <span
              class="font-mono text-[10px] leading-none font-bold text-neutral-900"
            >
              {{ formatDisplayKey(whiteKey.displayKey) }}
            </span>
            <span
              class="mt-1 text-[8px] leading-none text-neutral-500 dark:text-neutral-600"
            >
              {{ pitchLabel(whiteKey.pitchClass) }}
            </span>
          </div>
        </div>

        <div
          v-for="blackKey in layout.blackKeys"
          :key="`${layout.id}-b-${blackKey.key}`"
          class="absolute top-0 z-10 flex flex-col items-center justify-end rounded-b-md border border-black bg-neutral-900 px-0.5 pb-1 text-white shadow-md dark:bg-black"
          :style="blackKeyStyle(blackKey, layout.whiteKeyCount)"
        >
          <span class="font-mono text-[9px] leading-none font-bold">
            {{ formatDisplayKey(blackKey.displayKey) }}
          </span>
          <span class="mt-0.5 text-[7px] leading-none text-neutral-300">
            {{ pitchLabel(blackKey.pitchClass) }}
          </span>
        </div>
      </div>
    </div>

    <p class="text-[10px] leading-snug text-neutral-500 dark:text-neutral-400">
      {{ t('shortcut_piano_octave_hint') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { PIANO_SHORTCUT_LAYOUTS } from '../constants/keyboardShortcuts';
import type { PianoShortcutKeyDisplay } from '../constants/keyboardShortcuts';
import { formatDisplayedNote } from '../utils/staffNotation';

const keyboardHeight = 96;

const { t, locale } = useI18n({ useScope: 'global' });

function formatDisplayKey(key: string) {
  return key;
}

function pitchLabel(pitchClass: string) {
  const solfege = locale.value === 'es';
  return formatDisplayedNote(
    pitchClass,
    solfege ? 'solfege' : 'scientific',
    false,
  ).replace(/[0-9]/g, '');
}

function blackKeyStyle(
  blackKey: PianoShortcutKeyDisplay,
  whiteKeyCount: number,
) {
  const whiteWidth = 100 / whiteKeyCount;
  const width = whiteWidth * 0.62;

  return {
    left: `${blackKey.whiteIndex * whiteWidth}%`,
    width: `${width}%`,
    height: '62%',
  };
}
</script>
