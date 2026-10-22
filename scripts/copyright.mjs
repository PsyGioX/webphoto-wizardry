#!/usr/bin/env node

/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

/**
 * Adds a copyright header to every source file that does not have one yet.
 * Safe to run repeatedly:  npm run copyright
 * Change OWNER / YEAR below to update new headers (existing ones are left alone).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const OWNER = 'PsyGioX';
const PROFILE_URL = 'https://github.com/PsyGioX';
const YEAR = 2026;
const MARKER = `© ${YEAR} ${OWNER}`;

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);

const lines = (extra) => [`PhotoWizard`, `${MARKER} (${PROFILE_URL}). All rights reserved.`, ...(extra ? [extra] : [])];
const block = (extra) => `/**\n${lines(extra).map((l) => ` * ${l}`).join('\n')}\n */\n\n`;
const hash = (extra) => `${lines(extra).map((l) => `# ${l}`).join('\n')}\n\n`;
const html = (extra) => `<!--\n${lines(extra).map((l) => `  ${l}`).join('\n')}\n-->\n`;

function header(file) {
  const rel = relative(root, file).split(sep).join('/');
  const extra = rel.startsWith('src/components/ui/') ? 'Based on shadcn/ui (MIT License).' : '';
  switch (extname(file)) {
    case '.ts':
    case '.tsx':
    case '.js':
    case '.mjs':
    case '.css':
      return { text: block(extra), mode: 'top' };
    case '.yml':
    case '.yaml':
      return { text: hash(extra), mode: 'top' };
    case '.html':
      return { text: html(extra), mode: 'after-doctype' };
    case '.svg':
      return { text: html(extra), mode: 'top' };
    default:
      return null;
  }
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

let changed = 0;
for (const file of walk(root)) {
  if (file.endsWith('.d.ts')) continue;
  const h = header(file);
  if (!h) continue;
  const source = readFileSync(file, 'utf8');
  if (source.split('\n').slice(0, 12).join('\n').includes(MARKER)) continue;

  let next;
  // Keep a leading #! line or vitest/eslint pragma comment above the header.
  const pragma = source.match(/^(#!.*\n|\/\/ @vitest-environment.*\n)/);
  if (h.mode === 'after-doctype') {
    const m = source.match(/^(<!DOCTYPE[^>]*>\s*\n?)/i);
    next = m ? m[1] + h.text + source.slice(m[1].length) : h.text + source;
  } else if (pragma) {
    next = pragma[1] + '\n' + h.text + source.slice(pragma[1].length);
  } else {
    next = h.text + source;
  }
  writeFileSync(file, next);
  changed++;
  console.log('header added:', relative(root, file));
}
console.log(`${changed} file(s) updated`);
