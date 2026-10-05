import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

/** Reads the colour tokens straight from the @theme block, so the test follows the design. */
const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{3,6})\b/gi)].map((match) => [match[1], match[2]]),
);

function luminance(hex: string): number {
  const full = hex.length === 4 ? [...hex.slice(1)].map((char) => char + char).join('') : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((start) => {
    const channel = parseInt(full.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

const token = (name: string): string => {
  const value = tokens[name];
  if (!value) throw new Error(`Missing colour token --color-${name}`);
  return value;
};

/** Every text/background pair used on the site. WCAG AA for normal text is 4.5:1. */
const pairs: [text: string, background: string][] = [
  ['bone', 'night-950'],
  ['bone', 'night-900'],
  ['bone', 'night-800'],
  ['bone', 'night-700'],
  ['mute', 'night-950'],
  ['mute', 'night-900'],
  ['mute', 'night-800'],
  ['red-ink', 'night-950'],
  ['red-ink', 'night-900'],
  ['red-ink', 'night-800'],
  ['volt', 'night-950'],
  ['volt', 'night-900'],
  ['volt', 'night-800'],
  ['bone', 'red'],
  ['bone', 'red-deep'],
  ['night-950', 'bone'],
  ['night-950', 'volt'],
];

describe('colour tokens meet WCAG AA (4.5:1)', () => {
  test.each(pairs)('%s on %s', (text, background) => {
    expect(contrast(token(text), token(background))).toBeGreaterThanOrEqual(4.5);
  });

  test('the contrast formula matches the known extremes', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrast('#777', '#777777')).toBeCloseTo(1, 5);
  });
});
