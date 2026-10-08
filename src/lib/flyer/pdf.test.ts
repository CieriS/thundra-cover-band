import { describe, expect, test } from 'bun:test';
import { jpegToPdf } from './pdf';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 0xff, 0xd9]);
const decode = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

describe('jpegToPdf', () => {
  const pdf = jpegToPdf(jpeg, 2480, 3507);
  const text = decode(pdf);

  test('is a PDF with one A4 page', () => {
    expect(text.startsWith('%PDF-1.4\n')).toBe(true);
    expect(text.endsWith('%%EOF\n')).toBe(true);
    expect(text).toContain('/MediaBox [0 0 595.28 841.89]');
    expect(text).toContain('/Count 1');
  });

  test('embeds the image bytes untouched, with their size', () => {
    expect(text).toContain('/Width 2480 /Height 3507');
    expect(text).toContain(`/Filter /DCTDecode /Length ${jpeg.length}`);
    const at = text.indexOf('stream\n', text.indexOf('/DCTDecode')) + 'stream\n'.length;
    expect([...pdf.slice(at, at + jpeg.length)]).toEqual([...jpeg]);
  });

  test('every entry of the cross-reference table points at its object', () => {
    const start = Number(/startxref\n(\d+)\n/.exec(text)?.[1]);
    expect(text.slice(start, start + 4)).toBe('xref');
    const offsets = [...text.slice(start).matchAll(/(\d{10}) 00000 n /g)].map((match) => Number(match[1]));
    expect(offsets).toHaveLength(5);
    offsets.forEach((offset, index) => {
      expect(text.slice(offset, offset + `${index + 1} 0 obj`.length)).toBe(`${index + 1} 0 obj`);
    });
  });

  test('the image fills the page', () => {
    expect(text).toContain('q 595.28 0 0 841.89 0 0 cm /Im0 Do Q');
  });

  test('an empty image still gives a well formed file', () => {
    const empty = decode(jpegToPdf(new Uint8Array(), 1, 1));
    expect(empty).toContain('/Length 0 >>');
    expect(empty.endsWith('%%EOF\n')).toBe(true);
  });
});
