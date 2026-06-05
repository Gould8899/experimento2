import { Note } from 'tonal';

export type StaffName = 'treble' | 'bass';

export const STAFF_LAYOUT = {
  lineSpacing: 27,
  staffTop: {
    treble: 98,
    bass: 318,
  },
  bottomLineIndex: {
    treble: diatonicIndex('E4'),
    bass: diatonicIndex('G2'),
  },
  noteArea: {
    left: 36,
    right: 1284,
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
  const edgePadding = STAFF_LAYOUT.lineSpacing * 1.1;
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

/** Grand-staff placement by pitch (middle C and above → treble). */
export function staffForNoteRegister(note: string): StaffName {
  const midi = Note.midi(note) ?? 60;
  return midi >= 60 ? 'treble' : 'bass';
}

/** Which clef staff was clicked from vertical position. */
export function resolveStaffFromY(
  y: number,
  treblePlayable: string[] = [],
  bassPlayable: string[] = [],
  preferredStaff?: StaffName,
): StaffName | null {
  const trebleBounds = staffInteractionBounds('treble', treblePlayable);
  const bassBounds = staffInteractionBounds('bass', bassPlayable);
  const inTreble = y >= trebleBounds.top && y <= trebleBounds.bottom;
  const inBass = y >= bassBounds.top && y <= bassBounds.bottom;

  if (inTreble && !inBass) return 'treble';
  if (inBass && !inTreble) return 'bass';
  if (!inTreble && !inBass) return null;

  const midX = (STAFF_LAYOUT.noteArea.left + STAFF_LAYOUT.noteArea.right) / 2;
  const trebleNote = matchStaffPointerNote({
    x: midX,
    y,
    staff: 'treble',
    playableNotes: treblePlayable,
  });
  const bassNote = matchStaffPointerNote({
    x: midX,
    y,
    staff: 'bass',
    playableNotes: bassPlayable,
  });

  if (trebleNote && !bassNote) return 'treble';
  if (bassNote && !trebleNote) return 'bass';

  if (trebleNote && bassNote) {
    const trebleDistance = Math.abs(staffY(trebleNote, 'treble') - y);
    const bassDistance = Math.abs(staffY(bassNote, 'bass') - y);
    if (trebleDistance < bassDistance) return 'treble';
    if (bassDistance < trebleDistance) return 'bass';
    if (preferredStaff) return preferredStaff;
    return 'treble';
  }

  if (preferredStaff === 'bass' && inBass) return 'bass';
  if (preferredStaff === 'treble' && inTreble) return 'treble';

  const trebleCenter =
    STAFF_LAYOUT.staffTop.treble + (STAFF_LAYOUT.lineSpacing * 4) / 2;
  const bassCenter =
    STAFF_LAYOUT.staffTop.bass + (STAFF_LAYOUT.lineSpacing * 4) / 2;

  return Math.abs(y - bassCenter) <= Math.abs(y - trebleCenter)
    ? 'bass'
    : 'treble';
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

export type StaffDisplayNoteHit = {
  note: string;
  x: number;
  y: number;
  staff: StaffName;
};

const NOTEHEAD_HIT_RX = 26;
const NOTEHEAD_HIT_RY = 20;

/** Returns the topmost displayed note whose head contains the point. */
export function hitStaffDisplayNote(
  x: number,
  y: number,
  staff: StaffName | null,
  notes: StaffDisplayNoteHit[],
): StaffDisplayNoteHit | null {
  if (!staff) return null;

  for (let index = notes.length - 1; index >= 0; index -= 1) {
    const item = notes[index];
    if (item.staff !== staff) continue;

    const dx = x - item.x;
    const dy = y - item.y;
    const normalized =
      (dx * dx) / (NOTEHEAD_HIT_RX * NOTEHEAD_HIT_RX) +
      (dy * dy) / (NOTEHEAD_HIT_RY * NOTEHEAD_HIT_RY);

    if (normalized <= 1) {
      return item;
    }
  }

  return null;
}
