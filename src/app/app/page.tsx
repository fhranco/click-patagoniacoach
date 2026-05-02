'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  MousePointer2, 
  Eye, 
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalViews: 0,
    totalClicks: 0,
    ctr: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // En una app real, usaríamos funciones de agregación de Supabase o RPCs
      // Para este MVP, haremos consultas paralelas
      const [clients, views, clicks] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('page_views').select('id', { count: 'exact' }),
        supabase.from('clicks').select('id', { count: 'exact' })
      ]);

      const vCount = views.count || 0;
      const cCount = clicks.count || 0;

      setStats({
        totalClients: clients.count || 0,
        totalViews: vCount,
        totalClicks: cCount,
        ctr: vCount > 0 ? (cCount / vCount) * 100 : 0
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const data = [
    { name: 'Lun', visitas: 400, clics: 240 },
    { name: 'Mar', visitas: 300, clics: 139 },
    { name: 'Mie', visitas: 200, clics: 980 },
    { name: 'Jue', visitas: 278, clics: 390 },
    { name: 'Vie', visitas: 189, clics: 480 },
    { name: 'Sab', visitas: 239, clics: 380 },
    { name: 'Dom', visitas: 349, clics: 430 },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">OVERVIEW.</h1>
          <p className="text-gray-400 font-light">Métricas generales de la plataforma PatagoniaCoach Click.</p>
        </div>
        <Link href="/app/clients/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Clientes', value: stats.totalClients, icon: <Users />, color: 'bg-blue-500' },
          { label: 'Visitas Totales', value: stats.totalViews.toLocaleString(), icon: <Eye />, color: 'bg-purple-500' },
          { label: 'Clics Totales', value: stats.totalClicks.toLocaleString(), icon: <MousePointer2 />, color: 'bg-patagonia-gold' },
          { label: 'CTR Promedio', value: `${stats.ctr.toFixed(1)}%`, icon: <TrendingUp />, color: 'bg-green-500' },
        ].map((item, i) => (
          <div key={i} className="card-premium p-6 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl text-white ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div>
              <p className="text-3xl font-black italic tracking-tighter">{item.value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-patagonia-gold" />
                Rendimiento 7 Días
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full" /> Visitas
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-patagonia-gold rounded-full" /> Clics
                 </div>
              </div>
           </div>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="visitas" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitas)" />
                <Area type="monotone" dataKey="clics" stroke="#facc15" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="card-premium space-y-6">
           <h3 className="font-bold">Clientes con más Tráfico</h3>
           <div className="space-y-4">
              {[
                { name: 'Ruta9', slug: '/ruta9', views: 1240 },
                { name: 'Corcoran', slug: '/corcoran', views: 890 },
                { name: 'Orthomed', slug: '/orthomed', views: 560 }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white transition-all border border-transparent hover:border-gray-100 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.slug}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black">{c.views.toLocaleString()}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Visitas</p>
                   </div>
                </div>
              ))}
           </div>
           <Link href="/app/clients" className="block text-center text-[10px] font-black uppercase tracking-widest text-patagonia-gold hover:underline pt-4">
              Ver todos los clientes
           </Link>
        </div>
      </div>
    </div>
  );
}
