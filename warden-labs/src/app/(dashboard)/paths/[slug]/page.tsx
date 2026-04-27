'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Layers, Lock, CheckCircle, ChevronDown, ChevronUp, Monitor } from 'lucide-react';
import styles from '../paths.module.css';

interface PathWeekMachine {
  machine: {
    id: string;
    name: string;
    ip: string;
    os: string;
    difficulty: string;
    techniques: string[];
    completedBy?: { id: string }[];
  };
  orderNum: number;
}

interface PathWeek {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  focus: string;
  machines: PathWeekMachine[];
}

interface PathDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  totalWeeks: number;
  estimatedHours: number;
  level: string;
  weeks: PathWeek[];
  userPaths?: { currentWeek: number; startedAt: string }[];
}

export default function PathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [path, setPath] = useState<PathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [enrolling, setEnrolling] = useState(false);

  const fetchPath = async () => {
    const res = await fetch(`/api/paths/${slug}`);
    if (res.ok) setPath(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchPath(); }, [slug]);

  const enrolled = path?.userPaths && path.userPaths.length > 0;
  const currentWeek = enrolled ? path!.userPaths![0].currentWeek : 0;

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(weekNum) ? next.delete(weekNum) : next.add(weekNum);
      return next;
    });
  };

  const enroll = async () => {
    setEnrolling(true);
    await fetch(`/api/paths/${slug}/enroll`, { method: 'POST' });
    await fetchPath();
    setEnrolling(false);
  };

  const completeMachine = async (machineId: string) => {
    await fetch(`/api/machines/${machineId}/complete`, { method: 'POST' });
    await fetchPath();
  };

  const isWeekCompleted = (week: PathWeek) => {
    return week.machines.every(wm => wm.machine.completedBy && wm.machine.completedBy.length > 0);
  };

  const isWeekUnlocked = (weekNum: number) => {
    if (!enrolled) return false;
    if (weekNum === 1) return true;
    const prevWeek = path!.weeks.find(w => w.weekNumber === weekNum - 1);
    return prevWeek ? isWeekCompleted(prevWeek) : false;
  };

  const getWeekStatus = (week: PathWeek) => {
    if (isWeekCompleted(week)) return 'completed';
    if (isWeekUnlocked(week.weekNumber)) return 'current';
    return 'locked';
  };

  // Calculate overall progress
  const totalMachines = path?.weeks.reduce((acc, w) => acc + w.machines.length, 0) || 0;
  const completedMachines = path?.weeks.reduce((acc, w) =>
    acc + w.machines.filter(wm => wm.machine.completedBy && wm.machine.completedBy.length > 0).length, 0) || 0;
  const overallProgress = totalMachines > 0 ? Math.round((completedMachines / totalMachines) * 100) : 0;

  if (loading) return <div className={styles.detailPage}><p style={{ color: 'var(--text-secondary)' }}>Cargando path...</p></div>;
  if (!path) return <div className={styles.detailPage}><p>Path no encontrado</p></div>;

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeader} style={{ '--path-color': path.color } as React.CSSProperties}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: path.color }} />
        <Link href="/paths" className={styles.backLink}>
          <ArrowLeft size={16} /> Volver a Paths
        </Link>
        <h1 className={styles.detailTitle}>Road To {path.name}</h1>
        <p className={styles.detailDesc}>{path.description}</p>
        <div className={styles.detailMeta}>
          <span className={styles.detailMetaItem}><Calendar size={16} /> <strong>{path.totalWeeks}</strong> semanas</span>
          <span className={styles.detailMetaItem}><Layers size={16} /> <strong>{totalMachines}</strong> máquinas</span>
          <span className={styles.detailMetaItem}><Clock size={16} /> ~<strong>{path.estimatedHours}</strong> horas</span>
        </div>
      </div>

      {!enrolled && (
        <button className={styles.enrollBtn} onClick={enroll} disabled={enrolling} style={{ background: path.color }}>
          {enrolling ? 'Inscribiendo...' : 'Comenzar este Path'}
        </button>
      )}

      {enrolled && (
        <div className={styles.globalProgress}>
          <div className={styles.globalProgressHeader}>
            <span className={styles.globalProgressTitle}>Progreso General</span>
            <span className={styles.globalProgressPercent} style={{ color: path.color }}>{overallProgress}%</span>
          </div>
          <div className={styles.bigProgressBar}>
            <div className={styles.bigProgressFill} style={{ width: `${overallProgress}%`, background: path.color }} />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {completedMachines} de {totalMachines} máquinas completadas
          </p>
        </div>
      )}

      <div className={styles.weeksTimeline}>
        {path.weeks.map(week => {
          const status = enrolled ? getWeekStatus(week) : 'locked';
          const isExpanded = expandedWeeks.has(week.weekNumber);
          const weekCompleted = week.machines.filter(wm => wm.machine.completedBy && wm.machine.completedBy.length > 0).length;

          return (
            <div key={week.id} className={`${styles.weekCard} ${styles[status]}`}>
              <div className={styles.weekHeader} onClick={() => status !== 'locked' && toggleWeek(week.weekNumber)}>
                <div className={`${styles.weekNum} ${
                  status === 'completed' ? styles.completedNum :
                  status === 'current' ? styles.currentNum : styles.lockedNum
                }`} style={status === 'completed' ? { background: path.color, borderColor: path.color } :
                  status === 'current' ? { borderColor: path.color, color: path.color } : {}}>
                  {status === 'completed' ? <CheckCircle size={18} /> :
                   status === 'locked' ? <Lock size={14} /> : week.weekNumber}
                </div>
                <div className={styles.weekInfo}>
                  <div className={styles.weekTitle}>Semana {week.weekNumber}: {week.title}</div>
                  <div className={styles.weekFocus}>{week.focus} — {weekCompleted}/{week.machines.length} completadas</div>
                </div>
                <span className={styles.weekStatus} style={
                  status === 'completed' ? { background: 'var(--success-bg)', color: 'var(--success)' } :
                  status === 'current' ? { background: `${path.color}15`, color: path.color } :
                  { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }
                }>
                  {status === 'completed' ? 'Completada' : status === 'current' ? 'En progreso' : 'Bloqueada'}
                </span>
                {status !== 'locked' && (isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />)}
              </div>

              {isExpanded && status !== 'locked' && (
                <div className={styles.weekMachines}>
                  {week.machines.map(wm => {
                    const done = wm.machine.completedBy && wm.machine.completedBy.length > 0;
                    return (
                      <div key={wm.machine.id} className={styles.weekMachine}>
                        <div className={`${styles.wmCheck} ${done ? styles.wmDone : ''}`}
                          style={done ? { background: path.color, borderColor: path.color } : {}}>
                          {done && <CheckCircle size={14} />}
                        </div>
                        <div className={styles.wmInfo}>
                          <div className={styles.wmName}>{wm.machine.name}</div>
                          <div className={styles.wmMeta}>
                            <Monitor size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            {wm.machine.os} · {wm.machine.difficulty} · {wm.machine.techniques.length} técnicas
                          </div>
                        </div>
                        {done ? (
                          <button className={styles.wmCompletedBtn} onClick={() => completeMachine(wm.machine.id)}>
                            Completada
                          </button>
                        ) : (
                          <button className={styles.wmCompleteBtn} onClick={() => completeMachine(wm.machine.id)}
                            style={{ color: path.color, background: `${path.color}10` }}>
                            Completar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
