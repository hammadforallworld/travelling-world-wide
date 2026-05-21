// ==========================================
// Horizon3D - Three.js 3D Engine
// ==========================================

// Global fleet specs to share with app.js
const FLEET_DATA = [
    {
        id: "supersonic",
        name: "AeroStream Mach-X",
        tagline: "The Future of Supersonic Travel",
        desc: "Engineered with carbon-matrix composite materials and powered by hybrid scramjet engines, the Mach-X reaches velocities of Mach 2.2, slicing transatlantic flight times in half.",
        speed: "Mach 2.2 (1,680 mph)",
        range: "6,500 nm",
        capacity: "12 passengers",
        classLevel: "Apex First Class",
        color: 0xffaa00 // Neon gold accents
    },
    {
        id: "cruiser",
        name: "Starlight Quantum",
        tagline: "Ultra-Luxury Orbital Voyager",
        desc: "Designed for high-altitude orbital cruising, the Quantum integrates silent plasma engines, a triple-stabilizer layout, and panoramic glass roofs for stargazing above the stratosphere.",
        speed: "Mach 3.5 (2,680 mph)",
        range: "12,000 nm",
        capacity: "8 passengers",
        classLevel: "Orbi-Starlight Suite",
        color: 0x9900ff // Neon purple accents
    },
    {
        id: "airliner",
        name: "Apex SkyLiner 900",
        tagline: "High-Capacity Global Flagship",
        desc: "The ultimate long-haul luxury wider-body, featuring double-decker passenger decks, private sleeping pods, a walk-in sky lounge, and ultra-quiet turbofan engines.",
        speed: "Mach 0.92 (705 mph)",
        range: "9,800 nm",
        capacity: "98 passengers",
        classLevel: "Hybrid Business/First",
        color: 0x00ffff // Neon cyan accents
    }
];

let currentSelectedPlane = FLEET_DATA[0];

// Canvas instances
let globeScene, globeCamera, globeRenderer, globeMesh, flightPaths = [];
let hangarScene, hangarCamera, hangarRenderer, currentPlaneGroup, airplaneMeshContainer;
let isHangarInitialized = false;

// Custom Orbit / Mouse Drag Variables for Hangar
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let planeRotation = { x: 0.2, y: 0.5 };
let targetPlaneRotation = { x: 0.2, y: 0.5 };
let targetScale = 1.0;
let currentScale = 0.01;

// --- Initialize 3D Scenes ---
window.addEventListener("load", () => {
    initGlobeScene();
    initHangarScene();
    setupPlaneSelector();
    
    // Trigger window resize
    window.dispatchEvent(new Event('resize'));
});

// --- Viewport Resize Handler ---
window.addEventListener("resize", () => {
    // Globe Resize
    if (globeRenderer) {
        const globeContainer = document.getElementById("globe-canvas").parentElement;
        globeCamera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
        globeCamera.updateProjectionMatrix();
        globeRenderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    }
    // Hangar Resize
    if (hangarRenderer) {
        const canvasContainer = document.getElementById("canvasContainer");
        hangarCamera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        hangarCamera.updateProjectionMatrix();
        hangarRenderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }
});

