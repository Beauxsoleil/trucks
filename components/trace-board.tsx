"use client";
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { samplePaths, type RoadBin } from '@/lib/trace-geometry';
import { advanceGuideSamples, guidePoint, newGuidedTrace } from '@/lib/guided-trace';
import { LETTERS } from '@/lib/trace-letters';
type Letter=typeof LETTERS[number];
export function TraceBoard({letter,onComplete}:{letter:Letter;onComplete:()=>void}){
  const paths=useRef<(SVGPathElement|null)[]>([]),bins=useRef<RoadBin[]>([]);
  const progress=useRef(newGuidedTrace()),pointer=useRef<number|null>(null),lift=useRef(false);
  const frame=useRef<number|null>(null);
  useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
  const [view,setView]=useState(newGuidedTrace),[paint,setPaint]=useState('');
  const [target,setTarget]=useState(()=>{const start=letter.paths[0].match(/^M(\d+) (\d+)/)!;return {x:Number(start[1]),y:Number(start[2])};});
  function draw(){
    frame.current=null;const next=progress.current;
    setView(next);if(!next.complete)setTarget(guidePoint(bins.current,next));
    const activeStart=bins.current.findIndex(item=>item.stroke===next.stroke);
    const painted=bins.current.filter((b,i)=>b.stroke<next.stroke||(b.stroke===next.stroke&&i-activeStart<next.cursor));
    // Continuous subpaths give curves smooth joins, without disconnected caps.
    setPaint(painted.map((b,i)=>`${i===0||painted[i-1].stroke!==b.stroke?`M${b.start.x} ${b.start.y}`:''}L${b.end.x} ${b.end.y}`).join(' '));
  }
  function move(event:PointerEvent<SVGSVGElement>){
    if(lift.current||progress.current.complete)return;
    const matrix=event.currentTarget.getScreenCTM();if(!matrix)return;
    if(!bins.current.length)bins.current=samplePaths(paths.current.filter((p):p is SVGPathElement=>p!==null),3);
    const before=progress.current;
    const samples=event.nativeEvent.getCoalescedEvents?.()??[];
    const points=[...samples,event.nativeEvent].map(sample=>({x:sample.clientX,y:sample.clientY}));
    const next=advanceGuideSamples(bins.current,before,points,p=>({x:matrix.a*p.x+matrix.c*p.y+matrix.e,y:matrix.b*p.x+matrix.d*p.y+matrix.f}));
    progress.current=next;
    if(next.cursor!==before.cursor||next.stroke!==before.stroke||next.complete!==before.complete){if(frame.current===null)frame.current=requestAnimationFrame(draw);}
    if(next.stroke!==before.stroke)lift.current=true;
    if(next.complete&&!before.complete)onComplete();
  }
  function release(event:PointerEvent<SVGSVGElement>){
    if(pointer.current!==event.pointerId)return;
    if(event.type==='pointerup')move(event);
    pointer.current=null;lift.current=false;progress.current={...progress.current,previous:null};
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className={`trace-board ${view.complete?'is-complete':''}`} data-complete={view.complete} data-active-stroke={view.stroke}>
    <p className="stroke-instruction" role="status">{view.complete?'Good job, Collins!':`Stroke ${view.stroke+1} of ${letter.paths.length} · ${view.cursor===0?'Start at the number':'Follow the blue dot →'}`}</p>
    <svg viewBox="0 0 420 390" className="trace-canvas" role="img" aria-label={`Trace the letter ${letter.name}`} onPointerDown={event=>{
      if(event.button!==0||pointer.current!==null)return;pointer.current=event.pointerId;progress.current={...progress.current,previous:null};event.currentTarget.setPointerCapture(event.pointerId);move(event);
    }} onPointerMove={event=>{if(pointer.current===event.pointerId)move(event)}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={()=>{pointer.current=null;lift.current=false;progress.current={...progress.current,previous:null}}}>
      <title>Trace {letter.name} in order</title><desc>Start at the numbered dot. Follow the highlighted stroke in the arrow direction. Lift between strokes. Resume at the blue dot if you stop.</desc>
      <defs><marker id={`arrow-${letter.name}`} viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#1679bf"/></marker></defs>
      {letter.paths.map((d,i)=><g key={d}><path d={d} className="letter-road"/><path ref={node=>{paths.current[i]=node}} d={d} className={`letter-guide ${i===view.stroke?'active-stroke':''}`} data-stroke={i} /></g>)}
      <g className="letter-paint" aria-hidden="true"><path d={view.complete?letter.paths.join(' '):paint}/></g>
      {!view.complete&&<path d={letter.paths[view.stroke]} fill="none" stroke="none" markerEnd={`url(#arrow-${letter.name})`} aria-hidden="true"/>}
      {!view.complete&&view.cursor>0&&<image href="/assets/monster-truck.png" x={target.x-50} y={target.y-16} width="38" height="32" aria-hidden="true"/>}
      {!view.complete&&<g className="stroke-target" aria-hidden="true"><circle cx={target.x} cy={target.y} r="17" fill="#1679bf" stroke="#fff" strokeWidth="4"/><text x={target.x} y={target.y+6} textAnchor="middle" fill="white" fontSize="20" fontWeight="900">{view.stroke+1}</text></g>}
      {view.complete&&<text x="210" y="375" textAnchor="middle" fontSize="30" fill="#257648">★ ★ ★</text>}
    </svg>
  </div>;
}
