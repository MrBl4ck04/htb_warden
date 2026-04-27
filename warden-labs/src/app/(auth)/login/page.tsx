'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Credenciales incorrectas');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
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

          <h2 className={styles.formTitle}>Iniciar Sesión</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
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
                  id="login-email"
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
                  placeholder="••••••••"
                  required
                  id="login-password"
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading} id="login-submit">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className={styles.switchText}>
            ¿No tienes cuenta? <Link href="/register">Crear cuenta</Link>
          </p>

          <p className={styles.ambassador}>
            WARDEN SECURITY × HTB AMBASSADOR LA PAZ, BOLIVIA
          </p>
        </div>
      </div>
    </div>
  );
}
