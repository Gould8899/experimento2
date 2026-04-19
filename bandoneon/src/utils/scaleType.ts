import { Note, Scale } from 'tonal';
import { resolveScaleTonality } from './tonality';

const specialScaleNoteNames = {
  'white-keys': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'black-keys': ['C#', 'D#', 'F#', 'G#', 'A#'],
} as const;

export type SpecialScaleType = keyof typeof specialScaleNoteNames;

export function isSpecialScaleType(
  scaleType: string | null,
): scaleType is SpecialScaleType {
  return Boolean(scaleType && scaleType in specialScaleNoteNames);
}

export function scaleTypeUsesTonic(scaleType: string | null) {
  return Boolean(scaleType) && !isSpecialScaleType(scaleType);
}

export function getSpecialScaleNoteNames(scaleType: SpecialScaleType) {
  return [...specialScaleNoteNames[scaleType]];
}

export function getScalePitchClasses(
  tonic: string | null,
  scaleType: string | null,
) {
  if (!scaleType) return new Set<number>();

  if (isSpecialScaleType(scaleType)) {
    return new Set(
      getSpecialScaleNoteNames(scaleType)
        .map((note) => Note.get(note).chroma)
        .filter((chroma): chroma is number => typeof chroma === 'number'),
    );
  }

  if (!tonic) return new Set<number>();

  const scale = Scale.get(scaleType);
  if (scale.empty) return new Set<number>();

  return new Set(
    scale.intervals
      .map((interval) => Note.get(Note.transpose(`${tonic}4`, interval)).chroma)
      .filter((chroma): chroma is number => typeof chroma === 'number'),
  );
}

export function getScaleStaffNotes(
  tonic: string | null,
  scaleType: string | null,
  preferFlats = false,
) {
  if (!scaleType) return [] as string[];

  if (isSpecialScaleType(scaleType)) {
    return getSpecialScaleNoteNames(scaleType).map((note) => `${note}4`);
  }

  if (!tonic) return [] as string[];

  const resolvedTonality = resolveScaleTonality(tonic, scaleType, preferFlats);
  if (resolvedTonality) {
    return [
      ...resolvedTonality.scale.map((note) => `${note}4`),
      `${resolvedTonality.tonic}5`,
    ];
  }

  const scale = Scale.get(scaleType);
  if (scale.empty) return [] as string[];

  return [
    ...scale.intervals.map((interval) =>
      Note.simplify(Note.transpose(`${tonic}4`, interval)),
    ),
    Note.simplify(`${tonic}5`),
  ];
}
