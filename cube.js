// Import Three.js from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// Main function to initialize and run the WebGL effect
function init() {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('webgl-container').appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add colored point lights for iridescence effect
    const pointLight = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Add rim light - positioned behind the object to create edge highlighting
    const rimLight = new THREE.PointLight(0xffffff, 1.5, 100);
    rimLight.position.set(0, 0, -7); // Behind the cube
    scene.add(rimLight);
    
    // Create iridescent material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 1,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400]
    });
    
    // Create beveled cube using BoxGeometry with more segments and chamfered edges
    // Instead of a basic BoxGeometry, we'll use a more complex approach for beveled edges
    const boxWidth = 2;
    const boxHeight = 2;
    const boxDepth = 2;
    const bevelSize = 0.2; // Size of the beveled edge
    
    // Create a basic box shape
    const boxGeometry = new THREE.BoxGeometry(
        boxWidth - bevelSize*2, 
        boxHeight - bevelSize*2, 
        boxDepth - bevelSize*2
    );
    
    // Convert BoxGeometry to BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', boxGeometry.getAttribute('position'));
    geometry.setAttribute('normal', boxGeometry.getAttribute('normal'));
    geometry.setAttribute('uv', boxGeometry.getAttribute('uv'));
    geometry.setIndex(boxGeometry.getIndex());
    
    // Create a sphere for rounded corners
    const sphereGeometry = new THREE.SphereGeometry(bevelSize, 8, 8);
    const edgePositions = [
        // Corners (8 positions)
        [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
        [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
    ];
    
    // Create a cube with beveled edges by merging geometries
    const finalGeometry = new THREE.BufferGeometry();
    const meshes = [];
    
    // Add the main box
    meshes.push(new THREE.Mesh(geometry, material));
    
    // Add spheres at corners for rounded edges
    edgePositions.forEach(pos => {
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(
            pos[0] * (boxWidth/2 - bevelSize),
            pos[1] * (boxHeight/2 - bevelSize),
            pos[2] * (boxDepth/2 - bevelSize)
        );
        meshes.push(sphere);
    });
    
    // Create the final beveled cube
    const cube = new THREE.Group();
    meshes.forEach(mesh => cube.add(mesh));
    scene.add(cube);
    
    // Default position
    let targetX = 0;
    let targetY = 0;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Smoothly interpolate current position toward target position
        cube.position.x += (targetX - cube.position.x) * 0.1;
        cube.position.y += (targetY - cube.position.y) * 0.1;
        
        // Add some gentle rotation for extra visual interest
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        
        // Animate rim light for more dynamic effect
        const time = Date.now() * 0.001;
        rimLight.position.x = Math.sin(time) * 7;
        rimLight.position.y = Math.cos(time) * 7;
        rimLight.position.z = -7 + Math.sin(time * 0.5) * 2;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Add mouse interactivity - cube follows cursor
    document.addEventListener('mousemove', (event) => {
        // Convert mouse position to 3D coordinates
        targetX = (event.clientX / window.innerWidth) * 4 - 2;
        targetY = -(event.clientY / window.innerHeight) * 4 + 2;
    });
    
    // Start animation
    animate();
}

// Run the init function when the window loads
window.onload = init;
