import * as THREE from "three";
import { roadPosition, roadHeading } from "./road";
import { stepDrive, stepSpring, type DriveState } from "./drive-physics";
import { loadModel, makeAssetTruck, makeSceneryBatch, disposeModels } from "./model-assets";
import { toyKit, makeTruck, makeBarn } from "./toy-models";
import { BARN_DISTANCE, PICKUPS, deliveryAt, type DeliverySnapshot } from "./delivery";
import { getLevel, terrainHeight } from './levels';
import { decorateLevel, destination } from './level-scenery';

type Events = { collect: (count: number) => void; arrive: () => void; failure: () => void };
export function createDriveWorld(host: HTMLElement, events: Events, initial: DeliverySnapshot) {
  const level = getLevel(initial.level);
  const elevation = (distance: number) => terrainHeight(distance, level.id);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(level.sky);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-label", `Blue monster truck in ${level.name}, delivering letters to the ${level.destination}`);
  renderer.domElement.dataset.level = level.id;
  renderer.domElement.setAttribute("role", "img"); host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(level.sky, 45, 110);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 150);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa78b61, 1.8));
  const sun = new THREE.DirectionalLight(0xfff2ce, 2.5);sun.position.set(-8,16,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-16,right:16,top:18,bottom:-18,near:1,far:65});sun.shadow.normalBias=.04;scene.add(sun);
  const k = toyKit();
  k.box(220,.2,220,level.ground,scene,0,-.2,-40,0).receiveShadow=true;
  const landmarks = decorateLevel(k, level.id, scene);
  const roadGeometry=new THREE.BufferGeometry();
  const roadVertices=new Float32Array(121*2*3),roadIndices:number[]=[];
  for(let i=0;i<120;i++){const a=i*2;roadIndices.push(a,a+1,a+2,a+1,a+3,a+2);}
  roadGeometry.setAttribute('position',new THREE.BufferAttribute(roadVertices,3).setUsage(THREE.DynamicDrawUsage));
  roadGeometry.setIndex(roadIndices);
  const road=k.mesh(roadGeometry,level.road,scene);road.receiveShadow=true;road.frustumCulled=false;
  let truck=makeTruck(k, initial.word);scene.add(truck.root);
  const shadow=k.mesh(new THREE.CircleGeometry(2,24),0xb68b5c,scene,0,.07);shadow.rotation.x=-Math.PI/2;shadow.scale.y=1.3;
  const cargo = Array.from({length:3},(_,i)=>{const group=new THREE.Group();group.position.set((i-1)*.5,2,1.6);truck.body.add(group);k.box(.43,.43,.43,0xffd768,group);k.label(initial.word[i],'#ffe8a0',.32,.32,group,0,0,.22);return group;});
  const scenery:{group:THREE.Group;tree:THREE.Group;x:number;offset:number;variation:number}[]=[];
  for(let i=0;i<14;i++){
    const group=new THREE.Group();scene.add(group);const side=i%2?-1:1,x=side*(8+(i%3)*3);
    const tree=new THREE.Group();tree.position.x=x;group.add(tree);
    tree.visible = level.id !== 'moon' && level.id !== 'snow';
    k.mesh(new THREE.CylinderGeometry(.23,.33,1.8,7),0x8c6745,tree,0,.85);
    k.ball(1.65,i%3?0x549d72:0x78af70,tree,0,2.9).scale.y=1.25;
    for(const z of [0,3])k.box(.2,.9,.2,0xffecc7,group,side*4.8,.45,z);
    k.box(.14,.17,3.2,0xffecc7,group,side*4.8,.65,1.5);
    scenery.push({group,tree,x,offset:i*8,variation:i%4});
  }
  for(const x of [-35,30])k.mesh(new THREE.ConeGeometry(20,24,5),level.id==='snow'?0xf4faff:level.id==='moon'?0x787d99:0x84aaa2,scene,x,10,-80);
  const bridge=new THREE.Group();scene.add(bridge);
  bridge.visible = level.id === 'farm' || level.id === 'snow';
  k.box(45,.05,8,level.id==='snow'?0xbee9fa:0x68bad0,bridge,0,.09,0,0);
  for(let i=0;i<12;i++) k.box(9,.25,.62,level.id==='snow'?0xd2f3ff:0xad8053,bridge,0,.2,(i-5.5)*.66,.04);
  for(const x of [-4.4,4.4]){k.box(.16,.2,9,0xffedc4,bridge,x,1.2);for(const z of [-4,0,4])k.box(.24,1.25,.24,0xffedc4,bridge,x,.65,z);}
  const pickups=PICKUPS.map((position,i)=>{
    const group=new THREE.Group();scene.add(group);k.box(1.7,1.7,1.7,[0xf5b24b,0x67b9da,0xf49d83][i],group,0,1.3,0,.16);
    k.label(initial.word[i],'#fff1ce',1.3,1.3,group,0,1.3,.86);
    const reverse=k.label(initial.word[i],'#fff1ce',1.3,1.3,group,0,1.3,-.86);reverse.rotation.y=Math.PI;
    return {group,position};
  });
  const barn=makeBarn(k, initial.word);scene.add(barn.root);
  barn.root.visible = level.id === 'farm';
  const goal = level.id === 'farm' ? barn.root : destination(k, level.id, initial.word);
  if (goal !== barn.root) scene.add(goal);
  const dust=Array.from({length:8},()=>{const p=k.ball(.14,0xdfbd86,scene);p.visible=false;return p;});
  let state:DriveState={distance:initial.distance,speed:0,height:0,verticalSpeed:0};
  let phase=initial.phase,collected=initial.collected;
  let gas=false,jump=false,paused=document.hidden,disposed=false;
  let time=0,previous=0,celebration=initial.phase==='delivered'?2:0;
  let suspension={offset:0,velocity:0},pitch={offset:0,velocity:0},roll={offset:0,velocity:0};
  const surface=(distance:number)=>elevation(distance)+(bridge.visible?Math.max(0,1-Math.abs(distance-110)/5)*.26:0);
  const retired:THREE.Object3D[]=[];
  const forests:ReturnType<typeof makeSceneryBatch>[]=[];
  const loading=new AbortController();const loadTimeout=setTimeout(()=>loading.abort(),10000);
  const models = level.id === 'moon' ? ['truck','wheel-tractor-dark-back','space-satelliteDish','space-rock_largeA','space-rock_crystalsLargeA'] : ['truck','wheel-tractor-dark-back','tree_oak','tree_pineRoundA','rock_largeA'];
  void Promise.allSettled(models.map(name=>loadModel(name,loading.signal))).then(results=>{
    clearTimeout(loadTimeout);
    const assets=results.map(result=>result.status==='fulfilled'?result.value:null);
    if(disposed){disposeModels(assets.filter((asset):asset is THREE.Group=>asset!==null));return;}
    retired.push(...assets.filter((asset):asset is THREE.Group=>asset!==null));
    if(assets[0]&&assets[1]){
      try {
        const upgraded=makeAssetTruck(assets[0],assets[1],k,initial.word);
        cargo.forEach(item=>{upgraded.body.add(item);item.position.y=1.65;});
        retired.push(truck.root);scene.remove(truck.root);truck=upgraded;scene.add(truck.root);
        renderer.domElement.dataset.truckModel='kenney';
      } catch { /* Keep the original playable truck if an asset is incompatible. */ }
    }
    for(const variant of [0,1]){
      if(level.id==='snow')continue;
      const template=assets[variant+2];if(!template)continue;
      const sites=scenery.filter((_,i)=>i%2===variant);sites.forEach(site=>site.tree.visible=false);
      forests.push(makeSceneryBatch(template,sites,scene,level.id==='moon'?(variant?1.5:4):variant?4.7:4.1));
    }
    if(assets[4])forests.push(makeSceneryBatch(assets[4],scenery.filter((_,i)=>i%3===0).map(site=>({...site,x:site.x*.7,offset:site.offset+4})),scene,.6));
    renderer.domElement.dataset.natureModels=String(forests.length);
  });
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
    const oldSpeed=state.speed;
    state.impact=0;
    if(phase==='driving'){
      state=stepDrive(state,gas,jump,dt,level,surface);
      const delivery=deliveryAt(state.distance);
      if(delivery.collected>collected){collected=delivery.collected;events.collect(collected);}
      if(delivery.arrived){phase='tracing';state.distance=BARN_DISTANCE-12;state.speed=0;state.height=0;state.verticalSpeed=0;gas=false;events.arrive();}
    }
    jump=false;
    truck.root.position.y=state.height+surface(state.distance);
    const slope=Math.atan((surface(state.distance+1.2)-surface(state.distance-1.2))/2.4);
    const acceleration=dt>0?(state.speed-oldSpeed)/dt:0;
    suspension=stepSpring(suspension,state.height>0?.06:Math.sin(state.distance*2)*.025*(state.speed/12),dt,-Math.min(2.5,(state.impact??0)*.16));
    pitch=stepSpring(pitch,state.height>0?Math.max(-.22,Math.min(.22,state.verticalSpeed*.025)):slope-acceleration*.009,dt);
    const turn=(roadHeading(state.distance+.5)-roadHeading(state.distance-.5))*state.speed;
    roll=stepSpring(roll,Math.max(-.12,Math.min(.12,turn*state.speed*.018)),dt);
    truck.root.rotation.x=reduced.matches?(state.height===0?slope:0):pitch.offset;
    shadow.position.y = .07 + surface(state.distance);
    truck.root.rotation.y=roadHeading(state.distance);
    for(let i=0;i<=120;i++){
      const z=20-i,center=roadPosition(state.distance-z,state.distance);
      for(let side=0;side<2;side++){const n=(i*2+side)*3;roadVertices[n]=center.x+(side?4.5:-4.5);roadVertices[n+1]=.04+elevation(state.distance-z);roadVertices[n+2]=z;}
    }
    roadGeometry.attributes.position.needsUpdate=true;roadGeometry.computeVertexNormals();
    truck.body.position.y=reduced.matches?0:suspension.offset;
    truck.body.rotation.x=0;
    truck.body.rotation.z=reduced.matches?0:roll.offset;
    for(const spring of truck.springs)spring.scale.y=1+(reduced.matches?0:suspension.offset+Math.sign(spring.position.x)*roll.offset*.4);
    for(const wheel of truck.wheels)wheel.rotation.x=-state.distance/.8;
    shadow.scale.set(1-state.height*.1,1.3-state.height*.1,1);
    for(const item of scenery){
      const z=((state.distance+item.offset)%112)-94,position=state.distance-z,center=roadPosition(position,state.distance);
      item.group.position.set(center.x,0,z);item.group.rotation.y=roadHeading(position);
    }
    for(const forest of forests)forest.update(state.distance);
    const bridgeCenter=roadPosition(110,state.distance);
    bridge.position.set(bridgeCenter.x,elevation(110),bridgeCenter.z);bridge.rotation.y=roadHeading(110);
    pickups.forEach((item,i)=>{const center=roadPosition(item.position,state.distance);item.group.position.set(center.x,elevation(item.position),center.z);item.group.rotation.y=roadHeading(item.position);item.group.visible=i>=collected;});
    for(const landmark of landmarks){const center=roadPosition(landmark.distance,state.distance);landmark.root.position.set(center.x+landmark.side,0,center.z);}
    cargo.forEach((item,i)=>item.visible=i<collected&&phase!=='delivered');
    const barnCenter=roadPosition(BARN_DISTANCE,state.distance);
    barn.root.position.set(barnCenter.x,0,barnCenter.z);barn.root.rotation.y=roadHeading(BARN_DISTANCE);
    goal.position.copy(barn.root.position);goal.rotation.y=barn.root.rotation.y;
    if(phase==='delivered')celebration=Math.min(2,celebration+dt);
    const opened=reduced.matches&&phase==='delivered'?1:Math.min(1,celebration);
    barn.doors[0].rotation.y=-opened*1.8;barn.doors[1].rotation.y=opened*1.8;
    barn.glow.intensity=opened*12;barn.sheep.visible=phase==='delivered';
    barn.sheep.position.z=2.7+opened*5.5;barn.sheep.position.x=opened*2.2;
    barn.sheep.position.y=reduced.matches?0:Math.abs(Math.sin(celebration*7))*Math.max(0,1-celebration/2)*.25;
    dust.forEach((p,i)=>{p.visible=!reduced.matches&&phase==='driving'&&state.speed>2&&state.height<.3;const cycle=(time*1.8+i/8)%1;p.position.set((i%2?1:-1)*(1.2+cycle*.6),elevation(state.distance)+.15+cycle*.5,1.5+cycle*3);p.scale.setScalar((1-cycle)*1.6);});
    renderer.domElement.dataset.speed=state.speed.toFixed(2);renderer.domElement.dataset.height=state.height.toFixed(2);
    renderer.domElement.dataset.suspension=suspension.offset.toFixed(3);
    renderer.domElement.dataset.distance=state.distance.toFixed(2);renderer.domElement.dataset.phase=phase;renderer.domElement.dataset.collected=String(collected);renderer.domElement.dataset.word=initial.word;
    renderer.render(scene,camera);
  });
  return {
    start(){if(phase==='intro')phase='driving';},
    finish(){if(phase==='tracing')phase='delivered';},
    gas(value:boolean){gas=phase==='driving'&&value;},
    jump(){if(!paused&&phase==='driving')jump=true;},
    pause(value:boolean){paused=value;gas=false;jump=false;state.speed=0;previous=0;},
    snapshot():DeliverySnapshot{return {distance:state.distance,collected,phase,word:initial.word,traceIndex:initial.traceIndex,level:level.id};},
    dispose(){
      disposed=true;renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);
      loading.abort();clearTimeout(loadTimeout);disposeModels([scene,...retired]);
      // Canvas-generated sign textures also belong to this scene.
      k.textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
