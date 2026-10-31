# Security policy

OneCode is a local-first coding application that runs agents, terminals, and a browser against user repositories. We treat security reports as the highest-priority work.

## Reporting a vulnerability

Report suspected vulnerabilities **privately**. Do not open a public issue, pull request, or discussion.

- **Preferred:** the code host's private vulnerability reporting (for example GitHub Security Advisories), once the repository is hosted.
- **Until then:** contact the maintainers directly. A dedicated security contact address is an open item to set before the first public release ([SOC 2 baseline §6](./docs/SOC2-CONTROLS.md#6-open-items)).

Include the affected version or commit, the OS, steps to reproduce, the impact you observed, and whether the issue is already public. Do not include real secrets or other people's data; use synthetic values.

## What to expect

| Stage | Target |
|---|---|
| Acknowledge the report | 3 business days |
| Initial assessment and severity (CVSS) | 10 business days |
| Fix for critical / high severity | 7 / 30 days from confirmation |
| Coordinated disclosure | After a fix ships, or 90 days from the report, whichever comes first, unless we agree otherwise |

We credit reporters who want credit. We do not pursue legal action for good-faith research that follows this policy, stays within your own systems and data, and avoids privacy violations, data destruction, and service disruption.

## In scope

- The desktop application, CLI, and core services in this repository.
- Bypasses of the permission policy, sandbox, protected paths, workspace trust, redaction, or approval flows ([agent operating rules](./docs/AGENT-OPERATING-RULES.md)).
- Prompt-injection paths that make an agent act on observed content without user approval (R-01, R-02).
- Supply-chain issues in how we build, sign, or update releases.

## Out of scope

- Vulnerabilities in third-party dependencies that are already public. Report them upstream; tell us if OneCode is affected in a way the advisory does not cover.
- Findings that require an already-compromised operating system account.
- The design prototype under `docs/design/`, which uses sample data only.

## Supported versions

There is no released version yet. Once releases begin, this section lists the versions that receive security fixes.

## For contributors

How we write secure code is in the [secure coding standard](./docs/SECURE-CODING.md); how we admit dependencies is in the [dependency policy](./docs/DEPENDENCY-POLICY.md).
