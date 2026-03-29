# ART_EuclideanRenderer (2D Particle & Waveform Engine)

**Namespace:** `ART_` (Axiometric Recurse Tech)  
**Type:** Hybrid Capability (Audio-Reactive Graphics)  
**Location:** `/modules/graphics/ART_EuclideanRenderer.tsx`

---

## 1. Core Capability
A native HTML5 2D Canvas engine that mathematically translates data from `ART_HardwareFFT` into a **Syncopated Word-Storm** and a **Monumental Backdrop**. It uses the artist's lyrics as the physical particle system and the artist's username/logo as a reactive, 3D-perspective foundation.

## 2. The Universal Application
This module is a **Sovereign Signature Engine**. 
- **The Core Application:** Generating un-forgeable music videos where the words, voice-frequencies, and identity (Username) are mathematically woven into the pixels.
- **The Alternative Application:** The 3D-to-2D projection math can be used to monumentalize any data-set into a readable, reactive typography environment.

## 3. The Math & Mechanics
The module uses **Axiometric Projection** and **Current-Time Syncopation** to handle the Word-Storm.

```typescript
// Word Storm Syncopation Logic
const isCurrent = Math.abs((wordIndex / totalWords) * 100 - (currentTime % 100)) < 1.5;

// Perspective Projection for readable swarm
const fov = 400 / (400 + p.z);
const screenX = cx + p.x * fov;
const screenY = cy + p.y * fov;

if (isCurrent) {
  p.x *= 0.94; // Pull toward center (The "Readable Magnet")
  p.y *= 0.94; 
}
```

**How it works:**
1. It tokenizes the `Lyrics` into individual word objects in 3D space (`x,y,z`).
2. It tracks the `audio.currentTime` to identify which word is currently being sung.
3. The "Readable Magnet" algebra physically pulls the active word to the center of the screen and enlarges it, while the rest of the lyrics remain in a 3D background orbit.
4. The background **Monumental Backdrop** (Username) pulses based on the `Amplitude` extracted by `ART_HardwareFFT`.
