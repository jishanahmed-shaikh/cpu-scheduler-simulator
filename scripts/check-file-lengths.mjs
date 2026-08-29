#!/usr/bin/env node
// Fails if any manually authored source file exceeds the 169-line limit.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const LIMIT = 169;
const ROOTS = ['src', 'scripts'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git']);

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTS.has(extname(entry))) out.push(full);
  }
  return out;
}

const offenders = [];
for (const root of ROOTS) {
  let files = [];
  try {
    files = walk(root);
  } catch {
    continue;
  }
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n').length;
    if (lines > LIMIT) offenders.push({ file, lines });
  }
}

if (offenders.length > 0) {
  console.error(`Files exceeding ${LIMIT} lines:`);
  for (const o of offenders) console.error(`  ${o.file}: ${o.lines}`);
  process.exit(1);
}

console.log(`All source files within ${LIMIT}-line limit.`);
