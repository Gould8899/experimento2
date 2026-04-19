import { describe, expect, it } from 'vitest';
import {
  applyPaintGestureStep,
  resolvePaintGestureMode,
  selectionsEqual,
} from '../src/utils/paintGesture';

describe('paintGesture helpers', () => {
  it('adds notes while moving forward', () => {
    const baseSelection = {};
    const mode = resolvePaintGestureMode('C4', baseSelection);
    const first = applyPaintGestureStep(
      baseSelection,
      mode,
      { selection: {}, trace: [] },
      'C4',
    );
    const second = applyPaintGestureStep(baseSelection, mode, first, 'D4');

    expect(second.trace).toEqual(['C4', 'D4']);
    expect(second.selection).toEqual({ C4: true, D4: true });
  });

  it('removes trailing notes when the pointer goes back', () => {
    const baseSelection = {};
    const mode = resolvePaintGestureMode('C4', baseSelection);
    const state = applyPaintGestureStep(
      baseSelection,
      mode,
      applyPaintGestureStep(
        baseSelection,
        mode,
        applyPaintGestureStep(
          baseSelection,
          mode,
          { selection: {}, trace: [] },
          'C4',
        ),
        'D4',
      ),
      'E4',
    );

    const rewound = applyPaintGestureStep(baseSelection, mode, state, 'D4');

    expect(rewound.trace).toEqual(['C4', 'D4']);
    expect(rewound.selection).toEqual({ C4: true, D4: true });
  });

  it('erases notes when the gesture starts on an active note', () => {
    const baseSelection = { C4: true, D4: true, E4: true };
    const mode = resolvePaintGestureMode('D4', baseSelection);

    const state = applyPaintGestureStep(
      baseSelection,
      mode,
      { selection: { ...baseSelection }, trace: [] },
      'D4',
    );

    const next = applyPaintGestureStep(baseSelection, mode, state, 'E4');

    expect(mode).toBe('erase');
    expect(next.selection).toEqual({ C4: true });
  });

  it('restores only the trailing notes when erasing and moving back', () => {
    const baseSelection = { C4: true, D4: true, E4: true };
    const mode = resolvePaintGestureMode('D4', baseSelection);
    const state = applyPaintGestureStep(
      baseSelection,
      mode,
      { selection: { ...baseSelection }, trace: [] },
      'D4',
    );
    const erased = applyPaintGestureStep(baseSelection, mode, state, 'E4');
    const rewound = applyPaintGestureStep(baseSelection, mode, erased, 'D4');

    expect(rewound.selection).toEqual({ C4: true });
  });

  it('keeps erased notes cleared when crossing an older note again', () => {
    const baseSelection = { C4: true, D4: true, E4: true, F4: true };
    const mode = resolvePaintGestureMode('D4', baseSelection);
    const initial = { selection: { ...baseSelection }, trace: [] };

    const state = applyPaintGestureStep(
      baseSelection,
      mode,
      applyPaintGestureStep(
        baseSelection,
        mode,
        applyPaintGestureStep(baseSelection, mode, initial, 'D4'),
        'E4',
      ),
      'F4',
    );

    const crossed = applyPaintGestureStep(baseSelection, mode, state, 'E4');

    expect(crossed).toBe(state);
    expect(crossed.selection).toEqual({ C4: true });
  });

  it('rewinds to an older note when the sweep goes back across the trace', () => {
    const baseSelection = {};
    const mode = resolvePaintGestureMode('C4', baseSelection);
    const state = applyPaintGestureStep(
      baseSelection,
      mode,
      applyPaintGestureStep(
        baseSelection,
        mode,
        applyPaintGestureStep(
          baseSelection,
          mode,
          { selection: {}, trace: [] },
          'C4',
        ),
        'D4',
      ),
      'E4',
    );

    const crossed = applyPaintGestureStep(baseSelection, mode, state, 'C4');

    expect(crossed.trace).toEqual(['C4']);
    expect(crossed.selection).toEqual({ C4: true });
  });

  it('compares selections by active note keys', () => {
    expect(selectionsEqual({ C4: true }, { C4: true })).toBe(true);
    expect(selectionsEqual({ C4: true }, { D4: true })).toBe(false);
  });
});