// ==========================================
// 1. Futuristic Holographic 3D Globe
// ==========================================
function initGlobeScene() {
    const canvas = document.getElementById("globe-canvas");
    const container = canvas.parentElement;
    
    globeScene = new THREE.Scene();
    
    // Camera
    globeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    globeCamera.position.z = 18;

    // Renderer
    globeRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    globeRenderer.setSize(container.clientWidth, container.clientHeight);
    globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Hologram Globe Geometry
    const globeGeometry = new THREE.SphereGeometry(6, 40, 40);
    
    // Wireframe glowing material
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    
    globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeScene.add(globeMesh);

    // Inner glowing sphere core
    const innerGeo = new THREE.SphereGeometry(5.8, 30, 30);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x0a0525,
        transparent: true,
        opacity: 0.8
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    globeMesh.add(innerCore);

    // Dot points on the globe surface to look like cities
    const dotsGeo = new THREE.BufferGeometry();
    const dotsCount = 500;
    const positions = new Float32Array(dotsCount * 3);
    
    for(let i=0; i<dotsCount; i++) {
        // Random spherical coordinates
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 6.05; // Slightly above globe surface
        
        positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = r * Math.cos(phi);
    }
    
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dotsMat = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 0.12,
        transparent: true,
        opacity: 0.8
    });
    const globeDots = new THREE.Points(dotsGeo, dotsMat);
    globeMesh.add(globeDots);

    // Add Glowing Flight Arcs
    createFlightArc(0x00f2fe);
    createFlightArc(0xec4899);
    createFlightArc(0x8b5cf6);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 1);
    globeScene.add(light);

    // Animation Loop
    function animateGlobe() {
        requestAnimationFrame(animateGlobe);
        
        // Auto rotate
        globeMesh.rotation.y += 0.002;
        globeMesh.rotation.x += 0.0005;

        // Animate flight path rings slightly
        flightPaths.forEach((path, idx) => {
            path.rotation.z += 0.005 * (idx % 2 === 0 ? 1 : -1);
            path.rotation.y += 0.002;
        });

        globeRenderer.render(globeScene, globeCamera);
    }
    animateGlobe();
}

function createFlightArc(colorCode) {
    const parentGroup = new THREE.Group();
    
    // Create circular path
    const radius = 6.8 + Math.random() * 0.8;
    const curvePoints = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        curvePoints.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
    }
    
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
        color: colorCode,
        transparent: true,
        opacity: 0.3
    });
    
    const line = new THREE.Line(curveGeo, curveMat);
    parentGroup.add(line);

    // Add a pulsing jet dot flying along it
    const dotGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({
        color: colorCode,
        toneMapped: false
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.x = radius;
    parentGroup.add(dot);

    // Tilt the orbit randomly
    parentGroup.rotation.x = Math.random() * Math.PI;
    parentGroup.rotation.y = Math.random() * Math.PI;

    globeMesh.add(parentGroup);
    flightPaths.push(parentGroup);
}

// ==========================================
// 2. 3D Aircraft Hangar Showroom
// ==========================================
function initHangarScene() {
    const canvas = document.getElementById("hangar-canvas");
    const container = canvas.parentElement;

    hangarScene = new THREE.Scene();
    // Add space-like fog
    hangarScene.fog = new THREE.FogExp2(0x06060c, 0.015);

    // Camera
    hangarCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    hangarCamera.position.set(0, 3, 14);

    // Renderer
    hangarRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    hangarRenderer.setSize(container.clientWidth, container.clientHeight);
    hangarRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    hangarScene.add(ambientLight);

    // Main neon key lights
    const keyLight1 = new THREE.DirectionalLight(0x00f2fe, 1.5); // Cyan
    keyLight1.position.set(5, 5, 5);
    hangarScene.add(keyLight1);

    const keyLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2); // Purple
    keyLight2.position.set(-5, 5, -5);
    hangarScene.add(keyLight2);

    const softTopLight = new THREE.DirectionalLight(0xffffff, 0.8);
    softTopLight.position.set(0, 10, 0);
    hangarScene.add(softTopLight);

    // Floor Grid to anchor the aircraft in space
    const gridHelper = new THREE.GridHelper(30, 30, 0x8b5cf6, 0x1f1f3f);
    gridHelper.position.y = -3;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    hangarScene.add(gridHelper);

    // Group to hold model and rotate
    airplaneMeshContainer = new THREE.Group();
    hangarScene.add(airplaneMeshContainer);

    // Initialize plane
    loadPlane3D(currentSelectedPlane.id);

    // Hide loader
    document.getElementById("threeLoading").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("threeLoading").style.display = "none";
    }, 500);

    // Interaction Events (Drag Rotation)
    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        // Update target rotation based on drag speed
        targetPlaneRotation.y += deltaMove.x * 0.007;
        targetPlaneRotation.x += deltaMove.y * 0.007;
        
        // Clamp vertical look rotation
        targetPlaneRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetPlaneRotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Mobile touch events
    canvas.addEventListener("touchstart", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    canvas.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };
        targetPlaneRotation.y += deltaMove.x * 0.008;
        targetPlaneRotation.x += deltaMove.y * 0.008;
        targetPlaneRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetPlaneRotation.x));
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    // Scroll zoom within constraints
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        targetScale -= e.deltaY * 0.001;
        targetScale = Math.max(0.6, Math.min(1.6, targetScale));
    }, { passive: false });

    // Hangar Render Loop
    function renderHangar() {
        requestAnimationFrame(renderHangar);

        // Smoothly interpolate rotation (Damping effect)
        planeRotation.x += (targetPlaneRotation.x - planeRotation.x) * 0.08;
        planeRotation.y += (targetPlaneRotation.y - planeRotation.y) * 0.08;

        airplaneMeshContainer.rotation.x = planeRotation.x;
        airplaneMeshContainer.rotation.y = planeRotation.y;

        // Auto-rotation when idle
        if (!isDragging) {
            targetPlaneRotation.y += 0.002;
        }

        // Smooth scale entry & zoom
        currentScale += (targetScale - currentScale) * 0.05;
        airplaneMeshContainer.scale.set(currentScale, currentScale, currentScale);

        // Jet engine particle simulation
        animateThrusterGlow();

        hangarRenderer.render(hangarScene, hangarCamera);
    }
    renderHangar();
    isHangarInitialized = true;
}

