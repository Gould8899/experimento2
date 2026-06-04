<template>
  <div
    :class="[
      'min-w-0 overflow-x-hidden print:hidden',
      compact ? 'grid gap-3' : 'grid gap-4',
    ]"
  >
    <div>
      <div
        v-if="!compact"
        class="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase select-none dark:text-neutral-200"
      >
        {{ t('notation') }}
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <Button
          :aria-pressed="!showEnharmonics"
          class="w-full"
          @click.prevent="showEnharmonics = false"
        >
          <span class="flex min-w-0 items-center justify-center gap-2">
            <span class="text-[1.35rem] leading-none font-black">♯</span>
            <span class="truncate">{{ t('accidentals_sharp') }}</span>
          </span>
        </Button>
        <Button
          :aria-pressed="showEnharmonics"
          class="w-full"
          @click.prevent="showEnharmonics = true"
        >
          <span class="flex min-w-0 items-center justify-center gap-2">
            <span class="text-[1.45rem] leading-none font-black">♭</span>
            <span class="truncate">{{ t('accidentals_flat') }}</span>
          </span>
        </Button>
      </div>
    </div>

    <div>
      <div
        v-if="!compact"
        class="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase select-none dark:text-neutral-200"
      >
        {{ t('scale') }}
      </div>
      <div class="grid gap-1.5">
        <Button
          :aria-pressed="scaleType === null"
          class="w-full"
          @click.prevent="store.setScaleType(null)"
        >
          {{ t('scale_none') }}
        </Button>
        <div
          v-for="(row, rowIndex) in scaleRows"
          :key="rowIndex"
          :class="scaleRowClass(rowIndex)"
        >
          <Button
            v-for="(item, itemIndex) in row"
            :key="item.value"
            :aria-pressed="item.value === scaleType"
            :class="scaleButtonClass(rowIndex, itemIndex)"
            @click.prevent="
              store.setScaleType(item.value === scaleType ? null : item.value)
            "
          >
            {{ t(item.label) }}
          </Button>
        </div>
      </div>
    </div>

    <div>
      <div
        v-if="!compact"
        class="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase select-none dark:text-neutral-200"
      >
        {{ t('arpeggio') }}
      </div>
      <div class="grid gap-1.5">
        <div
          v-for="(row, rowIndex) in arpeggioRows"
          :key="rowIndex"
          class="grid grid-cols-2 gap-1.5"
        >
          <Button
            v-for="item in row"
            :key="item.value"
            :aria-pressed="item.value === chordType"
            class="w-full"
            @click.prevent="
              store.setChordType(item.value === chordType ? null : item.value)
            "
          >
            {{ t(item.label ?? item.value) }}
          </Button>
        </div>
      </div>
    </div>

    <NavTonic compact />

    <div>
      <div
        v-if="!compact"
        class="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase select-none dark:text-neutral-200"
      >
        {{ t('scale_guides') }}
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <Button
          :aria-pressed="showScaleGuides"
          class="w-full"
          @click.prevent="emit('toggleScaleGuides', true)"
        >
          {{ t('guides_show') }}
        </Button>
        <Button
          :aria-pressed="!showScaleGuides"
          class="w-full"
          @click.prevent="emit('toggleScaleGuides', false)"
        >
          {{ t('guides_hide') }}
        </Button>
      </div>
    </div>

    <div>
      <div
        v-if="!compact"
        class="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase select-none dark:text-neutral-200"
      >
        {{ t('actions') }}
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <Button
          :title="resetTitle || t('reset_voicing')"
          :disabled="!canReset && !isUserChord"
          class="w-full"
          @click.prevent="emit('reset')"
        >
          <span class="inline-flex min-w-0 items-center gap-1">
            <span class="truncate">{{ resetTitle || t('reset_voicing') }}</span>
            <span
              v-if="resetShortcut"
              class="shrink-0 text-[11px] font-medium opacity-70"
            >
              ({{ resetShortcut }})
            </span>
          </span>
        </Button>
        <Button
          :title="t('reset_all')"
          class="w-full"
          @click.prevent="emit('resetSearch')"
        >
          <span class="inline-flex min-w-0 items-center gap-1">
            <span class="truncate">{{ t('reset_all') }}</span>
            <span
              v-if="resetSearchShortcut"
              class="shrink-0 text-[11px] font-medium opacity-70"
            >
              ({{ resetSearchShortcut }})
            </span>
          </span>
        </Button>
        <Button
          class="w-full"
          :title="t('save_image')"
          @click.prevent="emit('download')"
        >
          {{ t('save_image') }}
        </Button>
        <Button
          :aria-pressed="soundMode === 'sustain'"
          :title="t('sound_sustain')"
          class="w-full"
          @click.prevent="
            soundMode = soundMode === 'sustain' ? 'short' : 'sustain'
          "
        >
          {{ t('sound_sustain') }}
        </Button>
      </div>
      <div
        v-if="actionsHint && !compact"
        class="mt-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300"
      >
        {{ actionsHint }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { arpeggioTypes, scaleTypes } from '../data/index';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import Button from './Button.vue';
import NavTonic from './NavTonic.vue';

withDefaults(
  defineProps<{
    compact?: boolean;
    canReset?: boolean;
    showScaleGuides?: boolean;
    resetTitle?: string;
    resetShortcut?: string;
    resetSearchShortcut?: string;
    actionsHint?: string;
  }>(),
  {
    compact: false,
    canReset: false,
    showScaleGuides: true,
    resetTitle: undefined,
    resetShortcut: undefined,
    resetSearchShortcut: undefined,
    actionsHint: undefined,
  },
);

const emit = defineEmits<{
  download: [];
  reset: [];
  resetSearch: [];
  toggleScaleGuides: [visible: boolean];
}>();

const { t } = useI18n({ useScope: 'global' });
const store = useStore();
const settings = useSettingsStore();
const { scaleType, showEnharmonics, chordType, isUserChord } =
  storeToRefs(store);
const { soundMode } = storeToRefs(settings);

function getScaleOption(value: string) {
  const option = scaleTypes.find((item) => item.value === value);
  if (!option) {
    throw new Error(`Missing scale option: ${value}`);
  }

  return option;
}

function getArpeggioOption(value: string) {
  const option = arpeggioTypes.find((item) => item.value === value);
  if (!option) {
    throw new Error(`Missing arpeggio option: ${value}`);
  }

  return option;
}

const scaleRows = [
  [getScaleOption('white-keys'), getScaleOption('black-keys')],
  [getScaleOption('major'), getScaleOption('minor')],
  [getScaleOption('chromatic'), getScaleOption('whole tone')],
  [getScaleOption('diminished'), getScaleOption('augmented')],
];

const arpeggioRows = [
  [getArpeggioOption('arp:M'), getArpeggioOption('arp:m')],
  [getArpeggioOption('arp:dim'), getArpeggioOption('arp:aug')],
];

function scaleRowClass(rowIndex: number) {
  if (rowIndex === 0) {
    return 'grid grid-cols-2 gap-px rounded-lg bg-neutral-300 p-px dark:bg-neutral-600';
  }

  return 'grid grid-cols-2 gap-1.5';
}

function scaleButtonClass(rowIndex: number, itemIndex: number) {
  if (rowIndex === 0) {
    return [
      'w-full border-transparent',
      itemIndex === 0 ? 'rounded-r-none' : 'rounded-l-none',
    ];
  }

  return 'w-full';
}
</script>
