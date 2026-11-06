# ADR-0005: Store state in SQLite with SQLCipher-encrypted state, a rebuildable index database, and encrypted content-addressed artifacts

**Status:** Accepted  
**Date:** 2026-10-31  
**Deciders:** Architect, by delegation from the product owner  
**Affects:** PRD FR-23, FR-24, FR-31, FR-37, FR-38, FR-64; TRD §5.2, §5.5.2, §6.7, §10, §12; agent rules R-14, R-30, R-31, R-35; ADR-0002, ADR-0006, ADR-0017  
**Revisit trigger:** index queries or writes miss the re-index or graph-query budgets (engineering standards §12) on the large-repository fixture after tuning; SQLCipher becomes unmaintained or cannot be built for a supported OS; or a requirement for multi-device sync.

## Context

TRD §10 lists the data domains and requires transactional task state, artifacts by reference with integrity hashes, encryption of sensitive local data where the platform supports it, export and deletion, revision-keyed indexes, and nothing written into the target repository. ADR-0002 gives each data directory exactly one owning process, so the store does not need to coordinate writers across processes. The vector index (ADR-0006) and the code graph (ADR-0017) must fit the same store or sit beside it.

The data splits into two kinds with different needs. **State** (sessions, tasks, approvals, audit, memory, settings provenance) is user content that cannot be rebuilt and may contain sensitive material even after redaction. **Index** data (symbols, graph, embeddings) is derived from a repository that is already on disk in plaintext and can be rebuilt at any time; it is large and write-heavy.

## Decision

Use **SQLite** everywhere, accessed through **rusqlite** (0.41 line, with its bundled SQLite build), in three stores under the OS application-data directory (located with the `directories` crate), never in the repository:

| Store | Path (under the data directory) | Contents | Encryption |
|---|---|---|---|
| State database | `state/state.db` | Sessions, turns, tasks, plans, approvals and `PermissionDecision`s, audit records, memory and user notes, model catalog metadata, process records | **SQLCipher** (rusqlite `bundled-sqlcipher` with a vendored crypto backend), 256-bit random key |
| Index databases | `index/<repository-id>.db`, one per repository | File hashes, symbols, graph nodes and edges, communities, repository-map layers, embeddings (ADR-0006, ADR-0017) | None; file is user-only, rebuildable, and mirrors plaintext already on disk |
| Artifacts | `artifacts/<sha256>` | Large outputs, captures, screenshots, evidence blobs referenced by hash from the state database | Per-file **XChaCha20-Poly1305** (`chacha20poly1305` crate), key derived from the state key |

Commitments:

1. **Keys:** the 256-bit state key is generated with the OS CSPRNG on first run and stored in the OS credential store through the `keyring` crate (Windows Credential Manager, macOS Keychain, Linux Secret Service). If no credential store is available (for example a headless Linux session), OneCode asks the user for a passphrase and derives the key with **Argon2id** (`argon2` crate); it never falls back to an unencrypted state database.
2. **Access pattern:** each database is owned by one writer task (ADR-0002) using a dedicated blocking thread; reads use a small connection pool. Settings: WAL journal, `synchronous=NORMAL` for the index and `FULL` for state, `foreign_keys=ON`, a busy timeout, and bounded statement caches.
3. **Migrations:** forward-only, versioned SQL migrations embedded in the binary and applied with **rusqlite_migration** (2.x) at startup. Before migrating the state database, OneCode writes an encrypted backup copy beside it; a failed migration restores the backup and refuses to start with an explanation. Downgrades are not supported; index databases are simply rebuilt when their schema or parser version changes.
4. **Retention defaults** (user-adjustable in settings, TRD §10): sessions, tasks, and memory until the user deletes them; artifacts and captures 30 days after their task closes; audit records 365 days; index databases until the repository is removed or the user rebuilds. Deleting a session or task deletes its artifacts.
5. **Export and deletion:** per-session and per-project export to a user-chosen file with redaction (R-30), and deletion that removes rows, artifacts, and index files; SQLite `VACUUM` runs after bulk deletion so deleted pages do not linger in the file.
6. **Column and table naming:** `snake_case` in SQL; JSON stored in columns follows the wire contract casing (ADR-0020).
7. **Versions** follow the [dependency policy](../DEPENDENCY-POLICY.md#4-latest-safe-versions): the newest stable release of each named crate that is at least 14 days old at adoption time, recorded in `Cargo.lock` and [TECH-STACK](../TECH-STACK.md).

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| `sqlx` with SQLite | Async, compile-time-checked queries | Adds an async layer over a fundamentally single-writer embedded database, a higher MSRV, and no SQLCipher-first path; the dedicated-thread owner model gives the same non-blocking behavior |
| Plain SQLite plus OS full-disk encryption only | Simplest | Full-disk encryption is not guaranteed on every user machine and does not protect against other processes of the same user reading exported or backed-up files |
| Encrypt everything, including indexes | Uniform | Large write cost on the hot indexing path for data that is already plaintext in the repository |
| Embedded key-value store (redb, sled) | Fast, pure Rust | Loses SQL for relational task/audit queries and the SQLite vector and graph options ADR-0006/0017 can use |
| Custom file formats | Full control | Reinvents transactions, migration, and crash safety (dependency policy §1) |

## Consequences

- **Positive:** one mature, well-understood engine across all three OSes; transactional state; a relational model for audit and evidence queries; rebuildable indexes keep schema evolution cheap.
- **Negative and mitigations:** SQLCipher adds a native crypto build to the package (vendored, built in CI per OS); key loss makes state unrecoverable by design, so export is promoted in the UI and the passphrase path warns clearly.
- **Platform differences:** credential stores differ per OS (tested per OS); the passphrase fallback is the documented exception where no store exists.
- **Migration or rollback path:** the storage layer sits behind repository traits per domain, so a component can move to another engine without changing callers; state migrations are backed up before they run.

## Threat model

| Asset | Entry point | Trust level of input | Abuse case | Mitigation | Test |
|---|---|---|---|---|---|
| Session, task, audit, and memory data | Files in the data directory | Other processes of the same user, backups, stolen disk | Reading or exfiltrating state at rest | SQLCipher with a key in the OS credential store; user-only file permissions | Opening `state.db` without the key fails; permission check per OS |
| Artifacts and captures | `artifacts/` files | Same as above | Reading captured output or screenshots | Per-file XChaCha20-Poly1305; redaction before write (R-30) | Raw artifact bytes are not readable; secret-scanning fixtures find nothing |
| Integrity of audit records | State database | Local tampering | Silent edit of approvals or policy decisions | Append-only table with hash chaining of records; verification on export | Tamper fixture detects a modified record |
| Database parser | Index files, imported exports | Possibly corrupted or crafted files | Malformed database crashes or misleads the core | `PRAGMA integrity_check` on open after a crash; rebuild indexes on failure; imports parsed with limits | Corrupt-file fixtures |
| SQL execution | Query construction | Repository-derived strings | SQL injection through file names or symbols | Parameterized statements only; no string-built SQL | Lint rule plus injection fixtures |

## Verification

- Store tests per OS: state DB unreadable without the key; key stored and retrieved from the credential store; passphrase fallback on a Linux runner without Secret Service.
- Migration tests: upgrade from every released schema version, failed-migration restore, backup encryption.
- Retention and deletion tests: expired artifacts removed, `VACUUM` run, deleted session leaves no rows or files.
- Benchmarks on the large-repository fixture against the re-index and graph-query budgets (engineering standards §12).
