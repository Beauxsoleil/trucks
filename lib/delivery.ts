export const PICKUPS = [55, 150, 245] as const;
export const BARN_DISTANCE = 335;
export type MissionPhase = "intro" | "driving" | "tracing" | "delivered";
export type DeliverySnapshot = { distance: number; collected: number; phase: MissionPhase; word: DeliveryWord; traceIndex: number };
export function deliveryAt(distance: number) {
  return { collected: PICKUPS.filter((position) => distance >= position).length, arrived: distance >= BARN_DISTANCE - 12 };
}

export const DELIVERY_WORDS = ['CAT','DOG','COW','PIG','HEN','SUN','BUG','BUS','CAR','VAN','BOX','HAT','BAT','CUP','MAP','MOM','DAD','BED','RED','BIG','DIG','RUN','FUN','MUD'] as const;
export type DeliveryWord=typeof DELIVERY_WORDS[number];
export function chooseDeliveryWord(previous?:DeliveryWord,random=Math.random):DeliveryWord {
  const pool=DELIVERY_WORDS.filter(word=>word!==previous),value=random();
  return pool[Math.min(pool.length-1,Math.max(0,Math.floor((Number.isFinite(value)?value:0)*pool.length)))];
}
