import test from 'node:test';import assert from 'node:assert/strict';import {FuelLab,MATERIAL as M,newLabTruck,stepLabTruck} from '../lib/fuel-lab.ts';
const world=()=>new FuelLab(40,40,()=>.4);
test('gravity settles sand, water flows, and boundary walls survive erasing',()=>{
 const w=world();w.paint(20,5,M.sand,0);w.step();assert.equal(w.cells[6*40+20],M.sand);
 w.paint(0,39,M.empty,10);assert.equal(w.cells[39*40],M.wall);
 w.paint(20,38,M.water,0);for(let i=0;i<4;i++)w.step();assert.ok(w.cells.some((t,i)=>t===M.water&&i%40!==20));
});
test('pretend fuel reaction creates rising bubbles and captured energy powers one truck test',()=>{
 const w=world();w.paint(20,20,M.water,0);w.paint(21,20,M.crystal,0);w.step();assert.ok(w.discoveries.has('fizz'));for(let i=0;i<30;i++)w.step();assert.ok(w.energy>0);assert.equal(w.usePower(),false);
 w.energy=30;assert.equal(w.usePower(),true);assert.equal(w.energy,0);assert.equal(w.usePower(),false);
 let t={...newLabTruck(),running:true},air=false;for(let i=0;i<400;i++){t=stepLabTruck(t,1/60);air ||=t.height>0;}assert.ok(air);assert.ok(t.finished);
});
test('water mixes with sand, warming melts and evaporates, cooling freezes and condenses',()=>{
 const w=world();w.paint(20,38,M.sand,0);w.paint(21,38,M.water,0);w.step();assert.ok(w.discoveries.has('mud'));
 w.reset();w.paint(20,38,M.ice,0);w.temperature='warm';for(let i=0;i<50;i++)w.step();assert.ok(w.discoveries.has('melt'));assert.ok(w.discoveries.has('steam'));
 w.temperature='cool';for(let i=0;i<30;i++)w.step();assert.ok(w.discoveries.has('condense'));assert.ok(w.discoveries.has('freeze'));
 w.reset();assert.equal(w.energy,0);assert.equal(w.discoveries.size,0);
});

test('ice rises through water instead of sinking like sand',()=>{
 const w=world();w.paint(20,20,M.water,0);w.paint(20,21,M.ice,0);w.step();assert.equal(w.cells[20*40+20],M.ice);assert.equal(w.cells[21*40+20],M.water);
});
