'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Terminal, 
  Activity, 
  Clock, 
  Globe, 
  MousePointer2, 
  Zap, 
  Smartphone, 
  Search,
  Filter,
  RefreshCw,
  Database
} from 'lucide-react';

export default function TechnicalLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); 
    return () => clearInterval(interval);
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: views } = await supabase.from('page_views').select('*, clients(name)').order('created_at', { ascending: false }).limit(20);
      const { data: clicks } = await supabase.from('clicks').select('*, clients(name), links(title)').order('created_at', { ascending: false }).limit(20);
      const { data: leads } = await supabase.from('leads').select('*, clients(name)').order('created_at', { ascending: false }).limit(20);

      const allLogs = [
        ...(views || []).map(v => ({ ...v, type: 'VISIT', icon: <Globe className="w-3 h-3 text-blue-500" /> })),
        ...(clicks || []).map(c => ({ ...c, type: 'CLICK', icon: <MousePointer2 className="w-3 h-3 text-patagonia-gold" /> })),
        ...(leads || []).map(l => ({ ...l, type: 'LEAD', icon: <Zap className="w-3 h-3 text-green-500" /> }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(allLogs.slice(0, 50));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-black rounded-2xl text-patagonia-gold shadow-xl shadow-patagonia-gold/10">
              <Terminal className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Console.log</h1>
              <p className="text-gray-400 font-light text-sm mt-1">Monitorización técnica de eventos en tiempo real.</p>
           </div>
        </div>
        <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Forzar Refresh
        </button>
      </div>

      <div className="card-premium bg-[#0D0D0D] border-zinc-800 p-0 overflow-hidden shadow-2xl">
         <div className="bg-zinc-900 px-6 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Master_System_Listener</span>
               <Database className="w-3 h-3 text-zinc-700" />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-bold uppercase text-zinc-500 bg-zinc-900/50">
                     <th className="px-6 py-4">Timestamp</th>
                     <th className="px-6 py-4">Event</th>
                     <th className="px-6 py-4">Client / Target</th>
                     <th className="px-6 py-4">Origin_Meta</th>
                     <th className="px-6 py-4">Marketing_Data</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {logs.map((log, i) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-3 text-[10px] text-zinc-500 whitespace-nowrap">
                           {new Date(log.created_at).toLocaleTimeString()}
                           <span className="opacity-0 group-hover:opacity-100 ml-2 text-[8px]">({new Date(log.created_at).toLocaleDateString()})</span>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex items-center gap-2">
                              {log.icon}
                              <span className={`text-[9px] font-black tracking-tighter px-2 py-0.5 rounded ${
                                log.type === 'VISIT' ? 'bg-blue-500/10 text-blue-400' :
                                log.type === 'CLICK' ? 'bg-patagonia-gold/10 text-patagonia-gold' : 'bg-green-500/10 text-green-400'
                              }`}>{log.type}</span>
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-zinc-200">{(log.clients as any)?.name || 'System'}</p>
                              {log.type === 'CLICK' && <p className="text-[8px] text-zinc-500">Target: {(log.links as any)?.title || 'Link'}</p>}
                              {log.type === 'LEAD' && <p className="text-[8px] text-green-500/50 font-black italic">NEW PROSPECT!</p>}
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex items-center gap-2 text-[9px] text-zinc-400">
                              <Smartphone className="w-3 h-3 opacity-30" />
                              <span className="truncate max-w-[120px]">{log.user_agent || 'Direct_API'}</span>
                              <span className="text-zinc-600">[{log.ip_address || '0.0.0.0'}]</span>
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex flex-wrap gap-1">
                              {log.utm_source && <span className="text-[7px] border border-blue-500/30 text-blue-400 px-1.5 rounded uppercase">src:{log.utm_source}</span>}
                              {log.utm_campaign && <span className="text-[7px] border border-patagonia-gold/30 text-patagonia-gold px-1.5 rounded uppercase">cmp:{log.utm_campaign}</span>}
                              {!log.utm_source && !log.utm_campaign && <span className="text-[7px] text-zinc-700 font-bold uppercase italic tracking-widest">Organic_Direct</span>}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="p-6 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System_Online_Idle</span>
            </div>
            <p className="text-[9px] font-mono text-zinc-600">Row Count: {logs.length} events loaded</p>
         </div>
      </div>
    </div>
  );
}
