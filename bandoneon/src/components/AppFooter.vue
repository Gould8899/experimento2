<template>
  <footer
    class="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400"
  >
    <div>Bandoneón.app</div>
    <div>
      {{ t('mapping_credit_prefix') }}
      <a
        class="underline"
        target="_blank"
        href="https://github.com/nicokaiser/bandoneon/"
        rel="noreferrer"
      >
        Nico Kaiser</a
      >
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';

const { t } = useI18n({ useScope: 'global' });
</script>
