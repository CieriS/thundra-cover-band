// Cuts the band logo out of the artwork supplied by the band and derives every brand asset
// from it: full logo, compact wordmark, favicon, touch icon and link preview.
// The logo is never redrawn: pixels come from src/assets/brand/logo-original.webp only.
// Run with `node scripts/build-logo.mjs` after replacing the original.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const at = (path) => resolve(root, path);
const source = at('src/assets/brand/logo-original.webp');
const NIGHT = '#04060c';

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// The lettering is the only saturated red in the artwork (the lightning is white-blue):
// alpha follows how much red exceeds the other channels, so the soft glow fades out.
const cut = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i += 1) {
  const r = data[i * 4];
  const g = data[i * 4 + 1];
  const b = data[i * 4 + 2];
  const redness = r - Math.max(g, b);
  const alpha = Math.max(0, Math.min(255, (redness - 28) * 3.2));
  cut.set([r, g, b, alpha], i * 4);
}
const scale = width / 1932;
const region = (left, top, w, h) => ({
  left: Math.round(left * scale),
  top: Math.round(top * scale),
  width: Math.round(w * scale),
  height: Math.round(h * scale),
});

/** Crops a region of the cut-out and trims the transparent margins (two steps: sharp trims before it extracts). */
const piece = async (area, pixels = cut) =>
  sharp(await sharp(pixels, { raw: { width, height, channels: 4 } }).extract(area).png().toBuffer()).trim();

// For the compact wordmark the bolt hanging below the name is made transparent.
const nameOnly = Buffer.from(cut);
// Two areas: the bolt below the name, and the "AC DC" row between the long legs of T and A.
for (const area of [region(845, 1000, 330, 700), region(520, 1110, 1000, 400)]) {
  for (let y = area.top; y < Math.min(height, area.top + area.height); y += 1) {
    for (let x = area.left; x < area.left + area.width; x += 1) nameOnly[(y * width + x) * 4 + 3] = 0;
  }
}

// Full logo: name, "AC DC" and the bolt.
await (await piece(region(130, 530, 1720, 1090))).resize({ width: 1400 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/logo.png'));
// Compact wordmark for the header and footer: the name row only.
await (await piece(region(130, 530, 1720, 660), nameOnly)).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/logo-compact.png'));

// Icons: the bolt of the logo on the site's night colour.
const bolt = await (await piece(region(855, 1010, 300, 620))).png().toBuffer();
await sharp(bolt).resize({ height: 620, fit: 'inside' }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/bolt.png'));
const icon = async (size, path) => {
  const inner = await sharp(bolt).resize({ height: Math.round(size * 0.84), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: NIGHT } })
    .composite([{ input: inner, gravity: 'centre' }])
    .png({ palette: true, colours: 64 })
    .toFile(at(path));
};
await icon(192, 'public/favicon.png');
await icon(180, 'public/apple-touch-icon.png');

// Link preview: the original artwork, cropped around the logo.
await sharp(source)
  .extract(region(0, 330, 1932, 1014))
  .resize(1200, 630)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(at('public/og.jpg'));

console.log('Brand assets rebuilt from logo-original.webp');
