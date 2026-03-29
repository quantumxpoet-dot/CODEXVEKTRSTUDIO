/**
 * Euclidean Recursion Engine - Interactive Particle Background
 * Creates a dynamic 3D particle system using Three.js
 */

class ParticlesBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Canvas element not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particleCount = 800;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup - use canvas dimensions if available, otherwise window
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        this.camera.position.z = 400;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particles
        this.createParticles();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);

        // Initialize particle positions and velocities
        for (let i = 0; i < this.particleCount * 3; i += 3) {
            // Random positions in a sphere
            positions[i] = (Math.random() - 0.5) * 800;
            positions[i + 1] = (Math.random() - 0.5) * 800;
            positions[i + 2] = (Math.random() - 0.5) * 400;

            // Small random velocities for organic movement
            velocities[i] = (Math.random() - 0.5) * 0.2;
            velocities[i + 1] = (Math.random() - 0.5) * 0.2;
            velocities[i + 2] = (Math.random() - 0.5) * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // Particle material with glow effect
        const material = new THREE.PointsMaterial({
            color: 0x38bdf8, // Sky blue
            size: 2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Store velocities for animation
        this.particleVelocities = velocities;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Rotate particles based on mouse position
        if (this.particles) {
            this.particles.rotation.y = this.mouseX * 0.0002;
            this.particles.rotation.x = this.mouseY * 0.0002;

            // Animate individual particles
            const positions = this.particles.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Apply velocities
                positions[i] += this.particleVelocities[i];
                positions[i + 1] += this.particleVelocities[i + 1];
                positions[i + 2] += this.particleVelocities[i + 2];

                // Bounce particles back if they go too far
                if (Math.abs(positions[i]) > 400) {
                    this.particleVelocities[i] *= -1;
                }
                if (Math.abs(positions[i + 1]) > 400) {
                    this.particleVelocities[i + 1] *= -1;
                }
                if (Math.abs(positions[i + 2]) > 200) {
                    this.particleVelocities[i + 2] *= -1;
                }
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        // Mouse move for interactive rotation
        window.addEventListener('mousemove', (event) => {
            this.targetMouseX = event.clientX - window.innerWidth / 2;
            this.targetMouseY = event.clientY - window.innerHeight / 2;
        });

        // Window resize
        window.addEventListener('resize', () => {
            const width = this.canvas.clientWidth || window.innerWidth;
            const height = this.canvas.clientHeight || window.innerHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    // Public method to update particle color
    setColor(color) {
        if (this.particles) {
            this.particles.material.color.set(color);
        }
    }

    // Public method to adjust particle count for performance
    setParticleCount(count) {
        this.particleCount = count;
        if (this.particles) {
            this.scene.remove(this.particles);
            this.createParticles();
        }
    }
}

// Auto-initialize if canvas exists
if (typeof window !== 'undefined') {
    window.ParticlesBackground = ParticlesBackground;
}

