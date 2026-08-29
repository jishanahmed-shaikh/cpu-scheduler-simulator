import { useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

/** Non-blocking notice shown for 5s when localStorage is unavailable (Req 15.5). */
export function StorageWarning() {
  const { storageUnavailable } = useSimulation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!storageUnavailable) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(id);
  }, [storageUnavailable]);

  if (!visible) return null;
  return (
    <div className="storage-warning" role="status">
      Local storage is unavailable — leaderboard scores will not be saved permanently.
    </div>
  );
}
