# ART_HardwareFFT (Fast Fourier Transform)

**Namespace:** `ART_` (Axiometric Recurse Tech)  
**Type:** Universal Capability (Audio Engineering)  
**Location:** `/modules/audio/ART_HardwareFFT.ts`

---

## 1. Core Capability
`ART_HardwareFFT` is a pure native Web Audio API hook that extracts real-time audio frequency data directly from the system's physical soundcard at 60fps. It completely bypasses third-party abstraction libraries (like Tone.js or Howler.js).

## 2. The Universal Application
This module is **100% Universally Portable**. 
Because sound waves are essentially just mathematical streams of data, the ability to natively pull `Amplitude`, `Bass`, `Mid`, and `Treble` frequencies directly from the browser's hardware can power almost anything:
- **Audio Visualizers** (like in VEKTR Studio)
- **Rhythm Games** (detecting a bass spike to spawn an enemy)
- **Accessibility Tools** (detecting sudden loud noises and flashing the screen)
- **Generative Art** (using sound to dynamically morph geometric shapes)

## 3. The Math & Mechanics
The module utilizes a **Fast Fourier Transform (FFT)**, a mathematical algorithm that decomposes an audio signal into its constituent frequencies.

Inside the native C++ of the browser, the module requests an `AnalyserNode` with an `fftSize` of 256. This means that every single frame (60 times a second), it chops the audio into 256 physical frequency "bins."

```typescript
// The Web Audio Engine extraction map
const bass = freq.slice(0, 10).reduce((s, v) => s + v, 0) / 10 / 255;
const mid = freq.slice(10, 50).reduce((s, v) => s + v, 0) / 40 / 255;
const treble = freq.slice(50).reduce((s, v) => s + v, 0) / (freq.length - 50 || 1) / 255;
```

**How it works:**
1. It reads a rigid `Uint8Array` of audio memory.
2. It slices the array geometrically (Bins 0-10 contain the low, vibrating frequencies: `Bass`).
3. It averages the math and normalizes the output to a safe, usable decimal between `0.0` and `1.0`.