// ==========================================
// 3. Procedural 3D Plane Models (Highly Detailed)
// ==========================================
let leftEngineLight, rightEngineLight, exhaustMesh;

function loadPlane3D(planeId) {
    // Clear existing model children
    while (airplaneMeshContainer.children.length > 0) {
        airplaneMeshContainer.remove(airplaneMeshContainer.children[0]);
    }

    currentScale = 0.01; // trigger growth animation
    
    // Root group for the current active plane
    currentPlaneGroup = new THREE.Group();
    
    // Core Shiny Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xddddf5,
        roughness: 0.15,
        metalness: 0.9,
        flatShading: false
    });

    const darkTrimMaterial = new THREE.MeshStandardMaterial({
        color: 0x111122,
        roughness: 0.3,
        metalness: 0.8
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.6
    });

    // Custom Neon Glow color based on selection
    const accentColor = currentSelectedPlane.color;
    const neonMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        toneMapped: false
    });

    if (planeId === "supersonic") {
        // --- 1. SUPERSONIC DELTA JET ---
        // Main Fuselage (Long Sleek Needle shape)
        const fuselageGeo = new THREE.CylinderGeometry(0.35, 0.45, 7, 16);
        fuselageGeo.rotateX(Math.PI / 2);
        const fuselage = new THREE.Mesh(fuselageGeo, bodyMaterial);
        currentPlaneGroup.add(fuselage);

        // Sharp Nose Cone
        const noseGeo = new THREE.ConeGeometry(0.35, 1.8, 16);
        noseGeo.rotateX(Math.PI / 2);
        noseGeo.translate(0, 0, 4.4);
        const nose = new THREE.Mesh(noseGeo, darkTrimMaterial);
        currentPlaneGroup.add(nose);

        // Cockpit window visor
        const canopyGeo = new THREE.BoxGeometry(0.4, 0.25, 1.2);
        canopyGeo.translate(0, 0.3, 2.5);
        const canopy = new THREE.Mesh(canopyGeo, glassMaterial);
        currentPlaneGroup.add(canopy);

        // Delta wings (Sweep shape)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2.8, -3.2); // Wing tip
        wingShape.lineTo(0.4, -3.5); // Wing root rear
        wingShape.lineTo(0, -3.5);
        
        const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.rotateX(Math.PI / 2);
        wingGeo.translate(0, 0, 1.2);
        
        const leftWing = new THREE.Mesh(wingGeo, bodyMaterial);
        currentPlaneGroup.add(leftWing);

        const rightWing = leftWing.clone();
        rightWing.scale.x = -1;
        currentPlaneGroup.add(rightWing);

        // Vertical tail stabilizer
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(0, 1.5);
        tailShape.lineTo(-1.2, 0.2);
        tailShape.lineTo(-1.2, 0);
        const tailGeo = new THREE.ExtrudeGeometry(tailShape, extrudeSettings);
        tailGeo.rotateY(Math.PI / 2);
        tailGeo.translate(0, 0.3, -2.2);
        const tail = new THREE.Mesh(tailGeo, darkTrimMaterial);
        currentPlaneGroup.add(tail);

        // Dual Engine Exhaust pods under rear
        const engineGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12);
        engineGeo.rotateX(Math.PI / 2);
        
        const leftEng = new THREE.Mesh(engineGeo, darkTrimMaterial);
        leftEng.position.set(-0.45, -0.2, -2.6);
        currentPlaneGroup.add(leftEng);

        const rightEng = leftEng.clone();
        rightEng.position.x = 0.45;
        currentPlaneGroup.add(rightEng);

        // Thruster Glow Rings
        const glowGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
        glowGeo.rotateX(Math.PI / 2);
        const leftGlow = new THREE.Mesh(glowGeo, neonMaterial);
        leftGlow.position.set(-0.45, -0.2, -3.5);
        const rightGlow = leftGlow.clone();
        rightGlow.position.x = 0.45;
        currentPlaneGroup.add(leftGlow);
        currentPlaneGroup.add(rightGlow);

    } else if (planeId === "cruiser") {
        // --- 2. STARLIGHT QUANTUM (Futuristic luxury yacht glider) ---
        // Curved Pod Fuselage
        const podGeo = new THREE.SphereGeometry(1.0, 32, 16);
        podGeo.scale(0.8, 0.7, 3.2); // stretch to airplane shape
        const fuselage = new THREE.Mesh(podGeo, bodyMaterial);
        currentPlaneGroup.add(fuselage);

        // Panoramic Sunroof (Dark Glass)
        const roofGeo = new THREE.SphereGeometry(0.9, 20, 10);
        roofGeo.scale(0.65, 0.5, 1.8);
        roofGeo.translate(0, 0.45, 0);
        const sunroof = new THREE.Mesh(roofGeo, glassMaterial);
        currentPlaneGroup.add(sunroof);

        // Curved organic wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(2.0, 1.0, 3.5, -1.0); // Sweep forward/out curve
        wingShape.lineTo(2.0, -1.5);
        wingShape.quadraticCurveTo(1.0, -0.5, 0, -1.0);
        
        const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.03, bevelThickness: 0.02 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.rotateX(Math.PI / 2);
        wingGeo.translate(0, -0.1, 0.8);
        
        const leftWing = new THREE.Mesh(wingGeo, bodyMaterial);
        currentPlaneGroup.add(leftWing);

        const rightWing = leftWing.clone();
        rightWing.scale.x = -1;
        currentPlaneGroup.add(rightWing);

        // Double angled Tail Fins
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(0.5, 1.6);
        finShape.lineTo(1.0, 1.4);
        finShape.lineTo(0.6, 0);
        const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
        finGeo.rotateX(Math.PI / 2);
        
        const leftFin = new THREE.Mesh(finGeo, darkTrimMaterial);
        leftFin.position.set(-0.5, 0, -2.6);
        leftFin.rotation.z = 0.3; // outward tilt
        currentPlaneGroup.add(leftFin);

        const rightFin = leftFin.clone();
        rightFin.position.x = 0.5;
        rightFin.rotation.z = -0.3;
        currentPlaneGroup.add(rightFin);

        // Ring Engine (Torus at tail)
        const ringGeo = new THREE.TorusGeometry(0.8, 0.15, 12, 24);
        const ring = new THREE.Mesh(ringGeo, darkTrimMaterial);
        ring.position.set(0, 0, -2.8);
        currentPlaneGroup.add(ring);

        // Inner plasma engine exhaust glow disc
        const coreExhaustGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24);
        coreExhaustGeo.rotateX(Math.PI / 2);
        exhaustMesh = new THREE.Mesh(coreExhaustGeo, neonMaterial);
        exhaustMesh.position.set(0, 0, -2.85);
        currentPlaneGroup.add(exhaustMesh);

    } else if (planeId === "airliner") {
        // --- 3. APEX SKYLINER 900 (Widebody Double Decker) ---
        // Big cylindrical double-decker fuselage
        const bodyGeo = new THREE.CylinderGeometry(0.75, 0.75, 6.5, 20);
        bodyGeo.rotateX(Math.PI / 2);
        const fuselage = new THREE.Mesh(bodyGeo, bodyMaterial);
        currentPlaneGroup.add(fuselage);

        // Dome nose and sloped tail cone
        const noseDomeGeo = new THREE.SphereGeometry(0.75, 20, 12);
        noseDomeGeo.scale(1, 0.9, 1.2);
        noseDomeGeo.translate(0, 0.05, 3.25);
        const noseDome = new THREE.Mesh(noseDomeGeo, bodyMaterial);
        currentPlaneGroup.add(noseDome);

        const tailConeGeo = new THREE.ConeGeometry(0.75, 2.2, 20);
        tailConeGeo.rotateX(-Math.PI / 2);
        tailConeGeo.translate(0, 0.1, -4.3);
        const tailCone = new THREE.Mesh(tailConeGeo, bodyMaterial);
        currentPlaneGroup.add(tailCone);

        // Main Windshield
        const cockpitWindow = new THREE.BoxGeometry(0.9, 0.35, 0.6);
        cockpitWindow.translate(0, 0.45, 3.3);
        const win = new THREE.Mesh(cockpitWindow, glassMaterial);
        currentPlaneGroup.add(win);

        // Long swept wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(4.8, -2.2); // Long span
        wingShape.lineTo(4.6, -2.6);
        wingShape.lineTo(0.6, -1.8);
        wingShape.lineTo(0, -1.8);
        
        const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.rotateX(Math.PI / 2);
        wingGeo.translate(0, -0.2, 0.5);
        
        const leftWing = new THREE.Mesh(wingGeo, bodyMaterial);
        currentPlaneGroup.add(leftWing);

        const rightWing = leftWing.clone();
        rightWing.scale.x = -1;
        currentPlaneGroup.add(rightWing);

        // Conventional tail stabilizers
        const tailFinShape = new THREE.Shape();
        tailFinShape.moveTo(0, 0);
        tailFinShape.lineTo(0, 2.2);
        tailFinShape.lineTo(-1.2, 0.5);
        tailFinShape.lineTo(-1.2, 0);
        const tailFinGeo = new THREE.ExtrudeGeometry(tailFinShape, extrudeSettings);
        tailFinGeo.rotateY(Math.PI / 2);
        tailFinGeo.translate(0, 0.6, -4.5);
        const mainTail = new THREE.Mesh(tailFinGeo, bodyMaterial);
        currentPlaneGroup.add(mainTail);

        const hStabilizerShape = new THREE.Shape();
        hStabilizerShape.moveTo(0, 0);
        hStabilizerShape.lineTo(1.8, -0.8);
        hStabilizerShape.lineTo(1.6, -1.2);
        hStabilizerShape.lineTo(0.3, -0.8);
        hStabilizerShape.lineTo(0, -0.8);
        const hStabilizerGeo = new THREE.ExtrudeGeometry(hStabilizerShape, extrudeSettings);
        hStabilizerGeo.rotateX(Math.PI / 2);
        hStabilizerGeo.translate(0, 0.1, -4.6);
        
        const leftHoriz = new THREE.Mesh(hStabilizerGeo, darkTrimMaterial);
        currentPlaneGroup.add(leftHoriz);

        const rightHoriz = leftHoriz.clone();
        rightHoriz.scale.x = -1;
        currentPlaneGroup.add(rightHoriz);

        // Jet Turbofan Engines under wings
        const turboGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.4, 16);
        turboGeo.rotateX(Math.PI / 2);
        
        const leftTurbine = new THREE.Mesh(turboGeo, darkTrimMaterial);
        leftTurbine.position.set(-1.8, -0.7, 0.6);
        currentPlaneGroup.add(leftTurbine);

        const rightTurbine = leftTurbine.clone();
        rightTurbine.position.x = 1.8;
        currentPlaneGroup.add(rightTurbine);

        // Engine glow disc inside exhaust
        const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16);
        discGeo.rotateX(Math.PI / 2);
        
        const leftDisc = new THREE.Mesh(discGeo, neonMaterial);
        leftDisc.position.set(-1.8, -0.7, -0.15);
        const rightDisc = leftDisc.clone();
        rightDisc.position.x = 1.8;
        currentPlaneGroup.add(leftDisc);
        currentPlaneGroup.add(rightDisc);
    }

    // Add plane to main rotation anchor
    airplaneMeshContainer.add(currentPlaneGroup);
    
    // --- Trigger Slide-In fly entry animation using GSAP ---
    animatePlaneIn();
}

