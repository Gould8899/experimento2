import { Key, Note } from 'tonal';

export type TonalityMode = 'major' | 'minor';

export type ResolvedTonality = {
  tonic: string;
  alteration: number;
  keySignature: string;
  scale: readonly string[];
};

const tonalChordModes: Partial<Record<string, TonalityMode>> = {
  M: 'major',
  m: 'minor',
  'arp:M': 'major',
  'arp:m': 'minor',
  '7': 'major',
  M7: 'major',
  m7: 'minor',
};

const tonalChordIntervals: Partial<Record<string, string[]>> = {
  M: ['1P', '3M', '5P'],
  m: ['1P', '3m', '5P'],
  'arp:M': ['1P', '3M', '5P'],
  'arp:m': ['1P', '3m', '5P'],
  '7': ['1P', '3M', '5P', '7m'],
  M7: ['1P', '3M', '5P', '7M'],
  m7: ['1P', '3m', '5P', '7m'],
};

function getTonalityCandidate(tonic: string, mode: TonalityMode) {
  if (mode === 'major') {
    const key = Key.majorKey(tonic);
    return {
      tonic: key.tonic,
      alteration: key.alteration,
      keySignature: key.keySignature,
      scale: key.scale,
    } satisfies ResolvedTonality;
  }

  const key = Key.minorKey(tonic);
  return {
    tonic: key.tonic,
    alteration: key.alteration,
    keySignature: key.keySignature,
    scale: key.natural.scale,
  } satisfies ResolvedTonality;
}

function compareTonalityCandidates(
  left: ResolvedTonality,
  right: ResolvedTonality,
  preferFlats: boolean,
) {
  const leftOverLimit = Math.abs(left.alteration) > 7;
  const rightOverLimit = Math.abs(right.alteration) > 7;

  if (leftOverLimit !== rightOverLimit) {
    return leftOverLimit ? 1 : -1;
  }

  const leftComplexity = Math.abs(left.alteration);
  const rightComplexity = Math.abs(right.alteration);

  if (leftComplexity !== rightComplexity) {
    return leftComplexity - rightComplexity;
  }

  if (left.alteration !== right.alteration) {
    if (preferFlats) {
      return left.alteration - right.alteration;
    }

    return right.alteration - left.alteration;
  }

  return 0;
}

function isWithinSignatureLimit(candidate: ResolvedTonality) {
  return Math.abs(candidate.alteration) <= 7;
}

export function resolveTonality(
  tonic: string | null,
  mode: TonalityMode,
  preferFlats = false,
) {
  if (!tonic) return null;

  const resolvedTonic = getTonalityCandidate(tonic, mode);
  const enharmonicTonicName = Note.enharmonic(tonic);

  if (!enharmonicTonicName || enharmonicTonicName === tonic) {
    return resolvedTonic;
  }

  const enharmonicTonic = getTonalityCandidate(enharmonicTonicName, mode);
  const tonicIsSharp = tonic.includes('#');
  const tonicIsFlat = tonic.includes('b');
  const resolvedWithinLimit = isWithinSignatureLimit(resolvedTonic);
  const enharmonicWithinLimit = isWithinSignatureLimit(enharmonicTonic);

  if (resolvedWithinLimit && !enharmonicWithinLimit) {
    return resolvedTonic;
  }

  if (!resolvedWithinLimit && enharmonicWithinLimit) {
    return enharmonicTonic;
  }

  if (preferFlats && tonicIsSharp && enharmonicWithinLimit) {
    return enharmonicTonic;
  }

  if (!preferFlats && tonicIsFlat && enharmonicWithinLimit) {
    return enharmonicTonic;
  }

  if (resolvedWithinLimit) {
    return resolvedTonic;
  }

  return compareTonalityCandidates(
    enharmonicTonic,
    resolvedTonic,
    preferFlats,
  ) < 0
    ? enharmonicTonic
    : resolvedTonic;
}

export function resolveScaleTonality(
  tonic: string | null,
  scaleType: string | null,
  preferFlats = false,
) {
  if (scaleType !== 'major' && scaleType !== 'minor') {
    return null;
  }

  return resolveTonality(tonic, scaleType, preferFlats);
}

export function resolveSelectionTonality(
  tonic: string | null,
  scaleType: string | null,
  chordType: string | null,
  preferFlats = false,
) {
  const scaleTonality = resolveScaleTonality(tonic, scaleType, preferFlats);
  if (scaleTonality) {
    return scaleTonality;
  }

  const mode = chordType ? tonalChordModes[chordType] : null;
  if (!mode) {
    return null;
  }

  return resolveTonality(tonic, mode, preferFlats);
}

export function getChordStaffNotes(
  tonic: string | null,
  chordType: string | null,
  preferFlats = false,
) {
  if (!tonic || !chordType) {
    return [] as string[];
  }

  const intervals = tonalChordIntervals[chordType];
  const mode = tonalChordModes[chordType];

  if (!intervals || !mode) {
    return [] as string[];
  }

  const tonality = resolveTonality(tonic, mode, preferFlats);
  if (!tonality) {
    return [] as string[];
  }

  return intervals.map((interval) =>
    Note.transpose(`${tonality.tonic}4`, interval),
  );
}
