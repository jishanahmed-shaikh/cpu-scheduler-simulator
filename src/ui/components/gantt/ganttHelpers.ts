const PALETTE = [
  '#f5c518', '#2f6fed', '#e8590c', '#2b8a3e', '#9c36b5',
  '#0c8599', '#d6336c', '#5c7cfa', '#f08c00', '#37b24d',
];

const assigned = new Map<number, string>();

/** Stable per-PID colour for the session (assigned on first request). */
export function colorForPid(pid: number): string {
  const existing = assigned.get(pid);
  if (existing) return existing;
  const color = PALETTE[assigned.size % PALETTE.length]!;
  assigned.set(pid, color);
  return color;
}

/** Smallest power of 10 giving <= 20 labels across the makespan (Req 17.4). */
export function axisStep(makespan: number): number {
  if (makespan <= 0) return 1;
  let step = 1;
  while (makespan / step > 20) step *= 10;
  return step;
}

export function axisTicks(makespan: number): number[] {
  const step = axisStep(makespan);
  const ticks: number[] = [];
  for (let t = 0; t <= makespan; t += step) ticks.push(t);
  return ticks;
}

export interface VisibleRange {
  start: number;
  end: number;
}

/** Time window currently visible given horizontal scroll (Req 17.5). */
export function visibleTimeRange(
  scrollLeft: number,
  clientWidth: number,
  pixelsPerUnit: number,
): VisibleRange {
  return {
    start: scrollLeft / pixelsPerUnit,
    end: (scrollLeft + clientWidth) / pixelsPerUnit,
  };
}
