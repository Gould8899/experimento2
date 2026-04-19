<template>
  <div :class="['print:hidden', compact ? 'grid gap-2.5' : 'mb-4 grid gap-3']">
    <div class="grid gap-1.5">
      <div
        class="text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-neutral-200"
      >
        {{ t('hand') }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <Button
          v-for="item in handOptions"
          :key="item.value"
          :aria-label="t(item.value)"
          :aria-pressed="side === item.value"
          :disabled="readonly"
          :class="
            compact
              ? 'flex min-h-13 w-full flex-col items-center justify-center gap-1 px-1.5 py-2 text-center'
              : 'flex min-h-16 w-full flex-col items-center justify-center gap-1.25 px-2 py-2.5 text-center'
          "
          :title="t(item.value)"
          @click="side = item.value"
        >
          <span
            :class="[
              'inline-flex shrink-0 items-center justify-center rounded-xl border border-current/15 bg-black/5 dark:bg-white/8',
              compact ? 'h-9.5 w-9.5' : 'h-11.5 w-11.5',
            ]"
          >
            <component
              :is="item.icon"
              :class="compact ? 'h-6.5 w-6.5' : 'h-8 w-8'"
            />
          </span>
          <span
            class="block text-[9px] leading-none font-bold tracking-[0.14em] uppercase"
          >
            {{ t(item.value) }}
          </span>
        </Button>
      </div>
    </div>
    <div class="grid gap-1.5">
      <div
        class="text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-neutral-200"
      >
        {{ t('bellows') }}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <Button
          v-for="item in directionOptions"
          :key="item.value"
          :aria-label="t(item.value)"
          :aria-pressed="direction === item.value"
          :disabled="readonly"
          :class="
            compact
              ? 'flex min-h-13 w-full flex-col items-center justify-center gap-1 px-1.5 py-2 text-center'
              : 'flex min-h-16 w-full flex-col items-center justify-center gap-1.25 px-2 py-2.5 text-center'
          "
          :title="t(item.value)"
          @click="direction = item.value"
        >
          <span
            :class="[
              'inline-flex shrink-0 items-center justify-center rounded-xl border border-current/15 bg-black/5 dark:bg-white/8',
              compact ? 'h-9.5 w-9.5' : 'h-11.5 w-11.5',
            ]"
          >
            <component
              :is="item.icon"
              :class="compact ? 'h-6.5 w-6.5' : 'h-8 w-8'"
            />
          </span>
          <span
            class="block text-[9px] leading-none font-bold tracking-[0.14em] uppercase"
          >
            {{ t(item.value) }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { useStore } from '../stores/main';
import Button from './Button.vue';
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
