<template>
  <div
    :class="[
      'rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900',
      compact ? 'p-2' : 'p-3',
    ]"
  >
    <div
      :class="
        compact
          ? 'mb-2 flex items-center justify-between gap-3'
          : 'mb-3 flex items-center justify-between gap-3'
      "
    >
      <div>
        <div
          class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
        >
          Piano map
        </div>
        <div
          :class="
            compact
              ? 'text-xs font-semibold tracking-tight'
              : 'text-sm font-semibold tracking-tight'
          "
        >
          {{ t('piano_subtitle') }}
        </div>
        <div
          v-if="showScaleLegend"
          class="mt-1 flex flex-wrap gap-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400"
        >
          <span class="inline-flex items-center gap-1">
            <span
              class="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[inset_0_-1px_0_rgba(0,0,0,0.16)]"
            />
            {{ t('current_hand') }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span
              class="h-2.5 w-2.5 rounded-full border border-sky-500 bg-white dark:bg-neutral-950"
            />
            {{ t('other_hand') }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span
              class="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"
            />
            {{ t('out_of_scale') }}
          </span>
        </div>
      </div>
      <div
        class="text-right text-[11px] text-neutral-500 dark:text-neutral-400"
      >
        <div>{{ t('sound') }}: {{ soundEnabled ? t('on') : t('off') }}</div>
        <div>{{ activeNoteCount }} {{ t('manual_notes') }}</div>
      </div>
    </div>

    <div
      :class="[
        'relative overflow-hidden rounded-xl bg-neutral-200 p-1 dark:bg-neutral-950',
        compact ? 'h-24 sm:h-26' : 'h-36',
      ]"
    >
      <button
        v-for="key in whiteKeys"
        :key="key.note"
        :class="[
          'absolute top-0 bottom-0 overflow-hidden rounded-b-lg border border-neutral-300 transition',
          key.available
            ? 'hover:border-neutral-500 dark:border-neutral-700'
            : 'dark:border-neutral-800',
          !isPlayable(key) ? 'cursor-default' : '',
        ]"
        :style="whiteKeyStyle(key)"
        :title="formatLabel(key.note)"
        type="button"
        :disabled="!isPlayable(key)"
        @pointerdown="emit('start', key.note)"
        @click="emit('press', key.note)"
        @pointerenter="emit('hover', key.note)"
      >
        <span
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.note"
        :class="[
          'absolute top-0 z-20 rounded-b-lg border border-neutral-950 text-white shadow-sm transition',
          key.available ? '' : 'cursor-default',
          !isPlayable(key) ? 'cursor-default' : '',
        ]"
        :style="blackKeyStyle(key)"
        :title="formatLabel(key.note)"
        type="button"
        :disabled="!isPlayable(key)"
        @pointerdown="emit('start', key.note)"
        @click="emit('press', key.note)"
        @pointerenter="emit('hover', key.note)"
      >
        <span
          v-if="key.active"
          class="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { Note } from 'tonal';
import { computed } from 'vue';
import { scientificToHelmholtzNotation } from '../utils/helmholtz';
import { scientificToSolfegeNotation } from '../utils/solfege';

type PianoKey = {
  note: string;
  available: boolean;
  active: boolean;
  secondary: boolean;
  muted: boolean;
  left: number;
  isBlack: boolean;
};

const props = defineProps<{
  notes: string[];
  availableNotes: string[];
  activeNotes: Record<string, boolean>;
  secondaryNotes?: string[];
  mutedNotes?: string[];
  noteColors: Record<string, string>;
  pitchNotation: 'scientific' | 'helmholtz' | 'solfege';
  soundEnabled: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  start: [note: string];
  press: [note: string];
  hover: [note: string];
}>();

const { t } = useI18n({ useScope: 'global' });

