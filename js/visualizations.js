// Visualizations for Mathematical Art Gallery
// This file contains the implementations of all mathematical pattern visualizations

// Import Three.js from CDN (already included in HTML)
// const THREE = window.THREE;

// Store active visualizations
const activeVisualizations = {};

// Initialize Three.js visualization
function initVisualization(containerId, patternId) {
    // Clean up any existing visualization
    if (activeVisualizations[containerId]) {
        const oldViz = activeVisualizations[containerId];
        if (oldViz.renderer && oldViz.renderer.domElement) {
            oldViz.renderer.domElement.remove();
        }
        if (oldViz.animationId) {
            cancelAnimationFrame(oldViz.animationId);
        }
        delete activeVisualizations[containerId];
    }
    
    // Get container dimensions
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c14);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add orbit controls for modal view
    let controls = null;
    if (containerId === 'visualization-container') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
    }
    
    // Find pattern data
    const patternData = patterns.find(p => p.id === patternId);
    if (!patternData) return null;
    
    // Create visualization based on pattern ID
    let visualization = createVisualization(scene, patternId, patternData.color);
    
    // Animation loop
    function animate() {
        const animationId = requestAnimationFrame(animate);
        
        if (visualization && visualization.update) {
            visualization.update();
        }
        
        if (controls) {
            controls.update();
        }
        
        renderer.render(scene, camera);
        
        // Store animation ID for cleanup
        if (activeVisualizations[containerId]) {
            activeVisualizations[containerId].animationId = animationId;
        }
    }
    
    // Handle window resize
    function onWindowResize() {
        if (!container) return;
        
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    // Store visualization data for cleanup
    activeVisualizations[containerId] = {
        scene,
        camera,
        renderer,
        controls,
        visualization,
        animationId: null,
        cleanup: () => {
            window.removeEventListener('resize', onWindowResize);
            if (controls) controls.dispose();
            if (renderer) renderer.dispose();
        }
    };
    
    // Start animation loop
    animate();
    
    return visualization;
}

// Create visualization based on pattern ID
function createVisualization(scene, patternId, color) {
    let visualization = null;
    
    // Convert hex color to THREE.Color
    const threeColor = new THREE.Color(color || 0x00ffff);
    
    switch(patternId) {
        case 'clifford':
            visualization = createCliffordAttractor(scene, threeColor);
            break;
        case 'hypercube':
            visualization = createHypercube(scene, threeColor);
            break;
        case 'fibonacci':
            visualization = createFibonacciSpiral(scene, threeColor);
            break;
        case 'mandelbrot':
            visualization = createMandelbrotSet(scene, threeColor);
            break;
        case 'lorenz':
            visualization = createLorenzAttractor(scene, threeColor);
            break;
        case 'voronoi':
            visualization = createVoronoiDiagram(scene, threeColor);
            break;
        case 'penrose':
            visualization = createPenroseTiling(scene, threeColor);
            break;
        case 'platonic':
            visualization = createPlatonicSolids(scene, threeColor);
            break;
        case 'wave':
            visualization = createWaveInterference(scene, threeColor);
            break;
        case 'turing':
            visualization = createReactionDiffusion(scene, threeColor);
            break;
        case 'lissajous':
            visualization = createLissajousCurve(scene, threeColor);
            break;
        case 'hyperbolic':
            visualization = createHyperbolicGeometry(scene, threeColor);
            break;
        default:
            console.error('Unknown pattern ID:', patternId);
            visualization = createDefaultVisualization(scene, threeColor);
    }
    
    return visualization;
}

// Update visualization parameters
function updateVisualization(patternId, param1, param2) {
    // Find all active visualizations for this pattern
    Object.keys(activeVisualizations).forEach(containerId => {
        const viz = activeVisualizations[containerId];
        if (viz && viz.visualization && viz.visualization.params) {
            viz.visualization.params.param1 = param1;
            viz.visualization.params.param2 = param2;
        }
    });
}

// --- Step 1: Add to visualization.js ---

