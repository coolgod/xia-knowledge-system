# Xia Knowledge System

A personal knowledge graph visualizer — a single-page app that renders a bilingual (EN/中文) mind map of career knowledge, built to be distributed as a single self-contained HTML file.

## What this project is

A tool for self-reflection on technical knowledge breadth and depth. The data (`data/knowledge.json`) is the primary artifact; the UI is a viewer for it.

## Data model

Knowledge is structured as a 4-level hierarchy: **domain → subdomain → topic → concept**, stored as a flat nodes+edges graph. Concepts are the leaf nodes and carry the most metadata (marks, familiarity, keywords).

Key fields on nodes:
- `nameEn` / `nameCn` — bilingual display names
- `familiarity` — L0–L3 self-assessed familiarity level (defined in `meta.familiarity`)
- `keywordsEn` / `keywordsCn` — sub-concepts extracted from the name
- `prerequisites` — IDs of nodes that should be understood first

## Conventions

- Node IDs follow `{type}_{snake_case(nameEn)}`, with a parent-abbreviation prefix to resolve collisions (e.g. `subdomain_pl_miscellaneous`)

## Workflow

- Edit `data/knowledge.json` directly to add/update nodes, edges, and metadata
- `npm run build` produces `dist/index.html` as a single inlined file

## UI principles

- Left nav shows only 2 levels (domain + subdomain) — no deeper expansion
- The graph panel is the primary view; the left nav is for navigation only
- Language toggle (EN/中文) lives in the page header, affects all text globally
