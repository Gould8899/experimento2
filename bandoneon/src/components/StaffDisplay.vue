<template>
  <div
    class="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
  >
    <svg
      ref="svgEl"
      class="block h-full min-h-[10rem] w-full flex-1 touch-none"
      :class="gestureActive ? 'cursor-grabbing' : 'cursor-crosshair'"
      viewBox="0 -52 1320 576"
      preserveAspectRatio="xMidYMid meet"
      shape-rendering="geometricPrecision"
      text-rendering="optimizeLegibility"
      @pointerdown.capture.prevent="onSvgPointerDown"
      @pointermove.prevent="onSvgPointerMove"
    >
      <defs>
        <clipPath id="staff-display-clip">
          <rect x="12" y="-44" width="1296" height="544" rx="20" />
        </clipPath>
      </defs>

      <rect
        x="12"
        y="-44"
        width="1296"
        height="544"
        rx="20"
        fill="currentColor"
        opacity="0.025"
      />

      <g clip-path="url(#staff-display-clip)">

      <line
        x1="96"
        x2="96"
        :y1="STAFF_FRAME.y + 36"
        :y2="STAFF_FRAME.y + STAFF_FRAME.height - 28"
        stroke="currentColor"
        stroke-opacity="0.18"
        stroke-width="2.4"
      />

      <g v-for="line in staffLines" :key="line.id">
        <line
          v-for="y in line.lines"
          :key="`${line.id}-${y}`"
          x1="36"
          x2="1284"
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
        :class="staff.active ? 'cursor-crosshair' : 'cursor-pointer'"
        fill="transparent"
        pointer-events="all"
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
        x="660"
        y="262"
        font-size="20"
        text-anchor="middle"
        fill="currentColor"
        opacity="0.28"
      >
        {{ t('staff') }}
      </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n';
import { Note } from 'tonal';
import { computed, onUnmounted, ref } from 'vue';
import {
  hitStaffDisplayNote,
  matchStaffPointerNote,
  resolveStaffFromY,
  staffForHand,
  staffForNoteRegister,
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
  start: [note: string, staff: StaffName, options?: { additive?: boolean }];
  hover: [note: string, staff: StaffName];
  reflect: [note: string, staff: StaffName];
}>();

const props = defineProps<{
  notes: string[];
  noteStaffs?: StaffName[];
  groupBreaks?: number[];
  noteColors: Record<string, string>;
  hand: 'right' | 'left';
  tonic: string | null;
  scaleType: string | null;
  chordType: string | null;
  preferFlats?: boolean;
  treblePlayableNotes: string[];
  bassPlayableNotes: string[];
  activeNotes?: Record<string, boolean>;
  showMelodyTrail?: boolean;
  gestureFocusNote?: string | null;
  gestureActive?: boolean;
  gestureMode?: 'paint' | 'erase';
}>();

const { t } = useI18n({ useScope: 'global' });

const svgEl = ref<SVGSVGElement | null>(null);
const activePointerId = ref<number | null>(null);
const pointerAdditive = ref(false);
const activeGestureStaff = ref<StaffName | null>(null);
const pointerPreview = ref<{
  x: number;
  y: number;
  color: string;
} | null>(null);

const STAFF_FRAME = {
  x: 12,
  y: -44,
  width: 1296,
  height: 544,
  rx: 20,
  right: 1308,
} as const;
const NOTE_RIGHT_PAD = 56;
const NOTEHEAD_RIGHT_EXTENT = 32;
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
const staffHitAreas = computed(() =>
  (['treble', 'bass'] as const).map((id) => {
    const bounds = staffInteractionBounds(id);

    return {
      id,
      top: bounds.top,
      height: bounds.bottom - bounds.top,
      active: id === activeStaff.value,
    };
  }),
);
const playableNotesByStaff = computed(() => ({
  treble: props.treblePlayableNotes,
  bass: props.bassPlayableNotes,
}));

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

const keySignatureStartX = 118;
const keySignatureGap = 16;
const ACCIDENTAL_LEFT_EXTENT = 42;
const NOTEHEAD_LEFT_EXTENT = 16;

const tonality = computed(() =>
  resolveSelectionTonality(
    props.tonic,
    props.scaleType,
    props.chordType,
    Boolean(props.preferFlats),
  ),
);

const keySignatureCount = computed(
  () => tonality.value?.keySignature?.length ?? 0,
);

