# OneCode SOC 2 Control Baseline

**Status:** Draft. This is an engineering control baseline, **not a SOC 2 report or attestation.** Only an independent CPA firm can issue a SOC 2 Type I or Type II report, and it covers an organization's controls over a defined system, not a codebase.  
**Criteria basis:** AICPA 2017 Trust Services Criteria (with the 2022 revised points of focus). Verify criterion wording against the current AICPA publication before an audit.  
**Related:** [Secure coding](./SECURE-CODING.md), [dependency policy](./DEPENDENCY-POLICY.md), [engineering standards](./ENGINEERING-STANDARDS.md), [agent operating rules](./AGENT-OPERATING-RULES.md), [SECURITY.md](../SECURITY.md)

## 1. Why this exists and what is in scope

OneCode is a local-first desktop application: user source code, prompts, and secrets stay on the user's machine. A future SOC 2 examination would therefore focus on:

1. **The software supply chain:** how code is changed, reviewed, built, signed, and released, so that what users install is what was reviewed.
2. **Any hosted service we operate:** update channel, model catalog and download mirror, documentation site, issue intake, and any opt-in crash or telemetry endpoint.
3. **The organization:** governance, people, vendors, and incident response.

Product features that help **customers** meet their own obligations (audit log, egress receipts, policy controls) are listed separately in section 4; they are not our controls.

The baseline is written now so the repository produces audit evidence from the first commit instead of reconstructing it later.

## 2. Data classification

| Class | Examples | Handling |
|---|---|---|
| Restricted | Credentials, API keys, signing keys, tokens, personal data in user repositories | OS credential store or vault only; never logged, prompted, or exported (R-14) |
| Confidential | User source code, prompts, task history, memory, model outputs about user code | Stays on the device; leaves only with approval, minimized and receipted (R-29) |
| Internal | Unreleased designs, security findings, CI logs | Access limited to the team; findings handled per [SECURITY.md](../SECURITY.md) |
| Public | Released binaries, documentation, open-source code | Integrity protected by signing |

## 3. Control mapping

Legend for **Where**: **Repo** is enforced or evidenced in this repository; **Org** is an organizational process outside the repository (owner to be assigned); **Host** is a code-host or CI setting, configured when the repository is hosted.

### Common criteria

