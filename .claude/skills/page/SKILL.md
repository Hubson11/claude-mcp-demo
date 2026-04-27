# /page

Builds a full React page composed of components — interactively, step by step — and drives it all the way to a merged PR.

Figma = sole source of appearance. Confluence = behaviors, props, data-testid. Both are optional at invocation — missing ones are requested inline.

**Diff after every artifact. Move forward only on confirmation. Ask questions only when genuinely uncertain.**

**Merge-ready output:** this skill drives the full cycle — decompose → implement → E2E → i18n → code review → commit → PR.

---

## Inputs — ask one at a time

Collect inputs sequentially. Never ask for more than one thing per message.

1. If `Figma` URL not provided → ask: "What's the Figma URL for this page?" — wait for answer.
2. If `Page` name not provided → infer from Figma frame name and ask: "I'll call it `<InferredName>` — does that work?" — wait for confirmation or correction.
3. If `Path` not provided → ask: "What's the URL path for this page in the app? (e.g. `/`, `/home`, `/dashboard`)" — wait for answer.
4. If `Confluence` URL not provided and page has forms or complex behavior → ask: "Do you have a Confluence spec for this page?" — wait for answer.
5. `Skip` is optional — user may declare steps to omit upfront (e.g. `Skip: e2e, i18n`). Accepted values: `e2e`, `i18n`, `storybook`, `code-review`. Honor silently — no questions asked about skipped steps.

Only move to Step 1 once Figma URL, Page name, and Path are confirmed.

---

## Step 1 — Fetch Figma tree + decompose

```
mcp__figma__get_design_context(fileKey, nodeId)
```

No depth limit. From the full tree, identify component boundaries using these signals:
- **Repetition** — same structure ≥2 times → reusable component
- **Visual isolation** — distinct background/section → page-section component
- **Interactivity** — Figma has multiple state frames → interactive component
- **Form** — inputs + button + validation → interactive component
- **Navigation** — fixed/sticky → separate component

After identifying component boundaries, **grep for each nodeId** before presenting the breakdown:

```bash
grep -rl "node-id=<nodeId>" src/components/ src/pages/ 2>/dev/null
```

Try both separator variants (`1-234` from URL, `1:234` from API). Show the breakdown annotated with implementation status:

```
PROPOSED COMPONENT BREAKDOWN

HomePage
├── Navbar            interactive   — logo, links, cart, wishlist          ✅ src/components/Navbar
├── HeroSection       page-section  — full-screen slider + CTA             ❌ not implemented
├── FeaturesBar       page-section  — 4 static items                       ❌ not implemented
├── ProductSection    page-section  — filters + 8 product cards            ❌ not implemented
│   └── ProductCard   reusable ×8   — photo, name, price, badge, button    ✅ src/components/ProductCard
├── BlogSection       page-section  — 3 blog cards                         ❌ not implemented
│   └── BlogCard      reusable ×3   — image, title, excerpt, read more     ❌ not implemented
├── Newsletter        interactive   — email + subscribe + validation        ✅ src/components/Newsletter
└── Footer            page-section  — links + copyright                    ✅ src/components/Footer

8 components total: 4 already implemented (skipping), 4 to build

OPEN QUESTIONS:
- [list any ambiguities from Figma here, or "None"]

→ Confirm breakdown, or describe what to change.
```

Components marked `✅` are skipped in Step 3 unless the user explicitly asks to update them.

---

## Step 2 — Read Confluence spec (if URL provided)

Extract the page ID from the URL (numeric segment) and fetch:
```
mcp__atlassian__getConfluencePage(cloudId: "claude-mcp-demo.atlassian.net", pageId: "<id>", contentFormat: "markdown")
```

Extract for each component:
- Props interface (names, types, required/optional)
- States and triggers
- Behaviors (click → what happens → after Xms → what)
- Validations and error messages
- `data-testid` values
- API calls (endpoint, payload, response shape)

Show extracted spec per component. If Confluence URL not provided and page has forms/complex behavior → ask: "No Confluence URL — should I infer behavior from Figma, or do you have a spec?"

---

## Step 2b — Extract CSS tokens + Google Fonts (pre-parallel)

Before spawning any agents, extract design tokens for **all** `❌` components. Do this yourself — do not delegate to agents.

**Reuse Step 1 data first.** The `get_design_context` call in Step 1 may already contain full tree data for each component. Extract tokens from that response before making new calls. Only fetch individually for components where Step 1 data was truncated or incomplete.

