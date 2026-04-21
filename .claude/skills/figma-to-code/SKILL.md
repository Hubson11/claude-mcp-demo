# /figma-to-code

Implementuje komponent lub stronę w sposób **pixel-perfect** na podstawie Figmy.
Confluence dostarcza wyłącznie specyfikację funkcjonalną — NIGDY nie wpływa na wygląd.

---

## Złota zasada

> **Figma = jedyne źródło prawdy dla wyglądu.**
> Jeśli Confluence mówi "przycisk ma być zielony" a Figma pokazuje czarny — implementujesz czarny.
> Confluence opisuje CO robi komponent, Figma mówi JAK WYGLĄDA.

---

## Krok 1 — Pobierz pełne drzewo Figmy

```
mcp__figma__get_figma_data(fileKey, nodeId)
```

- NIE używaj parametru `depth` — pobierz pełne drzewo (domyślnie bez limitu).
- Przeczytaj **każdy** węzeł: typ, fills, strokes, effects, layout, typography.
- Zidentyfikuj wszystkie dzieci rekurencyjnie.
- Zapis do zmiennej — będziesz wracał do tej struktury wielokrotnie.

### Co wyekstrahować z odpowiedzi Figmy

**Kolory (fills)**
- Każdy fill typu `SOLID` → `#RRGGBB` lub `rgba(r,g,b,a)`
- Fill typu `IMAGE` → zapamiętaj `imageRef` do pobrania w kroku 2
- Fill typu `GRADIENT` → odwzoruj jako `linear-gradient` / `radial-gradient`
- Opacity na węźle → nakładaj na kolor jako alpha

**Typografia (textStyle)**
- `fontFamily` → zainstaluj przez Google Fonts jeśli nie systemowy
- `fontWeight` → mapuj: Thin=100, ExtraLight=200, Light=300, Regular=400, Medium=500, SemiBold=600, Bold=700, ExtraBold=800, Black=900
- `fontSize` → px
- `lineHeight` → jeśli podane w px użyj px, jeśli % przelicz
- `letterSpacing` → jeśli w % → `em` (10% = 0.1em), jeśli px → px
- `textCase` → UPPER→`text-transform: uppercase`, LOWER→`lowercase`, TITLE→`capitalize`
- `textAlignHorizontal` → `text-align`
- `textDecoration` → `STRIKETHROUGH`→`line-through`, `UNDERLINE`→`underline`

**Layout (layout_*)**
- `mode: none` → `position: absolute` lub static (sprawdź context)
- `mode: row` → `display: flex; flex-direction: row`
- `mode: column` → `display: flex; flex-direction: column`
- `gap` → `gap`
- `padding` → `padding` (shorthand: top right bottom left)
- `alignItems` → `align-items`
- `justifyContent` → `justify-content`
- `sizing.horizontal: hug` → `width: fit-content`
- `sizing.horizontal: fill` → `flex: 1` lub `width: 100%`
- `sizing.horizontal: fixed` + `dimensions.width` → `width: Xpx`
- `locationRelativeToParent.x/y` → jeśli parent jest `mode: none` → `position: absolute; left: Xpx; top: Ypx`
- `dimensions.width/height` → `width/height` (lub `max-width` dla kontenerów)

**Obramowania (strokes)**
- `strokeWeight` z kierunkiem (np. `1px 0px 0px 1px` = top + left) → `border-top`, `border-left`
- Kolor stroke → `border-color`
- Styl linii → `solid` / `dashed` / `dotted`

**Efekty (effects)**
- `DROP_SHADOW` → `box-shadow: offsetX offsetY blur spread color`
- `INNER_SHADOW` → `box-shadow: inset ...`
- `LAYER_BLUR` → `filter: blur(Xpx)`
- `BACKGROUND_BLUR` → `backdrop-filter: blur(Xpx)`

**Border radius**
- Jednolity → `border-radius: Xpx`
- Asymetryczny → `border-radius: TL TR BR BL`

**Opacity**
- Węzeł z `opacity < 1` → CSS `opacity` LUB wbuduj w kolor jeśli chodzi o tło

---

## Krok 2 — Pobierz obrazy z Figmy

Dla **każdego** `imageRef` znalezionego w drzewie (tła, zdjęcia produktów, ikony rastrowe):

```
mcp__figma__download_figma_images(fileKey, [nodeId1, nodeId2, ...])
```

- Pobierz URL do każdego obrazu.
- Zapisz obrazy do `src/assets/` z opisową nazwą (np. `hero-bg.jpg`, `product-1.jpg`).
- Użyj tych plików w komponentach — **nigdy placeholderów z zewnętrznych serwisów**.
- Dla ikon SVG — pobierz jako SVG i wstaw inline lub jako ReactComponent.

---

## Krok 3 — Odczytaj spec funkcjonalną z Confluence

Z Confluence bierzesz WYŁĄCZNIE:
- Props interface (nazwy, typy, required/optional)
- `data-testid` atrybuty
- Opisy zachowań: co się dzieje po kliknięciu, walidacje, animacje
- Stany komponentu: hover, active, disabled, loading, error, success
- Tekst treści (nagłówki, etykiety, placeholdery) — ale tylko jeśli nie widać ich wprost w Figmie

**Nigdy z Confluence:**
- Kolory, rozmiary fontów, spacingi, border-radius, cienie
- Układ (grid, flex, pozycje)
- Animacje CSS

---

## Krok 4 — Zbuduj mapę tokenów

Przed napisaniem JAKIEGOKOLWIEK kodu, wylistuj wszystkie tokeny jako słownik:

