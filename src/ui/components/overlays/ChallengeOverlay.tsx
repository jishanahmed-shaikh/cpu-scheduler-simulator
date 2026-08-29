import { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { schedulerLabel } from '../../context/schedulerChoice';
import { leaderboardKey, validatePlayerName, formatTimestamp } from '../../../game/LeaderboardService';
import { useChallengeSession } from './useChallengeSession';
import type { Difficulty } from '../../../game/ChallengeModeController';

export function ChallengeOverlay() {
  const { choice, leaderboard, setActiveMode } = useSimulation();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const { view, answer } = useChallengeSession(difficulty);
  const [name, setName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const err = validatePlayerName(name);
    if (err) return setSaveError(err);
    leaderboard.addEntry(leaderboardKey(schedulerLabel(choice), 'challenge'), {
      playerName: name,
      score: view.score,
      algorithmName: schedulerLabel(choice),
      modeName: 'challenge',
      timestamp: formatTimestamp(),
    });
    setSaved(true);
  };

  return (
    <aside className="overlay overlay--challenge" aria-label="Challenge mode">
      <header className="overlay__head">
        <h2>Challenge Mode</h2>
        <span>Score {view.score} · Streak {view.streak}</span>
      </header>

      {!view.complete && (
        <>
          <label className="overlay__difficulty">
            Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              <option value="easy">Easy (2 options)</option>
              <option value="medium">Medium (3 options)</option>
              <option value="hard">Hard (4 options)</option>
            </select>
          </label>
          <p className="overlay__hint">Which process does {schedulerLabel(choice)} run next?</p>
          <div className="overlay__candidates">
            {view.candidates.map((p) => (
              <button key={p.pid} type="button" onClick={() => answer(p.pid)}>
                P{p.pid}
                <small>burst {p.burstTime} · pri {p.priority}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {view.lastResult && !view.complete && (
        <p className={`overlay__verdict ${view.lastResult.correct ? 'is-correct' : 'is-wrong'}`} role="status">
          {view.lastResult.correct
            ? `Correct! +${view.lastResult.pointsAwarded}`
            : `Not quite — it was P${view.lastResult.correctPid}.`}
        </p>
      )}

      {view.complete && (
        <div className="overlay__final">
          <p role="status">Session complete. Final score: <strong>{view.score}</strong>.</p>
          {!saved ? (
            <>
              <label>
                Name for the leaderboard
                <input value={name} maxLength={32} onChange={(e) => setName(e.target.value)} />
              </label>
              {saveError && <p role="alert" className="overlay__error">{saveError}</p>}
              <div className="overlay__actions">
                <button type="button" onClick={save}>Save score</button>
                <button type="button" onClick={() => setActiveMode('free')}>Discard</button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setActiveMode('free')}>Back to Free Run</button>
          )}
        </div>
      )}
    </aside>
  );
}
