'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Layers, BarChart3 } from 'lucide-react';
import styles from './paths.module.css';

interface CertPath {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  totalWeeks: number;
  estimatedHours: number;
  level: string;
  weeks: { machines: unknown[] }[];
  userPaths?: { currentWeek: number }[];
}

export default function PathsPage() {
  const [paths, setPaths] = useState<CertPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/paths').then(r => r.json()).then(data => {
      setPaths(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.pathsPage}><p style={{ color: 'var(--text-secondary)' }}>Cargando paths...</p></div>;

  return (
    <div className={styles.pathsPage}>
      <div className={styles.header}>
        <h1>Road To — Prepárate para tu Certificación</h1>
        <p>Elige tu objetivo y sigue un plan semanal de máquinas desde los fundamentos hasta lo avanzado</p>
      </div>

      <div className={styles.pathsGrid}>
        {paths.map(path => {
          const totalMachines = path.weeks.reduce((acc, w) => acc + w.machines.length, 0);
          const enrolled = path.userPaths && path.userPaths.length > 0;
          const currentWeek = enrolled ? path.userPaths![0].currentWeek : 0;
          const progress = enrolled ? Math.round((currentWeek / path.totalWeeks) * 100) : 0;

          return (
            <Link key={path.id} href={`/paths/${path.slug}`} className={styles.pathCard}
              style={{ '--path-color': path.color } as React.CSSProperties}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: path.color }} />

              <div className={styles.pathCardHeader}>
                <div className={styles.pathIcon} style={{ background: `${path.color}15`, color: path.color }}>
                  <BarChart3 size={22} />
                </div>
                <span className={styles.pathLevel}>{path.level}</span>
              </div>

              <h3 className={styles.pathName}>{path.name}</h3>
              <p className={styles.pathDesc}>{path.description}</p>

              <div className={styles.pathMeta}>
                <span className={styles.pathMetaItem}>
                  <Calendar size={14} />
                  <strong>{path.totalWeeks}</strong> semanas
                </span>
                <span className={styles.pathMetaItem}>
                  <Layers size={14} />
                  <strong>{totalMachines}</strong> máquinas
                </span>
                <span className={styles.pathMetaItem}>
                  <Clock size={14} />
                  ~<strong>{path.estimatedHours}</strong>h
                </span>
              </div>

              {enrolled && (
                <div className={styles.pathProgress}>
                  <div className={styles.progressInfo}>
                    <span>Semana {currentWeek} de {path.totalWeeks}</span>
                    <span style={{ color: path.color }}>{progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%`, background: path.color }} />
                  </div>
                </div>
              )}

              <div className={`${styles.pathAction} ${enrolled ? styles.continueBtn : styles.startBtn}`}
                style={enrolled ? { borderColor: path.color, color: path.color } : { background: path.color }}>
                {enrolled ? 'Continuar' : 'Comenzar Path'}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