| Criteria | Control | Where | Evidence |
|---|---|---|---|
| CC1 Control environment | Documented intent, standards, and contribution guidelines; a code of conduct (not adopted yet, see section 6); named owners for security-sensitive paths (CODEOWNERS) | Repo, Org | [INTENT.md](../INTENT.md), standards docs, [CONTRIBUTING.md](../CONTRIBUTING.md), CODEOWNERS, signed acknowledgments |
| CC2 Communication and information | Security policy and reporting channel published; standards versioned with the code; release notes for users | Repo | [SECURITY.md](../SECURITY.md), `CHANGELOG.md`, doc history |
| CC3 Risk assessment | Threat model in every ADR that adds a trust boundary; product risk register | Repo | ADR threat-model sections, [PRD §14](./PRD.md#14-risks-and-mitigations) |
| CC4 Monitoring activities | Periodic review of this baseline, of dependency health, and of open security findings | Org | Quarterly review record |
| CC5 Control activities | Controls enforced by tooling rather than memory: CI gates, deny rules, hooks, policy engine | Repo, Host | CI configuration, `.claude/settings.json`, test results |
| CC6.1 Logical access | Least-privilege repository and CI access; MFA required; no shared accounts; secrets in a managed store | Host, Org | Access listings, MFA enforcement setting |
| CC6.2–6.3 Provisioning and removal | Access granted by request with approval; removed at role change or departure; quarterly access review | Org | Tickets, review sign-off |
| CC6.6 External threats | Signed releases; update channel over TLS with signature verification; no listening ports in the app by default | Repo, Host | Release signatures, [secure coding §9](./SECURE-CODING.md#9-network-and-egress-cwe-918) |
| CC6.7 Data in transit and at rest | TLS with validation for all egress; encryption at rest per ADR-0005; secrets in OS credential store | Repo | ADR-0005, tests, [secure coding §6](./SECURE-CODING.md#6-secrets-and-credentials-cwe-798-cwe-312-cwe-532) and [§8](./SECURE-CODING.md#8-cryptography-and-randomness-cwe-327-cwe-330-cwe-295) |
| CC6.8 Malicious software | Dependency admission and scanning; pinned lockfiles; no build-time downloads; sandboxed execution of repository code | Repo, Host | [Dependency policy](./DEPENDENCY-POLICY.md), `cargo deny`/audit reports, R-07 tests |
| CC7.1 Vulnerability management | Advisory scanning on every change; remediation targets (critical 7 days, high 30, medium 90, proposed); secret scanning | Repo, Host | Scan reports, exception register |
| CC7.2 Monitoring | CI failure alerts; monitoring of hosted endpoints; tamper-evident audit records in the product | Host, Org | Alert configuration, uptime records |
| CC7.3–7.5 Incident response | Documented intake, triage, fix, disclosure, and post-incident review | Repo, Org | [SECURITY.md](../SECURITY.md), incident records, post-mortems |
| CC8.1 Change management | Every change through a PR with linked requirement IDs, tests, and review; author cannot approve their own change; protected default branch; required checks; signed commits where possible; emergency changes reviewed after the fact within one business day | Repo, Host | PR history, branch-protection settings, [PR template](../.github/pull_request_template.md), [engineering standards §8–§9](./ENGINEERING-STANDARDS.md#8-git-workflow) |
| CC9.1 Business disruption | Release rollback path; repository and signing-key backups; key rotation plan | Org, Host | Rollback tests (TRD §15), backup records |
| CC9.2 Vendors and partners | Third-party components and model providers evaluated before use and re-evaluated on change | Repo, Org | Dependency PR justifications, [TECH-STACK](./TECH-STACK.md), provider reviews |

### Additional criteria

| Criteria | Control | Where | Evidence |
|---|---|---|---|
| A1 Availability | Hosted services have capacity monitoring and recovery procedures; the app works offline and without a model, so our outages never block local work | Host, Repo | Recovery tests, PRD offline requirements |
| C1 Confidentiality | Classification in section 2; local-first defaults; redaction before every sink; retention limits and user-controlled deletion | Repo | R-14, R-29 to R-31 tests, retention settings (TRD §10) |
| PI1 Processing integrity | Reproducible, signed builds; schema-validated contracts; evidence-backed status (no unverified "passed") | Repo | Build provenance, schema golden tests, R-16/R-18 tests |
| P1–P8 Privacy | Telemetry off by default; clear notice and consent before any collection; access, export, and deletion of user data; no sale or secondary use | Repo, Org | Privacy notice, settings, R-31 tests |

## 4. Product features that support customers' compliance

These are product requirements, listed so engineers know they carry compliance weight: the append-only audit trail of approvals and policy decisions (`PermissionDecision`, TRD §8.5), egress receipts (R-29), permission modes and managed policy (TRD §8.5–§8.7), workspace trust, evidence-linked delivery packages (TRD §6.1), and exportable, deletable memory (R-31). Changes to them need security review and must keep their records complete and tamper-evident.

## 5. Engineering obligations that produce evidence

Every engineer and agent contributes to the baseline by default when they:

1. Open a PR from the template, with requirement IDs, test evidence, and risk notes.
2. Get a review from someone other than the author, and a security review for sensitive paths.
3. Never commit secrets; never disable a check to merge; record exceptions with owner and expiry.
4. Admit dependencies through the [dependency policy](./DEPENDENCY-POLICY.md).
5. Report suspected vulnerabilities through [SECURITY.md](../SECURITY.md), not public issues.
6. Keep task notes and test evidence in the PR rather than in chat.

## 6. Open items

| Item | Owner | Needed before |
|---|---|---|
| Name a security owner and an incident commander rotation | Product owner | Public release |
| Adopt a code of conduct (for example, the Contributor Covenant) and assign real CODEOWNERS | Product owner | First external contributor |
| Host the repository with branch protection, MFA, required reviews, and secret scanning | Engineering | First external contributor |
| Choose CI and wire the gates in [engineering standards §9](./ENGINEERING-STANDARDS.md#9-definition-of-done) | Engineering | Milestone 1 |
| Define signing-key custody, rotation, and backup | Security owner | First signed release |
| Decide whether any hosted service is in scope for a SOC 2 Type I | Product owner | Before engaging an auditor |
