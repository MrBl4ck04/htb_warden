'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Flame, Monitor, Route, Dices, TrendingUp, Award, ChevronRight, Server } from 'lucide-react';
import styles from './home.module.css';

interface Stats {
  totalCompleted: number;
  totalMachines: number;
  completionRate: number;
  osCounts: Record<string, number>;
  diffCounts: Record<string, number>;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
}

interface PathInfo {
  path: { name: string; slug: string; totalWeeks: number; color: string };
  currentWeek: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [paths, setPaths] = useState<PathInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setStreak(data.streak);
          setPaths(data.activePaths);
        }
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  const username = session?.user?.name || 'Hacker';

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Hero Welcome */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Bienvenido, <span>{username}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Tu laboratorio de entrenamiento en ciberseguridad está listo
          </p>
        </div>
        {streak && streak.currentStreak > 0 && (
          <div className={styles.heroStreak}>
            <Flame size={28} />
            <div>
              <span className={styles.streakNum}>{streak.currentStreak}</span>
              <span className={styles.streakLabel}>días de racha</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-subtle)' }}>
            <Monitor size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.totalCompleted || 0}</span>
            <span className={styles.statLabel}>Máquinas Completadas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-bg)' }}>
            <TrendingUp size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.completionRate || 0}%</span>
            <span className={styles.statLabel}>Progreso Total</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-bg)' }}>
            <Flame size={22} style={{ color: 'var(--warning)' }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{streak?.longestStreak || 0}</span>
            <span className={styles.statLabel}>Mejor Racha</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
            <Award size={22} style={{ color: 'var(--info)' }} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{paths.length}</span>
            <span className={styles.statLabel}>Paths Activos</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/machines" className={styles.actionCard}>
          <Server size={28} />
          <div>
            <h3>Explorar Máquinas</h3>
            <p>Busca y filtra entre {stats?.totalMachines || 0}+ máquinas</p>
          </div>
          <ChevronRight size={20} />
        </Link>
        <Link href="/paths" className={styles.actionCard}>
          <Route size={28} />
          <div>
            <h3>Road To Certificación</h3>
            <p>Prepárate para eJPT, OSCP, eWPT y más</p>
          </div>
          <ChevronRight size={20} />
        </Link>
        <Link href="/roulette" className={styles.actionCard}>
          <Dices size={28} />
          <div>
            <h3>Modo Ruleta</h3>
            <p>Deja que el destino elija tu próximo reto</p>
          </div>
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* Active Paths */}
      {paths.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tus Paths Activos</h2>
          <div className={styles.pathsList}>
            {paths.map(p => {
              const progress = Math.round((p.currentWeek / p.path.totalWeeks) * 100);
              return (
                <Link key={p.path.slug} href={`/paths/${p.path.slug}`} className={styles.pathItem}>
                  <div className={styles.pathColorBar} style={{ background: p.path.color }} />
                  <div className={styles.pathInfo}>
                    <h4>{p.path.name}</h4>
                    <span className={styles.pathWeek}>Semana {p.currentWeek} de {p.path.totalWeeks}</span>
                  </div>
                  <div className={styles.pathProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progress}%`, background: p.path.color }} />
                    </div>
                    <span>{progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* OS Breakdown */}
      {stats && Object.keys(stats.osCounts).length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Máquinas por Sistema Operativo</h2>
          <div className={styles.osGrid}>
            {Object.entries(stats.osCounts).map(([os, count]) => (
              <div key={os} className={styles.osCard}>
                <span className={styles.osName}>{os}</span>
                <span className={styles.osCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
