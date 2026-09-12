import test from 'node:test';
import assert from 'node:assert/strict';
import {roadX,roadPosition,roadHeading} from '../lib/road.ts';
test('curved route stays centered on the truck and keeps landmarks continuous',()=>{
 const values=[];
 for(let d=0;d<=335;d++){
  assert.deepEqual(roadPosition(d,d),{x:0,z:0});
  assert.ok(Math.abs(roadHeading(d))<.55);
  assert.ok(Math.abs(roadX(d+.1)-roadX(d))<.06);
  values.push(roadX(d));
 }
 assert.ok(Math.max(...values)-Math.min(...values)>20);
 for(const d of [55,110,150,245,335])assert.equal(roadPosition(d,d-10).z,-10);
});