const keySignatureNotePadding = computed(
  () => 28 + keySignatureCount.value * 8,
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

const noteAreaLeft = computed(() => {
  if (keySignatureGlyphs.value.length === 0) {
    return 108;
  }

  return keySignatureEndX.value + keySignatureNotePadding.value;
});

const noteAreaRight = STAFF_FRAME.right - 12;
const noteSpanRight = noteAreaRight - NOTE_RIGHT_PAD - NOTEHEAD_RIGHT_EXTENT;
const noteSpanLeft = computed(
  () => noteAreaLeft.value + ACCIDENTAL_LEFT_EXTENT,
);

const trebleClef = {
  x: 44,
  y: staffLines[0].lines[1] + 44,
  fontSize: 132,
} as const;

const bassClef = {
  x: 48,
  y: staffLines[1].lines[3] + 15,
  fontSize: 102,
} as const;

const phraseBreakBaseWeight = 1.55;
const phraseBreakIncomingAccidentalWeight = 0.5;
const phraseBreakOutgoingAccidentalWeight = 0.34;

const visibleGroupBreakSet = computed(() => {
  if (!props.groupBreaks?.length) {
    return new Set<number>();
  }

  return new Set(props.groupBreaks.filter((index) => index > 0 && index < 24));
});

const noteLayout = computed<DisplayNote[]>(() => {
  if (props.notes.length === 0) return [];

  const visibleNotes = props.notes.slice(-24);
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
  const spanLeft = noteSpanLeft.value;
  const spanRight = noteSpanRight;
  const spanWidth = Math.max(spanRight - spanLeft, 1);
  const baseGap =
    noteEntries.length > 1 && totalWeight > 0
      ? Math.min(48, Math.max(24, spanWidth / totalWeight))
      : 0;
  const positions = new Array(noteEntries.length).fill(spanRight);

  for (let index = newestIndex - 1; index >= 0; index -= 1) {
    positions[index] = positions[index + 1] - baseGap * pairWeights[index];
  }

  const leftmost = positions[0];
  if (leftmost > spanLeft) {
    const shift = leftmost - spanLeft;
    for (let index = 0; index < positions.length; index += 1) {
      positions[index] -= shift;
    }
  }

  if (positions[newestIndex] > spanRight) {
    const shift = positions[newestIndex] - spanRight;
    for (let index = 0; index < positions.length; index += 1) {
      positions[index] -= shift;
    }
  }

  if (noteEntries.length === 1) {
    positions[0] = Math.min(spanLeft + 52, spanRight);
  }

  const minContentLeft = keySignatureGlyphs.value.length
    ? keySignatureEndX.value + keySignatureNotePadding.value
    : 108;
  const leftExtent =
    positions[0] -
    (noteEntries[0]?.accidental ? ACCIDENTAL_LEFT_EXTENT : NOTEHEAD_LEFT_EXTENT);

  if (leftExtent < minContentLeft) {
    const shift = minContentLeft - leftExtent;
    for (let index = 0; index < positions.length; index += 1) {
      positions[index] += shift;
    }
  }

  if (positions[newestIndex] > spanRight) {
    const shift = positions[newestIndex] - spanRight;
    for (let index = 0; index < positions.length; index += 1) {
      positions[index] -= shift;
    }
  }

  return noteEntries.map(({ note, normalizedNote, accidental }, index) => {
    const x = positions[index];
    const staff =
      props.noteStaffs?.[index] ?? staffForNoteRegister(normalizedNote);
    const y = staffY(normalizedNote, staff);
    const stemUp = y > middleLineY[staff];
    const stemLength = 66;
    const stemX = x + (stemUp ? 7.2 : -7.2);
    const stemStartY = y + (stemUp ? -2 : 2);
    const stemEndY = stemStartY + (stemUp ? -stemLength : stemLength);

    const isActive = Boolean(props.activeNotes?.[note]);
    const isFocused = props.gestureFocusNote === note;
    const noteColor = props.noteColors[note];
    const hasColor = Boolean(noteColor);
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
      stemEndY,
      fill: hasColor ? noteColor! : 'currentColor',
      fillOpacity: isActive ? 0.98 : isFocused ? 0.9 : hasColor ? 0.82 : 0.48,
      strokeOpacity: isActive ? 0.35 : hasColor ? 0.22 : 0.18,
      stemOpacity: isActive ? 0.98 : hasColor ? 0.88 : 0.55,
      isFocused,
      focusStroke: eraseFocus
        ? 'rgba(245, 158, 11, 0.95)'
        : 'rgba(16, 185, 129, 0.95)',
    };
  });
});

