/**
 * StyleEvolver.js
 * The Physical Manifestation of the Identity DNA.
 * Bridges HeuristicCore 6-axis vectors and Phase 1.1 matrix CSS state
 * to CSS custom properties in real-time.
 *
 * Pattern: window-global singleton (matches codebase module convention).
 *
 * 6-Axis variables:
 *   --grid-gap, --accent-glow, --system-opacity, --identity-hue,
 *   --entropy-scale, --lead-weight, --identity-intensity
 *
 * Phase 1.1 Matrix variables:
 *   --structural-density, --layout-scale, --grid-columns, --blur-depth,
 *   --letter-spacing, --line-height, --layer-spacing,
 *   --transition-duration, --color-saturation, --luminance-boost, --motion-scale
 */

class StyleEvolver {
    constructor() {
        this.root = document.documentElement;
        this._rafId = null;
        this._pendingVector = null;

        // Phase 2.2: Morphological Engine State
        this._isMorphing = false;
        this._morphDuration = 800; // ms

        // Unit map: how to format each Phase 1.1 + 1.2 variable value for setProperty()
        this._units = {
            '--grid-gap': 'px',
            '--blur-depth': 'px',
            '--blur-radius': 'px',
            '--letter-spacing': 'em',
            '--transition-duration': 'ms',
            '--animation-duration': 'ms',
            '--chromatic-aberration': 'px',
            '--grid-columns': '',
            '--structural-density': '',
            '--layout-scale': '',
            '--line-height': '',
            '--layer-spacing': '',
            '--color-saturation': '',
            '--luminance-boost': '',
            '--motion-scale': '',
            '--background-complexity': '',
            '--opacity-levels': '',
            '--saturation-multiplier': ''
        };

        // Cache for initial variable baselines
        this._baselines = {};

        // Phase 1.3: Variable Access Tiers (T thresholds)
        this._tiers = {
            // Tier 1 (0.0 - 0.4) - Static / Passive
            '--identity-hue': 0.0, '--system-opacity': 0.0, '--font-weight': 0.0,
            '--lead-weight': 0.0, '--color-saturation': 0.0, '--grid-gap': 0.0,
            '--structural-density': 0.0, '--layout-scale': 0.0, '--grid-columns': 0.0,
            '--line-height': 0.0, '--letter-spacing': 0.0, '--luminance-boost': 0.0,

            // Tier 2 (0.5 - 0.7) - Dynamic
            '--border-radius': 0.5, '--padding': 0.5, '--opacity-levels': 0.5,
            '--layer-spacing': 0.5, '--transition-duration': 0.5,

            // Tier 3 (0.8 - 1.0) - Volatile
            '--clip-path': 0.8, '--blur-depth': 0.8, '--blur-radius': 0.8,
            '--chromatic-aberration': 0.8, '--mix-blend-mode': 0.8,
            '--entropy-scale': 0.8, '--motion-scale': 0.8, '--accent-glow': 0.8,
            '--saturation-multiplier': 0.8
        };

        // Variables requiring exponential multiplier (T^2 or T^3)
        this._exponentialVars = new Set([
            '--chromatic-aberration', '--blur-depth', '--blur-radius',
            '--motion-scale', '--saturation-multiplier', '--accent-glow'
        ]);

        console.log('%cStyleEvolver: Body ready for State Transformations.', 'color: #a855f7; font-weight: bold;');
    }

    /**
     * Calculates the Volatility Scaling Factor (T) [0.0 - 1.0].
     * Combines Linguistic Identity Intensity and Kinetic EPS.
     */
    calculateTemperature() {
        let intensity = 0;
        let eps = 0;

        if (window.HeuristicCore) {
            const axes = window.HeuristicCore.getAxes();
            if (axes) {
                // Derived from vector geometry magnitude
                intensity = Object.values(axes).reduce((acc, val) => acc * val, 1) ** (1 / 6);
            }
        } else {
            intensity = parseFloat(getComputedStyle(this.root).getPropertyValue('--identity-intensity') || '0');
        }

        if (window.KineticTracker && typeof window.KineticTracker.getEps === 'function') {
            const rawEps = window.KineticTracker.getEps();
            // Normalize EPS based on 10 EPS max frenzy mapped to 1.0
            eps = Math.min(rawEps / 10, 1.0);
        }

        const W1 = 0.6; // linguistic weight
        const W2 = 0.4; // kinetic weight

        const t = (intensity * W1) + (eps * W2);
        return Math.min(Math.max(t, 0.0), 1.0);
    }