For components that need individual fetching, call them **all in one message** (parallel tool calls — not sequential):

```
mcp__figma__get_design_context(fileKey, nodeId-component-A)
mcp__figma__get_design_context(fileKey, nodeId-component-B)
mcp__figma__get_design_context(fileKey, nodeId-component-C)
```

Extract exact values (px — no estimates, no guesses):
- Colors → exact hex or rgba
- Typography → fontFamily, fontWeight, fontSize, lineHeight, letterSpacing
- Spacing → padding (top/right/bottom/left), gap
- Dimensions → width, height

**Google Fonts — do this in the same step.** Collect every unique `fontFamily` + `fontWeight` + italic variant across all `❌` components. Check `index.html` for what's already loaded.

Show one combined diff for both `src/index.css` and `index.html` (if fonts are new). Only tokens/fonts not already present go in the diff.

```diff
 // src/index.css
+ --color-hero-overlay: rgba(0,0,0,0.4);
+ --blog-card-width: 420px;

 // index.html <head>
+<link rel="preconnect" href="https://fonts.googleapis.com">
+<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
+<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
```

Font rules: always `display=swap`, always combine families in one URL, never separate `<link>` per font.

**→ One confirmation for both files, then proceed.**

---

## Step 3 — Build components in parallel

After `index.css` is confirmed, spawn **one Agent per component** that needs to be built. Launch all agents in a **single message** (parallel execution).

Each agent receives this self-contained prompt:

```
Implement a single React component. CSS tokens already in src/index.css — do NOT touch it.

Component: <ComponentName>
Figma fileKey: <fileKey>
Figma nodeId: <nodeId-dash> (e.g. 12-345)
Figma URL: https://www.figma.com/design/<fileKey>?node-id=<nodeId-dash>
Confluence spec: <paste spec or "none — infer from Figma">
Storybook: <"yes" or "skip">

── STEP 0 — Check existing ──────────────────
grep -rl "node-id=<nodeId-dash>\|node-id=<nodeId-colon>" src/components/ src/pages/ 2>/dev/null
If found → report "⚠️ Already at <path> — skipping." and stop.

── STEP 1 — Fetch Figma ─────────────────────
Call mcp__figma__get_design_context(fileKey, "<nodeId-colon>") — colon format, e.g. "12:345".

Record for every layer:
  Node "<name>": size w×h, padding, gap, fill <hex>, font <family weight size/lh ls>
Every CSS value must come from this table. If a value is absent from Figma data, say so.

── STEP 2 — Download missing images ─────────
Check src/assets/<ComponentName>/ first. Download missing files (always use .png as placeholder):
  mkdir -p src/assets/<ComponentName>
  curl -L -o "src/assets/<ComponentName>/<name>.png" "<url>"

After ALL downloads, run this fix sequence in order — no skipping:

  # 1. Rename SVGs saved with wrong extension (Figma serves SVG regardless of URL extension)
  for f in src/assets/<ComponentName>/*.png src/assets/<ComponentName>/*.jpg; do
    [ -f "$f" ] || continue
    if file "$f" | grep -q "SVG"; then mv "$f" "${f%.*}.svg"; fi
  done

  # 2. Fix invisible icons — opacity="0" on root <g> makes icons transparent
  grep -rl 'opacity="0"' src/assets/<ComponentName>/ | xargs -r sed -i 's/opacity="0"/opacity="1"/g'

  # 3. Detect oversized icons — print each SVG that uses relative dimensions
  for f in src/assets/<ComponentName>/*.svg; do
    [ -f "$f" ] || continue
    if grep -q 'width="100%"' "$f"; then
      vb=$(grep -o 'viewBox="[^"]*"' "$f" | head -1)
      echo "OVERSIZED: $f  $vb"
    fi
  done

For every "OVERSIZED" line: parse viewBox (format "0 0 W H") → add to the CSS module:
  .theClassName img { width: Wpx; height: Hpx; display: block; flex-shrink: 0; }

Use the FINAL filename (with correct extension) in all import statements.

── STEP 3 — Implement ───────────────────────
Files: <ComponentName>.tsx, <ComponentName>.module.css, index.ts

- Line 1 of TSX: // figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId-dash>
- Named export only; data-testid on every interactive element and container
- CSS values from extraction table only; reuse existing src/components/ for Figma INSTANCEs

If spec is "none": infer props from Figma node names, behaviors from state frames.

FORMS (if any input/textarea/select):
- Controlled inputs (useState per field)
- Validate on submit; inline errors: <span id="<f>-error" role="alert" aria-live="polite">
- aria-describedby="<f>-error", aria-invalid="true" on invalid after submit attempt
- Disable submit while submitting; clear field error when user types

ACCESSIBILITY:
- Focusable interactive elements, visible focus style (never outline:none without replacement)
- alt="" decorative / alt="desc" meaningful; aria-label on icon-only buttons
- <nav aria-label="...">, logical h1→h2→h3, <label htmlFor> on every input
- No color as sole state indicator

── STEP 4 — Storybook (skip if Storybook=skip)
File: <ComponentName>.stories.tsx — CSF3, tags:['autodocs']
Default story (all required props, realistic values) + one story per Figma variant/state.
Variant stories spread Default.args.

── STEP 5 — Tests ───────────────────────────
File: <ComponentName>.test.tsx
Behaviors from spec (or inferred). No CSS assertions. data-testid selectors only.
Forms: happy path, each validation rule, error visible, error clears on type.

── STEP 6 — Verify ──────────────────────────
npx tsc --noEmit && npm test -- --run src/components/<ComponentName>

Report EXACTLY:
  ✅ <ComponentName> — done (N tests pass)
  ❌ <ComponentName> — failed: <error file:line>
```

