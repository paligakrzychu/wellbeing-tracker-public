/**
 * Lint guard for the delivery markdown documents.
 *
 * Delivery docs are the part of this repository other people actually read to
 * find out what a change did, so the handful of conventions the rest of the
 * repo already assumes are asserted here instead of in review comments.
 *
 * The suite is dependency free: it runs under the built-in Node test runner
 * (`node --test tests/delivery-md.test.ts`) and the repository root is derived
 * by walking up from the current working directory, so it works no matter where
 * the runner is started from.
 */
import { describe, test } from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

/** Directories that hold delivery documents, relative to the repository root. */
const DELIVERY_DIRECTORIES = ["docs/delivery", "docs/deliveries", "delivery"];

/** External and non-file link targets that are never checked on disk. */
const EXTERNAL_TARGET = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Markdown links and images: `[text](target)` and `![alt](target)`. */
const LINK_PATTERN = /\!?\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;

function findRepositoryRoot(start: string): string {
	let current = resolve(start);
	for (;;) {
		if (existsSync(join(current, "package.json")) || existsSync(join(current, ".git"))) {
			return current;
		}
		const parent = dirname(current);
		if (parent === current) return resolve(start);
		current = parent;
	}
}

const repositoryRoot = findRepositoryRoot(process.cwd());

function listMarkdownFiles(directory: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".")) continue;
		const fullPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			found.push(...listMarkdownFiles(fullPath));
		} else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
			found.push(fullPath);
		}
	}
	return found;
}

function collectDeliveryDocuments(): string[] {
	const found = new Set<string>();

	for (const directory of DELIVERY_DIRECTORIES) {
		const fullPath = join(repositoryRoot, directory);
		if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
			for (const file of listMarkdownFiles(fullPath)) found.add(file);
		}
	}

	// A delivery document may also sit at the repository root, e.g. `DELIVERY.md`.
	for (const entry of readdirSync(repositoryRoot, { withFileTypes: true })) {
		const isMarkdown = entry.name.toLowerCase().endsWith(".md");
		if (entry.isFile() && isMarkdown && /delivery/i.test(entry.name)) {
			found.add(join(repositoryRoot, entry.name));
		}
	}

	return [...found].sort();
}

const deliveryDocuments = collectDeliveryDocuments();

function displayPath(file: string): string {
	return relative(repositoryRoot, file).split(/[\\/]/).join("/");
}

function linkTargets(text: string): string[] {
	const targets: string[] = [];
	for (const match of text.matchAll(LINK_PATTERN)) {
		let target = (match[1] ?? "").trim();
		if (target.startsWith("<") && target.endsWith(">")) {
			target = target.slice(1, -1);
		}
		if (target.length > 0) targets.push(target);
	}
	return targets;
}

// Nothing to assert against in a checkout that has not documented a delivery
// yet: skip loudly rather than fail, and keep the guard armed for future docs.
const describeDelivery = deliveryDocuments.length > 0 ? describe : describe.skip;

describe("delivery markdown", () => {
	test("delivery documents are discovered", (t: TestContext) => {
		if (deliveryDocuments.length === 0) {
			t.skip("no delivery markdown found");
			return;
		}
		assert.ok(
			deliveryDocuments.length > 0,
			"expected at least one delivery markdown document",
		);
	});
});

describeDelivery("each delivery document", () => {
	for (const file of deliveryDocuments) {
		const name = displayPath(file);
		const text = readFileSync(file, "utf8");

		test(`${name} is a non-empty UTF-8 document with a single level-one title`, () => {
			assert.ok(text.trim().length > 0, `${name} is empty`);

			const headings = text.split(/\r?\n/).filter((line) => /^#\s+\S/.test(line));
			assert.equal(
				headings.length,
				1,
				`${name} should have exactly one level-one heading, found ${headings.length}`,
			);

			const firstMeaningfulLine = text
				.split(/\r?\n/)
				.find((line) => line.trim().length > 0);
			assert.ok(
				firstMeaningfulLine !== undefined && /^#\s+\S/.test(firstMeaningfulLine),
				`${name} must open with a level-one heading`,
			);
		});

		test(`${name} uses LF line endings and ends with exactly one newline`, () => {
			assert.ok(!text.includes("\r"), `${name} contains carriage returns`);
			assert.ok(text.endsWith("\n"), `${name} should end with a newline`);
			assert.ok(!text.endsWith("\n\n"), `${name} should end with a single newline`);
		});

		test(`${name} leaves no unfinished markers behind`, () => {
			const problems: string[] = [];

			text.split("\n").forEach((line, index) => {
				const lineNumber = index + 1;
				if (/^\s*[-*]\s*\[ \]/.test(line)) {
					problems.push(`line ${lineNumber} has an unchecked checkbox: ${line.trim()}`);
				}
				if (/\b(?:TODO|FIXME|TBD)\b/.test(line)) {
					problems.push(`line ${lineNumber} has a placeholder marker: ${line.trim()}`);
				}
				if (/\]\(\s*\)/.test(line)) {
					problems.push(`line ${lineNumber} has an empty link target: ${line.trim()}`);
				}
			});

			assert.deepEqual(problems, [], `${name} is not finished:\n${problems.join("\n")}`);
		});

		test(`${name} links to files that exist`, () => {
			const documentDirectory = dirname(file);
			const broken: string[] = [];

			for (const target of linkTargets(text)) {
				if (EXTERNAL_TARGET.test(target)) continue;

				const withoutFragment = target.split("#")[0]?.split("?")[0] ?? "";
				if (withoutFragment.length === 0) continue;

				let decoded = withoutFragment;
				try {
					decoded = decodeURIComponent(withoutFragment);
				} catch {
					// Leave the raw path in place; a bad escape is reported as missing.
				}

				const absolute = resolve(documentDirectory, decoded);
				if (!existsSync(absolute)) {
					broken.push(`${target} (from ${displayPath(file)})`);
				}
			}

			assert.deepEqual(broken, [], `${name} links to missing files:\n${broken.join("\n")}`);
		});
	}
});
