'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  ExternalLink, 
  BarChart3, 
  Settings, 
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          links (count),
          page_views (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Gestión de Clientes</h1>
          <p className="text-gray-400 font-medium text-sm mt-1">Administra marcas, enlaces y accesos privados.</p>
        </div>
        <Link href="/app/clients/new" className="btn-primary flex items-center gap-2 py-4 px-8">
          <Plus className="w-5 h-5" /> Nuevo Cliente
        </Link>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-patagonia-gold transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o slug..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-black/5 outline-none font-bold text-sm focus:ring-2 focus:ring-patagonia-gold/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
             <div className="w-8 h-8 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.map((client) => (
          <div key={client.id} className="card-premium p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-patagonia-gold/30 transition-all">
            <div className="flex items-center gap-6 w-full md:w-auto">
               <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex-shrink-0">
                  {client.logo_url ? (
                    <img src={client.logo_url} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-patagonia-gold font-black text-xl italic">
                      {client.name[0]}
                    </div>
                  )}
               </div>
               <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none truncate">{client.name}</h3>
                    {client.active ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/{client.slug}</p>
                    <button 
                      onClick={() => copyToClipboard(client.slug, client.id)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all text-[8px] font-black uppercase tracking-tighter ${copiedId === client.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-black hover:text-white'}`}
                    >
                      {copiedId === client.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      {copiedId === client.id ? 'Copiado' : 'Copiar Enlace'}
                    </button>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-around border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visitas</p>
                  <p className="text-xl font-black italic">{client.page_views?.[0]?.count || 0}</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enlaces</p>
                  <p className="text-xl font-black italic">{client.links?.[0]?.count || 0}</p>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <Link 
                href={`/app/clients/${client.slug}`}
                className="flex-1 md:flex-none p-4 bg-gray-50 text-black rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
               >
                  <BarChart3 className="w-4 h-4" /> Reporte
               </Link>
               <Link 
                href={`/app/clients/${client.slug}/edit`}
                className="flex-1 md:flex-none p-4 bg-patagonia-gold/10 text-patagonia-gold rounded-2xl hover:bg-patagonia-gold hover:text-white transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
               >
                  <Settings className="w-4 h-4" /> Configurar
               </Link>
               <a 
                href={`/${client.slug}`} 
                target="_blank"
                className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-black transition-all"
               >
                  <Eye className="w-5 h-5" />
               </a>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold uppercase text-xs">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
