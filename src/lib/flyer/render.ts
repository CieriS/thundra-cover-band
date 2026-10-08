/**
 * Flyer renderer: draws a scene (see layout.ts) into a JPEG with sharp.
 * Text is turned into vector outlines with opentype.js from the font files in node_modules,
 * so the result does not depend on the fonts installed on the machine that builds the site.
 * This module is the only one that touches files and images.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import opentype from 'opentype.js';
import QRCode from 'qrcode';
import sharp, { type OverlayOptions, type Sharp } from 'sharp';
import type { Element, Scene, Segment } from './layout';
import { FLYER_COLOURS, type FlyerFont } from './variants';

const root = process.cwd();
const FONT_FILES: Record<FlyerFont, string> = {
  display: 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff',
  creepster: 'node_modules/@fontsource/creepster/files/creepster-latin-400-normal.woff',
  christmas: 'node_modules/@fontsource/mountains-of-christmas/files/mountains-of-christmas-latin-700-normal.woff',
  limelight: 'node_modules/@fontsource/limelight/files/limelight-latin-400-normal.woff',
  henny: 'node_modules/@fontsource/henny-penny/files/henny-penny-latin-400-normal.woff',
  pacifico: 'node_modules/@fontsource/pacifico/files/pacifico-latin-400-normal.woff',
  script: 'node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
};
const BACKGROUND = 'src/assets/flyer/background.jpg';
const LOGO = 'src/assets/brand/logo.png';

const fonts = new Map<FlyerFont, Promise<opentype.Font>>();
function font(name: FlyerFont): Promise<opentype.Font> {
  let loaded = fonts.get(name);
  if (!loaded) {
    loaded = readFile(resolve(root, FONT_FILES[name])).then((file) =>
      opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)),
    );
    fonts.set(name, loaded);
  }
  return loaded;
}

/**
 * Outline of a run of text. Glyphs are placed one by one (advance, kerning, tracking): the
 * shaping engine of the font library is skipped on purpose, it fails on some script faces.
 */
async function outline(segment: Segment, x: number, baseline: number, scale: number) {
  const face = await font(segment.font);
  const size = segment.size * scale;
  const unit = size / face.unitsPerEm;
  const tracking = (segment.tracking ?? 0) * size;
  let cursor = x;
  let d = '';
  let previous: opentype.Glyph | null = null;
  for (const char of segment.text) {
    const glyph = face.charToGlyph(char);
    if (previous) cursor += face.getKerningValue(previous, glyph) * unit;
    d += glyph.getPath(cursor, baseline, size).toPathData(1);
    cursor += (glyph.advanceWidth ?? 0) * unit + tracking;
    previous = glyph;
  }
  return { d, width: cursor - x - (segment.text.length > 0 ? tracking : 0) };
}

/** A line: its segments side by side on one baseline, shrunk if wider than allowed. */
async function line(element: Extract<Element, { kind: 'line' }>, px: number): Promise<string> {
  const measure = async (scale: number) => {
    let width = 0;
    for (const segment of element.segments) width += (await outline(segment, 0, 0, scale)).width;
    return width;
  };
  const natural = await measure(px);
  const scale = px * Math.min(1, (element.maxWidth * px) / natural);
  const width = scale === px ? natural : await measure(scale);
  let x = element.x * px - (element.anchor === 'middle' ? width / 2 : 0);
  let svg = '';
  for (const segment of element.segments) {
    const drawn = await outline(segment, x, element.baseline * px, scale);
    svg += `<path d="${drawn.d}" fill="${segment.colour}"/>`;
    x += drawn.width;
  }
  return svg;
}

const ICONS = {
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5h.01',
  facebook: 'M14 21v-8h3l.5-4H14V7c0-1.1.4-2 2-2h1.5V1.5C17 1.3 15.800 1 14.500 1 11.700 1 10 2.700 10 5.800V9H7v4h3v8',
} as const;

/** Social handles on one row, each with its icon, the whole row centred. */
async function social(element: Extract<Element, { kind: 'social' }>, px: number): Promise<string> {
  const size = element.size * px;
  const icon = size * 1.5;
  const gap = size * 0.5;
  const between = size * 2.6;
  const runs = await Promise.all(
    element.items.map((item) =>
      outline({ text: item.text.toUpperCase(), size: element.size, colour: FLYER_COLOURS.bone, font: 'display', tracking: 0.1 }, 0, 0, px),
    ),
  );
  const total = runs.reduce((sum, run) => sum + icon + gap + run.width, 0) + between * Math.max(0, runs.length - 1);
  let x = element.cx * px - total / 2;
  const baseline = element.baseline * px;
  let svg = '';
  for (const [index, item] of element.items.entries()) {
    svg += `<g transform="translate(${x} ${baseline - icon * 0.82}) scale(${icon / 24})" fill="none" stroke="${FLYER_COLOURS.bone}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[item.icon]}"/></g>`;
    x += icon + gap;
    const drawn = await outline({ text: item.text.toUpperCase(), size: element.size, colour: FLYER_COLOURS.bone, font: 'display', tracking: 0.1 }, x, baseline, px);
    svg += `<path d="${drawn.d}" fill="${FLYER_COLOURS.bone}"/>`;
    x += (runs[index]?.width ?? 0) + between;
  }
  return svg;
}

