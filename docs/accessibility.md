# Accessibility

Target: WCAG 2.1 AA.

## Keyboard

- Every control is a real `<button>`, `<select>`, `<input>`, or
  `role="slider"` and is reachable with Tab in document order.
- `Enter` / `Space` activate buttons natively.
- Global shortcuts (`src/ui/hooks/useKeyboardShortcuts.ts`): `Space`
  play/pause, `→` step, `R` reset, `1`–`6` speed. Suppressed while focus is in
  a text input, textarea, or select.
- Focus indicator: `:focus-visible { outline: 2px solid …; outline-offset: 2px }`
  in `src/ui/styles/global.css`.

## Screen readers

- Dynamic regions — CPU, ready queue, Gantt chart, metrics, event timeline,
  decision inspector — carry `aria-live="polite"` and an `aria-label`.
- The mode buttons expose `aria-pressed`; the leaderboard is `role="dialog"`
  with `aria-modal="true"`.
- Icon-only buttons (remove row, close modal) have `aria-label`s.

## Colour and motion

- Text tokens meet ≥ 4.5:1 on the light background:
  `--color-text` `#1a1a1a` on `#ffffff` ≈ 17:1; `--color-muted` `#5c5c5c`
  ≈ 7:1. Interactive borders and the focus ring exceed 3:1.
- The max/min waiting-time rows use both a fill colour **and** position in a
  labelled table — never colour alone.
- `@media (prefers-reduced-motion: reduce)` disables transitions and
  animations in `global.css`.

## Responsive

Single-column below 900px, two-column above. Wide content (Gantt chart,
tables) scrolls inside its own container; the page body never scrolls
horizontally between 375px and 1920px.
