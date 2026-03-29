# The Autonomous Vault

This is a master repository for storing **first-in-class, zero-dependency, sovereign modules** that we have engineered from scratch. The code contained within this directory is designed to be purely deterministic and infinitely reusable across any project in the Axiogenesis or VEKTR ecosystem without ever relying on external Node modules, servers, or generic UI libraries.

## Foundational Philosophy
1. **Zero External Dependencies**: All modules rely strictly on native browser/device APIs (Canvas, Web Audio, IndexedDB, vanilla JS).
2. **Strictly Deterministic**: Output is mathematically reproducible identically on every compiler and device.
3. **Drop-in Ready**: Can be instantly ported to new projects by simply pasting the file.

---

### Module List

- **ART_CanvasHasher.ts** (`/modules/graphics/ART_CanvasHasher.ts`)
  - A mathematically native hashing algorithm that converts any text string into a bitwise integer, using it as a deterministic seed to natively render a 100% unique geometric graphic on the HTML5 Canvas. Replaces external dummy-image placeholder API endpoints (picsum.photos etc.) with zero network calls.

- **ART_HardwareFFT.ts** (`/modules/audio/ART_HardwareFFT.ts`)
  - A pure native Web Audio API hook. Executes a Fast Fourier Transform (FFT) extraction locally in-memory at 60fps to identify Amplitude, Peak, Bass, Mid, and Treble data points directly from the soundcard, bypassing third-party audio abstraction libraries.

- **ART_NativeSVGMatrix.tsx** (`/modules/ui/ART_NativeSVGMatrix.tsx`)
  - A strictly curated, 100% compiled native SVG library matrix. Prevents thousands of unused vectors from generic node modules (lucide-react, heroicons) from being bundled into the app's payload, locking overhead latency to zero.

---

### Canonical Production Engines (live in `src/lib/`)

These supersede earlier Vault prototypes. They are the production-grade versions actively used by the application.

- **VisualizerCanvas.tsx** (`src/lib/VisualizerCanvas.tsx`)
  - **Supersedes**: `ART_EuclideanRenderer` (V1, deleted).
  - Full-featured sovereign audio visualizer. 6 modes: Waveform, Spectrum, Particles/Word-Storm, Matrix Rain, Cosmic Hyperspace, Cyber Glitch. Features: Retina 2x scaling, bass camera-shake, logo image rendering, Axiometric Integrity Ghost (tamper-proof dual-canvas proof-of-creation), SyncLines timed lyric highlighting.

- **useAudioAnalyzer.ts** (`src/lib/useAudioAnalyzer.ts`)
  - Thin adapter that routes to `ART_HardwareFFT` for FFT data. Also exposes `activateGlobal()` for tapping into the shared global AudioContext without spawning a second context.
