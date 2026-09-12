import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryAt,PICKUPS,BARN_DISTANCE,chooseDeliveryLetter} from '../lib/delivery.ts';
test('delivery collects each of three blocks before the barn stop',()=>{
 assert.deepEqual(deliveryAt(0),{collected:0,arrived:false});
 PICKUPS.forEach((position,i)=>{assert.equal(deliveryAt(position-.01).collected,i);assert.equal(deliveryAt(position).collected,i+1);});
 assert.deepEqual(deliveryAt(BARN_DISTANCE-12),{collected:3,arrived:true});
 assert.equal(deliveryAt(BARN_DISTANCE+100).collected,3);
});

test('random delivery reaches all 26 letters and excludes the previous letter',()=>{
 const chosen=new Set(Array.from({length:26},(_,i)=>chooseDeliveryLetter(undefined,()=>(i+.5)/26)));
 assert.equal(chosen.size,26);
 for(const previous of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')for(let i=0;i<25;i++)assert.notEqual(chooseDeliveryLetter(previous,()=>i/25),previous);
 assert.equal(chooseDeliveryLetter(undefined,()=>0),'A');assert.equal(chooseDeliveryLetter(undefined,()=>.999),'Z');
});
