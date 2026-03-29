# Audio Analog Saturation Curve (MakeDistortionCurve)

**Namespace:** Core Web Audio Native  
**Type:** Strict Build-Class Capability (Digital Audio Processing)  
**Location:** `c:\01_VEKTR_studio\src\pages\AudioTransform.tsx`

---

## 1. Core Capability
A DSP (Digital Signal Processing) mathematical formula that generates a fixed `Float32Array` representing a non-linear volume distortion wave. When fed into a native Web Audio `WaveShaperNode`, it physically alters the sound of an MP3 to generate "analog-style tube saturation" (warmth, distortion, clipping) natively in the browser's audio buffer.

## 2. The Build-Class Application
Unlike the `ART_CanvasHasher`, this module is **Strictly Audio Driven**. 
It is not universally portable to visual or database apps. It belongs explicitly in:
- **Digital Audio Workstations (DAWs)**
- **Podcasting Web Engines:** (Mastering a voice physically in-browser)
- **Audio/Video Editors:** Giving users the ability to apply guitar pedal logic to their tracks without needing a server to render the math.

## 3. The Math & Mechanics
The module uses an **Arctangent Soft-Clipping Equation**. 
It maps standard sine waves across a 1-second physical memory buffer (`Float32Array`). It bends quiet sounds normally, but dramatically "squashes" loud sounds against the ceiling to mathematically create harmonic resonance (the sound of an overloaded speaker/tube).

```typescript
function makeDistortionCurve(amount = 0) {
  const k = typeof amount === 'number' ? amount : 0;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < n_samples; ++i) {
    // 1. Sweep time horizontally from -1.0 to 1.0
    const x = (i * 2) / n_samples - 1;
    
    // 2. The Arctangent Curve Math
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
```

**How it works:**
1. It requests `44100` slots of rigid `Float32Array` memory (1 second of CD audio).
2. It walks across every slot (`i = 0`).
3. If `k` (the user's slider) is zero, the math equals a straight diagonal line. Sound goes in, and sound goes out perfectly clean.
4. As `k` increases to 50 or 100, the geometry of the line bows outward. The `WaveShaperNode` physically forces the digital audio to follow that bowed geometry, artificially increasing the volume and tearing the sound frequencies into a rich, saturated distortion.
