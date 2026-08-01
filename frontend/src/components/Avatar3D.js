import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Avatar3D renders an interactive 3D WebGL Avatar model
 * representing a Boy or Girl dressed in professional attire (suit/blazer, tie/collar).
 * Includes automatic WebGL safety fallback to ensure a smooth view on all hardware.
 */
const Avatar3D = ({
  gender = 'boy',
  suitColor = '#1e293b',
  shirtColor = '#ffffff',
  tieColor = '#dc2626',
  skinColor = '#f5d0a9',
  hairColor = '#1a1a1a',
  glasses = false,
  width = '100%',
  height = '100%',
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const [webGlError, setWebGlError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    let reqId;

    try {
      const w = container.clientWidth || 150;
      const h = container.clientHeight || 150;

      // Scene & Camera setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
      camera.position.set(0, 0.3, 4.2);

      // Renderer with failover handling
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Clear existing children
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(2, 4, 3);
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
      fillLight.position.set(-3, 1, 2);
      scene.add(fillLight);

      const rimLight = new THREE.PointLight(0x38bdf8, 1.5, 10);
      rimLight.position.set(0, 2, -2);
      scene.add(rimLight);

      // Main 3D Avatar Group
      const avatarGroup = new THREE.Group();
      scene.add(avatarGroup);

      // Materials
      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5, metalness: 0.05 });
      const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.6 });
      const suitMat = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.45, metalness: 0.1 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.3 });
      const tieMat = new THREE.MeshStandardMaterial({ color: tieColor, roughness: 0.4, metalness: 0.1 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2 });
      const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });

      // --- 1. HEAD & FACE ---
      const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
      headGeo.scale(1, 1.15, 0.95);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.position.y = 0.65;
      avatarGroup.add(headMesh);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
      earGeo.scale(0.5, 1, 0.7);
      const leftEar = new THREE.Mesh(earGeo, skinMat);
      leftEar.position.set(-0.55, 0.65, 0);
      const rightEar = leftEar.clone();
      rightEar.position.x = 0.55;
      avatarGroup.add(leftEar);
      avatarGroup.add(rightEar);

      // Eyes
      const eyeWhiteGeo = new THREE.SphereGeometry(0.08, 16, 16);
      eyeWhiteGeo.scale(1, 1, 0.5);
      const pupilGeo = new THREE.SphereGeometry(0.045, 16, 16);
      pupilGeo.scale(1, 1, 0.5);

      const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      leftEyeWhite.position.set(-0.19, 0.73, 0.48);
      const leftPupil = new THREE.Mesh(pupilGeo, eyeMat);
      leftPupil.position.set(-0.19, 0.73, 0.52);

      const rightEyeWhite = leftEyeWhite.clone();
      rightEyeWhite.position.x = 0.19;
      const rightPupil = leftPupil.clone();
      rightPupil.position.x = 0.19;

      avatarGroup.add(leftEyeWhite);
      avatarGroup.add(leftPupil);
      avatarGroup.add(rightEyeWhite);
      avatarGroup.add(rightPupil);

      // Eyebrows
      const eyebrowGeo = new THREE.BoxGeometry(0.14, 0.03, 0.04);
      const leftEyebrow = new THREE.Mesh(eyebrowGeo, hairMat);
      leftEyebrow.position.set(-0.19, 0.84, 0.5);
      leftEyebrow.rotation.z = 0.08;
      const rightEyebrow = leftEyebrow.clone();
      rightEyebrow.position.x = 0.19;
      rightEyebrow.rotation.z = -0.08;
      avatarGroup.add(leftEyebrow);
      avatarGroup.add(rightEyebrow);

      // Nose
      const noseGeo = new THREE.ConeGeometry(0.06, 0.12, 16);
      const noseMesh = new THREE.Mesh(noseGeo, skinMat);
      noseMesh.position.set(0, 0.64, 0.54);
      noseMesh.rotation.x = 0.2;
      avatarGroup.add(noseMesh);

      // Smile / Mouth
      const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 16, 16, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
      const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, 0.55, 0.51);
      mouthMesh.rotation.x = Math.PI / 2;
      avatarGroup.add(mouthMesh);

      // --- 2. HAIR STYLE (Boy vs Girl) ---
      const hairGroup = new THREE.Group();

      if (gender === 'boy') {
        const topHairGeo = new THREE.SphereGeometry(0.58, 32, 32);
        topHairGeo.scale(1.02, 0.7, 1.05);
        const topHair = new THREE.Mesh(topHairGeo, hairMat);
        topHair.position.set(0, 0.85, -0.02);
        hairGroup.add(topHair);

        const bangGeo = new THREE.ConeGeometry(0.35, 0.35, 16);
        bangGeo.scale(1, 0.5, 0.6);
        const bang = new THREE.Mesh(bangGeo, hairMat);
        bang.position.set(0.05, 1.05, 0.3);
        bang.rotation.z = -0.4;
        bang.rotation.x = 0.3;
        hairGroup.add(bang);
      } else {
        const topHairGeo = new THREE.SphereGeometry(0.6, 32, 32);
        topHairGeo.scale(1.04, 0.85, 1.06);
        const topHair = new THREE.Mesh(topHairGeo, hairMat);
        topHair.position.set(0, 0.88, -0.02);
        hairGroup.add(topHair);

        const strandGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.8, 16);
        const leftStrand = new THREE.Mesh(strandGeo, hairMat);
        leftStrand.position.set(-0.48, 0.5, 0.15);
        leftStrand.rotation.z = 0.15;
        const rightStrand = leftStrand.clone();
        rightStrand.position.x = 0.48;
        rightStrand.rotation.z = -0.15;
        hairGroup.add(leftStrand);
        hairGroup.add(rightStrand);

        const backHairGeo = new THREE.BoxGeometry(0.95, 0.8, 0.4);
        const backHair = new THREE.Mesh(backHairGeo, hairMat);
        backHair.position.set(0, 0.5, -0.3);
        hairGroup.add(backHair);
      }
      avatarGroup.add(hairGroup);

      // --- 3. GLASSES (Optional) ---
      if (glasses) {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.8 });
        const frameGeo = new THREE.TorusGeometry(0.12, 0.02, 16, 32);
        const leftLens = new THREE.Mesh(frameGeo, frameMat);
        leftLens.position.set(-0.19, 0.73, 0.53);
        const rightLens = leftLens.clone();
        rightLens.position.x = 0.19;

        const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
        const bridge = new THREE.Mesh(bridgeGeo, frameMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.74, 0.53);

        avatarGroup.add(leftLens);
        avatarGroup.add(rightLens);
        avatarGroup.add(bridge);
      }

      // --- 4. NECK & PROFESSIONAL ATTIRE (SUIT / BLAZER) ---
      const neckGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.35, 20);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.y = 0.12;
      avatarGroup.add(neckMesh);

      const collarGeo = new THREE.ConeGeometry(0.4, 0.4, 4);
      collarGeo.scale(1, 0.6, 0.7);
      const collar = new THREE.Mesh(collarGeo, shirtMat);
      collar.position.set(0, -0.05, 0.18);
      collar.rotation.x = Math.PI;
      avatarGroup.add(collar);

      const torsoGeo = new THREE.CylinderGeometry(0.65, 0.75, 1.1, 32);
      torsoGeo.scale(1, 1, 0.65);
      const suitJacket = new THREE.Mesh(torsoGeo, suitMat);
      suitJacket.position.y = -0.55;
      avatarGroup.add(suitJacket);

      const shoulderGeo = new THREE.SphereGeometry(0.35, 16, 16);
      shoulderGeo.scale(1.2, 0.8, 0.9);
      const leftShoulder = new THREE.Mesh(shoulderGeo, suitMat);
      leftShoulder.position.set(-0.55, -0.25, 0);
      const rightShoulder = leftShoulder.clone();
      rightShoulder.position.x = 0.55;
      avatarGroup.add(leftShoulder);
      avatarGroup.add(rightShoulder);

      const lapelGeo = new THREE.BoxGeometry(0.12, 0.6, 0.08);
      const leftLapel = new THREE.Mesh(lapelGeo, suitMat);
      leftLapel.position.set(-0.16, -0.3, 0.26);
      leftLapel.rotation.z = -0.35;
      const rightLapel = leftLapel.clone();
      rightLapel.position.x = 0.16;
      rightLapel.rotation.z = 0.35;
      avatarGroup.add(leftLapel);
      avatarGroup.add(rightLapel);

      if (gender === 'boy') {
        const tieGeo = new THREE.BoxGeometry(0.1, 0.5, 0.05);
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.position.set(0, -0.32, 0.25);
        avatarGroup.add(tie);

        const knotGeo = new THREE.ConeGeometry(0.06, 0.08, 4);
        knotGeo.rotation.x = Math.PI;
        const tieKnot = new THREE.Mesh(knotGeo, tieMat);
        tieKnot.position.set(0, -0.06, 0.25);
        avatarGroup.add(tieKnot);

        const pocketGeo = new THREE.BoxGeometry(0.14, 0.02, 0.04);
        const pocket = new THREE.Mesh(pocketGeo, suitMat);
        pocket.position.set(0.32, -0.25, 0.24);

        const handkerchiefGeo = new THREE.ConeGeometry(0.04, 0.06, 3);
        const handkerchief = new THREE.Mesh(handkerchiefGeo, shirtMat);
        handkerchief.position.set(0.32, -0.21, 0.24);
        handkerchief.rotation.z = -0.3;
        avatarGroup.add(pocket);
        avatarGroup.add(handkerchief);
      } else {
        const necklaceGeo = new THREE.TorusGeometry(0.16, 0.02, 16, 32);
        const necklace = new THREE.Mesh(necklaceGeo, goldMat);
        necklace.position.set(0, -0.04, 0.18);
        necklace.rotation.x = Math.PI / 3;
        avatarGroup.add(necklace);

        const pendantGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const pendant = new THREE.Mesh(pendantGeo, goldMat);
        pendant.position.set(0, -0.18, 0.24);
        avatarGroup.add(pendant);
      }

      avatarGroup.position.y = -0.15;

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        reqId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        if (!isDraggingRef.current) {
          avatarGroup.position.y = -0.15 + Math.sin(elapsedTime * 2) * 0.03;
          avatarGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.12;
          avatarGroup.rotation.x = Math.cos(elapsedTime * 1.5) * 0.02;
        }
        renderer.render(scene, camera);
      };
      animate();

      // Mouse Controls
      const handleMouseDown = (e) => {
        if (!interactive) return;
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMove = (e) => {
        if (!interactive || !isDraggingRef.current) return;
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        avatarGroup.rotation.y += deltaX * 0.015;
        avatarGroup.rotation.x += deltaY * 0.01;
        avatarGroup.rotation.x = Math.max(-0.4, Math.min(0.4, avatarGroup.rotation.x));
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };

      const domEl = renderer.domElement;
      domEl.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      const handleResize = () => {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(reqId);
        domEl.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('resize', handleResize);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
      };
    } catch (e) {
      console.warn('WebGL init error, using SVG 3D Fallback', e);
      setWebGlError(true);
    }
  }, [gender, suitColor, shirtColor, tieColor, skinColor, hairColor, glasses, interactive]);

  if (webGlError) {
    return (
      <div
        className={`avatar-fallback-card ${className}`}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: suitColor,
          borderRadius: '16px',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.8rem',
        }}
      >
        {gender === 'girl' ? '👩‍💼' : '👨‍💼'}
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`avatar-3d-viewport ${className}`}
      style={{ width, height, cursor: interactive ? 'grab' : 'default' }}
      title="3D Avatar Module (Click & Drag to Rotate)"
    />
  );
};

export default Avatar3D;
