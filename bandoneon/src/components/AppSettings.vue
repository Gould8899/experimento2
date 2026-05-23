<template>
  <div
    class="fixed inset-0 z-50 bg-neutral-950/20 backdrop-blur-[1px]"
    @click.self="emit('close')"
  >
    <aside
      class="absolute inset-x-3 top-3 max-h-[calc(100vh-1.5rem)] overflow-x-hidden overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:top-3 sm:right-3 sm:w-[34rem] lg:w-[38rem] dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div class="mb-4 flex items-center justify-end gap-4">
        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          type="button"
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
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { storeToRefs } from 'pinia';
import { useDark } from '../composables/useDark';
import { pitchNotations } from '../data/index';
import { useStore } from '../stores/main';
import { availableLocaleCodes, useSettingsStore } from '../stores/settings';
import Button from './Button.vue';

const emit = defineEmits<{ close: [] }>();

const { isDark } = useDark();
const store = useStore();
const settings = useSettingsStore();

const { showColors } = storeToRefs(store);
const { pitchNotation, locale, soundEnabled, soundMode, viewMode } =
  storeToRefs(settings);

const { t } = useI18n({ useScope: 'global' });
</script>
