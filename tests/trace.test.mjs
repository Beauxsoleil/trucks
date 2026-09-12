import test from 'node:test';
import assert from 'node:assert/strict';
import {samplePaths, coveredFraction, markCoverage, tracingComplete} from '../lib/trace-geometry.ts';
import {LETTERS, WORDS, parseProgress, availableLetters, availableWords} from '../lib/trace-letters.ts';
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
test('all 26 letters are available; words keep prerequisites and saved data stays safe',()=>{
 const empty=parseProgress('broken');assert.equal(empty.letters.length,0);assert.equal(availableLetters().map(l=>l.name).join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
 let p=parseProgress(JSON.stringify({version:1,letters:['L','T','I'],words:[]}));
 assert.equal(availableLetters().length,26);
 assert.deepEqual(availableWords(p),['IT']);
 p=parseProgress(JSON.stringify({version:1,letters:['L','T','I','F','E','H'],words:['IT','BAD','HIT']}));
 assert.equal(availableLetters().length,26);
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

test('every capital has paths and a teaching cue, and old/new saved letters survive',()=>{
 assert.equal(new Set(LETTERS.map(l=>l.name)).size,26);
 for(const letter of LETTERS){assert.ok(letter.paths.length);assert.ok(letter.speech.startsWith(letter.name+'.'));for(const path of letter.paths)assert.match(path,/^M\d+ \d+/);}
 const p=parseProgress(JSON.stringify({version:1,letters:['L','T','I','Z','A','?'],words:['IT']}));
 assert.deepEqual(p.letters,['A','I','L','T','Z']);assert.deepEqual(p.words,['IT']);
});

test('closed loop shared endpoint is traceable without weakening separate strokes',()=>{
 const radius=120,length=2*Math.PI*radius;
 const loop={getTotalLength:()=>length,getPointAtLength:d=>({x:210+Math.sin(d/radius)*radius,y:195-Math.cos(d/radius)*radius})};
 const bins=samplePaths([loop]),covered=new Set(),transform=p=>({x:p.x*1.6,y:p.y*1.6});let previous;
 for(let i=0;i<=150;i++){const point=transform(loop.getPointAtLength(length*i/150));markCoverage(bins,covered,point,transform,previous);previous=point;}
 assert.equal(tracingComplete(bins,covered),true);
});

const yPolyline=(ps)=>{const ls=ps.slice(1).map((p,i)=>Math.hypot(p.x-ps[i].x,p.y-ps[i].y));return {getTotalLength:()=>ls.reduce((a,b)=>a+b,0),getPointAtLength(d){let i=0;while(i<ls.length-1&&d>ls[i])d-=ls[i++];const t=d/ls[i];return{x:ps[i].x+(ps[i+1].x-ps[i].x)*t,y:ps[i].y+(ps[i+1].y-ps[i].y)*t}}}};
const left={x:110,y:75},middle={x:210,y:195},right={x:310,y:75},bottom={x:210,y:315};

for (const scale of [.65, 1, 1.6]) test(`Y accepts an off-center natural two-stroke trace at scale ${scale}`,()=>{
 const bins=samplePaths([yPolyline([left,middle,right]),yPolyline([middle,bottom])]),covered=new Set();
 const transform=p=>({x:p.x*scale,y:p.y*scale});
 const trace=path=>{let previous;const n=Math.ceil(path.getTotalLength()*scale/7);for(let i=0;i<=n;i++){
  const point=transform(path.getPointAtLength(path.getTotalLength()*i/n));point.y+=12;
  markCoverage(bins,covered,point,transform,previous);previous=point;
 }};
 trace(yPolyline([left,middle,bottom]));
 assert.equal(tracingComplete(bins,covered),false,'missing right arm must not complete Y');
 trace(yPolyline([right,middle]));
 assert.equal(tracingComplete(bins,covered),true,'finger-width endpoint offsets must not strand Y');
});
test('touching only Y endpoints and junction cannot complete the letter',()=>{
 const bins=samplePaths([yPolyline([left,middle,right]),yPolyline([middle,bottom])]),covered=new Set();
 for(const point of [left,middle,right,bottom])markCoverage(bins,covered,point,identity);
 assert.equal(tracingComplete(bins,covered),false);
 assert.ok(coveredFraction(bins,covered)<.3);
});

test('expanded word list uses supported letters and preserves word prerequisites',()=>{
 assert.equal(new Set(WORDS).size,39);
 for(const word of WORDS)for(const letter of word)assert.ok(LETTERS.some(item=>item.name===letter));
 const progress={version:1,letters:['C','A'],words:[]};assert.ok(!availableWords(progress).includes('CAT'));
 progress.letters.push('T');assert.ok(availableWords(progress).includes('CAT'));
 assert.deepEqual(parseProgress(JSON.stringify({version:1,letters:['C','A','T'],words:['CAT']})).words,['CAT']);
});
