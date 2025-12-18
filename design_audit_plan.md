# Design Audit & Text Size Optimization Plan

## 1. Executive Summary

The site currently uses arbitrary pixel values (`text-[36px]`, `text-[116px]`, etc.) leading to visual inconsistency and maintenance overhead. The design "spacing" feels correct, but the _system_ behind the sizing is loose. Additionally, the Hero video area is too constrained on desktop.

## 2. Typography Audit

**Current State:**

- Random sizes: 13px, 15px, 16px, 17px, 18px, 20px, 32px, 36px, 42px, 48px, 55px, 56px, 60px, 64px, 80px, 100px, 116px.
- Inconsistent line-heights and tracking.
- Hard-coded values in multiple components.

**Proposed System (Semantic Scale):**
We will implement a semantic typography system in `globals.css` using Tailwind's `@apply` layer.

| Class              | Desktop Size | Mobile Size | Line Height | Tracking | Usage                         |
| :----------------- | :----------- | :---------- | :---------- | :------- | :---------------------------- |
| `.type-hero`       | 128px        | 48px        | 0.9         | -0.03em  | "UNITING THE CHURCH"          |
| `.type-h1`         | 72px         | 36px        | 1.05        | -0.02em  | "MAKING DISCIPLES"            |
| `.type-h2`         | 42px         | 24px        | 1.1         | -0.01em  | "MORE EVENTS", "THE MOVEMENT" |
| `.type-body-large` | 24px         | 18px        | 1.6         | 0        | Pull quotes, Intro text       |
| `.type-body`       | 18px         | 16px        | 1.6         | 0        | Standard paragraphs           |
| `.type-nav`        | 17px         | 15px        | 1.2         | -0.01em  | Navigation links              |
| `.type-label`      | 14px         | 12px        | 1.2         | 0.05em   | Buttons, Captions, Labels     |

## 3. Hero Section Optimization

**Problem:** The Hero video/image container is `h-[55vh]`, which feels "letterboxed" on modern large screens.
**Solution:** Increase desktop height to `h-[75vh]` or `h-[80vh]` while maintaining `h-[55vh]` or `h-[60vh]` on mobile to keep the fold content accessible.

## 4. Implementation Steps

### Phase 1: System Definition

1.  **Define Classes:** Update `app/globals.css` with the `.type-*` classes defined above.
2.  **Safety Check:** Ensure these classes override existing Tailwind utilities cleanly.

### Phase 2: Component Refactor

3.  **App Page:** Replace hardcoded `text-[...]` classes in `app/page.tsx` with semantic classes.
4.  **Movement Section:** Update `components/MovementSection.tsx`.
5.  **Nav/Footer:** Update `components/MobileNav.tsx` and Footer section in `page.tsx`.
6.  **Buttons:** Update button components in `app/page.tsx` (or extract them properly).

### Phase 3: Hero Adjustment

7.  **Hero Height:** Update `app/page.tsx` Hero section from `h-[55vh]` to `md:h-[75vh] h-[55vh]`.
8.  **Parallax Tuning:** Adjust the parallax `y` values if the increased height makes the movement too aggressive.

## 5. Success Criteria

- [ ] No arbitrary `text-[XXpx]` classes remaining in main layout files.
- [ ] Consistent hierarchy (Hero > H1 > H2 > Body).
- [ ] Hero section feels "immersive" on desktop (taller).
- [ ] Mobile experience remains tight and readable.
