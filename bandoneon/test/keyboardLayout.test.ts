import { describe, expect, it } from 'vitest';
import {
  calculateFormulaPositions,
  getFormulaColumnGap,
} from '../src/utils/keyboardLayout';

describe('keyboardLayout helpers', () => {
  it('keeps the classic gap for nine columns and compresses smoothly afterwards', () => {
    expect(getFormulaColumnGap(1)).toBe(79);
    expect(getFormulaColumnGap(9)).toBe(79);
    expect(getFormulaColumnGap(10)).toBe(70);
    expect(getFormulaColumnGap(14)).toBe(65);
  });

  it('creates positions only for visible notes', () => {
    const positions = calculateFormulaPositions([['C4', '', 'E4'], ['G4']]);

    expect(positions).toHaveLength(3);
    expect(positions.map(([, , note]) => note)).toEqual(['C4', 'E4', 'G4']);
  });

  it('centers narrow layouts with a positive horizontal offset', () => {
    const positions = calculateFormulaPositions([
      ['C4', 'D4', 'E4'],
      ['F4', 'G4', 'A4'],
    ]);

    expect(positions[0][0]).toBeGreaterThan(200);
    expect(positions[1][0] - positions[0][0]).toBe(79);
  });
});
