type Point = { x: number; y: number };
type Scheduler = { schedule(callback: () => void, ms: number): unknown; cancel(handle: unknown): void };
const browserScheduler: Scheduler = {
  schedule: (callback, ms) => setTimeout(callback, ms),
  cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export function createParentHold(open: () => void, scheduler: Scheduler = browserScheduler) {
  let timer: unknown;
  let pending = false;
  let origin: Point | undefined;
  const cancel = () => {
    if (pending) scheduler.cancel(timer);
    pending = false; origin = undefined;
  };
  return {
    start(point?: Point) {
      if (pending) return;
      pending = true; origin = point;
      timer = scheduler.schedule(() => { pending = false; origin = undefined; open(); }, 3000);
    },
    move(point: Point) { if (origin && Math.hypot(point.x - origin.x, point.y - origin.y) > 15) cancel(); },
    cancel,
  };
}
