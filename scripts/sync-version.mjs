#!/usr/bin/env node
// The root VERSION file is the single source of truth for the OneCode version.
// Manifests below mirror it; they are generated, never hand-edited.
// Usage:
//   node scripts/sync-version.mjs          write VERSION into every managed manifest
//   node scripts/sync-version.mjs --check  exit 1 when a manifest disagrees with VERSION
// No dependencies, no network access. Add a new manifest to `targets` when it appears.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

// Semantic version, per engineering standards §11. Prerelease and build metadata allowed.
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9a-zA-Z.-]+)?(?:\+[0-9a-zA-Z.-]+)?$/;

// JSON manifests carrying the version at the top-level `version` key.
const targets = [
  "apps/desktop/package.json",
  "docs/design/onecode-experience/package.json",
];

const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
if (!SEMVER.test(version)) {
  console.error(`VERSION must be a semantic version, got ${JSON.stringify(version)}`);
  process.exit(1);
}

const problems = [];
for (const rel of targets) {
  const file = path.join(root, rel);
  const raw = fs.readFileSync(file, "utf8");
  const current = JSON.parse(raw).version;
  if (current === version) continue;
  if (check) {
    problems.push(`${rel}: ${current} != VERSION ${version}`);
    continue;
  }
  // Replace the first `"version": "..."` only, so indentation, key order and line endings survive.
  const updated = raw.replace(/^([ \t]*"version"[ \t]*:[ \t]*")([^"]*)(")/m, `$1${version}$3`);
  if (JSON.parse(updated).version !== version) {
    problems.push(`${rel}: could not rewrite the top-level "version" key`);
    continue;
  }
  fs.writeFileSync(file, updated);
  console.log(`${rel}: ${current} -> ${version}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(
    `${problems.length} manifest(s) out of sync with VERSION. Run: node scripts/sync-version.mjs`,
  );
  process.exit(1);
}
if (check) console.log(`All ${targets.length} manifests match VERSION ${version}.`);
