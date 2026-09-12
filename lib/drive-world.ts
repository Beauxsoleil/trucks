import * as THREE from "three";
import { stepDrive, type DriveState } from "./drive-physics";

export function createDriveWorld(host: HTMLElement, onSmash: () => void, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0xbfeafa);
  renderer.domElement.setAttribute("aria-label", "Orange monster truck on a 3D dirt track");
  renderer.domElement.setAttribute("role", "img");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbfeafa, 38, 100);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 140);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa78b61, 2.6));
  const sunlight = new THREE.DirectionalLight(0xfff2ce, 2.5);
  sunlight.position.set(-8, 16, 6); scene.add(sunlight);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  function mesh(geometry: THREE.BufferGeometry, color: number, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    geometries.add(geometry);
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    const item = new THREE.Mesh(geometry, materials.get(color)!);
    item.position.set(x, y, z); parent.add(item); return item;
  }
  function box(w: number, h: number, d: number, color: number, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    return mesh(new THREE.BoxGeometry(w, h, d), color, parent, x, y, z);
  }
  box(220, 0.2, 220, 0x91bd75, scene, 0, -0.2, -40);
  box(9, 0.12, 180, 0xd3a673, scene, 0, -0.02, -40);
  const truck = new THREE.Group(); scene.add(truck);
  box(2.15, 0.65, 3.7, 0xff8a25, truck, 0, 1.45);
  box(1.9, 0.95, 1.7, 0xffa12f, truck, 0, 2.2, 0.2);
  box(1.65, 0.6, 0.05, 0x214e68, truck, 0, 2.26, -0.68);
  for (const x of [-0.96, 0.96]) box(0.04, 0.6, 1.1, 0x214e68, truck, x, 2.26, 0.1);
  box(2.1, 0.23, 0.23, 0x214e68, truck, 0, 1.24, -1.97);
  box(1.2, 0.25, 0.06, 0x214e68, truck, 0, 1.58, -1.88);
  for (const x of [-0.8, 0.8]) box(0.38, 0.28, 0.08, 0xfff4a5, truck, x, 1.64, -1.9);
  const wheels: THREE.Group[] = [];
  for (const x of [-1.27, 1.27]) for (const z of [-1.2, 1.2]) {
    const wheel = new THREE.Group(); wheel.position.set(x, 0.78, z); truck.add(wheel); wheels.push(wheel);
    const tire = mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.6, 16), 0x243342, wheel);
    tire.rotation.z = Math.PI / 2;
    const hub = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.64, 12), 0x398dd1, wheel);
    hub.rotation.z = Math.PI / 2;
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      const tread = box(0.64, 0.14, 0.26, 0x364757, wheel, 0, Math.cos(a) * 0.76, Math.sin(a) * 0.76);
      tread.rotation.x = a;
    }
  }
  const shadow = mesh(new THREE.CircleGeometry(1.9, 24), 0xb68b5c, scene, 0, 0.07);
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, 1.3, 1);
  const scenery: { group: THREE.Group; offset: number }[] = [];
  for (let i = 0; i < 18; i++) {
    const group = new THREE.Group(); scene.add(group);
    const side = i % 2 ? -1 : 1;
    const x = side * (8 + (i % 3) * 3);
    mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.7, 7), 0x8c6745, group, x, 0.8);
    mesh(new THREE.ConeGeometry(1.6, 3.8, 7), i % 3 ? 0x418a68 : 0x68a06e, group, x, 3);
    box(0.22, 0.65, 1.4, 0xfff1ce, group, side * 4.5, 0.35);
    scenery.push({ group, offset: i * 6 });
  }
  for (const x of [-35, 30]) mesh(new THREE.ConeGeometry(20, 24, 5), 0x84aaa2, scene, x, 10, -75);
  const blocks = new THREE.Group(); scene.add(blocks);
  const pieces = [box(1.15, 1.15, 1.15, 0xf25e50, blocks, -0.65, 0.62), box(1.15, 1.15, 1.15, 0x389ff4, blocks, 0.65, 0.62), box(1.15, 1.15, 1.15, 0xffd35c, blocks, 0, 1.78)];
  let state: DriveState = { distance: 0, speed: 0, height: 0, verticalSpeed: 0 };
  let gas = false, jump = false, paused = document.hidden, disposed = false;
  let obstacle = 19, brokenAt = -1, time = 0, previous = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  function resize() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h); camera.aspect = w / h;
    camera.position.set(w < h ? 3 : 8, w < h ? 7 : 6, w < h ? 16 : 11);
    camera.lookAt(0, 1, w < h ? -3 : -7); camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const lost = (event: Event) => { event.preventDefault(); paused = true; gas = false; renderer.setAnimationLoop(null); onFailure(); };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.setAnimationLoop((stamp) => {
    const dt = previous ? Math.min((stamp - previous) / 1000, 0.05) : 0; previous = stamp;
    if (disposed || paused) return;
    time += dt;
    state = stepDrive(state, gas, jump, dt); jump = false;
    truck.position.y = state.height;
    truck.rotation.x = reduced.matches ? 0 : -state.verticalSpeed * 0.018;
    for (const wheel of wheels) wheel.rotation.x = -state.distance / 0.78;
    for (const item of scenery) item.group.position.z = ((state.distance + item.offset) % 108) - 90;
    blocks.position.z = state.distance - obstacle;
    if (brokenAt < 0 && blocks.position.z > -1.5 && blocks.position.z < 2 && state.height < 1.6) { brokenAt = time; onSmash(); }
    if (brokenAt >= 0) {
      const t = Math.min(time - brokenAt, 1.5);
      pieces.forEach((p, i) => { p.position.x = (i - 1) * (1 + t * 4); p.position.y = Math.max(0.6, 1 + 5 * t - 5 * t * t); p.rotation.set(t * (i + 1), 0, t * 2); });
      blocks.visible = !reduced.matches || t < 0.08;
    }
    if (blocks.position.z > 12) {
      obstacle += 28; brokenAt = -1; blocks.visible = true;
      pieces.forEach((p, i) => { p.position.set(i === 2 ? 0 : i ? 0.65 : -0.65, i === 2 ? 1.78 : 0.62, 0); p.rotation.set(0, 0, 0); });
    }
    // Keep telemetry on the canvas for accessibility tooling and interaction checks.
    renderer.domElement.dataset.speed = state.speed.toFixed(2);
    renderer.domElement.dataset.height = state.height.toFixed(2);
    renderer.domElement.dataset.distance = state.distance.toFixed(2);
    renderer.render(scene, camera);
  });
  return {
    gas(value: boolean) { gas = value; },
    jump() { if (!paused) jump = true; },
    pause(value: boolean) { paused = value; gas = false; jump = false; state.speed = 0; previous = 0; },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials.values()) material.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
