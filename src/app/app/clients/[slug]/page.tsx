'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  BarChart3, 
  ArrowLeft, 
  Clock, 
  Globe, 
  Calendar,
  Smartphone,
  ChevronRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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

export default function ClientAnalytics({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Búsqueda Híbrida: Por Slug o por ID
      let query = supabase.from('clients').select('*');
      
      if (slug.includes('-')) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }

      const { data: clientData } = await query.single();

      if (!clientData) {
        setLoading(false);
        return;
      }

      setClient(clientData);

      // Cargar Métricas Reales
      const { data: views } = await supabase.from('page_views').select('*').eq('client_id', clientData.id);
      const { data: clicks } = await supabase.from('clicks').select('*, links(title)').eq('client_id', clientData.id);
      const { data: leads } = await supabase.from('leads').select('*').eq('client_id', clientData.id);

      const totalViews = views?.length || 0;
      const totalClicks = clicks?.length || 0;
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

      setStats({
        views: totalViews,
        clicks: totalClicks,
        leads: leads?.length || 0,
        ctr: ctr
      });

      // Logs de Interacción (IPs y UTMs)
      const combinedLogs = [
        ...(views || []).map(v => ({ ...v, type: 'VIEW' })),
        ...(clicks || []).map(c => ({ ...c, type: 'CLICK' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(combinedLogs.slice(0, 10));

      // Data para Gráfica (Últimas 24 horas)
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const vCount = (views || []).filter(v => new Date(v.created_at).getHours() === hour).length;
        const cCount = (clicks || []).filter(c => new Date(c.created_at).getHours() === hour).length;
        return { hour: `${hour}h`, visitas: vCount, clics: cCount };
      });
      setChartData(hourlyData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!client) return <div className="text-center py-20"><h2 className="text-2xl font-black italic uppercase">Cliente no encontrado</h2><Link href="/app" className="mt-4 inline-block text-patagonia-gold font-bold">Volver al Dashboard</Link></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{client.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${client.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {client.active ? 'En Línea' : 'Pausado'}
              </span>
            </div>
            <p className="text-gray-400 font-medium text-xs mt-1">Reporte de Inteligencia y Conversión</p>
          </div>
        </div>
        <Link href={`/app/clients/${client.slug}/edit`} className="btn-secondary text-[10px] uppercase font-black tracking-widest">
          Configurar Marca
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Visitas Totales" value={stats.views} icon={<Users className="text-blue-500" />} color="blue" />
        <StatCard title="Clics en Enlaces" value={stats.clicks} icon={<MousePointer2 className="text-patagonia-gold" />} color="gold" />
        <StatCard title="Leads Generados" value={stats.leads} icon={<Zap className="text-green-500" />} color="green" />
        <StatCard title="CTR (Efectividad)" value={`${stats.ctr}%`} icon={<TrendingUp className="text-purple-500" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-black italic uppercase text-xs tracking-widest">Mapa de Calor (24h)</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip />
                <Area type="monotone" dataKey="visitas" stroke="#000" fillOpacity={1} fill="url(#colorVisitas)" strokeWidth={3} />
                <Area type="monotone" dataKey="clics" stroke="#D4AF37" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-patagonia-gold" />
            <h3 className="font-black italic uppercase text-xs tracking-widest">Actividad Reciente</h3>
          </div>
          <div className="space-y-4">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-patagonia-gold/30 transition-all group">
                <div className={`p-2 rounded-lg ${log.type === 'VIEW' ? 'bg-blue-50 text-blue-500' : 'bg-patagonia-gold/10 text-patagonia-gold'}`}>
                  {log.type === 'VIEW' ? <Globe className="w-3 h-3" /> : <MousePointer2 className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase leading-none">
                    {log.type === 'VIEW' ? 'Visita Perfil' : `Clic: ${log.links?.title}`}
                  </p>
                  <p className="text-[8px] text-gray-400 mt-1 flex items-center gap-1 font-bold">
                    <Smartphone className="w-2 h-2" /> {log.ip_address} • {format(new Date(log.created_at), 'HH:mm')}
                  </p>
                  {log.utm_source && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-black text-white text-[6px] font-black uppercase tracking-widest rounded">
                      Via: {log.utm_source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="card-premium p-6 group hover:scale-[1.02] transition-all cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-all shadow-sm">
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-patagonia-gold transition-all" />
      </div>
      <div>
        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</h4>
        <p className="text-3xl font-black italic tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
}
