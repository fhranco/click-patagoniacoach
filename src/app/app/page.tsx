'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  MousePointer2, 
  Eye, 
  TrendingUp,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  Zap,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalViews: 0,
    totalClicks: 0,
    totalLeads: 0,
    ctr: 0,
    cr: 0 // Conversion Rate (Leads / Clicks)
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debug, setDebug] = useState<any>(null);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const { count: clientsCount, error: e1 } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { count: viewsCount, error: e2 } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
      const { count: clicksCount, error: e3 } = await supabase.from('clicks').select('*', { count: 'exact', head: true });
      const { count: leadsCount, error: e4 } = await supabase.from('leads').select('*', { count: 'exact', head: true });

      if (e1 || e2 || e3 || e4) setDebug({ e1, e2, e3, e4 });

      const v = viewsCount || 0;
      const c = clicksCount || 0;
      const l = leadsCount || 0;

      setStats({
        totalClients: clientsCount || 0,
        totalViews: v,
        totalClicks: c,
        totalLeads: l,
        ctr: v > 0 ? (c / v) * 100 : 0,
        cr: c > 0 ? (l / c) * 100 : 0
      });
    } catch (err: any) {
      setDebug({ fatal: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader /></div>;

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-black">Master Overview.</h1>
          <p className="text-gray-400 font-light text-sm mt-2">Inteligencia en tiempo real de PatagoniaCoach Click.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchStats} className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all active:scale-95 ${refreshing ? 'animate-spin' : ''}`}><RefreshCw className="w-5 h-5" /></button>
          <Link href="/app/clients/new" className="btn-primary flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Nuevo Cliente</Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: 'Clientes', val: stats.totalClients, icon: <Users className="w-5 h-5" />, color: 'bg-black' },
          { label: 'Visitas', val: stats.totalViews, icon: <Eye className="w-5 h-5" />, color: 'bg-zinc-800' },
          { label: 'Clics', val: stats.totalClicks, icon: <MousePointer2 className="w-5 h-5" />, color: 'bg-patagonia-gold' },
          { label: 'Leads', val: stats.totalLeads, icon: <Zap className="w-5 h-5 text-black" />, color: 'bg-white border-2 border-patagonia-gold' },
          { label: 'CTR', val: `${stats.ctr.toFixed(1)}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-500' },
          { label: 'Conversion', val: `${stats.cr.toFixed(1)}%`, icon: <Target className="w-5 h-5" />, color: 'bg-green-500' }
        ].map((m, i) => (
          <div key={i} className="card-premium p-6 flex flex-col justify-between h-44 hover:shadow-2xl hover:-translate-y-1 transition-all">
             <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>{m.icon}</div>
             <div>
                <p className={`text-4xl font-black italic tracking-tighter ${m.label === 'Leads' ? 'text-patagonia-gold' : 'text-black'}`}>{m.val}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{m.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Secciones de acción rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs border-l-4 border-patagonia-gold pl-4">Próximos Pasos</h3>
            <div className="space-y-4">
               <div className="card-premium p-6 flex items-center gap-6">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><PlusCircle /></div>
                  <div>
                     <p className="font-bold text-sm">Añade un nuevo cliente</p>
                     <p className="text-[10px] text-gray-400 uppercase tracking-widest">Empieza a captar leads hoy mismo.</p>
                  </div>
               </div>
               <div className="card-premium p-6 flex items-center gap-6">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><Target /></div>
                  <div>
                     <p className="font-bold text-sm">Optimiza tus conversiones</p>
                     <p className="text-[10px] text-gray-400 uppercase tracking-widest">Revisa qué links tienen más clics.</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="bg-black rounded-[3rem] p-10 text-white flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-patagonia-gold rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 space-y-6">
               <h3 className="text-3xl font-black italic uppercase leading-none tracking-tighter">PatagoniaCoach<br />Click SaaS.</h3>
               <p className="text-gray-400 text-sm font-light max-w-xs">Tu plataforma está operativa y sincronizada con la nube. El motor de Inteligencia Digital está recolectando datos.</p>
            </div>
            <Link href="/app/clients" className="relative z-10 mt-8 py-4 px-8 bg-patagonia-gold text-black rounded-2xl font-black uppercase text-[10px] tracking-widest w-fit hover:scale-105 transition-transform">Gestionar Red</Link>
         </div>
      </div>
    </div>
  );
}

function Loader() {
  return <div className="w-12 h-12 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" />;
}
