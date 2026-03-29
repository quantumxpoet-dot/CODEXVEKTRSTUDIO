# Vektr Studio

Vektr Studio is a musician-first workspace for turning tracks, lyrics, and identity assets into share-ready promo content in the same creative session.

## Product Direction

Vektr Studio is not aiming to be a full DAW. The current product direction is:

- track and stem library
- lyric book connected to tracks
- visualizer-led content creation
- one-click audio effect chains
- advanced quick mastering controls
- export and share workflows for social formats

For the detailed product north star, see [PRODUCT_VISION.md](./PRODUCT_VISION.md).

## Core Workspace Pillars

1. Track Library
- store tracks, versions, stems, and metadata
- prepare assets for transformations and exports

2. Lyric Book
- store lyrics by song and section
- support quote extraction and sync metadata

3. Visualizer Studio
- audio-reactive visuals connected to track and lyric data
- lyric overlays and template-driven output

4. Content Kit
- bio cards
- release cards with reusable links
- lyric and quote templates for fast promo creation

5. Transform Lab
- one-click effect chain recipes (for existing tracks)
- mastering tools beyond basic EQ

## Quality Standard

Output quality is non-negotiable.

- stem-based workflows are preferred
- auto-extraction should be optional and confidence-scored
- low-confidence processing should warn users before export

## Current Prototype Status

The current app includes:

- basic playback trigger grid
- real-time Web Audio processing
- Three.js visualizer foundation

The product scope is evolving toward a track transformation and content workspace model.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Android APK Workflow

Capacitor Android is now configured in this project.

### Prerequisites for APK builds

- Android Studio (latest stable)
- Android SDK + Build Tools installed
- Java 17 (recommended by current Android toolchain)

### Sync web app into Android wrapper

```bash
npm run android:sync
```

### Open Android project in Android Studio

```bash
npm run android:open
```

### Build a debug APK quickly

```bash
npm run apk:debug
```

Expected output path:

- `android/app/build/outputs/apk/debug/app-debug.apk`

### Build release artifacts

```bash
npm run apk:release
npm run aab:release
```

Expected output paths:

- `android/app/build/outputs/apk/release/`
- `android/app/build/outputs/bundle/release/`

### APKPure Launch Checklist

1. Build release artifact (APK or AAB).
2. Sign release with your production keystore.
3. Verify package id (`com.vektr.studio`) and versionCode/versionName in Android config.
4. Test install on a physical Android device.
5. Upload signed build to APKPure with screenshots, icon, and changelog.

### Lint

```bash
npm run lint
```

## Documentation

- Product vision: [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- Wiki starter: [docs/WIKI_START.md](./docs/WIKI_START.md)

## Near-Term Roadmap

1. Replace sequencer-first focus with track transform workflows.
2. Add stem-aware library structure and quality checks.
3. Add lyric + quote template system.
4. Add link vault and card templates (bio/release).
5. Add export pipeline for 9:16, 1:1, and 16:9 content.
