import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { ToyKit } from './toy-models';

export function disposeModels(roots: THREE.Object3D[]) {
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
  const bitmaps=new Set<ImageBitmap>();
  for(const root of roots)root.traverse(object=>{
    if(object instanceof THREE.InstancedMesh)object.dispose();
    if(object instanceof THREE.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));}
  });
  for(const material of materials)for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);
  for(const texture of textures){if(typeof ImageBitmap!=='undefined'&&texture.image instanceof ImageBitmap)bitmaps.add(texture.image);texture.dispose();}
  bitmaps.forEach(b=>b.close());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
export async function loadModel(name:string,signal:AbortSignal) {
  const response=await fetch(`/assets/models/${name}.glb`,{signal});
  if(!response.ok)throw new Error('Model unavailable');
  const model=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
  if(signal.aborted){disposeModels([model.scene]);throw new Error('Model load cancelled');}
  model.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
  return model.scene;
}
export function makeAssetTruck(source:THREE.Group,tire:THREE.Group,k:ToyKit,letter:string) {
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const shell=source.getObjectByName('body');
  if(!shell)throw new Error('Truck body missing');
  const painted=new THREE.Group();painted.add(shell);painted.rotation.y=Math.PI;painted.scale.setScalar(1.45);painted.position.y=.7;body.add(painted);
  k.box(2.12,.14,3.5,0x2c7dad,body,0,1.05);
  k.label(letter,'#ffedac',.65,.55,body,0,1.3,2.17);
  const wheels:THREE.Group[]=[],springs:THREE.Object3D[]=[];
  for(const x of [-1.18,1.18])for(const z of [-1.25,1.1]) {
    const pivot=new THREE.Group();pivot.position.set(x,.8,z);root.add(pivot);wheels.push(pivot);
    const wheel=tire.clone(true);wheel.scale.set(1.35,1.83,1.83);pivot.add(wheel);
    const spring=new THREE.Group();spring.position.set(x*.7,.8,z);root.add(spring);springs.push(spring);
    const points=Array.from({length:33},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/4)*.13,i/32*.5,Math.sin(i*Math.PI/4)*.13));
    k.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.035,5,false),0xdce4de,spring);
  }
  return {root,body,wheels,springs};
}
export type ScenerySite={x:number;offset:number;variation:number};
export function makeSceneryBatch(template:THREE.Group,sites:ScenerySite[],scene:THREE.Scene,height:number) {
  template.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(template),size=bounds.getSize(new THREE.Vector3());
  const scale=height/Math.max(size.y,.01),center=bounds.getCenter(new THREE.Vector3());
  const normalization=new THREE.Matrix4().makeScale(scale,scale,scale).multiply(new THREE.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
  const batches:{mesh:THREE.InstancedMesh;local:THREE.Matrix4}[]=[];
  template.traverse(object=>{if(object instanceof THREE.Mesh){
    const mesh=new THREE.InstancedMesh(object.geometry,object.material,sites.length);
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);
    batches.push({mesh,local:normalization.clone().multiply(object.matrixWorld)});
  }});
  const pose=new THREE.Object3D(),matrix=new THREE.Matrix4();
  return {update(distance:number){
    sites.forEach((site,index)=>{
      pose.position.set(site.x,0,((distance+site.offset)%112)-94);pose.rotation.y=site.variation*1.7;pose.scale.setScalar(.85+site.variation*.08);pose.updateMatrix();
      for(const batch of batches)batch.mesh.setMatrixAt(index,matrix.multiplyMatrices(pose.matrix,batch.local));
    });
    for(const batch of batches)batch.mesh.instanceMatrix.needsUpdate=true;
  }};
}
