<template>
  <div :class="['print:hidden', compact ? 'grid gap-2.5' : 'mb-4 grid gap-3']">
    <!-- Hand selector: sky-blue accent for active state -->
    <div class="grid gap-1.5">
      <div
        class="text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t('hand') }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="item in handOptions"
          :key="item.value"
          type="button"
          :aria-label="t(item.value)"
          :aria-pressed="side === item.value"
          :disabled="readonly"
          :title="t(item.value + '_desc')"
          :class="[
            'flex w-full flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center transition-colors select-none disabled:cursor-not-allowed',
            compact ? 'min-h-[52px]' : 'min-h-[64px]',
            side === item.value
              ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500'
              : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:border-neutral-200 disabled:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:disabled:border-neutral-800 dark:disabled:text-neutral-600',
          ]"
          @click="side = item.value"
        >
          <component
            :is="item.icon"
            :class="compact ? 'h-6 w-6 shrink-0' : 'h-7 w-7 shrink-0'"
          />
          <span
            class="block text-[9px] leading-none font-bold tracking-[0.12em] uppercase"
          >
            {{ t(item.value) }}
          </span>
          <span
            :class="[
              'block truncate text-[8px] leading-tight font-medium',
              side === item.value
                ? 'opacity-75'
                : 'text-neutral-500 dark:text-neutral-400',
            ]"
          >
            {{ t(item.value + '_desc') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Bellows direction selector: amber accent for active state -->
    <div class="grid gap-1.5">
      <div
        class="text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t('bellows') }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="item in directionOptions"
          :key="item.value"
          type="button"
          :aria-label="t(item.value)"
          :aria-pressed="direction === item.value"
          :disabled="readonly"
          :title="t(item.value + '_desc')"
          :class="[
            'flex w-full flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center transition-colors select-none disabled:cursor-not-allowed',
            compact ? 'min-h-[52px]' : 'min-h-[64px]',
            direction === item.value
              ? 'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-neutral-900'
              : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:border-neutral-200 disabled:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:disabled:border-neutral-800 dark:disabled:text-neutral-600',
          ]"
          @click="direction = item.value"
        >
          <component
            :is="item.icon"
            :class="compact ? 'h-6 w-6 shrink-0' : 'h-7 w-7 shrink-0'"
          />
          <span
            class="block text-[9px] leading-none font-bold tracking-[0.12em] uppercase"
          >
            {{ t(item.value) }}
          </span>
          <span
            :class="[
              'block truncate text-[8px] leading-tight font-medium',
              direction === item.value
                ? 'opacity-75'
                : 'text-neutral-500 dark:text-neutral-400',
            ]"
          >
            {{ t(item.value + '_desc') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { useStore } from '../stores/main';
import IconBellowsClose from './icons/IconBellowsClose.vue';
import IconBellowsOpen from './icons/IconBellowsOpen.vue';
import IconHandLeft from './icons/IconHandLeft.vue';
import IconHandRight from './icons/IconHandRight.vue';

withDefaults(defineProps<{ readonly?: boolean; compact?: boolean }>(), {
  compact: false,
});

const { t } = useI18n({ useScope: 'global' });
const store = useStore();
const { side, direction } = storeToRefs(store);

const handOptions = [
  { value: 'left' as const, icon: IconHandLeft },
  { value: 'right' as const, icon: IconHandRight },
];

const directionOptions = [
  {
    value: 'close' as const,
    icon: IconBellowsClose,
  },
  { value: 'open' as const, icon: IconBellowsOpen },
];
</script>