const availableNoteSet = computed(() => new Set(props.availableNotes));
const secondaryNoteSet = computed(() => new Set(props.secondaryNotes ?? []));
const mutedNoteSet = computed(() => new Set(props.mutedNotes ?? []));
const showScaleLegend = computed(
  () => secondaryNoteSet.value.size > 0 || mutedNoteSet.value.size > 0,
);

const keys = computed(() => {
  const whiteKeyCount = props.notes.filter(
    (note) => !Note.get(note).acc,
  ).length;
  let whiteCursor = 0;

  return props.notes.map((note) => {
    const parsed = Note.get(note);
    const isBlack = Boolean(parsed.acc);
    const left = isBlack ? whiteCursor - 0.33 : whiteCursor;

    if (!isBlack) {
      whiteCursor += 1;
    }

    return {
      note,
      available: availableNoteSet.value.has(note),
      active: Boolean(props.activeNotes[note]),
      secondary: secondaryNoteSet.value.has(note),
      muted: mutedNoteSet.value.has(note),
      left: left / whiteKeyCount,
      isBlack,
    };
  });
});

const whiteKeys = computed(() => keys.value.filter((key) => !key.isBlack));
const blackKeys = computed(() => keys.value.filter((key) => key.isBlack));
const whiteKeyWidth = computed(() => 100 / whiteKeys.value.length);
const activeNoteCount = computed(
  () => Object.values(props.activeNotes).filter(Boolean).length,
);

function compactLabel(note: string) {
  return formatLabel(note).replace(/[0-9]/g, '');
}

function formatLabel(note: string) {
  const parsed = Note.get(note);
  if (parsed.empty) return note;

  if (props.pitchNotation === 'helmholtz') {
    return scientificToHelmholtzNotation(parsed.name);
  }

  if (props.pitchNotation === 'solfege') {
    return scientificToSolfegeNotation(parsed.name)
      .replace('b', '♭')
      .replace('#', '♯');
  }

  return parsed.name.replace('b', '♭').replace('#', '♯');
}

function whiteKeyStyle(key: PianoKey) {
  const noteColor = props.noteColors[key.note] || '#94a3b8';
  const secondaryAccent = '#94a3b8';
  const inactiveBackground = key.muted
    ? '#eef2f7'
    : key.secondary
      ? '#f1f5f9'
      : key.available
        ? withAlpha(noteColor, '16')
        : '#f8fafc';

  return {
    left: `${key.left * 100}%`,
    width: `${whiteKeyWidth.value}%`,
    background: key.active ? noteColor : inactiveBackground,
    borderColor: key.active
      ? withAlpha(noteColor, 'd9')
      : key.secondary
        ? secondaryAccent
        : key.muted
          ? '#cbd5e1'
          : '#d4d4d8',
    boxShadow: key.active
      ? `inset 0 -14px 0 ${withAlpha(noteColor, 'c0')}`
      : key.secondary
        ? 'inset 0 -10px 0 rgba(148, 163, 184, 0.55)'
        : undefined,
    color: key.active ? '#ffffff' : '#52525b',
  };
}

function blackKeyStyle(key: PianoKey) {
  const noteColor = props.noteColors[key.note] || '#111827';
  const accent = key.active
    ? withAlpha(noteColor, 'e6')
    : key.secondary
      ? '#64748b'
      : key.muted
        ? '#334155'
        : '#0f172a';

  return {
    left: `${key.left * 100}%`,
    width: `${whiteKeyWidth.value * 0.64}%`,
    height: '62%',
    background: '#101010',
    borderColor: key.active ? accent : key.secondary ? accent : '#050505',
    boxShadow: `inset 0 -${key.active ? '18px' : key.secondary ? '12px' : '8px'} 0 ${accent}, 0 8px 14px rgba(15, 23, 42, 0.22)`,
    color: '#f8fafc',
  };
}

function isPlayable(key: PianoKey) {
  return key.available && !key.secondary && !key.muted;
}

function withAlpha(color: string, alpha: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return `${color}${alpha}`;
  }

  return color;
}
</script>
