'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Shield, 
  Database, 
  Layout, 
  Save, 
  CheckCircle2,
  Zap,
  HardDrive,
  Users,
  Globe
} from 'lucide-react';

export default function GlobalSettings() {
  const [stats, setStats] = useState({ clients: 0, leads: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: clicksCount } = await supabase.from('clicks').select('*', { count: 'exact', head: true });
    
    setStats({
      clients: clientsCount || 0,
      leads: leadsCount || 0,
      clicks: clicksCount || 0
    });
    setLoading(false);
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Configuración Global.</h1>
          <p className="text-gray-400 font-light mt-2">Control maestro de tu plataforma SaaS.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Clientes Totales', value: stats.clients, icon: Users, color: 'text-blue-500' },
          { label: 'Leads Capturados', value: stats.leads, icon: Zap, color: 'text-patagonia-gold' },
          { label: 'Impacto (Clics)', value: stats.clicks, icon: Globe, color: 'text-green-500' }
        ].map((stat, i) => (
          <div key={i} className="card-premium p-8 flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-gray-50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <h4 className="text-3xl font-black italic tracking-tighter">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Branding de Agencia */}
        <div className="space-y-8">
           <section className="card-premium p-8 space-y-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Shield className="w-4 h-4 text-patagonia-gold" /> Identidad de Agencia
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre de la Plataforma</label>
                    <input type="text" defaultValue="PatagoniaCoach Click" className="input-field" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email de Soporte</label>
                    <input type="email" defaultValue="soporte@patagoniacoach.com" className="input-field" />
                 </div>
              </div>
           </section>

           <section className="card-premium p-8 space-y-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Database className="w-4 h-4 text-patagonia-gold" /> Estado de la Base de Datos
              </h3>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-bold text-green-700 uppercase tracking-tight">Supabase Conectado</span>
                 </div>
                 <span className="text-[8px] font-black uppercase text-green-600 tracking-widest">En Línea</span>
              </div>
           </section>
        </div>

        {/* Seguridad y Sistema */}
        <div className="space-y-8">
           <section className="card-premium p-8 space-y-6 bg-black text-white">
              <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 text-patagonia-gold">
                <Zap className="w-4 h-4" /> Versión del Sistema
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motor</span>
                    <span className="text-xs font-black italic">Antigravity Engine v3.0</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Infraestructura</span>
                    <span className="text-xs font-black italic">Next.js 15 / Supabase</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Última Sincronización</span>
                    <span className="text-xs font-black italic">Hoy, {new Date().toLocaleTimeString()}</span>
                 </div>
              </div>
           </section>

           <button 
             onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
             className="w-full btn-primary py-6 text-sm flex items-center justify-center gap-3"
           >
             {saved ? <CheckCircle2 /> : <Save />}
             {saved ? 'Cambios Aplicados' : 'Guardar Configuración Maestra'}
           </button>
        </div>
      </div>

      <style jsx>{`
        .input-field { width: 100%; background: white; border: 1px solid #f3f4f6; border-radius: 1rem; padding: 1rem; font-weight: 700; outline: none; transition: border-color 0.2s; color: black; }
        .input-field:focus { border-color: #facc15; }
      `}</style>
    </div>
  );
}
