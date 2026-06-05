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
        <div class="text-sm font-semibold tracking-tight">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <div
      ref="keyboardEl"
      :class="[
        'relative touch-none overflow-hidden rounded-xl border border-neutral-800/80',
        compact ? 'h-24 sm:h-28' : 'h-36',
        props.gestureActive ? 'cursor-grabbing' : 'cursor-crosshair',
      ]"
      :style="{ background: PIANO_THEME.keyboardBg }"
      @pointerdown.capture.prevent="onKeyboardPointerDown"
      @pointermove.prevent="onKeyboardPointerMove"
      @pointerup="onKeyboardPointerEnd"
      @pointercancel="onKeyboardPointerEnd"
      @lostpointercapture="onKeyboardPointerEnd"
    >
      <div
        v-for="(zone, index) in secondaryZones"
        :key="`inactive-${index}`"
        class="pointer-events-none absolute inset-y-0 z-10"
        :style="{
          left: `${zone.left}%`,
          width: `${zone.width}%`,
          background: PIANO_THEME.inactiveHand,
        }"
      />

      <button
        v-for="key in whiteKeys"
        :key="key.note"
        :class="whiteKeyClass(key)"
        :style="whiteKeyStyle(key)"
        :title="formatLabel(key.note)"
        :aria-disabled="!acceptsPointer(key)"
        type="button"
      >
        <span
          v-if="keyRole(key) !== 'secondary'"
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-tight"
          :class="labelClass(key)"
        >
          {{ compactLabel(key.note) }}
        </span>
        <span
          v-else
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-tight"
          :style="{ color: PIANO_THEME.inactiveLabel }"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.note"
        :class="blackKeyClass(key)"
        :style="blackKeyStyle(key)"
        :title="formatLabel(key.note)"
        :aria-disabled="!acceptsPointer(key)"
        type="button"
      >
        <span
          class="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-tight"
          :class="labelClass(key)"
          :style="keyRole(key) === 'secondary' ? { color: PIANO_THEME.inactiveLabel } : undefined"
        >
          {{ compactLabel(key.note) }}
        </span>
      </button>
    </div>

    <div
      v-if="showLegend"
      class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500 dark:text-neutral-400"
    >
      <span class="inline-flex items-center gap-1.5">
        <span
          class="h-2 w-4 rounded-sm shadow-[inset_0_-2px_0_rgba(0,0,0,0.22)] ring-1 ring-white/40"
          :style="{ background: PIANO_THEME.legendSelected }"
        />
        {{ t('piano_legend_selected') }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span
          class="h-2 w-4 rounded-sm ring-1 ring-black/10"
          :style="{ background: PIANO_THEME.legendPlayable }"
        />
        {{ t('piano_legend_playable') }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span
          class="h-2 w-4 rounded-sm border border-neutral-800"
          :style="{ background: PIANO_THEME.inactiveHand }"
        />
        {{ t('inactive_range') }}
      </span>
      <span
        v-if="mutedNoteSet.size > 0"
        class="inline-flex items-center gap-1.5"
      >
        <span class="h-2 w-4 rounded-sm border border-dashed border-neutral-400 bg-muted-stripe" />
        {{ t('out_of_scale') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { Note } from 'tonal';
import { computed, ref } from 'vue';
import { PIANO_THEME } from '../constants/pianoTheme';
import { resolvePointedPianoNote } from '../utils/pianoGeometry';
import { octaveColorForNote, withHexAlpha } from '../utils/octaveColor';
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

type KeyRole = 'primary' | 'secondary' | 'muted' | 'unavailable';

type SecondaryZone = {
  left: number;
  width: number;
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
  start: [note: string, options?: { additive?: boolean }];
  hover: [note: string, options?: { additive?: boolean }];
}>();

const { t } = useI18n({ useScope: 'global' });
const keyboardEl = ref<HTMLDivElement | null>(null);
const activePointerId = ref<number | null>(null);
const pointerAdditive = ref(false);

const availableNoteSet = computed(() => new Set(props.availableNotes));
const secondaryNoteSet = computed(() => new Set(props.secondaryNotes ?? []));
const mutedNoteSet = computed(() => new Set(props.mutedNotes ?? []));

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

const secondaryZones = computed(() => {
  const secondaryWhites = whiteKeys.value
    .filter((key) => key.secondary)
    .sort((left, right) => left.left - right.left);

  if (secondaryWhites.length === 0) {
    return [] as SecondaryZone[];
  }

  const zones: SecondaryZone[] = [];
  let zoneStart = secondaryWhites[0];
  let zoneEnd = secondaryWhites[0];
  const gapThreshold = whiteKeyWidthRatio.value * 1.25;

  for (let index = 1; index < secondaryWhites.length; index += 1) {
    const key = secondaryWhites[index];
    const gap = key.left - zoneEnd.left;

    if (gap <= gapThreshold) {
      zoneEnd = key;
      continue;
    }

    zones.push(createSecondaryZone(zoneStart, zoneEnd));
    zoneStart = key;
    zoneEnd = key;
  }

  zones.push(createSecondaryZone(zoneStart, zoneEnd));
  return zones;
});

const showLegend = computed(
  () =>
    !props.compact ||
    secondaryNoteSet.value.size > 0 ||
    mutedNoteSet.value.size > 0,
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

function createSecondaryZone(start: PianoKey, end: PianoKey): SecondaryZone {
  const left = Math.max(0, start.left * 100);
  const right = Math.min(100, (end.left + whiteKeyWidthRatio.value) * 100);

  return {
    left,
    width: Math.max(whiteKeyWidthRatio.value * 100, right - left) + 0.35,
  };
}

function keyRole(key: PianoKey): KeyRole {
  if (key.secondary) return 'secondary';
  if (!key.available) return 'unavailable';
  if (key.muted) return 'muted';
  return 'primary';
}

function octaveColor(note: string) {
  return props.noteColors[note] || octaveColorForNote(note);
}

function isPlayable(key: PianoKey) {
  return key.available && !key.secondary && !key.muted;
}

function acceptsPointer(key: PianoKey) {
  return key.available && !key.muted;
}

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

function labelClass(key: PianoKey) {
  const role = keyRole(key);

  if (role === 'secondary') {
    return '';
  }

  if (role === 'muted' || role === 'unavailable') {
    return 'text-neutral-600/70 dark:text-neutral-300/55';
  }

  if (key.active) {
    return 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]';
  }

  return key.isBlack ? 'text-white/90' : 'text-neutral-950/80';
}

function whiteKeyClass(key: PianoKey) {
  const role = keyRole(key);

  return [
    'absolute top-0 bottom-0 m-0 appearance-none overflow-hidden p-0 outline-none transition-[background,box-shadow] duration-150',
    role === 'secondary'
      ? 'z-[12] cursor-pointer rounded-none border-0 bg-transparent'
      : 'z-20 border-0',
    role === 'muted' || role === 'unavailable' ? 'z-[15]' : '',
    isPlayable(key)
      ? props.gestureActive
        ? 'cursor-grabbing'
        : 'cursor-crosshair'
      : role === 'muted'
        ? 'cursor-default'
        : 'cursor-default',
  ];
}

function blackKeyClass(key: PianoKey) {
  const role = keyRole(key);

  return [
    'absolute top-0 m-0 appearance-none overflow-hidden p-0 outline-none transition-[background,box-shadow] duration-150',
    role === 'secondary'
      ? 'z-[22] cursor-pointer rounded-b-[0.45rem] border-0'
      : 'z-30 rounded-b-[0.45rem] border-0',
    role === 'muted' || role === 'unavailable' ? 'z-[25]' : '',
    isPlayable(key)
      ? props.gestureActive
        ? 'cursor-grabbing'
        : 'cursor-crosshair'
      : role === 'secondary'
        ? 'cursor-pointer'
        : 'cursor-default',
  ];
}

function keyGeometry(key: PianoKey, variant: 'white' | 'black') {
  if (variant === 'white') {
    const widthPct = whiteKeyWidth.value;

    return {
      left: `${key.left * 100}%`,
      // Slight overlap hides sub-pixel seams between adjacent white keys.
      width: `calc(${widthPct}% + 1.25px)`,
      boxSizing: 'border-box' as const,
    };
  }

  return {
    left: `${key.left * 100}%`,
    width: `${whiteKeyWidth.value * 0.62}%`,
    height: '61%',
    boxSizing: 'border-box' as const,
  };
}

function focusRingStyle(key: PianoKey) {
  if (props.gestureNote !== key.note) return undefined;
  return `inset 0 0 0 2px ${PIANO_THEME.focusRing}`;
}

function secondaryWhiteStyle(key: PianoKey) {
  return {
    ...keyGeometry(key, 'white'),
    background: 'transparent',
    boxShadow: 'none',
  };
}

function secondaryBlackStyle(key: PianoKey) {
  return {
    ...keyGeometry(key, 'black'),
    background: PIANO_THEME.inactiveHand,
    boxShadow: 'inset 0 -3px 0 rgba(255,255,255,0.04)',
  };
}

function mutedStyle(key: PianoKey, variant: 'white' | 'black') {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');
  const border = isDark ? PIANO_THEME.mutedBorderDark : PIANO_THEME.mutedBorderLight;
  const stripe = isDark ? PIANO_THEME.mutedStripeDark : PIANO_THEME.mutedStripeLight;

  if (variant === 'white') {
    return {
      ...keyGeometry(key, 'white'),
      background: stripe,
      boxShadow: `inset 0 0 0 1px ${border}`,
    };
  }

  return {
    ...keyGeometry(key, 'black'),
    background: stripe,
    boxShadow: `inset 0 0 0 1px ${border}`,
    outline: `1px dashed ${border}`,
    outlineOffset: '-2px',
  };
}

function selectedWhiteStyle(key: PianoKey) {
  const fill = octaveColor(key.note);

  return {
    ...keyGeometry(key, 'white'),
    background: fill,
    boxShadow: [
      `inset 0 0 0 2px rgba(255,255,255,0.55)`,
      `inset 0 -11px 0 ${withHexAlpha(fill, 'aa')}`,
      '0 2px 4px rgba(0,0,0,0.28)',
      focusRingStyle(key),
    ]
      .filter(Boolean)
      .join(', '),
  };
}

function selectedBlackStyle(key: PianoKey) {
  const fill = octaveColor(key.note);

  return {
    ...keyGeometry(key, 'black'),
    background: PIANO_THEME.blackKeySelected,
    boxShadow: [
      `inset 0 -10px 0 ${fill}`,
      `inset 0 0 0 2px ${withHexAlpha(fill, 'cc')}`,
      '0 4px 8px rgba(0,0,0,0.45)',
      focusRingStyle(key),
    ]
      .filter(Boolean)
      .join(', '),
  };
}

function idleWhiteStyle(key: PianoKey) {
  const fill = octaveColor(key.note);

  return {
    ...keyGeometry(key, 'white'),
    background: fill,
    boxShadow: [focusRingStyle(key)].filter(Boolean).join(', '),
  };
}

function idleBlackStyle(key: PianoKey) {
  const fill = octaveColor(key.note);

  return {
    ...keyGeometry(key, 'black'),
    background: PIANO_THEME.blackKeyBody,
    boxShadow: [
      `inset 0 -5px 0 ${fill}`,
      '0 3px 7px rgba(0,0,0,0.35)',
      focusRingStyle(key),
    ]
      .filter(Boolean)
      .join(', '),
  };
}

function whiteKeyStyle(key: PianoKey) {
  const role = keyRole(key);

  if (role === 'secondary') return secondaryWhiteStyle(key);
  if (role === 'muted' || role === 'unavailable') return mutedStyle(key, 'white');
  if (key.active) return selectedWhiteStyle(key);
  return idleWhiteStyle(key);
}

function blackKeyStyle(key: PianoKey) {
  const role = keyRole(key);

  if (role === 'secondary') return secondaryBlackStyle(key);
  if (role === 'muted' || role === 'unavailable') return mutedStyle(key, 'black');
  if (key.active) return selectedBlackStyle(key);
  return idleBlackStyle(key);
}

function pointerOptions(event: PointerEvent) {
  return { additive: event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey };
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
  pointerAdditive.value = pointerOptions(event).additive ?? false;
  if (event.currentTarget instanceof HTMLDivElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  const note = resolvePointerNote(event);
  if (!note) return;

  const key = keys.value.find((item) => item.note === note);
  if (!key || !acceptsPointer(key)) return;

  emit('start', note, pointerOptions(event));
}

function onKeyboardPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  const note = resolvePointerNote(event);
  if (!note) return;

  const key = keys.value.find((item) => item.note === note);
  if (!key || !acceptsPointer(key)) return;

  emit('hover', note, { additive: pointerAdditive.value });
}

function onKeyboardPointerEnd(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  activePointerId.value = null;
  pointerAdditive.value = false;
}
</script>

<style scoped>
.bg-muted-stripe {
  background: repeating-linear-gradient(
    -45deg,
    #b8b8b8 0,
    #b8b8b8 2px,
    #d9d9d9 2px,
    #d9d9d9 4px
  );
}

:global(.dark) .bg-muted-stripe {
  background: repeating-linear-gradient(
    -45deg,
    #3a3a40 0,
    #3a3a40 2px,
    #4a4a52 2px,
    #4a4a52 4px
  );
}
</style>
