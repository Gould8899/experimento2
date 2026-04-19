import { describe, expect, it } from 'vitest';
import { getScaleStaffNotes } from '../src/utils/scaleType';
import {
    getChordStaffNotes,
    resolveScaleTonality,
    resolveSelectionTonality,
} from '../src/utils/tonality';

describe('tonality helpers', () => {
    it('prefers Eb major over the pathological D# major spelling', () => {
        const tonality = resolveScaleTonality('D#', 'major', true);

        expect(tonality?.tonic).toBe('Eb');
        expect(tonality?.keySignature).toBe('bbb');
    });

    it('keeps seven-sharp keys available when they are the canonical spelling', () => {
        const tonality = resolveScaleTonality('C#', 'major', false);

        expect(tonality?.tonic).toBe('C#');
        expect(tonality?.keySignature).toBe('#######');
    });

    it('spells major staff scales using the resolved tonal key', () => {
        expect(getScaleStaffNotes('D#', 'major', true)).toEqual([
            'Eb4',
            'F4',
            'G4',
            'Ab4',
            'Bb4',
            'C4',
            'D4',
            'Eb5',
        ]);
    });

    it('spells minor arpeggios using the resolved tonal key', () => {
        expect(getChordStaffNotes('A#', 'arp:m', true)).toEqual([
            'Bb4',
            'Db5',
            'F5',
        ]);
    });

    it('exposes a tonal signature for major arpeggios', () => {
        const tonality = resolveSelectionTonality('D#', null, 'arp:M', true);

        expect(tonality?.tonic).toBe('Eb');
        expect(tonality?.keySignature).toBe('bbb');
    });
});