const noteTrail = computed(() => {
  if (!props.showMelodyTrail) {
    return [] as Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }>;
  }

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

  const y1 = staffTop.treble - 14;
  const y2 = staffTop.bass + lineSpacing * 4 + 14;

  return props.groupBreaks.flatMap((breakIndex) => {
    const previous = noteLayout.value[breakIndex - 1];
    const next = noteLayout.value[breakIndex];

    if (!previous || !next) {
      return [];
    }

    return [
      {
        x: (previous.x + next.x) / 2,
        y1,
        y2,
      },
    ];
  });
});

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

function resolvePointerStaff(event: PointerEvent) {
  const point = clientToSvgPoint(event);
  if (!point) return null;

  return resolveStaffFromY(
    point.y,
    props.treblePlayableNotes,
    props.bassPlayableNotes,
    staffForHand(props.hand),
  );
}

function resolveExistingDisplayNote(event: PointerEvent) {
  const point = clientToSvgPoint(event);
  if (!point) return null;

  const layout = noteLayout.value.map((item) => ({
    note: item.note,
    x: item.x,
    y: item.y,
    staff: item.staff,
  }));
  const preferredStaff = staffForHand(props.hand);
  const staffOrder: StaffName[] =
    preferredStaff === 'treble' ? ['treble', 'bass'] : ['bass', 'treble'];

  for (const staff of staffOrder) {
    const hit = hitStaffDisplayNote(point.x, point.y, staff, layout);
    if (hit) return hit;
  }

  return null;
}

function resolvePointerNote(event: PointerEvent, staffOverride?: StaffName) {
  const point = clientToSvgPoint(event);
  const staff = staffOverride ?? resolvePointerStaff(event);
  if (!point || !staff) return null;

  return matchStaffPointerNote({
    x: point.x,
    y: point.y,
    staff,
    playableNotes: playableNotesByStaff.value[staff],
  });
}

function updatePointerPreview(
  event: PointerEvent,
  staffOverride?: StaffName,
) {
  const point = clientToSvgPoint(event);
  const staff = staffOverride ?? resolvePointerStaff(event);
  const note = resolvePointerNote(event, staff ?? undefined);
  if (!point || !staff || !note) {
    pointerPreview.value = null;
    return;
  }

  pointerPreview.value = {
    x: Math.min(
      STAFF_LAYOUT.noteArea.right - 28,
      Math.max(STAFF_LAYOUT.noteArea.left + 28, point.x),
    ),
    y: staffY(note, staff),
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

  const existingNote = resolveExistingDisplayNote(event);
  if (existingNote) {
    emit('reflect', existingNote.note, existingNote.staff);
    return;
  }

  const staff = resolvePointerStaff(event);
  const note = resolvePointerNote(event);
  if (!staff || !note) return;

  activePointerId.value = event.pointerId;
  pointerAdditive.value =
    event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
  activeGestureStaff.value = staff;
  if (event.currentTarget instanceof SVGSVGElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  updatePointerPreview(event, staff);
  emit('start', note, staff, { additive: pointerAdditive.value });
  attachWindowPointerListeners();
}

function attachWindowPointerListeners() {
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
}

function detachWindowPointerListeners() {
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
}

function onWindowPointerMove(event: PointerEvent) {
  onSvgPointerMove(event);
}

function onWindowPointerUp(event: PointerEvent) {
  onSvgPointerEnd(event);
  detachWindowPointerListeners();
}

function onSvgPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) {
    if (!props.gestureActive) {
      updatePointerPreview(event);
    }
    return;
  }

  const lockedStaff = activeGestureStaff.value;
  if (!lockedStaff) return;

  const staff = resolvePointerStaff(event);
  if (staff !== lockedStaff) {
    pointerPreview.value = null;
    return;
  }

  const note = resolvePointerNote(event, lockedStaff);
  updatePointerPreview(event, lockedStaff);
  if (note) {
    emit('hover', note, lockedStaff);
  }
}

function onSvgPointerEnd(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return;

  activePointerId.value = null;
  activeGestureStaff.value = null;
  pointerAdditive.value = false;
  pointerPreview.value = null;
  detachWindowPointerListeners();
}

onUnmounted(() => {
  detachWindowPointerListeners();
});
</script>
