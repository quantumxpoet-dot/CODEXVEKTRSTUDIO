# VEKTR Studio: Sovereign Dependency Audit
**Generated:** 2026-03-27 | **Status:** Active Build Audit

This document enumerates every external dependency in the VEKTR Studio project, the strict reason it must exist, its open-source license, and any threat or risk implications for the sovereign architecture.

---

## RUNTIME DEPENDENCIES
*These are shipped to the user's device inside the final APK.*

---

### 1. `react` & `react-dom` — v19.0.0
- **Purpose:** The entire UI component system. All pages, state management, hooks, and DOM diffing are React-native. Without it, every single component in `src/pages/` and `src/components/` would need to be rewritten as raw imperative HTML/JS.
- **License:** MIT ✅ — Permissive. Allows commercial use, distribution, and modification with zero royalties.
- **Maintainer:** Meta (Facebook) Open Source
- **Threat Level:** ⚠️ LOW
  - React is the most audited UI library on Earth. No known security vulnerabilities in production.
  - **Architectural Risk:** Meta controls the roadmap. A breaking API change (e.g., the React 19 `use()` API) forced community ecosystem rewrites. This is an acceptable dependency maturity risk, not a sovereignty risk.
  - **Replacability:** Theoretically replaceable with a raw Signals/Proxy-based system (like SolidJS or Preact), but the cost is a full codebase rewrite.

---

### 2. `motion` & `framer-motion` — v12.4.7 / v11.15.0
- **Purpose:** Powers all fluid UI transitions — `AnimatePresence` (mount/unmount animations), `layout` transitions, drag-and-drop physics, and spring-curve motion. The native CSS `transition` property cannot replicate physics-based spring animations or orchestrated group animations.
- **License:** MIT ✅ — Permissive. Commercial use is fully permitted.
- **Maintainer:** Framer B.V. (Netherlands-based company)
- **Threat Level:** ⚠️ LOW-MEDIUM
  - **Commercial Risk:** Framer is a for-profit company. While the core `motion` library is MIT, Framer has historically moved features behind a paid license. Future versions could introduce a paywall for advanced features.
  - **Replacability:** MEDIUM difficulty. All `motion.div` components could be replaced with pure CSS animations and a lightweight custom `useTransition` hook. Estimated 2-3 day refactor.

---

### 3. `@capacitor/core` — v8.2.0
- **Purpose:** The runtime bridge that allows the web application to communicate with native Android APIs (filesystem, camera, haptics, etc.). Without it, the app is a browser-only PWA and cannot be packaged as an `.apk` for APKPure or the Play Store.
- **License:** MIT ✅
- **Maintainer:** Ionic (Drifty Co.) — US-based open-source company
- **Threat Level:** ⚠️ LOW-MEDIUM
  - **Vendor Lock-in Risk:** The entire Android bridge depends on Ionic's build tooling. If Ionic changes the API or ceases maintenance, the Android packaging pipeline breaks.
  - **Replacability:** LOW. The only alternatives are `Cordova` (aging), `Tauri` (Rust-based, not Android-mature), or a full native Android `WebView` wrapper written in Kotlin. Each requires significant migration effort.

---

### 4. `@capacitor/android` — v8.2.0
- **Purpose:** The platform-specific Capacitor adapter that generates the Android Studio project, `gradle` build files, and `WebView` configuration. Required by the `npm run apk:debug` and `npm run aab:release` scripts.
- **License:** MIT ✅
- **Maintainer:** Ionic (Drifty Co.)
- **Threat Level:** ⚠️ Same as `@capacitor/core` above.

---

### 5. `@capacitor/cli` — v8.2.0
- **Purpose:** The command-line tooling that runs `cap sync`, `cap open`, and `cap build`. It syncs the compiled web assets into the Android project `assets/` folder on every build.
- **License:** MIT ✅
- **Maintainer:** Ionic (Drifty Co.)
- **Threat Level:** ⚠️ Build-time only. Not shipped in the APK. Low threat.

---

## DEV DEPENDENCIES
*These exist only on the developer's machine during the build process. They are NOT shipped to users.*

---

