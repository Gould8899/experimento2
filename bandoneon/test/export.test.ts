import { describe, expect, it } from 'vitest';
import { buildKeyboardExportFilename } from '../src/utils/export';

describe('buildKeyboardExportFilename', () => {
  it('builds stable filenames for keyboard exports', () => {
    expect(
      buildKeyboardExportFilename({
        instrument: 'rheinische142',
        side: 'left',
        direction: 'open',
        tonic: 'C#',
        chordType: 'arp:aug',
        scaleType: 'whole tone',
        isModified: true,
      }),
    ).toBe(
      'bandoneon-rheinische142-left-open-Cs-arp-aug-whole-tone-custom.png',
    );
  });

  it('omits optional segments when nothing is selected', () => {
    expect(
      buildKeyboardExportFilename({
        instrument: 'rheinische142',
        side: 'right',
        direction: 'close',
        tonic: null,
        chordType: null,
        scaleType: null,
        isModified: false,
      }),
    ).toBe('bandoneon-rheinische142-right-close.png');
  });
});
