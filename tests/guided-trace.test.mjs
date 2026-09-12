import test from 'node:test';import assert from 'node:assert/strict';
import {samplePaths} from '../lib/trace-geometry.ts';import {advanceGuide,newGuidedTrace} from '../lib/guided-trace.ts';
const line=(x,y,dx,dy)=>({getTotalLength:()=>Math.hypot(dx,dy),getPointAtLength(d){const t=d/Math.hypot(dx,dy);return{x:x+dx*t,y:y+dy*t}}});
const paths=[line(50,30,0,200),line(50,30,140,0)],bins=samplePaths(paths,3),identity=p=>p;
function stroke(state,path,portion=1){state={...state,previous:null};for(let i=0;i<=150;i++)state=advanceGuide(bins,state,path.getPointAtLength(path.getTotalLength()*i/150*portion),identity);return state;}
test('future strokes, reverse tracing, endpoints and stationary taps cannot finish',()=>{
 let s=newGuidedTrace();s=stroke(s,paths[1]);assert.equal(s.stroke,0);assert.equal(s.cursor,0);
 s=newGuidedTrace();for(let i=150;i>=0;i--)s=advanceGuide(bins,s,paths[0].getPointAtLength(200*i/150),identity);assert.equal(s.complete,false);assert.equal(s.cursor,0);
 for(let i=0;i<200;i++)s=advanceGuide(bins,s,{x:50,y:30},identity);assert.equal(s.cursor,0);
 s=advanceGuide(bins,s,{x:50,y:230},identity);assert.equal(s.stroke,0);
});
test('strokes advance only in order and interrupted progress resumes at frontier',()=>{
 let s=stroke(newGuidedTrace(),paths[0],.5);const cursor=s.cursor;assert.ok(cursor>0);s={...s,previous:null};
 s=advanceGuide(bins,s,{x:50,y:230},identity);assert.equal(s.cursor,cursor);
 s={...s,previous:null};for(let d=100;d<=200;d++)s=advanceGuide(bins,s,{x:50,y:30+d},identity);
 assert.equal(s.stroke,1);assert.equal(s.complete,false);s=stroke(s,paths[1]);assert.equal(s.complete,true);
});
