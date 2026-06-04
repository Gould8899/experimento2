<template>
  <div :class="['print:hidden', compact ? 'grid gap-1' : 'mb-4 grid gap-3']">
    <div class="grid grid-cols-2 gap-1">
      <button
        v-for="item in handOptions"
        :key="item.value"
        type="button"
        :aria-label="t(item.value)"
        :aria-pressed="side === item.value"
        :disabled="readonly"
        :title="t(item.value)"
        :class="buttonClass(side === item.value, 'sky')"
        @click="side = item.value"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
      </button>
    </div>

    <div class="grid grid-cols-2 gap-1">
      <button
        v-for="item in directionOptions"
        :key="item.value"
        type="button"
        :aria-label="t(item.value)"
        :aria-pressed="direction === item.value"
        :disabled="readonly"
        :title="t(item.value)"
        :class="buttonClass(direction === item.value, 'amber')"
        @click="direction = item.value"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
      </button>
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
  { value: 'close' as const, icon: IconBellowsClose },
  { value: 'open' as const, icon: IconBellowsOpen },
];

function buttonClass(active: boolean, accent: 'sky' | 'amber') {
  const base =
    'inline-flex h-10 w-full items-center justify-center rounded-lg border transition-colors select-none disabled:cursor-not-allowed disabled:opacity-40';

  if (active && accent === 'sky') {
    return `${base} border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500`;
  }

  if (active && accent === 'amber') {
    return `${base} border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-neutral-900`;
  }

  return `${base} border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800`;
}
</script>