**Do not proceed to Step 3b or Step 4 until all agents have reported back.**

Show a status board as agents complete:

```
PARALLEL BUILD STATUS

✅ HeroSection    — done (8 tests pass)
✅ ProductCard    — done (12 tests pass)
⏳ BlogSection    — in progress
❌ FeaturesBar    — failed: tsc error src/components/FeaturesBar/FeaturesBar.tsx:14 — Property 'title' missing

→ Waiting for BlogSection...
```

### Step 3b — Fix failures

For any `❌` component: read the error, fix it yourself in-thread (do not re-spawn an agent for a small fix), show the fix diff before applying, then re-run `tsc + tests`. Mark as `✅` once fixed.

### Step 3c — Compact checkpoint

After all agents are green, the conversation context is at its heaviest (all agent responses accumulated). Before continuing:

```
→ Run /compact now to compress context before proceeding to Step 4.
  This significantly reduces token cost for all remaining steps.
```

Wait for the user to run `/compact` and confirm, then continue.

---

## Step 4 — Page file diff

After all components are built and green, generate the page file:

```diff
diff --git a/src/pages/HomePage/HomePage.tsx b/src/pages/HomePage/HomePage.tsx
new file mode 100644
--- /dev/null
+++ b/src/pages/HomePage/HomePage.tsx
@@ -0,0 +1,30 @@
+// figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
+import { Navbar } from '../../components/Navbar'
+import { HeroSection } from '../../components/HeroSection'
+...
+
+export function HomePage() {
+  return (
+    <main>
+      <Navbar />
+      <HeroSection />
+      ...
+    </main>
+  )
+}
```

And barrel:
```diff
+++ b/src/pages/HomePage/index.ts
+export { HomePage } from './HomePage'
```

If a router is configured (`src/main.tsx` or `src/router.tsx`), show the routing diff too.

**→ Confirm to write, or describe what to change.**

---

## Step 4b — Visual QA

Run the dev server if not already running:

```bash
npm run dev
```

Then run Storybook in a second terminal:

```bash
npm run storybook
```

Present the full visual QA checklist for the user to go through. **Wait for the user to report results before continuing.**

