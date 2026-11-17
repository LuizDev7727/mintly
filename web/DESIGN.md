# DESIGN.md · Mintly

> If this file and the code disagree, the code wins until the person decides. Note the conflict under Open questions.

## Product
Dashboard for video creators and their teams. An organization has channels; each channel has posts (published to YouTube, TikTok and Instagram), projects (a source video turned into AI-picked clips), integrations, and usage-based billing.
Devices: desktop and mobile with similar weight, from an iPhone (390 px wide) up to 1920×1080.
Main job of the most-used screen: not confirmed yet (see Open questions).

## Audience and voice
Brazilian creators who use the interface in English. Direct and short, the voice of a professional tool: plain labels, no filler, no exclamation marks.
Language: English. Number and date formats are not decided (see Open questions).

## Mood
Words: crisp, premium, bold. Never like: a generic SaaS dashboard, a gym app, anything too neon, anything childish.

## Brand
- Design system source: `web/src/index.css` (tokens in oklch, light and dark themes) and `web/src/components/ui` (42 shadcn/Radix components, zinc base). Extend it, don't replace it.
- Primary: lime `#bef264`, kept as is. Discipline: only for primary actions and small highlights (focus, selected state, a badge); never on large areas or running text, so it doesn't read as neon.
- Font: Inter Variable. Radius: `0.625rem`. Icons: Lucide.
- Logo: a lime rounded square with an "M", as drawn in the Doop canvas. `www/public/logo.svg` exists (assumed to be the same mark).
- Design tool: the Doop canvas "Mintly" (`wJ5x0T7f9m`) holds two existing dark screens, `Mobile — Sign in` and `Channel — Posts`, which still use hard-coded colours.
- Design system source: `web/src/index.css`; the Doop guide mirrors it (page `Guide`: 40 tokens, 6 components drawn, a component index of 51). Dark is the default theme in Doop; light is `data-doop-theme="light"`. What was last synced is in `web/design-sync.json`.

## References
- Trake.app (https://onepagelove.com/trake-app) — take: big, confident type and the single lime accent on black; avoid: the pink badges and purple gradients (they turn neon).
- Logo Archive (https://onepagelove.com/logo-archive) — take: hierarchy carried by type alone, restraint, one accent colour; avoid: pure black over large UI areas, which tires the eyes in dense screens.
- Simeon (https://onepagelove.com/simeon-sh) — take: dashboard density and small labels; avoid: the grain and noise effects.

Catalog data from One Page Love. The pages are landing pages, not app screens: take type, contrast and density from them, not layouts.

## Constraints
- Phone (390 px) and desktop up to 1920×1080, both first-class: every screen is designed at both ends.
- One icon set: Lucide.
- Accessibility, light/dark default and motion: see Open questions.

## Decisions log
- 2026-11-15 — The design system lives in code (`web/src/index.css`, `web/src/components/ui`); design extends it — brand questions about colours, font and radius were answered by the code.
- 2026-11-15 — Keep `#bef264` with discipline (primary actions and small highlights only) — "never too neon" conflicts with a saturated lime used broadly.
- 2026-11-15 — Doop (canvas `wJ5x0T7f9m`) is the design tool, not Paper or Figma.
- 2026-11-15 — Mood words: crisp, premium, bold — chosen by the person.
- 2026-11-15 — Imported the design system into Doop (canvas `wJ5x0T7f9m`): 40 tokens (31 colour with light and dark, 8 radius, 1 font), the Guide page, and Button, Input, Badge, Card, Switch and Nav item — names as in the code; oklch accepted by Doop, radii resolved to px, dark as the default theme.
- 2026-11-17 — Best moment card (Doop page "Best moment card"): shows only video, title, description, tags and one action, post to YouTube; no score, grades or export buttons — the person asked for just those. Horizontal (video left, text right) from md up, stacked (video on top, text below) on phones; the video plays inside the card; any organization member can post; tags are visual only (AI-generated per clip, no filter or reuse); no "already published" state yet. Built from the existing Button and Badge (secondary) with no new tokens.
- 2026-11-17 — On phones the video area is 4:5 (cropped poster), not full 9:16, so the title and action stay near the first screen of the card.

## Open questions
- Best moment card: the description is cut at 4 lines with no way to read the rest. Add "Show more", or is the cut enough? The title is cut at 2 lines (full text only in code via `title`).
- Best moment card: after "Posted to YouTube", should it link to the video? The API doesn't return the video URL yet.
- Which screen is the most used, and what is its one job? (Channel posts list is a guess, not confirmed.)
- Number and date formats: `pt-BR` or `en-US`? The code mixes them (money in `pt-BR`, dates in `en-US`).
- Default theme: dark, light, or follow the system? Both exist in code; the Doop canvas screens are dark.
- Accessibility target (for example WCAG AA, minimum tap size on mobile)? Not discussed.
- Motion: how much? Not discussed.
- Is `www/public/logo.svg` the same mark as the "M" in the Doop canvas? (assumed)
