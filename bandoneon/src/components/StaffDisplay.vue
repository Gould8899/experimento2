<template>
  <div
    class="flex h-full min-h-[17rem] flex-col rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
  >
    <div class="mb-2 flex items-center justify-between gap-3">
      <div>
        <div
          class="text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400"
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

    <svg
      class="block h-52 w-full flex-1 sm:h-56 lg:h-full"
      viewBox="0 0 760 240"
      preserveAspectRatio="xMidYMid meet"
    >
      <g v-for="line in staffLines" :key="line.id">
        <line
          v-for="y in line.lines"
          :key="`${line.id}-${y}`"
          x1="18"
          x2="742"
          :y1="y"
          :y2="y"
          stroke="currentColor"
          :stroke-opacity="activeStaff === line.id ? 0.22 : 0.08"
          stroke-width="1.8"
        />
      </g>

      <text
        x="28"
        y="74"
        font-size="44"
        fill="currentColor"
        :opacity="activeStaff === 'treble' ? 0.84 : 0.28"
      >
        𝄞
      </text>
      <text
        x="30"
        y="178"
        font-size="44"
        fill="currentColor"
        :opacity="activeStaff === 'bass' ? 0.84 : 0.28"
      >
        𝄢
      </text>

      <g v-for="(item, index) in noteLayout" :key="`${item.note}-${index}`">
        <line
          v-for="ledger in item.ledgerLines"
          :key="`${item.note}-${ledger}`"
          :x1="item.x - 12"
          :x2="item.x + 12"
          :y1="ledger"
          :y2="ledger"
          stroke="currentColor"
          stroke-opacity="0.7"
          stroke-width="1.6"
        />
        <text
          v-if="item.accidental"
          :x="item.x - 24"
          :y="item.y + 8"
          font-size="28"
          font-weight="600"
          text-anchor="middle"
          fill="currentColor"
          opacity="0.9"
        >
          {{ item.accidental }}
        </text>
        <line
          :x1="item.stemX"
          :x2="item.stemX"
          :y1="item.stemStartY"
          :y2="item.stemEndY"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-opacity="0.72"
          stroke-width="1.7"
        />
        <path
          :d="noteheadPath"
          :fill="item.color"
          fill-opacity="0.9"
          stroke="currentColor"
          stroke-opacity="0.2"
          stroke-width="1"
          :transform="`translate(${item.x} ${item.y}) scale(1.24) rotate(-24)`"
        />
      </g>

      <text
        v-if="noteLayout.length === 0"
        x="380"
        y="124"
        font-size="17"
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
import { computed } from 'vue';

type StaffName = 'treble' | 'bass';
type DisplayNote = {
  note: string;
  accidental: string;
  x: number;
  y: number;
  color: string;
  staff: StaffName;
  ledgerLines: number[];
  stemUp: boolean;
  stemX: number;
  stemStartY: number;
  stemEndY: number;
};

const noteheadPath =
  'M -7.8 -3.6 C -5.6 -6.9 -0.6 -8.3 4.2 -6.2 C 7.9 -4.5 9.2 -0.1 7.1 3 C 5.3 5.8 1.1 7.2 -3.1 6.3 C -7.8 5.2 -10.1 0.3 -7.8 -3.6 Z';

const props = defineProps<{
  notes: string[];
  subtitle: string;
  noteColors: Record<string, string>;
  hand: 'right' | 'left';
}>();

const { t } = useI18n({ useScope: 'global' });

const lineSpacing = 16;
const staffTop = {
  treble: 38,
  bass: 154,
} as const;
const bottomLineIndex = {
  treble: diatonicIndex('E4'),
  bass: diatonicIndex('G2'),
} as const;
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

const noteLayout = computed<DisplayNote[]>(() => {
  if (props.notes.length === 0) return [];

  const visibleNotes = props.notes.slice(-8);
  const startX = 132;
  const endX = 642;
  const stepX =
    visibleNotes.length === 1 ? 0 : (endX - startX) / (visibleNotes.length - 1);
  const staff = activeStaff.value;

  return visibleNotes.map((note, index) => {
    const parsed = Note.get(note);
    const x = startX + index * stepX;
    const y = staffY(note, staff);
    const stemUp = y > middleLineY[staff];
    const stemLength = 42;
    const stemX = x + (stemUp ? 7.2 : -7.2);
    const stemStartY = y + (stemUp ? -2 : 2);

    return {
      note,
      accidental: parsed.acc.replace('b', '♭').replace('#', '♯'),
      x,
      y,
      color: props.noteColors[note] || '#111827',
      staff,
      ledgerLines: getLedgerLines(note, staff),
      stemUp,
      stemX,
      stemStartY,
      stemEndY: stemStartY + (stemUp ? -stemLength : stemLength),
    };
  });
});

function diatonicIndex(note: string) {
  const parsed = Note.get(note);
  const octave = parsed.oct ?? 4;
  return octave * 7 + parsed.step;
}

function staffY(note: string, staff: StaffName) {
  const bottomY = staffTop[staff] + lineSpacing * 4;
  const stepsFromBottom = diatonicIndex(note) - bottomLineIndex[staff];
  return bottomY - stepsFromBottom * (lineSpacing / 2);
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
</script>
