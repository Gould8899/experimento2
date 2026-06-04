import { Note } from 'tonal';

export type StaffName = 'treble' | 'bass';

export const STAFF_LAYOUT = {
  lineSpacing: 27,
  staffTop: {
    treble: 106,
    bass: 342,
  },
  bottomLineIndex: {
    treble: diatonicIndex('E4'),
    bass: diatonicIndex('G2'),
  },
  noteArea: {
    left: 44,
    right: 1084,
  },
} as const;

/** Half the distance between adjacent staff positions (line or space). */
export const STAFF_STEP_HEIGHT = STAFF_LAYOUT.lineSpacing / 2;

function diatonicIndex(note: string) {
  const parsed = Note.get(note);
  const octave = parsed.oct ?? 4;
  return octave * 7 + parsed.step;
}

function indexToNote(index: number) {
  const octave = Math.floor(index / 7);
  const step = index % 7;
  return `${['C', 'D', 'E', 'F', 'G', 'A', 'B'][step]}${octave}`;
}

export function staffY(note: string, staff: StaffName) {
  const bottomY =
    STAFF_LAYOUT.staffTop[staff] + STAFF_LAYOUT.lineSpacing * 4;
  const stepsFromBottom =
    diatonicIndex(note) - STAFF_LAYOUT.bottomLineIndex[staff];
  return bottomY - stepsFromBottom * STAFF_STEP_HEIGHT;
}

export function resolveStaffPitchFromY(y: number, staff: StaffName) {
  const bottomY =
    STAFF_LAYOUT.staffTop[staff] + STAFF_LAYOUT.lineSpacing * 4;
  const stepsFromBottom = Math.round((bottomY - y) / STAFF_STEP_HEIGHT);
  return indexToNote(STAFF_LAYOUT.bottomLineIndex[staff] + stepsFromBottom);
}

const defaultStaffVerticalBounds = (staff: StaffName) => {
  const edgePadding = STAFF_LAYOUT.lineSpacing * 0.75;
  return {
    top: STAFF_LAYOUT.staffTop[staff] - edgePadding,
    bottom:
      STAFF_LAYOUT.staffTop[staff] + STAFF_LAYOUT.lineSpacing * 4 + edgePadding,
  };
};

/** Vertical range for pointer input, extended to cover ledger-line notes. */
export function staffInteractionBounds(
  staff: StaffName,
  playableNotes: string[] = [],
) {
  const defaults = defaultStaffVerticalBounds(staff);

  if (playableNotes.length === 0) {
    return defaults;
  }

  let minY = Infinity;
  let maxY = -Infinity;

  for (const note of playableNotes) {
    const y = staffY(note, staff);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const ledgerPadding = STAFF_LAYOUT.lineSpacing * 1.25;

  return {
    top: Math.min(defaults.top, minY - ledgerPadding),
    bottom: Math.max(defaults.bottom, maxY + ledgerPadding),
  };
}

export function staffForHand(hand: 'left' | 'right'): StaffName {
  return hand === 'right' ? 'treble' : 'bass';
}

export function handForStaff(staff: StaffName): 'left' | 'right' {
  return staff === 'treble' ? 'right' : 'left';
}

/** Which clef staff was clicked from vertical position. */
export function resolveStaffFromY(
  y: number,
  treblePlayable: string[] = [],
  bassPlayable: string[] = [],
): StaffName | null {
  const trebleBounds = staffInteractionBounds('treble', treblePlayable);
  const bassBounds = staffInteractionBounds('bass', bassPlayable);
  const inTreble = y >= trebleBounds.top && y <= trebleBounds.bottom;
  const inBass = y >= bassBounds.top && y <= bassBounds.bottom;

  if (inTreble && !inBass) return 'treble';
  if (inBass && !inTreble) return 'bass';
  if (!inTreble && !inBass) return null;

  const trebleCenter =
    STAFF_LAYOUT.staffTop.treble + (STAFF_LAYOUT.lineSpacing * 4) / 2;
  const bassCenter =
    STAFF_LAYOUT.staffTop.bass + (STAFF_LAYOUT.lineSpacing * 4) / 2;

  return Math.abs(y - trebleCenter) <= Math.abs(y - bassCenter)
    ? 'treble'
    : 'bass';
}

export function isPointInStaffArea(
  x: number,
  y: number,
  staff: StaffName,
  playableNotes: string[] = [],
) {
  if (
    x < STAFF_LAYOUT.noteArea.left - 24 ||
    x > STAFF_LAYOUT.noteArea.right + 24
  ) {
    return false;
  }

  const { top, bottom } = staffInteractionBounds(staff, playableNotes);
  return y >= top && y <= bottom;
}

/** Pick the playable note whose staff position is closest to the click. */
export function matchStaffPointerNote({
  x,
  y,
  staff,
  playableNotes,
}: {
  x: number;
  y: number;
  staff: StaffName;
  playableNotes: string[];
}) {
  if (!isPointInStaffArea(x, y, staff, playableNotes)) {
    return null;
  }

  if (playableNotes.length === 0) {
    return null;
  }

  let bestNote: string | null = null;
  let bestDistance = Infinity;

  for (const note of playableNotes) {
    const distance = Math.abs(staffY(note, staff) - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestNote = note;
    }
  }

  return bestDistance <= STAFF_STEP_HEIGHT * 0.92 ? bestNote : null;
}
