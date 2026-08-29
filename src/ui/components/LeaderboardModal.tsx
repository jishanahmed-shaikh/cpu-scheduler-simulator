import { useSimulation } from '../context/SimulationContext';
import { schedulerLabel } from '../context/schedulerChoice';
import { leaderboardKey } from '../../game/LeaderboardService';

export function LeaderboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { leaderboard, choice } = useSimulation();
  const algo = schedulerLabel(choice);

  if (!open) return null;

  const boards = (['challenge', 'optimize'] as const).map((mode) => ({
    mode,
    entries: leaderboard.getEntries(leaderboardKey(algo, mode)),
  }));

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Leaderboard">
      <div className="modal__card">
        <header className="modal__head">
          <h2>Leaderboard — {algo}</h2>
          <button type="button" onClick={onClose} aria-label="Close leaderboard">✕</button>
        </header>

        {boards.map(({ mode, entries }) => (
          <section key={mode} className="modal__board">
            <h3>{mode}</h3>
            {entries.length === 0 ? (
              <p>No scores yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Score</th>
                    <th scope="col">When</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={`${e.rank}-${e.timestamp}`}>
                      <td>{e.rank}</td>
                      <td>{e.playerName}</td>
                      <td>{e.score}</td>
                      <td>{e.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
