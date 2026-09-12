export const PICKUPS = [55, 150, 245] as const;
export const BARN_DISTANCE = 335;
export type MissionPhase = "intro" | "driving" | "tracing" | "delivered";
export type DeliverySnapshot = { distance: number; collected: number; phase: MissionPhase };
export function deliveryAt(distance: number) {
  return { collected: PICKUPS.filter((position) => distance >= position).length, arrived: distance >= BARN_DISTANCE - 12 };
}
