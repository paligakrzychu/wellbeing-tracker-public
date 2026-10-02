// The typecheck step of this repository's own workflow, asserted by this repository's own suite.
//
// There is nothing to build here and nothing to mock. The file under test is the file the
// repository ships, and the only question worth asking of it is whether it still runs the steps a
// delivery run needs a verdict from. A missing typecheck is not a failure anybody sees at the
// time it happens: it is a delivery that opens a pull request, finds nothing to read, and stops,
// and the record then blames the dependencies for a step that was never there.
//
// The reading below is text, and it is text on purpose. It is not a YAML parser and does not
// pretend to be one — what it has to notice is a `run:` that is a live key rather than a line
// inside a comment, and that is a question about characters, not about the document. It also
// survives a reindent, because nothing in it counts spaces.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Two directories up from `tests/unit/` is the root, and the workflow is where every repository
// keeps it. Resolved from this file rather than from `process.cwd()`, so the suite says the same
// thing whichever directory it was started in.
const workflowPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '.github/workflows/ci.yml',
);

const readWorkflow = (): string => readFileSync(workflowPath, 'utf8');

/** The commands the workflow runs, in the order the file holds them. */
const runCommands = (source: string): string[] =>
  source.split('\n').flatMap((line) => {
    const run = /^\s*run:\s*(\S.*?)\s*$/.exec(line);
    return run === null ? [] : [run[1] as string];
  });

/** Anything that asks a compiler for types: `tsc` under any runner, or a `typecheck` script. */
const isTypecheck = (command: string): boolean =>
  /(^|[\s/])tsc([\s]|$)/.test(command) || command.includes('typecheck');

describe('the typecheck step of the repository workflow', () => {
  it('runs a typecheck, and says which one', () => {
    // Not "at least one": a second, different typecheck later in the file is a second answer to
    // the same question, and the run that reads this workflow has no way to choose between them.
    expect(runCommands(readWorkflow()).filter(isTypecheck)).toEqual(['npx tsc --noEmit']);
  });

  it('names the step, so a red run says what it was that failed', () => {
    expect(readWorkflow()).toMatch(/^\s*- name:.*typecheck.*$/m);
  });

  it('still installs with npm ci and still runs the suite with npm test', () => {
    // The step added for a typecheck is not the step that keeps the suite running. A typecheck
    // that quietly replaced `npm test` would make this file pass its own test and stop being a
    // verdict about anything.
    const commands = runCommands(readWorkflow());

    expect(commands).toContain('npm ci');
    expect(commands).toContain('npm test');
  });
});
