import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Original procedural toy models: no external models or texture downloads.
export function toyKit() {
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  const textures: THREE.Texture[] = [];
  function mesh(geometry: THREE.BufferGeometry, color: number, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.68 }));
    const result = new THREE.Mesh(geometry, materials.get(color)!);
    result.position.set(x, y, z); parent.add(result); return result;
  }
  function box(w: number, h: number, d: number, color: number, parent: THREE.Object3D, x = 0, y = 0, z = 0, round = 0.08) {
    return mesh(round ? new RoundedBoxGeometry(w, h, d, 2, Math.min(round, w / 4, h / 4, d / 4)) : new THREE.BoxGeometry(w, h, d), color, parent, x, y, z);
  }
  function ball(size: number, color: number, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    return mesh(new THREE.SphereGeometry(size, 12, 8), color, parent, x, y, z);
  }
  function label(text: string, background: string, width: number, height: number, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#17394b"; ctx.font = `900 ${text.length > 2 ? 48 : 170}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 128, 138);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .8 });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material); plane.position.set(x,y,z); parent.add(plane); return plane;
  }
  return { mesh, box, ball, label, textures };
}
export type ToyKit = ReturnType<typeof toyKit>;

export function makeTruck(k: ToyKit) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  k.box(2.2, .6, 3.8, 0xf89735, body, 0, 1.48, 0, .18);
  k.box(2.12, .16, 3.6, 0x2c7dad, body, 0, 1.17);
  k.box(1.85, .22, 1.65, 0xffb952, body, 0, 1.86, -1, .1);
  // Open cab and rounded roof make the little driver visible from either side.
  k.box(1.87, .3, 1.65, 0xf89735, body, 0, 1.97, .45);
  for (const x of [-.84,.84]) for (const z of [-.3,1.14]) k.box(.15,1.02,.15,0xf89735,body,x,2.51,z,.04);
  k.box(2.02,.23,1.85,0x2c7dad,body,0,3.03,.42,.1);
  k.box(1.55,.07,1.5,0xf7d877,body,0,3.18,.42,.03);
  k.box(1.55,.66,.07,0x5cabc0,body,0,2.57,-.37,.02);
  k.box(.62,.58,.52,0x263f52,body,0,2.3,.8);
  k.ball(.31,0xe9b987,body,0,2.59,.44);
  const helmet=k.ball(.35,0x2c7dad,body,0,2.78,.44);helmet.scale.y=.68;
  k.box(.74,.09,.7,0x2c7dad,body,0,2.75,.38,.04);
  for(const x of [-.1,.1])k.ball(.035,0x17394b,body,x,2.6,.72);
  k.box(.42,.37,.36,0xe24f43,body,0,2.2,.43);
  k.box(2.35,.25,.28,0xcbd6db,body,0,1.22,-2.02);
  k.box(2.35,.25,.28,0xcbd6db,body,0,1.22,2.02);
  k.box(1.15,.37,.1,0x263f52,body,0,1.63,-1.95);
  for (let i=0;i<5;i++)k.box(.06,.26,.06,0xcbd6db,body,-.42+i*.21,1.64,-2.02,.01);
  for(const x of [-.84,.84]) {
    k.ball(.2,0xfff1ad,body,x,1.69,-1.91).scale.z=.35;
    k.box(.27,.21,.08,0xe44e42,body,x,1.55,1.96);
    const exhaust=k.mesh(new THREE.CylinderGeometry(.09,.09,1.1,8),0xcbd6db,body,x,2.4,1.52);
    exhaust.rotation.z=x>0?-.08:.08;
  }
  k.label("L", "#ffedac", .7,.65,body,0,1.57,1.92);
  const wheels:THREE.Group[]=[],springs:THREE.Object3D[]=[];
  for(const x of [-1.26,1.26])for(const z of [-1.22,1.22]) {
    const wheel=new THREE.Group();wheel.position.set(x,.8,z);root.add(wheel);wheels.push(wheel);
    const tire=k.mesh(new THREE.CylinderGeometry(.8,.8,.65,20),0x253741,wheel);tire.rotation.z=Math.PI/2;
    const hub=k.mesh(new THREE.CylinderGeometry(.43,.43,.7,16),0x2c7dad,wheel);hub.rotation.z=Math.PI/2;
    const axle=k.mesh(new THREE.CylinderGeometry(.17,.17,.74,10),0xe1e8e8,wheel);axle.rotation.z=Math.PI/2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const tread=k.box(.68,.13,.23,0x3a4b51,wheel,0,Math.cos(a)*.8,Math.sin(a)*.8,.025);tread.rotation.x=a;}
    const springRoot=new THREE.Group();springRoot.position.set(x*.64,.75,z);root.add(springRoot);springs.push(springRoot);
    const points=Array.from({length:49},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/4)*.16,i/48*.72,Math.sin(i*Math.PI/4)*.16));
    k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.035,5,false),0xdce4de,springRoot);
  }
  return {root,body,wheels,springs};
}

