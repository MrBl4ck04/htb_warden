'use client';

import { useEffect, useState } from 'react';
import { Flame, Monitor, Target, Clock, TrendingUp, Award, Shield, Zap, Crown, Trophy, Star } from 'lucide-react';
import styles from './profile.module.css';

interface ProfileData {
  user: { username: string; email: string; createdAt: string };
  stats: {
    totalCompleted: number; totalMachines: number; completionRate: number;
    osCounts: Record<string, number>; diffCounts: Record<string, number>;
    topTechniques: { name: string; count: number }[]; estimatedHours: number;
  };
  streak: { currentStreak: number; longestStreak: number; totalDaysActive: number; lastActivityDate: string | null };
  activePaths: { path: { name: string; slug: string; totalWeeks: number; color: string }; currentWeek: number }[];
  recentActivity: { completedAt: string; machine: { name: string; os: string; difficulty: string } }[];
  heatmap: Record<string, number>;
}

const STREAK_BADGES = [
  { min: 365, name: 'Legendary Warden', icon: Crown, color: '#FFD700' },
  { min: 90, name: 'Unstoppable', icon: Zap, color: '#FF5722' },
  { min: 60, name: 'Relentless', icon: Flame, color: '#FF9800' },
  { min: 30, name: 'Month Master', icon: Trophy, color: '#4CAF50' },
  { min: 14, name: 'Consistent Hacker', icon: Target, color: '#2196F3' },
  { min: 7, name: 'Week Warrior', icon: Shield, color: '#9C27B0' },
];

function getDiffColor(d: string) {
  switch (d) { case 'Fácil': return '#4CAF50'; case 'Media': return '#FF9800'; case 'Difícil': return '#F44336'; case 'Insane': return '#9C27B0'; default: return '#888'; }
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile/stats').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /><p>Cargando perfil...</p></div>;
  if (!data) return <div>Error al cargar el perfil</div>;

  const currentBadge = STREAK_BADGES.find(b => data.streak.currentStreak >= b.min);
  const earnedBadges = STREAK_BADGES.filter(b => data.streak.longestStreak >= b.min);

  return (
    <div className={styles.profilePage}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {data.user.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <h1>{data.user.username}</h1>
          <p>{data.user.email}</p>
          <span className={styles.joinDate}>
            Miembro desde {new Date(data.user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Streak Section */}
      <div className={styles.streakSection}>
        <div className={styles.streakMain}>
          <Flame size={32} className={styles.streakFlame} />
          <div>
            <span className={styles.streakNumber}>{data.streak.currentStreak}</span>
            <span className={styles.streakText}>Racha Actual</span>
          </div>
        </div>
        <div className={styles.streakStats}>
          <div className={styles.streakStat}>
            <strong>{data.streak.longestStreak}</strong>
            <span>Mejor racha</span>
          </div>
          <div className={styles.streakStat}>
            <strong>{data.streak.totalDaysActive}</strong>
            <span>Días activo</span>
          </div>
        </div>
        {currentBadge && (
          <div className={styles.currentBadge} style={{ borderColor: `${currentBadge.color}40`, background: `${currentBadge.color}10` }}>
            <currentBadge.icon size={20} style={{ color: currentBadge.color }} />
            <span style={{ color: currentBadge.color }}>{currentBadge.name}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Monitor size={20} style={{ color: 'var(--accent)' }} />
          <div className={styles.statValue}>{data.stats.totalCompleted}</div>
          <div className={styles.statLabel}>Máquinas</div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={20} style={{ color: 'var(--success)' }} />
          <div className={styles.statValue}>{data.stats.completionRate}%</div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
        <div className={styles.statCard}>
          <Clock size={20} style={{ color: 'var(--info)' }} />
          <div className={styles.statValue}>{data.stats.estimatedHours}h</div>
          <div className={styles.statLabel}>Horas Estimadas</div>
        </div>
        <div className={styles.statCard}>
          <Award size={20} style={{ color: 'var(--warning)' }} />
          <div className={styles.statValue}>{data.activePaths.length}</div>
          <div className={styles.statLabel}>Paths</div>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Difficulty Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Por Dificultad</h2>
          <div className={styles.diffGrid}>
            {['Fácil', 'Media', 'Difícil', 'Insane'].map(d => (
              <div key={d} className={styles.diffItem}>
                <div className={styles.diffBar}>
                  <div className={styles.diffFill}
                    style={{
                      height: `${Math.min(((data.stats.diffCounts[d] || 0) / Math.max(data.stats.totalCompleted, 1)) * 100, 100)}%`,
                      background: getDiffColor(d)
                    }}
                  />
                </div>
                <span className={styles.diffCount} style={{ color: getDiffColor(d) }}>{data.stats.diffCounts[d] || 0}</span>
                <span className={styles.diffLabel}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Techniques */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Técnicas</h2>
          <div className={styles.techList}>
            {data.stats.topTechniques.slice(0, 8).map((t, i) => (
              <div key={t.name} className={styles.techItem}>
                <span className={styles.techRank}>#{i + 1}</span>
                <span className={styles.techName}>{t.name}</span>
                <span className={styles.techCount}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Insignias Desbloqueadas</h2>
          <div className={styles.badgesGrid}>
            {STREAK_BADGES.map(badge => {
              const earned = data.streak.longestStreak >= badge.min;
              return (
                <div key={badge.name} className={`${styles.badge} ${earned ? styles.badgeEarned : styles.badgeLocked}`}
                  style={earned ? { borderColor: `${badge.color}40`, background: `${badge.color}08` } : {}}>
                  <badge.icon size={24} style={{ color: earned ? badge.color : 'var(--text-muted)' }} />
                  <span className={styles.badgeName} style={{ color: earned ? badge.color : 'var(--text-muted)' }}>{badge.name}</span>
                  <span className={styles.badgeReq}>{badge.min}+ días</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
          <div className={styles.activityList}>
            {data.recentActivity.slice(0, 10).map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <Star size={14} style={{ color: 'var(--accent)' }} />
                <span className={styles.activityName}>{a.machine.name}</span>
                <span className={styles.activityMeta}>{a.machine.os} · {a.machine.difficulty}</span>
                <span className={styles.activityDate}>
                  {new Date(a.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
