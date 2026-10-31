---
name: add-dependency
description: Evaluate and admit a third-party package, crate, vendored asset, or copied code into OneCode under docs/DEPENDENCY-POLICY.md, preferring maintained open-source reuse over custom code. Use before adding anything to package.json, Cargo.toml, or a vendor folder.
---
# Admit a dependency

1. **Need.** Name the requirement (`FR-nn`, TRD section, or ADR) the dependency serves. If none exists, stop and say so.
2. **Reuse check.** Search the existing manifests and `docs/TECH-STACK.md`. If the standard library or an existing dependency covers it, use that and stop. Never add a second library for the same job.
3. **Candidates.** Evaluate the TECH-STACK candidate first, plus at least one alternative when the choice has system reach. Include "write it ourselves" only if no candidate meets the requirement.
4. **Evaluate** each candidate against docs/DEPENDENCY-POLICY.md §2, using primary sources (the registry page, the repository, the advisory databases):
   - newest stable, non-yanked version, published at least 14 days ago, with no open advisory (RustSec, GitHub Advisory Database, OSV);
   - license on the allowlist, including transitive dependencies;
   - maintenance (recent release, responsive security handling), footprint, platform support on Windows, macOS, and Linux, toolchain/MSRV and peer compatibility, install scripts, and native binaries.
5. **Decide.** If it has system reach or adds a trust boundary, draft an ADR with the `new-adr` skill instead of adding it directly.
6. **Add it.** npm: exact version, `npm install <pkg>@<version> --save-exact`, commit the lockfile change. Cargo: add to `Cargo.toml`, let Cargo update `Cargo.lock`. Do not hand-edit lockfiles.
7. **Record.** Write the one-paragraph justification for the PR (requirement, alternatives, version, license, advisories, maintenance, size, platforms, isolation) and update `docs/TECH-STACK.md` with the dated version.
8. **Verify** with the project's checks (`npm run build` or `cargo check` and `cargo deny check` once configured) and report the commands and results.
