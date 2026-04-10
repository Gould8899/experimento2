<template>
  <div class="pointer-events-none fixed top-3 right-3 z-40">
    <div
      class="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-white/92 p-1.5 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/92"
    >
      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-xl font-semibold transition select-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title="Theme"
        @click.prevent="isDark = !isDark"
      >
        <IconSun v-if="!isDark" class="h-5 w-5" />
        <IconMoon v-else class="h-5 w-5" />
      </button>
      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-xl font-semibold transition select-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
        type="button"
        title="Settings"
        @click.prevent="showMenu = !showMenu"
      >
        <IconBars3 class="h-5 w-5" />
      </button>
    </div>
  </div>

  <AppSettings v-if="showMenu" @close="showMenu = false" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDark } from '../composables/useDark';
import AppSettings from './AppSettings.vue';
import IconBars3 from './icons/IconBars3.vue';
import IconMoon from './icons/IconMoon.vue';
import IconSun from './icons/IconSun.vue';

const showMenu = ref(false);

const { isDark } = useDark();

watch(showMenu, (value) => {
  document.documentElement.classList.toggle('has-floating-menu', value);
});
</script>
