# Adapter: Doop (Doop MCP)

How the skill's verbs map to the Doop MCP tools.

| Skill verb | In Doop |
|---|---|
| Start | `get_guide({topic: "doop-instructions"})` once per session (again if a long conversation may have dropped it), then `get_canvas` for pages, frames, components and style guides, then `set_status` with a one-line summary of the task. Update `set_status` when the focus shifts; clear it (empty string) when you finish |
| Register tokens | After the person approves the foundations: `get_tokens` first, then `create_tokens` for new ones and `set_tokens` to change them (`set_token_themes` for light/dark). Tokens are canvas-wide, so registering them is part of that approval, not before it; then rebind the foundation boards to the tokens. A frame names a token as `var(--name)` and a change restyles every frame that uses it |
| Read the design system | `get_tokens`; `list_components` and `get_component` for the pieces; `list_guidelines` then `get_guidelines` for each relevant style guide, which **outranks your own taste**; `get_reference` for a frame pinned as "the look to match" |
| Read exact values | `get_frame` (the HTML; instances read back as `<doop-use …>`, pass `expand_components=true` only if you must see the full markup) and `get_tokens`. Never read sizes or colours from a screenshot |
| Create a board | `create_frame` (one frame per board), named after what it shows (for example `Guide · Buttons`). Size to the content: mobile screen 390×844, desktop page 1280×800, card or component 480×360. Omit x/y to auto-place beside the others; pass `pageId` to put it on a page |
| Build a section | `append_frame_html`, one complete section per chunk (~1–4 KB), in document order: head and styles first (`start=true`), then each section, the last with `done=true`. Every chunk renders live, so each leaves the frame in a sensible state. Use `var(--token)` for every value a token names. Small tweaks: `edit_frame_html` (exact find/replace). `set_frame_html` only for a genuine redesign |
| Reuse a piece | `<doop-use component="Name" prop="…"></doop-use>` in any frame HTML; slots go in `<template slot="…">`. A block you'd write a third time becomes a component first: `create_component` from an existing element, then use it. Change every instance at once with `update_component` (find + replace; `dry_run` first on anything widely used). One instance that must differ: `update_instances` or edit it, don't detach. `get_component_preview` shows every variant, so look at it after a change |
| Make a state variant of a board | There is no duplicate tool. `get_frame` the main board, `create_frame` a new one with the state's name, and write the same HTML with only what the state changes (`set_frame_html` or a stream). Keep `<doop-use>` instances as they are. Never recreate a frame just to move it: `update_frame` moves, renames and resizes while keeping its comments, versions and approval |
| Look at it | `get_frame_screenshot`, **mandatory** after creating a frame and after any significant edit. Take one right after the first major section (nav + hero or the first block) and fix direction-level problems before building on it, then again at the end. Judge: fit, spacing, hierarchy, contrast, alignment, realism, logos, reuse; fix real issues with targeted edits, not rewrites |
| Fix clipping | `update_frame` with the right `width`/`height`, or rework the layout; don't guess heights |
| Temporary exploration area | `create_canvas_page` (named for the round, e.g. `Exploration · <topic>`) and pass its id as `pageId` to `create_frame`. Delete only a page you created, and only when the person agrees, with `set_canvas_pages` |
| Component with a code counterpart | `create_component` with a `description` saying when to use it, and set `code` (file and export name) when the component exists in the repo: that is what makes the design implementable with the real code |
| Finish | Give the frame names and its `image_url` (a public render that stays current), `set_status` with an empty string, and leave approval to the person |

Rules that come from the Doop guide and always apply (`get_guide({topic: "doop-instructions"})` has the full text):
- Pass the same `agent_name` (`Claude Code`) on every call, and `canvas_id` on every call that needs it.
- Call `get_canvas` before adding or editing anything. Don't edit or delete a frame someone else touched seconds ago unless the person asked.
- Keep every `data-doop-*` attribute when you rewrite markup: comments, links and component overrides point at them.
- Colours, fonts, sizes, radii and spacing come from the canvas tokens as `var(--name)`. Never declare a palette on `:root` inside a frame.
- Style on the element (`style="…"`); the `<style>` block is for states (`:hover`, `:focus`), `@media`, `@keyframes`, pseudo-elements and component variants. No `!important`.
- Always reset `* { margin: 0; box-sizing: border-box; }` and design to the frame's exact size: frames don't scroll.
- Real content, never lorem ipsum. Real logos from `search_logos`, real icons from `search_icons`; never emoji or Unicode symbols as icons.
- **Never call `set_frame_approval` on your own.** Approval is the person's decision; only do it when they ask. This matches the stops in the skills.
- If a tool errors or does something other than its description says, retry once, then use `report_issue` and carry on with a workaround.


Notes:
- Repeated rows: give icons and trailing actions fixed-width slots (`width` + `flex-shrink: 0`) so the columns line up.
- Don't show frame ids to the person; refer to boards by name.
- Restoring: `list_frame_versions` and `restore_frame_version` bring back an earlier state. Use them if your rework turned out worse than what was there.
- Human feedback ("HUMAN FEEDBACK" in a tool result) comes first: address it before your own plan (`get_feedback` claims it). `get_comments`, `reply_to_comment` and `resolve_comment` handle element comments.
- Doop's own guide asks for a design brief on a canvas with no style. Here `DESIGN.md` is that brief (see `craft-setup`), so don't write a second one: follow it, and put its values on the canvas as tokens with `create_tokens` before the first frame. Record the why of a design choice with `save_decision` (one decision and its reason per call, at most 500 characters).
