import { onMounted, onUnmounted } from 'vue';
import { chordUiEnabled } from '../data/index';
import { useStore } from '../stores/main';

// Global keyboard shortcuts shared by the main keyboard view and the training game.
//
// Shortcut map
// ────────────────────────────────────────────────────────
//  l / L   →  left side, open / close bellows
//  r / R   →  right side, open / close bellows
//  c–b     →  set tonic (lowercase = natural: C D E F G A B)
//  C D F G A  →  set tonic to the sharp enharmonic (C# D# F# G# A#)
//             (E# and B# are omitted — they are enharmonic to F and C)
//  M / m / 7  →  set chord type (only active when chordUiEnabled is true)
//  Escape  →  clear the search selection, or call onEscape if provided
// ────────────────────────────────────────────────────────
export function useKeyboard(options?: { onEscape?: () => void }) {
  const store = useStore();

  function setSideAndDirection(
    side: 'left' | 'right',
    direction: 'open' | 'close',
  ) {
    store.$patch({ side, direction });
  }

  function listener(event: KeyboardEvent) {
    if (event.repeat) return;

    const { key } = event;

    // Side and direction
    if (key === 'l') return setSideAndDirection('left', 'open');
    if (key === 'L') return setSideAndDirection('left', 'close');
    if (key === 'r') return setSideAndDirection('right', 'open');
    if (key === 'R') return setSideAndDirection('right', 'close');

    // Tonic
    if (['c', 'd', 'e', 'f', 'g', 'a', 'b'].includes(key)) {
      return store.setTonic(key.toUpperCase());
    }
    if (['C', 'D', 'F', 'G', 'A'].includes(key)) {
      return store.setTonic(key + '#');
    }

    if (chordUiEnabled) {
      if (key === 'M') return store.setChordType('M');
      if (key === 'm') return store.setChordType('m');
      if (key === '7') return store.setChordType('7');
    }

    // Escape
    if (key === 'Escape') {
      if (options?.onEscape) {
        options.onEscape();
        return;
      }

      store.resetSearch();
      return;
    }
  }

  onMounted(() => document.addEventListener('keydown', listener));
  onUnmounted(() => document.removeEventListener('keydown', listener));
}
