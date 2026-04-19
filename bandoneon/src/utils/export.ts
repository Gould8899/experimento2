type ExportFilenameOptions = {
    instrument: string;
    side: string;
    direction: string;
    tonic: string | null;
    chordType: string | null;
    scaleType: string | null;
    isModified: boolean;
};

function slugifyToken(value: string) {
    return value.replace(/:/g, '-').replace(/#/g, 's').replace(/\s+/g, '-');
}

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
    if (scaleType) segments.push(slifyScaleType(scaleType));
    if (isModified) segments.push('custom');

    return `${segments.join('-')}.png`;
}

function slifyScaleType(scaleType: string) {
    return slugifyToken(scaleType);
}
