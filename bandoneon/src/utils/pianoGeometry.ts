export type PianoPointerKey = {
  note: string;
  left: number;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function resolvePointedPianoNote({
  xRatio,
  yRatio,
  whiteKeys,
  blackKeys,
  blackKeyHeightRatio = 0.62,
  clampToBounds = true,
}: {
  xRatio: number;
  yRatio: number;
  whiteKeys: PianoPointerKey[];
  blackKeys: PianoPointerKey[];
  blackKeyHeightRatio?: number;
  clampToBounds?: boolean;
}) {
  if (whiteKeys.length === 0) return null;

  if (
    !clampToBounds &&
    (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1)
  ) {
    return null;
  }

  const clampedX = clamp(xRatio, 0, 0.999999);
  const clampedY = clamp(yRatio, 0, 1);

  if (clampedY <= blackKeyHeightRatio) {
    const blackKey = [...blackKeys]
      .reverse()
      .find((key) => clampedX >= key.left && clampedX <= key.left + key.width);

    if (blackKey) {
      return blackKey.note;
    }
  }

  const whiteKeyWidth = 1 / whiteKeys.length;
  const whiteIndex = clamp(
    Math.floor(clampedX / whiteKeyWidth),
    0,
    whiteKeys.length - 1,
  );

  return whiteKeys[whiteIndex]?.note ?? null;
}
