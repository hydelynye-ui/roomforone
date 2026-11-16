import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ModalType, WeatherPreset } from '../types';

interface Room3DProps {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  computerOpen?: boolean;
  onSelectModal: (modal: ModalType) => void;
  onToggleWindow: () => void;
  onToggleLamp: () => void;
}

type InteractionName = 'computer' | 'window' | 'lamp' | 'game' | 'drawing' | 'diy' | 'atmosphere' | 'tangle';

export const Room3D: React.FC<Room3DProps> = ({ weather, windowOpen, lampOn, computerOpen = false, onSelectModal, onToggleWindow, onToggleLamp }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<InteractionName | null>(null);
  const stateRef = useRef({ weather, windowOpen, lampOn, computerOpen, onSelectModal, onToggleWindow, onToggleLamp });

  useEffect(() => {
    stateRef.current = { weather, windowOpen, lampOn, computerOpen, onSelectModal, onToggleWindow, onToggleLamp };
  }, [weather, windowOpen, lampOn, computerOpen, onSelectModal, onToggleWindow, onToggleLamp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeee7da);
    const aspect = Math.max(container.clientWidth / Math.max(container.clientHeight, 1), 1);
    const view = 5.25;
    const camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 0.1, 100);
    const distance = 19;
    const pitch = 0.52;
    let azimuth = 0.82;
    const aim = new THREE.Vector3(0, 0.72, -0.1);
    const placeCamera = () => {
      camera.position.set(distance * Math.cos(pitch) * Math.sin(azimuth), distance * Math.sin(pitch), distance * Math.cos(pitch) * Math.cos(azimuth));
      camera.lookAt(aim);
    };
    placeCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const interactiveMeshes: THREE.Object3D[] = [];
    const registerInteractive = (object: THREE.Object3D, name: InteractionName) => {
      object.userData.isInteractive = true;
      object.userData.name = name;
      object.traverse((child) => {
        child.userData.isInteractive = true;
        child.userData.name = name;
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      interactiveMeshes.push(object);
      scene.add(object);
    };

    const palette = {
      ivory: 0xf5efe5,
      paper: 0xfaf7f0,
      wood: 0xc9a47e,
      darkWood: 0x76563e,
      sage: 0x91a58c,
      terracotta: 0xc98464,
      charcoal: 0x3d4140,
      glass: 0xc9dce0,
      sky: 0xbfd6dd,
    };
    const mat = (color: number, roughness = 0.82, flatShading = true) => new THREE.MeshStandardMaterial({ color, roughness, flatShading });
    const matIvory = mat(palette.ivory);
    const matPaper = mat(palette.paper);
    const matWood = mat(palette.wood, 0.7);
    const matDarkWood = mat(palette.darkWood, 0.76);
    const matSage = mat(palette.sage, 0.86);
    const matTerracotta = mat(palette.terracotta, 0.76);
    const matCharcoal = mat(palette.charcoal, 0.38, false);
    const matGlass = new THREE.MeshPhysicalMaterial({ color: palette.glass, transparent: true, opacity: 0.32, roughness: 0.22, transmission: 0.35 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x293239 });

    const ambient = new THREE.AmbientLight(0xfff5e9, 1.35);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffe8ca, 2.1);
    sun.position.set(5, 8, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -7; sun.shadow.camera.right = 7; sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -5;
    scene.add(sun);
    const lampLight = new THREE.PointLight(0xffb45d, 0, 5);
    lampLight.position.set(-1.2, 2.15, -1.4);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // Open floor and soft platform; no enclosing walls.
    const floor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.28, 6.4), mat(palette.wood, 0.92));
    floor.position.y = -0.14; floor.receiveShadow = true; scene.add(floor);
    const rug = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.025, 2.6), mat(0xe5ddd0, 0.98));
    rug.position.set(-0.1, 0.02, 0.85); rug.receiveShadow = true; scene.add(rug);
    const platformEdge = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 0.18), matDarkWood);
    platformEdge.position.set(0, 0.08, 3.08); scene.add(platformEdge);

    // Right-side open window with a stylized 3D landscape behind it.
    const outdoor = new THREE.Group();
    outdoor.position.set(3.02, 2.15, -0.6);
    outdoor.rotation.y = -Math.PI / 2;
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.3), mat(palette.sky, 0.98));
    outdoor.add(sky);
    const distantGround = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.15, 5), mat(0xa6b19e, 0.95));
    distantGround.scale.set(1.9, 0.55, 0.7); distantGround.position.set(0.15, -0.75, 0.05); outdoor.add(distantGround);
    const hill = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.9, 5), mat(0x879a87, 0.95));
    hill.scale.set(1.25, 0.6, 0.6); hill.position.set(-1.1, -0.68, -0.05); outdoor.add(hill);
    for (let i = 0; i < 5; i += 1) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.55, 6), matDarkWood);
      trunk.position.y = -0.45;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 + (i % 2) * 0.08, 0), mat(i % 2 ? 0x778c78 : 0x96a88e, 0.98));
      crown.position.y = -0.02;
      tree.add(trunk, crown);
      tree.position.set(-1.35 + i * 0.7, -0.25 + (i % 2) * 0.12, -0.08 - i * 0.02);
      outdoor.add(tree);
    }
    for (let i = 0; i < 4; i += 1) {
      const cloud = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + i * 0.025, 0), mat(0xf7f5ef, 0.99));
      cloud.scale.set(1.4, 0.55, 0.7);
      cloud.position.set(-1.1 + i * 0.68, 0.6 + (i % 2) * 0.18, -0.1);
      outdoor.add(cloud);
    }
    scene.add(outdoor);

    const windowGroup = new THREE.Group();
    windowGroup.position.set(2.55, 2.15, -0.6);
    windowGroup.rotation.y = -Math.PI / 2;
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.9, 0.12), matWood);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.55, 0.03), matGlass);
    pane.position.z = 0.07;
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.55, 0.08), matWood);
    mullionV.position.z = 0.1;
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.07, 0.08), matWood);
    mullionH.position.z = 0.1;
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.1, 0.38), matDarkWood);
    sill.position.set(0, -1, 0.18);
    windowGroup.add(windowFrame, pane, mullionV, mullionH, sill);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.2, 7), matTerracotta);
    pot.position.set(0.78, -0.8, 0.2);
    const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), matSage);
    plant.position.set(0.78, -0.56, 0.2); plant.scale.set(0.8, 1.4, 0.8);
    windowGroup.add(pot, plant);
    registerInteractive(windowGroup, 'window');

    // Desk, monitor, and tactile desktop objects.
    const desk = new THREE.Group();
    desk.position.set(-0.55, 0, -1.5);
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.13, 1.55), matWood);
    top.position.y = 1.28;
    desk.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.28, 6), matDarkWood);
    [[-1.38, -0.6], [1.38, -0.6], [-1.38, 0.6], [1.38, 0.6]].forEach(([x, z]) => { const copy = leg.clone(); copy.position.set(x, 0.64, z); desk.add(copy); });

    const monitor = new THREE.Group();
    monitor.position.set(-0.2, 1.35, -0.18);
    const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.78, 0.08), matCharcoal,);
    monitorBody.position.y = 0.48;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.62), screenMat);
    screen.position.set(0, 0.48, 0.045);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.3, 6), matCharcoal);
    stand.position.y = 0.12;
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.24), matCharcoal);
    base.position.set(0, -0.02, 0.02);
    monitor.add(monitorBody, screen, stand, base);
    desk.add(monitor);
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.22), matPaper);
    keyboard.position.set(-0.18, 1.38, 0.44); desk.add(keyboard);
    const mouseObject = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 5), matSage);
    mouseObject.scale.set(0.75, 0.4, 1); mouseObject.position.set(0.35, 1.4, 0.44); desk.add(mouseObject);
    registerInteractive(desk, 'computer');

    // Lamp.
    const lamp = new THREE.Group(); lamp.position.set(-1.25, 1.32, -0.38);
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.06, 8), matSage);
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52, 6), matCharcoal); lampStem.position.y = 0.28; lampStem.rotation.z = -0.22;
    const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 6), matSage); lampHead.position.set(0.12, 0.58, 0); lampHead.rotation.z = 2.1;
    lamp.add(lampBase, lampStem, lampHead); registerInteractive(lamp, 'lamp');

    // Low-poly tangle with simple segment deformation on drag.
    const tangle = new THREE.Group(); tangle.position.set(0.58, 1.45, 0.25);
    const tangleSegments: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i += 1) {
      const segment = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.055, 6, 10), mat(i % 2 ? 0xd18a78 : 0xe6a1a0, 0.72));
      segment.rotation.set(0.4 + i * 0.08, i * 0.35, i * 0.16); segment.position.set(Math.sin(i * 1.1) * 0.13, Math.cos(i * 0.8) * 0.1, (i - 2.5) * 0.08);
      tangleSegments.push(segment); tangle.add(segment);
    }
    registerInteractive(tangle, 'tangle');

    // Controller.
    const controller = new THREE.Group(); controller.position.set(1.1, 1.4, 0.34); controller.rotation.y = -0.32;
    const controllerBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.28), matTerracotta); controller.add(controllerBody);
    const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.1), matCharcoal); dpad.position.x = -0.13; dpad.position.y = 0.06; controller.add(dpad);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.035, 8), matSage); btn.position.set(0.13, 0.07, 0); controller.add(btn);
    registerInteractive(controller, 'game');

    // Drawing board and DIY shelf.
    const board = new THREE.Group(); board.position.set(1.95, 0, 0.7); board.rotation.y = -0.4;
    const boardPanel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.35, 0.08), matPaper); boardPanel.position.y = 1.4; board.add(boardPanel);
    const boardLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.4, 6), matWood); boardLeg.position.y = 1.1; boardLeg.rotation.z = -0.08; board.add(boardLeg);
    registerInteractive(board, 'drawing');
    const diy = new THREE.Group(); diy.position.set(-2.25, 0, 0.7);
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.85), matDarkWood); cabinet.position.y = 0.53; diy.add(cabinet);
    const pegboard = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.1, 0.08), matWood); pegboard.position.set(0, 1.75, -0.4); diy.add(pegboard);
    for (let i = 0; i < 4; i += 1) { const tool = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28 + (i % 2) * 0.12, 0.05), i % 2 ? matTerracotta : matCharcoal); tool.position.set(-0.25 + i * 0.16, 1.78 + (i % 2) * 0.1, -0.34); diy.add(tool); }
    registerInteractive(diy, 'diy');
    const speaker = new THREE.Group(); speaker.position.set(1.1, 1.43, -0.38);
    speaker.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.24, 0.17), matDarkWood), new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), matCharcoal));
    registerInteractive(speaker, 'atmosphere');

    // Weather particles stay outside the window and share the same geometric language.
    const particleCount = 130;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) { positions[i * 3] = 2.7 + Math.random() * 1.25; positions[i * 3 + 1] = 0.1 + Math.random() * 4.3; positions[i * 3 + 2] = -1.8 + Math.random() * 2.5; }
    const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x8ab8d2, size: 0.075, transparent: true, opacity: 0 });
    const particles = new THREE.Points(particleGeo, particleMat); scene.add(particles);

    const updateAtmosphere = () => {
      const current = stateRef.current;
      lampLight.intensity = current.lampOn ? 3.1 : 0;
      screenMat.color.setHex(current.computerOpen ? 0x7fc3d1 : current.weather === 'night' ? 0x587a92 : 0x293239);
      const night = current.weather === 'night';
      if (current.weather === 'rain') { scene.background = new THREE.Color(0xb8c7cc); ambient.color.setHex(0xd4e1df); ambient.intensity = 0.92; sun.color.setHex(0x9eabb1); sun.intensity = 0.7; particleMat.color.setHex(0x86b4ca); particleMat.opacity = 0.72; particleMat.size = 0.055; }
      else if (current.weather === 'snow') { scene.background = new THREE.Color(0xd9e0de); ambient.color.setHex(0xe2ece8); ambient.intensity = 1.0; sun.color.setHex(0xc3d4d3); sun.intensity = 0.9; particleMat.color.setHex(0xf8faf7); particleMat.opacity = 0.86; particleMat.size = 0.105; }
      else if (current.weather === 'autumn') { scene.background = new THREE.Color(0xe5d2b9); ambient.color.setHex(0xf2dfc7); ambient.intensity = 1.12; sun.color.setHex(0xf2ae65); sun.intensity = 1.5; particleMat.color.setHex(0xc88457); particleMat.opacity = 0.68; particleMat.size = 0.12; }
      else if (night) { scene.background = new THREE.Color(0x25343e); ambient.color.setHex(0x8ea1a3); ambient.intensity = 0.43; sun.color.setHex(0x6f8291); sun.intensity = 0.2; particleMat.opacity = 0; }
      else { scene.background = new THREE.Color(0xeee7da); ambient.color.setHex(0xfff5e9); ambient.intensity = 1.35; sun.color.setHex(0xffe8ca); sun.intensity = 2.1; particleMat.opacity = 0; }
      const windowFactor = current.windowOpen ? 1 : 0.48;
      matGlass.opacity = current.windowOpen ? 0.25 : 0.45;
      outdoor.visible = true;
      scene.userData.windowFactor = windowFactor;
    };

    let pointerDown = false; let draggingTangle = false; let moved = false; let lastX = 0; let lastY = 0; let downTarget: InteractionName | null = null;
    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    const intersect = (event: PointerEvent) => { const rect = renderer.domElement.getBoundingClientRect(); pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(interactiveMeshes, true)[0]; if (!hit) return null; let node: THREE.Object3D | null = hit.object; while (node && !node.userData.isInteractive && node.parent) node = node.parent; return (node?.userData.name as InteractionName | undefined) ?? null; };
    const onPointerDown = (event: PointerEvent) => { pointerDown = true; moved = false; lastX = event.clientX; lastY = event.clientY; downTarget = intersect(event); draggingTangle = downTarget === 'tangle'; renderer.domElement.setPointerCapture?.(event.pointerId); };
    const onPointerMove = (event: PointerEvent) => { const target = pointerDown ? downTarget : intersect(event); setHoveredItem(target); renderer.domElement.style.cursor = target ? 'pointer' : 'grab'; if (!pointerDown) return; const dx = event.clientX - lastX; const dy = event.clientY - lastY; if (Math.abs(event.clientX - lastX) > 2 || Math.abs(event.clientY - lastY) > 2) moved = true; if (draggingTangle) { tangle.rotation.y += dx * 0.018; tangle.rotation.x = THREE.MathUtils.clamp(tangle.rotation.x + dy * 0.008, -0.45, 0.45); } else { azimuth = THREE.MathUtils.clamp(azimuth + dx * 0.005, 0.25, 1.45); placeCamera(); } lastX = event.clientX; lastY = event.clientY; };
    const onPointerUp = (event: PointerEvent) => { if (pointerDown && !moved && downTarget) { if (downTarget === 'window') stateRef.current.onToggleWindow(); else if (downTarget === 'lamp') stateRef.current.onToggleLamp(); else if (downTarget === 'computer') stateRef.current.onSelectModal('computer'); else if (downTarget === 'drawing') stateRef.current.onSelectModal('drawing'); else if (downTarget === 'game') stateRef.current.onSelectModal('game'); else if (downTarget === 'diy') stateRef.current.onSelectModal('diy'); else if (downTarget === 'atmosphere') stateRef.current.onSelectModal('atmosphere'); else if (downTarget === 'tangle') { tangle.rotation.z += 0.45; } } pointerDown = false; draggingTangle = false; downTarget = null; renderer.domElement.releasePointerCapture?.(event.pointerId); };
    renderer.domElement.addEventListener('pointerdown', onPointerDown); renderer.domElement.addEventListener('pointermove', onPointerMove); renderer.domElement.addEventListener('pointerup', onPointerUp); renderer.domElement.addEventListener('pointerleave', () => setHoveredItem(null));

    let animationId = 0; let clock = new THREE.Clock();
    const animate = () => { animationId = requestAnimationFrame(animate); const delta = clock.getDelta(); const elapsed = clock.getElapsedTime(); updateAtmosphere(); const current = stateRef.current.weather; if (particleMat.opacity > 0) { const array = particleGeo.attributes.position.array as Float32Array; for (let i = 0; i < particleCount; i += 1) { array[i * 3 + 1] -= delta * (current === 'rain' ? 3.8 : current === 'autumn' ? 1.0 : 0.72); array[i * 3 + 2] += Math.sin(elapsed + i) * delta * 0.05; if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 4.2; } particleGeo.attributes.position.needsUpdate = true; } tangleSegments.forEach((segment, index) => { segment.rotation.x += Math.sin(elapsed * 0.7 + index) * delta * 0.08; }); renderer.render(scene, camera); };
    animate();

    const resize = () => { const w = container.clientWidth; const h = Math.max(container.clientHeight, 1); const nextAspect = w / h; camera.left = -view * nextAspect; camera.right = view * nextAspect; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); renderer.domElement.removeEventListener('pointerdown', onPointerDown); renderer.domElement.removeEventListener('pointermove', onPointerMove); renderer.domElement.removeEventListener('pointerup', onPointerUp); renderer.dispose(); particleGeo.dispose(); particleMat.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, []);

  const labels: Record<InteractionName, string> = { computer: 'Enter the desktop portfolio', window: windowOpen ? 'Close the window' : 'Open the window', lamp: lampOn ? 'Turn off the warm lamp' : 'Turn on the warm lamp', game: 'Pick up the controller', drawing: 'Open the drawing board', diy: 'Browse the making shelf', atmosphere: 'Tune the room atmosphere', tangle: 'Drag to reshape the tangle' };
  return <div className="relative h-full w-full select-none"><div ref={containerRef} className="h-full w-full" />{hoveredItem && <div className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-[#faf7f0]/88 px-4 py-2 text-xs font-medium text-[#34312e] shadow-lg backdrop-blur-md"><span className="h-2 w-2 animate-pulse rounded-full bg-[#c98464]" />{labels[hoveredItem]}</div>}<div className="pointer-events-none absolute bottom-6 left-5 rounded-full border border-white/50 bg-[#faf7f0]/60 px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-[#34312e]/55 backdrop-blur-sm">Drag to look around · select an object</div></div>;
};
