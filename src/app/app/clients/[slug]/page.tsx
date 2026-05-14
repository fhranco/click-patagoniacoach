'use client';

import { useEffect, useState, use, useRef } from 'react';
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
  Zap,
  List,
  Download,
  QrCode,
  Layout
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
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ClientAnalytics({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [linkPerformance, setLinkPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Reporte-Autoridad-${client.name}-${format(new Date(), 'MMM-yyyy')}.pdf`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('clients').select('*');
      if (slug.includes('-')) query = query.eq('id', slug);
      else query = query.eq('slug', slug);

      const { data: clientData } = await query.single();
      if (!clientData) {
        setLoading(false);
        return;
      }
      setClient(clientData);

      // ... rest of fetch logic ...
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

      const { data: clientLinks } = await supabase
        .from('links')
        .select('id, title, clicks')
        .eq('client_id', clientData.id)
        .order('clicks', { ascending: false });

      setLinkPerformance(clientLinks || []);

      const combinedLogs = [
        ...(views || []).map(v => ({ ...v, type: 'VIEW' })),
        ...(clicks || []).map(c => ({ ...c, type: 'CLICK' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(combinedLogs.slice(0, 10));

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

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `QR-Elite-${client.slug}.png`;
    link.href = url;
    link.click();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!client) return <div className="text-center py-20"><h2 className="text-2xl font-black italic uppercase">Cliente no encontrado</h2><Link href="/app" className="mt-4 inline-block text-patagonia-gold font-bold">Volver al Dashboard</Link></div>;

  const maxLinkClicks = Math.max(...linkPerformance.map(l => l.clicks), 1);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${client.slug}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
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
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 px-6 py-3 bg-patagonia-gold text-black rounded-xl font-black italic uppercase text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-patagonia-gold/20"
          >
            <FileText className="w-4 h-4" />
            Generar Reporte
          </button>
          <Link href={`/app/clients/${client.slug}/edit`} className="btn-secondary text-[10px] uppercase font-black tracking-widest">
            Configurar Marca
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Visitas Totales" value={stats.views} icon={<Users className="text-blue-500" />} color="blue" />
        <StatCard title="Clics en Enlaces" value={stats.clicks} icon={<MousePointer2 className="text-patagonia-gold" />} color="gold" />
        <StatCard title="Leads Generados" value={stats.leads} icon={<Zap className="text-green-500" />} color="green" />
        <StatCard title="CTR (Efectividad)" value={`${stats.ctr}%`} icon={<TrendingUp className="text-purple-500" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica de Calor */}
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

        {/* Actividad Reciente */}
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RANKING DE ENLACES */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <List className="w-5 h-5 text-patagonia-gold" />
              </div>
              <h3 className="font-black italic uppercase tracking-tighter">Rendimiento de Activos</h3>
            </div>
          </div>
          <div className="space-y-4">
            {linkPerformance.map((link) => (
              <div key={link.id} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">{link.title}</span>
                  <span>{link.clicks} clics</span>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(link.clicks / maxLinkClicks) * 100}%` }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HERRAMIENTAS DE AUTORIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div ref={qrRef} className="p-4 bg-white border-2 border-black rounded-3xl">
            <QRCodeCanvas 
              value={shareUrl}
              size={180}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: client.logo_url || "",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <QrCode className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-black italic uppercase tracking-tighter">QR de Élite</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Genera un activo físico de alta autoridad. Diseñado con geometría estricta para locales de lujo.
            </p>
            <button 
              onClick={downloadQR}
              className="flex items-center gap-2 px-6 py-3 bg-black text-patagonia-gold rounded-xl font-black italic uppercase text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              <Download className="w-4 h-4" />
              Descargar Activo PNG
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-black italic uppercase tracking-tighter">Authority Mode</h3>
           </div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Define el impacto visual de la marca. Alterna entre la pureza del blanco y la exclusividad del negro.
           </p>
           <div className="grid grid-cols-2 gap-4">
              <button 
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${client.authority_mode !== 'dark' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                onClick={() => setClient({...client, authority_mode: 'light'})}
              >
                 <div className="w-full h-8 bg-white border border-gray-200 rounded-lg" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Pure White</span>
              </button>
              <button 
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${client.authority_mode === 'dark' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                onClick={() => setClient({...client, authority_mode: 'dark'})}
              >
                 <div className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded-lg" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-patagonia-gold">Deep Noir</span>
              </button>
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
      {/* PLANTILLA OCULTA PARA PDF (SOLO SE USA PARA CAPTURA) */}
      <div className="fixed -left-[2000px] top-0">
         <div ref={reportRef} className="w-[800px] bg-white p-16 space-y-12 text-black">
            <div className="flex justify-between items-start border-b-2 border-black pb-8">
               <div className="space-y-2">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter">Reporte de Autoridad</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">PatagoniaCoach Click Network • {format(new Date(), 'MMMM yyyy', { locale: es })}</p>
               </div>
               <div className="w-20 h-20 bg-black flex items-center justify-center text-patagonia-gold font-black italic text-3xl rounded-2xl">
                  {client.name?.[0]}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
               <div className="p-8 border-2 border-black rounded-3xl space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visitas Totales</p>
                  <p className="text-4xl font-black italic">{stats?.views}</p>
               </div>
               <div className="p-8 border-2 border-black rounded-3xl space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interacciones</p>
                  <p className="text-4xl font-black italic">{stats?.clicks}</p>
               </div>
               <div className="p-8 border-2 border-black rounded-3xl space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Leads Generados</p>
                  <p className="text-4xl font-black italic">{stats?.leads}</p>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-black italic uppercase tracking-tighter border-l-4 border-patagonia-gold pl-4">Rendimiento de Activos Digitales</h3>
               <div className="space-y-4">
                  {linkPerformance.slice(0, 5).map(link => (
                    <div key={link.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                       <span className="font-bold uppercase text-xs tracking-tight">{link.title}</span>
                       <span className="font-black italic text-patagonia-gold">{link.clicks} clics</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-20 border-t border-gray-100 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-patagonia-gold" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verificado por PatagoniaCoach Agency</span>
               </div>
               <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest italic">Documento confidencial para uso estratégico exclusivo.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
