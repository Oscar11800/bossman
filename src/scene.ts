import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

export function initScene(container: HTMLElement) {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.01,
    5000
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);

  // Renderer
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

  // Debug helpers
  const grid = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
  scene.add(grid);

  const axes = new THREE.AxesHelper(2);
  scene.add(axes);

  // Debug cube — proves the scene renders
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  cube.position.set(0, 0.25, 0);
  scene.add(cube);

  // Orbit controls — attach to renderer canvas directly
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.update();

  // Load models
  loadModels();

  // Resize handler
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function normalizeModel(model: THREE.Object3D, targetHeight: number) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());

  console.log("Raw model size:", { x: size.x, y: size.y, z: size.z });

  const scale = targetHeight / size.y;
  model.scale.multiplyScalar(scale);

  // Recompute after scaling
  const boxScaled = new THREE.Box3().setFromObject(model);
  const centerScaled = boxScaled.getCenter(new THREE.Vector3());
  const minScaled = boxScaled.min;

  // Place on ground (y=0) and center on x/z
  model.position.x -= centerScaled.x;
  model.position.y -= minScaled.y;
  model.position.z -= centerScaled.z;
}

function loadModels() {
  const loader = new GLTFLoader();

  // Load programmer (Director)
  loader.load(
    new URL("/assets/programmer.glb", import.meta.url).href,
    (gltf) => {
      const model = gltf.scene;
      normalizeModel(model, 2);
      model.position.x = -1.5;
      scene.add(model);
      console.log("Programmer loaded OK");
    },
    (progress) => {
      if (progress.total > 0) {
        console.log("Programmer:", Math.round((progress.loaded / progress.total) * 100) + "%");
      }
    },
    (err) => console.error("Failed to load programmer:", err)
  );

  // Load retro PC
  loader.load(
    new URL("/assets/retro-pc.gltf", import.meta.url).href,
    (gltf) => {
      const model = gltf.scene;
      normalizeModel(model, 1.5);
      model.position.x = 1.5;
      scene.add(model);
      console.log("Retro PC loaded OK");
    },
    (progress) => {
      if (progress.total > 0) {
        console.log("PC:", Math.round((progress.loaded / progress.total) * 100) + "%");
      }
    },
    (err) => console.error("Failed to load retro PC:", err)
  );
}
