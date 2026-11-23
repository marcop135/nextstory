# Agent skills

Point Claude Code, Cursor, or Codex at the right how-to, the trap to avoid, and the checks CI runs.

Three public workflows read a German page, inspect the block model, and trace a block to code. They are read-only and need no key: [skill index](https://nextstory.marcopontili.com/.well-known/agent-skills/index.json) and [For agents](https://nextstory.marcopontili.com/for-agents).

## The skills

| Skill | Use it to | Follows |
| --- | --- | --- |
| `nextstory-add-block` | Add a Storyblok page or campaign block | [Add a block](storyblok-schema.md#add-a-block); register in [`src/lib/storyblok.ts`](../src/lib/storyblok.ts) |
| `nextstory-campaign` | Keep the lead path and draft cookie correct | [Campaign to lead](architecture.md#campaign-to-lead); [Environment](commands.md#environment) |
| `nextstory-copy` | Change English and German copy together | Seeds in [`storyblok/stories/`](../storyblok/stories/); [Languages](storyblok-schema.md#languages) |
| `nextstory-caching` | Keep publish-driven cache tags and webhooks correct | [Request path](architecture.md#request-path); [Storyblok](commands.md#storyblok) |

## Where they live

One `SKILL.md` per skill under [`.agents/skills/`](../.agents/skills/). [`.claude/skills/`](../.claude/skills/) holds symlinks to that source, not a second copy. Both paths stay: Claude Code only reads `.claude/skills/`; Codex only reads `.agents/skills/`; Cursor reads either.

## Add a skill

1. Create `.agents/skills/<name>/SKILL.md` with `name` (lowercase, hyphens, equal to the folder name) and `description`. Put the description in a `>-` block (or quote it) so a colon in the text does not break YAML.
2. Link the how-to instead of copying its steps.
3. From Git Bash, add a native symlink under `.claude/skills/` with `MSYS=winsymlinks:nativestrict ln -s` (WSL `ln -s` on `/mnt/c` makes a link Windows cannot read). On this Linux worktree, `ln -s` is enough.
4. Add a row to the table above.

[Documentation index](README.md)
