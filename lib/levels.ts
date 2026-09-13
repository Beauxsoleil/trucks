export const LEVELS = [
  { id: 'farm', name: 'Sunny Farm', destination: 'barn', hint: 'Over the bridge to the barn!', sky: 0xbfeafa, ground: 0x99c781, road: 0xd3a673, gravity: 22, jump: 9, hills: 0, spacing: 32 },
  { id: 'dino', name: 'Dinosaur Valley', destination: 'dinosaur camp', hint: 'Ride the gentle dinosaur hills!', sky: 0xffdeb0, ground: 0x88ad65, road: 0xc28e63, gravity: 22, jump: 9, hills: 1.2, spacing: 24 },
  { id: 'snow', name: 'Snowy Mountain', destination: 'cozy cabin', hint: 'Over snowy hills and an ice bridge!', sky: 0xd1e6f8, ground: 0xe5f1fa, road: 0x94b8d0, gravity: 22, jump: 9, hills: .7, spacing: 38 },
  { id: 'moon', name: 'Moon Mission', destination: 'moon base', hint: 'Try a big, floaty moon jump!', sky: 0x182342, ground: 0x9499b3, road: 0xb9b3cb, gravity: 8, jump: 7, hills: .35, spacing: 30 },
] as const;
export type LevelId = typeof LEVELS[number]['id'];
export function getLevel(id: LevelId = 'farm') { return LEVELS.find(level => level.id === id) ?? LEVELS[0]; }
// Smooth rolling ramps taper to flat ground at the start and destination.
export function terrainHeight(distance: number, id: LevelId = 'farm') {
  const level = getLevel(id);
  const taper = Math.max(0, Math.min(1, (distance - 15) / 15, (305 - distance) / 15));
  return taper * level.hills * (1 - Math.cos((distance - 30) / level.spacing * Math.PI));
}
