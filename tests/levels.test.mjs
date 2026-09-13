import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevel, terrainHeight } from '../lib/levels.ts';
import { stepDrive } from '../lib/drive-physics.ts';
test('four unique accessible worlds with flat start and finish',()=>{
  assert.equal(new Set(LEVELS.map(l=>l.id)).size,4);
  for(const level of LEVELS){
    assert.equal(getLevel(level.id),level);
    for(const distance of [0,10,305,323,335])assert.equal(terrainHeight(distance,level.id),0);
    for(let d=0;d<340;d+=.2){assert.ok(Number.isFinite(terrainHeight(d,level.id)));assert.ok(Math.abs(terrainHeight(d+.2,level.id)-terrainHeight(d,level.id))<.06);}
  }
});
test('moon jump is higher and floatier, with no midair double jump',()=>{
  function flight(level){let state={distance:0,speed:0,height:0,verticalSpeed:0},peak=0,frames=0;do{state=stepDrive(state,true,frames===0,1/60,level);peak=Math.max(peak,state.height);frames++;}while(state.height>0&&frames<1000);return{peak,frames,state};}
  const moon=flight(getLevel('moon')),farm=flight(getLevel('farm'));
  assert.ok(moon.peak>farm.peak);assert.ok(moon.frames>farm.frames);assert.equal(moon.state.height,0);
  let state=stepDrive({distance:0,speed:0,height:0,verticalSpeed:0},true,true,1/60,getLevel('moon'));
  assert.ok(stepDrive(state,true,true,1/60,getLevel('moon')).verticalSpeed<state.verticalSpeed);
});
