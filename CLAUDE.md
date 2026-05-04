@docs/skills/apps-in-toss.md
@docs/skills/tds-mobile.md

# AGENTS.md

## Project Goal

This project is a mobile-only App in Toss WebView mini app.
The priority is:

1. easy maintenance
2. clear structure
3. easy manual review by the developer
4. reusable UI
5. minimal overengineering

Do not optimize for desktop responsiveness.
Do not add unnecessary abstractions.
Prefer simple, readable, maintainable code.

---

## Core Principles

- Build for mobile app-sized screens only.
- Prioritize readability over cleverness.
- Keep files and components easy to scan quickly.
- Avoid overengineering and deep abstraction too early.
- When in doubt, choose the simpler structure.
- Use consistent naming and predictable folder structure.
- The developer should be able to understand any file within a short time.

---

## Implementation Rules

### 1. No unnecessary hardcoding

- Do not hardcode repeated labels, tab names, section titles, button texts, or dummy data directly inside page components.
- Move reusable copy and labels into `constants`.
- Move mock data into dedicated mock or constants files.
- Keep one-off truly local text in the component only if it is not reused and does not affect maintainability.

### 2. No inline style

- Do not use `style={{}}` unless absolutely unavoidable.
- Manage styling with styled-components.
- Shared visual values must not be scattered across files.

### 3. Use styled-components consistently

- Use styled-components for all component styling.
- Keep styling close to the component, but avoid mixing too much logic and styling in one file if the file becomes hard to read.
- If a component file becomes too large, split styles into a separate `styles.ts`.

### 4. Theme/token driven styling

- Colors, spacing, border radius, font sizes, shadows, and z-index values must be managed centrally.
- Use a shared theme or design token structure.
- Do not repeatedly hardcode values like `#0B1F5C`, `16px`, `24px`, `999px`, etc. across many files.

### 5. Reuse before duplication

- If the same card, chip, badge, button, tag, section header, or layout block appears more than once, extract it into a reusable component.
- If similar UIs differ only by text/data, use props instead of copy-paste.

---

## File and Folder Structure

Use a predictable structure.

Recommended structure:

- `src/app` for routes/pages
- `src/components` for reusable UI components
- `src/features` for screen/domain-specific grouped components and logic
- `src/constants` for labels, tabs, static texts, keys, and lightweight config
- `src/mocks` for mock data
- `src/styles` for global styles and theme
- `src/types` for shared TypeScript types
- `src/utils` for pure utility functions

Do not create too many folders unless clearly necessary.

---

## Page Structure Rules

- Keep page files lightweight.
- A page file should mostly compose sections/components.
- Do not place large chunks of repeated JSX directly in pages.
- Split large pages into section components.

Recommended:

- page = route entry + layout composition
- sections = page-specific grouped UI blocks
- components = reusable generic building blocks

---

## Component Design Rules

### Prefer small to medium components

- Components should have one clear responsibility.
- Avoid giant components that contain everything.

### But avoid pointless fragmentation

- Do not split components into tiny files if it makes tracing harder.
- Balance reuse and readability.

### Props should be explicit

- Use clear prop names.
- Avoid huge ambiguous prop objects unless they model real data.

### Avoid hidden logic

- Keep business rules visible and traceable.
- Do not bury important UI conditions in deeply nested helper abstractions.

---

## State Management Rules

- Keep state as local as possible.
- Do not introduce global state unless truly needed.
- Prefer simple local state for UI interactions.
- Use derived state carefully and avoid unnecessary duplication.

For MVP:

- simple local state is preferred
- avoid overcomplicated stores unless required later

---

## Domain Modeling and OOP Rules

Use OOP selectively for domain rules, not as the default style.

- Keep UI as functional React components with explicit props.
- Keep simple data as plain objects and TypeScript types.
- Use pure functions first for lightweight calculations.
- Introduce a small class or domain object only when state-change rules are meaningful and testable.
- Good candidates: pet growth, level progression, budget evaluation, reward policy, streak calculation.
- Avoid passing class instances deeply through component props.
- Convert domain objects into plain view models before rendering when possible.
- Do not wrap simple mock data, labels, tabs, or one-off UI state in classes.
- Keep domain files in `src/domain` only when they hold business rules, not UI formatting.

Recommended pattern:

- page/component receives plain data
- domain function or small domain object calculates business result
- component renders a plain view model

---

## Data and Constants Rules