    /**
     * Physically evolves the UI based on the 6-axis DNA vector.
     * Batches DOM writes to the next animation frame to avoid layout thrash.
     * @param {Object} vector - Output from HeuristicCore.getAxes().
     */
    evolve(vector) {
        if (!vector) return;
        this._pendingVector = vector;
        if (this._rafId) return;
        this._rafId = requestAnimationFrame(() => {
            this._applyVector(this._pendingVector);
            this._rafId = null;
            this._pendingVector = null;
        });
    }

    /**
     * Phase 1.1 + 1.2: Applies matrix and kinetic CSS variable deltas.
     * Incorporates Phase 1.3 scaling via the T coefficient and 
     * Phase 2.2 Morphological Interpolation.
     * @param {Object} cssState - Target variable state values.
     */
    evolveMatrix(cssState) {
        if (!cssState) return;

        // Phase 2.2: Synchronized Morph Lock
        if (this._isMorphing) {
            console.log('%cStyleEvolver: Morph in progress. Queuing rejected.', 'color: #9ca3af;');
            return;
        }

        requestAnimationFrame(() => {
            const t = this.calculateTemperature();
            let hasDeltas = false;

            // Phase 2.2: Dynamic Transition Curves
            const easing = (t > 0.7)
                ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // Volatile/Elastic
                : 'ease-out';                              // Linear/Smooth

            this.root.style.setProperty('--active-ease', easing);
            this.root.style.setProperty('--morph-duration', `${this._morphDuration}ms`);

            for (const [varName, value] of Object.entries(cssState)) {
                // Access Tier Gating
                const requiredTier = this._tiers[varName] || 0.0;
                if (t < requiredTier) continue;

                // Lazy load baselines for proper Delta extraction
                if (this._baselines[varName] === undefined) {
                    const currentDOM = getComputedStyle(this.root).getPropertyValue(varName).trim();
                    this._baselines[varName] = currentDOM ? parseFloat(currentDOM) : 0;
                }

                const baseline = this._baselines[varName];
                const target = parseFloat(value);
                if (isNaN(target)) continue;

                // Phase 2.2: Delta Computation
                const delta = target - baseline;
                if (Math.abs(delta) > 0.001) hasDeltas = true;

                // Scale magnitude linearly or exponentially
                const scaleFactor = this._exponentialVars.has(varName) ? (t * t) : t;
                const scaledValue = baseline + (delta * scaleFactor);

                const unit = this._units[varName] ?? '';
                const isInt = Number.isInteger(target) && unit === '';
                const formatted = isInt
                    ? Math.round(scaledValue).toString()
                    : scaledValue.toFixed(unit === 'px' || unit === 'ms' ? 0 : 3) + unit;
                this.root.style.setProperty(varName, formatted);

                // Update baseline for next morph
                this._baselines[varName] = scaledValue;
            }

            // Phase 2.2: Engage Lock if state changed
            if (hasDeltas) {
                this._isMorphing = true;
                setTimeout(() => {
                    this._isMorphing = false;
                }, this._morphDuration);
            }
        });
    }

