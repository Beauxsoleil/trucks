export type Point = { x: number; y: number };
export type RoadBin = { start: Point; end: Point; middle: Point; weight: number; stroke: number };
export type SampledPath = { getTotalLength(): number; getPointAtLength(distance: number): Point };

// Midpoint bins measure physical path length, including independent letter strokes.
export function samplePaths(paths: SampledPath[], spacing = 4): RoadBin[] {
  return paths.flatMap((path, stroke) => {
    const length = path.getTotalLength();
    const count = Math.max(1, Math.ceil(length / spacing));
    return Array.from({ length: count }, (_, i) => ({
      start: path.getPointAtLength(i * length / count),
      end: path.getPointAtLength((i + 1) * length / count),
      middle: path.getPointAtLength((i + 0.5) * length / count),
      weight: length / count,
      stroke,
    }));
  });
}
export function coveredFraction(bins: RoadBin[], covered: Set<number>) {
  const total = bins.reduce((sum, b) => sum + b.weight, 0);
  return total ? bins.reduce((sum, b, i) => sum + (covered.has(i) ? b.weight : 0), 0) / total : 0;
}
export function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function segmentDistance(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x, dy = end.y - start.y;
  const length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length2)) : 0;
  return distance(point, { x: start.x + t * dx, y: start.y + t * dy });
}
// Completion is per stroke: long strokes cannot make up for an unfinished bar.
export function tracingComplete(bins: RoadBin[], covered: Set<number>) {
  if (!bins.length) return false;
  const strokes = new Map<number, { total: number; painted: number; first: number; last: number }>();
  bins.forEach((bin, i) => {
    const stroke = strokes.get(bin.stroke) ?? { total: 0, painted: 0, first: i, last: i };
    stroke.total += bin.weight; stroke.last = i;
    if (covered.has(i)) stroke.painted += bin.weight;
    strokes.set(bin.stroke, stroke);
  });
  return [...strokes.values()].every((s) => s.total > 0 && s.painted / s.total >= 0.95 && covered.has(s.first) && covered.has(s.last));
}
export function markCoverage(bins: RoadBin[], covered: Set<number>, point: Point, transform: (point: Point) => Point, previous?: Point) {
  const screenBins = bins.map((bin) => transform(bin.middle));
  function nearestTo(p: Point) {
    let index = -1, best = Infinity;
    screenBins.forEach((b, i) => { const d = distance(b, p); if (d < best) { index = i; best = d; } });
    return { index, best };
  }
  const nearest = nearestTo(point);
  if (nearest.index < 0 || nearest.best > 35) return false;
  // A finger can reach a visible road cap without hitting its exact center.
  // Credit only the small cap area, including shared junctions; the rest of
  // every stroke still needs 95% coverage. This avoids stranded Y endpoints.
  bins.forEach((bin, index) => {
    for (const direction of [1, -1]) {
      if (bins[index - direction]?.stroke === bin.stroke) continue;
      const endpoint = transform(direction === 1 ? bin.start : bin.end);
      if (distance(point, endpoint) > 12) continue;
      for (let i = index; i >= 0 && i < bins.length && bins[i].stroke === bin.stroke; i += direction) {
        if (distance(screenBins[i], endpoint) > 12) break;
        covered.add(i);
      }
    }
  });
  const stroke = bins[nearest.index].stroke;
  const prev = previous ? nearestTo(previous) : null;
  // A closed loop has one physical start/end point. Nearest-bin tie breaking
  // must not leave its final bin permanently unpainted (O and Q).
  const first = bins.findIndex(bin => bin.stroke === stroke);
  let last = first;
  while (last + 1 < bins.length && bins[last + 1].stroke === stroke) last++;
  if ((nearest.index === first || nearest.index === last) && distance(bins[first].start, bins[last].end) < 0.01) {
    covered.add(first); covered.add(last);
  }
  // A wide sideways hit area still requires actual movement along the road.
  // Only the nearest stroke receives paint; crossing T/I cannot fill their bars.
  let from = nearest.index, to = nearest.index;
  if (previous && prev && prev.index >= 0 && prev.best <= 35 && bins[prev.index].stroke === stroke && distance(previous, point) <= 70) {
    const a = Math.min(prev.index, nearest.index), b = Math.max(prev.index, nearest.index);
    let arc = 0;
    for (let i = a + 1; i <= b; i++) arc += distance(screenBins[i - 1], screenBins[i]);
    if (arc <= 90) { from = a; to = b; }
  }
  for (let i = from; i <= to; i++) if (bins[i].stroke === stroke) covered.add(i);
  // At most five screen pixels of longitudinal forgiveness, not a 35px disk.
  for (const direction of [-1, 1]) {
    let walked = 0;
    for (let i = nearest.index + direction; i >= 0 && i < bins.length && bins[i].stroke === stroke; i += direction) {
      walked += distance(screenBins[i], screenBins[i - direction]);
      if (walked > 5) break;
      covered.add(i);
    }
  }
  return true;
}
