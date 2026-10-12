<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep course content and exercise engines browser-safe and bundled locally; public worksheets must work without network or authentication services.
- Store only theme preference, never learner answers, progress, scores or identity; exercise state is ephemeral React state.
- Keep curriculum data separate from route rendering and simulation engines; this permits coverage validation and deterministic tests.
- Preserve existing public lesson URLs and redirect the retired Bridge URL to curriculum interview practice; existing bookmarks must not break.