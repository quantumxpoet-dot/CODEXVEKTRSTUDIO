/**
 * ACOUSTIC RESONANCE (v1.0 - Kinetic Script Only)
 * Maps real-time mic/audio frequencies to visual manifold torque.
 * Gated by StateController.features.acousticResonance (tier >= 7).
 */
class AcousticResonance {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.active = false;
        this.animFrame = null;
    }

    /**
     * Activate audio capture and frequency analysis.
     */
    async activate() {
        if (this.active) return;
        const sc = window.StateController;
        if (!sc || !sc.features.acousticResonance) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;

            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.active = true;
            this.loop();

            console.log('>> RESONANCE: Acoustic capture active.');
        } catch (err) {
            console.warn('>> RESONANCE: Mic access denied or unavailable.');
        }
    }

    /**
     * Main analysis loop — extracts frequency data and dispatches to 3D.
     */
    loop() {
        if (!this.active) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate average amplitude
        const avg = this.dataArray.reduce((sum, v) => sum + v, 0) / this.dataArray.length;
        const normalized = avg / 255; // 0..1

        // Dispatch frequency data as DOM event for 3D manifold torque
        window.dispatchEvent(new CustomEvent('acoustic_pulse', {
            detail: {
                amplitude: normalized,
                frequencies: Array.from(this.dataArray.slice(0, 32)), // Low-frequency band
                peak: Math.max(...this.dataArray) / 255
            }
        }));

        // Sync to HSL saturation boost
        if (normalized > 0.3) {
            const boost = Math.round(normalized * 30);
            document.documentElement.style.setProperty('--kinetic-sat',
                `${Math.min(100, 50 + boost)}%`
            );
        }

        this.animFrame = requestAnimationFrame(() => this.loop());
    }

    /**
     * Deactivate audio capture.
     */
    deactivate() {
        this.active = false;
        cancelAnimationFrame(this.animFrame);
        if (this.audioCtx) this.audioCtx.close();
        this.audioCtx = null;
    }
}

window.AcousticResonance = new AcousticResonance();