function animatePlaneIn() {
    // Reset rotations and position to do flight path slide in
    planeRotation.x = 0.1;
    planeRotation.y = -Math.PI / 2 - 0.4; // Pointing forward-right relative to slide
    targetPlaneRotation.x = 0.2;
    targetPlaneRotation.y = 0.5; // Final viewing angle
    
    // Position plane way left and deep
    airplaneMeshContainer.position.set(-9, -0.5, -4);
    
    // GSAP tween the position coordinate to center (0,0,0) for slide in motion
    gsap.to(airplaneMeshContainer.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power3.out"
    });
}

function animateThrusterGlow() {
    if (exhaustMesh) {
        // Pulse brightness of the engine glow
        const glowVal = 0.8 + Math.sin(Date.now() * 0.015) * 0.2;
        exhaustMesh.material.opacity = glowVal;
    }
}

// ==========================================
// 4. Dom Selector Navigation Tabs binding
// ==========================================
function setupPlaneSelector() {
    const tabsContainer = document.getElementById("planeTabs");
    tabsContainer.innerHTML = "";

    FLEET_DATA.forEach((plane, idx) => {
        const tab = document.createElement("div");
        tab.className = `plane-tab ${idx === 0 ? 'active' : ''}`;
        tab.setAttribute("data-plane-id", plane.id);
        tab.innerText = plane.id === "supersonic" ? "Mach-X" : (plane.id === "cruiser" ? "Quantum" : "SkyLiner");
        
        tab.addEventListener("click", () => {
            document.querySelectorAll(".plane-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            // Switch airplane structure
            currentSelectedPlane = plane;
            loadPlane3D(plane.id);
            
            // Update Text content in Dom
            updatePlaneUI();

            // Notify app.js of change for calculations
            if (typeof updateBookingSummary === 'function') {
                updateBookingSummary();
            }
        });
        
        tabsContainer.appendChild(tab);
    });

    // Seed initial UI
    updatePlaneUI();
}

function updatePlaneUI() {
    document.getElementById("planeName").innerText = currentSelectedPlane.name;
    document.getElementById("planeTagline").innerText = currentSelectedPlane.tagline;
    document.getElementById("planeDesc").innerText = currentSelectedPlane.desc;
    document.getElementById("planeSpeed").innerText = currentSelectedPlane.speed;
    document.getElementById("planeRange").innerText = currentSelectedPlane.range;
    document.getElementById("planeCapacity").innerText = currentSelectedPlane.capacity;
    document.getElementById("planeClass").innerText = currentSelectedPlane.classLevel;
}
