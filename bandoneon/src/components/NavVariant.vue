<template>
  <div :class="['print:hidden', compact ? 'grid gap-2.5' : 'mb-5 grid gap-4']">
    <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5">
      <div
        class="min-w-14 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t('hand') }}
      </div>
      <ButtonGroup class="w-full">
        <Button
          v-for="item in handOptions"
          :key="item.value"
          :aria-label="t(item.value)"
          :aria-pressed="side === item.value"
          :class="
            compact
              ? 'flex h-12 w-full items-center justify-center gap-2 px-2'
              : 'flex h-12 w-32 items-center justify-center gap-2 px-3'
          "
          :title="t(item.value)"
          @click="side = item.value"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span
            class="truncate text-[11px] font-semibold tracking-[0.08em] uppercase"
          >
            {{ t(item.value) }}
          </span>
        </Button>
      </ButtonGroup>
    </div>
    <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5">
      <div
        class="min-w-14 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t('bellows') }}
      </div>
      <ButtonGroup class="w-full">
        <Button
          v-for="item in directionOptions"
          :key="item.value"
          :aria-label="t(item.value)"
          :aria-pressed="direction === item.value"
          :class="
            compact
              ? 'flex h-12 w-full items-center justify-center gap-2 px-2'
              : 'flex h-12 w-32 items-center justify-center gap-2 px-3'
          "
          :title="t(item.value)"
          @click="direction = item.value"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span
            class="truncate text-[11px] font-semibold tracking-[0.08em] uppercase"
          >
            {{ t(item.value) }}
          </span>
        </Button>
      </ButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { useStore } from '../stores/main';
import Button from './Button.vue';
import ButtonGroup from './ButtonGroup.vue';
import IconBellowsClose from './icons/IconBellowsClose.vue';
import IconBellowsOpen from './icons/IconBellowsOpen.vue';
import IconHandLeft from './icons/IconHandLeft.vue';
import IconHandRight from './icons/IconHandRight.vue';

withDefaults(defineProps<{ readonly?: boolean; compact?: boolean }>(), {
  compact: false,
});

const { t } = useI18n();
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
</script>
