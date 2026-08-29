import { describe, expect, it } from 'vitest';

// Load every core source file as raw text at build time (Vite feature).
const coreFiles = import.meta.glob('../../core/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FORBIDDEN: Array<[string, RegExp]> = [
  ['react import', /from\s+['"]react/],
  ['react-dom import', /from\s+['"]react-dom/],
  ['window global', /\bwindow\./],
  ['document global', /\bdocument\./],
  ['localStorage', /\blocalStorage\b/],
  ['Math.random', /Math\.random\s*\(/],
];

describe('src/core has no browser, React, or non-deterministic dependencies', () => {
  const entries = Object.entries(coreFiles);

  it('finds core source files to scan', () => {
    expect(entries.length).toBeGreaterThan(5);
  });

  for (const [label, pattern] of FORBIDDEN) {
    it(`contains no ${label}`, () => {
      const offenders = entries.filter(([, src]) => pattern.test(src)).map(([path]) => path);
      expect(offenders).toEqual([]);
    });
  }
});
