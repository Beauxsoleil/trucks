import test from 'node:test';
import assert from 'node:assert/strict';
import { stepDrive } from '../lib/drive-physics.ts';
const initial = () => ({ distance: 0, speed: 0, height: 0, verticalSpeed: 0 });
test('gas accelerates, release stops, and a long frame cannot teleport the truck', () => {
  let state = initial();
  for (let i = 0; i < 180; i++) state = stepDrive(state, true, false, 1 / 60);
  assert.equal(state.speed, 12); assert.ok(state.distance > 10);
  const before = state.distance;
  state = stepDrive(state, true, false, 100);
  assert.ok(state.distance - before <= .61);
  for (let i = 0; i < 60; i++) state = stepDrive(state, false, false, 1 / 60);
  assert.equal(state.speed, 0);
  assert.equal(stepDrive(state, false, false, 1 / 60).distance, state.distance);
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
