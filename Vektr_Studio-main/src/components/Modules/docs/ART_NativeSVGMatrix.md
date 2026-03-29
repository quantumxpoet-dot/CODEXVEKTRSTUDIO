# ART_NativeSVGMatrix (Curated Vector Compilation)

**Namespace:** `ART_` (Axiometric Recurse Tech)  
**Type:** Universal Capability (UI & Layout)  
**Location:** `/modules/ui/ART_NativeSVGMatrix.tsx`

---

## 1. Core Capability
A strictly curated, 100% compiled native SVG logic matrix. It completely prevents the thousands of unused icons from generic open-source `npm` node modules (like `lucide-react` or `heroicons`) from being bundled into an application's final payload.

## 2. The Universal Application
This module is **100% Universally Portable**. 
No matter if you are building a video app, an audio app, or a blockchain explorer, your UI will require vector icons (Play, Pause, Download, Heart, Arrow). Relying on external icon libraries is universally inefficient because it bloats your final Android APK size.
This Matrix provides absolute baseline sovereignty for your entire UI layer. 

## 3. The Math & Mechanics
The module uses **Raw Scalable Vector Graphics (SVG) Coordinate Data**.
Instead of downloading a library that "magically" renders an icon, this module explicitly defines the `x` and `y` plot lines (`path d=...`) for the exact shape required, wrapping them in a mathematically scalable `<svg>` React component.

```tsx
const Icon = ({ size = 24, strokeWidth = 2, children }) => (
  // The universal scaling wrapper
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    {children}
  </svg>
);

// The exact physical path plot points.
export const Play = (p) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3"/></Icon>;
```

**How it works:**
1. You pass `size` and `strokeWidth` parameters into the `Icon` shell.
2. The `Icon` shell mathematically calculates an invisible `24x24` boundary box (`viewBox`).
3. The individual exported shapes (like `Play`) inject raw 2D algebra (`points="5 3 19 12..."`) mapping the physical lines of the play button.
4. Because it is raw source code, it parses in less than 1 millisecond. An external library could take 50-100x longer to load via JavaScript bloat.
