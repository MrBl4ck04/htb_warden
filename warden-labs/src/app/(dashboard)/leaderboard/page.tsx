'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import styles from './leaderboard.module.css';

export default function LeaderboardPage() {
  return (
    <div className={styles.leaderboardPage}>
      <div className={styles.header}>
        <h1>Ranking</h1>
        <p>Los mejores hackers de Warden Labs</p>
      </div>

      <div className={styles.comingSoon}>
        <div className={styles.trophyGroup}>
          <Medal size={36} className={styles.medal2} />
          <Trophy size={52} className={styles.trophy} />
          <Award size={36} className={styles.medal3} />
        </div>
        <h2>Próximamente</h2>
        <p>El sistema de ranking se activará cuando haya suficientes usuarios activos. ¡Sigue entrenando!</p>
      </div>
    </div>
  );
}
