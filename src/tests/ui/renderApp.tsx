import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { SimulationProvider } from '../../ui/context/SimulationProvider';
import { SelectedEventProvider } from '../../ui/context/SelectedEventContext';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <SimulationProvider>
      <SelectedEventProvider>{ui}</SelectedEventProvider>
    </SimulationProvider>,
  );
}