    /**
     * Applies 6-axis vector values to root CSS properties.
     * Incorporates Scaling Curve and gating where applicable.
     * @private
     */
    _applyVector(v) {
        const r = this.root;
        const t = this.calculateTemperature();

        // Helper to evaluate T gating and scale if requested
        const setScaledVar = (varName, targetValue, isExponential = false) => {
            if (t < (this._tiers[varName] || 0.0)) return;
            if (this._baselines[varName] === undefined) {
                const currentDOM = getComputedStyle(this.root).getPropertyValue(varName).trim();
                this._baselines[varName] = currentDOM ? parseFloat(currentDOM) : 0;
            }
            const baseline = this._baselines[varName];
            const delta = targetValue - baseline;
            const sf = isExponential ? (t * t) : t;
            return baseline + (delta * sf);
        };

        // Linear targets
        const gapScaled = setScaledVar('--grid-gap', 10 * (1 - v.build), false);
        if (gapScaled !== undefined) r.style.setProperty('--grid-gap', `${Math.round(gapScaled)}px`);

        // Exponential targets
        const glowScaled = setScaledVar('--accent-glow', v.express * 20, true);
        if (glowScaled !== undefined) r.style.setProperty('--accent-glow', `${Math.round(glowScaled)}px`);

        // Gated un-scaled direct values (tier 1)
        if (t >= (this._tiers['--system-opacity'] || 0.0)) {
            r.style.setProperty('--system-opacity', v.maintain.toFixed(3));
        }

        // Entropy and Lead Scale (Tier 3 and 1)
        if (t >= (this._tiers['--entropy-scale'] || 0.0)) {
            r.style.setProperty('--entropy-scale', v.experiment.toFixed(3));
        }
        if (t >= (this._tiers['--lead-weight'] || 0.0)) {
            const lwScaled = setScaledVar('--lead-weight', 300 + v.lead * 400, false);
            if (lwScaled !== undefined) r.style.setProperty('--lead-weight', String(Math.round(lwScaled)));
        }

        // Identity Hue involves constant drifting if logic is continuous; apply T to limit drift velocity
        if (t >= (this._tiers['--identity-hue'] || 0.0)) {
            const baseHue = parseInt(getComputedStyle(r).getPropertyValue('--identity-hue') || '220', 10);
            const hueDelta = (v.analyze - 0.5) * 60;
            const scaledHueDelta = hueDelta * t; // T scales drift speed
            r.style.setProperty('--identity-hue', String(Math.round(baseHue + scaledHueDelta)));
        }

        // Always update intensity (used in T calculation in future ticks)
        const intensity = Object.values(v).reduce((acc, val) => acc * val, 1) ** (1 / 6);
        r.style.setProperty('--identity-intensity', intensity.toFixed(4));

        // Phase 2.2 Sync: Make _applyVector respect the morph duration
        // Note: vector changes don't trigger the lock themselves as they are continuous layout ticks, 
        // but they should ride the easing curve
    }

    /**
     * Applies 24h recurrence decay — reduces --identity-intensity by 10%.
     * Called by Kernel.js Reflex Arc on stale vault timestamps.
     */
    applyDecayTick() {
        const current = parseFloat(
            getComputedStyle(this.root).getPropertyValue('--identity-intensity') || '1'
        );
        const decayed = Math.max(0.1, current * 0.9);
        this.root.style.setProperty('--identity-intensity', decayed.toFixed(4));
        console.warn(`StyleEvolver: Decay tick. Intensity: ${current.toFixed(3)} → ${decayed.toFixed(3)}`);
        return decayed;
    }

    /**
     * Returns all current CSS variable values from the DOM (6-axis + matrix).
     * Use for debugging or SovereignAudit snapshots.
     */
    readCurrentState() {
        const style = getComputedStyle(this.root);
        const vars = [
            '--grid-gap', '--accent-glow', '--system-opacity', '--identity-hue',
            '--entropy-scale', '--lead-weight', '--identity-intensity',
            '--structural-density', '--layout-scale', '--grid-columns',
            '--blur-depth', '--letter-spacing', '--line-height',
            '--layer-spacing', '--transition-duration', '--color-saturation',
            '--luminance-boost', '--motion-scale'
        ];
        return Object.fromEntries(vars.map(v => [v, style.getPropertyValue(v).trim()]));
    }
}

window.StyleEvolver = new StyleEvolver();
