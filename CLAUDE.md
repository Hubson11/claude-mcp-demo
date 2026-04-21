# Nexus Store — Claude Orchestration Guide

## Project overview
Demo project: **"Orchestrating Claude with MCP"**
A React + Vite + TypeScript e-commerce app for "Nexus Store". Claude orchestrates the full development workflow using MCP servers and custom skills.

## Stack
- React 19 + TypeScript + Vite
- Vitest (unit tests) + React Testing Library
- Cypress (E2E tests)
- React Router v7
- GitHub Actions CI

## MCP Servers available
- **Figma** (`mcp__figma__*`) — jedyne źródło prawdy dla WYGLĄDU
- **Confluence** — źródło specyfikacji FUNKCJONALNEJ (zachowania, props, testy)

## Źródła prawdy — kluczowy podział

| Co | Źródło | Przykład |
|---|---|---|
| Kolory, fonty, spacing, wymiary, cienie, ikony | **Figma ONLY** | `#000000`, `Noto Sans 50px`, `padding: 12px 50px` |
| Obrazy, tła, zdjęcia produktów | **Figma ONLY** (`mcp__figma__download_figma_images`) | hero bg, product photos |
| Props interface, typy | **Confluence** | `price: number`, `badge?: 'Sale' \| 'New'` |
| Zachowania, interakcje | **Confluence** | "Added na 2s po kliknięciu" |
| `data-testid` atrybuty | **Confluence** | `data-testid="add-to-cart-btn"` |
| Walidacje, stany błędów | **Confluence** | "waliduj format email" |

> **Zasada**: jeśli Confluence mówi coś o wyglądzie a Figma pokazuje inaczej — Figma wygrywa zawsze.

## Custom skills available

| Skill | Kiedy używać |
|---|---|
| `/figma-to-code` | **Główny skill implementacji** — pixel-perfect z Figmy + spec z Confluence |
| `/commit` | Po implementacji — stwórz dobrze sformatowany commit |
| `/push` | Wypchnij branch na remote |
| `/pr` | Otwórz GitHub Pull Request z opisem |
| `/code-review` | Przejrzyj własny diff i wygeneruj listę uwag |
| `/review-fixer` | Przeczytaj uwagi z code-review, oceń i zastosuj poprawki |
| `/pr-babysitter` | Śledź CI na otwartym PR, automatycznie naprawiaj błędy (uruchom w /loop) |
| `/flaky-finder` | Skanuj logi GitHub Actions pod kątem flaky testów, twórz GitHub Issue |

## Standard implementation workflow

Gdy prosisz o implementację komponentu lub strony:

1. **Uruchom `/figma-to-code`** — zawiera pełny, szczegółowy proces:
   - Pobierz pełne drzewo Figmy (bez limitu głębokości)
   - Pobierz wszystkie obrazy z Figmy (`mcp__figma__download_figma_images`)
   - Odczytaj spec funkcjonalną z Confluence
   - Wyekstrahuj tokeny (kolory, typografia, spacing)
   - Implementuj warstwowo: HTML → CSS → stany → responsive
   - Zweryfikuj wizualnie przez `npm run dev`
   - Iteruj aż do pixel-perfect
2. **Test** — testy weryfikują zachowanie (z Confluence), nie wygląd
3. **Publish** — `/commit` → `/push` → `/pr`
4. **Review loop** — `/code-review` → `/review-fixer` → `/commit` → `/push`
5. **Babysit** — `/pr-babysitter` w `/loop` do watchowania CI

## Jak podać URL w prompcie

```
/figma-to-code
Figma: https://www.figma.com/design/<fileKey>?node-id=<nodeId>
Confluence: https://<site>.atlassian.net/wiki/spaces/<space>/pages/<pageId>
Komponent: <NazwaKomponentu>
```

## Project conventions
- Components: PascalCase, jeden folder na komponent z `index.ts` barrel
- Tests: co-located `*.test.tsx` obok komponentu
- `data-testid` na wszystkich interaktywnych elementach i kontenerach
- CSS: component-scoped `.module.css`
- Brak default exports z komponentów (tylko named exports)
- Obrazy z Figmy: `src/assets/<component-name>/`
- CSS tokens: zdefiniowane jako custom properties w `src/index.css`
