import test from 'node:test';
import assert from 'node:assert/strict';
import {samplePaths, coveredFraction, markCoverage} from '../lib/trace-geometry.ts';
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
