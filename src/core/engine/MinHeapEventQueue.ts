import { EVENT_TYPE_ORDER, type SimulationEvent } from '../models/SimulationEvent';

interface HeapNode {
  event: SimulationEvent;
  seq: number;
}

/**
 * Binary min-heap of pending simulation events.
 * Ordering: time ASC, then event-type priority ASC, then PID ASC,
 * then insertion order (for total determinism).
 */
export class MinHeapEventQueue {
  private heap: HeapNode[] = [];
  private counter = 0;

  push(event: SimulationEvent): void {
    this.heap.push({ event, seq: this.counter++ });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): SimulationEvent | undefined {
    const top = this.heap[0];
    if (top === undefined) return undefined;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top.event;
  }

  peek(): SimulationEvent | undefined {
    return this.heap[0]?.event;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  get size(): number {
    return this.heap.length;
  }

  private less(a: HeapNode, b: HeapNode): boolean {
    const ea = a.event;
    const eb = b.event;
    if (ea.time !== eb.time) return ea.time < eb.time;
    const ta = EVENT_TYPE_ORDER[ea.type];
    const tb = EVENT_TYPE_ORDER[eb.type];
    if (ta !== tb) return ta < tb;
    const pa = ea.pid ?? Number.MAX_SAFE_INTEGER;
    const pb = eb.pid ?? Number.MAX_SAFE_INTEGER;
    if (pa !== pb) return pa < pb;
    return a.seq < b.seq;
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(this.heap[i]!, this.heap[parent]!)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    const n = this.heap.length;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && this.less(this.heap[left]!, this.heap[smallest]!)) {
        smallest = left;
      }
      if (right < n && this.less(this.heap[right]!, this.heap[smallest]!)) {
        smallest = right;
      }
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.heap[a]!;
    this.heap[a] = this.heap[b]!;
    this.heap[b] = tmp;
  }
}
