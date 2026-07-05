import { useState } from 'react'
import { useHealth } from './hooks/useHealth'
import { useCreateUser, useUsers } from './hooks/useUsers'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const health = useHealth()
  const users = useUsers()
  const createUser = useCreateUser()
  const authUser = useAuthStore((s) => s.user)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    createUser.mutate(
      { name, email },
      {
        onSuccess: () => {
          setName('')
          setEmail('')
        },
      },
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-neutral-100">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">Camply</h1>
          <p className="text-neutral-400">
            {authUser ? `Signed in as ${authUser.name}` : 'Frontend + Backend scaffold.'}
          </p>
          <span className="w-fit rounded-full border border-neutral-700 px-4 py-1.5 text-sm">
            Backend:{' '}
            <span className="font-mono text-emerald-400">
              {health.isPending ? 'checking…' : (health.data?.status ?? 'unreachable')}
            </span>
          </span>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Users</h2>

          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              disabled={createUser.isPending}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
            >
              {createUser.isPending ? 'Adding…' : 'Add'}
            </button>
          </form>

          {createUser.isError && (
            <p className="text-sm text-red-400">{(createUser.error as Error).message}</p>
          )}

          {users.isPending ? (
            <p className="text-sm text-neutral-500">Loading users…</p>
          ) : users.data && users.data.length > 0 ? (
            <ul className="flex flex-col divide-y divide-neutral-800 rounded-md border border-neutral-800">
              {users.data.map((u) => (
                <li key={u._id} className="flex justify-between px-3 py-2 text-sm">
                  <span>{u.name}</span>
                  <span className="text-neutral-500">{u.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">No users yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
