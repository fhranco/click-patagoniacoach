'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/app');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA] p-6 relative overflow-hidden">
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-patagonia-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-black/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20">
            <Zap className="w-8 h-8 text-patagonia-gold fill-patagonia-gold" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">PatagoniaCoach</h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Acceso Restringido a Partners</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100 space-y-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                <input 
                  type="email" 
                  placeholder="Email de Agencia" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs outline-none border-2 focus:border-patagonia-gold focus:bg-white transition-all text-black"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black transition-colors" />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs outline-none border-2 focus:border-patagonia-gold focus:bg-white transition-all text-black"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-tight animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Validando...' : (
                <>Entrar al Sistema <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">© 2026 Patagoniacoach Media Group</p>
          </div>
        </div>
      </div>
    </div>
  );
}
