# Adapter: Doop (Doop MCP)

| Skill verb | In Doop |
|---|---|
| Start | `get_guide({topic: "doop-instructions"})` once per session, then `get_canvas` (pages, frames, components, style guides, fonts), then `set_status` |
| Register tokens (import) | `get_tokens` first. A name that already exists **with a different value is a conflict** for the inventory stop, never a silent `set_tokens`. Then `create_tokens` with the code's names (`--color-accent`, `--sand-200`); after the person settles a conflict, `set_tokens` for it. A value Doop can't hold as a token (shadows, durations, easings, if it refuses them) goes on the foundations board as text, marked "not registered in Doop"; if a tool refuses a name or value, say so instead of renaming it silently |
| Guide page | `create_canvas_page` `Guide`; frames `Guide · Foundations · Colour`, `Guide · Foundations · Type & scales`, `Guide · Component index`, `Guide · <Component>`; content with `append_frame_html` in small groups, every value through `var(--token)` |
| Component index | One frame with a bordered table: name, variants, code path, status (`drawn` / `in code only`). `list_components` is the source for what is drawn |
| Draw a component | `create_component` (the main lives on the Components page, placing nothing); give it a `description` and set `code` (file and export name). One frame per component with a legend (its guideline text), examples through `<doop-use>`, and a states matrix; "proposed" states are labelled as such. Variants are props (`data-<name>` on the root) styled in the `<style>` block, not one component per state |
| Existing pages | `import_webpage` brings a live page onto the canvas as an editable snapshot; `import_component` and `sync_component` reuse components from another canvas. A frame carrying a `doop-github-screen` marker was imported from the repo, which stays the source of truth |
| Read guide values (export) | `get_tokens` for token values; `get_component` and `get_frame` on component boards for sizes and colours; never `get_frame_screenshot` for values |
| Look at it | `get_frame_screenshot` after each section (mandatory) |
| Finish | `set_status` with an empty string; leave approval to the person |

Fonts: if `get_canvas` lists `fonts`, prefer them and name the family in CSS only (Doop adds the `@font-face`). A font neither in the library nor on Google Fonts goes in with `upload_font` first; never inline a font file. If the code's font isn't available, use the closest family and note it in the legend.

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
