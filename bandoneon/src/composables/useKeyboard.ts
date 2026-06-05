import { onMounted, onUnmounted, ref } from 'vue';
import {
  ARPEGGIO_SHORTCUT_KEYS,
  PIANO_LAYOUT_KEYS,
  SCALE_SHORTCUT_KEYS,
  type PianoLayoutKey,
} from '../constants/keyboardShortcuts';
import { chordUiEnabled } from '../data/index';
import { useStore } from '../stores/main';
import {
  isPianoLayoutKey,
  normalizePianoLayoutKey,
  resolvePianoLayoutNote,
} from '../utils/keyboardNote';

export type NoteInteractionOptions = {
  additive?: boolean;
};

// Global keyboard shortcuts for the bandoneon workspace.
export type KeyboardPlayHandlers = {
  onNoteDown: (note: string, options?: NoteInteractionOptions) => void;
  onNoteUp: (note: string) => void;
  noteCandidates: () => string[];
  getBaseOctave: () => number;
  onOctaveChange?: (delta: number) => void;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function useKeyboard(options?: {
  onEscape?: () => void;
  onOpenSettings?: () => void;
  play?: KeyboardPlayHandlers;
}) {
  const store = useStore();
  const heldPianoKeys = ref(new Set<PianoLayoutKey>());
  const heldPianoNotes = ref(new Map<PianoLayoutKey, string>());

  function releaseHeldPianoKeys() {
    if (!options?.play || heldPianoKeys.value.size === 0) return;

    for (const key of [...heldPianoKeys.value]) {
      handlePianoKeyUp(key);
    }
  }

  function toggleScale(value: string) {
    store.setScaleType(store.scaleType === value ? null : value);
  }

  function toggleArpeggio(value: string) {
    store.setChordType(store.chordType === value ? null : value);
  }

  function handlePianoKeyDown(
    key: PianoLayoutKey,
    interaction: NoteInteractionOptions,
  ) {
    if (!options?.play || heldPianoKeys.value.has(key)) return;

    const note = resolvePianoLayoutNote(
      key,
      options.play.noteCandidates(),
      options.play.getBaseOctave(),
    );
    if (!note) return;

    heldPianoKeys.value.add(key);
    heldPianoNotes.value.set(key, note);
    options.play.onNoteDown(note, interaction);
  }

  function handlePianoKeyUp(key: PianoLayoutKey) {
    if (!options?.play || !heldPianoKeys.value.has(key)) return;

    const note = heldPianoNotes.value.get(key);
    heldPianoKeys.value.delete(key);
    heldPianoNotes.value.delete(key);

    if (note) {
      options.play.onNoteUp(note);
    }
  }

  function listener(event: KeyboardEvent) {
    if (isEditableTarget(event.target)) return;

    const { key } = event;

    if (options?.onOpenSettings && key === '?') {
      if (event.type === 'keydown' && !event.repeat) {
        event.preventDefault();
        options.onOpenSettings();
      }
      return;
    }

    if (isPianoLayoutKey(key)) {
      const pianoKey = normalizePianoLayoutKey(key);
      if (!pianoKey) return;

      const interaction = {
        additive: event.ctrlKey || event.metaKey,
      };

      if (event.type === 'keydown') {
        if (event.repeat) return;
        event.preventDefault();
        handlePianoKeyDown(pianoKey, interaction);
      } else if (event.type === 'keyup') {
        event.preventDefault();
        handlePianoKeyUp(pianoKey);
      }
      return;
    }

    if (event.type === 'keydown' && !event.repeat && options?.play?.onOctaveChange) {
      if (key === '{' || key === '}') {
        event.preventDefault();
        releaseHeldPianoKeys();
        options.play.onOctaveChange(key === '{' ? -1 : 1);
        return;
      }
    }

    if (event.type !== 'keydown' || event.repeat) return;

    if (
      event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      const scaleShortcut = SCALE_SHORTCUT_KEYS.find(
        (item) => item.code === event.code,
      );
      if (scaleShortcut) {
        event.preventDefault();
        toggleScale(scaleShortcut.value);
        return;
      }
    }

    if (key === 'ArrowLeft') {
      event.preventDefault();
      store.$patch({ side: 'left' });
      return;
    }

    if (key === 'ArrowRight') {
      event.preventDefault();
      store.$patch({ side: 'right' });
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      store.$patch({ direction: 'open' });
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      store.$patch({ direction: 'close' });
      return;
    }

    const arpeggioShortcut = ARPEGGIO_SHORTCUT_KEYS.find(
      (item) => item.key === key,
    );
    if (arpeggioShortcut) {
      event.preventDefault();
      toggleArpeggio(arpeggioShortcut.value);
      return;
    }

    if (key === '|') {
      const dimArpeggio = ARPEGGIO_SHORTCUT_KEYS.find(
        (item) => item.key === '\\',
      );
      if (dimArpeggio) {
        event.preventDefault();
        toggleArpeggio(dimArpeggio.value);
        return;
      }
    }

    if (chordUiEnabled) {
      if (key === 'M') return store.setChordType('M');
      if (key === 'm') return store.setChordType('m');
      if (key === '7') return store.setChordType('7');
    }

    if (key === 'Escape') {
      if (options?.onEscape) {
        event.preventDefault();
        options.onEscape();
        return;
      }

      event.preventDefault();
      store.resetSearch();
    }
  }

  function handleWindowBlur() {
    releaseHeldPianoKeys();
  }

  onMounted(() => {
    document.addEventListener('keydown', listener);
    document.addEventListener('keyup', listener);
    window.addEventListener('blur', handleWindowBlur);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', listener);
    document.removeEventListener('keyup', listener);
    window.removeEventListener('blur', handleWindowBlur);
  });
}

export { PIANO_LAYOUT_KEYS };
