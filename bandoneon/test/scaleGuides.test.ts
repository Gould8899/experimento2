import { describe, expect, it } from 'vitest';
import {
  buildColoredScaleGuidePaths,
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

  it('builds one colored path per octave', () => {
    const guides = buildColoredScaleGuidePaths(
      ['C3', 'E3', 'C4'],
      (notes) => (notes.length > 0 ? `M${notes.join('-')}` : null),
    );

    expect(guides).toHaveLength(2);
    expect(guides[0]?.octave).toBe(3);
    expect(guides[1]?.octave).toBe(4);
    expect(guides[0]?.stroke).not.toBe(guides[1]?.stroke);
  });
});