export function makeBarn(k:ToyKit) {
  const root=new THREE.Group();
  k.box(9,5.6,6,0xb94f40,root,0,2.8,0,.12);
  for(let x=-4;x<=4;x+=.7)k.box(.08,5.5,.08,0xd5684b,root,x,2.8,3.06,.02);
  // Solid front/back gables close the space beneath the roof.
  for (const side of [-1, 1]) {
    const gable = new THREE.BufferGeometry();
    const points = side === 1 ? [-4.5,5.6,3.02, 4.5,5.6,3.02, 0,7.95,3.02] : [4.5,5.6,-3.02, -4.5,5.6,-3.02, 0,7.95,-3.02];
    gable.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    gable.computeVertexNormals(); k.mesh(gable, 0xb94f40, root);
  }
  // Gabled roof with two broad toy-like slabs.
  for(const side of [-1,1]){const roof=k.box(5.5,.3,7,0x355465,root,side*2.1,6.55,0,.08);roof.rotation.z=-side*.55;}
  k.box(4.5,4.4,.15,0x303c34,root,0,2.2,3.15);
  const doors:THREE.Group[]=[];
  for(const side of [-1,1]) {
    const pivot=new THREE.Group();pivot.position.set(side*2.1,0,3.3);root.add(pivot);doors.push(pivot);
    k.box(2.1,4.2,.18,0xc95743,pivot,-side*1.05,2.1,0);
    for(const y of [.15,4.05])k.box(2.1,.15,.12,0xfff1d1,pivot,-side*1.05,y,.14);
    for(const x of [-side*.1,-side*2])k.box(.15,4.1,.12,0xfff1d1,pivot,x,2.1,.14);
    const brace=k.box(.13,4.5,.12,0xfff1d1,pivot,-side*1.05,2.1,.15);brace.rotation.z=side*.43;
  }
  k.label("L", "#fff1ce", 1.35,1.35,root,0,5.12,3.17);
  for(const x of [-4.55,4.55])k.box(.22,5.6,.22,0xfff1d1,root,x,2.8,3.1);
  const lamp=k.ball(.32,0xffd768,root,0,4.3,3.55);
  const glow=new THREE.PointLight(0xffda73,0,12);glow.position.set(0,3,4);root.add(glow);
  const sheep=new THREE.Group();sheep.position.set(0,0,2.7);root.add(sheep);sheep.visible=false;
  k.ball(.9,0xfff1d5,sheep,0,1.1,0).scale.set(1,1,1.3);
  for(const x of [-.55,.55])for(const z of [-.65,.65]) k.box(.22,.65,.22,0x405058,sheep,x,.4,z);
  k.ball(.54,0x54616a,sheep,0,1.55,.95);
  for(const x of [-.23,.23]){k.ball(.12,0xffffff,sheep,x,1.69,1.4);k.ball(.06,0x17394b,sheep,x,1.68,1.5);k.ball(.21,0x54616a,sheep,x*2.5,1.76,.9).scale.set(1.7,.5,1);}
  for(const [x,y,z] of [[-.5,1.7,.1],[.5,1.7,.1],[0,1.95,0],[0,1.9,.8],[-.7,1.1,-.6],[.7,1.1,-.6]])k.ball(.42,0xfff5df,sheep,x,y,z);
  return {root,doors,sheep,lamp,glow};
}
