<template>
  <div
    class="fixed inset-0 z-50 bg-neutral-950/20 backdrop-blur-[1px]"
    @click.self="emit('close')"
  >
    <aside
      class="absolute inset-x-3 top-3 max-h-[calc(100vh-1.5rem)] overflow-auto rounded-3xl border border-neutral-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:top-3 sm:right-3 sm:w-[30rem] dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-semibold">Bandoneón.app</div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('settings_summary') }}
          </div>
        </div>
        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          type="button"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="mb-4 rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800/80">
        <div
          class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
        >
          {{ t('instrument') }}
        </div>
        <div class="mt-1 text-sm font-semibold tracking-tight">
          {{ t('rheinische142') }}
        </div>
        <div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('instrument_fixed_focus') }}
        </div>
      </div>

      <div class="mb-4">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('pitch_notation') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in pitchNotations"
            :key="value"
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="value === pitchNotation"
            @click="pitchNotation = value"
          >
            {{ t(value) }}
          </Button>
        </div>
      </div>

      <div class="mb-4">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('language') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in availableLocaleCodes"
            :key="value"
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="value === locale"
            @click="locale = value"
          >
            {{ t('language-' + value) }}
          </Button>
        </div>
      </div>

      <div class="mb-4">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('sound') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
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

      <div class="mb-4">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('sound_mode') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
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

      <div v-if="route.path === '/game'" class="mb-4">
        <label
          class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ t('difficulty') }}
        </label>
        <div class="mt-1 flex w-full flex-row gap-2">
          <Button
            v-for="value in difficulties"
            :key="value"
            class="w-full bg-white dark:bg-neutral-900"
            :aria-pressed="value === difficulty"
            @click="difficulty = value"
          >
            {{ t('difficulty-' + value) }}
          </Button>
        </div>
      </div>

      <div class="mt-6 flex justify-between text-sm">
        <div>
          <RouterLink
            v-if="route.path !== '/game'"
            class="me-1 underline"
            to="/game"
            @click="emit('close')"
          >
            {{ t('play_game') }}
          </RouterLink>
          <RouterLink
            v-else
            class="me-1 underline"
            to="/"
            @click="emit('close')"
          >
            {{ t('back_to_keyboard') }}
          </RouterLink>
        </div>

        <div class="flex items-center gap-3">
          <a
            target="_blank"
            href="https://github.com/nicokaiser/bandoneon/"
            rel="noreferrer"
          >
            <IconGitHub class="h-4 w-4" />
          </a>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('credits') }}
          </span>
        </div>
      </div>
      <AppFooter
        class="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700"
      />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { difficulties, pitchNotations } from '../data/index';
import { availableLocaleCodes, useSettingsStore } from '../stores/settings';
import AppFooter from './AppFooter.vue';
import Button from './Button.vue';
import IconGitHub from './icons/IconGitHub.vue';

const emit = defineEmits<{ close: [] }>();

const settings = useSettingsStore();
const route = useRoute();

const { pitchNotation, difficulty, locale, soundEnabled, soundMode } =
  storeToRefs(settings);

const { t } = useI18n({ useScope: 'global' });
</script>
