import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SimulationEvent } from '../../core/models/SimulationEvent';

interface SelectedEventValue {
  selected: SimulationEvent | null;
  select: (event: SimulationEvent | null) => void;
}

const SelectedEventContext = createContext<SelectedEventValue | null>(null);

export function SelectedEventProvider({ children }: { children: ReactNode }) {
  const [selected, select] = useState<SimulationEvent | null>(null);
  const value = useMemo(() => ({ selected, select }), [selected]);
  return <SelectedEventContext.Provider value={value}>{children}</SelectedEventContext.Provider>;
}

export function useSelectedEvent(): SelectedEventValue {
  const value = useContext(SelectedEventContext);
  if (!value) throw new Error('useSelectedEvent must be used within a SelectedEventProvider');
  return value;
}
