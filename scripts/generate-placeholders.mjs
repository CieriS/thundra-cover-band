// Generates every placeholder asset of the site: labelled images in the site
// palette, the grain tile, the Open Graph image, the touch icon and the
// placeholder tech rider PDF. Run with `bun run placeholders`.
// Real photos replace these files (see README, "Foto").
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (path) => resolve(root, path);

const NIGHT = '#04060c';
const NIGHT_2 = '#0e1426';
const RED = '#d4140a';
const RED_DEEP = '#8f0d06';
const VOLT = '#4cc9ff';
const BONE = '#f5f2ea';

/** Abstract poster-like artwork: gradient, diagonal red slab, thin volt lines, label. */
function artwork({ width, height, label, ratio, variant = 0, labelTop = false }) {
  const unit = Math.min(width, height);
  const font = Math.round(unit * 0.045);
  const slabTop = 0.3 + ((variant * 0.13) % 0.4);
  const tilt = variant % 2 === 0 ? 0.22 : -0.22;
  const y1 = height * (slabTop + tilt / 2);
  const y2 = height * (slabTop - tilt / 2);
  const thickness = height * (0.16 + (variant % 3) * 0.05);
  // Hero images carry the label at the top: the bottom is covered by the page content.
  const labelY = labelTop ? unit * 0.1 : height - unit * 0.12;
  const lines = Array.from({ length: 5 }, (_, i) => {
    const offset = thickness + (i + 1) * unit * 0.035;
    return `<line x1="0" y1="${y1 + offset}" x2="${width}" y2="${y2 + offset}" stroke="${VOLT}" stroke-opacity="${0.5 - i * 0.09}" stroke-width="${Math.max(1, unit * 0.0025)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NIGHT_2}"/><stop offset="1" stop-color="${NIGHT}"/>
    </linearGradient>
    <linearGradient id="slab" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${RED}"/><stop offset="1" stop-color="${RED_DEEP}"/>
    </linearGradient>
    <radialGradient id="spot" cx="${variant % 2 === 0 ? 0.75 : 0.25}" cy="0.15" r="0.8">
      <stop offset="0" stop-color="${VOLT}" stop-opacity="0.22"/><stop offset="1" stop-color="${VOLT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#spot)"/>
  <polygon points="0,${y1} ${width},${y2} ${width},${y2 + thickness} 0,${y1 + thickness}" fill="url(#slab)" opacity="0.9"/>
  ${lines}
  <g font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="${BONE}">
    <text x="${unit * 0.06}" y="${labelY}" font-size="${font}" letter-spacing="${font * 0.12}">PLACEHOLDER</text>
    <text x="${unit * 0.06}" y="${labelY + unit * 0.06}" font-size="${font * 0.7}" font-weight="400" opacity="0.85">${label} · ${ratio}</text>
  </g>
</svg>`;
}

async function jpeg(path, spec) {
  await mkdir(dirname(out(path)), { recursive: true });
  await sharp(Buffer.from(artwork(spec))).jpeg({ quality: 82, mozjpeg: true }).toFile(out(path));
}

const images = [
  ['src/assets/placeholders/hero-mobile.jpg', { width: 1080, height: 1920, label: 'Foto live hero (mobile)', ratio: '9:16', variant: 0, labelTop: true }],
  ['src/assets/placeholders/hero-desktop.jpg', { width: 2400, height: 1350, label: 'Foto live hero (desktop)', ratio: '16:9', variant: 1, labelTop: true }],
  ['src/assets/placeholders/booking.jpg', { width: 1800, height: 1200, label: 'Foto locale pieno', ratio: '3:2', variant: 2 }],
  ['src/assets/placeholders/band.jpg', { width: 1800, height: 1200, label: 'Foto di gruppo', ratio: '3:2', variant: 3 }],
  ['src/assets/placeholders/video-poster.jpg', { width: 1280, height: 720, label: 'Copertina video', ratio: '16:9', variant: 4 }],
  ...Array.from({ length: 5 }, (_, i) => [
    `src/assets/placeholders/member-${i + 1}.jpg`,
    { width: 1200, height: 1500, label: `Ritratto membro ${i + 1}`, ratio: '4:5', variant: i },
  ]),
  ...Array.from({ length: 6 }, (_, i) => [
    `src/assets/placeholders/gallery-${i + 1}.jpg`,
    { width: 1800, height: 1200, label: `Foto live ${i + 1}`, ratio: '3:2', variant: i + 2 },
  ]),
  ...Array.from({ length: 4 }, (_, i) => [
    `src/assets/placeholders/social-${i + 1}.jpg`,
    { width: 1080, height: 1080, label: `Foto social ${i + 1}`, ratio: '1:1', variant: i + 1 },
  ]),
];

/** Monochrome noise tile with low alpha, repeated in CSS as film grain. */
async function grain(path, size = 160) {
  const data = Buffer.alloc(size * size * 4);
  let seed = 20261031;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let i = 0; i < size * size; i += 1) {
    const value = Math.round(random() * 255);
    data.set([value, value, value, Math.round(random() * 150)], i * 4);
  }
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png({ palette: true, colours: 32 })
    .toFile(out(path));
}


/** Minimal single-page PDF, written by hand to avoid a PDF dependency. */
function pdf(lines) {
  const text = lines
    .map(([size, content], i) => `BT /F1 ${size} Tf 56 ${760 - i * 34} Td (${content}) Tj ET`)
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = objects.map((object, i) => {
    const offset = body.length;
    body += `${i + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return body;
}

await Promise.all(images.map(([path, spec]) => jpeg(path, spec)));
await grain('public/grain.png');
// Favicon, touch icon and link preview come from the logo: see scripts/build-logo.mjs.
await writeFile(
  out('public/docs/scheda-tecnica-thundra.pdf'),
  pdf([
    [26, 'Thundra - AC/DC Tribute Band'],
    [18, 'Scheda tecnica'],
    [13, '[DA COMPILARE] Documento segnaposto.'],
    [13, 'Sostituire questo file con la scheda tecnica reale.'],
  ]),
);

console.log(`Generated ${images.length} images, grain and PDF.`);
