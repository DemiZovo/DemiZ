import { access, readdir, readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const dist = 'dist';
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '') || '';
const textFiles = [];
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else {
      if (/\.(?:html|xml|json|css|js|map)$/i.test(entry.name)) textFiles.push(path);
      if (/\.html$/i.test(entry.name)) htmlFiles.push(path);
    }
  }
}
await walk(dist);

const failures = [];
const forbidden = [/localhost(?=[:/])/i, /file:\/\//i, /[A-Z]:\\Users\\/i, /\/home\/[^/]+\//];
const draftMarkers = ['draft-verification-marker', 'DRAFT_ONLY_TEST_MARKER'];

for (const file of textFiles) {
  const contents = await readFile(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(contents)) failures.push(`${file}: development path ${pattern}`);
  for (const marker of draftMarkers) if (contents.includes(marker)) failures.push(`${file}: leaked draft marker ${marker}`);
  if (contents.includes('\uFFFD')) failures.push(`${file}: replacement character indicates broken encoding`);
}

function localTarget(raw) {
  if (!raw || /^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(raw)) return null;
  const clean = decodeURIComponent(raw.split(/[?#]/)[0]);
  if (!clean.startsWith('/')) return null;
  if (base && clean !== base && !clean.startsWith(`${base}/`)) {
    failures.push(`root-relative URL misses BASE_PATH: ${raw}`);
    return null;
  }
  return clean.slice(base.length) || '/';
}

for (const file of htmlFiles) {
  const contents = await readFile(file, 'utf8');
  for (const match of contents.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = localTarget(match[1]);
    if (!target) continue;
    let output = join(dist, target.replace(/^\//, ''));
    if (!extname(output)) output = join(output, 'index.html');
    try { await access(normalize(output)); }
    catch { failures.push(`${file}: missing local target ${match[1]} -> ${output}`); }
  }
}

for (const required of ['index.html', '404.html', 'about/index.html', 'guestbook/index.html', 'privacy/index.html', 'search/index.html', 'rss.xml', 'search-index.json', 'sitemap-index.xml']) {
  try { await access(join(dist, required)); }
  catch { failures.push(`missing required output: ${required}`); }
}

if (failures.length) {
  console.error(`Build verification failed:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`Verified ${textFiles.length} generated files, draft isolation, base paths and local targets.`);
