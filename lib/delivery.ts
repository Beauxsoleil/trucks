import type { LetterName } from "./trace-letters";
export const PICKUPS = [55, 150, 245] as const;
export const BARN_DISTANCE = 335;
export type MissionPhase = "intro" | "driving" | "tracing" | "delivered";
export type DeliverySnapshot = { distance: number; collected: number; phase: MissionPhase; letter: LetterName };
export function deliveryAt(distance: number) {
  return { collected: PICKUPS.filter((position) => distance >= position).length, arrived: distance >= BARN_DISTANCE - 12 };
}

// Sample all letters uniformly, excluding only the last mission's letter.
export function chooseDeliveryLetter(previous?: LetterName, random = Math.random): LetterName {
  const pool = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].filter(letter => letter !== previous) as LetterName[];
  const value = random();
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * pool.length)));
  return pool[index];
}
