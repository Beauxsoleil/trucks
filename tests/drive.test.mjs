import test from 'node:test';
import assert from 'node:assert/strict';
import { stepDrive, stepSpring } from '../lib/drive-physics.ts';
const initial = () => ({ distance: 0, speed: 0, height: 0, verticalSpeed: 0 });
test('gas accelerates, release stops, and a long frame cannot teleport the truck', () => {
  let state = initial();
  for (let i = 0; i < 180; i++) state = stepDrive(state, true, false, 1 / 60);
  assert.equal(state.speed, 12); assert.ok(state.distance > 10);
  const before = state.distance;
  state = stepDrive(state, true, false, 100);
  assert.ok(state.distance - before <= .61);
  const coasting=stepDrive(state,false,false,1/60);assert.ok(coasting.speed>0&&coasting.speed<state.speed);
  for (let i = 0; i < 120; i++) state = stepDrive(state, false, false, 1 / 60);
  assert.equal(state.speed, 0);
  assert.equal(stepDrive(state, false, false, 1 / 60).distance, state.distance);
});
test('slopes affect speed, airborne motion is ballistic, and landings report impact',()=>{
 const physics={gravity:22,jump:9};
 const up=stepDrive(initial(),true,false,.05,physics,d=>d*.1),down=stepDrive(initial(),true,false,.05,physics,d=>-d*.1);
 assert.ok(down.speed>up.speed);
 const airborne={distance:0,speed:8,height:5,verticalSpeed:2};
 const a=stepDrive(airborne,true,false,.05,physics),b=stepDrive(airborne,true,false,.05,physics,d=>d*.1);
 assert.ok(Math.abs(a.height-(b.height+b.distance*.1))<1e-8);
 let state=stepDrive(initial(),true,true,1/60),impact=0;
 for(let i=0;i<120;i++){state=stepDrive(state,true,false,1/60);impact=Math.max(impact,state.impact??0);}
 assert.ok(impact>5);assert.equal(state.height,0);
});
test('physics agrees across frame rates and suspension settles after a landing',()=>{
 function run(hz){let state=initial();for(let i=0;i<hz;i++)state=stepDrive(state,true,i===0,1/hz);return state;}
 const a=run(30),b=run(120);assert.ok(Math.abs(a.distance-b.distance)<1e-8);assert.equal(a.height,b.height);
 let spring=stepSpring({offset:0,velocity:0},0,1/60,-2);assert.ok(spring.offset<0);
 for(let i=0;i<360;i++){spring=stepSpring(spring,0,1/60);assert.ok(Math.abs(spring.offset)<=.3);}
 assert.ok(Math.abs(spring.offset)<.00001);assert.ok(Math.abs(spring.velocity)<.00001);
 assert.equal(stepDrive(initial(),true,true,NaN).distance,0);
});
test('jump works while driving, does not double jump, and lands back on the road', () => {
  let state = stepDrive(initial(), true, true, 1 / 60);
  assert.ok(state.height > 0); assert.ok(state.distance > 0);
  const velocity = state.verticalSpeed;
  state = stepDrive(state, true, true, 1 / 60);
  assert.ok(state.verticalSpeed < velocity);
  for (let i = 0; i < 90; i++) state = stepDrive(state, true, false, 1 / 60);
  assert.equal(state.height, 0); assert.equal(state.verticalSpeed, 0);
  assert.ok(stepDrive(state, false, true, 1 / 60).height > 0);
});
