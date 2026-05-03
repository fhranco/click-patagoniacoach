'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Palette, 
  Settings2,
  MessageCircle,
  Globe,
  GripVertical,
  CheckCircle2,
  Layout,
  Type,
  Link2,
  Sparkles,
  Zap,
  MousePointer2,
  Smartphone,
  MapPin,
  Phone,
  Navigation,
  Info,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
    lead_capture_active: true,
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

  const handleGlobalSave = async () => {
    setSaving(true);
    try {
      // 1. Guardar datos del cliente
      const { error: clientError } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', formData.id);
      
      if (clientError) throw clientError;

      // 2. Guardar todos los links (para asegurar que los cambios locales se persistan)
      for (const link of links) {
        const { error: linkError } = await supabase
          .from('links')
          .update({
            title: link.title,
            url: link.url,
            active: link.active,
            position: link.position
          })
          .eq('id', link.id);
        
        if (linkError) console.error("Error guardando link:", link.id);
      }
      
      alert('¡Todo guardado con éxito! 🏔️✨');
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
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

  const updateLocalLink = (id: string, updates: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este enlace?')) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) setLinks(links.filter(l => l.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-patagonia-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-40 animate-in fade-in duration-1000">
      
      {/* Header Premium con Vista Previa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="flex items-center gap-6">
          <Link href={`/app/clients/${slug}`} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-gray-50 bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Studio de Marca</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Configuración de Alta Autoridad</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* BOTÓN VISTA PREVIA (LA PETICIÓN DE FRANCO) */}
          <a 
            href={`/${slug}`} 
            target="_blank" 
            className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-patagonia-gold" /> Vista Previa
          </a>
          
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'brand' ? (
          <motion.div 
            key="brand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CARD: IDENTIDAD */}
              <div className="card-premium p-10 space-y-8 bg-white border-gray-100">
                 <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                   <div className="p-3 bg-black rounded-xl"><Type className="w-5 h-5 text-patagonia-gold" /></div>
                   <h3 className="font-black italic uppercase text-xs tracking-[0.2em]">Identidad de Agencia</h3>
                 </div>
                 
                 <div className="space-y-6">
                    <InputField label="Nombre Comercial" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                    <InputField label="Slogan / Descripción" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
                    <InputField label="URL del Logotipo" value={formData.logo_url} onChange={v => setFormData({...formData, logo_url: v})} />
                 </div>
              </div>

              {/* CARD: CANALES DE CONTACTO */}
              <div className="card-premium p-10 space-y-8 bg-black text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20 text-patagonia-gold" /></div>
                 
                 <div className="flex items-center justify-between border-b border-white/10 pb-6">
                   <div className="flex items-center gap-3">
                     <div className="p-3 bg-patagonia-gold rounded-xl"><Phone className="w-5 h-5 text-black" /></div>
                     <h3 className="font-black italic uppercase text-xs tracking-[0.2em]">Canales Directos</h3>
                   </div>
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, lead_capture_active: !formData.lead_capture_active})}
                    className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${formData.lead_capture_active ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}
                   >
                     {formData.lead_capture_active ? 'Activo' : 'Oculto'}
                   </button>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <InputFieldDark label="WhatsApp (Solo números)" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} placeholder="Ej: 56912345678" />
                    <InputFieldDark label="Teléfono de Llamada" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="Ej: +5622345678" />
                    <InputFieldDark label="Dirección (Google Maps)" value={formData.address} onChange={v => setFormData({...formData, address: v})} placeholder="Pega el link de Google Maps aquí" />
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="links"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black italic uppercase text-xs tracking-[0.3em] flex items-center gap-3 text-gray-400">
                <Link2 className="w-5 h-5 text-patagonia-gold" /> Lista de Enlaces
              </h3>
              <button onClick={addLink} className="btn-secondary py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-4 h-4" /> Inyectar Nuevo Botón
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
                     <InputField label="Texto del Botón" value={link.title} onChange={v => updateLocalLink(link.id, { title: v })} />
                     <InputField label="URL de Destino" value={link.url} onChange={v => updateLocalLink(link.id, { url: v })} />
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0">
                     <button 
                      onClick={() => updateLocalLink(link.id, { active: !link.active })}
                      className={`flex-1 lg:flex-none p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${link.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                     >
                        <CheckCircle2 className="w-5 h-5" /> {link.active ? 'Visible' : 'Oculto'}
                     </button>
                     <button 
                      onClick={() => deleteLink(link.id)}
                      className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-50"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN DE GUARDADO GLOBAL FLOTANTE (LA PETICIÓN DE FRANCO) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleGlobalSave}
          disabled={saving}
          className="bg-black text-white px-10 py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all group border border-white/10"
        >
          <div className={`p-2 bg-patagonia-gold rounded-xl group-hover:rotate-12 transition-all ${saving ? 'animate-spin' : ''}`}>
            {saving ? <RefreshCw className="w-6 h-6 text-black" /> : <Save className="w-6 h-6 text-black" />}
          </div>
          <span className="font-black uppercase italic tracking-widest text-xs">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </span>
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3 w-full">
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

function InputFieldDark({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</label>
       <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/40 text-white placeholder:text-white/20"
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
