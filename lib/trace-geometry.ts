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
export function markCoverage(bins: RoadBin[], covered: Set<number>, point: Point, transform: (point: Point) => Point, previous?: Point) {
  const screenBins = bins.map((bin) => transform(bin.middle));
  let nearest = -1, best = Infinity;
  screenBins.forEach((p, i) => { const d = distance(p, point); if (d < best) { nearest = i; best = d; } });
  if (best > 35) return false;
  // Interpolate only short connected moves. Jumps never paint skipped sections.
  const connected = previous && distance(previous, point) <= 70 && screenBins.some((p, i) => bins[i].stroke === bins[nearest].stroke && distance(p, previous) <= 35);
  screenBins.forEach((p, i) => {
    const d = connected && bins[i].stroke === bins[nearest].stroke ? segmentDistance(p, previous!, point) : distance(p, point);
    if (d <= 35) covered.add(i);
  });
  return true;
}
