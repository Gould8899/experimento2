import { Note } from 'tonal';
import { getScaleStaffNotes } from './scaleType';
import { getChordStaffNotes } from './tonality';

type StaffStateSource =
    | 'gesture'
    | 'manual'
    | 'recent'
    | 'voicing'
    | 'scale'
    | 'tonic'
    | 'idle';

type ResolveStaffStateParams = {
    gestureActive: boolean;
    gestureTrace: string[];
    isModified: boolean;
    userSelection: Record<string, boolean>;
    recentPlaybackNotes: string[];
    chordNotes: string[];
    chordFormulaNotes: string[];
    chordType: string | null;
    usesFormulaChordSelection: boolean;
    tonic: string | null;
    scaleType: string | null;
    preferFlats: boolean;
};

export function sortNotesByMidi(notes: string[]) {
    return [...notes].sort((left, right) => {
        const leftMidi = Note.midi(left) ?? 0;
        const rightMidi = Note.midi(right) ?? 0;
        return leftMidi - rightMidi;
    });
}

export function takeRecentPlaybackNotes(notes: string[], limit = 16) {
    return notes.slice(-limit);
}

export function appendRecentPlaybackNotes(
    previousNotes: string[],
    nextNotes: string[],
    limit = 16,
) {
    if (nextNotes.length === 0) {
        return takeRecentPlaybackNotes(previousNotes, limit);
    }

    return takeRecentPlaybackNotes([...previousNotes, ...nextNotes], limit);
}

export function resolveStaffState({
    gestureActive,
    gestureTrace,
    isModified,
    userSelection,
    recentPlaybackNotes,
    chordNotes,
    chordFormulaNotes,
    chordType,
    usesFormulaChordSelection,
    tonic,
    scaleType,
    preferFlats,
}: ResolveStaffStateParams): { notes: string[]; source: StaffStateSource } {
    if (gestureActive && gestureTrace.length > 0) {
        return { notes: gestureTrace, source: 'gesture' };
    }

    if (recentPlaybackNotes.length > 0) {
        return { notes: recentPlaybackNotes, source: 'recent' };
    }

    if (isModified) {
        return {
            notes: sortNotesByMidi(
                Object.keys(userSelection).filter((note) => userSelection[note]),
            ),
            source: 'manual',
        };
    }

    if (chordNotes.length > 0) {
        const resolvedChordNotes = getChordStaffNotes(
            tonic,
            chordType,
            preferFlats,
        );

        return {
            notes: usesFormulaChordSelection
                ? resolvedChordNotes.length > 0
                    ? resolvedChordNotes
                    : [...chordFormulaNotes]
                : sortNotesByMidi(chordNotes),
            source: 'voicing',
        };
    }

    if (tonic && scaleType) {
        const notes = getScaleStaffNotes(tonic, scaleType, preferFlats);
        if (notes.length > 0) return { notes, source: 'scale' };
    }

    if (scaleType) {
        const notes = getScaleStaffNotes(null, scaleType, preferFlats);
        if (notes.length > 0) return { notes, source: 'scale' };
    }

    if (tonic) {
        return { notes: [`${tonic}4`], source: 'tonic' };
    }

    return { notes: [], source: 'idle' };
}
