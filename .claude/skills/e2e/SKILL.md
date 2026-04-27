---
name: e2e
description: Write Cypress E2E tests for a completed page — assesses whether E2E is warranted first, identifies user flows, uses data-testid selectors exclusively.
---

# /e2e

Writes Cypress E2E tests for a completed page or flow. Asks first whether E2E is warranted — not every component needs it.

**Core principle**: E2E tests verify USER JOURNEYS, not component internals. Unit tests cover logic; E2E covers the path a real user takes through the UI.

---

## Step 1 — Decide if E2E is needed

Before writing a single line, answer these questions:

| Question | If YES | If NO |
|---|---|---|
| Does this page contain an interactive user flow? (form, cart, navigation) | E2E warranted | Skip |
| Do multiple components need to work together for a feature to function? | E2E warranted | Probably unit tests are enough |
| Is there a critical path a user must be able to complete? (checkout, signup, search) | E2E warranted | Skip |
| Is this a purely visual / static section? | Skip | — |

**Present the assessment to the user:**

```
E2E ASSESSMENT — [PageName]

Flows identified:
- [flow 1] — [reason it warrants E2E]
- [flow 2] — [reason it warrants E2E]

Static sections (no E2E needed):
- [section] — display only

Recommendation: [write E2E for X flows / skip E2E — unit tests sufficient]

Proceed?
```

**Wait for confirmation before writing any tests.**

---

## Step 2 — Identify user flows

For each flow that was approved, define it as a sequence of user actions:

```
FLOW: Add product to cart
1. User sees a product card
2. User clicks "Add to Cart"
3. Button changes to "Added"
4. Cart count in navbar increments by 1
5. After 2s, button returns to "Add to Cart"
```

```
FLOW: Newsletter signup — success
1. User types a valid email in the newsletter input
2. User clicks "Subscribe"
3. Success message appears
4. Input is cleared
```

```
FLOW: Newsletter signup — validation error
1. User types an invalid email
2. User clicks "Subscribe"
3. Error message appears
4. Form is not submitted
```

Source for flows: **Confluence** (behaviors, states, validations).
Source for selectors: **`data-testid`** attributes from the implemented components.

---

## Step 3 — List all `data-testid` selectors needed

Before writing tests, map every action and assertion to a `data-testid`:

```
SELECTORS NEEDED:
- product-card           → cy.get('[data-testid="product-card"]')
- add-to-cart-btn        → .find('[data-testid="add-to-cart-btn"]')
- navbar-cart-count      → cy.get('[data-testid="navbar-cart-count"]')
- newsletter-input       → cy.get('[data-testid="newsletter-input"]')
- newsletter-submit-btn  → cy.get('[data-testid="newsletter-submit-btn"]')
- newsletter-success-msg → cy.get('[data-testid="newsletter-success-msg"]')
- newsletter-error-msg   → cy.get('[data-testid="newsletter-error-msg"]')
```

If a `data-testid` is missing from the implemented component → **stop and add it first** before writing tests. Do not use CSS classes, text content, or index-based selectors.

---

## Step 4 — Write the tests

### File location
```
cypress/e2e/<page-name>.cy.ts
```

One file per page. Multiple `describe` blocks within the file — one per flow.

### Structure
```ts
describe('[PageName] — [Flow name]', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('[what the user can do]', () => {
    // Arrange — get to the starting state
    // Act — perform the user action
    // Assert — verify the result
  })
})
```

### Rules
- `beforeEach` visits the page — tests are independent, never chained
- Use `data-testid` selectors exclusively — no `.class`, no `:nth-child`, no text-based selectors except when checking visible text as the assertion itself
- Assert the outcome the user sees, not internal state
- Use `cy.clock()` / `cy.tick()` for timed state changes (e.g. "Added" reverts after 2s)
- No `cy.wait(ms)` — use `cy.get().should()` for async assertions

### Example
```ts
describe('Home — ProductCard interactions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('shows "Added" after clicking Add to Cart, then reverts after 2s', () => {
    cy.clock()
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-cart-btn"]').click()
      cy.get('[data-testid="add-to-cart-btn"]').should('have.text', 'Added')
    })
    cy.tick(2000)
    cy.get('[data-testid="product-card"]').first()
      .find('[data-testid="add-to-cart-btn"]')
      .should('have.text', 'Add to Cart')
  })

  it('does not add to cart when product is sold out', () => {
    cy.get('[data-testid="product-card"][data-disabled="true"]').first().within(() => {
      cy.get('[data-testid="add-to-cart-btn"]').should('be.disabled')
    })
  })
})

describe('Home — Newsletter', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('shows success message after valid email submission', () => {
    cy.get('[data-testid="newsletter-input"]').type('test@example.com')
    cy.get('[data-testid="newsletter-submit-btn"]').click()
    cy.get('[data-testid="newsletter-success-msg"]').should('be.visible')
    cy.get('[data-testid="newsletter-input"]').should('have.value', '')
  })

  it('shows error message for invalid email', () => {
    cy.get('[data-testid="newsletter-input"]').type('not-an-email')
    cy.get('[data-testid="newsletter-submit-btn"]').click()
    cy.get('[data-testid="newsletter-error-msg"]').should('be.visible')
    cy.get('[data-testid="newsletter-success-msg"]').should('not.exist')
  })
})
```

---

## Step 5 — Run the tests

Cypress connects to `http://localhost:4173` (configured in `cypress.config.ts`). That is the `vite preview` port — **not** the dev server. Before running Cypress, build and start preview:

```bash
npm run build && npm run preview
```

Then in a separate terminal:

```bash
npm run cy:run -- --spec "cypress/e2e/<page-name>.cy.ts"
```

Or open interactively to debug:
```bash
npm run cy:open
```

If a test fails:
- Read the error and screenshot in `cypress/screenshots/`
- Check if the `data-testid` selector exists in the rendered HTML
- Check if timing is the issue → use `cy.clock()` / `cy.tick()`
- Fix the test or the component, then re-run

**Do not mark done until all tests are green.**

---

## Step 6 — Pre-done checklist

- [ ] E2E assessment shown to user and approved
- [ ] All flows identified and mapped to user actions
- [ ] Only `data-testid` selectors used — no CSS classes, no text selectors
- [ ] Each test is independent (`beforeEach` visits the page)
- [ ] No `cy.wait(ms)` — async handled with `.should()`
- [ ] `cy.clock()` used for any timed behavior
- [ ] All tests pass: `npx cypress run`
- [ ] No unit test coverage duplicated in E2E

---

## When NOT to write E2E

- Static display sections (hero image, features bar, footer links)
- Behavior already fully covered by unit tests with no integration risk
- Purely cosmetic states (hover colors, transitions)
- Tests that would only pass with a running backend (mock at the network layer instead)

---

## Usage

```
/e2e
Page: Home
Components: ProductCard, Newsletter, Navbar
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>  ← optional
```
