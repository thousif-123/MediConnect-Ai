import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Healthcare3DPharmacyCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

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

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const greenLight = new THREE.PointLight(0x10b981, 12, 20);
    greenLight.position.set(3, 3, 4);
    scene.add(greenLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 10, 20);
    cyanLight.position.set(-3, -2, 4);
    scene.add(cyanLight);

    // 3D Pharmacy Group
    const pharmacyGroup = new THREE.Group();
    scene.add(pharmacyGroup);

    // 3D Medical Cross Geometry
    const crossGroup = new THREE.Group();

    const barGeo1 = new THREE.BoxGeometry(1.6, 0.5, 0.4);
    const barGeo2 = new THREE.BoxGeometry(0.5, 1.6, 0.4);
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const mesh1 = new THREE.Mesh(barGeo1, crossMat);
    const mesh2 = new THREE.Mesh(barGeo2, crossMat);
    crossGroup.add(mesh1);
    crossGroup.add(mesh2);
    pharmacyGroup.add(crossGroup);

    // Floating 3D Medicine Capsules
    const pillGroup = new THREE.Group();
    const pillGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.9, 20);
    
    // Top half material (Emerald)
    const capMat1 = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.1,
      metalness: 0.9,
    });

    const pillMesh = new THREE.Mesh(pillGeo, capMat1);
    pillMesh.position.set(1.8, 0.8, 0.5);
    pillMesh.rotation.z = Math.PI / 4;
    pharmacyGroup.add(pillMesh);

    // Animation loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      pharmacyGroup.rotation.y = elapsedTime * 0.5;
      pharmacyGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.15;
      crossGroup.rotation.z = Math.sin(elapsedTime * 0.4) * 0.1;
      pillMesh.position.y = 0.8 + Math.sin(elapsedTime * 1.5) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="text-emerald-400 font-bold text-sm">3D Pharmacy Network Verified</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[260px] flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none" />
    </div>
  );
};