```
KOLORY:
  bg-primary: #ffffff
  text-primary: #000000
  border: #e0e0e0
  badge-sale: #c0392b
  ...

TYPOGRAFIA:
  heading-hero: Noto Sans 400 50px / 61px
  heading-section: Noto Sans 400 35px / 42px
  nav-link: Noto Sans 600 11px / 16px, LS=0.1em, UPPER
  body: Nunito Sans 400 18px / 22px
  ...

SPACING:
  container-max: 1640px
  container-px: 140px
  nav-height: 90px
  section-py: 80px
  ...

WYMIARY:
  product-card: 408.75 × 622.3px
  hero: 1920 × 1080px
  ...
```

Zdefiniuj te tokeny jako CSS custom properties w `index.css`. To jest fundament.

---

## Krok 5 — Implementuj komponent warstwowo

Implementuj od zewnątrz do wewnątrz, warstwa po warstwie:

### 5a. Struktura HTML (semantyczna)
- Użyj znaczników semantycznych: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Zachowaj hierarchię z Figmy (parent → child)
- Dodaj wszystkie `data-testid` z Confluence
- Dodaj `aria-label` dla interaktywnych elementów bez tekstu

### 5b. CSS module (`.module.css`)
- Jeden plik CSS na komponent
- Klasy odpowiadają węzłom z Figmy (np. `.card`, `.imageWrapper`, `.content`)
- Dla każdej klasy: skopiuj dokładnie wymiary, spacing, kolory, typografię z tokenów
- Używaj `position: absolute` dla elementów z `locationRelativeToParent` w Figmie
- Używaj `position: relative` na ich parentach

### 5c. Stany interaktywne
- Figma często ma osobne frame'y dla stanów (hover, active, focus)
- Jeśli widoczne w drzewie — zaimplementuj jako CSS `:hover`, `:focus`, `:active`
- Transition: `0.2s ease` dla kolorów i opacity, `0.4s ease` dla transform

### 5d. Responsive
- Sprawdź czy Figma ma osobne frame'y na mobile/tablet
- Jeśli nie — zachowaj proporcje i użyj breakpointów: 1440px, 1024px, 768px, 480px
- Na mobile: absolute layout zamień na flexbox column

### 5e. Ikony i SVG
- Rekonstruuj ikony SVG z Figmy jako inline SVG
- Rozmiar, `viewBox`, `stroke`, `fill` — dokładnie z Figmy
- Nie używaj bibliotek ikon jeśli ikona jest w Figmie

---

## Krok 6 — Weryfikacja wizualna

Po implementacji uruchom dev server i porównaj z Figmą:

```bash
npm run dev
```

Sprawdź każdy element:

| Element | Co sprawdzić |
|---|---|
| Fonty | Rodzina, waga, rozmiar, line-height, letter-spacing |
| Kolory | Tło, tekst, border, ikony — hex po hex |
| Spacing | Padding, margin, gap — piksel po pikselu |
| Wymiary | Szerokość, wysokość elementów |
| Obrazy | Czy są prawdziwe assety z Figmy (nie placeholdery) |
| Ikony | Kształt, rozmiar, kolor stroke/fill |
| Stany | Hover, focus, active wyglądają jak w Figmie |
| Responsive | Layout nie psuje się na 768px i 480px |

Dla każdej rozbieżności: wróć do kroku 2/3 i popraw CSS. **Nie commituj dopóki nie osiągniesz akceptowalnej zgodności.**

---

## Krok 7 — Testy

Testy weryfikują ZACHOWANIE, nie wygląd:

```tsx
// Dobry test
it('calls onAddToCart when button clicked')
it('shows "Added" text for 2s after click')
it('filters products by category')

// Zły test (nie testuj CSS)
it('has black background') // ← NIE
it('font-size is 18px')    // ← NIE
```

Źródło dla testów: **Confluence** (zachowania, stany, walidacje).
Źródło dla selektorów: `data-testid` z Confluence.

---

## Krok 8 — Checklist przed commitem

- [ ] Wszystkie obrazy są pobrane z Figmy (nie zewnętrzne URL)
- [ ] Fonty są załadowane (Google Fonts lub lokalne)
- [ ] Kolory zgadzają się z Figmą (wizualnie)
- [ ] Spacing/padding zgadza się z Figmą
- [ ] Nie ma hardcodowanych wartości bez podstawy w Figmie
- [ ] `data-testid` na wszystkich elementach z Confluence
- [ ] Testy przechodzą: `npm test`
- [ ] Build przechodzi: `npm run build`
- [ ] Dev server wygląda jak Figma

---

## Typowe błędy i jak ich unikać

| Błąd | Poprawne podejście |
|---|---|
| Użycie placeholder images | Zawsze `mcp__figma__download_figma_images` |
| Zgadywanie spacingów | Czytaj `padding`/`gap` z `layout_*` w Figmie |
| Zmiana fontów bo "ładniej wyglądają" | Użyj dokładnie fontFamily z Figmy |
| Dodawanie własnych animacji | Tylko to co widać w Figmie (osobne stany) |
| Interpretowanie layoutu z głowy | Czytaj `mode`, `locationRelativeToParent`, `dimensions` |
| Używanie rem/em zamiast px | Używaj px dla wartości z Figmy, rem tylko dla fluid typography |
| Pominięcie efektów | `DROP_SHADOW`, `BLUR` z Figmy → CSS `box-shadow`, `filter` |

---

## Wywołanie

```
/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Komponent: ProductCard
```
