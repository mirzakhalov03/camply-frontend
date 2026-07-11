import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { useAuthStore } from '../../store/useAuthStore'
import { useLogin } from '../../api/queries/auth.queries'
import { LanguageSwitcher } from '../auth/LanguageSwitcher'
import { Button, Field } from '../ui'

/*
  The organization login page at /admin/login — a dedicated, deliberately separate
  entry from the participant landing (no cross-link). The org signs in by USERNAME +
  password (dev default admin / 1234); 200 → /admin, 401 → inline error. An already
  authed org visiting it skips straight to the dashboard.

  On-brand pine→deep backdrop (constant brand colors) with a theme-adapting card, so
  dark mode stays intact per the design guardrails.
*/
export function AdminLogin() {
  const { t, selectedLang, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const login = useLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Already signed in as the org → skip the form.
  if (user?.role === 'organization') return <Navigate to="/admin" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    login.mutate(
      { username: username.trim().toLowerCase(), password },
      {
        onSuccess: () => navigate('/admin', { replace: true }),
        // Never reveal which field was wrong — a generic message either way.
        onError: () => setError(t.admin.login.error),
      },
    )
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-pine to-deep">
      <header className="flex items-center justify-between px-5 py-3.5">
        <span className="font-display text-xl font-bold text-white">Camply</span>
        <LanguageSwitcher
          selected={selectedLang}
          onSelect={setLanguage}
          label={t.login.switchLanguage}
        />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-lg"
        >
          <h1 className="text-subhead font-bold text-content">{t.admin.login.title}</h1>
          <p className="mb-5 mt-1 text-caption text-muted">{t.admin.login.subtitle}</p>

          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {t.admin.login.username}
          </label>
          <Field
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />

          <label className="mb-1.5 mt-4 block text-caption font-semibold text-muted">
            {t.admin.login.password}
          </label>
          <Field
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error ? (
            <p role="alert" className="mt-3 text-caption font-semibold text-danger">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={login.isPending || !username || !password}
            className="mt-5"
          >
            {t.admin.login.cta}
          </Button>
        </form>
      </main>
    </div>
  )
}
