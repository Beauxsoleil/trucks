import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryAt,PICKUPS,BARN_DISTANCE,chooseDeliveryWord,DELIVERY_WORDS} from '../lib/delivery.ts';
test('delivery collects each of three blocks before the barn stop',()=>{
 assert.deepEqual(deliveryAt(0),{collected:0,arrived:false});
 PICKUPS.forEach((position,i)=>{assert.equal(deliveryAt(position-.01).collected,i);assert.equal(deliveryAt(position).collected,i+1);});
 assert.deepEqual(deliveryAt(BARN_DISTANCE-12),{collected:3,arrived:true});
 assert.equal(deliveryAt(BARN_DISTANCE+100).collected,3);
});

test('random deliveries use supported three-letter words without immediate repeats',()=>{
 const chosen=new Set(Array.from({length:DELIVERY_WORDS.length},(_,i)=>chooseDeliveryWord(undefined,()=>(i+.5)/DELIVERY_WORDS.length)));
 assert.equal(chosen.size,DELIVERY_WORDS.length);
 for(const previous of DELIVERY_WORDS){assert.match(previous,/^[A-Z]{3}$/);for(let i=0;i<24;i++)assert.notEqual(chooseDeliveryWord(previous,()=>i/24),previous);}
});
