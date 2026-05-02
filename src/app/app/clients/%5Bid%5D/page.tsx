'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Client, Link as LinkType } from '@/types';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ExternalLink, 
  BarChart2, 
  Settings,
  MousePointerClick,
  Eye,
  Check,
  Save,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener Cliente
      const { data: clientData } = await supabase.from('clients').select('*').eq('id', id).single();
      setClient(clientData);

      // 2. Obtener Links
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('client_id', id)
        .order('position', { ascending: true });
      setLinks(linksData || []);

      // 3. Obtener Stats (Simulado por ahora para MVP rápido)
      const { count: vCount } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('client_id', id);
      const { count: cCount } = await supabase.from('clicks').select('*', { count: 'exact', head: true }).eq('client_id', id);
      setStats({ views: vCount || 0, clicks: cCount || 0 });

      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const addLink = async () => {
    const newLink = {
      client_id: id,
      title: 'Nuevo Enlace',
      url: 'https://',
      position: links.length,
      active: true
    };

    const { data, error } = await supabase.from('links').insert(newLink).select().single();
    if (!error) setLinks([...links, data]);
  };

  const updateLink = async (linkId: string, updates: Partial<LinkType>) => {
    const { error } = await supabase.from('links').update(updates).eq('id', linkId);
    if (!error) {
      setLinks(links.map(l => l.id === linkId ? { ...l, ...updates } : l));
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este enlace?')) return;
    const { error } = await supabase.from('links').delete().eq('id', linkId);
    if (!error) setLinks(links.filter(l => l.id !== linkId));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-10 h-10 animate-spin text-patagonia-gold" /></div>;
  if (!client) return <div>Cliente no encontrado</div>;

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
           <div 
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl"
            style={{ backgroundColor: client.brand_color }}
           >
             {client.name[0]}
           </div>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">{client.name}</h1>
                <Link href={`/${client.slug}`} target="_blank" className="p-2 bg-gray-100 rounded-lg hover:text-patagonia-gold transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-gray-400 font-light">{client.description}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={addLink} className="btn-primary">
             <Plus className="w-5 h-5" />
             Añadir Botón
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card-premium p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
               <Eye className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black italic tracking-tighter">{stats.views.toLocaleString()}</p>
               <p className="text-[10px] uppercase font-bold text-gray-400">Visitas Totales</p>
            </div>
         </div>
         <div className="card-premium p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-patagonia-gold/10 rounded-2xl flex items-center justify-center text-patagonia-gold">
               <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black italic tracking-tighter">{stats.clicks.toLocaleString()}</p>
               <p className="text-[10px] uppercase font-bold text-gray-400">Clics Totales</p>
            </div>
         </div>
         <div className="card-premium p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
               <BarChart2 className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black italic tracking-tighter">
                  {stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : 0}%
               </p>
               <p className="text-[10px] uppercase font-bold text-gray-400">Tasa de Clics (CTR)</p>
            </div>
         </div>
      </div>

      {/* Links Editor */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold italic tracking-tight">GESTIÓN DE ENLACES.</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{links.length} Botones Activos</span>
         </div>
         
         <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="card-premium p-6 flex flex-col md:flex-row items-center gap-6">
                 <div className="cursor-grab text-gray-200">
                    <GripVertical className="w-6 h-6" />
                 </div>
                 
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-300 tracking-widest ml-2">Título del Botón</label>
                       <input 
                        type="text" 
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-patagonia-gold font-bold transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-gray-300 tracking-widest ml-2">URL de Destino</label>
                       <input 
                        type="text" 
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-patagonia-gold text-sm text-gray-500 transition-all font-mono"
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateLink(link.id, { active: !link.active })}
                      className={`p-4 rounded-2xl transition-all ${link.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteLink(link.id)}
                      className="p-4 rounded-2xl bg-red-50 text-red-400 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
            
            {links.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <Plus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-light">Crea tu primer enlace estratégico.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
