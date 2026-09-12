import * as THREE from "three";
import { stepDrive, type DriveState } from "./drive-physics";
import { toyKit, makeTruck, makeBarn } from "./toy-models";
import { BARN_DISTANCE, PICKUPS, deliveryAt, type DeliverySnapshot } from "./delivery";

type Events = { collect: (count: number) => void; arrive: () => void; failure: () => void };
export function createDriveWorld(host: HTMLElement, events: Events, initial: DeliverySnapshot) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0xbfeafa);
  renderer.domElement.setAttribute("aria-label", "Toy monster truck delivering letter L blocks to a red barn");
  renderer.domElement.setAttribute("role", "img"); host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xbfeafa, 45, 110);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 150);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa78b61, 2.4));
  const sun = new THREE.DirectionalLight(0xfff2ce, 2.5);sun.position.set(-8,16,6);scene.add(sun);
  const k = toyKit();
  k.box(220,.2,220,0x99c781,scene,0,-.2,-40,0);
  k.box(9,.12,180,0xd3a673,scene,0,-.02,-40,0);
  const truck=makeTruck(k);scene.add(truck.root);
  const shadow=k.mesh(new THREE.CircleGeometry(2,24),0xb68b5c,scene,0,.07);shadow.rotation.x=-Math.PI/2;shadow.scale.y=1.3;
  const cargo = Array.from({length:3},(_,i)=>{const group=new THREE.Group();group.position.set((i-1)*.5,2,1.6);truck.body.add(group);k.box(.43,.43,.43,0xffd768,group);k.label('L','#ffe8a0',.32,.32,group,0,0,.22);return group;});
  const scenery:{group:THREE.Group;offset:number}[]=[];
  for(let i=0;i<14;i++){
    const group=new THREE.Group();scene.add(group);const side=i%2?-1:1,x=side*(8+(i%3)*3);
    k.mesh(new THREE.CylinderGeometry(.23,.33,1.8,7),0x8c6745,group,x,.85);
    k.ball(1.65,i%3?0x549d72:0x78af70,group,x,2.9).scale.y=1.25;
    for(const z of [0,3])k.box(.2,.9,.2,0xffecc7,group,side*4.8,.45,z);
    k.box(.14,.17,3.2,0xffecc7,group,side*4.8,.65,1.5);
    scenery.push({group,offset:i*8});
  }
  for(const x of [-35,30])k.mesh(new THREE.ConeGeometry(20,24,5),0x84aaa2,scene,x,10,-80);
  const bridge=new THREE.Group();scene.add(bridge);
  k.box(45,.05,8,0x68bad0,bridge,0,.09,0,0);
  for(let i=0;i<12;i++) k.box(9,.25,.62,0xad8053,bridge,0,.2,(i-5.5)*.66,.04);
  for(const x of [-4.4,4.4]){k.box(.16,.2,9,0xffedc4,bridge,x,1.2);for(const z of [-4,0,4])k.box(.24,1.25,.24,0xffedc4,bridge,x,.65,z);}
  const pickups=PICKUPS.map((position,i)=>{
    const group=new THREE.Group();scene.add(group);k.box(1.7,1.7,1.7,[0xf5b24b,0x67b9da,0xf49d83][i],group,0,1.3,0,.16);
    k.label('L','#fff1ce',1.3,1.3,group,0,1.3,.86);
    const reverse=k.label('L','#fff1ce',1.3,1.3,group,0,1.3,-.86);reverse.rotation.y=Math.PI;
    return {group,position};
  });
  const barn=makeBarn(k);scene.add(barn.root);
  const dust=Array.from({length:8},()=>{const p=k.ball(.14,0xdfbd86,scene);p.visible=false;return p;});
  let state:DriveState={distance:initial.distance,speed:0,height:0,verticalSpeed:0};
  let phase=initial.phase,collected=initial.collected;
  let gas=false,jump=false,paused=document.hidden,disposed=false;
  let time=0,previous=0,landing=0,celebration=initial.phase==='delivered'?2:0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h);camera.aspect=w/h;
    camera.position.set(w<h?3:8,w<h?7:6,w<h?17:12);
    camera.lookAt(0,1,w<h?-3:-7);camera.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const lost=(e:Event)=>{e.preventDefault();paused=true;gas=false;state.speed=0;renderer.setAnimationLoop(null);events.failure();};
  renderer.domElement.addEventListener('webglcontextlost',lost);
  renderer.setAnimationLoop(stamp=>{
    const dt=previous?Math.min((stamp-previous)/1000,.05):0;previous=stamp;
    if(disposed||paused)return;
    time+=dt;
    if(phase==='driving'){
      const oldHeight=state.height;
      state=stepDrive(state,gas,jump,dt);
      if(oldHeight>0&&state.height===0)landing=.16;
      const delivery=deliveryAt(state.distance);
      if(delivery.collected>collected){collected=delivery.collected;events.collect(collected);}
      if(delivery.arrived){phase='tracing';state.distance=BARN_DISTANCE-12;state.speed=0;state.height=0;state.verticalSpeed=0;gas=false;events.arrive();}
    }
    jump=false;landing=Math.max(0,landing-dt*.8);
    const bridgeHeight=phase==='driving'?Math.max(0,1-Math.abs(state.distance-110)/5)*.26:0;
    truck.root.position.y=state.height+bridgeHeight;
    truck.body.position.y=reduced.matches?0:-landing+(state.speed>0?Math.sin(state.distance*2)*.025:0);
    truck.body.rotation.x=reduced.matches?0:-state.verticalSpeed*.012;
    for(const spring of truck.springs)spring.scale.y=1+(reduced.matches?0:truck.body.position.y);
    for(const wheel of truck.wheels)wheel.rotation.x=-state.distance/.8;
    shadow.scale.set(1-state.height*.1,1.3-state.height*.1,1);
    for(const item of scenery)item.group.position.z=((state.distance+item.offset)%112)-94;
    bridge.position.z=state.distance-110;
    pickups.forEach((item,i)=>{item.group.position.z=state.distance-item.position;item.group.visible=i>=collected;});
    cargo.forEach((item,i)=>item.visible=i<collected&&phase!=='delivered');
    barn.root.position.z=state.distance-BARN_DISTANCE;
    if(phase==='delivered')celebration=Math.min(2,celebration+dt);
    const opened=reduced.matches&&phase==='delivered'?1:Math.min(1,celebration);
    barn.doors[0].rotation.y=-opened*1.8;barn.doors[1].rotation.y=opened*1.8;
    barn.glow.intensity=opened*12;barn.sheep.visible=phase==='delivered';
    barn.sheep.position.z=2.7+opened*5.5;barn.sheep.position.x=opened*2.2;
    barn.sheep.position.y=reduced.matches?0:Math.abs(Math.sin(celebration*7))*Math.max(0,1-celebration/2)*.25;
    dust.forEach((p,i)=>{p.visible=!reduced.matches&&phase==='driving'&&state.speed>2&&state.height<.3;const cycle=(time*1.8+i/8)%1;p.position.set((i%2?1:-1)*(1.2+cycle*.6),.15+cycle*.5,1.5+cycle*3);p.scale.setScalar((1-cycle)*1.6);});
    renderer.domElement.dataset.speed=state.speed.toFixed(2);renderer.domElement.dataset.height=state.height.toFixed(2);
    renderer.domElement.dataset.distance=state.distance.toFixed(2);renderer.domElement.dataset.phase=phase;renderer.domElement.dataset.collected=String(collected);
    renderer.render(scene,camera);
  });
  return {
    start(){if(phase==='intro')phase='driving';},
    finish(){if(phase==='tracing')phase='delivered';},
    gas(value:boolean){gas=phase==='driving'&&value;},
    jump(){if(!paused&&phase==='driving')jump=true;},
    pause(value:boolean){paused=value;gas=false;jump=false;state.speed=0;previous=0;},
    snapshot():DeliverySnapshot{return {distance:state.distance,collected,phase};},
    dispose(){
      disposed=true;renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
      scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(m=>materials.add(m));}});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());k.textures.forEach(t=>t.dispose());
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
