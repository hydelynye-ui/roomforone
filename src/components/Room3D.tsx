import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WeatherPreset, ModalType } from '../types';

interface Room3DProps {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  onSelectModal: (modal: ModalType) => void;
  onToggleWindow: () => void;
  onToggleLamp: () => void;
  onRotationChange?: (angle: number) => void;
}

export const Room3D: React.FC<Room3DProps> = ({
  weather,
  windowOpen,
  lampOn,
  onSelectModal,
  onToggleWindow,
  onToggleLamp,
  onRotationChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // References to keep Three.js state synced without full re-render
  const stateRef = useRef({
    weather,
    windowOpen,
    lampOn,
    onSelectModal,
    onToggleWindow,
    onToggleLamp,
  });

  useEffect(() => {
    stateRef.current = {
      weather,
      windowOpen,
      lampOn,
      onSelectModal,
      onToggleWindow,
      onToggleLamp,
    };
  }, [weather, windowOpen, lampOn, onSelectModal, onToggleWindow, onToggleLamp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEFE8DC);

    const aspect = container.clientWidth / container.clientHeight;
    const d = 5.2;
    const camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 1, 100
    );

    // Initial isometric view
    const initialDistance = 20;
    const initialPitch = 0.55; // ~31 degrees
    let currentAzimuth = 0.785; // 45 degrees
    
    camera.position.set(
      initialDistance * Math.cos(initialPitch) * Math.sin(currentAzimuth),
      initialDistance * Math.sin(initialPitch),
      initialDistance * Math.cos(initialPitch) * Math.cos(currentAzimuth)
    );
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Interactive Objects Map ---
    const interactiveMeshes: THREE.Object3D[] = [];
    const registerInteractive = (obj: THREE.Object3D, name: string) => {
      obj.userData = { isInteractive: true, name };
      obj.traverse((child) => {
        child.userData = { isInteractive: true, name };
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      interactiveMeshes.push(obj);
      scene.add(obj);
    };

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    sunLight.position.set(-6, 9, -2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Desk Lamp Point Light
    const lampLight = new THREE.PointLight(0xffaa44, 0, 4);
    lampLight.position.set(-0.8, 1.6, -1.1);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // --- Materials Palette ---
    const matWall = new THREE.MeshStandardMaterial({ color: 0xF5F0E6, roughness: 0.8 });
    const matFloor = new THREE.MeshStandardMaterial({ color: 0xD7B896, roughness: 0.6 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0xB58756, roughness: 0.5 });
    const matDarkWood = new THREE.MeshStandardMaterial({ color: 0x825E3B, roughness: 0.5 });
    const matScreen = new THREE.MeshBasicMaterial({ color: 0x22272E });
    const screenDayMaterial = new THREE.MeshBasicMaterial({ color: 0x24292E });
    const screenNightMaterial = new THREE.MeshBasicMaterial({ color: 0x60A5FA });
    const matSage = new THREE.MeshStandardMaterial({ color: 0x91A58C, roughness: 0.6 });
    const matTerracotta = new THREE.MeshStandardMaterial({ color: 0xC98464, roughness: 0.5 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x4A4E54, metalness: 0.8, roughness: 0.2 });
    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xE8F4F8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8,
    });

    // --- Room Shell (Floor & 2 Walls) ---
    // Floor
    const floorGeo = new THREE.BoxGeometry(6.4, 0.3, 6.4);
    const floor = new THREE.Mesh(floorGeo, matFloor);
    floor.position.set(0, -0.15, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Cozy Rug
    const rugGeo = new THREE.BoxGeometry(3.0, 0.02, 2.6);
    const matRug = new THREE.MeshStandardMaterial({ color: 0xE6DFD3, roughness: 0.9 });
    const rug = new THREE.Mesh(rugGeo, matRug);
    rug.position.set(0.4, 0.01, 0.8);
    rug.receiveShadow = true;
    scene.add(rug);

    // Back Wall (Z = -3.2)
    const backWallGeo = new THREE.BoxGeometry(6.4, 4.2, 0.25);
    const backWall = new THREE.Mesh(backWallGeo, matWall);
    backWall.position.set(0, 1.95, -3.2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall (X = -3.2)
    const leftWallGeo = new THREE.BoxGeometry(0.25, 4.2, 6.4);
    const leftWall = new THREE.Mesh(leftWallGeo, matWall);
    leftWall.position.set(-3.2, 1.95, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Skirting boards
    const skirtGeo1 = new THREE.BoxGeometry(6.4, 0.16, 0.08);
    const skirt1 = new THREE.Mesh(skirtGeo1, matDarkWood);
    skirt1.position.set(0, 0.08, -3.05);
    scene.add(skirt1);

    const skirtGeo2 = new THREE.BoxGeometry(0.08, 0.16, 6.4);
    const skirt2 = new THREE.Mesh(skirtGeo2, matDarkWood);
    skirt2.position.set(-3.05, 0.08, 0);
    scene.add(skirt2);

    // --- Window on Back Wall ---
    const windowGroup = new THREE.Group();
    windowGroup.position.set(0.6, 2.3, -3.06);

    const frameOuterGeo = new THREE.BoxGeometry(2.4, 1.8, 0.1);
    const frameOuter = new THREE.Mesh(frameOuterGeo, matWood);
    windowGroup.add(frameOuter);

    // Glass panes
    const glassPaneGeo = new THREE.BoxGeometry(1.05, 1.5, 0.02);
    const leftGlass = new THREE.Mesh(glassPaneGeo, matGlass);
    leftGlass.position.set(-0.55, 0, 0);
    windowGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(glassPaneGeo, matGlass);
    rightGlass.position.set(0.55, 0, 0);
    windowGroup.add(rightGlass);

    // Window sill with a small potted plant
    const sillGeo = new THREE.BoxGeometry(2.6, 0.08, 0.35);
    const sill = new THREE.Mesh(sillGeo, matDarkWood);
    sill.position.set(0, -0.9, 0.15);
    sill.castShadow = true;
    windowGroup.add(sill);

    // Pot
    const potGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.18, 16);
    const pot = new THREE.Mesh(potGeo, matTerracotta);
    pot.position.set(0.9, -0.76, 0.15);
    windowGroup.add(pot);

    const plantLeavesGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const plantLeaves = new THREE.Mesh(plantLeavesGeo, matSage);
    plantLeaves.position.set(0.9, -0.62, 0.15);
    plantLeaves.scale.set(1, 1.4, 0.9);
    windowGroup.add(plantLeaves);

    registerInteractive(windowGroup, 'window');

    // --- Work Desk & Computer ---
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-0.2, 0, -1.8);

    // Desk Tabletop
    const tableTopGeo = new THREE.BoxGeometry(2.6, 0.1, 1.3);
    const tableTop = new THREE.Mesh(tableTopGeo, matWood);
    tableTop.position.set(0, 1.15, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    deskGroup.add(tableTop);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.15, 12);
    [
      [-1.15, 0.575, -0.5],
      [1.15, 0.575, -0.5],
      [-1.15, 0.575, 0.5],
      [1.15, 0.575, 0.5],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, matDarkWood);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Computer Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.15, 1.2, -0.2);

    const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.25, 12), matMetal);
    monitorStand.position.set(0, 0.125, 0);
    monitorGroup.add(monitorStand);

    const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.05), matMetal);
    monitorBody.position.set(0, 0.45, 0);
    monitorGroup.add(monitorBody);

    const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.57), matScreen);
    monitorScreen.position.set(0, 0.45, 0.026);
    monitorGroup.add(monitorScreen);

    // Keyboard & Mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.18), matWall);
    keyboard.position.set(0, 0.01, 0.35);
    monitorGroup.add(keyboard);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.12), matSage);
    mouse.position.set(0.38, 0.01, 0.35);
    monitorGroup.add(mouse);

    deskGroup.add(monitorGroup);
    registerInteractive(deskGroup, 'computer');

    // --- Tangle desk object (interactive thinking / note entry) ---
    // Three low-poly loops make the object recognizable without requiring a texture asset.
    const tangleGroup = new THREE.Group();
    tangleGroup.position.set(0.42, 1.25, -1.92);
    tangleGroup.rotation.set(0.15, -0.2, 0.1);
    const tangleMaterial = new THREE.MeshStandardMaterial({
      color: 0xC98464,
      roughness: 0.35,
      metalness: 0.1,
    });
    const tangleLoop = new THREE.TorusGeometry(0.16, 0.035, 6, 12);
    const tangleLoopA = new THREE.Mesh(tangleLoop, tangleMaterial);
    tangleLoopA.rotation.set(0.2, 0.3, 0.2);
    const tangleLoopB = new THREE.Mesh(tangleLoop, matSage);
    tangleLoopB.rotation.set(1.1, 0.4, -0.5);
    const tangleLoopC = new THREE.Mesh(tangleLoop, matTerracotta);
    tangleLoopC.rotation.set(0.6, 1.2, 0.8);
    tangleGroup.add(tangleLoopA, tangleLoopB, tangleLoopC);
    registerInteractive(tangleGroup, 'tangle');

    // --- AirPods Max desk stand (interactive sound entry) ---
    const headphonesGroup = new THREE.Group();
    headphonesGroup.position.set(-0.82, 1.28, -1.98);
    headphonesGroup.rotation.y = -0.25;
    const headphoneBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.035, 8, 18, Math.PI),
      matMetal,
    );
    headphoneBand.rotation.x = Math.PI / 2;
    headphoneBand.position.y = 0.18;
    const earCupLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), matMetal);
    earCupLeft.rotation.z = Math.PI / 2;
    earCupLeft.position.set(-0.2, 0.04, 0);
    const earCupRight = earCupLeft.clone();
    earCupRight.position.x = 0.2;
    const headphoneStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.38, 8), matWood);
    headphoneStand.position.y = -0.08;
    headphonesGroup.add(headphoneBand, earCupLeft, earCupRight, headphoneStand);
    registerInteractive(headphonesGroup, 'headphones');

    // Desk Chair
    const chairGroup = new THREE.Group();
    chairGroup.position.set(-0.35, 0, -0.8);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), matSage);
    seat.position.set(0, 0.68, 0);
    chairGroup.add(seat);
    const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.08), matSage);
    backRest.position.set(0, 1.05, 0.32);
    chairGroup.add(backRest);
    const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.68, 12), matMetal);
    chairLeg.position.set(0, 0.34, 0);
    chairGroup.add(chairLeg);
    scene.add(chairGroup);

    // --- Desk Lamp (Interactive toggle) ---
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-1.0, 1.2, -0.3);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16), matSage);
    lampBase.position.set(0, 0.02, 0);
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), matMetal);
    lampStem.position.set(0, 0.24, 0);
    lampStem.rotation.z = -0.2;
    lampGroup.add(lampStem);

    const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.22, 16), matSage);
    lampHead.position.set(0.12, 0.46, 0);
    lampHead.rotation.z = 2.1;
    lampGroup.add(lampHead);

    registerInteractive(lampGroup, 'lamp');

    // --- Gamepad on the Desk Corner ---
    const gamepadGroup = new THREE.Group();
    gamepadGroup.position.set(0.75, 1.21, 0.25);
    gamepadGroup.rotation.y = -0.3;

    const gamepadBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.18), matTerracotta);
    gamepadGroup.add(gamepadBody);

    const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.06), matMetal);
    dpad.position.set(-0.08, 0.03, 0);
    gamepadGroup.add(dpad);

    const buttonA = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), matSage);
    buttonA.position.set(0.08, 0.03, 0);
    gamepadGroup.add(buttonA);

    registerInteractive(gamepadGroup, 'game');

    // --- Radio / Speaker on Shelf/Desk ---
    const radioGroup = new THREE.Group();
    radioGroup.position.set(0.9, 1.22, -0.4);
    radioGroup.rotation.y = 0.2;

    const radioBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.14), matDarkWood);
    radioGroup.add(radioBody);

    const speakerGrill = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), matMetal);
    speakerGrill.position.set(-0.07, 0, 0.071);
    radioGroup.add(speakerGrill);

    const radioDial = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), matTerracotta);
    radioDial.position.set(0.08, 0.04, 0.071);
    radioDial.rotation.x = Math.PI / 2;
    radioGroup.add(radioDial);

    registerInteractive(radioGroup, 'atmosphere');

    // --- Easel / Drawing Board (Right corner) ---
    const easelGroup = new THREE.Group();
    easelGroup.position.set(2.0, 0, 0.8);
    easelGroup.rotation.y = -0.55;

    // Easel tripod legs
    const tripodLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
    const legLeft = new THREE.Mesh(tripodLegGeo, matWood);
    legLeft.position.set(-0.4, 1.25, 0);
    legLeft.rotation.z = -0.15;
    easelGroup.add(legLeft);

    const legRight = new THREE.Mesh(tripodLegGeo, matWood);
    legRight.position.set(0.4, 1.25, 0);
    legRight.rotation.z = 0.15;
    easelGroup.add(legRight);

    const legBack = new THREE.Mesh(tripodLegGeo, matWood);
    legBack.position.set(0, 1.25, -0.6);
    legBack.rotation.x = -0.28;
    easelGroup.add(legBack);

    // Canvas board
    const canvasBoard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.06), matWall);
    canvasBoard.position.set(0, 1.45, 0);
    canvasBoard.rotation.x = -0.12;
    easelGroup.add(canvasBoard);

    // Palette with colors on easel shelf
    const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16), matWood);
    palette.position.set(0.15, 0.72, 0.2);
    easelGroup.add(palette);

    registerInteractive(easelGroup, 'drawing');

    // --- DIY Workbench & Pegboard (Left Wall) ---
    const diyGroup = new THREE.Group();
    diyGroup.position.set(-3.0, 0, 1.2);

    // Small workbench cabinet
    const benchCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 1.6), matDarkWood);
    benchCabinet.position.set(0.18, 0.55, 0);
    diyGroup.add(benchCabinet);

    // Wall Pegboard
    const pegboard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 1.6), matWood);
    pegboard.position.set(0.02, 1.9, 0);
    diyGroup.add(pegboard);

    // Hanging tools (Small hammer, scissors, ruler models)
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.12), matMetal);
    hammer.position.set(0.07, 2.0, -0.4);
    diyGroup.add(hammer);

    const scissors = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.08), matTerracotta);
    scissors.position.set(0.07, 1.9, 0.1);
    diyGroup.add(scissors);

    registerInteractive(diyGroup, 'diy');

    // --- Weather Particles Outside Window ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5 + 0.6;
      particlePositions[i * 3 + 1] = Math.random() * 5 + 0.5;
      particlePositions[i * 3 + 2] = -3.5 - Math.random() * 2;

      particleVelocities[i * 3] = 0;
      particleVelocities[i * 3 + 1] = -0.05;
      particleVelocities[i * 3 + 2] = 0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x90CDF4,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Update Visuals Based on Weather & Lamps ---
    const updateSceneAtmosphere = () => {
      const cur = stateRef.current;
      
      // Lamp point light
      lampLight.intensity = cur.lampOn ? 3.0 : 0;
      lampLight.color.setHex(0xffaa44);

      // Window position
      rightGlass.position.x = cur.windowOpen ? 0.95 : 0.55;

      switch (cur.weather) {
        case 'sunny':
          scene.background = new THREE.Color(0xEFE8DC);
          ambientLight.color.setHex(0xfff5ea);
          ambientLight.intensity = 1.3;
          sunLight.color.setHex(0xfff3db);
          sunLight.intensity = 1.9;
          sunLight.position.set(-6, 9, -2);
          monitorScreen.material = screenDayMaterial;
          particleMat.opacity = 0; // No rain/snow in sunny
          break;

        case 'rain':
          scene.background = new THREE.Color(0xD8DEE9);
          ambientLight.color.setHex(0xc0c8d4);
          ambientLight.intensity = 0.9;
          sunLight.color.setHex(0x9ca3af);
          sunLight.intensity = 0.6;
          particleMat.opacity = 0.75;
          particleMat.color.setHex(0x60A5FA);
          particleMat.size = 0.06;
          break;

        case 'snow':
          scene.background = new THREE.Color(0xE2E8F0);
          ambientLight.color.setHex(0xced8e5);
          ambientLight.intensity = 0.85;
          sunLight.color.setHex(0xa0aec0);
          sunLight.intensity = 0.7;
          particleMat.opacity = 0.9;
          particleMat.color.setHex(0xFFFFFF);
          particleMat.size = 0.12;
          break;

        case 'autumn':
          scene.background = new THREE.Color(0xF3E5D8);
          ambientLight.color.setHex(0xfce8d5);
          ambientLight.intensity = 1.1;
          sunLight.color.setHex(0xf59e0b);
          sunLight.intensity = 1.6;
          sunLight.position.set(-7, 6, -3);
          particleMat.opacity = 0.85;
          particleMat.color.setHex(0xD97706); // Golden leaves
          particleMat.size = 0.14;
          break;

        case 'night':
          scene.background = new THREE.Color(0x1E222A);
          ambientLight.color.setHex(0x283042);
          ambientLight.intensity = 0.45;
          sunLight.color.setHex(0x3B4A6B);
          sunLight.intensity = 0.2;
          monitorScreen.material = screenNightMaterial;
          particleMat.opacity = 0;
          break;
      }
    };

    // --- Interaction & Drag to Rotate (Design Spec: 100°~140° range) ---
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let hasMoved = false;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      hasMoved = false;
    };

    const minAzimuth = -0.25; // ~-14 deg
    const maxAzimuth = 1.85;  // ~106 deg (about 120 deg total safe view)

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
          hasMoved = true;
        }

        currentAzimuth += deltaX * 0.005;
        // Clamp azimuth strictly as per design specification
        currentAzimuth = Math.max(minAzimuth, Math.min(maxAzimuth, currentAzimuth));

        camera.position.set(
          initialDistance * Math.cos(initialPitch) * Math.sin(currentAzimuth),
          initialDistance * Math.sin(initialPitch),
          initialDistance * Math.cos(initialPitch) * Math.cos(currentAzimuth)
        );
        camera.lookAt(0, 0.4, 0);

        if (onRotationChange) {
          onRotationChange(currentAzimuth);
        }

        startX = e.clientX;
        startY = e.clientY;
      } else {
        // Raycasting for hover feedback
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, true);

        if (intersects.length > 0) {
          let topInteractive: THREE.Object3D | null = intersects[0].object;
          while (topInteractive && !topInteractive.userData.isInteractive && topInteractive.parent) {
            topInteractive = topInteractive.parent;
          }
          const itemName = topInteractive?.userData.name || null;
          setHoveredItem(itemName);
          container.style.cursor = itemName ? 'pointer' : 'default';
        } else {
          setHoveredItem(null);
          container.style.cursor = 'default';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!hasMoved) {
        // Click action!
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, true);

        if (intersects.length > 0) {
          let topInteractive: THREE.Object3D | null = intersects[0].object;
          while (topInteractive && !topInteractive.userData.isInteractive && topInteractive.parent) {
            topInteractive = topInteractive.parent;
          }
          const itemName = topInteractive?.userData.name;

          if (itemName === 'window') {
            stateRef.current.onToggleWindow();
          } else if (itemName === 'lamp') {
            stateRef.current.onToggleLamp();
          } else if (itemName === 'computer') {
            stateRef.current.onSelectModal('computer');
          } else if (itemName === 'drawing') {
            stateRef.current.onSelectModal('drawing');
          } else if (itemName === 'game') {
            stateRef.current.onSelectModal('game');
          } else if (itemName === 'diy') {
            stateRef.current.onSelectModal('diy');
          } else if (itemName === 'tangle') {
            stateRef.current.onSelectModal('tangle');
          } else if (itemName === 'headphones') {
            stateRef.current.onSelectModal('headphones');
          } else if (itemName === 'atmosphere') {
            stateRef.current.onSelectModal('atmosphere');
          }
        }
      }
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      updateSceneAtmosphere();

      // Animate particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      const curWeather = stateRef.current.weather;

      if (curWeather === 'rain' || curWeather === 'snow' || curWeather === 'autumn') {
        const fallSpeed = curWeather === 'rain' ? 8.0 : curWeather === 'autumn' ? 1.5 : 1.2;
        const driftSpeed = curWeather === 'autumn' ? Math.sin(time * 2) * 0.8 : Math.cos(time) * 0.2;

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] -= fallSpeed * delta;
          positions[i * 3] += driftSpeed * delta;

          // If reached bottom, reset to top
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 4.5 + Math.random();
            positions[i * 3] = (Math.random() - 0.5) * 5 + 0.6;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      camera.left = -d * asp;
      camera.right = d * asp;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Floating Hover Indicator Badge */}
      {hoveredItem && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#FAF7F0]/95 backdrop-blur-md border border-[#C9A47E]/40 text-[#34312E] text-xs font-medium shadow-md transition-all duration-150 flex items-center gap-1.5 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#C98464] animate-pulse" />
          <span>
            {hoveredItem === 'computer' && '点击查看 · 个人作品集与项目'}
            {hoveredItem === 'drawing' && '点击展开 · 涂鸦画板与灵感草稿'}
            {hoveredItem === 'game' && '点击把玩 · 秋日接落叶轻量小游戏'}
            {hoveredItem === 'diy' && '点击翻阅 · 手作与 DIY 记录'}
            {hoveredItem === 'tangle' && '点击记录 · Tangle 随手灵感'}
            {hoveredItem === 'headphones' && '点击聆听 · AirPods Max 声音入口'}
            {hoveredItem === 'lamp' && (lampOn ? '点击关闭台灯' : '点击开启暖光台灯')}
            {hoveredItem === 'window' && (windowOpen ? '点击关闭窗户' : '点击打开窗户')}
            {hoveredItem === 'atmosphere' && '点击调节 · 空间氛围与声音'}
          </span>
        </div>
      )}

      {/* Rotation hint indicator */}
      <div className="pointer-events-none absolute top-4 right-4 px-3 py-1 rounded-md bg-[#FAF7F0]/70 backdrop-blur-sm border border-[#C9A47E]/30 text-[#34312E]/70 text-[11px]">
        ↔ 左右拖动旋转房间
      </div>
    </div>
  );
};
