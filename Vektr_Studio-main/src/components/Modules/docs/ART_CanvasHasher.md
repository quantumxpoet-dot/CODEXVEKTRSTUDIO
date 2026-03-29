# ART_CanvasHasher (Deterministic Geometry)

**Namespace:** `ART_` (Axiometric Recurse Tech)  
**Type:** Universal Capability (Cryptography & Graphics)  
**Location:** `/modules/graphics/ART_CanvasHasher.ts`

---

## 1. Core Capability
A mechanically native hashing algorithm that converts any text string into a bitwise integer. It uses that integer as a deterministic seed to natively render a 100% unique geometric graphic on the HTML5 Canvas, completely eliminating the need for generic internet image placeholders.

## 2. The Universal Application
This module is **100% Universally Portable**. 
It solves the "Empty State" problem without relying on the cloud. It can be used in:
- **Avatar Generators:** Hashing a user's name (`john_doe123`) to create a unique permanent profile picture.
- **Crypto Wallets:** Rendering a unique graphical block pattern to verify an Ethereum address.
- **Background Generators:** Passing in the current time or a random ID to instantly generate beautiful, unique geometric backgrounds without loading heavy `JPEG` files.

## 3. The Math & Mechanics
The module uses **Bitwise Left Shifts** to hash a string into a 32-bit integer, then uses **Euclidean Modular Arithmetic** to place shapes and generate HSL color values.

```typescript
// Number 1: The Bitwise Hash string -> Integer 
let hash = 0;
for (let i = 0; i < seed.length; i++) {
  hash = seed.charCodeAt(i) + ((hash << 5) - hash);
}

// Number 2: The Euclidean Placement
const cx = Math.abs((hash * 13) % width);
const cy = Math.abs((hash * 17) % height);
```

**How it works:**
1. It rips the characters out of a word (`Track_01`).
2. It shifts them via memory bits (`<< 5`), squashing them into a massive mathematical integer.
3. It maps that integer against the width and height of a canvas (`% width`) so that no matter how big the number is, the resulting circle is always drawn exactly inside the frame. 
4. Because it is deterministic math, the word "Track_01" will draw the exact same circle with the exact same color, a million times in a row.
