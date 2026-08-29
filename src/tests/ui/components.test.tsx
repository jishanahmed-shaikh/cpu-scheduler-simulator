import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulationControls } from '../../ui/components/SimulationControls';
import { MetricsPanel } from '../../ui/components/MetricsPanel';
import { ProcessTable } from '../../ui/components/ProcessTable';
import { renderWithProviders } from './renderApp';

describe('SimulationControls', () => {
  afterEach(cleanup);

  it('steps through events and disables Play when complete', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SimulationControls />);
    const step = screen.getByRole('button', { name: /Step/ });
    for (let i = 0; i < 40; i += 1) await user.click(step);
    expect(await screen.findByText(/Simulation complete/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Play/ })).toBeDisabled();
  });
});

describe('MetricsPanel', () => {
  afterEach(cleanup);

  it('marks the highest and lowest waiting-time rows once the run finishes', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SimulationControls />
        <MetricsPanel />
      </>,
    );
    for (let i = 0; i < 40; i += 1) await user.click(screen.getByRole('button', { name: /Step/ }));
    const table = screen.getByRole('table');
    expect(table.querySelector('tr.is-max')).not.toBeNull();
    expect(table.querySelector('tr.is-min')).not.toBeNull();
  });
});

describe('ProcessTable', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('replaces the table when a scenario is picked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProcessTable />);
    await user.selectOptions(screen.getByLabelText('Load a predefined scenario'), 'SINGLE_PROCESS');
    const body = screen.getAllByRole('rowgroup')[1]!;
    expect(within(body).getAllByRole('row')).toHaveLength(1);
  });
});
