import test from 'node:test';
import assert from 'node:assert/strict';
import {createParentHold} from '../lib/parent-hold.ts';
function clock() {
 let now=0,id=0;const tasks=new Map();
 return { schedule(fn,ms){tasks.set(++id,{fn,at:now+ms});return id;}, cancel(id){tasks.delete(id);}, advance(ms){now+=ms;for(const [key,t] of tasks){if(t.at<=now){tasks.delete(key);t.fn();}}} };
}
test('a tap does not open parent mode; a full three-second hold opens once',()=>{
 const time=clock();let opens=0;const hold=createParentHold(()=>opens++,time);
 hold.start();time.advance(100);hold.cancel();time.advance(4000);assert.equal(opens,0);
 hold.start();time.advance(2999);assert.equal(opens,0);time.advance(1);assert.equal(opens,1);time.advance(10000);assert.equal(opens,1);
});
test('moving more than 15px cancels; slight finger movement is allowed',()=>{
 const time=clock();let opens=0;const hold=createParentHold(()=>opens++,time);
 hold.start({x:0,y:0});hold.move({x:16,y:0});time.advance(3000);assert.equal(opens,0);
 hold.start({x:0,y:0});hold.move({x:9,y:9});time.advance(3000);assert.equal(opens,1);
});
test('cancel on release, lost capture, hidden page or cleanup prevents a delayed open',()=>{
 const time=clock();let opens=0;const hold=createParentHold(()=>opens++,time);
 for(let i=0;i<4;i++){hold.start();time.advance(2900);hold.cancel();time.advance(200);}
 assert.equal(opens,0);
});
test('repeat keydowns do not stack timers or extend the original hold',()=>{
 const time=clock();let opens=0;const hold=createParentHold(()=>opens++,time);
 hold.start();time.advance(1000);hold.start();time.advance(1000);hold.start();time.advance(1000);assert.equal(opens,1);time.advance(5000);assert.equal(opens,1);
});
