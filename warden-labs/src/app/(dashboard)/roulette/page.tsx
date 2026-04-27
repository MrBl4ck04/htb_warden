'use client';

import { useState } from 'react';
import { Dices, Monitor, CircleDot, CheckCircle, RotateCw } from 'lucide-react';
import styles from './roulette.module.css';

interface Machine {
  id: string; name: string; ip: string; os: string; difficulty: string; techniques: string[]; certifications: string[];
}

const OS_OPTIONS = ['', 'Linux', 'Windows'];
const DIFF_OPTIONS = ['', 'Fácil', 'Media', 'Difícil', 'Insane'];

function getDiffColor(d: string) {
  switch (d) { case 'Fácil': return '#4CAF50'; case 'Media': return '#FF9800'; case 'Difícil': return '#F44336'; case 'Insane': return '#9C27B0'; default: return '#888'; }
}

export default function RoulettePage() {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [os, setOs] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const spin = async () => {
    setSpinning(true);
    setMachine(null);
    setCompleted(false);

    // Fake delay for dramatic effect
    await new Promise(r => setTimeout(r, 1500));

    const params = new URLSearchParams();
    if (os) params.set('os', os);
    if (difficulty) params.set('difficulty', difficulty);

    const res = await fetch(`/api/machines/random?${params}`);
    if (res.ok) setMachine(await res.json());
    setSpinning(false);
  };

  const completeMachine = async () => {
    if (!machine) return;
    setCompleting(true);
    const res = await fetch(`/api/machines/${machine.id}/complete`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setCompleted(data.completed);
    }
    setCompleting(false);
  };

  return (
    <div className={styles.roulettePage}>
      <div className={styles.header}>
        <h1>Modo Ruleta</h1>
        <p>Deja que el destino decida tu próximo reto</p>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <label>Sistema Operativo</label>
          <select value={os} onChange={e => setOs(e.target.value)} className={styles.select}>
            {OS_OPTIONS.map(o => <option key={o} value={o}>{o || 'Cualquiera'}</option>)}
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Dificultad</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={styles.select}>
            {DIFF_OPTIONS.map(d => <option key={d} value={d}>{d || 'Cualquiera'}</option>)}
          </select>
        </div>
      </div>

      {/* Spin Button */}
      <div className={styles.spinSection}>
        <button className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`} onClick={spin} disabled={spinning}>
          <div className={styles.spinBtnInner}>
            {spinning ? <RotateCw size={36} className={styles.spinIcon} /> : <Dices size={36} />}
          </div>
          <span>{spinning ? 'Buscando...' : 'GIRAR'}</span>
        </button>
      </div>

      {/* Result */}
      {machine && !spinning && (
        <div className={styles.result}>
          <div className={styles.resultCard}>
            <div className={styles.resultGlow} style={{ background: getDiffColor(machine.difficulty) }} />
            <div className={styles.resultHeader}>
              <h2 className={styles.resultName}>{machine.name}</h2>
              <p className={styles.resultIP}>{machine.ip}</p>
              <div className={styles.resultMeta}>
                <span className={styles.resultOS} style={{ color: machine.os === 'Linux' ? '#FCC624' : '#00ADEF' }}>
                  <Monitor size={16} /> {machine.os}
                </span>
                <span className={styles.resultDiff} style={{
                  color: getDiffColor(machine.difficulty),
                  background: `${getDiffColor(machine.difficulty)}18`
                }}>
                  {machine.difficulty}
                </span>
              </div>
            </div>

            <div className={styles.resultTech}>
              <h3>Técnicas a Practicar</h3>
              <div className={styles.techList}>
                {machine.techniques.map((t, i) => (
                  <div key={i} className={styles.techItem}>
                    <CircleDot size={8} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {machine.certifications.length > 0 && (
              <div className={styles.resultCerts}>
                <h3>Certificaciones</h3>
                <div className={styles.certTags}>
                  {machine.certifications.map(c => (
                    <span key={c} className={styles.certTag}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`${styles.completeBtn} ${completed ? styles.completedBtn : ''}`}
              onClick={completeMachine}
              disabled={completing}
            >
              <CheckCircle size={20} />
              {completed ? 'Completada' : 'Marcar como Completada'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