### 6. `vite` — v6.0.7
- **Purpose:** The module bundler and development server. It compiles TypeScript, resolves module imports, bundles the final `dist/` output, and runs the hot-reload `localhost:3000` dev server.
- **License:** MIT ✅
- **Maintainer:** Evan You (Vue.js creator) + Vite community
- **Threat Level:** 🟢 NONE (dev-only, never shipped)
  - Well-maintained, industry-standard bundler. No known security risks in dev usage.

---

### 7. `typescript` — v5.9.3
- **Purpose:** Type checking at compile time. Catches type errors before runtime. Compiles `.tsx` and `.ts` files to plain JavaScript. Produces zero runtime output itself.
- **License:** Apache 2.0 ✅ — Permissive. Maintained by Microsoft.
- **Threat Level:** 🟢 NONE (dev-only, never shipped)

---

### 8. `tailwindcss` — v4.0.0
- **Purpose:** The utility-first CSS framework. Powers the entire design system — all `className` strings like `rounded-[2rem]`, `tracking-widest`, `bg-black` etc.
- **License:** MIT ✅
- **Maintainer:** Tailwind Labs (Adam Wathan)
- **Threat Level:** 🟢 NONE (dev-only, not shipped — CSS is extracted into a static file)
  - **Replacability:** MEDIUM. Could be replaced with pure hand-written CSS, but would require writing a bespoke design token system. Estimated 3-5 day refactor.

---

### 9. `@vitejs/plugin-react` — v4.3.4
- **Purpose:** The Vite plugin that enables React-specific transforms — JSX compilation, React Fast Refresh (hot reloading), and React devtools integration.
- **License:** MIT ✅
- **Threat Level:** 🟢 NONE (dev-only)

---

### 10. `@types/react` & `@types/react-dom` — v19.0.0
- **Purpose:** TypeScript interface definitions for the React library. They give the TypeScript compiler knowledge of all React API types (`useState`, `useRef`, `ReactNode`, etc.). Not actual code — purely type metadata.
- **License:** MIT ✅ (DefinitelyTyped community)
- **Threat Level:** 🟢 NONE (dev-only)

---

### 11. `@tailwindcss/vite` — v4.0.0
- **Purpose:** The Tailwind v4 Vite plugin. Integrates Tailwind's CSS generation into the Vite build pipeline.
- **License:** MIT ✅
- **Threat Level:** 🟢 NONE (dev-only)

---

## SOVEREIGN CORE (Zero External Dependency Modules)

The following critical subsystems are 100% native and depend on **no external packages whatsoever**:

| Module | Engine |
|--------|--------|
| 12-Band Mastering EQ | Native `BiquadFilterNode` (WebAudio API) |
| 8D HRTF Binaural Spatializer | Native `PannerNode` (WebAudio API) |
| Chromatic Tuner (YIN Algorithm) | Pure TypeScript Math |
| Convolution Reverb | Native `ConvolverNode` (WebAudio API) |
| Vocal Transient Detector | Pure TypeScript DSP Math |
| Matrix / Cosmic / Glitch Visualizers | Native `Canvas2D` API |
| WAV Encoder | Pure TypeScript PCM Interleaving |
| SRT Subtitle Exporter | Pure TypeScript String Formatting |
| IndexedDB Asset Vault | Native Browser IndexedDB API |

---

## SUMMARY THREAT MATRIX

| Dependency | Shipped to User | License | Risk Level |
|---|---|---|---|
| `react` / `react-dom` | ✅ Yes | MIT | LOW |
| `motion` / `framer-motion` | ✅ Yes | MIT | LOW-MEDIUM |
| `@capacitor/core` | ✅ Yes | MIT | LOW-MEDIUM |
| `@capacitor/android` | ✅ Yes | MIT | LOW-MEDIUM |
| `@capacitor/cli` | ❌ Build only | MIT | LOW |
| `vite` | ❌ Build only | MIT | NONE |
| `typescript` | ❌ Build only | Apache 2.0 | NONE |
| `tailwindcss` | ❌ Build only | MIT | NONE |
| `@vitejs/plugin-react` | ❌ Build only | MIT | NONE |
| `@types/*` | ❌ Build only | MIT | NONE |

**All 11 dependencies use MIT or Apache 2.0 licenses. Zero proprietary licenses. Zero royalty obligations. Zero patent risks.**