function createHypercube(scene, color) {
    const group = new THREE.Group();
    scene.add(group);

    // Define materials
    const defaultMaterial = new THREE.LineBasicMaterial({ color: color });
    const highlightMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });

    // Define the 16 vertices of a 4D hypercube (tesseract)
    const vertices4D = [];
    for (let i = 0; i < 16; i++) {
        const x = (i & 1) ? 1 : -1;
        const y = (i & 2) ? 1 : -1;
        const z = (i & 4) ? 1 : -1;
        const w = (i & 8) ? 1 : -1;
        vertices4D.push({ x, y, z, w });
    }

    // Perspective projection from 4D to 3D
    function project4Dto3D(v, angle) {
        const wAngle = Math.sin(angle) * 0.5;
        const w = v.w * Math.cos(wAngle) - v.x * Math.sin(wAngle);
        const x = v.x * Math.cos(wAngle) + v.w * Math.sin(wAngle);
        return new THREE.Vector3(
            x / (2 - w),
            v.y / (2 - w),
            v.z / (2 - w)
        );
    }

    // Create edges (pairs of connected vertices)
    const edges = [];
    for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
            const diff = i ^ j;
            if (diff && !(diff & (diff - 1))) {
                edges.push([i, j]);
            }
        }
    }

    // Choose a face (subset of edges) to highlight for clarity
    const faceEdgesSet = new Set([
        '0-1','1-3','2-3','0-2' // one face of a cube in lower w-dimension
    ]);

    const lines = [];
    edges.forEach(([a, b]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3()
        ]);
        const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
        const isHighlight = faceEdgesSet.has(key);
        const line = new THREE.Line(geometry, isHighlight ? highlightMaterial : defaultMaterial);
        group.add(line);
        lines.push({ line, a, b });
    });

    const params = {
        param1: 0.5, // rotation XW
        param2: 0.5  // rotation ZW
    };

    function update() {
        const t = performance.now() * 0.001;
        const angleXW = params.param1 * Math.PI * 2 + t * 0.2;
        const angleZW = params.param2 * Math.PI * 2 + t * 0.3;

        const projected = vertices4D.map(v => {
            let x = v.x * Math.cos(angleXW) - v.w * Math.sin(angleXW);
            let w = v.x * Math.sin(angleXW) + v.w * Math.cos(angleXW);

            let z = v.z * Math.cos(angleZW) - w * Math.sin(angleZW);
            w = v.z * Math.sin(angleZW) + w * Math.cos(angleZW);

            return project4Dto3D({ x, y: v.y, z, w }, t);
        });

        lines.forEach(({ line, a, b }) => {
            const positions = line.geometry.attributes.position.array;
            positions[0] = projected[a].x;
            positions[1] = projected[a].y;
            positions[2] = projected[a].z;
            positions[3] = projected[b].x;
            positions[4] = projected[b].y;
            positions[5] = projected[b].z;
            line.geometry.attributes.position.needsUpdate = true;
        });
    }

    return {
        params,
        update
    };
}

// --- Clifford Attractor Visualization ---