```
VISUAL QA CHECKLIST — [PageName]

─── STORYBOOK  http://localhost:6006 ───────────────────────────────────────

For each component built in this session, open every story and check:

[ComponentName]
  Default story
  □ Loads without errors or console warnings
  □ Font: family, weight, size match Figma
  □ Colors: backgrounds, text, borders match Figma (hex by hex)
  □ Spacing: padding, gap match Figma (px by px)
  □ Dimensions: width, height of containers match Figma
  □ Icons: visible, correctly sized, correct color
  □ Images: displayed, correct object-fit (cover vs contain)

  Variant stories  (list each story name here)
  □ [VariantName] — visually distinct from Default
  □ [VariantName] — visually distinct from Default

  Interactive states (hover/focus/disabled)
  □ Hover state visible (if designed in Figma)
  □ Focus style visible (outline or equivalent) — keyboard Tab to reach it
  □ Disabled state visually distinct (if applicable)

  (repeat block for every component built)

─── PAGE IN APP  http://localhost:5173[Path] ────────────────────────────────

□ Page loads without console errors
□ All sections present and in the correct vertical order
□ Overall layout matches the Figma frame (no missing sections, no extra gaps)

  Desktop (1440px or full-screen):
  □ Layout correct — nothing overflows, nothing wraps unexpectedly

  Tablet (resize to 1024px):
  □ Layout holds — no elements overlap, text readable

  Mobile (resize to 768px):
  □ Layout holds — no horizontal scroll, no text cut off

  Interactions:
  □ All buttons respond on click
  □ Forms: typing works, validation triggers on submit, errors appear, errors clear on re-type
  □ Navigation links work (correct routes)

→ Reply with one of:
  "All checks pass" — to continue to Step 5
  "Found issues: <describe what's wrong>" — I will fix and you re-check
```

**Do not proceed to Step 5 until the user confirms all checks pass.**

For every issue the user reports: read the relevant component file, identify the CSS or logic error, show a fix diff, wait for confirmation, apply, then ask the user to re-check that specific item.

---

## Step 5 — Accessibility audit

Use grep to find likely issues across all built components before reading any file. Run these in one message (parallel):

```bash
# Icon-only buttons missing aria-label
grep -rn "onClick\|<button" src/components/ --include="*.tsx" | grep -v "aria-label"
# Images missing alt
grep -rn "<img" src/components/ --include="*.tsx" | grep -v "alt="
# Inputs missing associated label
grep -rn "<input" src/components/ --include="*.tsx" | grep -v "htmlFor\|aria-label"
# outline:none without replacement
grep -rn "outline.*none" src/components/ --include="*.module.css"
```

Read only the files with matches. Collect **all issues across all components** first, then show one combined fix diff:

```diff
// All accessibility fixes — ComponentA, ComponentB, ComponentC
- <button onClick={...}><img src={icon} /></button>
+ <button onClick={...} aria-label="Close"><img src={icon} alt="" /></button>
...
```

**→ One confirmation for all fixes, then apply.**

If grep finds no issues: write `✅ Accessibility — no issues found.`

---

## Step 6 — E2E assessment

If `Skip: e2e` was provided → write `E2E skipped — user requested.` and go to Step 7.

If Step 1 found **no interactive components** (no forms, no navigation changes, no Figma state frames) → write `E2E skipped — page is static, unit tests sufficient.` and go to Step 7.

Otherwise evaluate:

```
E2E ASSESSMENT — [PageName]

Flows identified:
- [flow] — [reason E2E is needed]

Static sections (no E2E needed):
- [section] — display only

Recommendation: [write E2E for X flows / skip — unit tests sufficient]

→ Proceed with E2E?
```

Wait for confirmation.

**If confirmed:** write `cypress/e2e/<page-name>.cy.ts` using these rules:
- One `describe` per flow
- `beforeEach` visits the page — every test is fully independent
- `data-testid` selectors exclusively — no CSS classes, no `:nth-child`, no text selectors unless asserting visible text
- No `cy.wait(ms)` — use `.should()` for async assertions
- `cy.clock()` + `cy.tick()` for timed state changes (e.g. "Added" reverts after 2s)

Run:
```bash
npm run build && npm run preview &
npm run cy:run -- --spec "cypress/e2e/<page-name>.cy.ts"
```

Fix any failures before proceeding. Do not mark done until all E2E tests are green.

**If declined:** write `E2E skipped — [reason].` and proceed to Step 7.

---

## Step 7 — i18n scan

If `Skip: i18n` was provided → write `i18n skipped — user requested.` and go to Step 8.

For each component built in Step 3, scan the `.tsx` file for hardcoded user-visible strings:

```
i18n SCAN — [ComponentName]

Hardcoded strings found:
  "Add to Cart"   → home.productCard.button.addToCart
  "Sale"          → home.productCard.badge.sale
  "Subscribe"     → home.newsletter.button.submit

→ Localize these? (YES / skip)
```

Check also: `placeholder` in `<input>`, `aria-label` on interactive elements, `alt` on meaningful images.

