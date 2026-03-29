# Euclidean Recursion Engine 10.0 — Module Architecture

## Layer Overview

```
┌─────────────────────────────────────────────┐
│              LAYER 5: render/               │  ← Visual, UI, DOM, THREE, CSS
├─────────────────────────────────────────────┤
│               LAYER 4: core/               │  ← Orchestration, event bus, state
├─────────────────────────────────────────────┤
│               LAYER 3: infra/              │  ← Configs, archetypes, constants
├─────────────────────────────────────────────┤
│           LAYER 2: persistence/            │  ← Vaults, guards, memory
├─────────────────────────────────────────────┤
│               LAYER 1: logic/              │  ← Pure computation only
└─────────────────────────────────────────────┘
```

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|---|---|---|
| `logic/` | nothing | everything |
| `persistence/` | `logic/` | `core/`, `render/` |
| `infra/` | `logic/` | `core/`, `persistence/`, `render/` |
| `core/` | `logic/`, `persistence/`, `infra/` | `render/` |
| `render/` | `logic/`, `core/` | `persistence/` directly |

## Layer Definitions

### logic/
Pure computation. No DOM access, no `window.*`, no THREE, no storage reads/writes.
- `IdentityMath.js` — Static identity math functions (frozen class)
- `Validation.js` — Input and data validation rules
- `CausalityGraph.js` — Causal data relationship logic

### persistence/
All IndexedDB, localStorage, vault, and guard operations.
- `PersistenceVault.js` — Zero-custody encrypted local vault
- `PersistenceGuard.js` — Integrity checks and fallback handling
- `LocalGuard.js` — Identity export/import and local storage guard
- `ChronosMemory.js` — Time-based session memory
- `SovereignAudit.js` — Audit log writer

### infra/
Configuration, archetype definitions, and system constants.
- `ArchetypeInfrastructure.js` — Archetype profiles and type definitions

### core/
Orchestration, event buses, state machines, and system lifecycle management.
- `StateController.js` — Global state machine and NutrientFlow
- `NeuralPathway.js` — Event bus and unidirectional signal router
- `SovereignIngestor.js` — Passive local data ingestion orchestrator
- `LayoutEngine.js` — SPA routing and kinetic UI morphing
- `KineticEngine.js` — Heartbeat timing and pulse orchestration
- `NullTrace.js` — Trace and log erasure
- `SystemLauncher.js` — Boot sequence orchestrator
- `LifeKnowledge.js` — Knowledge base management
- `EuclideanEngine.js` — Neural spine and main execution loop
- `IdentityBlender.js` — Identity archetype blending
- `DynamicLoader.js` — Runtime module loading

### render/
All DOM manipulation, THREE.js, canvas, CSS variables, and audio output.
- `CreativeCanvas.js` — THREE.js canvas renderer (RAF loop)
- `VisualCore.js` — Core visual output layer
- `NetworkVisualizer.js` — Network graph renderer
- `SystemLogsView.js` — UI log display panel *(not backend logs)*
- `SystemThinking.js` — Thinking process visualization
- `MaturityHUD.js` — Maturity HUD overlay
- `AcousticResonance.js` — Audio output engine
- `HorizonMode.js` — Fullscreen horizon view mode
- `ParticlesBackground.js` — Particle background *(currently disabled)*
- `OrbPreview.js` — Identity orb renderer

## Load Order in index.html
```
vendor/ → logic/ → persistence/ → infra/ → core/ → render/ → Kernel.js → script.js
```
