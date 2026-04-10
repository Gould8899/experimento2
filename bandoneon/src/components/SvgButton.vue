<template>
  <g
    :class="{ selected, muted }"
    @pointerdown="!muted && emit('start')"
    @click.prevent="!muted && emit('click')"
    @pointerenter="!muted && emit('hover')"
  >
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
    label?: string | null;
    color?: string;
    labelRotation?: number;
  }>(),
  {
    selected: false,
    muted: false,
    label: null,
    color: undefined,
    labelRotation: 0,
  },
);

const emit = defineEmits<{ start: []; click: []; hover: [] }>();

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
