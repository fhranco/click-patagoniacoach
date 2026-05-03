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
  CheckCircle2,
  Layout,
  Type,
  Link2
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
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', slug)
        .single();

      if (clientError) throw clientError;
      setFormData(client);

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
      alert('¡Configuración guardada con éxito! 🏔️✨');
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
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-6">
          <Link href={`/app/clients/${slug}`} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Configuración Elite</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Control Maestro de Marca y Conversión</p>
          </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.25rem]">
          <button 
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Palette className="w-4 h-4" /> Marca
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Link2 className="w-4 h-4" /> Enlaces
          </button>
        </div>
      </div>

      {activeTab === 'brand' ? (
        <form onSubmit={handleClientSave} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD: IDENTIDAD */}
            <div className="card-premium p-10 space-y-8 bg-white border-gray-100 shadow-2xl shadow-black/[0.02]">
               <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                 <div className="p-3 bg-black rounded-xl"><Type className="w-5 h-5 text-patagonia-gold" /></div>
                 <h3 className="font-black italic uppercase text-sm tracking-widest">Identidad de Marca</h3>
               </div>
               
               <div className="space-y-6">
                  <InputField 
                    label="Nombre Comercial" 
                    value={formData.name} 
                    onChange={v => setFormData({...formData, name: v})} 
                  />
                  <InputField 
                    label="Descripción Corta (Slogan)" 
                    value={formData.description} 
                    onChange={v => setFormData({...formData, description: v})} 
                  />
                  <InputField 
                    label="URL del Logo (Alta Res)" 
                    value={formData.logo_url} 
                    onChange={v => setFormData({...formData, logo_url: v})} 
                  />
               </div>
            </div>

            {/* CARD: ESTILO Y TEMA */}
            <div className="card-premium p-10 space-y-8 bg-white border-gray-100 shadow-2xl shadow-black/[0.02]">
               <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                 <div className="p-3 bg-black rounded-xl"><Layout className="w-5 h-5 text-patagonia-gold" /></div>
                 <h3 className="font-black italic uppercase text-sm tracking-widest">Estética y Color</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Color Principal de Agencia</label>
                    <div className="flex gap-4">
                      <input 
                        type="color" 
                        value={formData.brand_color} 
                        onChange={e => setFormData({...formData, brand_color: e.target.value})}
                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl flex-shrink-0"
                      />
                      <input 
                        type="text" 
                        value={formData.brand_color} 
                        onChange={e => setFormData({...formData, brand_color: e.target.value})}
                        className="flex-1 px-6 bg-gray-50 border-none rounded-2xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-patagonia-gold/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Arquitectura de Tema</label>
                    <select 
                      value={formData.theme} 
                      onChange={e => setFormData({...formData, theme: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/20 transition-all cursor-pointer"
                    >
                      <option value="neutral">Neutral (Pure White & Black)</option>
                      <option value="stealth">Stealth (Midnight Onyx)</option>
                      <option value="glass">Glass (Frosted Transparency)</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <button disabled={saving} className="btn-primary px-12 py-5 flex items-center gap-3 shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all">
              <Save className="w-6 h-6" /> 
              <span className="font-black uppercase italic tracking-widest text-xs">{saving ? 'Guardando...' : 'Aplicar Cambios'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-black italic uppercase text-xs tracking-[0.3em] flex items-center gap-3 text-gray-400">
              <Link2 className="w-5 h-5 text-patagonia-gold" /> Estructura de Enlaces
            </h3>
            <button onClick={addLink} className="btn-secondary py-3 px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" /> Inyectar Botón
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="card-premium p-8 flex flex-col lg:flex-row items-center gap-8 group hover:border-patagonia-gold/30 transition-all bg-white shadow-xl shadow-black/[0.01]">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                   <div className="p-4 bg-gray-50 rounded-2xl text-gray-200 group-hover:text-patagonia-gold transition-all">
                      <GripVertical className="w-6 h-6 cursor-grab" />
                   </div>
                   <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-patagonia-gold shadow-2xl shadow-black/20">
                      <SmartIconPreview url={link.url} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
                   <InputField 
                    label="Etiqueta del Botón" 
                    value={link.title} 
                    onChange={v => updateLink(link.id, { title: v })} 
                   />
                   <InputField 
                    label="URL de Redirección" 
                    value={link.url} 
                    onChange={v => updateLink(link.id, { url: v })} 
                   />
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
                   <button 
                    onClick={() => updateLink(link.id, { active: !link.active })}
                    className={`flex-1 lg:flex-none p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${link.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                   >
                      <CheckCircle2 className="w-5 h-5" /> {link.active ? 'Activo' : 'Oculto'}
                   </button>
                   <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-50 flex items-center justify-center"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/20 transition-all text-black"
      />
    </div>
  );
}

function SmartIconPreview({ url }: { url: string }) {
  const lower = (url || '').toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-6 h-6" />;
  if (lower.includes('instagr')) return <div className="w-6 h-6 border-2 border-current rounded-lg relative"><div className="absolute top-1 right-1 w-1.5 h-1.5 bg-current rounded-full"></div></div>;
  if (lower.includes('facebo')) return <span className="font-black text-2xl leading-none">f</span>;
  return <Globe className="w-6 h-6" />;
}
