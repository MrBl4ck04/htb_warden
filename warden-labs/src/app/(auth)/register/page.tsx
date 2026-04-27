'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock } from 'lucide-react';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch {
      setError('Error al crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.logoSection}>
            <Image src="/warden1.webp" alt="Warden" width={180} height={52} className={styles.logoImage} priority />
            <h1 className={styles.logoTitle}>WARDEN <span>LABS</span></h1>
            <p className={styles.logoSubtitle}>Entrena. Hackea. Certifícate.</p>
          </div>

          <h2 className={styles.formTitle}>Crear Cuenta</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="tu_username"
                  required
                  id="register-username"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  id="register-email"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  id="register-password"
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading} id="register-submit">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className={styles.switchText}>
            ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
          </p>

          <p className={styles.ambassador}>
            WARDEN SECURITY × HTB AMBASSADOR LA PAZ, BOLIVIA
          </p>
        </div>
      </div>
    </div>
  );
}
