<template>
  <svg
    ref="svgEl"
    :class="['keyboard', { 'keyboard--real': mode === 'real' }]"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
  >
    <g :transform="contentTransform">
      <slot />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    side?: 'left' | 'right';
    mode?: 'real' | 'flat';
  }>(),
  {
    side: 'right',
    mode: 'real',
  },
);

const landscapeWidth = 690;
const landscapeHeight = 410;

const svgEl = ref();

const viewBox = computed(() => {
  if (props.mode === 'flat') return `0 0 ${landscapeWidth} ${landscapeHeight}`;
  return `0 0 ${landscapeHeight} ${landscapeWidth}`;
});

const contentTransform = computed(() => {
  if (props.mode === 'flat') return undefined;

  if (props.side === 'left') {
    return `translate(0 ${landscapeWidth}) rotate(-90)`;
  }

  return `translate(${landscapeHeight} 0) rotate(90)`;
});

const download = (filename: string) => {
  // https://mybyways.com/blog/convert-svg-to-png-using-your-browser

  const margin = 30;
  const canvas = document.createElement('canvas');
  canvas.width = (svgEl.value.getBoundingClientRect().width + margin) * 2;
  canvas.height = (svgEl.value.getBoundingClientRect().height + margin) * 2;
  const data = new XMLSerializer().serializeToString(svgEl.value);
  const win = window.URL || window.webkitURL || window;
  const img = new Image();
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = win.createObjectURL(blob);

  img.addEventListener('load', () => {
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      margin,
      margin,
      canvas.width - 2 * margin,
      canvas.height - 2 * margin,
    );
    win.revokeObjectURL(url);
    const uri = canvas
      .toDataURL('image/png')
      .replace('image/png', 'octet/stream');
    const a = document.createElement('a');
    document.body.append(a);
    a.style.display = 'none';
    a.href = uri;
    a.download = filename;
    a.click();
    win.revokeObjectURL(uri);
    a.remove();
  });

  img.src = url;
};

defineExpose({ download });
</script>

<style scoped>
.keyboard {
  display: block;
  width: 100%;
  height: auto;
  min-height: 0;
  margin-inline: auto;
}

.keyboard--real {
  width: min(100%, 31rem);
  height: min(100%, 42rem);
  max-width: 100%;
  max-height: 100%;
}
</style>
