export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'fácil': return 'var(--diff-easy)';
    case 'media': return 'var(--diff-medium)';
    case 'difícil': return 'var(--diff-hard)';
    case 'insane': return 'var(--diff-insane)';
    default: return 'var(--text-secondary)';
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'fácil': return 'var(--diff-easy-bg)';
    case 'media': return 'var(--diff-medium-bg)';
    case 'difícil': return 'var(--diff-hard-bg)';
    case 'insane': return 'var(--diff-insane-bg)';
    default: return 'transparent';
  }
}

export function getOSIcon(os: string): string {
  switch (os.toLowerCase()) {
    case 'linux': return 'linux';
    case 'windows': return 'windows';
    default: return 'server';
  }
}

export function getOSColor(os: string): string {
  switch (os.toLowerCase()) {
    case 'linux': return 'var(--os-linux)';
    case 'windows': return 'var(--os-windows)';
    default: return 'var(--text-secondary)';
  }
}

export function getCertColor(cert: string): string {
  const colors: Record<string, string> = {
    'eJPT': '#4CAF50',
    'eWPT': '#2196F3',
    'eWPTXv2': '#1565C0',
    'OSCP': '#FF5722',
    'OSEP': '#E91E63',
    'OSWE': '#9C27B0',
    'OSED': '#7B1FA2',
    'OSWP': '#00BCD4',
    'eCPPTv3': '#FF9800',
    'eCPTXv2': '#F57C00',
    'Active Directory': '#FFC107',
    'Buffer Overflow': '#F44336',
    'Mobile': '#8BC34A',
  };
  return colors[cert] || '#888888';
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function calculateStreakStatus(lastActivityDate: Date | null): 'active' | 'warning' | 'lost' {
  if (!lastActivityDate) return 'lost';
  const now = new Date();
  const last = new Date(lastActivityDate);
  const diffMs = now.getTime() - last.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 24) return 'active';
  if (diffHours <= 48) return 'warning';
  return 'lost';
}

export function getStreakBadge(streak: number): { name: string; icon: string } | null {
  if (streak >= 365) return { name: 'Legendary Warden', icon: 'crown' };
  if (streak >= 90) return { name: 'Unstoppable', icon: 'zap' };
  if (streak >= 60) return { name: 'Relentless', icon: 'flame' };
  if (streak >= 30) return { name: 'Month Master', icon: 'trophy' };
  if (streak >= 14) return { name: 'Consistent Hacker', icon: 'target' };
  if (streak >= 7) return { name: 'Week Warrior', icon: 'shield' };
  return null;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
