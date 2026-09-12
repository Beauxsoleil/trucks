"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SmashAudio } from "@/lib/smash-audio";
import { TraceBoard } from "@/components/trace-board";
import { LETTERS, STORAGE_KEY, parseProgress, saveProgress, type LetterName } from "@/lib/trace-letters";
import { chooseDeliveryLetter, type DeliverySnapshot, type MissionPhase } from "@/lib/delivery";
import type { createDriveWorld } from "@/lib/drive-world";
import "./smash-game.css";
import "./trace-game.css";

type World=ReturnType<typeof createDriveWorld>;
const newMission=(letter:LetterName):DeliverySnapshot=>({distance:0,collected:0,phase:'intro',letter});
function speak(text:string){
  try{if('speechSynthesis' in window&&'SpeechSynthesisUtterance' in window){window.speechSynthesis.cancel();const words=new SpeechSynthesisUtterance(text);words.lang='en-US';words.rate=.85;window.speechSynthesis.speak(words);}}catch{/* Text and pictures remain available. */}
}
export default function SmashGame(){
  const host=useRef<HTMLDivElement>(null),tracePanel=useRef<HTMLElement>(null);
  const world=useRef<World|null>(null),audio=useRef<SmashAudio|null>(null);
  const inputs=useRef(new Set<string>()),recovery=useRef<DeliverySnapshot|null>(null);
  const phaseRef=useRef<MissionPhase>('intro');
  const [letter,setLetter]=useState<LetterName>('A');
  const [phase,setPhase]=useState<MissionPhase>('intro');
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[gas,setGas]=useState(false);
  const [collected,setCollected]=useState(0),[attempt,setAttempt]=useState(0);
  function changePhase(value:MissionPhase){phaseRef.current=value;setPhase(value);}
  function accelerate(id:string,down:boolean){
    if(!world.current||phaseRef.current!=='driving')return;
    if(down)inputs.current.add(id);else inputs.current.delete(id);
    const pressed=inputs.current.size>0;world.current.gas(pressed);setGas(pressed);
    if(down){audio.current?.unlock();audio.current?.play('rev',.18);}if(!pressed)audio.current?.stop();
  }
  function jump(){if(phaseRef.current==='driving'){audio.current?.unlock();world.current?.jump();}}
  function start(){if(!ready)return;changePhase('driving');world.current?.start();audio.current?.unlock();speak(`Collins, let's find ${letter}! Collect three ${letter} blocks and take them to the barn.`);}
  function finish(){
    if(phaseRef.current!=='tracing')return;
    changePhase('delivered');world.current?.finish();
    let saved=parseProgress(null);try{saved=parseProgress(localStorage.getItem(STORAGE_KEY));}catch{/* Optional storage. */}
    saveProgress({...saved,letters:[...new Set([...saved.letters,letter])]});
    speak(`Good job, Collins! You delivered the letter ${letter}!`);
  }
  function replay(){const next=chooseDeliveryLetter(letter);recovery.current=newMission(next);setLetter(next);changePhase('intro');setCollected(0);setGas(false);setReady(false);setFailed(false);setAttempt(n=>n+1);}
  useEffect(()=>{if(phase==='tracing')tracePanel.current?.focus();},[phase]);
  useEffect(()=>{
    let disposed=false;const activeInputs=inputs.current;audio.current=new SmashAudio();
    const fail=()=>{if(disposed)return;if(world.current)recovery.current=world.current.snapshot();setFailed(true);setReady(false);activeInputs.clear();setGas(false);audio.current?.stop();};
    void import('@/lib/drive-world').then(({createDriveWorld})=>{
      if(disposed||!host.current)return;
      const mission=recovery.current??newMission(chooseDeliveryLetter());
      recovery.current=mission;setLetter(mission.letter);
      world.current=createDriveWorld(host.current,{
        collect:count=>{setCollected(count);speak(count===3?`Three ${mission.letter} blocks! Drive to the barn!`:count===1?`One ${mission.letter} block!`:`Two ${mission.letter} blocks!`);},
        arrive:()=>{activeInputs.clear();setGas(false);audio.current?.stop();changePhase('tracing');speak(`We made it! Trace ${mission.letter} to deliver your blocks.`);},
        failure:fail,
      },mission);setReady(true);
    }).catch(fail);
    const stop=()=>{activeInputs.clear();world.current?.pause(true);setGas(false);audio.current?.stop();window.speechSynthesis?.cancel();};
    const resume=()=>{if(!document.hidden)world.current?.pause(false);};
    const visibility=()=>{if(document.hidden)stop();else resume();};
    const keydown=(event:KeyboardEvent)=>{
      if(event.target instanceof HTMLElement&&event.target.closest('a,button,input,textarea,select'))return;
      if(event.code==='ArrowUp'||event.code==='KeyW'){event.preventDefault();if(!event.repeat)accelerate(event.code,true);}
      if(event.code==='Space'){event.preventDefault();if(!event.repeat)jump();}
    };
    const keyup=(event:KeyboardEvent)=>{if(event.code==='ArrowUp'||event.code==='KeyW')accelerate(event.code,false);};
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',stop);window.addEventListener('focus',resume);document.addEventListener('visibilitychange',visibility);
    return()=>{disposed=true;activeInputs.clear();world.current?.dispose();world.current=null;audio.current?.dispose();window.speechSynthesis?.cancel();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',stop);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',visibility);};
  },[attempt]);
  return <main className="drive-game" data-mission={phase}>
    <div className="drive-world" ref={host}/>
    <header className="drive-header"><Link href="/" className="drive-home">⌂ Home</Link><h1>Collins’ Letter Delivery</h1></header>
    {(phase==='driving'||phase==='intro')&&<div className="delivery-hud">
      <p className="drive-message" role="status">{collected===3?'To the barn! →':`Find three ${letter} blocks`}</p>
      <div className="delivery-slots" aria-label={`${collected} of 3 letter ${letter} blocks collected`}>{[0,1,2].map(i=><span key={i} className={i<collected?'collected':''} aria-hidden="true">{letter}{i<collected&&<small>✓</small>}</span>)}</div>
    </div>}
    {!ready&&<div className="drive-loading" role="status">{failed?<><h2>The truck needs a restart</h2><p>Try again, or enjoy a letter road.</p><button onClick={()=>{setFailed(false);setAttempt(n=>n+1);}}>Try again ↻</button><Link href="/trace">Play letter roads →</Link></>:"Getting your truck ready…"}</div>}
    {ready&&phase==='intro'&&<section className="delivery-intro"><p>Collect {letter} blocks.<br/>Deliver them to the barn!</p><button onClick={start}>Let&apos;s deliver! →</button></section>}
    {ready&&phase==='tracing'&&<section ref={tracePanel} tabIndex={-1} className="delivery-trace" aria-label={`Trace ${letter} to finish the delivery`}><h2>Trace {letter} to open the barn!</h2><p>Follow the whole road with your finger.</p><TraceBoard letter={LETTERS.find(item=>item.name===letter)!} onComplete={finish}/></section>}
    {ready&&phase==='delivered'&&<section className="delivery-finished"><h2>Good job, Collins!</h2><p>You delivered {letter}! ★</p><button onClick={replay}>Deliver again ↻</button></section>}
    {phase==='driving'&&<div className="drive-pedals" aria-label="Truck controls">
      <button type="button" className="drive-jump" disabled={!ready} aria-label="Jump" onPointerDown={event=>{if(event.button===0){event.preventDefault();jump();}}} onClick={event=>{if(event.detail===0)jump();}}><span aria-hidden="true">↟</span>Jump</button>
      <button type="button" className="drive-gas" disabled={!ready} aria-label="Gas: hold to drive" aria-pressed={gas}
        onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);accelerate(`pointer-${event.pointerId}`,true);}}
        onPointerUp={event=>accelerate(`pointer-${event.pointerId}`,false)} onPointerCancel={event=>accelerate(`pointer-${event.pointerId}`,false)} onLostPointerCapture={event=>accelerate(`pointer-${event.pointerId}`,false)}
        onKeyDown={event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();if(!event.repeat)accelerate('button-key',true);}}}
        onKeyUp={event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();accelerate('button-key',false);}}}
        onBlur={()=>accelerate('button-key',false)}><span aria-hidden="true">▰</span>Gas</button>
    </div>}
  </main>;
}
