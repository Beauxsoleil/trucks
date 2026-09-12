// One shared centerline keeps the truck, road, pickups and destination aligned.
export function roadX(distance: number) {
  return 9 * Math.sin(distance / 27) + 3 * Math.sin(distance / 13);
}
export function roadHeading(distance: number) {
  return -Math.atan(9 / 27 * Math.cos(distance / 27) + 3 / 13 * Math.cos(distance / 13));
}
export function roadPosition(position: number, driven: number) {
  return { x: roadX(position) - roadX(driven), z: driven - position };
}
