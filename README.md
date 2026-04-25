# Xia Knowledge System

A personal knowledge graph visualizer — a bilingual (EN/中文) mind map of career knowledge. The primary artifact is `data/knowledge.json`; the UI is a viewer for it.

## Local dev

```bash
npm install
npm run dev
```

## Builds

### Web (single HTML file)

```bash
npm run build
```

Outputs `dist/html/index.html` — a fully self-contained file that can be opened directly in a browser.

### macOS app (Tauri)

Requires [Rust](https://rustup.rs/) installed.

```bash
npm run tauri:build   # compiles the .dmg under src-tauri/target/release/bundle/dmg/
npm run dist:macos    # copies the .dmg to dist/macos/
```

## Releases

Both build artifacts are committed to the repo under `dist/`:

```
dist/
  html/index.html     # standalone web viewer
  macos/*.dmg         # macOS app installer
```

The web build runs automatically on every `git commit` via a pre-commit hook. The macOS build is done manually before committing.

## Data

Edit `data/knowledge.json` directly to add or update nodes. Knowledge is structured as a 4-level hierarchy: **domain → subdomain → topic → concept**.
