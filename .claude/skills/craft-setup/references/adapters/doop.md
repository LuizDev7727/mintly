# Adapter: Doop (Doop MCP)

Setup writes `DESIGN.md` as a file in `web/`. Doop is only used for the optional references board and, through `craft-system` (create) or `craft-sync` (import), the foundations.

| Skill verb | In Doop |
|---|---|
| Start | `get_guide({topic: "doop-instructions"})` once per session, then `get_canvas`, then `set_status` |
| Read what exists | `get_canvas` (pages, frames, fonts, `existingStyle`), `get_tokens`, `list_components`, `list_guidelines` and `get_guidelines`; `get_frame` for exact values |
| References | `search_inspiration` finds real, curated live pages with their style, colour and fonts; use it when the person wants references and has none. Pick one exemplar and say why it won; don't blend several |
| References board (optional) | A page `References` (`create_canvas_page`); one frame per reference named `Reference · <name>`, with its image (if the person shared one, `upload_asset`) and two short lists, **Take** and **Avoid**, written with `append_frame_html` |
| Look at it | `get_frame_screenshot` after building the board (mandatory) |
| Finish | `set_status` with an empty string; leave approval to the person |

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

`DESIGN.md` is the project's brief. Don't also write Doop's own brief: when the person approves the foundations, `craft-system` puts the values on the canvas as tokens. A choice that needs a reason (why this mood, why this accent) also goes to `save_decision`.
