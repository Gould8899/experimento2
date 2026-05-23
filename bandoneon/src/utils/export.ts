// Utilities for building deterministic, human-readable export filenames from
// the current keyboard state (instrument, side, direction, tonic, chord/scale type).

type ExportFilenameOptions = {
  instrument: string;
  side: string;
  direction: string;
  tonic: string | null;
  chordType: string | null;
  scaleType: string | null;
  isModified: boolean;
};

// Converts a raw musical token into a URL/filename-safe segment.
// Colons become dashes (e.g. "arp:M" → "arp-M"), sharps become "s" (C# → Cs),
// and spaces become dashes.
function slugifyToken(value: string) {
  return value.replace(/:/g, '-').replace(/#/g, 's').replace(/\s+/g, '-');
}

// Builds a PNG filename that encodes every relevant piece of state so that
// exported images are self-describing and won't overwrite each other.
export function buildKeyboardExportFilename({
  instrument,
  side,
  direction,
  tonic,
  chordType,
  scaleType,
  isModified,
}: ExportFilenameOptions) {
  const segments = ['bandoneon', instrument, side, direction];

  if (tonic) segments.push(slugifyToken(tonic));
  if (chordType) segments.push(slugifyToken(chordType));
  if (scaleType) segments.push(slugifyToken(scaleType));
  if (isModified) segments.push('custom');

  return `${segments.join('-')}.png`;
}
