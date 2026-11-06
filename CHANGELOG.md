# Changelog

All notable user-visible changes to OneCode are recorded here, written for users rather than contributors. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The application version is recorded once, in the root [`VERSION`](./VERSION) file ([ADR-0022](./docs/adr/0022-central-version-source.md)).

## [Unreleased]

### Added
- Defined the planned second-brain workflow for capturing, reviewing, connecting, maintaining, retrieving, and backing up user-controlled project knowledge, with encrypted backups and review-before-recall on restore (PRD FR-126 to FR-130).

## [0.0.1] - 2026-11-06

First versioned baseline. Nothing is installable yet: the repository holds the product and technical specification, the governance and standards set, a sample-data design prototype, and a desktop UI that still runs on a development fixture adapter.

### Added
- A single authoritative application version in the root `VERSION` file, with the package manifests mirroring it and a check that fails the build if they drift ([ADR-0022](./docs/adr/0022-central-version-source.md)).
