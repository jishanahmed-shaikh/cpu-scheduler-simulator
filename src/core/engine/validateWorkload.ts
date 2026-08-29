import {
  PROCESS_FIELD_RANGES,
  type ProcessFieldName,
  type ProcessInput,
} from '../models/Process';
import type { ValidationError } from '../models/GanttSegment';

const FIELDS: ProcessFieldName[] = ['pid', 'arrivalTime', 'burstTime', 'priority'];

/**
 * Validates a workload before any scheduling begins (Requirements 1.2, 1.3, 1.5).
 * Zero-burst processes are NOT a hard error here — they are handled by the
 * engine as instantaneous completions (see docs/decisions/0001). Negative or
 * fractional bursts, out-of-range fields, wrong types, duplicate PIDs, and an
 * empty workload all reject the entire workload.
 */
export function validateWorkload(processes: readonly ProcessInput[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (processes.length === 0) {
    errors.push({ code: 'EMPTY_WORKLOAD', details: {} });
    return errors;
  }

  const seen = new Set<number>();
  processes.forEach((p, processIndex) => {
    for (const field of FIELDS) {
      const value = p[field];
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push({
          code: 'INVALID_FIELD_TYPE',
          details: { pid: p.pid, field, expectedType: 'number', actualType: typeof value },
        });
        continue;
      }
      if (!Number.isInteger(value)) {
        errors.push({
          code: 'FIELD_OUT_OF_RANGE',
          details: { pid: p.pid, field, value, reason: 'not an integer' },
        });
        continue;
      }
      if (field === 'burstTime') {
        if (value < 0) {
          errors.push({ code: 'INVALID_BURST_TIME', details: { pid: p.pid, value } });
        } else if (value > PROCESS_FIELD_RANGES.burstTime.max) {
          errors.push({
            code: 'FIELD_OUT_OF_RANGE',
            details: { pid: p.pid, field, value, min: 0, max: PROCESS_FIELD_RANGES.burstTime.max },
          });
        }
        continue;
      }
      const range = PROCESS_FIELD_RANGES[field];
      if (value < range.min || value > range.max) {
        errors.push({
          code: 'FIELD_OUT_OF_RANGE',
          details: { pid: p.pid, field, value, min: range.min, max: range.max },
        });
      }
    }

    if (typeof p.pid === 'number' && Number.isInteger(p.pid)) {
      if (seen.has(p.pid)) {
        errors.push({ code: 'DUPLICATE_PID', details: { pid: p.pid, processIndex } });
      }
      seen.add(p.pid);
    }
  });

  return errors;
}
