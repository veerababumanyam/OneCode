#!/usr/bin/env node
// Checks every relative Markdown link and #anchor in the repository's own docs.
// Usage: node scripts/check-doc-links.mjs   (exit 1 when a link or anchor is broken)
// Skips node_modules, dist, graft caches, and external URLs; no network access.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set(["node_modules", "dist", "target", ".git", "graft", "old-ref-docs"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// GitHub-style heading slugs, with -1, -2 suffixes for duplicates.
function anchorsOf(file) {
  const seen = new Map();
  const anchors = new Set();
  let inFence = false;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const match = !inFence && /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const base = match[1].replace(/<[^>]+>/g, "").replace(/`/g, "").toLowerCase().trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count ? `${base}-${count}` : base);
  }
  return anchors;
}

const cache = new Map();
const anchors = (file) => cache.get(file) ?? cache.set(file, anchorsOf(file)).get(file);
const problems = [];

for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:, etc.
    const [rawPath, anchor] = target.split("#");
    const resolved = rawPath ? path.resolve(path.dirname(file), decodeURIComponent(rawPath)) : file;
    const where = `${path.relative(root, file)} -> ${target}`;
    if (!fs.existsSync(resolved)) { problems.push(`missing file: ${where}`); continue; }
    if (anchor && resolved.endsWith(".md") && !anchors(resolved).has(anchor.toLowerCase())) {
      problems.push(`missing anchor: ${where}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`${problems.length} broken link(s)`);
  process.exit(1);
}
console.log("All relative links and anchors resolve.");
