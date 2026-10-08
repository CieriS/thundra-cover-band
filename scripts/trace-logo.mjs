// Rebuilds the band logo as vector paths, traced from the artwork supplied by the band
// (src/assets/brand/logo-original.webp), and derives the brand assets from those paths:
//   src/config/logo-paths.ts   paths used by the LogoMark component (generated, do not edit)
//   public/favicon.svg|png, public/apple-touch-icon.png   the logo bolt on the site's night colour
//   public/og.jpg              link preview, cropped from the original artwork
// The shapes are traced, not redrawn by eye: each letter is the outline of the red pixels.
// Run with `node scripts/trace-logo.mjs` after replacing the original. No dependencies but sharp.
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const at = (path) => resolve(root, path);
const source = at('src/assets/brand/logo-original.webp');
const NIGHT = '#04060c';
const RED = '#d4140a';

/** Area of the artwork that contains the logo, in a 2000px-wide reference frame. */
const AREA = { left: 120, top: 520, width: 1800, height: 1200 };
/** How much red must exceed green and blue for a pixel to belong to the lettering. */
const THRESHOLD = 58;
/**
 * The bolt starts behind the name and fades into shadow at the top: it is traced on its own,
 * below the baseline of the name, with a lower threshold. It is drawn under the letters.
 */
const BOLT_BOX = { left: 856, top: 1008, width: 350, height: 700, threshold: 30 };
/**
 * Maximum distance (px) between the traced outline and the simplified polygon. The big letters
 * have straight edges, so a generous value irons out the grain of the compressed artwork.
 */
const TOLERANCE = { large: 3.4, small: 1.2 };

const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
const scale = info.width / 2000;
const box = (b) => ({
  left: Math.round(b.left * scale),
  top: Math.round(b.top * scale),
  width: Math.round(b.width * scale),
  height: Math.round(b.height * scale),
});
const area = box(AREA);
const boltBox = box(BOLT_BOX);
const W = area.width;
const H = area.height;

// 1. Redness map of the area, slightly blurred so that cracks in the texture close up.
const redness = Buffer.alloc(W * H);
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const i = ((y + area.top) * info.width + x + area.left) * info.channels;
    redness[y * W + x] = Math.max(0, Math.min(255, data[i] - Math.max(data[i + 1], data[i + 2])));
  }
}
const blurred = await sharp(redness, { raw: { width: W, height: H, channels: 1 } }).blur(3.2).extractChannel(0).raw().toBuffer();

const inBolt = (x, y) =>
  x + area.left >= boltBox.left &&
  x + area.left < boltBox.left + boltBox.width &&
  y + area.top >= boltBox.top &&
  y + area.top < boltBox.top + boltBox.height;
/** Labels the 4-connected components of a mask. */
function label(mask) {
  const labels = new Int32Array(W * H);
  const components = [];
  for (let start = 0; start < W * H; start += 1) {
    if (!mask[start] || labels[start]) continue;
    const id = components.length + 1;
    const stack = [start];
    labels[start] = id;
    const c = { id, size: 0, minX: W, minY: H, maxX: 0, maxY: 0, labels };
    while (stack.length) {
      const p = stack.pop();
      const x = p % W;
      const y = (p - x) / W;
      c.size += 1;
      if (x < c.minX) c.minX = x;
      if (x > c.maxX) c.maxX = x;
      if (y < c.minY) c.minY = y;
      if (y > c.maxY) c.maxY = y;
      for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (mask[q] && !labels[q]) {
          labels[q] = id;
          stack.push(q);
        }
      }
    }
    components.push(c);
  }
  return components;
}

// 2. The bolt first: the largest shape inside its box.
const boltMask = new Uint8Array(W * H);
for (let y = 1; y < H - 1; y += 1) {
  for (let x = 1; x < W - 1; x += 1) {
    boltMask[y * W + x] = inBolt(x, y) && blurred[y * W + x] > BOLT_BOX.threshold ? 1 : 0;
  }
}
const bolt = label(boltMask).sort((a, b) => b.size - a.size)[0];

