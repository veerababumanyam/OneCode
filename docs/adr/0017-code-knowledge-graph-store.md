# ADR-0017: Persist the code knowledge graph in LadybugDB

**Status:** Proposed  
**Date:** 2026-11-06  
**Deciders:** Product owner (requested graph-store direction); architecture proposal pending acceptance  
**Affects:** PRD FR-01–FR-07, FR-36–FR-45, FR-114–FR-117; TRD §5.5, §10, §17; agent rule R-39; ADR-0005, ADR-0006  
**Revisit trigger:** LadybugDB cannot build or meet the indexing/query budgets on any supported OS, its maintenance or license posture no longer meets the dependency policy, or benchmarks show SQLite graph tables meet the graph workload with materially lower operational cost.

## Context

The code knowledge graph in [TRD §5.5](../TRD.md#55-code-knowledge-graph-and-agent-navigation) contains provenance-labeled nodes and edges, communities, and repository-map layers. Its query and incremental-update requirements are distinct from relational task state and keyword search. [ADR-0005](./0005-storage-engine.md) accepted SQLite for state and index storage, including graph records; this decision revises that ADR only for graph-owned records.

KuzuDB was archived at v0.11.3. Its maintained successor, [LadybugDB](https://github.com/LadybugDB/ladybug), describes itself as the former Kuzu project and publishes the Rust binding [`lbug`](https://crates.io/crates/lbug). As of 2026-11-06, `lbug` 0.22.1 had not met the 14-day cool-down in the [dependency policy](../DEPENDENCY-POLICY.md#4-latest-safe-versions); 0.21.1 is the newest stable release that had. The database is a native dependency, so Windows, macOS, Linux, packaging, security, and workload evidence remain adoption gates.

## Decision

Propose LadybugDB, accessed through `lbug` 0.21.1, as the authoritative local store for graph nodes, edges, communities, and repository-map layers. SQLite remains the store for relational state and lexical index data; `sqlite-vec` is optional only if [ADR-0006](./README.md) selects SQLite for vector search. Upon acceptance, this decision will supersede ADR-0005 only for the graph-owned records above; user-authored note bodies and other transactional state remain in SQLite.

The graph remains local, rebuildable, and outside the target repository. Do not load or download database extensions at runtime. Graph data carries the parser, graph-schema, and embedding revisions needed to detect stale results; graph queries remain behind the existing repository-index interface. Graph schema versioning, community detection, and repository-map ranking remain open.

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| SQLite graph tables | Keep nodes, edges, and traversal in the accepted SQLite index database | Preserves a single index engine, but does not provide the property-graph query model requested for the traversal-heavy graph operations; retain as a rollback option and benchmark baseline. |
| PostgreSQL with Apache AGE or recursive CTEs | Use one server database for graph, vector, lexical, and relational workloads | Adds a server/runtime and weakens the local-first, embedded deployment target; remains a separate future team/server option. |
| Build a custom graph store | Implement storage, traversal, and indexing in OneCode | Reimplements a commodity database and increases correctness, migration, and maintenance risk. |

## Consequences

- **Positive:** gives graph queries a property-graph model and keeps graph data separate from durable transactional state; the graph can be deleted and rebuilt without losing user data.
- **Negative and mitigations:** adds a native database, build payload, and a second local data store. Keep cross-store references by stable IDs, keep writes to rebuildable indexes, and test recovery from partial updates. Use the latest-safe binding rather than the release inside the cool-down.
- **Platform differences and documented exceptions:** no platform exception is approved. Verify native builds, packaging, file permissions, and behavior on Windows, macOS, and Linux before adoption.
- **Migration or rollback path:** existing SQLite graph rows are derived index data and can be rebuilt in LadybugDB from the source scan and parse pipeline. If LadybugDB is removed, rebuild graph tables in the SQLite index store; durable state and user-written notes do not move.

## Threat model

| Asset | Entry point | Trust level of input | Abuse case | Mitigation | Test |
|---|---|---|---|---|---|
| Graph index and repository-derived metadata | Parser/index writer and graph queries | Repository content and paths are untrusted | Crafted or oversized repository data exhausts resources, corrupts the rebuildable index, or alters graph results | Apply the existing scan exclusions and size limits; validate graph identifiers; parameterize values; bound query and indexing work; keep the database under application data; rebuild on integrity failure | Malformed and oversized repository fixtures, query-bound tests, corrupt-index recovery on each OS |
| Local graph database | Database open and native `lbug` code | Local files may be corrupted or replaced by another process running as the same user | Native parser crash or database file access outside the index directory | Resolve symlinks before checking containment; require a race-resistant open relative to a trusted directory handle with no-follow semantics where supported. If the `lbug` API cannot provide safe containment, fail closed and keep this ADR Proposed. Avoid dynamic extension loading and network access; treat graph data as rebuildable rather than authoritative user state. | Static and mid-open symlink replacement tests, corruption recovery, and offline-operation tests on each OS |

## Verification

Before marking this ADR Accepted, run native build and graph read/write tests on Windows, macOS, and Linux; verify that provenance, revision, staleness, and coverage survive persistence; test incremental updates and corrupt-index rebuilds; and benchmark graph queries and re-index work against the budgets in [TRD §14.2](../TRD.md#142-test-data-and-evaluation). Record dependency license, advisory, binary-size, and platform evidence with the implementation.
