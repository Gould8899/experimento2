<template>
  <div
    class="flex h-full min-h-[27rem] flex-col rounded-2xl border border-neutral-200 bg-white p-4.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
  >
    <div class="mb-1.5 flex items-center justify-between gap-3">
      <div>
        <div
          class="text-[11px] font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-neutral-200"
        >
          {{ t('staff') }}
        </div>
        <div class="text-xs font-semibold tracking-tight">
          {{ subtitle }}
        </div>
      </div>
      <div class="text-[11px] text-neutral-500 dark:text-neutral-400">
        {{ notes.length }} {{ t('staff_notes') }}
      </div>
    </div>

    <p
      v-if="showPlayHint"
      class="mb-2 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400"
    >
      {{ t('staff_play_hint') }}
    </p>

    <svg
      ref="svgEl"
      class="block h-84 w-full flex-1 touch-none sm:h-[26rem] lg:h-full"
      :class="gestureActive ? 'cursor-grabbing' : 'cursor-crosshair'"
      viewBox="0 0 1120 560"
      preserveAspectRatio="xMidYMid meet"
      shape-rendering="geometricPrecision"
      text-rendering="optimizeLegibility"
      @pointerdown.capture.prevent="onSvgPointerDown"
      @pointermove.prevent="onSvgPointerMove"
      @pointerup="onSvgPointerEnd"
      @pointercancel="onSvgPointerEnd"
      @lostpointercapture="onSvgPointerEnd"
    >
      <rect
        x="22"
        y="26"
        width="1076"
        height="508"
        rx="24"
        fill="currentColor"
        opacity="0.025"
      />

      <line
        x1="138"
        x2="138"
        y1="56"
        y2="494"
        stroke="currentColor"
        stroke-opacity="0.18"
        stroke-width="2.4"
      />

      <rect
        :x="timelineCenterX - 28"
        y="56"
        width="56"
        height="438"
        rx="18"
        fill="currentColor"
        opacity="0.04"
      />

      <line
        :x1="timelineCenterX"
        :x2="timelineCenterX"
        y1="56"
        y2="494"
        stroke="currentColor"
        stroke-opacity="0.14"
        stroke-dasharray="8 8"
        stroke-width="1.8"
      />

      <g v-for="line in staffLines" :key="line.id">
        <line
          v-for="y in line.lines"
          :key="`${line.id}-${y}`"
          x1="44"
          x2="1084"
          :y1="y"
          :y2="y"
          stroke="currentColor"
          :stroke-opacity="activeStaff === line.id ? 0.28 : 0.1"
          stroke-width="1.55"
        />
      </g>

      <text
        :x="trebleClef.x"
        :y="trebleClef.y"
        :font-size="trebleClef.fontSize"
        :font-family="clefFontFamily"
        fill="currentColor"
        :opacity="activeStaff === 'treble' ? 0.9 : 0.38"
      >
        𝄞
      </text>
      <text
        :x="bassClef.x"
        :y="bassClef.y"
        :font-size="bassClef.fontSize"
        :font-family="clefFontFamily"
        fill="currentColor"
        :opacity="activeStaff === 'bass' ? 0.9 : 0.38"
      >
        𝄢
      </text>

      <text
        v-for="(item, index) in keySignatureGlyphs"
        :key="`${item.staff}-${index}`"
        :x="item.x"
        :y="item.y"
        font-size="34"
        font-weight="600"
        text-anchor="middle"
        fill="currentColor"
        :opacity="activeStaff === item.staff ? 0.88 : 0.42"
      >
        {{ item.glyph }}
      </text>

      <line
        v-for="(segment, index) in noteTrail"
        :key="`trail-${index}`"
        :x1="segment.x1"
        :y1="segment.y1"
        :x2="segment.x2"
        :y2="segment.y2"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-opacity="0.34"
        stroke-width="1.8"
      />

      <rect
        v-for="staff in staffHitAreas"
        :key="`hit-${staff.id}`"
        :x="STAFF_LAYOUT.noteArea.left"
        :y="staff.top"
        :width="STAFF_LAYOUT.noteArea.right - STAFF_LAYOUT.noteArea.left"
        :height="staff.height"
        fill="transparent"
        :pointer-events="staff.active ? 'all' : 'none'"
      />

      <g v-if="pointerPreview" pointer-events="none">
        <ellipse
          :cx="pointerPreview.x"
          :cy="pointerPreview.y"
          rx="21"
          ry="16"
          :fill="pointerPreview.color"
          fill-opacity="0.35"
          stroke="currentColor"
          stroke-opacity="0.5"
          stroke-width="1.5"
          :transform="`rotate(-24 ${pointerPreview.x} ${pointerPreview.y})`"
        />
      </g>

      <g v-for="(item, index) in noteLayout" :key="`${item.note}-${index}`">
        <line
          v-for="ledger in item.ledgerLines"
          :key="`${item.note}-${ledger}`"
          :x1="item.x - 16"
          :x2="item.x + 16"
          :y1="ledger"
          :y2="ledger"
          stroke="currentColor"
          stroke-opacity="0.92"
          stroke-width="1.9"
        />
        <text
          v-if="item.accidental"
          :x="item.x - 34"
          :y="item.y + 12"
          font-size="38"
          font-weight="600"
          text-anchor="middle"
          fill="currentColor"
          opacity="0.98"
        >
          {{ item.accidental }}
        </text>
        <g pointer-events="none">
          <ellipse
            v-if="item.isFocused"
            :cx="item.x"
            :cy="item.y"
            rx="24"
            ry="18"
            fill="none"
            :stroke="item.focusStroke"
            stroke-width="2.5"
            :transform="`rotate(-24 ${item.x} ${item.y})`"
          />
          <line
            :x1="item.stemX"
            :x2="item.stemX"
            :y1="item.stemStartY"
            :y2="item.stemEndY"
            stroke="currentColor"
            stroke-linecap="round"
            :stroke-opacity="item.stemOpacity"
            stroke-width="2"
          />
          <path
            :d="noteheadPath"
            :fill="item.fill"
            :fill-opacity="item.fillOpacity"
            stroke="currentColor"
            :stroke-opacity="item.strokeOpacity"
            stroke-width="1"
            :transform="`translate(${item.x} ${item.y}) scale(1.6) rotate(-24)`"
          />
        </g>
      </g>

      <line
        v-for="(marker, index) in groupMarkers"
        :key="`group-marker-${index}`"
        :x1="marker.x"
        :x2="marker.x"
        :y1="marker.y1"
        :y2="marker.y2"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-dasharray="3.5 6"
        stroke-opacity="0.76"
        stroke-width="2.6"
      />

      <text
        v-if="noteLayout.length === 0"
        x="460"
        y="282"
        font-size="22"
        text-anchor="middle"
        fill="currentColor"
        opacity="0.45"
      >
        {{ t('staff_empty') }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { Note } from 'tonal';
import { computed, ref } from 'vue';
import {
  matchStaffPointerNote,
  staffInteractionBounds,
  STAFF_LAYOUT,
  staffY,
  type StaffName,
} from '../utils/staffPointer';
import { resolveStaffDisplayNote } from '../utils/staffNotation';
import { resolveSelectionTonality } from '../utils/tonality';

type DisplayNote = {
  note: string;
  accidental: string;
  x: number;
  y: number;
  staff: StaffName;
  ledgerLines: number[];
  stemUp: boolean;
  stemX: number;
  stemStartY: number;
  stemEndY: number;
  fill: string;
  fillOpacity: number;
  strokeOpacity: number;
  stemOpacity: number;
  isFocused: boolean;
  focusStroke: string;
};

const noteheadPath =
  'M -7.8 -3.6 C -5.6 -6.9 -0.6 -8.3 4.2 -6.2 C 7.9 -4.5 9.2 -0.1 7.1 3 C 5.3 5.8 1.1 7.2 -3.1 6.3 C -7.8 5.2 -10.1 0.3 -7.8 -3.6 Z';
const clefFontFamily =
  "'Noto Music', 'Segoe UI Symbol', 'Arial Unicode MS', 'Times New Roman', serif";

const emit = defineEmits<{
  start: [note: string];
  hover: [note: string];
}>();

const props = defineProps<{
  notes: string[];
  groupBreaks?: number[];
  subtitle: string;
  noteColors: Record<string, string>;
  hand: 'right' | 'left';
  tonic: string | null;
  scaleType: string | null;
  chordType: string | null;
  preferFlats?: boolean;
  playableNotes: string[];
  activeNotes?: Record<string, boolean>;
  gestureFocusNote?: string | null;
  gestureActive?: boolean;
  gestureMode?: 'paint' | 'erase';
}>();

const { t } = useI18n({ useScope: 'global' });

const svgEl = ref<SVGSVGElement | null>(null);
const activePointerId = ref<number | null>(null);
const pointerPreview = ref<{
  x: number;
  y: number;
  color: string;
} | null>(null);

const lineSpacing = STAFF_LAYOUT.lineSpacing;
const staffTop = STAFF_LAYOUT.staffTop;
const bottomLineIndex = STAFF_LAYOUT.bottomLineIndex;
const topLineIndex = {
  treble: diatonicIndex('F5'),
  bass: diatonicIndex('A3'),
} as const;
const middleLineY = {
  treble: staffTop.treble + lineSpacing * 2,
  bass: staffTop.bass + lineSpacing * 2,
} as const;
const activeStaff = computed<StaffName>(() =>
  props.hand === 'right' ? 'treble' : 'bass',
);
const showPlayHint = computed(
  () => props.notes.length === 0 && props.playableNotes.length > 0,
);
const staffHitAreas = computed(() =>
  (['treble', 'bass'] as const).map((id) => {
    const notes =
      id === activeStaff.value ? props.playableNotes : ([] as string[]);
    const bounds = staffInteractionBounds(id, notes);

    return {
      id,
      top: bounds.top,
      height: bounds.bottom - bounds.top,
      active: id === activeStaff.value,
    };
  }),
);

const staffLines = [
  {
    id: 'treble',
    lines: Array.from(
      { length: 5 },
      (_, index) => staffTop.treble + index * lineSpacing,
    ),
  },
  {
    id: 'bass',
    lines: Array.from(
      { length: 5 },
      (_, index) => staffTop.bass + index * lineSpacing,
    ),
  },
];

const keySignatureLayouts = {
  sharp: {
    treble: ['F5', 'C5', 'G5', 'D5', 'A4', 'E5', 'B4'],
    bass: ['F3', 'C3', 'G3', 'D3', 'A2', 'E3', 'B2'],
  },
  flat: {
    treble: ['B4', 'E5', 'A4', 'D5', 'G4', 'C5', 'F4'],
    bass: ['B2', 'E3', 'A2', 'D3', 'G2', 'C3', 'F2'],
  },
} as const;

const keySignatureStartX = 188;
const keySignatureGap = 20;
const keySignatureNotePadding = 66;

const tonality = computed(() =>
  resolveSelectionTonality(
    props.tonic,
    props.scaleType,
    props.chordType,
    Boolean(props.preferFlats),
  ),
);

const keySignatureGlyphs = computed(() => {
  if (!tonality.value?.keySignature) {
    return [] as Array<{
      staff: StaffName;
      glyph: '♯' | '♭';
      x: number;
      y: number;
    }>;
  }

  const glyph = tonality.value.keySignature[0] === 'b' ? '♭' : '♯';
  const layout =
    glyph === '♭' ? keySignatureLayouts.flat : keySignatureLayouts.sharp;

  return tonality.value.keySignature.split('').flatMap((_, index) => [
    {
      staff: 'treble' as const,
      glyph,
      x: keySignatureStartX + index * keySignatureGap,
      y: staffY(layout.treble[index], 'treble') + (glyph === '♭' ? 11 : 10),
    },
    {
      staff: 'bass' as const,
      glyph,
      x: keySignatureStartX + index * keySignatureGap,
      y: staffY(layout.bass[index], 'bass') + (glyph === '♭' ? 11 : 10),
    },
  ]);
});

const keySignatureEndX = computed(() => {
  if (keySignatureGlyphs.value.length === 0) {
    return 0;
  }

  return Math.max(...keySignatureGlyphs.value.map((item) => item.x));
});

const noteAreaLeft = computed(() =>
  Math.max(292, keySignatureEndX.value + keySignatureNotePadding),
);

const noteAreaRight = 1080;
const timelineCenterX = computed(() =>
  Math.max(
    noteAreaLeft.value + 210,
    noteAreaRight - (keySignatureGlyphs.value.length === 0 ? 88 : 112),
  ),
);

const trebleClef = {
  x: 72,
  // The treble clef curl should sit on the second line.
  y: staffLines[0].lines[1] + 48,
  fontSize: 150,
} as const;

const bassClef = {
  x: 76,
  // The bass clef dots frame the fourth line.
  y: staffLines[1].lines[3] + 17,
  fontSize: 118,
} as const;

const phraseBreakBaseWeight = 1.55;
const phraseBreakIncomingAccidentalWeight = 0.5;
const phraseBreakOutgoingAccidentalWeight = 0.34;

const visibleGroupBreakSet = computed(() => {
  if (!props.groupBreaks?.length) {
    return new Set<number>();
  }

  return new Set(props.groupBreaks.filter((index) => index > 0 && index < 16));
});

const noteLayout = computed<DisplayNote[]>(() => {
  if (props.notes.length === 0) return [];

  const visibleNotes = props.notes.slice(-16);
  const noteEntries = visibleNotes.map((note) => {
    const { normalizedNote, accidental } = resolveStaffDisplayNote(
      note,
      Boolean(props.preferFlats),
    );

    return {
      note,
      normalizedNote,
      accidental,
    };
  });
  const newestIndex = visibleNotes.length - 1;
  const pairWeights = noteEntries.slice(1).map((entry, index) => {
    const olderEntry = noteEntries[index];
    const isPhraseBreak = visibleGroupBreakSet.value.has(index + 1);
    const phraseBreakWeight = isPhraseBreak
      ? phraseBreakBaseWeight +
        (entry.accidental ? phraseBreakIncomingAccidentalWeight : 0) +
        (olderEntry.accidental ? phraseBreakOutgoingAccidentalWeight : 0)
      : 0;

    return (
      1 +
      (entry.accidental ? 0.58 : 0) +
      (olderEntry.accidental ? 0.16 : 0) +
      phraseBreakWeight
    );
  });
  const totalWeight = pairWeights.reduce((sum, weight) => sum + weight, 0);
  const availableLeftWidth = Math.max(
    timelineCenterX.value - noteAreaLeft.value - 12,
    0,
  );
  const baseGap =
    totalWeight > 0
      ? Math.min(50, Math.max(27, availableLeftWidth / totalWeight))
      : 0;
  const positions = new Array(noteEntries.length).fill(timelineCenterX.value);

  for (let index = newestIndex - 1; index >= 0; index -= 1) {
    positions[index] = positions[index + 1] - baseGap * pairWeights[index];
  }

  return noteEntries.map(({ note, normalizedNote, accidental }, index) => {
    const x = positions[index];
    const staff = resolveNoteStaff();
    const y = staffY(normalizedNote, staff);
    const stemUp = y > middleLineY[staff];
    const stemLength = 66;
    const stemX = x + (stemUp ? 7.2 : -7.2);
    const stemStartY = y + (stemUp ? -2 : 2);

    const isActive = Boolean(props.activeNotes?.[note]);
    const isFocused = props.gestureFocusNote === note;
    const noteColor = props.noteColors[note];
    const eraseFocus = props.gestureMode === 'erase';

    return {
      note,
      accidental,
      x,
      y,
      staff,
      ledgerLines: getLedgerLines(normalizedNote, staff),
      stemUp,
      stemX,
      stemStartY,
      stemEndY: stemStartY + (stemUp ? -stemLength : stemLength),
      fill: isActive && noteColor ? noteColor : 'currentColor',
      fillOpacity: isActive ? 0.98 : isFocused ? 0.72 : 0.42,
      strokeOpacity: isActive ? 0.35 : 0.18,
      stemOpacity: isActive ? 0.98 : 0.55,
      isFocused,
      focusStroke: eraseFocus
        ? 'rgba(245, 158, 11, 0.95)'
        : 'rgba(16, 185, 129, 0.95)',
    };
  });
});

const noteTrail = computed(() => {
  if (noteLayout.value.length < 2) {
    return [] as Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }>;
  }

  return noteLayout.value
    .slice(0, -1)
    .map((item, index) => {
      if (visibleGroupBreakSet.value.has(index + 1)) {
        return null;
      }

      const next = noteLayout.value[index + 1];

      return {
        x1: item.x + 10,
        y1: item.y,
        x2: next.x - 10,
        y2: next.y,
      };
    })
    .filter((segment) => segment !== null);
});

