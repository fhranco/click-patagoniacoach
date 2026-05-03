'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  ExternalLink, 
  Trash2, 
  Settings, 
  ChevronRight, 
  MousePointer2, 
  Eye, 
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  Download,
  Activity,
  Globe,
  Monitor,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const [client, setClient] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'links' | 'leads' | 'analytics'>('links');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    const { data: clientData } = await supabase.from('clients').select('*').eq('slug', slug).single();
    if (clientData) {
      setClient(clientData);
      
      const { data: linksData } = await supabase.from('links').select('*').eq('client_id', clientData.id).order('position', { ascending: true });
      setLinks(linksData || []);

      const { data: leadsData } = await supabase.from('leads').select('*').eq('client_id', clientData.id).order('created_at', { ascending: false });
      setLeads(leadsData || []);

      const { data: clicksData } = await supabase.from('clicks').select('*, links(title)').eq('client_id', clientData.id).order('created_at', { ascending: false });
      setClicks(clicksData || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-2xl font-black italic">CARGANDO INTELIGENCIA...</div>;

  // PROCESAMIENTO DE ANALÍTICA (Horas y Días)
  const hourlyData = Array(24).fill(0);
  const dailyData: { [key: string]: number } = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 };
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  clicks.forEach(click => {
    const date = new Date(click.created_at);
    hourlyData[date.getHours()]++;
    dailyData[dayNames[date.getDay()]]++;
  });

  const maxHourly = Math.max(...hourlyData) || 1;

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link href="/app/clients" className="p-4 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{client.name}</h1>
            <p className="text-gray-400 text-sm font-mono mt-1">/{client.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/${slug}`} target="_blank" className="btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 border-black/5">
              <ExternalLink className="w-4 h-4" /> Ver Página Pública
           </Link>
           <Link href={`/app/clients/${slug}/edit`} className="btn-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Settings className="w-4 h-4" /> Configurar Marca
           </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Visitas', val: clicks.length, icon: <Eye />, color: 'bg-black' },
          { label: 'Clics', val: clicks.length, icon: <MousePointer2 />, color: 'bg-patagonia-gold' },
          { label: 'Leads', val: leads.length, icon: <Users />, color: 'bg-zinc-800' },
          { label: 'Links', val: links.length, icon: <Activity />, color: 'bg-gray-100 text-black' }
        ].map((m, i) => (
          <div key={i} className="card-premium p-6 flex flex-col justify-between h-36">
             <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>{m.icon}</div>
             <div>
                <p className="text-3xl font-black italic tracking-tighter">{m.val}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{m.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 pb-4">
        {['links', 'leads', 'analytics'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {tab === 'links' ? 'Enlaces' : tab === 'leads' ? 'Prospectos' : 'Analítica Pro'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'links' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tight">Gestionar Enlaces</h2>
                <button className="btn-primary py-2 px-4 text-[10px]"><Plus className="w-4 h-4" /> Añadir Link</button>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {links.map((link) => (
                  <div key={link.id} className="card-premium p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300"><ExternalLink /></div>
                      <div>
                        <h4 className="font-bold">{link.title}</h4>
                        <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-black italic">{link.clicks || 0} clics</span>
                       <button className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Gráfico de Horas */}
                <section className="card-premium p-8 space-y-8">
                   <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2"><Clock className="w-4 h-4" /> Tráfico por Hora (Hoy)</h3>
                   <div className="flex items-end justify-between h-40 gap-1 px-2">
                      {hourlyData.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                           <div 
                             className="w-full bg-patagonia-gold/20 hover:bg-patagonia-gold transition-all rounded-t-sm"
                             style={{ height: `${(val / maxHourly) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                           />
                           <span className="text-[6px] font-bold text-gray-300 rotate-90 mt-2">{i}h</span>
                           {val > 0 && (
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}</div>
                           )}
                        </div>
                      ))}
                   </div>
                </section>

                {/* Gráfico de Días */}
                <section className="card-premium p-8 space-y-8">
                   <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2"><Calendar className="w-4 h-4" /> Días de Mayor Interacción</h3>
                   <div className="space-y-4">
                      {Object.entries(dailyData).map(([day, val]) => (
                        <div key={day} className="flex items-center gap-4">
                           <span className="w-8 text-[10px] font-black uppercase text-gray-400">{day}</span>
                           <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                              <div className="h-full bg-black" style={{ width: `${(val / (clicks.length || 1)) * 100}%` }} />
                           </div>
                           <span className="text-[10px] font-black">{val}</span>
                        </div>
                      ))}
                   </div>
                </section>
             </div>

             {/* Tabla de Clics Recientes */}
             <section className="card-premium p-8 space-y-6 overflow-hidden">
                <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2"><Globe className="w-4 h-4" /> Registro Detallado de Clics</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="pb-4">Link</th>
                            <th className="pb-4">Hora / Fecha</th>
                            <th className="pb-4">Dirección IP</th>
                            <th className="pb-4">Dispositivo</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {clicks.slice(0, 20).map((click, i) => (
                            <tr key={i} className="text-xs group hover:bg-gray-50/50 transition-all">
                               <td className="py-4 font-bold">{(click.links as any)?.title || 'Link Eliminado'}</td>
                               <td className="py-4 text-gray-400">{new Date(click.created_at).toLocaleString()}</td>
                               <td className="py-4 font-mono text-[10px]">{click.ip_address || '0.0.0.0'}</td>
                               <td className="py-4 flex items-center gap-2">
                                  <Monitor className="w-3 h-3 opacity-20" />
                                  <span className="truncate max-w-[150px] text-[8px] uppercase tracking-tighter opacity-40">{click.user_agent}</span>
                                </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tight">Base de Datos de Prospectos</h2>
                <button className="btn-secondary py-2 px-4 text-[10px] flex items-center gap-2"><Download className="w-4 h-4" /> Exportar CSV</button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="card-premium p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-patagonia-gold/10 text-patagonia-gold rounded-full flex items-center justify-center font-black">{lead.name[0]}</div>
                      <div>
                        <h4 className="font-bold">{lead.name}</h4>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                           <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {lead.whatsapp || '--'}</span>
                           <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email || '--'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Smartphone({ className }: { className?: string }) { return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>; }
function MailIcon({ className }: { className?: string }) { return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
