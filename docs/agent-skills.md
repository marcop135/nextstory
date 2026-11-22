# Agent skills

Markdown skills for Claude Code, Cursor, and Codex ship in the repo. Each one routes an agent to a how-to, names the trap, and lists the checks CI runs.

Public read-only workflows for visitors and remote agents stay separate: they live at [`/.well-known/agent-skills/index.json`](https://nextstory.marcopontili.com/.well-known/agent-skills/index.json) and on [For agents](https://nextstory.marcopontili.com/for-agents).

## The skills

| Skill | Use it to |
| --- | --- |
| `nextstory-add-block` | Add a Storyblok page or campaign block |
| `nextstory-campaign` | Keep the lead path and draft cookie correct |
| `nextstory-copy` | Change English and German copy together |
| `nextstory-caching` | Keep publish-driven cache tags and webhooks correct |

What each skill follows:

- **nextstory-add-block:** [Add a block](storyblok-schema.md#add-a-block); register in [`src/lib/storyblok.ts`](../src/lib/storyblok.ts).
- **nextstory-campaign:** [Campaign to lead](architecture.md#campaign-to-lead); env in [Environment](commands.md#environment).
- **nextstory-copy:** seeds in [`storyblok/stories/`](../storyblok/stories/); [Languages](storyblok-schema.md#languages).
- **nextstory-caching:** [Request path](architecture.md#request-path); webhook notes in [Storyblok](commands.md#storyblok).

## Where they live

| Path | Role |
| --- | --- |
| [`.agents/skills/`](../.agents/skills/) | Source of each `SKILL.md` |
| [`.claude/skills/`](../.claude/skills/) | Symlinks to that source |

| Tool | Reads |
| --- | --- |
| Claude Code | `.claude/skills/` |
| Codex | `.agents/skills/` |
| Cursor | Both |

## Add a skill

1. Create `.agents/skills/<name>/SKILL.md` with `name` (lowercase, hyphens, equal to the folder name) and `description`. Put the description in a `>-` block (or quote it) so a colon in the text does not break YAML.
2. Link the how-to instead of copying its steps.
3. From Git Bash, add a native symlink under `.claude/skills/` with `MSYS=winsymlinks:nativestrict ln -s` (WSL `ln -s` on `/mnt/c` makes a link Windows cannot read). On this Linux worktree, `ln -s` is enough.
4. Add a row to the table above and a Follows bullet.
