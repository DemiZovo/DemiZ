import { copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const sourceRoot = 'dist';
const targetRoot = 'writer-worker/public';
const htmlPath = join(sourceRoot, 'write', 'index.html');
const html = await readFile(htmlPath, 'utf8');

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });
await copyFile(htmlPath, join(targetRoot, 'index.html'));

const assets = new Set([...html.matchAll(/(?:href|src)=["'](\/_astro\/[^"']+)["']/g)].map((match) => match[1]));
for (const asset of assets) {
  const relative = asset.replace(/^\//, '');
  await mkdir(dirname(join(targetRoot, relative)), { recursive: true });
  await copyFile(join(sourceRoot, relative), join(targetRoot, relative));
}

await rm(join(sourceRoot, 'write'), { recursive: true, force: true });

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

const publicHtml = await Promise.all((await htmlFiles(sourceRoot)).map((path) => readFile(path, 'utf8')));
let privateOnlyAssets = 0;
for (const asset of assets) {
  if (publicHtml.some((contents) => contents.includes(asset))) continue;
  await rm(join(sourceRoot, asset.replace(/^\//, '')), { force: true });
  privateOnlyAssets++;
}

console.log(`Prepared private writer with ${assets.size} assets; removed /write and ${privateOnlyAssets} private-only assets from public Pages output.`);