const groupMarkers = computed(() => {
  if (!props.groupBreaks?.length || noteLayout.value.length < 2) {
    return [] as Array<{
      x: number;
      y1: number;
      y2: number;
    }>;
  }

  const staff = activeStaff.value;
  const y1 = staffTop[staff] - 12;
  const y2 = staffTop[staff] + lineSpacing * 4 + 12;

  return props.groupBreaks.flatMap((breakIndex) => {
    const previous = noteLayout.value[breakIndex - 1];
    const next = noteLayout.value[breakIndex];

    if (!previous || !next) {
      return [];
    }

    return [
      {
        x:
          (previous.x + next.x) / 2 -
          (next.accidental ? 12 : 0) +
          (previous.accidental ? 3 : 0),
        y1: y1 + 22,
        y2: y2 - 22,
      },
    ];
  });
});

function resolveNoteStaff(): StaffName {
  return activeStaff.value;
}

function diatonicIndex(note: string) {
  const parsed = Note.get(note);
  const octave = parsed.oct ?? 4;
  return octave * 7 + parsed.step;
}

function getLedgerLines(note: string, staff: StaffName) {
  const result: number[] = [];
  const noteIndex = diatonicIndex(note);

  if (noteIndex < bottomLineIndex[staff]) {
    for (
      let index = bottomLineIndex[staff] - 2;
      index >= noteIndex;
      index -= 2
    ) {
      result.push(staffY(indexToNote(index), staff));
    }
  }

  if (noteIndex > topLineIndex[staff]) {
    for (let index = topLineIndex[staff] + 2; index <= noteIndex; index += 2) {
      result.push(staffY(indexToNote(index), staff));
    }
  }

  return result;
}

