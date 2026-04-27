'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Search, Route, Dices, UserCircle, Trophy,
  LogOut, Menu, X, Flame
} from 'lucide-react';
import { SessionProvider } from 'next-auth/react';
import styles from './dashboard.module.css';

const navItems = [
  { section: 'Principal', items: [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/machines', icon: Search, label: 'Máquinas' },
    { href: '/paths', icon: Route, label: 'Road To' },
  ]},
  { section: 'Extras', items: [
    { href: '/roulette', icon: Dices, label: 'Ruleta' },
    { href: '/leaderboard', icon: Trophy, label: 'Ranking' },
  ]},
  { section: 'Cuenta', items: [
    { href: '/profile', icon: UserCircle, label: 'Mi Perfil' },
  ]},
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const username = session?.user?.name || 'Hacker';
  const initial = username.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className={styles.dashLayout}>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Image src="/warden1.webp" alt="Warden" width={100} height={30} className={styles.sidebarLogo} />
          <span className={styles.sidebarBrand}>
            WARDEN <span>LABS</span>
          </span>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(section => (
            <div key={section.section} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.section}</div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={styles.navIcon} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{initial}</div>
            <span className={styles.userName}>{username}</span>
          </div>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.streakBadge}>
              <Flame className={styles.streakIcon} />
              <span>0</span>
            </div>
          </div>
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
