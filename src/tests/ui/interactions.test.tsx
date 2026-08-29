import { afterEach, describe, expect, it } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axisStep, axisTicks, colorForPid } from '../../ui/components/gantt/ganttHelpers';
import { GanttChart } from '../../ui/components/gantt/GanttChart';
import { DecisionInspector } from '../../ui/components/DecisionInspector';
import { SimulationControls } from '../../ui/components/SimulationControls';
import { renderWithProviders } from './renderApp';

describe('gantt helpers', () => {
  it('axis step is the smallest power of 10 giving <= 20 labels', () => {
    expect(axisStep(15)).toBe(1);
    expect(axisStep(45)).toBe(10);
    expect(axisStep(2500)).toBe(1000);
    expect(axisTicks(30)).toEqual([0, 10, 20, 30]);
  });

  it('assigns a stable colour per PID', () => {
    const first = colorForPid(101);
    expect(colorForPid(101)).toBe(first);
    expect(colorForPid(102)).not.toBe(first);
  });
});

describe('Gantt segment -> DecisionInspector', () => {
  afterEach(cleanup);

  it('clicking a rendered segment shows the engine-derived explanation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SimulationControls />
        <GanttChart />
        <DecisionInspector />
      </>,
    );
    const step = screen.getByRole('button', { name: /Step/ });
    for (let i = 0; i < 12; i += 1) await user.click(step);

    const segment = screen
      .getAllByRole('button')
      .find((el) => /^P\d/.test(el.textContent ?? '') && el.className.includes('gantt__segment'));
    expect(segment).toBeDefined();
    await user.click(segment!);
    expect(await screen.findByText(/was chosen because/)).toBeInTheDocument();
  });
});
