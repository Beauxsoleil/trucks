import test from 'node:test';
import assert from 'node:assert/strict';
import {samplePaths, coveredFraction, markCoverage, tracingComplete} from '../lib/trace-geometry.ts';
import {parseProgress, availableLetters, availableWords} from '../lib/trace-letters.ts';
const line=(x,y,length)=>({getTotalLength:()=>length,getPointAtLength:d=>({x:x+d,y})});
const identity=p=>p;

test('35 screen pixels is inclusive; outside the road adds no progress',()=>{
 const bins=samplePaths([line(0,0,400)]), covered=new Set();
 assert.equal(markCoverage(bins,covered,{x:102,y:36},identity),false);
 assert.equal(covered.size,0);
 assert.equal(markCoverage(bins,covered,{x:102,y:35},identity),true);
 assert.ok(covered.size>0);
});
test('repeat touches do not inflate coverage; jumps do not fill skipped road',()=>{
 const bins=samplePaths([line(0,0,400)]), covered=new Set();
 markCoverage(bins,covered,{x:20,y:0},identity);const initial=coveredFraction(bins,covered);
 for(let i=0;i<100;i++)markCoverage(bins,covered,{x:20,y:0},identity);
 assert.equal(coveredFraction(bins,covered),initial);
 markCoverage(bins,covered,{x:380,y:0},identity,{x:20,y:0});
 assert.ok(coveredFraction(bins,covered)<.35);
});
test('coverage is length weighted and includes disconnected strokes',()=>{
 const bins=samplePaths([line(0,0,100),line(0,200,300)]);
 const covered=new Set(bins.flatMap((b,i)=>b.stroke===0?[i]:[]));
 assert.ok(Math.abs(coveredFraction(bins,covered)-.25)<.0001);
});
test('35px tolerance remains the same with a scaled SVG',()=>{
 const bins=samplePaths([line(0,0,400)]),covered=new Set();
 const transform=p=>({x:p.x*.5+20,y:p.y*.5+100});
 assert.equal(markCoverage(bins,covered,{x:71,y:136},transform),false);
 assert.equal(markCoverage(bins,covered,{x:71,y:135},transform),true);
});
test('unlock order, word prerequisites and safe malformed progress',()=>{
 const empty=parseProgress('broken');assert.deepEqual(availableLetters(empty).map(l=>l.name),['L']);
 let p=parseProgress(JSON.stringify({version:1,letters:['L','T','I'],words:[]}));
 assert.deepEqual(availableLetters(p).map(l=>l.name),['L','T','I','F']);
 assert.deepEqual(availableWords(p),['IT']);
 p=parseProgress(JSON.stringify({version:1,letters:['L','T','I','F','E','H'],words:['IT','BAD','HIT']}));
 assert.deepEqual(availableLetters(p).map(l=>l.name),['L','T','I','F','E','H','C']);
 assert.deepEqual(p.words,['IT','HIT']);
 assert.deepEqual(parseProgress('{"version":1,"letters":false,"words":{}}').letters,[]);
});

// T and I used to finish as soon as their shared overall percentage reached 85%.
// Short horizontal bars must now be traced independently, even on a small screen.

const vertical=(x,y,length)=>({getTotalLength:()=>length,getPointAtLength:d=>({x,y:y+d})});
for (const scale of [.35, 1, 1.6]) for (const name of ['T','I']) {
 test(`${name} at scale ${scale} requires every stroke and both ends`,()=>{
  const paths=name==='T'?[line(110,75,200),vertical(210,75,240)]:[line(140,75,140),vertical(210,75,240),line(140,315,140)];
  const bins=samplePaths(paths),covered=new Set(),transform=p=>({x:p.x*scale,y:p.y*scale});
  const trace=(path,portion=1)=>{let prev;for(let d=0;d<=path.getTotalLength()*portion;d+=1){const point=transform(path.getPointAtLength(d));markCoverage(bins,covered,point,transform,prev);prev=point;}};
  trace(paths[1]);assert.equal(tracingComplete(bins,covered),false,'vertical stem alone must not finish');
  trace(paths[0],.75);assert.equal(tracingComplete(bins,covered),false,'unfinished top bar must not finish');
  trace(paths[0]);
  if(name==='I'){assert.equal(tracingComplete(bins,covered),false,'I still needs its bottom bar');trace(paths[2]);}
  assert.equal(tracingComplete(bins,covered),true);
 });
}
test('even 99 percent overall cannot hide a missing stroke endpoint',()=>{
 const bins=samplePaths([line(0,0,200),vertical(100,0,240)]);
 const covered=new Set(bins.map((_,i)=>i));covered.delete(bins.length-1);
 assert.ok(coveredFraction(bins,covered)>.99);assert.equal(tracingComplete(bins,covered),false);
});
