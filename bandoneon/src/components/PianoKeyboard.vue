<template>
  <div
    :class="[
      'rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900',
      compact ? 'p-1.5' : 'p-3',
    ]"
  >
    <div
      v-if="!compact"
      class="mb-3 flex items-center justify-between gap-3"
    >
      <div>
        <div
          class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
        >
          {{ t('piano_map') }}
        </div>
        <div
          :class="
            compact
              ? 'text-xs font-semibold tracking-tight'
              : 'text-sm font-semibold tracking-tight'
          "
        >
          {{ subtitle }}
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
              class="h-2.5 w-2.5 rounded-full bg-black shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] dark:bg-black"
            />
            {{ t('inactive_range') }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span
              class="h-2.5 w-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
            />
            {{ t('out_of_scale') }}
          </span>
        </div>
      </div>
    </div>

    <div
      ref="keyboardEl"
      :class="[
        'relative touch-none overflow-hidden rounded-xl bg-neutral-200 p-1 dark:bg-neutral-950',
        compact ? 'h-24 sm:h-26' : 'h-36',
        props.gestureActive ? 'cursor-grabbing' : 'cursor-crosshair',
      ]"
      @pointerdown.capture.prevent="onKeyboardPointerDown"
      @pointermove.prevent="onKeyboardPointerMove"
      @pointerup="onKeyboardPointerEnd"
      @pointercancel="onKeyboardPointerEnd"
      @lostpointercapture="onKeyboardPointerEnd"
    >
      <button
        v-for="key in whiteKeys"
        :key="key.note"
        :class="[
          'absolute top-0 right-auto bottom-0 z-10 overflow-hidden rounded-b-lg border border-neutral-300 transition',
          key.available
            ? 'hover:border-neutral-500 dark:border-neutral-700'
            : 'dark:border-neutral-800',
          !isPlayable(key)
            ? 'cursor-default'
            : props.gestureActive
              ? 'cursor-grabbing'
              : 'cursor-crosshair',
        ]"
        :style="whiteKeyStyle(key)"
        :title="formatLabel(key.note)"
        :aria-disabled="!isPlayable(key)"
        type="button"
      >
        <span
          :class="[
            'pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium',
            key.secondary
              ? 'opacity-0'
              : 'text-neutral-500 dark:text-neutral-400',
          ]"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.note"
        :class="[
          'absolute top-0 z-30 rounded-b-lg border border-neutral-950 text-white shadow-sm transition',
          !isPlayable(key)
            ? 'cursor-default'
            : props.gestureActive
              ? 'cursor-grabbing'
              : 'cursor-crosshair',
        ]"
        :style="blackKeyStyle(key)"
        :title="formatLabel(key.note)"
        :aria-disabled="!isPlayable(key)"
        type="button"
      >
        <span
          class="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium"
          :class="
            key.secondary
              ? 'opacity-0'
              : key.active
                ? 'opacity-100'
                : key.secondary || isPlayable(key)
                  ? 'opacity-80'
                  : 'opacity-45'
          "
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
import { computed, ref } from 'vue';
import { resolvePointedPianoNote } from '../utils/pianoGeometry';
import { formatDisplayedNote } from '../utils/staffNotation';

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
  subtitle?: string;
  notes: string[];
  interactionMode?: 'paint-on';
  gestureActive?: boolean;
  gestureMode?: 'paint' | 'erase';
  gestureNote?: string | null;
  availableNotes: string[];
  activeNotes: Record<string, boolean>;
  secondaryNotes?: string[];
  mutedNotes?: string[];
  noteColors: Record<string, string>;
  pitchNotation: 'scientific' | 'helmholtz' | 'solfege';
  preferFlats?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  start: [note: string];
  hover: [note: string];
}>();

const { t } = useI18n({ useScope: 'global' });
const keyboardEl = ref<HTMLDivElement | null>(null);
const activePointerId = ref<number | null>(null);

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
const whiteKeyWidthRatio = computed(() => 1 / whiteKeys.value.length);
const blackKeyWidthRatio = computed(() => whiteKeyWidthRatio.value * 0.64);
const activeNoteCount = computed(
  () => Object.values(props.activeNotes).filter(Boolean).length,
);
const pointerWhiteKeys = computed(() =>
  whiteKeys.value.map((key) => ({
    note: key.note,
    left: key.left,
    width: whiteKeyWidthRatio.value,
  })),
);
const pointerBlackKeys = computed(() =>
  blackKeys.value.map((key) => ({
    note: key.note,
    left: key.left,
    width: blackKeyWidthRatio.value,
  })),
);

function compactLabel(note: string) {
  return formatLabel(note).replace(/[0-9]/g, '');
}

function formatLabel(note: string) {
  const parsed = Note.get(note);
  if (parsed.empty) return note;

  return formatDisplayedNote(
    parsed.name,
    props.pitchNotation,
    Boolean(props.preferFlats),
  );
}

