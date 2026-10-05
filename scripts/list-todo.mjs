// Lists every placeholder still to be filled in, as file:line.
// Looks for the markers [DA COMPILARE] and [VERIFICARE ...] in config and content.
// Run with `bun run todo`. Exit code is always 0: placeholders are not build errors.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FOLDERS = ['src/config', 'src/content'];
const MARKER = /\[(DA COMPILARE|VERIFICARE)[^\]]*\]/;
// Lines that define or render the marker itself are not placeholders.
const IGNORE = /export const TODO|marker and is listed/;

async function* walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ts|ya?ml|md|json)$/.test(entry.name)) yield path;
  }
}

let count = 0;
for (const folder of FOLDERS) {
  for await (const file of walk(join(root, folder))) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      if (!MARKER.test(line) || IGNORE.test(line)) return;
      count += 1;
      console.log(`${relative(root, file)}:${index + 1}  ${line.trim()}`);
    });
  }
}
console.log(`\n${count} placeholder da compilare o verificare.`);
