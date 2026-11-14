#!/usr/bin/env node
/**
 * Swap the active deck content for one of the bundled example decks.
 *   npm run use-example -- --list
 *   npm run use-example -- travel-hoi-an
 * Copies examples/<name>/{slides,notes,sources,theme}.ts → src/content/ after backing the current
 * content up to .content-backup/<timestamp>/. Examples are references for structure and art direction
 * across topics — start from the closest one, then replace its content with the user's.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const name = process.argv.slice(2).find((a) => !a.startsWith('--'));
const list = readdirSync('examples', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

if (!name || process.argv.includes('--list')) {
  console.log('Examples:');
  for (const n of list) {
    const s = readFileSync(join('examples', n, 'slides.ts'), 'utf8');
    const title = (s.match(/title:\s*'([^']+)'/) || [])[1] ?? '';
    const lang = (s.match(/lang:\s*'(\w+)'/) || [])[1] ?? 'vi';
    const th = (readFileSync(join('examples', n, 'theme.ts'), 'utf8').match(/preset\('(\w+)'/) || [])[1] ?? '';
    console.log(`  ${n.padEnd(20)} ${lang}  ${th.padEnd(11)} ${title}`);
  }
  console.log('\nUsage: npm run use-example -- <name>');
  process.exit(name ? 0 : 1);
}
if (!list.includes(name)) {
  console.error(`Unknown example "${name}". Available: ${list.join(', ')}`);
  process.exit(1);
}
const backup = join('.content-backup', new Date().toISOString().replace(/[:.]/g, '-'));
mkdirSync(backup, { recursive: true });
for (const f of ['slides.ts', 'notes.ts', 'sources.ts', 'theme.ts', 'brief.ts', 'theatre-state.json']) {
  if (existsSync(join('src/content', f))) cpSync(join('src/content', f), join(backup, f));
  if (existsSync(join('examples', name, f))) cpSync(join('examples', name, f), join('src/content', f));
}
console.log(`✔ src/content ← examples/${name}  (previous content saved in ${backup})`);
