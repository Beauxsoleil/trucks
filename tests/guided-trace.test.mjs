import test from 'node:test';import assert from 'node:assert/strict';
import {samplePaths} from '../lib/trace-geometry.ts';import {advanceGuide,advanceGuideSamples,newGuidedTrace} from '../lib/guided-trace.ts';
const line=(x,y,dx,dy)=>({getTotalLength:()=>Math.hypot(dx,dy),getPointAtLength(d){const t=d/Math.hypot(dx,dy);return{x:x+dx*t,y:y+dy*t}}});
const paths=[line(50,30,0,200),line(50,30,140,0)],bins=samplePaths(paths,3),identity=p=>p;
function stroke(state,path,portion=1){state={...state,previous:null};for(let i=0;i<=150;i++)state=advanceGuide(bins,state,path.getPointAtLength(path.getTotalLength()*i/150*portion),identity);return state;}
test('future strokes, reverse tracing, endpoints and stationary taps cannot finish',()=>{
 let s=newGuidedTrace();s=stroke(s,paths[1]);assert.equal(s.stroke,0);assert.equal(s.cursor,0);
 s=newGuidedTrace();for(let i=150;i>=0;i--)s=advanceGuide(bins,s,paths[0].getPointAtLength(200*i/150),identity);assert.equal(s.complete,false);assert.equal(s.cursor,0);
 for(let i=0;i<200;i++)s=advanceGuide(bins,s,{x:50,y:30},identity);assert.equal(s.cursor,0);
 s=advanceGuide(bins,s,{x:50,y:230},identity);assert.equal(s.stroke,0);
});
test('coalesced samples preserve progress and stop at a stroke boundary',()=>{
 const samples=Array.from({length:101},(_,i)=>paths[0].getPointAtLength(i*2));
 let sequential=newGuidedTrace();for(const point of samples)sequential=advanceGuide(bins,sequential,point,identity);
 const batched=advanceGuideSamples(bins,newGuidedTrace(),samples,identity);assert.deepEqual(batched,sequential);
 const both=[...samples,...Array.from({length:71},(_,i)=>paths[1].getPointAtLength(i*2))];
 const result=advanceGuideSamples(bins,newGuidedTrace(),both,identity);assert.equal(result.stroke,1);assert.equal(result.complete,false);assert.equal(result.cursor,0);
 const shortcut=advanceGuideSamples(bins,newGuidedTrace(),[samples[0],samples.at(-1)],identity);assert.equal(shortcut.stroke,0);
});
test('offset short swipes resume and forgive a near endpoint without skipping a stroke',()=>{
 let s=newGuidedTrace();
 for(let d=0;d<=194;d+=2){
  if(d%32===0)s={...s,previous:null};
  s=advanceGuide(bins,s,{x:78,y:30+d},identity);
 }
 assert.equal(s.stroke,1);assert.equal(s.complete,false);
 // Sliding to the new start can begin the next step without a pointer lift.
 s=advanceGuide(bins,s,{x:50,y:30},identity);
 for(let d=2;d<=134;d+=2)s=advanceGuide(bins,s,{x:50+d,y:48},identity);
 assert.equal(s.complete,true);
 const unfinished=stroke(newGuidedTrace(),paths[0],.8);
 assert.equal(unfinished.stroke,0);assert.equal(unfinished.complete,false);
});
test('strokes advance only in order and interrupted progress resumes at frontier',()=>{
 let s=stroke(newGuidedTrace(),paths[0],.5);const cursor=s.cursor;assert.ok(cursor>0);s={...s,previous:null};
 s=advanceGuide(bins,s,{x:50,y:230},identity);assert.equal(s.cursor,cursor);
 s={...s,previous:null};for(let d=100;d<=200;d++)s=advanceGuide(bins,s,{x:50,y:30+d},identity);
 assert.equal(s.stroke,1);assert.equal(s.complete,false);s=stroke(s,paths[1]);assert.equal(s.complete,true);
});
