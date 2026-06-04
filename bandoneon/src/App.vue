<template>
  <div
    class="flex h-screen min-h-dvh flex-col overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50"
  >
    <main class="min-h-0 flex-1 overflow-hidden">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useI18n } from 'petite-vue-i18n';
import { useAppSettings } from './composables/useAppSettings';

// Root shell: keeps layout simple and delegates settings sync/persistence to a composable.

useAppSettings();

const { t } = useI18n({ useScope: 'global' });

useHead({
  title: () => t('app_title'),
});
</script>