function createCliffordAttractor(scene, color) {
    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.BufferGeometry();
    const numPoints = 100000;
    const positions = new Float32Array(numPoints * 3);

    const material = new THREE.PointsMaterial({
        size: 0.01,
        color: color,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);

    let x = 0.1, y = 0; // initial condition

    const params = {
        param1: 0.5, // a, b
        param2: 0.5  // c, d
    };

    let frame = 0;

    function update() {
        frame++;
        const a = params.param1 * 6 - 3; // [-3, 3]
        const b = params.param2 * 6 - 3; // [-3, 3]
        const c = Math.sin(a + frame * 0.002) * 2;
        const d = Math.cos(b + frame * 0.002) * 2;

        x = 0.1;
        y = 0;

        for (let i = 0; i < numPoints; i++) {
            const x1 = Math.sin(a * y) + c * Math.cos(a * x);
            const y1 = Math.sin(b * x) + d * Math.cos(b * y);
            x = x1;
            y = y1;

            positions[i * 3] = x * 0.4;
            positions[i * 3 + 1] = y * 0.4;
            positions[i * 3 + 2] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;
    }

    return {
        params,
        update
    };
}

// In createVisualization(scene, patternId, color):
// case 'clifford':
//     visualization = createCliffordAttractor(scene, threeColor);
//     break;



// Fibonacci Spiral Visualization
function createFibonacciSpiral(scene, color) {
    const group = new THREE.Group();
    scene.add(group);

    const spiralMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
    });

    const rectMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(color).offsetHSL(0.1, 0, 0),
        transparent: true,
        opacity: 0.5
    });

    const goldenRatio = 1.61803398875;

    // Create spiral
    const points = [];
    let theta = 0;

    for (let i = 0; i < 1000; i++) {
        const radius = Math.pow(goldenRatio, theta / (Math.PI / 2)) * 0.1;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        points.push(new THREE.Vector3(x, y, 0));
        theta += 0.01;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const spiral = new THREE.Line(geometry, spiralMaterial);
    group.add(spiral);

    // Add squares for Fibonacci rectangles
    const squares = [];
    let size = 0.1;
    let x = 0, y = 0;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down

    for (let i = 0; i < 10; i++) {
        const squareGeometry = new THREE.BufferGeometry();
        const squarePoints = [];

        switch(direction) {
            case 0: // right
                squarePoints.push(
                    new THREE.Vector3(x, y, 0),
                    new THREE.Vector3(x + size, y, 0),
                    new THREE.Vector3(x + size, y + size, 0),
                    new THREE.Vector3(x, y + size, 0),
                    new THREE.Vector3(x, y, 0)
                );
                x += size;
                break;
            case 1: // up
                squarePoints.push(
                    new THREE.Vector3(x, y, 0),
                    new THREE.Vector3(x, y + size, 0),
                    new THREE.Vector3(x - size, y + size, 0),
                    new THREE.Vector3(x - size, y, 0),
                    new THREE.Vector3(x, y, 0)
                );
                y += size;
                break;
            case 2: // left
                squarePoints.push(
                    new THREE.Vector3(x, y, 0),
                    new THREE.Vector3(x - size, y, 0),
                    new THREE.Vector3(x - size, y - size, 0),
                    new THREE.Vector3(x, y - size, 0),
                    new THREE.Vector3(x, y, 0)
                );
                x -= size;
                break;
            case 3: // down
                squarePoints.push(
                    new THREE.Vector3(x, y, 0),
                    new THREE.Vector3(x, y - size, 0),
                    new THREE.Vector3(x + size, y - size, 0),
                    new THREE.Vector3(x + size, y, 0),
                    new THREE.Vector3(x, y, 0)
                );
                y -= size;
                break;
        }

        squareGeometry.setFromPoints(squarePoints);
        const square = new THREE.Line(squareGeometry, rectMaterial);
        group.add(square);
        squares.push(square);

        direction = (direction + 1) % 4;

        if (i >= 1) {
            const temp = size;
            size = size * goldenRatio;
        }
    }

    // Add particles along the spiral
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const index = Math.floor(i / particleCount * points.length);
        const point = points[index];

        particlePositions[i * 3] = point.x;
        particlePositions[i * 3 + 1] = point.y;
        particlePositions[i * 3 + 2] = point.z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    const params = {
        param1: 0.5, // Spiral density
        param2: 0.5  // Rotation speed
    };

    function update() {
        const density = 0.5 + params.param1 * 2;
        group.scale.set(density, density, density);

        const rotationSpeed = params.param2 * 0.02;
        group.rotation.z += rotationSpeed;

        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i++) {
            const t = (Date.now() * 0.001 * (1 + params.param2)) % 1;
            const index = Math.floor((i / particleCount + t) % 1 * points.length);
            const point = points[index];

            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    return {
        params,
        update
    };
}

// Mandelbrot Set Visualization
function createMandelbrotSet(scene, color) {
    const geometry = new THREE.PlaneGeometry(4, 4);

    const hslColor = {};
    new THREE.Color(color).getHSL(hslColor);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            zoom: { value: 1.0 },
            colorShift: { value: 0.0 },
            baseHue: { value: hslColor.h }
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float time;
            uniform float zoom;
            uniform float colorShift;
            uniform float baseHue;

            vec2 map(vec2 value, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
                return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
            }

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                float zoom_factor = zoom * 2.0;
                vec2 c = map(vUv, vec2(0.0), vec2(1.0), vec2(-2.0, -1.5), vec2(1.0, 1.5));
                c = c / zoom_factor - vec2(0.5/zoom_factor, 0.0);

                vec2 z = vec2(0.0);
                float iter = 0.0;
                const float max_iter = 100.0;

                for(float i = 0.0; i < max_iter; i++) {
                    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;

                    if(length(z) > 2.0) {
                        iter = i;
                        break;
                    }
                }

                if(iter == max_iter) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    float smoothColor = iter - log2(log2(dot(z, z))) + 4.0;
                    smoothColor = sqrt(smoothColor / max_iter);

                    float hue = mod(baseHue + smoothColor * 0.5 + colorShift + time * 0.05, 1.0);
                    vec3 color = hsv2rgb(vec3(hue, 0.8, smoothColor));

                    gl_FragColor = vec4(color, 1.0);
                }
            }
        `
    });

    const mandelbrot = new THREE.Mesh(geometry, material);
    scene.add(mandelbrot);

    const params = {
        param1: 0.5, // Zoom
        param2: 0.5  // Color shift
    };

    function update() {
        material.uniforms.time.value += 0.01;
        material.uniforms.zoom.value = 0.5 + params.param1 * 3.0;
        material.uniforms.colorShift.value = params.param2;
    }

    return {
        params,
        update
    };
}



// Lorenz Attractor (Butterfly Effect) Visualization
function createLorenzAttractor(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Lorenz parameters
    const sigma = 10;
    const rho = 28;
    const beta = 8/3;
    const dt = 0.005;
    
    // Create line for the attractor
    const points = [];
    let x = 0.1, y = 0, z = 0;
    
    // Generate initial points
    for (let i = 0; i < 5000; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        
        x += dx;
        y += dy;
        z += dz;
        
        points.push(new THREE.Vector3(x * 0.1, y * 0.1, z * 0.1));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create gradient material
    const colors = [];
    for (let i = 0; i < points.length; i++) {
        const color = new THREE.Color();
        color.setHSL(i / points.length, 1, 0.5);
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({ 
        vertexColors: true,
        linewidth: 1
    });
    
    const line = new THREE.Line(geometry, material);
    group.add(line);
    
    // Add particles along the attractor
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const index = Math.floor(i / particleCount * points.length);
        const point = points[index];
        
        particlePositions[i * 3] = point.x;
        particlePositions[i * 3 + 1] = point.y;
        particlePositions[i * 3 + 2] = point.z;
        
        particleSizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // System sensitivity
        param2: 0.5  // Animation speed
    };
    
    // Current position in the attractor
    let currentIndex = 0;
    
    // Update function
    function update() {
        const sensitivity = 0.5 + params.param1 * 2;
        const speed = 0.5 + params.param2 * 5;
        
        group.scale.set(sensitivity, sensitivity, sensitivity);
        group.rotation.y += 0.005;
        
        // Update particle positions
        const positions = particles.geometry.attributes.position.array;
        
        currentIndex = (currentIndex + Math.floor(speed)) % (points.length - particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const index = (currentIndex + i * 5) % points.length;
            const point = points[index];
            
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    return {
        params,
        update
    };
}

// Voronoi Diagram Visualization
function createVoronoiDiagram(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create points
    const numPoints = 20;
    const points = [];
    const pointMeshes = [];
    
    for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() - 0.5) * 4;
        const y = (Math.random() - 0.5) * 4;
        const z = (Math.random() - 0.5) * 0.5;
        
        points.push(new THREE.Vector3(x, y, z));
        
        // Create point visualization
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(points[i]);
        group.add(mesh);
        pointMeshes.push(mesh);
    }
    
    // Create Voronoi cells (simplified representation)
    const cellSize = 0.2;
    const gridSize = 20;
    const halfGrid = gridSize / 2;
    
    const cellGeometry = new THREE.BoxGeometry(cellSize, cellSize, 0.01);
    const cells = [];
    
    for (let x = -halfGrid; x < halfGrid; x++) {
        for (let y = -halfGrid; y < halfGrid; y++) {
            const position = new THREE.Vector3(x * cellSize, y * cellSize, 0);
            
            // Find closest point
            let minDist = Infinity;
            let closestPoint = null;
            let closestIndex = 0;
            
            for (let i = 0; i < points.length; i++) {
                const dist = position.distanceTo(points[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = points[i];
                    closestIndex = i;
                }
            }
            
            // Create cell with color matching closest point
            const material = new THREE.MeshBasicMaterial({
                color: pointMeshes[closestIndex].material.color,
                transparent: true,
                opacity: 0.3
            });
            
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.position.copy(position);
            group.add(cell);
            cells.push({
                mesh: cell,
                closestPointIndex: closestIndex
            });
        }
    }
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Cell count (will regenerate points)
        param2: 0.5  // Animation speed
    };
    
    // Update function
    function update() {
        // Slowly rotate the entire diagram
        group.rotation.z += 0.001 * params.param2;
        
        // Animate points
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < pointMeshes.length; i++) {
            const mesh = pointMeshes[i];
            const point = points[i];
            
            // Add subtle movement to points
            point.x += Math.sin(time + i) * 0.002 * params.param2;
            point.y += Math.cos(time + i * 0.7) * 0.002 * params.param2;
            
            // Keep points within bounds
            if (Math.abs(point.x) > 2) point.x *= 0.99;
            if (Math.abs(point.y) > 2) point.y *= 0.99;
            
            mesh.position.copy(point);
        }
        
        // Update cells based on new point positions
        for (const cell of cells) {
            const position = cell.mesh.position;
            
            // Find closest point
            let minDist = Infinity;
            let closestIndex = 0;
            
            for (let i = 0; i < points.length; i++) {
                const dist = position.distanceTo(points[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestIndex = i;
                }
            }
            
            // Update cell color if closest point changed
            if (closestIndex !== cell.closestPointIndex) {
                cell.closestPointIndex = closestIndex;
                cell.mesh.material.color = pointMeshes[closestIndex].material.color;
            }
        }
    }
    
    return {
        params,
        update
    };
}

// Penrose Tiling Visualization
function createPenroseTiling(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create a simplified Penrose-like tiling
    const tiles = [];
    const numTiles = 50;
    const goldenRatio = 1.61803398875;
    
    // Create two types of rhombs
    const thinRhombGeometry = createRhombGeometry(1, 36);
    const fatRhombGeometry = createRhombGeometry(1, 72);
    
    const thinRhombMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        wireframe: true
    });
    
    const fatRhombMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).offsetHSL(0.1, 0, 0),
        transparent: true,
        opacity: 0.7,
        wireframe: true
    });
    
    // Create tiles in a circular pattern
    for (let i = 0; i < numTiles; i++) {
        const angle = i * Math.PI * 2 / numTiles;
        const radius = 2 * (0.5 + 0.5 * Math.sin(i * 5));
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Alternate between thin and fat rhombs
        const geometry = i % 2 === 0 ? thinRhombGeometry : fatRhombGeometry;
        const material = i % 2 === 0 ? thinRhombMaterial : fatRhombMaterial;
        
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(x, y, 0);
        tile.rotation.z = angle;
        
        group.add(tile);
        tiles.push(tile);
    }
    
    // Helper function to create rhomb geometry
    function createRhombGeometry(size, angle) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        const halfAngle = angle * Math.PI / 180 / 2;
        
        vertices.push(
            0, 0, 0,
            Math.cos(halfAngle) * size, Math.sin(halfAngle) * size, 0,
            Math.cos(-halfAngle) * size, Math.sin(-halfAngle) * size, 0,
            -Math.cos(halfAngle) * size, -Math.sin(halfAngle) * size, 0
        );
        
        const indices = [
            0, 1, 2,
            0, 2, 3
        ];
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        
        return geometry;
    }
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Tile size
        param2: 0.5  // Rotation speed
    };
    
    // Update function
    function update() {
        const scale = 0.5 + params.param1 * 1.5;
        const rotationSpeed = params.param2 * 0.01;
        
        group.scale.set(scale, scale, scale);
        group.rotation.z += rotationSpeed;
        
        // Animate tiles
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            
            // Pulse effect
            const pulse = Math.sin(time * 2 + i * 0.1) * 0.1 + 0.9;
            tile.scale.set(pulse, pulse, 1);
        }
    }
    
    return {
        params,
        update
    };
}

// Platonic Solids Visualization
function createPlatonicSolids(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create materials
    const materials = [
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        }),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).offsetHSL(0.1, 0, 0),
            transparent: true,
            opacity: 0.7,
            wireframe: true
        }),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).offsetHSL(0.2, 0, 0),
            transparent: true,
            opacity: 0.7,
            wireframe: true
        }),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).offsetHSL(0.3, 0, 0),
            transparent: true,
            opacity: 0.7,
            wireframe: true
        }),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).offsetHSL(0.4, 0, 0),
            transparent: true,
            opacity: 0.7,
            wireframe: true
        })
    ];
    
    // Create the five Platonic solids
    const tetrahedron = new THREE.Mesh(
        new THREE.TetrahedronGeometry(1),
        materials[0]
    );
    
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        materials[1]
    );
    
    const octahedron = new THREE.Mesh(
        new THREE.OctahedronGeometry(1),
        materials[2]
    );
    
    const dodecahedron = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1),
        materials[3]
    );
    
    const icosahedron = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1),
        materials[4]
    );
    
    // Position solids in a circle
    const solids = [tetrahedron, cube, octahedron, dodecahedron, icosahedron];
    const radius = 3;
    
    for (let i = 0; i < solids.length; i++) {
        const angle = i * Math.PI * 2 / solids.length;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        solids[i].position.set(x, y, 0);
        solids[i].scale.set(0.8, 0.8, 0.8);
        
        group.add(solids[i]);
    }
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Solid type (0-4)
        param2: 0.5  // Rotation speed
    };
    
    // Current active solid
    let activeSolidIndex = 2; // Start with octahedron
    
    // Update function
    function update() {
        const rotationSpeed = params.param2 * 0.02;
        
        // Determine which solid to show based on param1
        const newIndex = Math.floor(params.param1 * 5);
        
        if (newIndex !== activeSolidIndex) {
            // Hide previous solid
            solids[activeSolidIndex].position.z = -10;
            
            // Show new solid
            activeSolidIndex = newIndex;
            solids[activeSolidIndex].position.z = 0;
        }
        
        // Rotate all solids
        for (let i = 0; i < solids.length; i++) {
            solids[i].rotation.x += rotationSpeed;
            solids[i].rotation.y += rotationSpeed * 0.7;
        }
        
        // Rotate the entire group
        group.rotation.y += rotationSpeed * 0.2;
    }
    
    return {
        params,
        update
    };
}

// Wave Interference Visualization
function createWaveInterference(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create a grid of points
    const gridSize = 40;
    const spacing = 0.1;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Create vertices
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const xPos = (x - gridSize / 2) * spacing;
            const yPos = (y - gridSize / 2) * spacing;
            
            vertices.push(xPos, yPos, 0);
        }
    }
    
    // Create indices for lines
    for (let x = 0; x < gridSize - 1; x++) {
        for (let y = 0; y < gridSize; y++) {
            const index = x + y * gridSize;
            const nextIndex = (x + 1) + y * gridSize;
            
            indices.push(index, nextIndex);
        }
    }
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize - 1; y++) {
            const index = x + y * gridSize;
            const nextIndex = x + (y + 1) * gridSize;
            
            indices.push(index, nextIndex);
        }
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5
    });
    
    const grid = new THREE.LineSegments(geometry, material);
    group.add(grid);
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Wave frequency
        param2: 0.5  // Amplitude
    };
    
    // Wave sources
    const sources = [
        { x: -1, y: -1, frequency: 2, phase: 0 },
        { x: 1, y: 1, frequency: 2, phase: Math.PI }
    ];
    
    // Update function
    function update() {
        const time = Date.now() * 0.001;
        const positions = grid.geometry.attributes.position.array;
        
        // Update wave frequency and amplitude
        const frequency = 1 + params.param1 * 5;
        const amplitude = 0.1 + params.param2 * 0.4;
        
        sources[0].frequency = frequency;
        sources[1].frequency = frequency * 1.5;
        
        // Update grid points
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            
            let z = 0;
            
            // Calculate wave height from all sources
            for (const source of sources) {
                const dx = x - source.x;
                const dy = y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                z += Math.sin(distance * source.frequency - time * 5) * amplitude / (1 + distance);
            }
            
            positions[i + 2] = z;
        }
        
        grid.geometry.attributes.position.needsUpdate = true;
        
        // Rotate the entire group
        group.rotation.z += 0.002;
    }
    
    return {
        params,
        update
    };
}

// Reaction-Diffusion Visualization
function createReactionDiffusion(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create a plane for the reaction-diffusion texture
    const geometry = new THREE.PlaneGeometry(4, 4, 100, 100);
    
    // Convert color to HSL for shader
    const hslColor = {};
    new THREE.Color(color).getHSL(hslColor);
    
    // Create shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            reactionRate: { value: 0.5 },
            diffusionRate: { value: 0.5 },
            baseHue: { value: hslColor.h }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vElevation;
            
            void main() {
                vUv = uv;
                
                // Create a simple pattern for elevation
                float elevation = sin(position.x * 10.0) * sin(position.y * 10.0) * 0.1;
                vElevation = elevation;
                
                // Apply elevation to vertex
                vec3 newPosition = position;
                newPosition.z += elevation;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying float vElevation;
            uniform float time;
            uniform float reactionRate;
            uniform float diffusionRate;
            uniform float baseHue;
            
            // Simplex noise function
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                // Create reaction-diffusion like pattern
                float scale = 5.0 + diffusionRate * 10.0;
                float speed = 0.2 + reactionRate * 0.8;
                
                float n1 = snoise(vUv * scale + vec2(time * speed, 0.0));
                float n2 = snoise(vUv * scale * 2.0 - vec2(0.0, time * speed));
                
                float pattern = smoothstep(0.0, 1.0, n1 * n2 * 0.5 + 0.5);
                
                // Create color gradient
                float hue = baseHue + pattern * 0.2;
                float saturation = 0.8;
                float lightness = pattern * 0.6 + 0.2;
                
                // Convert HSL to RGB
                vec3 rgb;
                
                if (saturation == 0.0) {
                    rgb = vec3(lightness);
                } else {
                    float q = lightness < 0.5 ? lightness * (1.0 + saturation) : lightness + saturation - lightness * saturation;
                    float p = 2.0 * lightness - q;
                    
                    float r = hue + 1.0/3.0;
                    float g = hue;
                    float b = hue - 1.0/3.0;
                    
                    r = r < 0.0 ? r + 1.0 : (r > 1.0 ? r - 1.0 : r);
                    g = g < 0.0 ? g + 1.0 : (g > 1.0 ? g - 1.0 : g);
                    b = b < 0.0 ? b + 1.0 : (b > 1.0 ? b - 1.0 : b);
                    
                    float tr = r < 1.0/6.0 ? p + (q - p) * 6.0 * r :
                              (r < 1.0/2.0 ? q :
                              (r < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - r) * 6.0 : p));
                    
                    float tg = g < 1.0/6.0 ? p + (q - p) * 6.0 * g :
                              (g < 1.0/2.0 ? q :
                              (g < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - g) * 6.0 : p));
                    
                    float tb = b < 1.0/6.0 ? p + (q - p) * 6.0 * b :
                              (b < 1.0/2.0 ? q :
                              (b < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - b) * 6.0 : p));
                    
                    rgb = vec3(tr, tg, tb);
                }
                
                gl_FragColor = vec4(rgb, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Reaction rate
        param2: 0.5  // Diffusion rate
    };
    
    // Update function
    function update() {
        material.uniforms.time.value += 0.01;
        material.uniforms.reactionRate.value = params.param1;
        material.uniforms.diffusionRate.value = params.param2;
        
        // Rotate the pattern
        group.rotation.z += 0.001;
    }
    
    return {
        params,
        update
    };
}

// Lissajous Curve Visualization
function createLissajousCurve(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create materials
    const curveMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });
    
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    // Create curve
    const curvePoints = [];
    const numPoints = 1000;
    
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const x = Math.sin(3 * t);
        const y = Math.sin(2 * t);
        const z = 0;
        
        curvePoints.push(new THREE.Vector3(x, y, z));
    }
    
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curve = new THREE.Line(curveGeometry, curveMaterial);
    group.add(curve);
    
    // Create particles along the curve
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const index = Math.floor(i / particleCount * curvePoints.length);
        const point = curvePoints[index];
        
        particlePositions[i * 3] = point.x;
        particlePositions[i * 3 + 1] = point.y;
        particlePositions[i * 3 + 2] = point.z;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Frequency ratio
        param2: 0.5  // Phase shift
    };
    
    // Update function
    function update() {
        const time = Date.now() * 0.001;
        
        // Calculate frequency ratio and phase shift
        const a = 1 + Math.floor(params.param1 * 5);
        const b = 1 + Math.floor(params.param1 * 7);
        const phaseShift = params.param2 * Math.PI;
        
        // Update curve points
        const positions = curve.geometry.attributes.position.array;
        
        for (let i = 0; i < numPoints; i++) {
            const t = (i / numPoints) * Math.PI * 2;
            
            positions[i * 3] = Math.sin(a * t + phaseShift);
            positions[i * 3 + 1] = Math.sin(b * t);
        }
        
        curve.geometry.attributes.position.needsUpdate = true;
        
        // Update particles
        const particlePositions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const t = ((i / particleCount) + time * 0.1) % 1 * Math.PI * 2;
            
            particlePositions[i * 3] = Math.sin(a * t + phaseShift);
            particlePositions[i * 3 + 1] = Math.sin(b * t);
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate the entire group
        group.rotation.z += 0.002;
    }
    
    return {
        params,
        update
    };
}

// Hyperbolic Geometry Visualization
function createHyperbolicGeometry(scene, color) {
    const group = new THREE.Group();
    scene.add(group);
    
    // Create a Poincaré disk model of hyperbolic geometry
    const diskRadius = 2;
    const numLayers = 5;
    const pointsPerLayer = 8;
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5
    });
    
    // Create concentric circles
    for (let layer = 1; layer <= numLayers; layer++) {
        const radius = layer / numLayers * diskRadius * 0.9;
        const circleGeometry = new THREE.BufferGeometry();
        const circlePoints = [];
        
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            circlePoints.push(new THREE.Vector3(x, y, 0));
        }
        
        circleGeometry.setFromPoints(circlePoints);
        const circle = new THREE.Line(circleGeometry, lineMaterial);
        group.add(circle);
    }
    
    // Create radial lines
    for (let i = 0; i < pointsPerLayer; i++) {
        const angle = (i / pointsPerLayer) * Math.PI * 2;
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = [];
        
        linePoints.push(new THREE.Vector3(0, 0, 0));
        linePoints.push(new THREE.Vector3(
            Math.cos(angle) * diskRadius * 0.9,
            Math.sin(angle) * diskRadius * 0.9,
            0
        ));
        
        lineGeometry.setFromPoints(linePoints);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }
    
    // Create hyperbolic tessellation
    const tessellationMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).offsetHSL(0.1, 0, 0),
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    
    const tessellation = createHyperbolicTessellation(diskRadius, 3, tessellationMaterial);
    group.add(tessellation);
    
    // Helper function to create hyperbolic tessellation
    function createHyperbolicTessellation(radius, depth, material) {
        const group = new THREE.Group();
        
        // Create a basic polygon
        const sides = 7;
        const polygonGeometry = new THREE.BufferGeometry();
        const polygonPoints = [];
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const r = radius * 0.3; // Smaller than disk radius
            
            polygonPoints.push(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                0
            );
        }
        
        const indices = [];
        for (let i = 1; i < sides - 1; i++) {
            indices.push(0, i, i + 1);
        }
        
        polygonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(polygonPoints, 3));
        polygonGeometry.setIndex(indices);
        
        const centralPolygon = new THREE.Mesh(polygonGeometry, material);
        group.add(centralPolygon);
        
        // Create surrounding polygons
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const nextAngle = ((i + 1) / sides) * Math.PI * 2;
            
            const midAngle = (angle + nextAngle) / 2;
            const distance = radius * 0.6;
            
            const x = Math.cos(midAngle) * distance;
            const y = Math.sin(midAngle) * distance;
            
            const polygon = new THREE.Mesh(polygonGeometry.clone(), material);
            polygon.position.set(x, y, 0);
            polygon.rotation.z = midAngle + Math.PI;
            polygon.scale.set(0.7, 0.7, 1);
            
            group.add(polygon);
            
            if (depth > 1) {
                // Add more layers recursively
                for (let j = 0; j < sides; j++) {
                    const subAngle = ((j + 0.5) / sides) * Math.PI * 2;
                    const subDistance = radius * 0.2;
                    
                    const subX = x + Math.cos(subAngle + midAngle + Math.PI) * subDistance;
                    const subY = y + Math.sin(subAngle + midAngle + Math.PI) * subDistance;
                    
                    const subPolygon = new THREE.Mesh(polygonGeometry.clone(), material);
                    subPolygon.position.set(subX, subY, 0);
                    subPolygon.rotation.z = subAngle + midAngle + Math.PI * 2;
                    subPolygon.scale.set(0.4, 0.4, 1);
                    
                    group.add(subPolygon);
                }
            }
        }
        
        return group;
    }
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Curvature
        param2: 0.5  // Tessellation density
    };
    
    // Update function
    function update() {
        const curvature = 0.5 + params.param1 * 2;
        const density = 0.5 + params.param2 * 2;
        
        // Scale the entire visualization
        group.scale.set(curvature, curvature, 1);
        
        // Rotate the visualization
        group.rotation.z += 0.002;
        
        // Pulse effect for tessellation
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time) * 0.1 + 0.9;
        
        tessellation.scale.set(pulse * density, pulse * density, 1);
    }
    
    return {
        params,
        update
    };
}

// Default visualization (fallback)
function createDefaultVisualization(scene, color) {
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true
    });
    
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Parameters for interactive controls
    const params = {
        param1: 0.5, // Scale
        param2: 0.5  // Rotation speed
    };
    
    // Update function
    function update() {
        const scale = 0.5 + params.param1 * 2;
        const rotationSpeed = params.param2 * 0.05;
        
        torusKnot.scale.set(scale, scale, scale);
        torusKnot.rotation.x += rotationSpeed;
        torusKnot.rotation.y += rotationSpeed * 0.7;
    }
    
    return {
        params,
        update
    };
}
