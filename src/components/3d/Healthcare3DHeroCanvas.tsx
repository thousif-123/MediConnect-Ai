import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Healthcare3DHeroCanvasProps {
  activeStage?: number;
  onNodeSelect?: (nodeIndex: number) => void;
}

export const Healthcare3DHeroCanvas: React.FC<Healthcare3DHeroCanvasProps> = ({
  activeStage = 0,
  onNodeSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const isMobile = window.innerWidth < 768;
    camera.position.set(0, 0, isMobile ? 18 : 14);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clear previous children if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const mainPointLight = new THREE.PointLight(0x10b981, 15, 50);
    mainPointLight.position.set(0, 0, 5);
    scene.add(mainPointLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 12, 40);
    cyanPointLight.position.set(-6, 4, 3);
    scene.add(cyanPointLight);

    const bluePointLight = new THREE.PointLight(0x3b82f6, 10, 40);
    bluePointLight.position.set(6, -4, 2);
    scene.add(bluePointLight);

    // --- Central Glowing Medical Core ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner glowing sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.8, isMobile ? 2 : 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer lattice sphere
    const latticeGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    coreGroup.add(latticeMesh);

    // --- Orbiting Healthcare Nodes ---
    const nodeNames = [
      'AI Health Assistant',
      'Verified Pharmacist',
      'Nearby Pharmacy',
      'Medicine Stock',
      'Prescription Vault',
      'Doctor Consultation',
      'Hospital Slot',
    ];

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodeMeshes: THREE.Mesh[] = [];
    const radius = isMobile ? 4.8 : 6.0;
    const nodeCount = nodeNames.length;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.5);
      const z = Math.sin(angle * 2) * 1.5;

      let nodeGeo: THREE.BufferGeometry;
      let nodeColor = 0x10b981;

      if (i === 0) {
        // AI: Octahedron
        nodeGeo = new THREE.OctahedronGeometry(0.55);
        nodeColor = 0x10b981;
      } else if (i === 1) {
        // Pharmacist: Torus
        nodeGeo = new THREE.TorusGeometry(0.4, 0.15, 12, 24);
        nodeColor = 0x06b6d4;
      } else if (i === 2) {
        // Pharmacy: Box cross
        nodeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        nodeColor = 0x14b8a6;
      } else if (i === 3) {
        // Medicine Capsule: Capsule / Cylinder
        nodeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);
        nodeColor = 0x3b82f6;
      } else if (i === 4) {
        // Prescription: Flat plate
        nodeGeo = new THREE.BoxGeometry(0.7, 0.9, 0.1);
        nodeColor = 0x6366f1;
      } else if (i === 5) {
        // Doctor: Dodecahedron
        nodeGeo = new THREE.DodecahedronGeometry(0.5);
        nodeColor = 0xa855f7;
      } else {
        // Hospital: Cylinder
        nodeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.7, 6);
        nodeColor = 0xec4899;
      }

      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      });

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { id: i, name: nodeNames[i], baseAngle: angle };
      nodesGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    }

    // --- Dynamic Connecting Lines ---
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodeCount * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    // --- Ambient Floating Particle Dust ---
    const particleCount = isMobile ? 180 : 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 25;
      particlePositions[p + 1] = (Math.random() - 0.5) * 25;
      particlePositions[p + 2] = (Math.random() - 0.5) * 25;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Mouse Parallax & Raycasting ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2(-999, -999);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseVec.x = (x / rect.width) * 2 - 1;
      mouseVec.y = -(y / rect.height) * 2 + 1;

      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      const mobileNow = window.innerWidth < 768;
      camera.position.z = mobileNow ? 18 : 14;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- Visibility & Intersection Observer Optimization ---
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Rotate Central Core
        coreMesh.rotation.y = elapsedTime * 0.4;
        coreMesh.rotation.x = elapsedTime * 0.2;
        latticeMesh.rotation.y = -elapsedTime * 0.3;
        latticeMesh.rotation.z = elapsedTime * 0.1;

        // Orbit Nodes & update LinePositions
        const posAttr = lineGeo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        nodeMeshes.forEach((mesh, idx) => {
          const baseAngle = mesh.userData.baseAngle;
          const currentAngle = baseAngle + elapsedTime * 0.25;
          const r = isMobile ? 4.8 : 6.0;

          mesh.position.x = Math.cos(currentAngle) * r;
          mesh.position.y = Math.sin(currentAngle) * (r * 0.45);
          mesh.position.z = Math.sin(currentAngle * 2) * 1.5;

          mesh.rotation.x = elapsedTime * 0.8;
          mesh.rotation.y = elapsedTime * 1.2;

          // Highlight Active Stage Node
          if (idx === activeStage % nodeCount) {
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + Math.sin(elapsedTime * 4) * 0.3;
            mesh.scale.setScalar(1.35);
          } else {
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
            mesh.scale.setScalar(1.0);
          }

          // Line connection from core (0,0,0) to node
          const lineIdx = idx * 6;
          posArray[lineIdx] = 0;
          posArray[lineIdx + 1] = 0;
          posArray[lineIdx + 2] = 0;
          posArray[lineIdx + 3] = mesh.position.x;
          posArray[lineIdx + 4] = mesh.position.y;
          posArray[lineIdx + 5] = mesh.position.z;
        });

        posAttr.needsUpdate = true;

        // Rotate Ambient Dust
        particleSystem.rotation.y = elapsedTime * 0.05;

        // Smooth Lerp Mouse Tilt
        targetRotX = mouseY * 0.3;
        targetRotY = mouseX * 0.4;
        nodesGroup.rotation.x += (targetRotX - nodesGroup.rotation.x) * 0.05;
        nodesGroup.rotation.y += (targetRotY - nodesGroup.rotation.y) * 0.05;
        coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.05;
        coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.05;
      }

      // Raycasting for Node Hover
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object as THREE.Mesh;
        setHoveredNodeName(hitNode.userData.name);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredNodeName(null);
        document.body.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      document.body.style.cursor = 'default';
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeStage]);

  // Fallback 2D Render if WebGL fails
  if (!webglSupported) {
    return (
      <div className="w-full h-full min-h-[380px] flex items-center justify-center relative">
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/30 to-cyan-400/20 blur-2xl animate-pulse absolute" />
        <div className="relative z-10 text-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            ✨
          </div>
          <div className="text-sm font-bold text-white">MediConnect Healthcare Ecosystem</div>
          <div className="text-xs text-slate-400 mt-1">Interactive 3D Guidance Network Active</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[500px] flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 touch-none" />

      {/* Hovered Node Tooltip Overlay */}
      {hoveredNodeName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-500/40 text-xs font-bold shadow-2xl backdrop-blur animate-fadeIn pointer-events-none z-20">
          Node: {hoveredNodeName}
        </div>
      )}
    </div>
  );
};
