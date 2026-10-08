// Derives every brand asset from the logo supplied by the band
// (src/assets/brand/logo-original.jpg: flat red artwork on a white background):
//   src/assets/brand/logo.png          full logo on a transparent background
//   src/assets/brand/logo-compact.png  the name only, for header, menu and footer
//   src/assets/brand/bolt.png          the bolt only, for decorations and icons
//   public/favicon.png, public/apple-touch-icon.png   the bolt on the site's night colour
//   public/og.jpg                      link preview: the logo on the night background
// Nothing is redrawn: the pixels are the band's, only the background is removed and the
// parts are separated. Run with `node scripts/build-logo.mjs` after replacing the original.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const at = (path) => resolve(root, path);
const source = at('src/assets/brand/logo-original.jpg');
const NIGHT = { r: 4, g: 6, b: 12 };

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// 1. Coverage of every pixel: white is 0, the logo red is 255. The colour is then set to one
//    flat red (the median of the solid pixels), so no white fringe from the JPEG survives.
const coverage = new Uint8Array(W * H);
const reds = [];
for (let i = 0; i < W * H; i += 1) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  coverage[i] = Math.max(0, Math.min(255, Math.round((255 - Math.min(g, b)) * 1.12)));
  if (coverage[i] === 255 && i % 97 === 0) reds.push([r, g, b]);
}
const median = (channel) => reds.map((c) => c[channel]).sort((a, b) => a - b)[Math.floor(reds.length / 2)];
const RED = [median(0), median(1), median(2)];

// 2. Connected shapes (4-neighbours). The bolt is outlined in white in the artwork, so it is
//    a shape of its own, separate from the letters it overlaps.
const labels = new Int32Array(W * H);
const shapes = [];
for (let start = 0; start < W * H; start += 1) {
  if (coverage[start] < 48 || labels[start]) continue;
  const id = shapes.length + 1;
  const shape = { id, size: 0, minX: W, minY: H, maxX: 0, maxY: 0 };
  const stack = [start];
  labels[start] = id;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p - x) / W;
    shape.size += 1;
    if (x < shape.minX) shape.minX = x;
    if (x > shape.maxX) shape.maxX = x;
    if (y < shape.minY) shape.minY = y;
    if (y > shape.maxY) shape.maxY = y;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W]) {
      if (q >= 0 && q < W * H && coverage[q] >= 48 && !labels[q]) {
        labels[q] = id;
        stack.push(q);
      }
    }
  }
  shapes.push(shape);
}
const real = shapes.filter((s) => s.size > W * H * 0.00005);
// The bolt reaches lower than anything else; the small "AC DC" letters are short.
const bolt = real.reduce((lowest, s) => (s.maxY > lowest.maxY ? s : lowest));
const small = real.filter((s) => s !== bolt && s.maxY - s.minY < H * 0.12);
const name = real.filter((s) => s !== bolt && !small.includes(s));
console.log(`Shapes: name ${name.length}, small letters ${small.length}, bolt 1`);

/** Transparent image holding only the given shapes, trimmed to them. */
async function render(list) {
  const ids = new Set(list.map((s) => s.id));
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i += 1) {
    if (ids.has(labels[i])) out.set([RED[0], RED[1], RED[2], coverage[i]], i * 4);
  }
  return sharp(await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()).trim();
}

const full = await (await render(real)).resize({ width: 1400 }).png({ compressionLevel: 9 }).toBuffer();
await sharp(full).toFile(at('src/assets/brand/logo.png'));
await (await render(name)).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/logo-compact.png'));
const boltImage = await (await render([bolt])).resize({ height: 700 }).png({ compressionLevel: 9 }).toBuffer();
await sharp(boltImage).toFile(at('src/assets/brand/bolt.png'));

// 3. Icons. The whole logo is unreadable at 16 pixels: the icon is its bolt, on the night
//    colour of the site, with a margin so it survives the rounded masks of phones.
async function icon(size, path) {
  const inner = await sharp(boltImage).resize({ height: Math.round(size * 0.8), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { ...NIGHT, alpha: 1 } } })
    .composite([{ input: inner, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(at(path));
}
await icon(192, 'public/favicon.png');
await icon(180, 'public/apple-touch-icon.png');

// 4. Link preview: the logo centred on a dark background with a faint red glow behind it.
const glow = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><radialGradient id="g" cx="50%" cy="46%" r="60%"><stop offset="0" stop-color="#3a0b08"/><stop offset="0.55" stop-color="#0e1426"/><stop offset="1" stop-color="#04060c"/></radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`,
);
await sharp(glow)
  .composite([{ input: await sharp(full).resize({ width: 760 }).toBuffer(), gravity: 'centre' }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(at('public/og.jpg'));

console.log(`Brand assets rebuilt from logo-original.jpg (red ${RED.join(',')})`);
