<template>
  <div
    :class="[
      'print:hidden',
      compact ? 'grid gap-3' : 'flex flex-wrap justify-center',
    ]"
  >
    <div :class="compact ? '' : 'flex flex-col items-center'">
      <div
        class="mb-1 text-xs font-medium text-neutral-500 select-none dark:text-neutral-400"
      >
        {{ t('scale') }}
      </div>
      <div
        :class="
          compact
            ? 'flex flex-wrap gap-1.5'
            : 'mx-2 mb-3 flex flex-wrap justify-center gap-1.5'
        "
      >
        <Button
          v-for="item in scaleTypes"
          :key="item.value"
          :aria-pressed="item.value === scaleType"
          class="min-w-11"
          @click.prevent="store.setScaleType(item.value)"
        >
          {{ t(item.label) }}
        </Button>
      </div>
    </div>
    <div :class="compact ? '' : 'flex flex-col items-center'">
      <div
        class="mb-1 text-xs font-medium text-neutral-500 select-none dark:text-neutral-400"
      >
        {{ t('arpeggio') }}
      </div>
      <div
        :class="
          compact
            ? 'flex flex-wrap gap-1.5'
            : 'mx-2 mb-3 flex flex-wrap justify-center gap-1.5'
        "
      >
        <Button
          v-for="item in arpeggioTypes"
          :key="item.value"
          :aria-pressed="item.value === chordType"
          @click.prevent="store.setChordType(item.value)"
        >
          {{ formatHarmonicType(item) }}
        </Button>
      </div>
    </div>
    <div :class="compact ? '' : 'flex flex-col items-center'">
      <div
        class="mb-1 text-xs font-medium text-neutral-500 select-none dark:text-neutral-400"
      >
        {{ t('display') }}
      </div>
      <div
        :class="
          compact
            ? 'flex flex-wrap gap-1.5'
            : 'mx-2 mb-3 flex flex-wrap justify-center gap-1.5'
        "
      >
        <Button
          :aria-pressed="viewMode === 'real'"
          @click.prevent="viewMode = 'real'"
        >
          {{ t('view_real') }}
        </Button>
        <Button
          :aria-pressed="viewMode === 'flat'"
          @click.prevent="viewMode = 'flat'"
        >
          {{ t('view_flat') }}
        </Button>
        <Button
          class="min-w-14"
          :title="t('accidentals')"
          @click.prevent="showEnharmonics = !showEnharmonics"
        >
          {{ showEnharmonics ? '♭' : '♯/♭' }}
        </Button>
        <Button
          :aria-pressed="showColors"
          @click.prevent="showColors = !showColors"
        >
          <IconPalette class="inline-block h-4 w-4 align-[-0.25em]" />
        </Button>
        <Button
          :aria-pressed="soundEnabled"
          @click.prevent="soundEnabled = !soundEnabled"
        >
          ♪
        </Button>
        <Button
          class="button"
          :title="t('save_image')"
          @click.prevent="emit('download')"
        >
          <IconArrowDownTray class="inline-block h-4 w-4 align-[-0.25em]" />
        </Button>
        <Button
          :title="t('save_voicing')"
          :disabled="!canSave"
          @click.prevent="emit('save')"
        >
          <IconPin class="inline-block h-4 w-4 align-[-0.25em]" />
        </Button>
        <Button
          :title="resetTitle || t('reset_voicing')"
          :disabled="!canReset && !isUserChord"
          @click.prevent="emit('reset')"
        >
          <IconArrowUturnLeft class="inline-block h-4 w-4 align-[-0.25em]" />
        </Button>
        <Button :title="t('reset_search')" @click.prevent="emit('resetSearch')">
          Esc
        </Button>
      </div>
    </div>
    <div :class="compact ? '' : 'flex flex-col items-center'">
      <div
        class="mb-1 text-xs font-medium text-neutral-500 select-none dark:text-neutral-400"
      >
        {{ t('chord') }}
      </div>
      <div
        :class="
          compact
            ? 'flex flex-wrap gap-1.5'
            : 'mx-2 mb-3 flex flex-wrap justify-center gap-1.5'
        "
      >
        <Button
          v-for="item in chordTypes"
          :key="item.value"
          :aria-pressed="item.value === chordType"
          @click.prevent="store.setChordType(item.value)"
        >
          {{ formatHarmonicType(item) }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { arpeggioTypes, chordTypes, scaleTypes } from '../data/index';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import Button from './Button.vue';
import IconArrowDownTray from './icons/IconArrowDownTray.vue';
import IconArrowUturnLeft from './icons/IconArrowUturnLeft.vue';
import IconPalette from './icons/IconPalette.vue';
import IconPin from './icons/IconPin.vue';

withDefaults(
  defineProps<{
    modified: boolean;
    compact?: boolean;
    canReset?: boolean;
    canSave?: boolean;
    resetTitle?: string;
  }>(),
  {
    compact: false,
    canReset: false,
    canSave: false,
    resetTitle: undefined,
  },
);

const emit = defineEmits<{
  download: [];
  save: [];
  reset: [];
  resetSearch: [];
}>();

const { t } = useI18n();
const store = useStore();
const settings = useSettingsStore();
const { scaleType, showColors, showEnharmonics, chordType, isUserChord } =
  storeToRefs(store);
const { viewMode, soundEnabled } = storeToRefs(settings);

const formatHarmonicType = (item: {
  value: string;
  text?: string;
  label?: string;
}) => item.text ?? t(item.label ?? item.value);
</script>