/** QR code on a light plate, so any phone camera reads it on the dark sheet. */
function qr(element: Extract<Element, { kind: 'qr' }>, px: number): string {
  const code = QRCode.create(element.url, { errorCorrectionLevel: 'M' });
  const count = code.modules.size;
  const size = element.size * px;
  const pad = size * 0.09;
  const cell = (size - pad * 2) / count;
  let cells = '';
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (code.modules.data[row * count + column]) {
        cells += `M${(pad + column * cell).toFixed(2)} ${(pad + row * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
      }
    }
  }
  return `<g transform="translate(${element.x * px} ${element.y * px})"><rect width="${size}" height="${size}" rx="${size * 0.06}" fill="${FLYER_COLOURS.bone}"/><path d="${cells}" fill="#04060c"/></g>`;
}

const BOX = { light: '#ffffff', dark: '#000000' } as const;

/** Draws the scene at the given pixel width and returns the image. */
export async function renderScene(scene: Scene, pixelWidth: number): Promise<Sharp> {
  const px = pixelWidth / scene.width;
  const width = Math.round(scene.width * px);
  const height = Math.round(scene.height * px);
  const layers: OverlayOptions[] = [];
  let shade = '';
  let vector = '';
  const later: OverlayOptions[] = [];

  for (const element of scene.elements) {
    if (element.kind === 'background') {
      const blockHeight = Math.round(element.height * px);
      const image = await sharp(resolve(root, BACKGROUND))
        .resize(width, blockHeight, { fit: 'cover', position: 'centre' })
        .modulate({ hue: element.hue, saturation: element.saturation })
        .toBuffer();
      layers.push({ input: image, left: 0, top: Math.round(element.y * px) });
      // The lower fifth of the image melts into the band below it; when the image starts
      // below the top of the sheet its upper edge melts as well.
      const top = element.y * px;
      const id = `fade${layers.length}`;
      shade += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${element.fadeTo}" stop-opacity="${element.y > 0 ? 1 : 0}"/><stop offset="0.12" stop-color="${element.fadeTo}" stop-opacity="0"/><stop offset="0.78" stop-color="${element.fadeTo}" stop-opacity="0"/><stop offset="1" stop-color="${element.fadeTo}"/></linearGradient></defs><rect x="0" y="${top}" width="${width}" height="${blockHeight + 1}" fill="url(#${id})"/>`;
    } else if (element.kind === 'logo') {
      const logoWidth = Math.round(element.width * px);
      const logo = await sharp(resolve(root, LOGO)).resize({ width: logoWidth }).toBuffer({ resolveWithObject: true });
      const left = Math.round(element.cx * px - logoWidth / 2);
      const top = Math.round(element.y * px);
      // A soft red glow behind the logo, as in the band's artwork.
      shade += `<defs><radialGradient id="glow${left}${top}"><stop offset="0" stop-color="#b3120a" stop-opacity="0.42"/><stop offset="1" stop-color="#b3120a" stop-opacity="0"/></radialGradient></defs><ellipse cx="${element.cx * px}" cy="${top + logo.info.height * 0.5}" rx="${logoWidth * 0.62}" ry="${logo.info.height * 0.78}" fill="url(#glow${left}${top})"/>`;
      later.push({ input: logo.data, left, top });
    } else if (element.kind === 'panel') {
      shade += `<rect x="${element.x * px}" y="${element.y * px}" width="${element.width * px}" height="${element.height * px}" fill="${element.colour}" fill-opacity="${element.opacity}"/>`;
    } else if (element.kind === 'line') {
      vector += await line(element, px);
    } else if (element.kind === 'social') {
      vector += await social(element, px);
    } else if (element.kind === 'qr') {
      vector += qr(element, px);
    } else {
      const boxWidth = Math.round(element.width * px);
      const boxHeight = Math.round(element.height * px);
      const left = Math.round(element.x * px);
      const top = Math.round(element.y * px);
      const radius = Math.round(boxHeight * 0.1);
      // An opaque logo brings its own background: the box takes that colour, so the logo sits
      // in it without a visible edge. A transparent logo gets the tone chosen for the night.
      const original = sharp(resolve(root, element.source));
      const meta = await original.metadata();
      let fill: string = BOX[element.tone];
      if (!meta.hasAlpha) {
        const corner = await original.clone().extract({ left: 0, top: 0, width: 4, height: 4 }).resize(1, 1).removeAlpha().raw().toBuffer();
        fill = `#${[corner[0], corner[1], corner[2]].map((value) => (value ?? 0).toString(16).padStart(2, '0')).join('')}`;
      }
      vector += `<rect x="${left}" y="${top}" width="${boxWidth}" height="${boxHeight}" rx="${radius}" fill="${fill}" stroke="${FLYER_COLOURS.line}" stroke-width="${Math.max(1, px * 1.5)}"/>`;
      const pad = Math.round(boxHeight * 0.12);
      // Empty margins around the logo are removed first, so it fills the box.
      const trimmed = await original.clone().trim({ threshold: 24 }).toBuffer().catch(() => original.clone().toBuffer());
      const logo = await sharp(trimmed)
        .resize(boxWidth - pad * 2, boxHeight - pad * 2, { fit: 'contain', background: fill })
        .flatten({ background: fill })
        .toBuffer();
      later.push({ input: logo, left: left + pad, top: top + pad });
    }
  }

  const svg = (body: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);
  // Order: lightning, fades and glow, text and boxes, then the logos (band logo over its
  // glow, venue logos inside their boxes).
  return sharp({ create: { width, height, channels: 3, background: FLYER_COLOURS.band } }).composite([
    ...layers,
    { input: svg(shade), left: 0, top: 0 },
    { input: svg(vector), left: 0, top: 0 },
    ...later,
  ]);
}
