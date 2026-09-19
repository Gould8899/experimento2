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
        preferFlats: false,
      }),
    ).toBe('izquierda-abriendo-sostenidos-cs-arp-aug-whole-tone-personalizado.png');
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
        preferFlats: true,
      }),
    ).toBe('derecha-cerrando-bemoles.png');
  });

  it('supports SVG exports', () => {
    expect(
      buildKeyboardExportFilename({
        instrument: 'rheinische142',
        side: 'right',
        direction: 'open',
        tonic: null,
        chordType: null,
        scaleType: null,
        isModified: false,
        preferFlats: true,
        format: 'svg',
      }),
    ).toBe('derecha-abriendo-bemoles.svg');
  });

  it('supports vector PDF exports', () => {
    expect(
      buildKeyboardExportFilename({
        instrument: 'rheinische142',
        side: 'left',
        direction: 'close',
        tonic: null,
        chordType: null,
        scaleType: null,
        isModified: false,
        preferFlats: false,
        format: 'pdf',
      }),
    ).toBe('izquierda-cerrando-sostenidos.pdf');
  });
});