// Then the letters: everything red enough that is not the bolt.
const mask = new Uint8Array(W * H);
for (let y = 1; y < H - 1; y += 1) {
  for (let x = 1; x < W - 1; x += 1) {
    const p = y * W + x;
    mask[p] = blurred[p] > THRESHOLD && !(bolt && bolt.labels[p] === bolt.id) ? 1 : 0;
  }
}
const shapes = label(mask).filter((c) => c.size > 500 * scale * scale);

// 3. Outline of a component: boundary edges chained into closed loops (holes included).
function outline(c) {
  const { id, labels } = c;
  const next = new Map();
  const add = (x1, y1, x2, y2) => {
    const key = y1 * (W + 1) + x1;
    if (!next.has(key)) next.set(key, []);
    next.get(key).push({ x1, y1, x2, y2, used: false });
  };
  for (let y = c.minY; y <= c.maxY; y += 1) {
    for (let x = c.minX; x <= c.maxX; x += 1) {
      if (labels[y * W + x] !== id) continue;
      if (labels[(y - 1) * W + x] !== id) add(x, y, x + 1, y);
      if (labels[y * W + x + 1] !== id) add(x + 1, y, x + 1, y + 1);
      if (labels[(y + 1) * W + x] !== id) add(x + 1, y + 1, x, y + 1);
      if (labels[y * W + x - 1] !== id) add(x, y + 1, x, y);
    }
  }
  const loops = [];
  for (const edges of next.values()) {
    for (const first of edges) {
      if (first.used) continue;
      const loop = [];
      let edge = first;
      while (edge && !edge.used) {
        edge.used = true;
        loop.push([edge.x1, edge.y1]);
        const options = (next.get(edge.y2 * (W + 1) + edge.x2) ?? []).filter((e) => !e.used);
        // Where two corners touch diagonally, keep turning right so loops never cross.
        const dx = edge.x2 - edge.x1;
        const dy = edge.y2 - edge.y1;
        edge =
          options.find((e) => e.x2 - e.x1 === -dy && e.y2 - e.y1 === dx) ??
          options.find((e) => e.x2 - e.x1 === dx && e.y2 - e.y1 === dy) ??
          options[0];
      }
      if (loop.length > 8) loops.push(loop);
    }
  }
  return loops;
}

// 4. Ramer-Douglas-Peucker simplification of a closed loop.
function simplify(points, tolerance) {
  const distance = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy) || 1;
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / length;
  };
  const rdp = (from, to, keep) => {
    let worst = 0;
    let index = -1;
    for (let i = from + 1; i < to; i += 1) {
      const d = distance(points[i], points[from], points[to]);
      if (d > worst) {
        worst = d;
        index = i;
      }
    }
    if (worst > tolerance) {
      rdp(from, index, keep);
      keep.push(index);
      rdp(index, to, keep);
    }
  };
  // Split the loop at its two most distant points, then simplify both halves.
  let far = 0;
  let best = 0;
  for (let i = 1; i < points.length; i += 1) {
    const d = Math.hypot(points[i][0] - points[0][0], points[i][1] - points[0][1]);
    if (d > best) {
      best = d;
      far = i;
    }
  }
  const keep = [0];
  rdp(0, far, keep);
  keep.push(far);
  const closed = [...points, points[0]];
  const tail = [];
  const saved = points;
  points = closed;
  rdp(far, closed.length - 1, tail);
  points = saved;
  return [...keep, ...tail].map((i) => points[i]);
}

// 5. Classify the shapes and crop the drawing to them.
const all = bolt ? [...shapes, bolt] : shapes;
const minX = Math.min(...all.map((s) => s.minX)) - 4;
const minY = Math.min(...all.map((s) => s.minY)) - 4;
const maxX = Math.max(...all.map((s) => s.maxX)) + 5;
const maxY = Math.max(...all.map((s) => s.maxY)) + 5;
const round = (n) => Math.round(n * 10) / 10;
const pathOf = (shape, tolerance) =>
  outline(shape)
    .map((loop) => simplify(loop, tolerance * scale))
    .filter((loop) => loop.length > 2)
    .map((loop) => `M${loop.map(([x, y]) => `${round(x - minX)} ${round(y - minY)}`).join('L')}Z`)
    .join('');

