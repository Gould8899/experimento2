<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import { useAppSettings } from './composables/useAppSettings';

// Root shell: keeps layout simple and delegates settings sync/persistence to a composable.

useHead({ title: 'Bandoneon.app' });

useAppSettings();
</script>