function whiteKeyStyle(key: PianoKey) {
  const noteColor = props.noteColors[key.note] || '#94a3b8';
  const playable = isPlayable(key);
  const gestureAccent =
    props.gestureMode === 'erase'
      ? 'rgba(245, 158, 11, 0.72)'
      : 'rgba(16, 185, 129, 0.72)';
  const gestureOutline =
    props.gestureMode === 'erase'
      ? 'rgba(245, 158, 11, 0.26)'
      : 'rgba(16, 185, 129, 0.24)';
  if (key.secondary) {
    return {
      left: `${key.left * 100}%`,
      width: `${whiteKeyWidth.value}%`,
      background: '#000000',
      borderColor: '#000000',
      boxShadow:
        'inset 0 -18px 0 rgba(0, 0, 0, 0.98), inset 0 0 0 999px rgba(0, 0, 0, 0.9)',
      color: '#000000',
      opacity: 1,
    };
  }

  const inactiveBackground = !key.available
    ? '#d1d5db'
    : key.muted
      ? '#d4d4d8'
      : playable
        ? withAlpha(noteColor, '24')
        : '#eef2f7';

  return {
    left: `${key.left * 100}%`,
    width: `${whiteKeyWidth.value}%`,
    background: key.active ? noteColor : inactiveBackground,
    borderColor: key.active
      ? withAlpha(noteColor, 'f2')
      : key.muted
        ? '#71717a'
        : !key.available
          ? 'transparent'
          : playable
            ? withAlpha(noteColor, '88')
            : '#52525b',
    boxShadow: key.active
      ? `inset 0 -14px 0 ${withAlpha(noteColor, 'd9')}, 0 0 0 2px rgba(255,255,255,0.92)`
      : props.gestureNote === key.note
        ? `inset 0 -10px 0 ${gestureAccent}, 0 0 0 2px ${gestureOutline}`
        : key.muted
          ? 'inset 0 -10px 0 rgba(113, 113, 122, 0.38)'
          : playable
            ? `inset 0 -8px 0 ${withAlpha(noteColor, '70')}`
            : undefined,
    color: key.active ? '#ffffff' : '#52525b',
    opacity: key.available ? 1 : 0.58,
  };
}

function blackKeyStyle(key: PianoKey) {
  const noteColor = props.noteColors[key.note] || '#111827';
  const playable = isPlayable(key);
  const gestureOutline =
    props.gestureMode === 'erase'
      ? 'rgba(251, 191, 36, 0.38)'
      : 'rgba(52, 211, 153, 0.34)';
  const accent = key.active
    ? withAlpha(noteColor, 'e6')
    : key.secondary
      ? '#71717a'
      : key.muted
        ? '#a1a1aa'
        : playable
          ? withAlpha(noteColor, 'd0')
          : '#3f3f46';

  if (key.secondary) {
    return {
      left: `${key.left * 100}%`,
      width: `${whiteKeyWidth.value * 0.64}%`,
      height: '62%',
      background: '#000000',
      borderColor: '#000000',
      boxShadow:
        'inset 0 -18px 0 #000000, inset 0 0 0 999px rgba(0, 0, 0, 0.88), 0 8px 14px rgba(0, 0, 0, 0.35)',
      color: '#000000',
      opacity: 1,
      transform: undefined,
    };
  }

  return {
    left: `${key.left * 100}%`,
    width: `${whiteKeyWidth.value * 0.64}%`,
    height: '62%',
    background: !key.available
      ? '#111827'
      : key.active
        ? '#111827'
        : key.muted
          ? '#27272a'
          : '#101010',
    borderColor: key.active ? accent : '#050505',
    boxShadow: `${props.gestureNote === key.note ? `0 0 0 2px ${gestureOutline}, ` : ''}inset 0 -${key.active ? '18px' : playable ? '10px' : '8px'} 0 ${accent}, 0 8px 14px rgba(15, 23, 42, 0.22)`,
    color: '#f8fafc',
    opacity: key.available ? 1 : 0.52,
    transform: props.gestureNote === key.note ? 'translateY(1px)' : undefined,
  };
}

function isPlayable(key: PianoKey) {
  return key.available && !key.secondary && !key.muted;
}

function acceptsPointer(key: PianoKey) {
  return key.available && !key.muted;
}

function withAlpha(color: string, alpha: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return `${color}${alpha}`;
  }

  return color;
}

function resolvePointerNote(event: PointerEvent) {
  const keyboard = keyboardEl.value;
  if (!keyboard) return null;

  const rect = keyboard.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  return resolvePointedPianoNote({
    xRatio: (event.clientX - rect.left) / rect.width,
    yRatio: (event.clientY - rect.top) / rect.height,
    whiteKeys: pointerWhiteKeys.value,
    blackKeys: pointerBlackKeys.value,
    clampToBounds: false,
  });
}

function onKeyboardPointerDown(event: PointerEvent) {
  if (
    activePointerId.value !== null &&
    activePointerId.value !== event.pointerId
  ) {
    return;
  }

  activePointerId.value = event.pointerId;
  if (event.currentTarget instanceof HTMLDivElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  const note = resolvePointerNote(event);
  if (!note) return;

  const key = keys.value.find((item) => item.note === note);
  if (!key || !acceptsPointer(key)) return;

  emit('start', note);
}

function onKeyboardPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  const note = resolvePointerNote(event);
  if (!note) return;

  const key = keys.value.find((item) => item.note === note);
  if (!key || !acceptsPointer(key)) return;

  emit('hover', note);
}

function onKeyboardPointerEnd(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  activePointerId.value = null;
}
</script>
