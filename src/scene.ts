import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let programmerModel: THREE.Object3D | null = null;

// Expose scene globals for the Coder AI to use
declare global {
  interface Window {
    _bossman: {
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      renderer: THREE.WebGLRenderer;
      THREE: typeof THREE;
    };
  }
}

export function initScene(container: HTMLElement) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.01,
    5000
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  // Debug grid
  const grid = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
  scene.add(grid);

  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.update();

  // Expose for Coder AI
  window._bossman = { scene, camera, renderer, THREE };

  loadModels();

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/** Get the programmer's head position projected to screen coordinates */
export function getProgrammerScreenPos(): { x: number; y: number } | null {
  if (!programmerModel || !camera || !renderer) return null;

  // Approximate head position (top of model)
  const box = new THREE.Box3().setFromObject(programmerModel);
  const top = new THREE.Vector3(
    (box.min.x + box.max.x) / 2,
    box.max.y + 0.2,
    (box.min.z + box.max.z) / 2
  );

  top.project(camera);

  const canvas = renderer.domElement;
  return {
    x: (top.x * 0.5 + 0.5) * canvas.clientWidth,
    y: (-top.y * 0.5 + 0.5) * canvas.clientHeight,
  };
}

function normalizeModel(model: THREE.Object3D, targetHeight: number) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());

  const scale = targetHeight / size.y;
  model.scale.multiplyScalar(scale);

  const boxScaled = new THREE.Box3().setFromObject(model);
  const centerScaled = boxScaled.getCenter(new THREE.Vector3());
  const minScaled = boxScaled.min;

  model.position.x -= centerScaled.x;
  model.position.y -= minScaled.y;
  model.position.z -= centerScaled.z;
}

function loadModels() {
  const loader = new GLTFLoader();

  // Load programmer (Director) — in a corner, facing the PC
  loader.load(
    new URL("/assets/programmer.glb", import.meta.url).href,
    (gltf) => {
      const model = gltf.scene;
      normalizeModel(model, 2);
      model.position.x = -2.5;
      model.position.z = -2.5;
      // Rotate to face the PC (toward +x, +z)
      model.rotation.y = Math.PI / 4;
      scene.add(model);
      programmerModel = model;
      console.log("Programmer loaded OK");
    },
    undefined,
    (err) => console.error("Failed to load programmer:", err)
  );

  // Load retro PC — near the programmer, facing back at them
  loader.load(
    new URL("/assets/retro-pc.gltf", import.meta.url).href,
    (gltf) => {
      const model = gltf.scene;
      normalizeModel(model, 1.5);
      model.position.x = -1;
      model.position.z = -1;
      // Rotate screen to face the programmer
      model.rotation.y = Math.PI + Math.PI / 4;
      scene.add(model);
      console.log("Retro PC loaded OK");
    },
    undefined,
    (err) => console.error("Failed to load retro PC:", err)
  );
}
