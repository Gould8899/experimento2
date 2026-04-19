export type NoteSelection = Record<string, boolean>;
export type PaintGestureMode = 'paint' | 'erase';

type PaintGestureState = {
  selection: NoteSelection;
  trace: string[];
};

export function cloneSelection(selection: NoteSelection) {
  return { ...selection };
}

export function selectionsEqual(left: NoteSelection, right: NoteSelection) {
  const leftKeys = Object.keys(left)
    .filter((key) => left[key])
    .sort();
  const rightKeys = Object.keys(right)
    .filter((key) => right[key])
    .sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key, index) => key === rightKeys[index]);
}

export function resolvePaintGestureMode(
  note: string,
  selection: NoteSelection,
): PaintGestureMode {
  return selection[note] ? 'erase' : 'paint';
}

export function applyPaintGestureStep(
  baseSelection: NoteSelection,
  mode: PaintGestureMode,
  state: PaintGestureState,
  note: string,
): PaintGestureState {
  if (state.trace.at(-1) === note) return state;

  const existingIndex = state.trace.lastIndexOf(note);

  if (existingIndex !== -1) {
    if (mode === 'erase') {
      return state;
    }

    const trimmedTrace = state.trace.slice(0, existingIndex + 1);
    const nextSelection = cloneSelection(state.selection);

    for (const removedNote of state.trace.slice(existingIndex + 1)) {
      if (baseSelection[removedNote]) {
        nextSelection[removedNote] = true;
      } else {
        delete nextSelection[removedNote];
      }
    }

    return {
      selection: nextSelection,
      trace: trimmedTrace,
    };
  }

  const nextSelection = cloneSelection(state.selection);

  if (mode === 'paint') {
    nextSelection[note] = true;
  } else {
    delete nextSelection[note];
  }

  return {
    selection: nextSelection,
    trace: [...state.trace, note],
  };
}
