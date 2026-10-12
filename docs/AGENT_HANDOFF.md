# Agent Handoff — Core Systems Interactive

Last updated: 2026-10-12

## Canonical links

- Student-facing published application: https://core-systems-os-cn.lovable.app
- Lovable editor: https://lovable.dev/projects/7e729670-7b68-44a7-b326-c14a16c39db2
- GitHub repository: https://github.com/anujjha101296-lang/core-systems-interactive
- Source snapshot baseline: `main` at `4367f5eb98cfa84cea54bf89c71b0826cab73b2d`
- Original Lovable source commit represented by the snapshot: `8b891f9b241c5065e514fe0410ecf7cf55beea4a`

## Read this before editing

This repository is a manually exported source snapshot from Lovable, not a confirmed automatic Lovable↔GitHub sync. A GitHub commit does not automatically update the Lovable project or the published site. The live application is already in use by students.

**Do not publish, deploy, or overwrite the live app.** Deployment requires explicit approval from the project owner. Do not assume a preview is tested unless you actually test it.

The repository is private. If you cannot authenticate and read it, state that blocker rather than guessing about the code. Never commit secrets, API keys, `.env` files, or Lovable private metadata. The `.gitignore` excludes local environment files.

## Product scope

Core Systems Interactive is a worksheet-first, academically rigorous, interactive CS learning platform with four tracks:

- Digital Logic
- Computer Architecture
- Operating Systems
- Computer Networks

Preserve existing OS/CN content, routes, behavior, and student progress. The browser-local progress key is `core-systems-progress-v1`; do not rename, reset, or migrate it without a separately reviewed plan.

## Current baseline

The source snapshot includes OS/CN and the application shell, plus Digital Logic lessons/labs for:

1. Number systems and base conversion — `number-systems`
2. Signed numbers, two's complement, and overflow — `twos-complement`
3. Fixed-point and IEEE-754 single precision — `fixed-ieee754`
4. Boolean algebra and gates — `boolean-gates`
5. Karnaugh maps — `karnaugh-maps`

Useful implementation locations (confirm paths against the checked-out tree before editing):

- `src/content/digital-logic.ts` — lesson content
- `src/components/dl-labs.tsx` — interactive Digital Logic labs
- `src/lib/dl-math.ts` — pure logic/math helpers
- `src/content/index.ts` and `src/components/labs.tsx` — registries
- `src/test/digital-logic.test.ts` and `src/test/kmap.test.ts` — tests
- `src/routes/learning-path.tsx` — learning path
- `.github/workflows/ci.yml` — CI
- `package.json` — scripts

CI on the baseline runs install, TypeScript checking, tests, and a production build. Baseline checks passed in GitHub Actions on 2026-10-12. Browser-level smoke checks had not been performed at the time this handoff was written.

## Prioritized next work

### P0 — IEEE-754 rounding metric correctness

Audit the rounding-error row in the IEEE-754 lab. It currently compares the float32 value with JavaScript's parsed float64 input and labels the difference as error versus the input. That is not necessarily the exact mathematical decimal error.

Choose one:
- implement a correct exact-decimal comparison for the supported input syntax, with regression tests; or
- remove/relabel the metric so it makes only a claim the implementation can support.

Test normal values, values not exactly representable in binary32, negative values, zero, subnormals, overflow to infinity, and invalid inputs as appropriate.

### P1 — Combinational Building Blocks lesson and lab

Create the next Digital Logic lesson, covering:
- multiplexers and demultiplexers
- decoders and encoders
- half adders and full adders
- ripple-carry addition and carry/overflow distinctions
- introductory ALU structure

Use worked examples, progressive hints, complete solutions, common mistakes, interview follow-ups, and engineering bridges. Build an actual interactive lab with validated inputs and meaningful feedback. Register the lesson/lab in every required registry and add pure-helper tests.

### P2 — Product quality

Continue with small, independently testable milestones. Prioritize correctness, accessibility, responsive behavior, clear validation/error states, preservation of existing progress, and maintainable code over adding many unverified features.

## Agent coordination protocol (Grok, Antigravity, and any other agent)

Multiple agents may be reviewing or editing this repository at the same time.

1. **Before editing:** fetch the latest `main`, list open pull requests and active branches, inspect recent commits, and check whether another agent is already implementing the same task.
2. **Avoid overlapping edits:** use a dedicated feature branch and announce the intended task/branch in the PR description or issue. Do not edit the same files concurrently unless coordinating deliberately.
3. **Do not push directly to `main`.** Push a feature branch and open a pull request for review. Never force-push or reset another agent's branch.
4. **Before each push:** fetch/rebase or merge the latest intended base safely; resolve conflicts without discarding others' work.
5. **Verify:** run all checks below, inspect the diff, and report exact results. Add tests for behavior changes.
6. **Handoff:** report branch, commit SHA, files changed, commands/results, known limitations, and what the next agent should do. A proposal or generated patch is not a completed change until it is committed and verified.
7. **Integrate intentionally:** do not merge a PR or deploy/publish unless the owner explicitly authorizes it.

## Local verification

Use the repository's Bun lockfile and scripts:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run build
```

Run `bun run lint` as well when practical and report any pre-existing or newly introduced issues separately. For UI work, perform real browser smoke checks where tooling permits; otherwise explicitly state that they were not performed.

## Expected completion report

For each milestone, provide:
- concise summary of behavior added/fixed
- branch and commit SHA / PR URL
- files changed
- exact test, typecheck, lint, and build results
- browser smoke-check status
- known limitations or follow-up work
- explicit confirmation that no deployment or publication was performed
