'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Contraseña incorrecta');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest font-serif text-zinc-100 mb-2">
            Archivo ALSIL
          </h1>
          <p className="text-zinc-500 text-sm">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800/50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-600/50 transition placeholder:text-zinc-600"
              placeholder="Ingresa la contraseña"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-zinc-600 hover:text-zinc-400 text-xs transition">
            ← Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}
