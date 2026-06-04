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
      class="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-[28rem] sm:-translate-x-1/2 dark:border-neutral-700 dark:bg-neutral-900"
      @keydown.escape.prevent="emit('close')"
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <h2
          :id="titleId"
          class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
        >
          {{ t('credits') }}
        </h2>
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl leading-none text-neutral-600 transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-neutral-300 dark:hover:bg-neutral-800"
          :aria-label="t('close_credits')"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="grid gap-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <p>
          {{ t('workspace_credit_prefix') }}
          <a
            :href="WORKSPACE_CREDIT.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:decoration-sky-700 dark:text-sky-400 dark:decoration-sky-400/40"
          >
            {{ WORKSPACE_CREDIT.name }}
          </a>.
        </p>
        <p>
          {{ t('mapping_credit_prefix') }}
          <a
            :href="MAPPING_CREDIT.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:decoration-sky-700 dark:text-sky-400 dark:decoration-sky-400/40"
          >
            {{ MAPPING_CREDIT.name }}
          </a>
          (<a
            :href="MAPPING_CREDIT.homepage"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:decoration-sky-700 dark:text-sky-400 dark:decoration-sky-400/40"
          >
            {{ t('credits_homepage') }}
          </a>).
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('credits_license_note') }}
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { onMounted, onUnmounted, useId } from 'vue';
import { MAPPING_CREDIT, WORKSPACE_CREDIT } from '../constants/credits';

const emit = defineEmits<{ close: [] }>();

const titleId = useId();
const { t } = useI18n({ useScope: 'global' });

onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