**If confirmed:**
1. Add keys to `src/locales/en.json` and `src/locales/pl.json` following the `page.component.element` hierarchy
2. Add `useTranslation` hook to each component
3. Replace strings with `t('key')` calls
4. Run `npx tsc --noEmit && npm test -- --run`

If `src/locales/` does not exist → ask: "No i18n setup found — should I set it up, or skip i18n for now?"

**If no hardcoded strings:** write `✅ i18n — no hardcoded strings found.`

---

## Step 8 — Build + final verification

If all agents in Step 3 reported ✅ and no files were modified after agents ran (Steps 5, 7 produced no changes) → skip `tsc` and `npm test`, run only:

```bash
npm run build
```

Otherwise run the full suite:

```bash
npx tsc --noEmit && npm test -- --run && npm run build
```

Show full output. Fix anything broken before proceeding. Do not continue to Step 9 if any check fails.

---

## Step 9 — Code review

If `Skip: code-review` was provided → go to Step 10.

Run: `git diff main...HEAD`

Analyze the diff:
- **HIGH** — bugs, logic errors, missing types, broken behavior, missing `data-testid` on interactive elements, form without validation, `any` usage
- **MEDIUM** — missing error states, accessibility gaps not caught in Step 5, weak test assertions, missing edge cases
- **LOW** — magic numbers, inconsistent naming, dead code, overly long functions

Format:
```
[HIGH]   src/components/Foo/Foo.tsx:42 — description + fix
[MEDIUM] src/components/Bar/Bar.tsx:18 — description + fix
[LOW]    src/index.css:7 — description
```

Collect **all HIGH issues** first, then show them in a single combined diff with one confirmation. Do not show and wait per issue.

Present MEDIUM issues as a list — one confirmation for all. Skip LOW unless user asks.

---

## Step 10 — Commit → Push → PR

Stage all new and modified files explicitly (never `git add .`):

```bash
git add src/components/<ComponentName>/   # one per new component
git add src/pages/<PageName>/
git add src/index.css
git add index.html                         # if fonts were added
git add cypress/e2e/<page-name>.cy.ts      # if E2E was written
git add src/locales/                       # if i18n was added
```

Write commit:
```bash
git commit -m "$(cat <<'EOF'
feat: implement <PageName> page

- <N> new components: <list>
- E2E tests for <X flows, or "none — static page">
- i18n keys added <or "none">

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Push:
```bash
git push -u origin <branch>
```

Create PR:
```bash
gh pr create --assignee @me --title "feat: implement <PageName>" --body "$(cat <<'EOF'
## Summary
- Implemented <PageName> with <N> components: <list>
- <note any notable behaviors, forms, interactions>

## Figma
<Figma URL>

## Test plan
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm test -- --run` — all pass
- [ ] `npm run build` — succeeds
- [ ] E2E: <"all pass" or "N/A — static page">
- [ ] i18n: <"keys added" or "N/A">

## Screenshots
<!-- Figma screenshot vs browser side by side -->
EOF
)"
```

Return the PR URL.

---

## Pre-done checklist

Before marking the skill as complete, verify every item:

- [ ] All components pixel-perfect vs Figma screenshot
- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] Unit tests: all pass (`npm test -- --run`)
- [ ] E2E tests: all pass, or "N/A" documented
- [ ] i18n: no hardcoded user-visible strings remaining, or "N/A" documented
- [ ] Accessibility: all Step 5 checks passed
- [ ] `npm run build` succeeds
- [ ] Code review: all HIGH issues resolved
- [ ] PR created — URL returned to user

---

## Rules

- Ask questions only when: required input is missing, Figma has conflicting signals, component boundary is genuinely ambiguous
- Never write files before showing diff and getting confirmation — **except agents in Step 3** which write directly (no confirmation loop inside agents)
- All tokens go to `index.css` **before** agents start — agents must never touch `index.css`
- Launch all component agents in one message — never one at a time
- Fix agent failures yourself in-thread after all agents complete — do not re-spawn for small fixes
- If user gives feedback on the breakdown → apply it, show updated breakdown, wait again
- Step 2b: always call multiple `get_design_context` in one message (parallel), never sequentially
- Step 2b: always try to reuse Step 1 data before making new Figma calls

---

## Usage

Provide all inputs upfront to skip every question and go straight to Step 1:

```
/page
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Page: HomePage
Path: /home
Skip: e2e, i18n
```

`Skip` accepts: `e2e`, `i18n`, `storybook`, `code-review` (comma-separated, any combination).
