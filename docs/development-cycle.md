# Development and release cycle

Next Story is a public learning project: each increment pairs a working example with its schema, implementation, explanation, and verification. `develop` integrates changes; `main` is the Vercel production branch. Local commits do not publish the site.

## Implement and review

1. Fetch, inspect status/worktrees, and branch `feat/<change>` from current `develop`. Use a separate worktree when another checkout holds work.
2. Start `npm run dev` on a free, unreserved port. Token-free development uses the same localized seed stories as CI. Keep delivery tokens empty in the process environment when reviewing seed changes; do not rewrite secrets files.
3. Change the schema before components, regenerate types, and add EN/DE examples. Explain the choice in the existing architecture/schema docs and link examples to source. Add concise imperative bullets under `CHANGELOG.md`'s `Unreleased` section.
4. Run the gates below. Review actual desktop/mobile rendering, German text, keyboard access, and reduced motion. Commit the reviewed increment with a descriptive `feat:`, `fix:`, or `docs:` subject.
5. When publication is authorized, push the feature branch, open a PR into `develop`, and require CI plus Vercel preview checks before merging. A no-push instruction stops at local commits and local review.

```bash
npm run storyblok:types:check
npm run lint
npm test
npm run changelog:lint
npm run build
npm start -- --port 3502
# Against that running build, in another terminal:
npm run smoke -- http://localhost:3502
npm run verify:agent-readiness -- http://localhost:3502
npm run verify:browser -- http://localhost:3502
```

Check listeners before binding: macOS `lsof -iTCP:3502 -sTCP:LISTEN`; Windows `Get-NetTCPConnection -LocalPort 3502` and `netsh int ipv4 show excludedportrange protocol=tcp`; WSL `ss -ltn`. Stop only the PID started for this review. Stop a dev instance before the production build, then restart it after checks so `.next` output and the final review instance agree.

## Cut and promote a release

1. Re-read current repo rules, fetch, and inspect the release diff. Select the version from the reviewed changes: additive features increment the minor version, compatible fixes the patch version. Feature commits leave the package version unchanged and changes under `Unreleased`.
2. Create `release/x.y.z` from tested `develop`. Set the same version in `package.json` and `package-lock.json`; move reviewed Unreleased entries into `[x.y.z] - YYYY-MM-DD`, leaving an empty Unreleased heading. Commit as `chore(release): cut x.y.z` and run the gates again.
3. Open the production promotion PR into `main`. Require its checks and inspect the release diff against each intended addition/removal before merging. Vercel deploys the production branch; verify the deployed commit and live routes rather than treating a merged PR as deployment proof.
4. Fast-forward `develop` to the production commit, without a back-merge commit. Verify `main`, `develop`, and their remote refs resolve to the same commit.
5. Tag the verified production commit, not the feature or pre-promotion release commit. Use an annotated `vx.y.z` tag, message `Release x.y.z`, matching the package/changelog version. Do not move an existing published tag.
6. Publish that explicit tag and create the GitHub release named `[x.y.z] - YYYY-MM-DD` like its changelog heading, with a one-line summary and concise change/verification bullets from the changelog. The tag identifies source; the GitHub release is the public record; the Vercel deployment is the running site. Verify all three point to the intended release.
7. Remove only the task's merged feature/release branches and task worktree after review artifacts and owned processes are handled.

Tag commands, executed only as part of an authorized release:

```bash
git tag -a vx.y.z <verified-production-sha> -m "Release x.y.z"
git show --no-patch vx.y.z
git push origin vx.y.z
gh release create vx.y.z --verify-tag --target main --title "[x.y.z] - YYYY-MM-DD" --notes-file <release-notes-file>
```

The existing `v0.7.0` tag is annotated, points to the production promotion commit, and its GitHub release is named `[0.7.0] - 2026-10-19`.

## Coordinate Storyblok content

Code deployment and CMS publication are separate operations. Before a live write, snapshot the current schema/stories and compare with the reviewed baseline. Apply backward-compatible schema extensions, save reviewed story changes as drafts, deploy supporting code, then publish only the reviewed stories. Recheck concurrent edits before writing.

`storyblok:push` requires repeatable `--only-component`/`--only-story` selectors or explicit `--bootstrap`. It saves drafts unless `--publish` is supplied. Export selected remote content with `--snapshot <new-file>`, review it, and pass it through `--baseline <file>` before replacing an existing story. Drift aborts content replacement. Keep local snapshots outside version control. Apply schema changes separately, deploy supporting components, preview drafts, then explicitly publish reviewed stories. Verify English/German HTML and Markdown after webhook invalidation. Local seeds prove implementation, not live CMS publication.
