# Core Systems Interactive

An interactive, worksheet-first learning platform for core computer science systems.

**Tracks:** Digital Logic, Computer Architecture (foundation/roadmap), Operating Systems, and Computer Networks.

## Current source snapshot

This repository contains a source export from the Lovable project at commit `8b891f9b241c5065e514fe0410ecf7cf55beea4a` (12 October 2026). It includes the Digital Logic lessons for number systems, two's complement and overflow, IEEE-754, Boolean algebra/gates, and Karnaugh maps, along with the existing OS/CN material and application shell.

The source was exported without `.env` or the private Lovable project metadata. The existing published student site was not changed by this export.

## Local development

Requirements: Bun (the project includes `bun.lock`).

```sh
bun install --frozen-lockfile
bun run dev
```

## Quality checks

```sh
bun run test
bun run build
bun run lint
```

The GitHub Actions workflow runs tests and a production build on pushes and pull requests.

## Safety and progress

- Do not commit real credentials. Copy local values into an untracked `.env` file; `.env*` files are ignored by Git.
- Student progress is currently browser-local (the `core-systems-progress-v1` key). Preserve this behavior and existing OS/CN routes when extending the app.
- Deployment is intentionally not configured here. Review the source, CI results, and preview behavior before connecting hosting or publishing changes.
