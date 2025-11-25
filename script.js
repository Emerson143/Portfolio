// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
}));

// Three.js 3D Cube
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Match bg color

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Materials for each face (different colors for fun)
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.8 }), // Right
        new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.3, metalness: 0.8 }), // Left
        new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.8 }), // Top
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3, metalness: 0.8 }), // Bottom
        new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.3, metalness: 0.8 }), // Front
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 }), // Back
    ];

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = container.clientWidth / 2;
    const windowHalfY = container.clientHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        cube.rotation.y += 0.05 * (targetX - cube.rotation.y);
        cube.rotation.x += 0.05 * (targetY - cube.rotation.x);

        // Auto rotation fallback
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
};

// Initialize Three.js when DOM is loaded
document.addEventListener('DOMContentLoaded', initThreeJS);