### Constants

Store these in constants when reusable:

- tab labels
- section labels
- button text
- filter labels
- chip labels
- status text
- navigation items

### Mock data

Store all mock data separately from UI files.
Examples:

- news list mock data
- analysis detail mock data
- point/unlock mock data
- recent analysis mock data

### Types

Define shared types for:

- news item
- market impact data
- sector impact item
- life impact item
- premium card data
- reaction state

---

## Naming Rules

- Use clear English naming in code.
- Keep names descriptive but not overly long.
- Avoid vague names like `data`, `item2`, `sectionBox`, `temp`, `testComp`.

Examples:

- good: `marketSummaryCards`
- good: `lifeImpactItems`
- good: `analysisScoreCard`
- bad: `boxData`
- bad: `infoThing`

Component names should clearly indicate purpose:

- `ImpactNewsCard`
- `MarketSummarySection`
- `LifeImpactList`
- `PremiumUnlockCard`

---

## Styling Rules

### Use theme values

- Use theme colors, spacing, and radius values whenever possible.
- Avoid magic numbers repeated across files.

### Keep visual consistency

- Reuse the same spacing scale.
- Reuse the same border radius scale.
- Reuse the same card styles where appropriate.

### Mobile-first only

- Optimize layout for mobile width only.
- No need for desktop-specific responsive design.
- It is enough to support typical mobile widths inside App in Toss WebView.

### Still avoid fragile layouts

- Even though desktop responsiveness is unnecessary, do not hardcode layouts so tightly that small mobile width differences break the UI.

---

## Maintainability Rules

These are very important.

### Make code easy to inspect manually

- Keep render structure easy to follow.
- Limit nesting depth when possible.
- Prefer extracting nested chunks into named components.

### Make changes easy

- A future text change should happen in one obvious place.
- A future style change should happen in one obvious place.
- A future card layout change should not require editing many duplicated files.

### Keep logic predictable

- Simple conditionals are preferred over overly abstract render pipelines.
- Do not introduce patterns that are hard to debug for a solo developer.

### Avoid premature optimization

- Do not add architecture for future scale unless needed now.
- MVP code should be clean, not enterprise-heavy.

---

## Reviewability Rules

Code must be easy for the developer to review quickly.

### Prefer this

- short files with clear purpose
- explicit imports
- clear component boundaries
- obvious constants location
- obvious mock data location
- obvious style location

### Avoid this

- giant mixed files
- hidden strings in many places
- nested anonymous render functions everywhere
- repeated JSX blocks
- unclear file naming
- unnecessary custom hooks for trivial behavior

---

## Refactoring Rules

After implementing a screen:

1. remove duplication
2. extract repeated UI blocks
3. move reusable copy to constants
4. move mock data out of page files
5. check naming clarity
6. reduce visual magic numbers
7. ensure page file is still readable

Do not stop at "it works".
Always do a maintainability pass.

---

## Comments and Documentation

- Do not over-comment obvious code.
- Add short comments only where intent is not immediately clear.
- If a structure or decision may confuse the developer later, leave a brief note.

Good comments:

- explain why
- explain non-obvious UI conditions
- explain temporary MVP limitations

Bad comments:

- repeat what the code already says

---

## What To Avoid

- No inline styles unless unavoidable
- No repeated hardcoded copy in multiple files
- No giant page components with all JSX inside
- No overuse of `any`
- No unclear utility layers
- No unnecessary custom hooks
- No premature global state
- No unnecessary desktop responsiveness
- No copy-paste UI duplication
- No magic numbers spread across many files
- No difficult-to-trace abstractions

---

## Preferred Workflow for New Screens

When creating or updating a screen:

1. identify reusable sections
2. define or reuse related mock data
3. define or reuse related constants
4. build screen with reusable components
5. style with styled-components and theme values
6. refactor repeated blocks
7. keep final page file lightweight

---

## Specific UI Direction For This Project

This app is not a generic news app.
It is a news impact analysis dashboard.

Important UI direction:

- screens should feel like analysis dashboards, not article readers
- impact visualization should be prominent
- text should be easy for beginners to understand
- the structure should emphasize market impact, sector impact, and daily life impact
- premium sections can be partially blurred
- reaction features should remain simple

---

## Final Rule

Always implement in a way that makes future edits easier for the developer.

If choosing between:

- faster but messy
- slightly slower but much clearer

choose the clearer implementation.
