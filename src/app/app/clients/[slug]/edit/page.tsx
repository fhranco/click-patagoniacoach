'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Link as LinkIcon, 
  Palette, 
  Settings2,
  ExternalLink,
  MessageCircle,
  Globe,
  GripVertical,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function EditClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'links'>('brand');

  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    brand_color: '#000000',
    theme: 'neutral',
    phone: '',
    whatsapp: '',
    address: '',
    lead_capture_active: false,
    lead_capture_text: '',
    lead_capture_type: 'whatsapp'
  });

  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Cargar datos del Cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', slug)
        .single();

      if (clientError) throw clientError;
      setFormData(client);

      // 2. Cargar sus Enlaces
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('client_id', client.id)
        .order('position', { ascending: true });

      setLinks(linksData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', formData.id);
      
      if (error) throw error;
      alert('¡Configuración de marca guardada! 🏔️✨');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addLink = async () => {
    const newLink = {
      client_id: formData.id,
      title: 'Nuevo Enlace',
      url: 'https://',
      position: links.length,
      active: true
    };
    
    const { data, error } = await supabase.from('links').insert(newLink).select().single();
    if (data) setLinks([...links, data]);
  };

  const updateLink = async (id: string, updates: any) => {
    const { error } = await supabase.from('links').update(updates).eq('id', id);
    if (!error) {
      setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este enlace?')) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) setLinks(links.filter(l => l.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/clients/${slug}`} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Configurar Cliente</h1>
            <p className="text-gray-400 font-medium text-xs mt-1">Marca, Enlaces y Herramientas</p>
          </div>
        </div>
      </div>

      {/* Tabs Estilo Patagonia */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Palette className="w-4 h-4" /> Marca y Estilo
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LinkIcon className="w-4 h-4" /> Gestionar Enlaces
        </button>
      </div>

      {activeTab === 'brand' ? (
        <form onSubmit={handleClientSave} className="space-y-6">
          <div className="card-premium p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-2">
                 <Settings2 className="w-4 h-4 text-patagonia-gold" /> Identidad Visual
               </h3>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Comercial</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Slug (URL)</label>
                    <input type="text" value={formData.slug} disabled className="input-premium opacity-50 bg-gray-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">URL del Logo</label>
                    <input 
                      type="text" 
                      value={formData.logo_url} 
                      onChange={e => setFormData({...formData, logo_url: e.target.value})}
                      className="input-premium"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-2">
                 <Palette className="w-4 h-4 text-patagonia-gold" /> Personalización
               </h3>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Color de Marca</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={formData.brand_color} 
                        onChange={e => setFormData({...formData, brand_color: e.target.value})}
                        className="w-12 h-12 rounded-xl cursor-pointer border-4 border-white shadow-sm"
                      />
                      <input 
                        type="text" 
                        value={formData.brand_color} 
                        onChange={e => setFormData({...formData, brand_color: e.target.value})}
                        className="input-premium flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tema Visual</label>
                    <select 
                      value={formData.theme} 
                      onChange={e => setFormData({...formData, theme: e.target.value})}
                      className="input-premium"
                    >
                      <option value="neutral">Neutral (Blanco Institucional)</option>
                      <option value="stealth">Stealth (Black Edition)</option>
                      <option value="glass">Glassmorphism (Efecto Cristal)</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button disabled={saving} className="btn-primary px-10 py-4 flex items-center gap-2">
              <Save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-patagonia-gold" /> Lista de Enlaces Activos
            </h3>
            <button onClick={addLink} className="btn-secondary text-[10px] py-2 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Botón
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={link.id} className="card-premium p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-patagonia-gold/30 transition-all">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className="p-3 bg-gray-50 rounded-xl text-gray-300 group-hover:text-patagonia-gold transition-all">
                      <GripVertical className="w-5 h-5 cursor-grab" />
                   </div>
                   <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-patagonia-gold shadow-lg">
                      <SmartIconPreview url={link.url} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400">Título del Botón</label>
                      <input 
                        type="text" 
                        value={link.title} 
                        onChange={e => updateLink(link.id, { title: e.target.value })}
                        className="input-premium py-2 text-xs"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400">URL de Destino</label>
                      <input 
                        type="text" 
                        value={link.url} 
                        onChange={e => updateLink(link.id, { url: e.target.value })}
                        className="input-premium py-2 text-xs"
                      />
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => updateLink(link.id, { active: !link.active })}
                    className={`p-3 rounded-xl border transition-all ${link.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                   >
                      <CheckCircle2 className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}

            {links.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                <LinkIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hay enlaces configurados</p>
                <button onClick={addLink} className="mt-4 text-patagonia-gold font-black italic uppercase text-xs">Crea el primero ahora</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SmartIconPreview({ url }: { url: string }) {
  const lower = (url || '').toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-5 h-5" />;
  if (lower.includes('instagr')) return <div className="w-5 h-5 border-2 border-current rounded-md relative"><div className="absolute top-1 right-1 w-1 h-1 bg-current rounded-full"></div></div>;
  if (lower.includes('facebo')) return <span className="font-black text-xl leading-none">f</span>;
  return <Globe className="w-5 h-5" />;
}
