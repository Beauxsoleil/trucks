import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('packaged GLBs have complete embedded buffers and no external texture requests',()=>{
 for(const name of ['truck','wheel-tractor-dark-back','tree_oak','tree_pineRoundA','rock_largeA']){
  const bytes=fs.readFileSync(new URL(`../public/assets/models/${name}.glb`,import.meta.url));
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const length=bytes.readUInt32LE(12),document=JSON.parse(bytes.subarray(20,20+length).toString());
  for(const image of document.images??[])assert.equal(image.uri,undefined);
  for(const view of document.bufferViews)assert.ok((view.byteOffset??0)+view.byteLength<=document.buffers[view.buffer].byteLength);
  assert.ok(document.meshes.length>0);
 }
});
