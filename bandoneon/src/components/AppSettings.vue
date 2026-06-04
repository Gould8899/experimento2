<template>
  <div
    class="fixed inset-0 z-[60] bg-neutral-950/30 backdrop-blur-sm"
    role="presentation"
    @click.self="emit('close')"
  >
    <aside
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      class="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] overflow-x-hidden overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:top-[max(0.75rem,env(safe-area-inset-top))] sm:right-3 sm:w-[34rem] lg:w-[38rem] dark:border-neutral-700 dark:bg-neutral-900"
      @keydown.escape.prevent="emit('close')"
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2
            :id="titleId"
            class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            {{ t('settings_title') }}
          </h2>
          <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('settings_shortcut') }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl leading-none text-neutral-600 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-neutral-300 dark:hover:bg-neutral-800"
          :aria-label="t('close_settings')"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            {{ t('workspace') }}
          </div>

          <div class="mt-3 grid gap-3">
            <div>
              <label
                class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {{ t('display') }}
              </label>
              <div class="mt-1 grid w-full min-w-0 grid-cols-2 gap-2">
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
              <div class="mt-1 grid w-full min-w-0 grid-cols-2 gap-2">
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
                {{ t('theme') }}
              </label>
              <div class="mt-1 grid w-full min-w-0 grid-cols-2 gap-2">
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
          </div>
        </section>

        <section
          class="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
        >
          <div
            class="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400"
          >
            {{ t('others') }}
          </div>

          <div class="mt-3 grid gap-3">
            <div>
              <label
                class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {{ t('pitch_notation') }}
              </label>
              <div class="mt-1 grid w-full min-w-0 grid-cols-3 gap-2">
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

            <div>
              <label
                class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {{ t('language') }}
              </label>
              <div class="mt-1 grid w-full min-w-0 grid-cols-3 gap-2">
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

            <div>
              <label
                class="block text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {{ t('sound') }}
              </label>
              <div class="mt-1 grid w-full min-w-0 grid-cols-2 gap-2">
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
              <div class="mt-1 grid w-full min-w-0 grid-cols-2 gap-2">
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
          </div>
        </section>
      </div>

      <section
        class="mt-4 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
      >
        <div
          class="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase dark:text-neutral-400"
        >
          {{ t('keyboard_shortcuts') }}
        </div>
        <ul
          class="mt-2 grid gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
        >
          <li>
            <span class="font-medium">{{ t('shortcut_open_settings') }}:</span>
            {{ t('settings_open_shortcut') }}
          </li>
          <li>
            <span class="font-medium">{{ t('settings_title') }}:</span>
            {{ t('settings_shortcut') }}
          </li>
        </ul>
        <Button class="mt-3 w-full" @click="emit('openCredits')">
          {{ t('credits') }}
        </Button>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, useId } from 'vue';
import { useDark } from '../composables/useDark';
import { pitchNotations } from '../data/index';
import { useStore } from '../stores/main';
import { availableLocaleCodes, useSettingsStore } from '../stores/settings';
import Button from './Button.vue';

const emit = defineEmits<{ close: []; openCredits: [] }>();

const titleId = useId();
const { isDark } = useDark();
const store = useStore();
const settings = useSettingsStore();

const { showColors } = storeToRefs(store);
const { pitchNotation, locale, soundEnabled, soundMode, viewMode } =
  storeToRefs(settings);

const { t } = useI18n({ useScope: 'global' });

onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
