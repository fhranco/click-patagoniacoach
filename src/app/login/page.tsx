'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales inválidas. Intenta de nuevo.');
      setLoading(false);
    } else {
      router.push('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full space-y-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
            <Zap className="text-patagonia-gold w-10 h-10 fill-patagonia-gold" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Click Admin</h1>
            <p className="text-gray-400 font-light text-sm">Panel de Control Estratégico</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="card-premium p-10 space-y-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email del Administrador</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input 
                    required
                    type="email" 
                    placeholder="admin@agenciapatagoniacoach.cl"
                    className="input-patagonia pl-14 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="input-patagonia pl-14 text-sm font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar al Ecosistema <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-300">
          Propiedad exclusiva de Agencia PatagoniaCoach
        </p>
      </div>
    </div>
  );
}
