"use client";

import { useRef, useState, type PointerEvent } from "react";
import { tracingComplete, markCoverage, samplePaths, type Point, type RoadBin } from "@/lib/trace-geometry";
import { LETTERS } from "@/lib/trace-letters";

type Letter = typeof LETTERS[number];
export function TraceBoard({ letter, onComplete }: { letter: Letter; onComplete: () => void }) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const bins = useRef<RoadBin[]>([]);
  const coverage = useRef(new Set<number>());
  const active = useRef<number | null>(null);
  const previous = useRef<Point | undefined>(undefined);
  const lastPointer = useRef<Point | undefined>(undefined);
  const done = useRef(false);
  const [paint, setPaint] = useState<string[]>([]);
  const [truck, setTruck] = useState(() => { const start = letter.paths[0].match(/^M(\d+) (\d+)/)!; return { x: Number(start[1]), y: Number(start[2]), angle: 0 }; });
  const [complete, setComplete] = useState(false);

  function move(event: PointerEvent<SVGSVGElement>) {
    if (done.current) return;
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    if (!bins.current.length) bins.current = samplePaths(paths.current.filter((p): p is SVGPathElement => p !== null));
    const point = { x: event.clientX, y: event.clientY };
    const local = new DOMPoint(point.x, point.y).matrixTransform(matrix.inverse());
    const prev = previous.current;
    const last = lastPointer.current;
    const oldLocal = last ? new DOMPoint(last.x, last.y).matrixTransform(matrix.inverse()) : null;
    lastPointer.current = point;
    setTruck((old) => ({ x: Math.max(25, Math.min(395, local.x)), y: Math.max(25, Math.min(365, local.y)), angle: oldLocal && Math.hypot(local.x - oldLocal.x, local.y - oldLocal.y) > 1 ? Math.atan2(local.y - oldLocal.y, local.x - oldLocal.x) * 180 / Math.PI : old.angle }));
    const accepted = markCoverage(bins.current, coverage.current, point, (p) => ({ x: matrix.a * p.x + matrix.c * p.y + matrix.e, y: matrix.b * p.x + matrix.d * p.y + matrix.f }), prev);
    previous.current = accepted ? point : undefined;
    if (!accepted) return;
    setPaint([...coverage.current].map((i) => { const b = bins.current[i]; return `M${b.start.x} ${b.start.y}L${b.end.x} ${b.end.y}`; }));
    if (tracingComplete(bins.current, coverage.current)) {
      done.current = true; active.current = null; setComplete(true); onComplete();
    }
  }
  function release(event: PointerEvent<SVGSVGElement>) {
    if (active.current !== event.pointerId) return;
    active.current = null; previous.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className={`trace-board ${complete ? "is-complete" : ""}`} data-complete={complete}>
    <svg viewBox="0 0 420 390" className="trace-canvas" role="img" aria-label={`Trace the letter ${letter.name}`} onPointerDown={(event) => {
      if (event.button !== 0 || active.current !== null || done.current) return;
      active.current = event.pointerId; previous.current = undefined; lastPointer.current = undefined;
      event.currentTarget.setPointerCapture(event.pointerId); move(event);
    }} onPointerMove={(event) => { if (active.current === event.pointerId) move(event); }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { active.current = null; previous.current = undefined; }}>
      <title>Drive along {letter.name}</title>
      <desc>Drag your finger along every road. You can lift your finger and try again without losing any progress.</desc>
      {letter.paths.map((d, i) => <g key={d}>
        <path d={d} className="letter-road" />
        <path ref={(node) => { paths.current[i] = node; }} d={d} className="letter-guide" data-stroke={i} />
      </g>)}
      <g className="letter-paint" aria-hidden="true">{complete ? letter.paths.map((d) => <path key={d} d={d} />) : <path d={paint.join(" ")} />}</g>
      <g className="trace-truck" transform={`translate(${truck.x} ${truck.y}) rotate(${truck.angle})`} aria-hidden="true">
        <image href="/assets/monster-truck.png" x="-37" y="-25" width="74" height="50" className="trace-truck-art" />
      </g>
      {complete && <g className="trace-confetti" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <rect key={i} x={30 + (i * 83) % 350} y={30 + (i % 3) * 100} width="9" height="16" rx="3" fill={["#ffb24c", "#389ff4", "#ffe43b", "#5bac79"][i % 4]} style={{ animationDelay: `${i % 4 * 60}ms` }} />)}</g>}
      {complete && <g className="trace-sparkles" aria-hidden="true">{["✦", "★", "✦", "★"].map((star, i) => <text key={i} x={60 + i * 100} y={i % 2 ? 350 : 40}>{star}</text>)}</g>}
    </svg>
  </div>;
}
