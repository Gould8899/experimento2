<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/80 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
  >
    <span class="font-medium text-neutral-600 dark:text-neutral-300">
      {{ t('app_title') }}
    </span>
    <button
      type="button"
      class="underline decoration-neutral-400/60 underline-offset-2 transition hover:text-neutral-800 hover:decoration-neutral-600 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:hover:text-neutral-200"
      @click="emit('openCredits')"
    >
      {{ t('credits') }}
    </button>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';

const emit = defineEmits<{ openCredits: [] }>();

const { t } = useI18n({ useScope: 'global' });
</script>
