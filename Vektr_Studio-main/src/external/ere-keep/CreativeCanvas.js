/**
 * Euclidean Recursion Engine - Creative Canvas Module (Three.js Edition)
 * "Agentic Dreaming" - Vibe-based Procedural Geometry
 */

class CreativeCanvasModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.animationId = null;

        // "Vibe" State
        this.config = {
            style: "Initializing...",
            palette: ["#101010", "#202020"],
            speed: 0.5,
            complexity: 0.5,
            flowType: 'wave'
        };

        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.time = 0;
    }

    async init(prompt) {
        if (!this.container) return;

        // 1. Setup Three.js
        this.scene = new THREE.Scene();
        // Fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 2. Create Initial Geometry (The "Dream" Object)
        this.createDreamObject();

        // 3. Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // 4. Interaction
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            // Normalized mouse coords (-1 to 1)
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // 5. Start Animation Loop
        this.animate();

        // 6. Gemini Integration
        if (prompt && window.GeminiClient) {
            console.log(`>> MANUAL OVERRIDE: "${prompt}"`);
            const config = await window.GeminiClient.generateConfig(prompt);
            this.transitionTo(config);
        } else if (window.DreamEngine) {
            window.DreamEngine.start();
        }
    }

    createDreamObject() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.geometry.dispose();
            this.material.dispose();
        }

        // Vibe-Specific Geometry
        if (this.config.style.includes("Musician") || this.config.style.includes("Glitch")) {
             // Musician: High detail sphere for vibration
             this.geometry = new THREE.IcosahedronGeometry(2, 4); 
             this.material = new THREE.MeshStandardMaterial({
                color: this.config.palette[0],
                wireframe: true,
                roughness: 0.2,
                metalness: 0.9,
             });
        } else if (this.config.style.includes("Philosopher") || this.config.style.includes("Crystalline")) {
             // Philosopher: Low poly, sharp crystal
             this.geometry = new THREE.ConeGeometry(2, 4, 4, 1);
             this.material = new THREE.MeshStandardMaterial({
                color: this.config.palette[0],
                wireframe: false,
                roughness: 0.0,
                metalness: 0.1,
                flatShading: true
             });
        } else {
             // Default "Dream"
             const detail = Math.floor(this.config.complexity * 2) + 1; 
             this.geometry = new THREE.IcosahedronGeometry(2, detail);
             this.material = new THREE.MeshStandardMaterial({
                color: this.config.palette[0],
                wireframe: this.config.complexity > 0.6,
                roughness: 0.4,
                metalness: 0.5,
                flatShading: true
             });
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.time += 0.01 * this.config.speed;

        // Smooth Mouse
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        if (this.mesh) {
            // Base Rotation
            this.mesh.rotation.x += 0.005 * this.config.speed;
            this.mesh.rotation.y += 0.005 * this.config.speed;

            // Interaction
            this.mesh.rotation.x += this.mouse.y * 0.05;
            this.mesh.rotation.y += this.mouse.x * 0.05;

            // --- VIBE HACK: DIRECT GEOMETRY MANIPULATION ---
            
            // Mode: Musician / Glitch -> Vertex Vibration
            if (this.config.style.includes("Musician") || this.config.style.includes("Glitch")) {
                 const positionAttribute = this.geometry.getAttribute('position');
                 const vertex = new THREE.Vector3();
                 
                 // Artificial "Audio Frequency" based on time
                 const frequency = Math.sin(this.time * 20) * 0.1 * this.config.complexity; 

                 for (let i = 0; i < positionAttribute.count; i++) {
                     vertex.fromBufferAttribute(positionAttribute, i);
                     // Jitter
                     if (Math.random() > 0.9) {
                         vertex.x += (Math.random() - 0.5) * frequency;
                         vertex.y += (Math.random() - 0.5) * frequency;
                         vertex.z += (Math.random() - 0.5) * frequency;
                     }
                     // Restore slowly? No, this is destructive memory-less jitter for now.
                     // Ideally we save original positions.
                     // For performance/simplicity, we won't restore in this loop, causing it to explode eventually? 
                     // No, let's just use a scaling pulse relative to center to avoid explosion.
                     
                     // Better approach for performance: modify SCALE of mesh, not vertices
                 }
                 this.mesh.scale.set(1 + frequency, 1 + frequency, 1 + frequency);
                 this.material.wireframe = Math.random() > 0.95; // Random wireframe glitch
            }

            // Mode: Philosopher -> Breathing Stillness
            if (this.config.style.includes("Philosopher")) {
                const breath = Math.sin(this.time * 0.5) * 0.05;
                this.mesh.scale.set(1 + breath, 1 + breath, 1 + breath);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

window.CreativeCanvasModule = CreativeCanvasModule;

