'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X, CheckCircle, Monitor, CircleDot, ServerCrash } from 'lucide-react';
import styles from './machines.module.css';

interface Machine {
  id: string;
  name: string;
  ip: string;
  os: string;
  difficulty: string;
  techniques: string[];
  certifications: string[];
  completedBy?: { id: string; completedAt: string; rating: number | null }[];
}

const OS_OPTIONS = ['Linux', 'Windows'];
const DIFF_OPTIONS = ['Fácil', 'Media', 'Difícil', 'Insane'];
const CERT_OPTIONS = ['eJPT', 'eWPT', 'eWPTXv2', 'OSCP', 'OSEP', 'OSWE', 'eCPPTv3', 'eCPTXv2', 'Active Directory', 'Buffer Overflow'];

function getDiffColor(d: string) {
  switch (d) { case 'Fácil': return 'var(--diff-easy)'; case 'Media': return 'var(--diff-medium)'; case 'Difícil': return 'var(--diff-hard)'; case 'Insane': return 'var(--diff-insane)'; default: return 'var(--text-secondary)'; }
}
function getDiffBg(d: string) {
  switch (d) { case 'Fácil': return 'var(--diff-easy-bg)'; case 'Media': return 'var(--diff-medium-bg)'; case 'Difícil': return 'var(--diff-hard-bg)'; case 'Insane': return 'var(--diff-insane-bg)'; default: return 'transparent'; }
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [os, setOs] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [cert, setCert] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Machine | null>(null);
  const [completing, setCompleting] = useState(false);

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (os) params.set('os', os);
    if (difficulty) params.set('difficulty', difficulty);
    if (cert) params.set('cert', cert);
    params.set('page', String(page));

    const res = await fetch(`/api/machines?${params}`);
    if (res.ok) {
      const data = await res.json();
      setMachines(data.machines);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCompletedCount(data.completedCount);
    }
    setLoading(false);
  }, [search, os, difficulty, cert, page]);

  useEffect(() => { fetchMachines(); }, [fetchMachines]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchDebounce); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const toggleComplete = async (machineId: string) => {
    setCompleting(true);
    const res = await fetch(`/api/machines/${machineId}/complete`, { method: 'POST' });
    if (res.ok) {
      await fetchMachines();
      if (selected) {
        const updated = await fetch(`/api/machines/${machineId}`);
        if (updated.ok) setSelected(await updated.json());
      }
    }
    setCompleting(false);
  };

  const clearFilters = () => { setOs(''); setDifficulty(''); setCert(''); setSearchDebounce(''); setSearch(''); setPage(1); };
  const hasFilters = os || difficulty || cert || search;

  const isCompleted = (m: Machine) => m.completedBy && m.completedBy.length > 0;

  return (
    <div className={styles.machinesPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Máquinas</h1>
          <p>Explora, filtra y completa máquinas de Hack The Box</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <strong>{total}</strong>
            <span>Total</span>
          </div>
          <div className={styles.headerStat}>
            <strong style={{ color: 'var(--success)' }}>{completedCount}</strong>
            <span>Completadas</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre o técnica..."
            value={searchDebounce}
            onChange={e => setSearchDebounce(e.target.value)}
            id="machine-search"
          />
          {searchDebounce && (
            <button onClick={() => setSearchDebounce('')} style={{ background: 'none', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            {OS_OPTIONS.map(o => (
              <button key={o} className={`${styles.filterChip} ${os === o ? styles.active : ''}`}
                onClick={() => { setOs(os === o ? '' : o); setPage(1); }}>
                {o}
              </button>
            ))}
          </div>
          <div className={styles.filterDivider} />
          <div className={styles.filterGroup}>
            {DIFF_OPTIONS.map(d => (
              <button key={d} className={`${styles.filterChip} ${difficulty === d ? styles.active : ''}`}
                onClick={() => { setDifficulty(difficulty === d ? '' : d); setPage(1); }}
                style={difficulty === d ? { borderColor: getDiffColor(d), color: getDiffColor(d) } : {}}>
                {d}
              </button>
            ))}
          </div>
          <div className={styles.filterDivider} />
          <div className={styles.filterGroup}>
            {CERT_OPTIONS.map(c => (
              <button key={c} className={`${styles.filterChip} ${cert === c ? styles.active : ''}`}
                onClick={() => { setCert(cert === c ? '' : c); setPage(1); }}>
                {c}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>Limpiar</button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : machines.length === 0 ? (
        <div className={styles.emptyState}>
          <ServerCrash size={48} />
          <h3>No se encontraron máquinas</h3>
          <p>Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <div className={styles.machineGrid}>
          {machines.map(m => (
            <div key={m.id}
              className={`${styles.machineCard} ${isCompleted(m) ? styles.completed : ''}`}
              onClick={() => setSelected(m)}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.machineName}>{m.name}</div>
                  <div className={styles.machineIP}>{m.ip}</div>
                </div>
                {isCompleted(m) && (
                  <div className={styles.completedCheck}>
                    <CheckCircle size={18} />
                  </div>
                )}
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.osBadge} style={{ color: m.os === 'Linux' ? 'var(--os-linux)' : 'var(--os-windows)' }}>
                  <Monitor size={14} />
                  {m.os}
                </span>
                <span className={styles.diffBadge}
                  style={{ color: getDiffColor(m.difficulty), background: getDiffBg(m.difficulty) }}>
                  {m.difficulty}
                </span>
              </div>
              <div className={styles.cardCerts}>
                {m.certifications.slice(0, 4).map(c => (
                  <span key={c} className={styles.certTag}>{c}</span>
                ))}
                {m.certifications.length > 4 && (
                  <span className={styles.certTag}>+{m.certifications.length - 4}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            let pageNum = i + 1;
            if (totalPages > 7) {
              if (page > 4) pageNum = page - 3 + i;
              if (page > totalPages - 3) pageNum = totalPages - 6 + i;
            }
            if (pageNum < 1 || pageNum > totalPages) return null;
            return (
              <button key={pageNum}
                className={`${styles.pageBtn} ${page === pageNum ? styles.activePage : ''}`}
                onClick={() => setPage(pageNum)}>
                {pageNum}
              </button>
            );
          })}
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalName}>{selected.name}</h2>
                <p className={styles.modalIP}>{selected.ip}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalMeta}>
                <span className={styles.osBadge} style={{ color: selected.os === 'Linux' ? 'var(--os-linux)' : 'var(--os-windows)' }}>
                  <Monitor size={14} />
                  {selected.os}
                </span>
                <span className={styles.diffBadge}
                  style={{ color: getDiffColor(selected.difficulty), background: getDiffBg(selected.difficulty) }}>
                  {selected.difficulty}
                </span>
              </div>

              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Técnicas y Temáticas</h3>
                <div className={styles.techList}>
                  {selected.techniques.map((t, i) => (
                    <div key={i} className={styles.techItem}>
                      <CircleDot size={8} style={{ color: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selected.certifications.length > 0 && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Certificaciones Asociadas</h3>
                  <div className={styles.cardCerts}>
                    {selected.certifications.map(c => (
                      <span key={c} className={styles.certTag}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className={`${styles.completeBtn} ${isCompleted(selected) ? styles.done : styles.pending}`}
                onClick={() => toggleComplete(selected.id)}
                disabled={completing}
                id="complete-machine-btn"
              >
                <CheckCircle size={20} />
                {isCompleted(selected) ? 'Completada' : 'Marcar como Completada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
