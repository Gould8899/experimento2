<template>
  <section
    class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
  >
    <button
      class="flex w-full items-center justify-between gap-3 text-left"
      type="button"
      @click="isOpen = !isOpen"
    >
      <div
        class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
      >
        {{ t('others') }}
      </div>
      <div class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ isOpen ? '−' : '+' }}
      </div>
    </button>

    <div v-if="isOpen" class="mt-3 grid gap-4">
      <div
        v-if="summaryTitle || summaryPrimary || summaryMeta || summarySecondary"
        class="rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800/80"
      >
        <div
          v-if="summaryTitle"
          class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
        >
          {{ summaryTitle }}
        </div>
        <div
          v-if="summaryPrimary"
          class="mt-1 text-base font-semibold tracking-tight"
        >
          {{ summaryPrimary }}
        </div>
        <div
          v-if="summaryMeta"
          class="mt-2 text-xs text-neutral-500 dark:text-neutral-400"
        >
          {{ summaryMeta }}
        </div>
        <div
          v-if="summarySecondary"
          class="mt-1 text-xs text-neutral-500 dark:text-neutral-400"
        >
          {{ summarySecondary }}
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('display') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="viewMode === 'real'"
            @click="viewMode = 'real'"
          >
            {{ t('view_real') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="viewMode === 'flat'"
            @click="viewMode = 'flat'"
          >
            {{ t('view_flat') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('colors') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="showColors"
            @click="showColors = true"
          >
            {{ t('on') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="!showColors"
            @click="showColors = false"
          >
            {{ t('off') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('scale_guides') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="showScaleGuides"
            @click="setScaleGuidesVisibility(true)"
          >
            {{ t('guides_show') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="!showScaleGuides"
            @click="setScaleGuidesVisibility(false)"
          >
            {{ t('guides_hide') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('sound') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="soundEnabled"
            @click="soundEnabled = true"
          >
            {{ t('on') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="!soundEnabled"
            @click="soundEnabled = false"
          >
            {{ t('off') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('sound_mode') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="soundMode === 'short'"
            @click="soundMode = 'short'"
          >
            {{ t('sound_short') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="soundMode === 'sustain'"
            @click="soundMode = 'sustain'"
          >
            {{ t('sound_sustain') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('theme') }}
        </label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="!isDark"
            @click="isDark = false"
          >
            {{ t('light') }}
          </Button>
          <Button
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="isDark"
            @click="isDark = true"
          >
            {{ t('dark') }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('pitch_notation') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in pitchNotations"
            :key="value"
            class="w-full bg-white px-2 text-xs dark:bg-neutral-900"
            :aria-pressed="value === pitchNotation"
            @click="pitchNotation = value"
          >
            {{ t(value) }}
          </Button>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('language') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in availableLocaleCodes"
            :key="value"
            class="w-full bg-white px-2 text-xs dark:bg-neutral-900"
            :aria-pressed="value === locale"
            @click="locale = value"
          >
            {{ t('language-' + value) }}
          </Button>
        </div>
      </div>

      <div v-if="route.path === '/game'">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('difficulty') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in difficulties"
            :key="value"
            class="w-full bg-white px-2 text-xs dark:bg-neutral-900"
            :aria-pressed="value === difficulty"
            @click="difficulty = value"
          >
            {{ t('difficulty-' + value) }}
          </Button>
        </div>
      </div>

      <AppFooter
        class="border-t border-neutral-200 pt-3 dark:border-neutral-700"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDark } from '../composables/useDark';
import { difficulties, pitchNotations } from '../data/index';
import { useStore } from '../stores/main';
import { availableLocaleCodes, useSettingsStore } from '../stores/settings';
import AppFooter from './AppFooter.vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    summaryTitle?: string;
    summaryPrimary?: string;
    summaryMeta?: string;
    summarySecondary?: string;
    defaultOpen?: boolean;
  }>(),
  {
    summaryTitle: '',
    summaryPrimary: '',
    summaryMeta: '',
    summarySecondary: '',
    defaultOpen: false,
  },
);

const { t } = useI18n({ useScope: 'global' });
const { isDark } = useDark();
const route = useRoute();
const store = useStore();
const settings = useSettingsStore();
const { showColors } = storeToRefs(store);
const {
  pitchNotation,
  difficulty,
  locale,
  soundEnabled,
  soundMode,
  showScaleGuides,
  viewMode,
} = storeToRefs(settings);
const isOpen = ref(props.defaultOpen);

function setScaleGuidesVisibility(visible: boolean) {
  showScaleGuides.value = visible;
}
</script>
