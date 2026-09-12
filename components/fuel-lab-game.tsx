'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';
import {FuelLab,MATERIAL,LAB_COLORS,newLabTruck,stepLabTruck,type Material,type Temperature} from '@/lib/fuel-lab';
import './fuel-lab-game.css';
import {LabIcon} from './lab-icon';
const TOOLS=[{id:MATERIAL.water,name:'Water',icon:'💧'},{id:MATERIAL.sand,name:'Sand',icon:'⏳'},{id:MATERIAL.ice,name:'Ice',icon:'🧊'},{id:MATERIAL.crystal,name:'Fuel crystals',icon:'💎'},{id:MATERIAL.wall,name:'Wall',icon:'🧱'},{id:MATERIAL.empty,name:'Erase',icon:'⌫'}];
const EXPERIMENTS=[{id:'power',name:'Power the truck',hint:'Pour water, then pretend fuel crystals. Catch the rising bubbles!'},{id:'mud',name:'Make mud',hint:'Pour sand and water. What changes?'},{id:'melt',name:'Melt ice',hint:'Add ice. Warm the bottom pad and watch it melt.'},{id:'steam',name:'Make vapor',hint:'Add water. Warm the bottom pad. Watch vapor rise!'},{id:'freeze',name:'Freeze water',hint:'Pour water. Cool the bottom pad to make ice.'}];
const FOUND:Record<string,string>={fizz:'The pretend crystals fizz in water!',power:'Bubbles filled the truck battery!',mud:'Sand and water made mud!',melt:'Warmth melted ice into water!',steam:'Warmth turned water into vapor!',freeze:'Cooling turned water into ice!',condense:'Cooling turned vapor into water!'};
function speak(text:string){try{const voice=new SpeechSynthesisUtterance(text);voice.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(voice);}catch{/* Visual directions remain available. */}}
export default function FuelLabGame(){
 const canvas=useRef<HTMLCanvasElement>(null),lab=useRef<FuelLab|null>(null),truck=useRef(newLabTruck());
 const tool=useRef<Material>(MATERIAL.water),held=useRef<number|null>(null),pausedRef=useRef(false),cursor=useRef({x:64,y:9});
 const [selected,setSelected]=useState<Material>(MATERIAL.water),[energy,setEnergy]=useState(0),[paused,setPaused]=useState(false),[temperature,setTemperature]=useState<Temperature>('off');
 const [goal,setGoal]=useState('power'),[discoveries,setDiscoveries]=useState<string[]>([]),[message,setMessage]=useState('What will happen when you mix them?'),[running,setRunning]=useState(false),[finished,setFinished]=useState(false);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;const ctx=element.getContext('2d');if(!ctx)return;
  const world=new FuelLab();lab.current=world;const pixels=document.createElement('canvas');pixels.width=world.width;pixels.height=world.height;
  const pixelContext=pixels.getContext('2d')!;const frame=pixelContext.createImageData(world.width,world.height);
  const colors=LAB_COLORS.map(color=>[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)]);
  let raf=0,last=0,accumulator=0,ui=0,found=0,hidden=document.hidden;
  const visibility=()=>{hidden=document.hidden;last=0;held.current=null;};const blur=()=>{hidden=true;last=0;held.current=null;};const focus=()=>{hidden=document.hidden;last=0;};
  function draw(){
   for(let i=0;i<world.cells.length;i++){const c=colors[world.cells[i]];frame.data[i*4]=c[0];frame.data[i*4+1]=c[1];frame.data[i*4+2]=c[2];frame.data[i*4+3]=255;}
   pixelContext.putImageData(frame,0,0);ctx!.imageSmoothingEnabled=false;ctx!.drawImage(pixels,0,0,768,440);
   ctx!.strokeStyle='#1679bf';ctx!.lineWidth=2;ctx!.beginPath();ctx!.arc(cursor.current.x*6,cursor.current.y*5,18,0,Math.PI*2);ctx!.stroke();
   ctx!.fillStyle='#674497';ctx!.fillRect(6,0,756,7);
   ctx!.fillStyle=world.temperature==='warm'?'#f4a13d':world.temperature==='cool'?'#73d8ef':'#7795a4';ctx!.fillRect(6,439,756,12);
   ctx!.fillStyle='#fff8e9';ctx!.fillRect(0,451,768,139);ctx!.fillStyle='#9fcf7e';ctx!.fillRect(0,550,768,40);
   ctx!.fillStyle='#b18352';ctx!.beginPath();ctx!.moveTo(290,550);ctx!.lineTo(345,521);ctx!.lineTo(370,550);ctx!.fill();
   ctx!.fillStyle='#315168';ctx!.fillRect(701,475,5,76);ctx!.fillStyle='#ffd85d';ctx!.fillRect(706,476,30,20);
   const t=truck.current,x=55+t.x*6.1,y=535-t.height*2;
   ctx!.save();ctx!.translate(x,y);ctx!.fillStyle='#238be0';ctx!.fillRect(-34,-28,65,22);ctx!.fillRect(-8,-47,31,23);ctx!.fillStyle='#c6efff';ctx!.fillRect(-3,-43,19,15);
   for(const wheel of [-22,23]){ctx!.fillStyle='#263e51';ctx!.beginPath();ctx!.arc(wheel,0,17,0,Math.PI*2);ctx!.fill();ctx!.fillStyle='#91acbb';ctx!.beginPath();ctx!.arc(wheel,0,8,0,Math.PI*2);ctx!.fill();}
   ctx!.restore();element!.dataset.tick=String(world.ticks);element!.dataset.power=String(world.energy);element!.dataset.particles=String(world.cells.filter(t=>t!==0&&t!==MATERIAL.wall).length);element!.dataset.truckFinished=String(t.finished);
  }
  function animate(stamp:number){const dt=last?Math.min((stamp-last)/1000,.05):0;last=stamp;
   if(!hidden&&!pausedRef.current){accumulator+=dt;while(accumulator>=1/30){if(held.current!==null)world.paint(cursor.current.x,cursor.current.y,tool.current,2);world.step();accumulator-=1/30;}
    const was=truck.current.finished;truck.current=stepLabTruck(truck.current,dt);
    if(!was&&truck.current.finished){setRunning(false);setFinished(true);setMessage('Good job, Collins! Your experiment powered the truck!');speak('Good job, Collins! Your experiment powered the truck!');}
   }
   ui+=dt;if(ui>.15){ui=0;setEnergy(world.energy);if(world.discoveries.size!==found){found=world.discoveries.size;const items=[...world.discoveries];setDiscoveries(items);if(items.length)setMessage(FOUND[items[items.length-1]]);}}
   draw();raf=requestAnimationFrame(animate);
  }
  raf=requestAnimationFrame(animate);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);window.addEventListener('focus',focus);
  return()=>{cancelAnimationFrame(raf);lab.current=null;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);try{speechSynthesis.cancel();}catch{}};
 },[]);
 function paint(event:PointerEvent<HTMLCanvasElement>){const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*128,y=(event.clientY-rect.top)/rect.height*590/440*88;if(y>=88)return;cursor.current={x,y};lab.current?.paint(x,y,tool.current,3);}
 function release(event:PointerEvent<HTMLCanvasElement>){if(held.current===event.pointerId)held.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
 function keyboard(event:KeyboardEvent<HTMLCanvasElement>){const directions:Record<string,[number,number]>={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};if(directions[event.key]){event.preventDefault();const [x,y]=directions[event.key];cursor.current={x:Math.max(4,Math.min(123,cursor.current.x+x)),y:Math.max(4,Math.min(80,cursor.current.y+y))};}else if(event.key===' '||event.key==='Enter'){event.preventDefault();lab.current?.paint(cursor.current.x,cursor.current.y,tool.current,4);}}
 function reset(){lab.current?.reset();truck.current=newLabTruck();setEnergy(0);setRunning(false);setFinished(false);setTemperature('off');setDiscoveries([]);setMessage('A fresh tank. What will you try?');}
 const experiment=EXPERIMENTS.find(e=>e.id===goal)!;
 return <main className="fuel-lab"><header><Link href="/">⌂ Home</Link><div><p>Collins’ little science garage</p><h1>Monster Truck Fuel Lab</h1></div><button onClick={()=>speak(experiment.hint)}>Hear ↗</button></header>
  <section className="lab-mission"><div><strong>{experiment.name} {(goal==='power'?finished:discoveries.includes(goal))?'★':''}</strong><p>{experiment.hint}</p></div><select aria-label="Choose experiment" value={goal} onChange={e=>{setGoal(e.target.value);setFinished(false)}}>{EXPERIMENTS.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></section>
  <div className="lab-layout"><section className="lab-workbench" aria-label="Experiment workbench"><div className="lab-tank-label">↑ Bubble collector · pretend truck power</div><canvas ref={canvas} width="768" height="590" tabIndex={0} aria-label="Experiment tank. Tap or drag to add the selected material. Arrow keys move the brush; Enter pours." onKeyDown={keyboard} onPointerDown={e=>{if(e.button!==0||held.current!==null)return;held.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);paint(e)}} onPointerMove={e=>{if(held.current===e.pointerId)paint(e)}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={()=>{held.current=null}}/>
   <p role="status" className="lab-observation">{message}</p></section>
   <aside className="lab-controls"><h2>Pick & pour</h2><div className="lab-materials">{TOOLS.map(item=><button key={item.id} aria-pressed={selected===item.id} onClick={()=>{tool.current=item.id;setSelected(item.id)}}><LabIcon kind={item.id}/>{item.name}</button>)}</div>
    <button className="lab-pour" onClick={()=>lab.current?.paint(64,9,tool.current,5)}>Pour {TOOLS.find(t=>t.id===selected)!.name} ↓</button>
    <div className="lab-temperature" aria-label="Bottom pad temperature">{(['off','warm','cool'] as const).map(t=><button key={t} aria-pressed={temperature===t} onClick={()=>{if(lab.current)lab.current.temperature=t;setTemperature(t)}}>{t==='off'?'Pad off':t==='warm'?'Warm ☀':'Cool ❄'}</button>)}</div>
    <label htmlFor="lab-power">Truck power · {energy}%</label><progress id="lab-power" value={energy} max={100}/>
    <button className="lab-test" disabled={energy<30||running||paused} onClick={()=>{if(lab.current?.usePower()){truck.current={...newLabTruck(),running:true};setEnergy(lab.current.energy);setRunning(true);setFinished(false);canvas.current?.scrollIntoView({block:'center',behavior:'instant'})}}}>{running?'Truck test running…':finished?'Test again! →':'Test truck! →'}</button>
    {energy<30&&!running&&<p className="lab-help">Collect 30 power to test the truck.</p>}
    <div className="lab-actions"><button onClick={()=>{pausedRef.current=!paused;setPaused(!paused)}}>{paused?'Resume ▶':'Pause Ⅱ'}</button><button onClick={reset}>Empty tank ↻</button></div>
    <p className="lab-note">Fuel crystals and truck power are pretend. Explore gravity, flow, warming, and cooling.</p>
   </aside></div>
 </main>;
}
