// Import Three.js, GLTFLoader, and RGBELoader from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/EXRLoader.js';

// Main function to initialize and run the WebGL effect
function init() {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding; // Important for proper color rendering
    renderer.physicallyCorrectLights = true; // Better lighting calculations
    document.getElementById('webgl-container').appendChild(renderer.domElement);
    
    // Load HDRI environment map for lighting using EXRLoader
    const exrLoader = new EXRLoader();
    exrLoader.load(
        'https://cdn.jsdelivr.net/gh/rayyankhan/PortfolioCube@main/studio_small_09_2k.exr', // HDRI file URL
        function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; // Set texture mapping type
            scene.environment = texture; // Apply the HDRI as the environment map
        },
        undefined,
        function (error) {
            console.error('Error loading HDRI:', error);
        }
    );
    
    // Add rim light - positioned behind the object to create edge highlighting
    const rimLight = new THREE.PointLight(0xffffff, 1.5, 100); // White rim light
    rimLight.position.set(0, 0, -7); // Behind the object
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
    
    // Create a container for our object (model)
    const modelContainer = new THREE.Group();
    scene.add(modelContainer);
    
    // Load GLTF model from your repository using jsDelivr
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        'https://cdn.jsdelivr.net/gh/rayyankhan/PortfolioCube@main/Cube_1.gltf', // Correct URL for Cube_1.gltf
        function (gltf) {
            // Apply the iridescent material to all meshes in the GLTF model
            gltf.scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            
            // Scale the object appropriately (adjust as needed)
            gltf.scene.scale.set(2, 2, 2); 
            
            // Add the loaded object to our container
            modelContainer.add(gltf.scene);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Progress logging
        },
        function (error) {
            console.error('An error occurred while loading the GLTF model:', error); // Error handling
        }
    );
    
    let targetX = 0;
    let targetY = 0;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        modelContainer.position.x += (targetX - modelContainer.position.x) * 0.1;
        modelContainer.position.y += (targetY - modelContainer.position.y) * 0.1;

        modelContainer.rotation.x += 0.005;
        modelContainer.rotation.y += 0.005;

        const time = Date.now() * 0.001;
        rimLight.position.x = Math.sin(time) * 7;
        rimLight.position.y = Math.cos(time) * 7;
        rimLight.position.z = -7 + Math.sin(time * 0.5) * 2;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX / window.innerWidth) * 4 - 2;
        targetY = -(event.clientY / window.innerHeight) * 4 + 2;
    });

    animate(); // Start animation loop
}

// Run the init function when the window loads
window.onload = init;
