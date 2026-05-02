'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Settings2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setClients(data || []);
    setLoading(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Clientes.</h1>
          <p className="text-gray-400 font-light">Gestiona las páginas públicas de tus marcas locales.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-patagonia-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none text-sm w-full md:w-64 focus:ring-4 focus:ring-patagonia-gold/10 focus:border-patagonia-gold transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Link href="/app/clients/new" className="btn-primary">
             <Plus className="w-5 h-5" />
             <span className="hidden md:inline">Añadir</span>
           </Link>
        </div>
      </div>

      {/* Clients Table / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full bg-white animate-pulse rounded-3xl" />
          ))
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              className="card-premium group p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:translate-x-2 transition-transform cursor-pointer"
            >
              <Link href={`/app/clients/${client.id}`} className="flex flex-1 items-center gap-6 w-full">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner"
                  style={{ backgroundColor: client.brand_color, color: '#fff' }}
                >
                  {client.name[0]}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight">{client.name}</h3>
                    {client.active ? (
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Activo
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <XCircle className="w-2.5 h-2.5" /> Inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <p className="font-mono">/{client.slug}</p>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <p>{new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Link 
                  href={`/${client.slug}`} 
                  target="_blank"
                  className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-patagonia-gold hover:bg-patagonia-gold/10 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
                <Link 
                  href={`/app/clients/${client.id}`}
                  className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                >
                  <Settings2 className="w-5 h-5" />
                </Link>
                <Link 
                  href={`/app/clients/${client.id}`}
                  className="ml-4 p-4 rounded-2xl bg-black text-white group-hover:bg-patagonia-gold group-hover:text-black transition-all shadow-lg shadow-black/5"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-light">No se encontraron clientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
