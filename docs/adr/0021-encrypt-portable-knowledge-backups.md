# ADR-0021: Encrypt portable knowledge backups and re-review restored records

**Status:** Proposed  
**Date:** 2026-11-06  
**Deciders:** Product owner; Architect  
**Affects:** PRD FR-126, FR-130; TRD §§5.6, 5.8, 10.2, 10.3, 12, 14.1, 17; agent rules R-01, R-14, R-30, R-31; ADR-0005  
**Revisit trigger:** A cryptographic review identifies a weakness; a supported OS cannot meet the portability or key-handling requirements; or user research demonstrates that mandatory passphrase encryption or re-review prevents recovery of user knowledge.

## Context

[PRD FR-130](../PRD.md#1018-second-brain-knowledge-lifecycle) requires user-controlled portability for accepted memory, provenance, and revision history. [ADR-0005](./0005-storage-engine.md) encrypts the local state database and artifacts, but that protection does not automatically cover a portable archive written to a user-selected destination. A manifest hash detects content changes only relative to the manifest; it does not authenticate the archive's origin or the claims that a record was user-authored or previously accepted.

An archive may be received from another person, copied from an untrusted location, or modified. Treating its embedded acceptance state as current could promote instruction-like or misleading content into memory used by agents. Portable backup data may also contain confidential notes and history, so a user-selected path alone is not adequate protection.

## Decision

Require passphrase encryption for every native OneCode knowledge backup, using the existing Argon2id and XChaCha20-Poly1305 dependencies selected by ADR-0005; do not persist the passphrase or offer plaintext native archives. Restore native archives and import Markdown/wikilink content into a review queue: preserve the archive's prior lifecycle state as historical provenance only, and require explicit re-acceptance before any restored record is eligible for memory retrieval. Plaintext Markdown export remains a separate opt-in action with a clear disclosure and confirmation.

The versioned archive envelope uses a random salt and nonce, authenticates the manifest and payload, and carries bounded, versioned KDF parameters. Reject unsupported or resource-exhausting parameters, incorrect passphrases, and authentication failures before parsing or mutation. Authenticated encryption establishes archive integrity for the passphrase holder; it does not establish the identity of the original author, so restored provenance remains visibly unverified until reviewed.

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| Plain archive with hashes | Detect accidental corruption with a manifest and content hashes. | Hashes do not provide confidentiality or authenticate the manifest; rejected for portable backups. |
| `age` portable-file encryption | Use the `age` 0.12.1 candidate from the tech-stack inventory. | It adds a dependency and a separate key/format policy when ADR-0005 already selects suitable authenticated-encryption and passphrase-derivation primitives; reconsider if the existing primitives cannot meet interoperability or streaming requirements. |
| Custom cryptographic format | Implement encryption, authentication, and key derivation in OneCode. | Unacceptable: increases cryptographic risk and duplicates maintained primitives. |
| Restore archived acceptance as active | Preserve the prior accepted status immediately after import. | Rejected because archive metadata alone cannot authenticate original authorship or acceptance; require review and re-acceptance instead. |

## Consequences

- **Positive:** portable OneCode backups are confidential and tamper-evident; archived acceptance cannot silently become active; existing crypto dependencies are reused.
- **Negative and mitigations:** users must keep the export passphrase, and a lost passphrase makes that archive unrecoverable. Explain this before export and confirm a successful backup. Restored notes require review/re-acceptance; allow an exact-item preview for user-controlled bulk acceptance. Plaintext Markdown export remains a deliberate disclosure and requires confirmation.
- **Platform differences and documented exceptions:** use the same archive format and security behavior on Windows, macOS, and Linux. Do not silently fall back to plaintext if cryptographic support is unavailable.
- **Migration or rollback path:** this is a new portable format. Version the envelope and support explicit migrations; malformed, unsupported, or unauthenticated archives fail closed without modifying stored records. If an early plaintext prototype exists, import it only through the review queue.

## Threat model

| Asset | Entry point | Trust level of input | Abuse case | Mitigation | Test |
|---|---|---|---|---|---|
| Accepted notes and history | User-selected backup destination | Other processes, shared storage, or stolen media may read the file | Confidential memory is disclosed from a plaintext archive | Mandatory passphrase-derived encryption; passphrase is never stored or logged; explicit warning that loss prevents recovery | Archive contents are not readable without the passphrase; verify on each OS |
| Archive envelope | Native archive import | Untrusted file and attacker-controlled header | Tampered content is accepted, or hostile KDF parameters exhaust resources | Authenticated manifest and payload; strict KDF parameter bounds; size/depth limits; fail before database mutation | Wrong passphrase, altered header/payload, invalid KDF bounds, and truncated-archive tests |
| Restored memory provenance | Restore/import workflow | Archive claims are unverified, even when encryption authenticates integrity | Forged acceptance or authorship metadata is surfaced to an agent as trusted memory | All restored/imported records enter review; prior acceptance is historical metadata only; require user re-acceptance | Restore an archive containing forged accepted flags and verify no record is recall-eligible before review |
| Passphrase | Export/import UI and KDF | Secret user input | Passphrase appears in logs, diagnostics, or retained state | Secure input handling; no persistence, telemetry, or logging; clear no-recovery disclosure | Secret-scanning and logging fixtures |
| Markdown export | User-selected export path | Plaintext readable by destination users/processes | User unintentionally exposes private notes | Redaction, destination preview, explicit plaintext warning and confirmation | Export cannot proceed without confirmation and reports plaintext contents |

## Verification

- On Windows, macOS, and Linux, round-trip an encrypted archive, reject wrong passphrases and modified manifests/payloads, and verify no plaintext native-archive fallback.
- Test malformed, unsupported, and excessive KDF parameters, archive path/size/depth limits, and failure atomicity.
- Verify native archive restores and Markdown imports preserve provenance/history for review but remain ineligible for recall until explicit re-acceptance.
- Verify passphrases never reach logs, diagnostics, telemetry, or persistent settings; test the plaintext Markdown warning and confirmation.
- Document that losing the passphrase prevents recovery and test the user-visible warning before export.
