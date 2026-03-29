/**
 * HORIZON MODE: The Navigation Sentinel
 * Projects 'Ghost Nodes' representing the next logical professional evolution.
 */
class HorizonMode {
    constructor(engine) {
        this.engine = engine;
        this.isActive = false;
        this.ghostNodes = [];
    }

    /**
     * Toggles the Future Projection
     */
    toggle() {
        this.isActive = !this.isActive;
        this.isActive ? this.ignite() : this.extinguish();
        
        if (window.SystemThinking) {
            window.SystemThinking.log(this.isActive ? "Horizon Mode: PROJECTION IGNITED." : "Horizon Mode: EXTINGUISHED.", this.isActive ? "success" : "info");
        }
    }

    ignite() {
        console.log(">> HORIZON MODE ACTIVE: CALCULATING POTENTIALITY...");
        
        // 1. Calculate the 'Gap' between reality and procedural peak
        // Note: Using window.ERESpine.params.vectors for standardized access
        const current = (window.ERESpine && window.ERESpine.params) ? window.ERESpine.params.vectors : { build: 50, express: 50, analyze: 50 };
        const potential = {
            build: Math.min(100, current.build + 25),
            express: Math.min(100, current.express + 15),
            analyze: Math.min(100, current.analyze + 30)
        };

        // 2. Trigger Ghost Topology
        this.renderGhostNodes(potential);
        
        // 3. Apply UI Tension (Vibration) via CreativeCanvas
        if (window.CreativeCanvas && window.CreativeCanvas.setStressLevel) {
            window.CreativeCanvas.setStressLevel(0.4); 
        }
    }

    renderGhostNodes(targets) {
        if (!this.engine || !this.engine.scene) {
            console.error("Horizon Fail: Engine scene not found.");
            return;
        }

        // Create Translucent, Vibrating Blueprints
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });

        Object.keys(targets).forEach((key, i) => {
            const ghost = new THREE.Mesh(geometry, material);
            // Distribute ghosts around the scene
            ghost.position.set((i - 1) * 6, (targets[key] / 10) - 5, -8);
            this.engine.scene.add(ghost);
            this.ghostNodes.push(ghost);

            // Animate the 'Ghost' appearance
            if (window.gsap) {
                gsap.from(ghost.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "elastic.out" });
            }
        });
    }

    extinguish() {
        this.ghostNodes.forEach(node => {
            if (window.gsap) {
                gsap.to(node.scale, { 
                    x: 0, y: 0, z: 0, 
                    duration: 0.5, 
                    onComplete: () => {
                        if (this.engine && this.engine.scene) this.engine.scene.remove(node);
                    }
                });
            } else {
                if (this.engine && this.engine.scene) this.engine.scene.remove(node);
            }
        });
        this.ghostNodes = [];
        
        if (window.CreativeCanvas && window.CreativeCanvas.setStressLevel) {
            window.CreativeCanvas.setStressLevel(0);
        }
    }
}

window.HorizonMode = HorizonMode;

