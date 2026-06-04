<template>
  <button
    class="max-w-full min-w-0 overflow-hidden rounded-lg border border-neutral-300 px-2.5 py-1.5 text-[13px] leading-none font-semibold text-ellipsis transition-colors select-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-inherit aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white aria-pressed:hover:bg-neutral-800 dark:border-neutral-600 dark:hover:bg-neutral-700 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-neutral-900 dark:disabled:border-neutral-700 dark:disabled:text-neutral-600 dark:disabled:hover:bg-inherit dark:aria-pressed:border-neutral-200 dark:aria-pressed:bg-neutral-100 dark:aria-pressed:text-neutral-900 dark:aria-pressed:hover:bg-neutral-200"
  >
    <slot />
  </button>
</template>
