import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';
import type { InteractionPhase, ModalType, ObjectId, ObjectPose, RoomState, Vec3 } from '../types';
import { constrainPose, deformTangle, INITIAL_POSES, initialTangle, clamp } from '../room/constraints';

interface Props {
  state: RoomState;
  timeOfDay: number;
  blocked: boolean;
  onSelectModal: (modal: ModalType) => void;
  onToggleWindow: () => void;
  onToggleLamp: () => void;
  onPose: (id: ObjectId, pose: ObjectPose) => void;
  onTangle: (nodes: Vec3[]) => void;
  onRotation: (value: number) => void;
}
const names: Record<ObjectId, string> = { computer: 'Computer', keyboard: 'Keyboard', mouse: 'Mouse', tangle: 'Tangle', headphones: 'AirPods Max', game: 'Switch Controller', lamp: 'Desk Lamp', atmosphere: 'Audio', tools: 'Desk Tools' };
const phases: Record<InteractionPhase, string> = { idle: 'Idle', hover: 'Hover', selected: 'Selected', picked: 'Picked up', manipulating: 'Moving', released: 'Released' };
interface Handle { select: (id: ObjectId) => void; rotate: (delta: number) => void; move: (x: number, z: number) => void; reset: () => void; resetView: () => void }

export const Room3D: React.FC<Props> = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const live = useRef(props); live.current = props;
  const handle = useRef<Handle | null>(null);
  const [interaction, setInteraction] = useState<{ id: ObjectId | null; phase: InteractionPhase }>({ id: null, phase: 'idle' });
  const [rotateMode, setRotateMode] = useState(false);
  const rotationRef = useRef(false); rotationRef.current = rotateMode;
  const [failed, setFailed] = useState(false);
  const [simple, setSimple] = useState(false);
  const [guide, setGuide] = useState(true);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer | SVGRenderer;
    let software = false;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch {
      try { renderer = new SVGRenderer(); renderer.setQuality('low'); renderer.setPrecision(2); software = true; setSimple(true); }
      catch { setFailed(true); return; }
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (renderer instanceof THREE.WebGLRenderer) {
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.7));
      renderer.shadowMap.enabled = !mobile;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.setAttribute('aria-label', 'Explore and interact with the roomforone 3D space');
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6, 6, 5, -5, 0.1, 100);
    let yaw = props.state.roomRotation, selected: ObjectId | null = null;
    let disposed = false;
    let phase: InteractionPhase = 'idle';
    const target = new THREE.Vector3(0, 1.25, 0), desiredTarget = target.clone();
    let zoom = 1, desiredZoom = 1;
    const groups = {} as Record<ObjectId, THREE.Group>;
    const poses = structuredClone({ ...INITIAL_POSES, ...props.state.objectPoses });
    let nodes = props.state.tangleNodes.map(p => [...p] as Vec3);
    let previousNodes = props.state.tangleNodes;
    const clickables: THREE.Object3D[] = [];
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    const material = (color: number, options: THREE.MeshStandardMaterialParameters = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.84, ...options }); materials.add(m); return m;
    };
    const wood = material(0xC9A47E), darkWood = material(0x89674C);
    const sage = material(0x91A58C), terracotta = material(0xC98464), graphite = material(0x34312E);
    const paper = material(0xFAF7F0), silver = material(0xACB5B0, { roughness: 0.55, metalness: 0.3 });
    const peach = material(0xF5B4BC, { transparent: true, opacity: 0.78, roughness: 0.4 });
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, p: Vec3 = [0, 0, 0]) => {
      geometries.add(geometry); const m = new THREE.Mesh(geometry, mat); m.position.set(...p); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    };
    const box = (size: Vec3, mat: THREE.Material, parent: THREE.Object3D, p: Vec3 = [0, 0, 0]) => mesh(new THREE.BoxGeometry(...size, ...size.map(v => Math.max(1, Math.ceil(v * 2))) as [number, number, number]), mat, parent, p);
    const cylinder = (r: number, height: number, mat: THREE.Material, parent: THREE.Object3D, p: Vec3 = [0, 0, 0]) => mesh(new THREE.CylinderGeometry(r, r, height, 12), mat, parent, p);
    const sphereGeo = new THREE.SphereGeometry(0.06, 10, 8); geometries.add(sphereGeo);
    const group = (id: ObjectId) => {
      const g = groups[id] = new THREE.Group(); g.userData = { id }; scene.add(g);
      g.position.set(...poses[id].position); g.rotation.y = poses[id].rotation; return g;
    };
    const register = (g: THREE.Object3D, id: string) => { g.userData.id = id; clickables.push(g); };

    const ambient = new THREE.HemisphereLight(0xFFF6E6, 0xB7A18C, 2.1); scene.add(ambient);
    if (software) scene.add(new THREE.AmbientLight(0xFFF6EA, 0.65));
    const sun = new THREE.DirectionalLight(0xFFE4B1, software ? 0.85 : 3.0); sun.position.set(2, 7, -4); sun.castShadow = !mobile;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -6; sun.shadow.camera.right = 6; sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6; sun.shadow.bias = -0.001; scene.add(sun);
    const lampLight = new THREE.PointLight(0xFFBE70, 0, 4, 1.8); scene.add(lampLight);

    // Open architectural set: no walls or ceiling. The right-side window is a freestanding frame.
    box([6.4, 0.24, 6.4], wood, scene, [0, -0.12, 0]).renderOrder = software ? -10 : 0;
    for (let i = 0; i < 10; i++) box([6.35, 0.004, 0.012], darkWood, scene, [0, 0.004, -2.85 + i * 0.63]).renderOrder = software ? -9 : 0;
    if (software) {
      const rug = mesh(new THREE.PlaneGeometry(3.3, 2.65), material(0xDEDCCB), scene, [0.2, 0.03, 0.9]); rug.rotation.x = -Math.PI / 2; rug.renderOrder = -8;
    } else box([3.3, 0.025, 2.65], material(0xDEDCCB), scene, [0.2, 0.02, 0.9]);
    for (let i = 0; i < (software ? 0 : 8); i++) box([0.012, 0.003, 2.55], paper, scene, [-1.2 + i * 0.4, 0.035, 0.9]).renderOrder = software ? -7 : 0;

    const windowGroup = new THREE.Group(); windowGroup.position.set(3.12, 2.44, -0.2); windowGroup.rotation.y = Math.PI / 2; scene.add(windowGroup);
    for (const x of [-1.2, 0, 1.2]) box([0.09, 1.86, 0.13], wood, windowGroup, [x, 0, 0]);
    for (const y of [-0.92, 0.92]) box([2.48, 0.09, 0.13], wood, windowGroup, [0, y, 0]);
    box([2.7, 0.09, 0.4], darkWood, windowGroup, [0, -0.96, 0.08]);
    register(windowGroup, 'window');
    const glass = material(0xD6E8DF, { transparent: true, opacity: 0.13, depthWrite: false });
    const pane = box([1.1, 1.7, 0.025], glass, windowGroup, [0.59, 0, 0.09]);
    box([1.1, 1.7, 0.025], glass, windowGroup, [-0.59, 0, 0.09]);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, weather: { value: 0 }, blend: { value: 0 }, sky: { value: new THREE.Color(0xBFD8CB) } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv; uniform float time; uniform float weather; uniform vec3 sky;
        float hash(float x){return fract(sin(x*127.1)*43758.5453);}
        void main(){vec3 c=mix(sky*.78,sky+vec3(.08),vUv.y);float hills=smoothstep(.28,.29,vUv.y-.05*sin(vUv.x*14.));c=mix(sky*.52,c,hills);
        for(int i=0;i<30;i++){float n=float(i);vec2 p=vec2(hash(n+1.),fract(hash(n+4.)-time*(weather<1.5?.45:.08)));float s=weather<1.5?.012:.018;float d=length((vUv-p)*vec2(weather<1.5?1.:1.,weather<1.5?.15:1.));float a=1.-smoothstep(s,s+.008,d);if(weather>.5&&weather<3.5)c=mix(c,weather<1.5?vec3(.66,.8,.84):weather<2.5?vec3(.96):vec3(.8,.46,.18),a*.8);}
        gl_FragColor=vec4(c,1.); }`,
    }); materials.add(skyMaterial);
    const simpleSky = material(0xBFDED5);
    const skyPlane = mesh(new THREE.PlaneGeometry(2.42, 1.84), software ? simpleSky : skyMaterial, scene, [2.96, 2.44, -0.2]); skyPlane.rotation.y = Math.PI / 2;
    // A small low-poly outdoor world sits behind the right-side window.
    const outdoor = new THREE.Group(); scene.add(outdoor);
    const hillMatFar = material(0xA7B79E, { roughness: 1 });
    const hillMatNear = material(0x91A58C, { roughness: 1 });
    const farHill = mesh(new THREE.SphereGeometry(1, 8, 5), hillMatFar, outdoor, [3.045, 1.43, -0.38]);
    farHill.scale.set(0.045, 0.38, 1.55);
    const nearHill = mesh(new THREE.SphereGeometry(1, 8, 5), hillMatNear, outdoor, [3.055, 1.36, 0.48]);
    nearHill.scale.set(0.05, 0.29, 1.05);
    const treeTrunk = material(0x92775C, { roughness: 1 });
    const treeCanopy = material(0x849D82, { roughness: 1 });
    const treeGroups: THREE.Group[] = [];
    for (const z of [-1.02, 0.76]) {
      const tree = new THREE.Group(); tree.position.set(3.055, 1.55, z); outdoor.add(tree);
      mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.46, 6), treeTrunk, tree, [0, 0.23, 0]);
      mesh(new THREE.ConeGeometry(0.22, 0.42, 6), treeCanopy, tree, [0, 0.53, 0]);
      mesh(new THREE.ConeGeometry(0.16, 0.34, 6), treeCanopy, tree, [0, 0.78, 0]);
      treeGroups.push(tree);
    }
    const cloudMaterial = material(0xF7F4EC, { transparent: true, opacity: 0.68, depthWrite: false, roughness: 1 });
    const cloudGroups: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const cloud = new THREE.Group(); cloud.position.set(3.055, 2.78 + (i % 2) * 0.2, -0.95 + i * 0.82); outdoor.add(cloud);
      const a = mesh(new THREE.SphereGeometry(0.19, 7, 5), cloudMaterial, cloud, [0, 0, 0]);
      const b = mesh(new THREE.SphereGeometry(0.14, 7, 5), cloudMaterial, cloud, [0, 0.08, 0.17]);
      const d = mesh(new THREE.SphereGeometry(0.13, 7, 5), cloudMaterial, cloud, [0, 0.04, -0.16]);
      a.scale.set(0.12, 0.72, 1.05); b.scale.set(0.1, 0.75, 0.8); d.scale.set(0.1, 0.7, 0.78);
      cloudGroups.push(cloud);
    }
    const sunDiscMaterial = material(0xF1C98F, { emissive: 0xE8A85E, emissiveIntensity: 0.32, roughness: 1 });
    const sunDisc = mesh(new THREE.SphereGeometry(0.16, 8, 6), sunDiscMaterial, outdoor, [3.045, 2.96, 0.62]);
    const outdoorLeafPositions = new Float32Array(18 * 3);
    for (let i = 0; i < 18; i++) {
      outdoorLeafPositions[i * 3] = 3.035;
      outdoorLeafPositions[i * 3 + 1] = 1.8 + Math.random() * 1.0;
      outdoorLeafPositions[i * 3 + 2] = -1.2 + Math.random() * 2.4;
    }
    const outdoorLeafGeometry = new THREE.BufferGeometry(); geometries.add(outdoorLeafGeometry);
    outdoorLeafGeometry.setAttribute('position', new THREE.BufferAttribute(outdoorLeafPositions, 3));
    const outdoorLeafMaterial = new THREE.PointsMaterial({ color: 0xC98464, size: 0.035, transparent: true, opacity: 0.72, depthWrite: false });
    materials.add(outdoorLeafMaterial);
    const outdoorLeaves = new THREE.Points(outdoorLeafGeometry, outdoorLeafMaterial); scene.add(outdoorLeaves);
    const rainGeometry = new THREE.BufferGeometry(); geometries.add(rainGeometry);
    const rainPoints = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) { rainPoints[i * 3] = 3.02; rainPoints[i * 3 + 1] = 1.6 + Math.random() * 1.65; rainPoints[i * 3 + 2] = -1.3 + Math.random() * 2.2; }
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPoints, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0xBCDDE3, size: 0.024, transparent: true, opacity: 0.3, depthWrite: false }); materials.add(rainMat);
    const rain = new THREE.Points(rainGeometry, rainMat); scene.add(rain);
    const snowGeometry = rainGeometry.clone(); geometries.add(snowGeometry);
    const snowMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.045, transparent: true, opacity: 0.8 }); materials.add(snowMat);
    const snow = new THREE.Points(snowGeometry, snowMat); scene.add(snow);
    const dustGeo = new THREE.BufferGeometry(); geometries.add(dustGeo);
    const dustPositions = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) { dustPositions[i * 3] = -0.5 + Math.random() * 2; dustPositions[i * 3 + 1] = 0.5 + Math.random(); dustPositions[i * 3 + 2] = -0.3 + Math.random() * 1.6; }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xFFF4D0, size: 0.016, transparent: true, opacity: 0.45, depthWrite: false }); materials.add(dustMat);
    const dust = new THREE.Points(dustGeo, dustMat); scene.add(dust);
    const sunlightMat = new THREE.MeshBasicMaterial({ color: 0xFFE5AB, transparent: true, opacity: 0.2, depthWrite: false }); materials.add(sunlightMat);
    const sunlight = box([2.3, 0.001, 2.3], sunlightMat, scene, [1.45, 0.044, -0.2]); sunlight.rotation.y = 0.45; sunlight.renderOrder = software ? -6 : 0; sunlight.visible = !software;
    const sunCross = new THREE.Group(); sunCross.position.set(1.45, 0.05, -0.2); sunCross.rotation.y = 0.45; scene.add(sunCross);
    box([0.045, 0.002, 2.3], material(0xAA9474), sunCross); box([2.3, 0.002, 0.045], material(0xAA9474), sunCross);
    const curtain = box([0.06, 1.9, 0.38], material(0xC8CCB4), scene, [2.99, 2.47, -1.28]);
    box([0.06, 0.06, 2.9], darkWood, scene, [3.0, 3.45, -0.2]);
    cylinder(0.16, 0.23, terracotta, scene, [2.55, 1.63, -1.72]);
    for (let i = 0; i < 5; i++) { const leaf = mesh(new THREE.SphereGeometry(0.13, 6, 5), sage, scene, [2.55 + Math.sin(i) * 0.14, 1.85 + i * 0.045, -1.72]); leaf.scale.set(0.6, 1.5, 0.65); }

    // Existing desk, chair and easel, with props split into individually manipulable groups.
    box([4.7, 0.13, 1.75], wood, scene, [0, 1.2, -1.85]);
    for (const x of [-2.12, 2.12]) for (const z of [-2.48, -1.22]) box([0.1, 1.15, 0.1], darkWood, scene, [x, 0.575, z]);
    const chair = new THREE.Group(); scene.add(chair); chair.position.set(-0.8, 0, -0.48);
    box([0.7, 0.12, 0.7], sage, chair, [0, 0.65, 0]); box([0.7, 0.7, 0.1], sage, chair, [0, 1.0, 0.32]);
    for (const x of [-0.26, 0.26]) for (const z of [-0.26, 0.26]) box([0.055, 0.6, 0.055], darkWood, chair, [x, 0.3, z]);
    const easel = new THREE.Group(); easel.position.set(2.1, 0, 0.95); easel.rotation.y = -0.4; scene.add(easel);
    for (const x of [-0.4, 0.4]) { const leg = box([0.06, 2.35, 0.08], wood, easel, [x, 1.18, 0]); leg.rotation.z = x * 0.25; }
    const rearLeg = box([0.07, 2.3, 0.07], wood, easel, [0, 1.15, -0.42]); rearLeg.rotation.x = -0.3;
    box([1.2, 1.5, 0.07], paper, easel, [0, 1.5, 0.03]); box([1.35, 0.08, 0.23], darkWood, easel, [0, 0.74, 0.1]);
    const drawingMark = mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 24, Math.PI * 1.5), terracotta, easel, [0.04, 1.45, 0.075]); drawingMark.rotation.z = 0.5;
    register(easel, 'drawing');
    box([0.45, 1, 1.65], darkWood, scene, [-2.7, 0.5, 1.1]);
    const pegboard = box([0.08, 1.25, 1.7], wood, scene, [-3.05, 1.92, 1.1]);
    for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) box([0.012, 0.025, 0.025], darkWood, scene, [-3, 1.43 + row * 0.24, 0.4 + col * 0.23]);
    const tools = group('tools');
    box([0.08, 0.04, 0.38], terracotta, tools); box([0.28, 0.06, 0.09], graphite, tools, [0, 0.045, -0.14]);
    box([0.11, 0.03, 0.33], paper, tools, [0.06, 0.03, 0.19]);

    const computer = group('computer');
    box([0.44, 0.04, 0.28], silver, computer); box([0.065, 0.3, 0.065], silver, computer, [0, 0.16, 0]);
    box([1.15, 0.72, 0.065], graphite, computer, [0, 0.6, 0]);
    const screenMat = material(0x91A58C, { emissive: 0x456A64, emissiveIntensity: 0.2 });
    box([1.05, 0.61, 0.01], screenMat, computer, [0, 0.6, 0.039]);
    const screenCanvas = document.createElement('canvas'); screenCanvas.width = 512; screenCanvas.height = 288;
    const screenContext = screenCanvas.getContext('2d')!;
    screenContext.fillStyle = '#80988c'; screenContext.fillRect(0, 0, 512, 288); screenContext.fillStyle = '#faf7f0'; screenContext.font = '500 32px sans-serif'; screenContext.fillText('roomforone', 35, 80); screenContext.font = '16px sans-serif'; screenContext.fillText('a little space for yourself.', 35, 113);
    for (let i = 0; i < 3; i++) { screenContext.fillStyle = ['#e3d4bd', '#c98464', '#d6dfd0'][i]; screenContext.fillRect(35 + i * 150, 160, 130, 85); }
    const screenTexture = new THREE.CanvasTexture(screenCanvas); screenTexture.colorSpace = THREE.SRGBColorSpace; textures.add(screenTexture);
    const texMat = new THREE.MeshBasicMaterial({ map: screenTexture, color: software ? 0x91A58C : 0xFFFFFF }); materials.add(texMat);
    mesh(new THREE.PlaneGeometry(1.05, 0.61), texMat, computer, [0, 0.6, 0.046]); register(computer, 'computer');
    const keyboard = group('keyboard'); box([0.64, 0.025, 0.24], silver, keyboard);
    const keyGeo = new THREE.BoxGeometry(0.034, 0.012, 0.031); geometries.add(keyGeo);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 12; col++) mesh(keyGeo, paper, keyboard, [-0.26 + col * 0.047, 0.02, -0.07 + row * 0.06]); register(keyboard, 'keyboard');
    const mouse = group('mouse'); const mouseBody = mesh(new THREE.SphereGeometry(0.1, 10, 8), paper, mouse); mouseBody.scale.set(0.7, 0.42, 1); register(mouse, 'mouse');
    const lamp = group('lamp'); cylinder(0.19, 0.04, sage, lamp); const stem = box([0.035, 0.53, 0.035], darkWood, lamp, [0.04, 0.28, 0]); stem.rotation.z = -0.15;
    mesh(new THREE.ConeGeometry(0.23, 0.22, 12, 1, true), sage, lamp, [0.1, 0.61, 0]); const bulb = mesh(new THREE.SphereGeometry(0.075, 8, 6), material(0xFFF1CB, { emissive: 0xFFCC80, emissiveIntensity: 2 }), lamp, [0.1, 0.53, 0]); register(lamp, 'lamp');
    const radio = group('atmosphere'); box([0.5, 0.3, 0.22], darkWood, radio); const grille = mesh(new THREE.CircleGeometry(0.09, 16), graphite, radio, [-0.11, 0, 0.116]); cylinder(0.035, 0.03, paper, radio, [0.12, 0.08, 0.13]).rotation.x = Math.PI / 2; register(radio, 'atmosphere');

    // Original, recognizable low-poly AirPods Max silhouette and separate display stand.
    const headphones = group('headphones');
    const band = mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 20, Math.PI), silver, headphones, [0, 0.53, 0]);
    for (const x of [-0.25, 0.25]) {
      box([0.035, 0.23, 0.035], silver, headphones, [x, 0.43, 0]);
      const cup = box([0.13, 0.3, 0.21], sage, headphones, [x, 0.28, 0]); cup.rotation.z = x * -0.25;
      box([0.04, 0.235, 0.16], graphite, headphones, [x + (x > 0 ? -0.07 : 0.07), 0.28, 0]);
    }
    register(headphones, 'headphones');
    const stand = new THREE.Group(); scene.add(stand); stand.position.copy(headphones.position);
    cylinder(0.2, 0.035, darkWood, stand); cylinder(0.025, 0.55, darkWood, stand, [0, 0.28, -0.045]); box([0.25, 0.04, 0.1], darkWood, stand, [0, 0.57, -0.045]);

    const controller = group('game');
    box([0.65, 0.08, 0.3], graphite, controller);
    for (const x of [-0.34, 0.34]) { const grip = mesh(new THREE.CapsuleGeometry(0.105, 0.16, 4, 8), x < 0 ? sage : terracotta, controller, [x, 0, 0]); grip.rotation.x = Math.PI / 2; }
    for (const x of [-0.24, 0.24]) cylinder(0.045, 0.04, graphite, controller, [x, 0.063, x < 0 ? -0.065 : 0.065]);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      cylinder(0.021, 0.023, paper, controller, [0.24 + Math.sin(a) * 0.055, 0.06, -0.05 + Math.cos(a) * 0.045]);
      box([0.026, 0.025, 0.026], graphite, controller, [-0.24 + Math.sin(a) * 0.05, 0.06, 0.06 + Math.cos(a) * 0.04]);
    }
    for (const x of [-0.14, 0.14]) box([0.04, 0.025, 0.025], paper, controller, [x, 0.06, -0.09]);
    for (const x of [-0.3, 0.3]) box([0.14, 0.04, 0.035], graphite, controller, [x, 0.04, -0.18]);
    cylinder(0.018, 0.02, paper, controller, [0.08, 0.06, 0.08]); register(controller, 'game');

    const tangle = group('tangle');
    const joints: THREE.Mesh[] = [], links: THREE.Mesh[] = [];
    const jointGeo = new THREE.SphereGeometry(0.055, 10, 8), linkGeo = new THREE.CylinderGeometry(0.047, 0.047, 1, 8); geometries.add(jointGeo); geometries.add(linkGeo);
    for (let i = 0; i < nodes.length; i++) { const m = mesh(jointGeo, i % 3 === 0 ? peach : terracotta, tangle); m.userData.node = i; joints.push(m); }
    for (let i = 0; i < nodes.length - 1; i++) { const m = mesh(linkGeo, i % 3 === 0 ? peach : terracotta, tangle); m.userData.node = i; links.push(m); }
    const up = new THREE.Vector3(0, 1, 0), temp = new THREE.Vector3();
    const drawTangle = () => {
      nodes.forEach((p, i) => joints[i].position.set(...p));
      links.forEach((m, i) => { const a = new THREE.Vector3(...nodes[i]), b = new THREE.Vector3(...nodes[i + 1]); temp.subVectors(b, a); const length = temp.length(); m.position.copy(a.add(b).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(up, temp.normalize()); m.scale.set(1, length, 1); });
    };
    drawTangle(); register(tangle, 'tangle');

    // The open space stays uncluttered; personal content lives inside the computer apps.
    const sticky = box([0.32, 0.005, 0.27], material(0xEAD4A5), scene, [-1.8, 1.272, -1.48]); sticky.rotation.y = -0.2;

    const transition = (id: ObjectId | null, next: InteractionPhase) => { phase = next; setInteraction({ id, phase: next }); };
    const commit = (id: ObjectId) => live.current.onPose(id, structuredClone(poses[id]));
    const choose = (id: ObjectId) => { selected = id; transition(id, 'selected'); };
    const resetFocus = () => { desiredTarget.set(0, 1.25, 0); desiredZoom = 1; };
    handle.current = {
      select: id => { choose(id); desiredTarget.set(...poses[id].position); desiredTarget.y += 0.1; desiredZoom = id === 'tangle' ? 2.6 : 1.55; },
      rotate: delta => { if (!selected) return; const id = selected; poses[id] = constrainPose(id, { ...poses[id], rotation: poses[id].rotation + delta }, poses); groups[id].rotation.y = poses[id].rotation; commit(id); },
      move: (x, z) => { if (!selected) return; const id = selected; const p = poses[id]; poses[id] = constrainPose(id, { ...p, position: [p.position[0] + x, p.position[1], p.position[2] + z] }, poses); commit(id); },
      reset: () => { if (!selected) return; const id = selected; if (id === 'tangle') { nodes = initialTangle(); drawTangle(); live.current.onTangle(nodes); } else { poses[id] = structuredClone(INITIAL_POSES[id]); commit(id); } },
      resetView: () => { selected = null; transition(null, 'idle'); resetFocus(); live.current.onEditEnd(); },
    };

    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), plane = new THREE.Plane(up, -1.3);
    const pointAt = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); ray.setFromCamera(pointer, camera);
    };
    const pick = (event: PointerEvent) => {
      pointAt(event);
      const hit = ray.intersectObjects(clickables, true)[0];
      if (!hit) {
        // Screen-space fallback provides a 44px touch target without making visible props oversized.
        const rect = renderer.domElement.getBoundingClientRect();
        const candidates: { id: ObjectId; node?: number; point: THREE.Vector3; distance: number }[] = [];
        for (const id of (Object.keys(groups) as ObjectId[]).filter(id => id !== 'tools')) {
          const center = groups[id].getWorldPosition(new THREE.Vector3());
          if (id === 'computer') center.y += 0.4;
          if (id === 'headphones') center.y += 0.4;
          const projected = center.clone().project(camera);
          const distance = Math.hypot((projected.x + 1) * rect.width / 2 - (event.clientX - rect.left), (-projected.y + 1) * rect.height / 2 - (event.clientY - rect.top));
          candidates.push({ id, point: center, distance });
        }
        if (selected === 'tangle') joints.forEach((joint, node) => {
          const center = joint.getWorldPosition(new THREE.Vector3()), projected = center.clone().project(camera);
          candidates.push({ id: 'tangle', node, point: center, distance: Math.hypot((projected.x + 1) * rect.width / 2 - (event.clientX - rect.left), (-projected.y + 1) * rect.height / 2 - (event.clientY - rect.top)) });
        });
        candidates.sort((a, b) => a.distance - b.distance);
        return candidates[0]?.distance < 22 ? candidates[0] : null;
      }
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.id) object = object.parent;
      return object ? { id: object.userData.id as string, node: hit.object.userData.node as number | undefined, point: hit.point } : null;
    };
    type Gesture = { id: number; x: number; y: number; lastX: number; hit: ReturnType<typeof pick>; moved: boolean; rotate: boolean; start: Vec3; pose: ObjectPose | null; nodes: Vec3[] };
    let gesture: Gesture | null = null;
    let enteringComputer = false;
    let enterTimer: number | null = null;
    const touches = new Map<number, number>();
    const cancel = () => {
      if (gesture?.hit && gesture.pose) { const id = gesture.hit.id as ObjectId; poses[id] = gesture.pose; nodes = gesture.nodes; drawTangle(); }
      gesture = null; transition(selected, selected ? 'selected' : 'idle');
    };
    const onDown = (e: PointerEvent) => {
      if (live.current.blocked || enteringComputer) return;
      if (e.pointerType === 'touch') touches.set(e.pointerId, e.clientX);
      if (touches.size > 1) { cancel(); renderer.domElement.setPointerCapture(e.pointerId); return; }
      const hit = pick(e), id = hit?.id as ObjectId;
      const dragStart = hit?.point.clone() || new THREE.Vector3();
      if (groups[id]) { plane.constant = -poses[id].position[1]; ray.ray.intersectPlane(plane, dragStart); }
      gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, hit, moved: false, rotate: e.button === 2 || e.shiftKey || rotationRef.current,
        start: [dragStart.x, dragStart.y, dragStart.z], pose: groups[id] ? structuredClone(poses[id]) : null, nodes: nodes.map(n => [...n] as Vec3) };
      renderer.domElement.setPointerCapture(e.pointerId);
      if (groups[id]) { choose(id); transition(id, 'picked'); }
    };
    const onMove = (e: PointerEvent) => {
      if (live.current.blocked) return;
      if (touches.has(e.pointerId) && touches.size > 1) {
        const old = touches.get(e.pointerId)!; touches.set(e.pointerId, e.clientX); yaw = clamp(yaw + (e.clientX - old) * 0.006, -0.26, 1.83); return;
      }
      if (!gesture || gesture.id !== e.pointerId) {
        const hit = pick(e), id = hit?.id as ObjectId;
        host.style.cursor = hit ? 'pointer' : 'grab';
        if (!selected && phase !== (hit ? 'hover' : 'idle')) transition(groups[id] ? id : null, hit ? 'hover' : 'idle');
        return;
      }
      const g = gesture, dx = e.clientX - g.lastX;
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 7) g.moved = true;
      g.lastX = e.clientX;
      if (!g.moved) return;
      const id = g.hit?.id as ObjectId;
      if (groups[id] && g.pose) {
        transition(id, 'manipulating');
        if (g.rotate) { poses[id].rotation = Math.atan2(Math.sin(poses[id].rotation + dx * 0.016), Math.cos(poses[id].rotation + dx * 0.016)); }
        else {
          pointAt(e); plane.constant = -g.pose.position[1]; const world = new THREE.Vector3();
          if (ray.ray.intersectPlane(plane, world)) {
            if (id === 'tangle' && g.hit?.node !== undefined) {
              tangle.updateMatrixWorld(); const local = tangle.worldToLocal(world.clone()); nodes = deformTangle(nodes, g.hit.node, [local.x, 0.03, local.z]); drawTangle();
            } else {
              const p = g.pose.position;
              poses[id] = constrainPose(id, { position: [p[0] + world.x - g.start[0], p[1], p[2] + world.z - g.start[2]], rotation: poses[id].rotation }, poses);
            }
          }
        }
      } else if (!g.hit && e.pointerType !== 'touch') { yaw = clamp(yaw + dx * 0.006, -0.26, 1.83); }
    };
    const open = (id: string) => {
      if (id === 'tangle') { handle.current?.select('tangle'); return; }
      if (id === 'mood-ai') { open('computer'); return; }
      if (id === 'keyboard' || id === 'mouse') { open('computer'); return; }
      if (id === 'computer') {
        if (enteringComputer) return;
        enteringComputer = true;
        selected = 'computer';
        transition('computer', 'selected');
        desiredTarget.set(...poses.computer.position); desiredTarget.y += 0.58; desiredZoom = 3.4;
        enterTimer = window.setTimeout(() => { enteringComputer = false; live.current.onSelectModal('computer'); }, 560);
        return;
      }
      if (id === 'window') { live.current.onToggleWindow(); return; }
      if (id === 'lamp') { live.current.onToggleLamp(); return; }
      const modal: Record<string, ModalType> = { headphones: 'headphones', game: 'switch', drawing: 'drawing', atmosphere: 'headphones' };
      live.current.onSelectModal(modal[id] || null);
    };
    const onUp = (e: PointerEvent) => {
      const wasMulti = touches.size > 1; touches.delete(e.pointerId);
      if (wasMulti) { live.current.onRotation(yaw); gesture = null; return; }
      if (!gesture || gesture.id !== e.pointerId) return;
      const g = gesture; gesture = null;
      const id = g.hit?.id as ObjectId;
      if (g.moved) {
        if (groups[id]) { commit(id); if (id === 'tangle') live.current.onTangle(nodes.map(n => [...n] as Vec3)); transition(id, 'released'); if (id === 'headphones' || id === 'game') open(id); }
        else live.current.onRotation(yaw);
      } else if (g.hit && !g.rotate) { transition(groups[id] ? id : null, 'selected'); open(id); }
      if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
    };
    const onCancel = (e: PointerEvent) => { touches.delete(e.pointerId); cancel(); };
    const onContext = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (!selected || live.current.blocked || /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Escape') { cancel(); handle.current?.resetView(); }
      const deltas: Record<string, [number, number]> = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] };
      if (deltas[e.key]) { e.preventDefault(); handle.current?.move(...deltas[e.key]); }
      if (e.key.toLowerCase() === 'r') handle.current?.rotate(0.15);
    };
    const onLoss = (e: Event) => { e.preventDefault(); setFailed(true); };
    const onBlur = () => { touches.clear(); if (gesture) cancel(); };
    const el = renderer.domElement;
    const pointerListener = (callback: (event: PointerEvent) => void): EventListener => event => {
      if (event instanceof PointerEvent) callback(event);
    };
    const downListener = pointerListener(onDown), moveListener = pointerListener(onMove), upListener = pointerListener(onUp), cancelListener = pointerListener(onCancel);
    el.addEventListener('pointerdown', downListener); el.addEventListener('pointermove', moveListener); el.addEventListener('pointerup', upListener); el.addEventListener('pointercancel', cancelListener); el.addEventListener('contextmenu', onContext); el.addEventListener('webglcontextlost', onLoss); window.addEventListener('keydown', onKey); window.addEventListener('blur', onBlur);

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      const aspect = w / h, half = Math.max(5.2, 5.2 / aspect);
      camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
      camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const backgrounds = { sunny: 0xEFE8DC, cloudy: 0xE5E5DF, rain: 0xDBE1DF, snow: 0xE2E8E4, autumn: 0xEDE1CF, night: 0x293A42 };
    const skies = { sunny: 0xBFDED5, cloudy: 0xB8C5C6, rain: 0x9EAFB8, snow: 0xD7E2E3, autumn: 0xE6CD9D, night: 0x23374C };
    const weatherIndex = { sunny: 0, cloudy: 0.5, rain: 1, snow: 2, autumn: 3, night: 4 };
    const background = new THREE.Color(backgrounds[props.state.weather]); scene.background = background;
    const nextColor = new THREE.Color();
    let lastTime = 0, frame = 0, lastRender = 0, wasBlocked = false;
    const animate = (milliseconds: number) => {
      if (disposed) return; frame = requestAnimationFrame(animate);
      if (document.hidden) { lastTime = milliseconds; return; }
      if (software && milliseconds - lastRender < (live.current.blocked ? 350 : 65)) return;
      lastRender = milliseconds;
      const dt = Math.min(0.05, (milliseconds - lastTime) / 1000 || 0.016); lastTime = milliseconds;
      const s = live.current.state, alpha = reduced.matches ? 1 : 1 - Math.exp(-dt * 6);
      if (wasBlocked && !live.current.blocked) { selected = null; transition(null, 'idle'); resetFocus(); }
      wasBlocked = live.current.blocked;
      if (s.tangleNodes !== previousNodes && !gesture) { previousNodes = s.tangleNodes; nodes = s.tangleNodes.map(p => [...p] as Vec3); drawTangle(); }
      target.lerp(desiredTarget, alpha); zoom += (desiredZoom - zoom) * alpha; camera.zoom = zoom; camera.updateProjectionMatrix();
      camera.position.set(target.x + Math.sin(yaw) * 16, target.y + 11.2, target.z + Math.cos(yaw) * 16); camera.lookAt(target);
      for (const id of Object.keys(groups) as ObjectId[]) {
        const g = groups[id]; const lifted = selected === id && (phase === 'picked' || phase === 'manipulating' || (live.current.blocked && (id === 'headphones' || id === 'game')));
        const destination = new THREE.Vector3(...poses[id].position); destination.y += lifted ? 0.16 : 0;
        g.position.lerp(destination, alpha); g.rotation.y = poses[id].rotation;
        const scale = lifted ? 1.025 : 1; g.scale.lerp(new THREE.Vector3(scale, scale, scale), alpha);
      }
      const hour = live.current.timeOfDay;
      const isNight = s.weather === 'night' || hour < 5.5 || hour >= 20;
      const daylight = clamp(Math.sin(((hour - 6) / 12) * Math.PI), 0, 1);
      const windSpeed = s.actualWeather?.windSpeed ?? (s.weather === 'autumn' ? 22 : 6);
      const liveCloudCover = s.weatherMode === 'live' ? s.actualWeather?.cloudCover : undefined;
      const cloudOpacity = liveCloudCover === undefined
        ? ({ sunny: 0.42, cloudy: 0.92, rain: 0.96, snow: 0.86, autumn: 0.5, night: 0.58 } as const)[s.weather]
        : 0.18 + clamp(liveCloudCover / 100, 0, 1) * 0.78;
      cloudMaterial.opacity += (cloudOpacity - cloudMaterial.opacity) * alpha * 0.35;
      sunDisc.visible = !isNight;
      sunDisc.position.y += ((2.25 + daylight * 0.68) - sunDisc.position.y) * alpha;
      sunDisc.position.z += ((-0.92 + (hour / 24) * 1.75) - sunDisc.position.z) * alpha;
      treeGroups.forEach((tree, index) => { tree.rotation.z = reduced.matches ? 0 : Math.sin(milliseconds / (1900 + index * 420)) * Math.min(0.045, windSpeed * 0.0018); });
      cloudGroups.forEach((cloud, index) => { cloud.position.z += (Math.sin(milliseconds / (5200 + index * 1100) + index) * 0.1 - (cloud.position.z - (-0.95 + index * 0.82))) * alpha * 0.22; });
      outdoorLeaves.visible = !reduced.matches && (s.weather === 'autumn' || windSpeed >= 20);
      if (outdoorLeaves.visible) {
        for (let i = 0; i < 18; i++) {
          outdoorLeafPositions[i * 3 + 1] -= dt * (0.08 + windSpeed * 0.004);
          outdoorLeafPositions[i * 3 + 2] += dt * (0.12 + windSpeed * 0.009);
          if (outdoorLeafPositions[i * 3 + 1] < 1.55 || outdoorLeafPositions[i * 3 + 2] > 1.25) {
            outdoorLeafPositions[i * 3 + 1] = 2.8 + Math.random() * 0.3;
            outdoorLeafPositions[i * 3 + 2] = -1.3 - Math.random() * 0.2;
          }
        }
        outdoorLeafGeometry.attributes.position.needsUpdate = true;
      }
      const goldenHour = Math.max(clamp(1 - Math.abs(hour - 7) / 2.5, 0, 1), clamp(1 - Math.abs(hour - 18) / 3, 0, 1));
      const skyTarget = new THREE.Color(skies[s.weather]).lerp(new THREE.Color(0xE7B98E), goldenHour * (isNight ? 0 : 0.2)).lerp(new THREE.Color(0x263A4A), isNight ? 0.88 : 0);
      const backgroundTarget = new THREE.Color(backgrounds[s.weather]).lerp(new THREE.Color(0xE9C7A4), goldenHour * (isNight ? 0 : 0.12)).lerp(new THREE.Color(0x293A42), isNight ? 0.82 : 0);
      background.lerp(backgroundTarget, alpha * 0.3);
      skyMaterial.uniforms.sky.value.lerp(skyTarget, alpha * 0.3);
      simpleSky.color.lerp(skyTarget, alpha);
      skyMaterial.uniforms.weather.value = isNight ? 4 : weatherIndex[s.weather]; skyMaterial.uniforms.time.value = reduced.matches ? 0 : milliseconds / 1000;
      ambient.intensity += ((isNight ? 0.72 : 1.15 + daylight * 0.8) - ambient.intensity) * alpha * 0.3;
      const weatherSun = { sunny: 2.8, cloudy: 1.35, rain: 0.55, snow: 0.95, autumn: 2.4, night: 0.35 }[s.weather];
      const solarStrength = isNight ? 0.045 : 0.12 + daylight * 0.88;
      sun.intensity += ((weatherSun * solarStrength * (software ? 0.32 : 1)) - sun.intensity) * alpha * 0.3;
      sun.position.set(4.8 + Math.sin((hour - 12) / 12 * Math.PI) * 1.3, 2.2 + daylight * 4.8, -0.2 + Math.cos((hour - 12) / 12 * Math.PI) * 2.2);
      sun.color.lerp(nextColor.set(isNight ? 0x8FAABC : goldenHour > 0.15 ? 0xFFD19A : 0xFFE5BE), alpha);
      const solarDrift = (hour - 12) / 12 * Math.PI;
      const patchX = 1.45 + Math.sin(solarDrift) * 0.42;
      const patchZ = -0.2 + Math.cos(solarDrift) * 0.42;
      sunlight.position.x += (patchX - sunlight.position.x) * alpha;
      sunlight.position.z += (patchZ - sunlight.position.z) * alpha;
      sunCross.position.x = sunlight.position.x; sunCross.position.z = sunlight.position.z;
      lampLight.position.copy(lamp.position).add(new THREE.Vector3(0.1, 0.5, 0)); lampLight.intensity += ((s.lampOn ? 3.5 : 0) - lampLight.intensity) * alpha;
      bulb.visible = s.lampOn; screenMat.emissiveIntensity = isNight ? 0.7 : 0.2;
      pane.position.x += ((s.windowOpen ? 1.08 : 0.59) - pane.position.x) * alpha;
      sunlightMat.opacity += ((!isNight && (s.weather === 'sunny' || s.weather === 'autumn') ? 0.24 * daylight : 0) - sunlightMat.opacity) * alpha * 0.3;
      sunCross.visible = !software && sunlightMat.opacity > 0.12;
      curtain.rotation.z = reduced.matches ? 0 : s.windowOpen ? Math.sin(milliseconds / 1700) * 0.035 : 0;
      dust.visible = !reduced.matches && !software && (s.weather === 'sunny' || s.weather === 'autumn');
      if (dust.visible) { dust.position.x = Math.sin(milliseconds / 4200) * 0.04; dust.position.y = Math.sin(milliseconds / 2600) * 0.05; }
      rain.visible = s.weather === 'rain'; snow.visible = s.weather === 'snow' && s.windowOpen;
      const rainIntensity = s.weatherMode === 'live' && s.actualWeather?.precipitation !== undefined ? clamp(s.actualWeather.precipitation / 3, 0, 1) : 0.45;
      rainMat.opacity += ((0.18 + rainIntensity * 0.24) - rainMat.opacity) * alpha;
      if (rain.visible && !reduced.matches) {
        for (let i = 0; i < 60; i++) { rainPoints[i * 3 + 1] -= dt * (0.2 + i % 4 * 0.1); if (rainPoints[i * 3 + 1] < 1.61) rainPoints[i * 3 + 1] = 3.25; }
        rainGeometry.attributes.position.needsUpdate = true;
      }
      if (snow.visible && !reduced.matches) {
        const a = snowGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 60; i++) { a[i * 3 + 1] -= dt * 0.2; a[i * 3 + 2] += dt * 0.06; if (a[i * 3 + 1] < 1.9 || a[i * 3 + 2] > 0.9) { a[i * 3] = 3.06; a[i * 3 + 1] = 2.8 + Math.random() * 0.3; a[i * 3 + 2] = -1.3 + Math.random() * 2.2; } }
        snowGeometry.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true; cancelAnimationFrame(frame); if (enterTimer !== null) window.clearTimeout(enterTimer); observer.disconnect(); handle.current = null;
      el.removeEventListener('pointerdown', downListener); el.removeEventListener('pointermove', moveListener); el.removeEventListener('pointerup', upListener); el.removeEventListener('pointercancel', cancelListener); el.removeEventListener('contextmenu', onContext); el.removeEventListener('webglcontextlost', onLoss); window.removeEventListener('keydown', onKey); window.removeEventListener('blur', onBlur);
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); if (renderer instanceof THREE.WebGLRenderer) renderer.dispose(); el.remove();
    };
  }, []);

  return <section className="room-stage" aria-label="Open 3D room">
    <div ref={containerRef} className="room-canvas" />
    {simple && <span className="simple-label">Simplified rendering · interactions remain available</span>}
    {failed ? <div className="room-fallback"><h2>Explore another way</h2><p>3D rendering is unavailable in this browser. You can still open the computer, canvas, audio and other room tools.</p>{(['computer', 'drawing', 'headphones', 'switch'] as ModalType[]).map(id => <button key={id} className="soft-button" onClick={() => props.onSelectModal(id)}>{id === 'drawing' ? 'Drawing Board' : id === 'switch' ? 'Switch Controller' : names[id as ObjectId]}</button>)}</div> : <>
      {guide && <div className="room-guide"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h2>A little space to slow down.</h2><p>Drag the open space to look around. Select an object to explore.</p><button onClick={() => setGuide(false)} aria-label="Dismiss welcome message">×</button></div>}
      <div className="room-bottom-bar"><span>{interaction.id ? names[interaction.id] + ' · ' + phases[interaction.phase] : 'Drag to explore · Pinch to look around'}</span><button onClick={() => { handle.current?.resetView(); setGuide(true); }}>Reset view</button></div>
      <div className="object-toolbar">
        <label className="sr-only" htmlFor="object-picker">Choose an object to explore</label>
        <select id="object-picker" value={interaction.id || ''} onChange={e => handle.current?.select(e.target.value as ObjectId)}><option value="" disabled>Explore an object</option>{Object.entries(names).filter(([id]) => id !== 'tools').map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        {interaction.id && <><button className={rotateMode ? 'active' : ''} aria-pressed={rotateMode} onClick={() => setRotateMode(!rotateMode)}>{rotateMode ? 'Rotate' : 'Move'}</button><button onClick={() => handle.current?.rotate(0.26)} aria-label="Rotate selected object by fifteen degrees">↻</button><button onClick={() => handle.current?.reset()}>Reset object</button><button onClick={() => handle.current?.resetView()} aria-label="Exit object editing">×</button></>}
      </div>
      {interaction.id === 'tangle' && <div className="tangle-edit-tip">Tangle · Drag any link to reshape it<button onClick={() => handle.current?.resetView()}>Done</button></div>}
    </>}
  </section>;
};
