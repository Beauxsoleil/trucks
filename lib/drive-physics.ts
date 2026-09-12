export type DriveState = { distance: number; speed: number; height: number; verticalSpeed: number };
export function stepDrive(state: DriveState, gas: boolean, jump: boolean, elapsed: number): DriveState {
  const dt = Math.max(0, Math.min(elapsed, 0.05));
  const speed = Math.max(0, Math.min(12, state.speed + (gas ? 7 : -18) * dt));
  let verticalSpeed = jump && state.height === 0 ? 9 : state.verticalSpeed;
  let height = state.height;
  if (height > 0 || verticalSpeed > 0) {
    verticalSpeed -= 22 * dt;
    height = Math.max(0, height + verticalSpeed * dt);
    if (height === 0) verticalSpeed = 0;
  }
  return { distance: state.distance + speed * dt, speed, height, verticalSpeed };
}
