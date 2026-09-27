/**
 * WELLBEINGT-18 - static checks for the repository `.gitignore`.
 *
 * These tests deliberately avoid invoking `git`; they statically inspect the
 * `.gitignore` file at the repository root so that the locations every
 * JavaScript/TypeScript project must keep out of version control
 * (installed dependencies, build output, coverage results, local environment
 * files, logs, and editor/OS artifacts) remain covered by configuration.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

// tests/unit/<file>.test.ts -> repository root is two levels up.
const repoRoot = resolve(testDir, '..', '..');
const gitignorePath = join(repoRoot, '.gitignore');

/**
 * Effective ignore patterns of the `.gitignore`:
 * non-empty, non-comment lines, with surrounding whitespace trimmed.
 */
function readEffectiveGitignorePatterns(): string[] {
  return readFileSync(gitignorePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/**
 * True when at least one effective pattern contains any of the given
 * needles (case-insensitive), so entries like `node_modules/`, `/node_modules`
 * or `.DS_Store` are all recognised.
 */
function ignoresAny(
  patterns: readonly string[],
  needles: readonly string[],
): boolean {
  return patterns.some((pattern) =>
    needles.some((needle) => pattern.toLowerCase().includes(needle.toLowerCase())),
  );
}

describe('wellbeingt-18: repository .gitignore (static)', () => {
  it('exists at the repository root and is not empty', () => {
    const contents = readFileSync(gitignorePath, 'utf8');
    expect(contents.trim().length).toBeGreaterThan(0);
  });

  it('contains at least one effective ignore pattern', () => {
    expect(readEffectiveGitignorePatterns().length).toBeGreaterThan(0);
  });

  it('ignores installed dependencies (node_modules)', () => {
    expect(
      ignoresAny(readEffectiveGitignorePatterns(), ['node_modules']),
    ).toBe(true);
  });

  it('ignores build output (dist/build/out/lib)', () => {
    expect(
      ignoresAny(readEffectiveGitignorePatterns(), [
        'dist',
        'build',
        'out/',
        '/out',
        'lib',
      ]),
    ).toBe(true);
  });

  it('ignores test coverage output', () => {
    expect(
      ignoresAny(readEffectiveGitignorePatterns(), [
        'coverage',
        'nyc_output',
        'htmlcov',
      ]),
    ).toBe(true);
  });

  it('ignores local environment files (.env)', () => {
    expect(ignoresAny(readEffectiveGitignorePatterns(), ['.env'])).toBe(true);
  });

  it('ignores logs', () => {
    expect(ignoresAny(readEffectiveGitignorePatterns(), ['log'])).toBe(true);
  });

  it('ignores editor and OS artifacts', () => {
    expect(
      ignoresAny(readEffectiveGitignorePatterns(), [
        '.ds_store',
        'thumbs.db',
        '.idea',
        '.vscode',
      ]),
    ).toBe(true);
  });

  it('does not ignore the .gitignore file itself', () => {
    expect(
      ignoresAny(readEffectiveGitignorePatterns(), ['.gitignore']),
    ).toBe(false);
  });
});