function indexToNote(index: number) {
  const octave = Math.floor(index / 7);
  const step = index % 7;
  return `${['C', 'D', 'E', 'F', 'G', 'A', 'B'][step]}${octave}`;
}

function clientToSvgPoint(event: PointerEvent) {
  const svg = svgEl.value;
  if (!svg) return null;

  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;

  return point.matrixTransform(matrix.inverse());
}

function resolvePointerNote(event: PointerEvent) {
  const point = clientToSvgPoint(event);
  if (!point) return null;

  return matchStaffPointerNote({
    x: point.x,
    y: point.y,
    staff: activeStaff.value,
    playableNotes: props.playableNotes,
  });
}

function updatePointerPreview(event: PointerEvent) {
  const point = clientToSvgPoint(event);
  const note = resolvePointerNote(event);
  if (!point || !note) {
    pointerPreview.value = null;
    return;
  }

  pointerPreview.value = {
    x: Math.min(
      STAFF_LAYOUT.noteArea.right - 28,
      Math.max(STAFF_LAYOUT.noteArea.left + 28, point.x),
    ),
    y: staffY(note, activeStaff.value),
    color: props.noteColors[note] ?? '#0ea5e9',
  };
}

function onSvgPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;
  if (
    activePointerId.value !== null &&
    activePointerId.value !== event.pointerId
  ) {
    return;
  }

  const note = resolvePointerNote(event);
  if (!note) return;

  activePointerId.value = event.pointerId;
  if (event.currentTarget instanceof SVGSVGElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  updatePointerPreview(event);
  emit('start', note);
}

function onSvgPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) {
    if (!props.gestureActive) {
      updatePointerPreview(event);
    }
    return;
  }

  const note = resolvePointerNote(event);
  updatePointerPreview(event);
  if (note) {
    emit('hover', note);
  }
}

function onSvgPointerEnd(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  activePointerId.value = null;
  pointerPreview.value = null;
}
</script>
