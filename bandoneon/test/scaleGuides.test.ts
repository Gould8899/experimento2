import { describe, expect, it } from 'vitest';
import {
  buildContinuousScaleGuidePath,
  guideColorForOctave,
  groupNotesByOctave,
} from '../src/utils/scaleGuides';

describe('scaleGuides', () => {
  it('assigns the same palette used by keyed octaves', () => {
    expect(guideColorForOctave(3)).toBe('#ef4444');
    expect(guideColorForOctave(4)).toBe('#22c55e');
    expect(guideColorForOctave(5)).toBe('#eab308');
  });

  it('groups notes by octave', () => {
    const groups = groupNotesByOctave(['C3', 'E3', 'C4', 'G4']);
    expect(groups.get(3)).toEqual(['C3', 'E3']);
    expect(groups.get(4)).toEqual(['C4', 'G4']);
  });

  it('builds one continuous path across octaves', () => {
    const guide = buildContinuousScaleGuidePath(
      ['C3', 'E3', 'C4'],
      (notes) => (notes.length > 0 ? `M${notes.join('-')}` : null),
    );

    expect(guide?.octave).toBe(3);
    expect(guide?.d).toBe('MC3-E3-C4');
    expect(guide?.stroke).toBe(guideColorForOctave(3));
  });
});
