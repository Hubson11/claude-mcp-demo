# /i18n

Adds or updates translations for a component. Locates hardcoded strings in TSX, proposes keys, updates locale files, replaces strings with `t()` calls.

**Core principle**: One file per language (`en.json`, `pl.json`). Keys organized by page, then by component/section. Never guess a translation — if you do not know the equivalent in a given language, mark it as `"TODO: <original text>"`.

---

## File structure

```
src/
  i18n.ts              ← i18next configuration
  locales/
    en.json            ← all keys in English
    pl.json            ← all keys in Polish
```

Key structure: `page.component.element.variant`

```json
{
  "home": {
    "navbar": {
      "links": { "home": "Home" }
    },
    "productCard": {
      "button": { "addToCart": "Add to Cart" },
      "badge": { "sale": "Sale" }
    }
  },
  "shop": {
    "filters": {
      "heading": "Filter by"
    }
  }
}
```

**Structure rules:**
- Level 1 = page (`home`, `shop`, `about`, `blog`)
- Level 2 = component or section (`navbar`, `productCard`, `footer`)
- Level 3+ = element and variant (`button.addToCart`, `badge.sale`)
- Keys written in `camelCase`
- Keys describe the element, not the content (`addToCart` not `addToCartText`)

---

## Step 1 — Identify the page and component

Determine:
- On which page is the component? → level 1 of the key
- What is the component name? → level 2 of the key

If the component appears on multiple pages (e.g. `Navbar`, `Footer`) → place it under the page where it is rendered, or under `common` if it is global.

---

## Step 2 — Detect hardcoded strings

Review the component TSX file and find every place where a string is hardcoded:

```tsx
// ❌ hardcoded — needs localization
<button>Add to Cart</button>
<span>Sale</span>
<p>Thank you for subscribing!</p>

// ✅ already localized — skip
<button>{t('home.productCard.button.addToCart')}</button>
```

List all found strings in the format:
```
"Add to Cart"     → home.productCard.button.addToCart
"Sale"            → home.productCard.badge.sale
"Thank you..."    → home.newsletter.success
```

Also check:
- `placeholder` in `<input>`
- `aria-label` on interactive elements
- `alt` on `<img>` if it contains meaningful text (not decorative)
- Strings in `title` and tooltips

---

## Step 3 — Propose keys and ask for approval

Display a proposal table:

```
i18n KEY PROPOSALS — [ComponentName]

| String                          | Key                                      | EN                    | PL                      |
|---|---|---|---|
| "Add to Cart"                   | home.productCard.button.addToCart        | Add to Cart           | Dodaj do koszyka        |
| "Added"                         | home.productCard.button.added            | Added                 | Dodano                  |
| "Sale"                          | home.productCard.badge.sale              | Sale                  | Wyprzedaż               |
| "Thank you for subscribing!"    | home.newsletter.success                  | Thank you...          | Dziękujemy...           |

Do you approve these keys and translations? (YES / change X to Y)
```

**Wait for confirmation before modifying any files.**

---

## Step 4 — Update locale files

After approval, add keys to both files. Follow the existing structure — insert keys in the correct place in the hierarchy, not at the end of the file.

### Update rules:
- If the page section already exists → add the key in the right place
- If the page section does not exist → add a new block
- If the key already exists with a different value → **do not overwrite**, display the conflict and ask
- Maintain alphabetical sorting of keys at the same level
- No duplicates — if the same string appears in 2 places, use one key

```json
// en.json — add in the correct place
{
  "home": {
    "productCard": {
      "button": {
        "addToCart": "Add to Cart",
        "added": "Added",
        "soldOut": "Sold Out"
      },
      "badge": {
        "new": "New",
        "sale": "Sale"
      }
    }
  }
}
```

---

## Step 5 — Update the TSX component

Replace hardcoded strings with `t()` calls:

### Hook import
```tsx
import { useTranslation } from 'react-i18next'
```

### Usage in the component
```tsx
export function ProductCard({ ... }: ProductCardProps) {
  const { t } = useTranslation()

  return (
    <article>
      {badge && <span>{t(`home.productCard.badge.${badge.toLowerCase()}`)}</span>}
      <button onClick={handleAddToCart}>
        {isAdded ? t('home.productCard.button.added') : t('home.productCard.button.addToCart')}
      </button>
    </article>
  )
}
```

### Replacement rules:
- `t('key')` for static strings
- `t('key', { count })` for pluralization
- `t('key', { name: value })` for variable interpolation
- Dynamic keys (e.g. from a `badge` prop) → template literal: `` t(`page.comp.badge.${badge}`) ``
- `placeholder` in input: `placeholder={t('home.newsletter.input.placeholder')}`
- `aria-label`: `aria-label={t('home.navbar.cart.label')}`

---

## Step 6 — Verification

```bash
npx tsc --noEmit
npm test -- --run
```

Check that:
- [ ] TypeScript reports no errors after adding `useTranslation`
- [ ] Tests do not fail (tests check `data-testid` and behavior — they should not be sensitive to text changes unless they were checking specific strings)
- [ ] In the dev server texts display correctly (not `undefined` or a key instead of a translation)

If a test was checking a hardcoded string (e.g. `toHaveTextContent('Add to Cart')`) → update it to use `data-testid` or pass the translation key through `t()`.

---

## Step 7 — Pre-done checklist

- [ ] All hardcoded strings in TSX localized
- [ ] Keys added to `en.json` and `pl.json`
- [ ] Key structure: `page.component.element.variant`
- [ ] No duplicate keys in locale files
- [ ] `useTranslation` imported and used
- [ ] `placeholder`, `aria-label`, `alt` also localized (if meaningful)
- [ ] TypeScript: 0 errors
- [ ] Tests: 0 failures

---

## When NOT to localize

- `data-testid` values — these are technical attributes, not content
- CSS class names
- Variable names, prop names, object keys
- Dates and numbers that have their own formatting (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- Content generated dynamically from an API (localize labels, not data)

---

## Usage

```
/i18n
Component: ProductCard
Page: home
File: src/components/ProductCard/ProductCard.tsx
```