const tall = (s) => s.maxY - s.minY;
const name = shapes.filter((s) => tall(s) > 250 * scale).sort((a, b) => a.minX - b.minX);
const sub = shapes.filter((s) => !name.includes(s)).sort((a, b) => a.minX - b.minX);
// Letters that touch in the artwork (U and N) come out as one shape: that is expected.
if (!bolt || name.length < 5 || sub.length !== 4) {
  console.warn(`Unexpected shapes: bolt=${Boolean(bolt)} name=${name.length} sub=${sub.length} (expected 4)`);
}

const entry = (s, tolerance) => ({ d: pathOf(s, tolerance), x: round(s.minX - minX), y: round(s.minY - minY), w: s.maxX - s.minX, h: tall(s) });
const logo = {
  width: maxX - minX,
  height: maxY - minY,
  /** Bottom of the name row: the compact logo is cropped here. */
  nameHeight: Math.max(...name.map((s) => s.maxY)) - minY + 4,
  name: name.map((s) => entry(s, TOLERANCE.large)),
  sub: sub.map((s) => entry(s, TOLERANCE.small)),
  bolt: bolt ? entry(bolt, TOLERANCE.large) : null,
};

await writeFile(
  at('src/config/logo-paths.ts'),
  `// Generated by scripts/trace-logo.mjs from src/assets/brand/logo-original.webp. Do not edit.\n` +
    `export interface LogoShape {\n  d: string;\n  x: number;\n  y: number;\n  w: number;\n  h: number;\n}\n\n` +
    `export const logoPaths: {\n  width: number;\n  height: number;\n  nameHeight: number;\n  name: LogoShape[];\n  sub: LogoShape[];\n  bolt: LogoShape | null;\n} = ${JSON.stringify(logo, null, 2)};\n`,
);

// 6. Icons from the traced bolt, link preview from the artwork.
if (logo.bolt) {
  const b = logo.bolt;
  const size = Math.max(b.w, b.h) * 1.2;
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.x + b.w / 2 - size / 2} ${b.y + b.h / 2 - size / 2} ${size} ${size}"><rect x="-9999" y="-9999" width="99999" height="99999" fill="${NIGHT}"/><path d="${b.d}" fill="${RED}" fill-rule="evenodd"/></svg>`;
  await writeFile(at('public/favicon.svg'), iconSvg);
  await sharp(Buffer.from(iconSvg)).resize(192, 192).png({ palette: true }).toFile(at('public/favicon.png'));
  await sharp(Buffer.from(iconSvg)).resize(180, 180).png({ palette: true }).toFile(at('public/apple-touch-icon.png'));
}
await sharp(source)
  .extract(box({ left: 0, top: 342, width: 2000, height: 1050 }))
  .resize(1200, 630)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(at('public/og.jpg'));

// 7. Optional check image: `node scripts/trace-logo.mjs --preview out.png`.
const previewAt = process.argv.indexOf('--preview');
if (previewAt > 0 && process.argv[previewAt + 1]) {
  const paint = (list, colour) => list.map((s) => `<path d="${s.d}" fill="${colour}" fill-rule="evenodd"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logo.width} ${logo.height}" width="${logo.width}"><rect width="100%" height="100%" fill="${NIGHT}"/>${paint(logo.name, RED)}${paint(logo.sub, '#ff5a4a')}${logo.bolt ? paint([logo.bolt], '#4cc9ff') : ''}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(process.argv[previewAt + 1]);
}

const points = [...logo.name, ...logo.sub, ...(logo.bolt ? [logo.bolt] : [])].reduce((n, s) => n + s.d.split('L').length, 0);
console.log(`Traced ${logo.name.length} letters, ${logo.sub.length} small letters, bolt: ${Boolean(logo.bolt)} (${points} points, ${logo.width}x${logo.height})`);
