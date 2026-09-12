import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryAt,PICKUPS,BARN_DISTANCE} from '../lib/delivery.ts';
test('delivery collects each of three blocks before the barn stop',()=>{
 assert.deepEqual(deliveryAt(0),{collected:0,arrived:false});
 PICKUPS.forEach((position,i)=>{assert.equal(deliveryAt(position-.01).collected,i);assert.equal(deliveryAt(position).collected,i+1);});
 assert.deepEqual(deliveryAt(BARN_DISTANCE-12),{collected:3,arrived:true});
 assert.equal(deliveryAt(BARN_DISTANCE+100).collected,3);
});
