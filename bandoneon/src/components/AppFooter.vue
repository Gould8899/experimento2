<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400"
  >
    <div>Bandoneon Workspace</div>
    <div>{{ t('settings_summary') }}</div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';

const { t } = useI18n({ useScope: 'global' });
</script>
