<template>
  <g
    data-bandoneon-key="true"
    :class="{ selected, muted }"
    :style="groupStyle"
    @pointerdown="onPointerDown"
    @click.prevent="emit('click')"
    @pointerenter="emit('hover')"
  >
    <circle
      v-if="focused"
      :cx="x + 29"
      :cy="y + 29"
      r="31.5"
      fill="none"
      :stroke="focusStroke"
      stroke-width="2"
      stroke-dasharray="3 4"
      opacity="0.85"
    />
    <circle
      :cx="x + 29"
      :cy="y + 29"
      r="28"
      :fill="fill"
      :stroke="stroke"
      stroke-width="1.5"
    />
    <text
      :x="x + 29"
      :y="y + 36"
      :fill="selected ? '#fff' : 'currentColor'"
      :transform="textTransform"
      font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
      font-size="20px"
      text-anchor="middle"
    >
      <template v-if="label !== null">
        {{ label }}
      </template>
      <template v-else>
        <tspan>{{ format[0] }}</tspan>
        <tspan dx="2" font-size="16px">
          {{ format[1] }}
        </tspan>
      </template>
    </text>
  </g>
</template>

<script setup lang="ts">
import { Note } from 'tonal';
import { computed } from 'vue';
import { useStore } from '../stores/main';
import { useSettingsStore } from '../stores/settings';
import { scientificToHelmholtzNotation } from '../utils/helmholtz';
import { scientificToSolfegeNotation } from '../utils/solfege';

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    tonal: string;
    selected?: boolean;
    muted?: boolean;
    focused?: boolean;
    playable?: boolean;
    interactiveMode?: 'paint-on';
    gestureActive?: boolean;
    gestureMode?: 'paint' | 'erase';
    label?: string | null;
    color?: string;
    labelRotation?: number;
  }>(),
  {
    selected: false,
    muted: false,
    focused: false,
    playable: true,
    interactiveMode: 'paint-on',
    gestureActive: false,
    gestureMode: 'paint',
    label: null,
    color: undefined,
    labelRotation: 0,
  },
);

const emit = defineEmits<{
  start: [options?: { additive?: boolean }];
  click: [];
  hover: [];
}>();

function onPointerDown(event: PointerEvent) {
  emit('start', {
    additive:
      event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey,
  });
}

const store = useStore();
const settings = useSettingsStore();

const format = computed(() => {
  const note = Note.get(
    store.showEnharmonics ? Note.enharmonic(props.tonal) : props.tonal,
  );
  if (note.empty) return ['', ''];

  if (settings.pitchNotation === 'helmholtz') {
    return [scientificToHelmholtzNotation(note.name), ''];
  } else if (settings.pitchNotation === 'solfege') {
    return [
      scientificToSolfegeNotation(note.name)
        .slice(0, -1)
        .replace('b', '♭')
        .replace('#', '♯'),
      '' + note.oct,
    ];
  }

  return [note.pc.replace('b', '♭').replace('#', '♯'), '' + note.oct];
});

const fill = computed(() => {
  if (props.selected) return 'currentColor';
  if (props.muted) return 'rgba(148, 163, 184, 0.14)';
  if (props.color) return props.color;
  return 'transparent';
});

const stroke = computed(() => {
  if (props.muted) return '#cbd5e1';
  return props.selected ? 'currentColor' : '#000';
});

const focusStroke = computed(() => {
  if (props.selected) return 'currentColor';
  if (props.muted) return '#94a3b8';
  return props.gestureMode === 'erase' ? '#f59e0b' : '#10b981';
});

const groupStyle = computed(() => ({
  cursor: !props.playable
    ? 'default'
    : props.gestureActive
      ? 'grabbing'
      : 'crosshair',
  opacity: props.playable || props.selected ? 1 : 0.58,
}));

const textTransform = computed(() => {
  if (!props.labelRotation) return undefined;
  return `rotate(${props.labelRotation} ${props.x + 29} ${props.y + 29})`;
});
</script>

<style scoped>
circle {
  stroke: #a3a3a3; /* neutral-400 */
}

.selected circle {
  fill: #262626;
  stroke: #262626;
}

.muted text {
  opacity: 0.38;
}

text {
  user-select: none;
  cursor: default;
}

.dark .selected circle {
  fill: #f5f5f5;
  stroke: #f5f5f5;
}

.dark .selected text {
  fill: #262626;
}

.dark .muted circle {
  stroke: #475569;
}

.dark .muted text {
  opacity: 0.44;
}
</style>
