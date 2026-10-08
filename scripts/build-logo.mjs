// Derives every brand asset from the logo supplied by the band
// (src/assets/brand/logo-original.jpg: flat red artwork on a white background):
//   src/assets/brand/logo.png          full logo on a transparent background
//   src/assets/brand/logo-compact.png  the name only, for header, menu and footer
//   src/assets/brand/bolt.png          the bolt only, for decorations and icons
//   public/favicon.png, public/apple-touch-icon.png   the bolt on the site's night colour
//   public/og.jpg                      link preview: the logo on the night background
//   src/assets/brand/distress.webp     scratch mask, used in CSS to wear the hero title
// The shapes are the band's. On request of the band the script also leaves out a stray
// shard between N and D and adds a worn, scratched finish (generated from a seed, so
// every run gives the same result). Icons stay clean: scratches turn to noise at 16 pixels.
// Run with `node scripts/build-logo.mjs` after replacing the original.
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
// A thin shard floats in the gap between N and D in the artwork: an artefact, left out.
const isShard = (s) => {
  const w = s.maxX - s.minX;
  const h = s.maxY - s.minY;
  return Math.min(w, h) < W * 0.02 && Math.max(w, h) > Math.min(w, h) * 4;
};
const real = shapes.filter((s) => s.size > W * H * 0.00005 && !isShard(s));
console.log(`Shards left out: ${shapes.filter((s) => s.size > W * H * 0.00005 && isShard(s)).length}`);
// The bolt reaches lower than anything else; the small "AC DC" letters are short.
const bolt = real.reduce((lowest, s) => (s.maxY > lowest.maxY ? s : lowest));
const small = real.filter((s) => s !== bolt && s.maxY - s.minY < H * 0.12);
const name = real.filter((s) => s !== bolt && !small.includes(s));
console.log(`Shapes: name ${name.length}, small letters ${small.length}, bolt 1`);

