import type { KeyboardSide, NoteMatrix } from '../data/index';
import rheinische142Layout from '../data/layouts/rheinische142';

export type KeyPosition = [number, number, string];

const TARGET_FORMULA_SPAN = 632;
const DEFAULT_COLUMN_GAP = 79;
const MIN_COLUMN_GAP = 65;
const BASE_COLUMN_COUNT = 9;
const BASE_ROW_COUNT = 6;
const COLUMN_ALIGNMENT_OFFSET = 39;
const ROW_ALIGNMENT_OFFSET = 32;

function countVisibleRows(keys: NoteMatrix) {
    return keys.reduce((total, row) => total + (row.length > 0 ? 1 : 0), 0);
}

export function getFormulaColumnGap(columnCount: number) {
    if (columnCount <= 1) return DEFAULT_COLUMN_GAP;

    const fittedGap = TARGET_FORMULA_SPAN / (columnCount - 1);
    return Math.max(
        MIN_COLUMN_GAP,
        Math.min(DEFAULT_COLUMN_GAP, Math.round(fittedGap)),
    );
}

export function calculateFormulaPositions(keys: NoteMatrix): KeyPosition[] {
    if (keys.length === 0) return [];

    const positions: KeyPosition[] = [];
    const columnCount = Math.max(...keys.map((row) => row.length), 0);
    const visibleRowCount = countVisibleRows(keys);
    const offsetX =
        columnCount < BASE_COLUMN_COUNT
            ? COLUMN_ALIGNMENT_OFFSET * (BASE_COLUMN_COUNT - columnCount)
            : 0;
    const offsetY =
        visibleRowCount < BASE_ROW_COUNT
            ? -ROW_ALIGNMENT_OFFSET * (BASE_ROW_COUNT - visibleRowCount)
            : 0;
    const columnGap = getFormulaColumnGap(columnCount);

    for (let rowIndex = 0; rowIndex < keys.length; rowIndex++) {
        for (
            let columnIndex = 0;
            columnIndex < keys[rowIndex].length;
            columnIndex++
        ) {
            const tonal = keys[rowIndex][columnIndex];
            if (!tonal) continue;

            const x = offsetX + columnIndex * columnGap + 40 - (rowIndex % 2) * 40;
            const y =
                offsetY +
                rowIndex * 60 +
                (rowIndex / 2 + 1) * 15 * (1 - Math.sin(((x / 320) * Math.PI) / 2));
            positions.push([x, y, tonal]);
        }
    }

    return positions;
}

export function calculateExplicitPositions(
    keys: NoteMatrix,
    side: KeyboardSide,
): KeyPosition[] | null {
    const layout = rheinische142Layout[side];
    const positions: KeyPosition[] = [];
    let index = 0;

    for (const row of keys) {
        for (const tonal of row) {
            if (!tonal) continue;

            const coordinates = layout[index];
            if (!coordinates) return null;

            positions.push([coordinates[0], coordinates[1], tonal]);
            index++;
        }
    }

    return index === layout.length ? positions : null;
}