// 2b. Worn finish. Everything comes from one seed.
function mulberry(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (x, y) => {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
/** Smooth value noise in 0..1 at the given cell size. */
function noise(x, y, cell) {
  const gx = x / cell;
  const gy = y / cell;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = hash(x0, y0) * (1 - sx) + hash(x0 + 1, y0) * sx;
  const bottom = hash(x0, y0 + 1) * (1 - sx) + hash(x0 + 1, y0 + 1) * sx;
  return top * (1 - sy) + bottom * sy;
}

/** Greyscale map (0..255) of scratches and cracks for an area of the given size. */
async function scratches(width, height, seed, density = 1) {
  const next = mulberry(seed);
  const unit = Math.max(width, height) / 2000;
  const lines = [];
  // Long thin scratches, mostly along one diagonal, as if dragged across a surface.
  for (let i = 0; i < 90 * density; i += 1) {
    const x = next() * width;
    const y = next() * height;
    const angle = -0.9 + (next() - 0.5) * 1.1 + (next() < 0.2 ? 1.6 : 0);
    const length = (60 + next() * 420) * unit;
    const wobble = (next() - 0.5) * 30 * unit;
    const mx = x + (Math.cos(angle) * length) / 2 + wobble;
    const my = y + (Math.sin(angle) * length) / 2 - wobble;
    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;
    lines.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke-width="${((0.8 + next() * 2.6) * unit).toFixed(2)}" stroke-opacity="${(0.45 + next() * 0.55).toFixed(2)}"/>`);
  }
  // A few cracks: jagged, a little wider, with a fork.
  for (let i = 0; i < 14 * density; i += 1) {
    let x = next() * width;
    let y = next() * height;
    let angle = next() * Math.PI * 2;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = 5 + Math.floor(next() * 6);
    for (let k = 0; k < steps; k += 1) {
      angle += (next() - 0.5) * 1.3;
      x += Math.cos(angle) * (18 + next() * 40) * unit;
      y += Math.sin(angle) * (18 + next() * 40) * unit;
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    lines.push(`<path d="${d}" stroke-width="${((1.6 + next() * 2.2) * unit).toFixed(2)}" stroke-linejoin="miter"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/><g fill="none" stroke="white" stroke-linecap="round">${lines.join('')}</g></svg>`;
  return sharp(Buffer.from(svg)).blur(0.6).extractChannel(0).raw().toBuffer();
}
const scratchMap = await scratches(W, H, 20261031);
// Soft copy of the coverage: darker towards the edges of the letters, for a little depth.
const depth = await sharp(Buffer.from(coverage), { raw: { width: W, height: H, channels: 1 } }).blur(7).extractChannel(0).raw().toBuffer();

/** Colour and opacity of a logo pixel once it has been worn. */
function worn(i) {
  const x = i % W;
  const y = (i - x) / W;
  // Mottled tone: large blotches, medium grain, fine grain.
  const tone = 0.5 * noise(x, y, 190) + 0.32 * noise(x + 999, y, 46) + 0.18 * noise(x, y + 999, 9);
  let light = 0.6 + tone * 0.62;
  if (tone < 0.36) light *= 0.72 + tone;
  light *= 0.74 + 0.26 * (depth[i] / 255);
  const scratch = scratchMap[i] / 255;
  light *= 1 - 0.8 * scratch;
  // Deep scratches and scattered pinholes go through to the background.
  let alpha = coverage[i] * (1 - 0.55 * scratch);
  if (hash(x >> 1, y >> 1) > 0.988) alpha *= 0.25;
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return [clamp(RED[0] * light * 1.08), clamp(RED[1] * light), clamp(RED[2] * light), clamp(alpha)];
}

/** Transparent image holding only the given shapes, trimmed to them. `clean` skips the wear. */
async function render(list, clean = false) {
  const ids = new Set(list.map((s) => s.id));
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i += 1) {
    if (!ids.has(labels[i])) continue;
    out.set(clean ? [RED[0], RED[1], RED[2], coverage[i]] : worn(i), i * 4);
  }
  // Trim on the clean coverage, so worn-through pixels at the edges do not change the crop.
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (const s of list) {
    minX = Math.min(minX, s.minX);
    maxX = Math.max(maxX, s.maxX);
    minY = Math.min(minY, s.minY);
    maxY = Math.max(maxY, s.maxY);
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  });
}

// Native size: the flyers print it large.
const full = await (await render(real)).png({ compressionLevel: 9 }).toBuffer();
await sharp(full).toFile(at('src/assets/brand/logo.png'));
await (await render(name)).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/logo-compact.png'));
await (await render([bolt])).resize({ height: 700 }).png({ compressionLevel: 9 }).toFile(at('src/assets/brand/bolt.png'));
// Clean bolt for the icons.
const boltImage = await (await render([bolt], true)).resize({ height: 700 }).png().toBuffer();

// Scratch mask for text set in CSS (the hero title): opaque where the letters stay,
// transparent along scratches and pinholes, slightly thinner where the surface is worn.
{
  const mw = 1200;
  const mh = 420;
  const map = await scratches(mw, mh, 8102026, 0.75);
  const mask = Buffer.alloc(mw * mh * 4);
  for (let i = 0; i < mw * mh; i += 1) {
    const x = i % mw;
    const y = (i - x) / mw;
    const tone = 0.6 * noise(x, y, 110) + 0.4 * noise(x + 500, y, 24);
    let alpha = 255 * (tone < 0.3 ? 0.62 + tone : 1) * (1 - 0.95 * (map[i] / 255));
    if (hash(x, y) > 0.992) alpha *= 0.15;
    mask.set([255, 255, 255, Math.max(0, Math.min(255, Math.round(alpha)))], i * 4);
  }
  await sharp(mask, { raw: { width: mw, height: mh, channels: 4 } }).webp({ quality: 55, alphaQuality: 60 }).toFile(at('src/assets/brand/distress.webp'));
}

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
