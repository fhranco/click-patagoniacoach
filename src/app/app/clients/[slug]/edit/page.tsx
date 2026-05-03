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
  MessageCircle,
  Globe,
  GripVertical,
  CheckCircle2,
  Type,
  Link2,
  Zap,
  Phone,
  Eye,
  RefreshCw,
  Layout,
  Navigation,
  Smartphone,
  MapPin,
  Settings2,
  Instagram,
  Facebook,
  Linkedin,
  FileText,
  Tag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_OPTIONS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'web', label: 'Sitio Web', icon: Globe },
  { id: 'map', label: 'Dirección', icon: MapPin },
  { id: 'menu', label: 'Carta/Menú', icon: FileText },
  { id: 'offer', label: 'Ofertas', icon: Tag },
  { id: 'custom', label: 'Personalizado', icon: ExternalLink },
];

export default function EditClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
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
    lead_capture_active: true
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
      const { error: clientError } = await supabase.from('clients').update(formData).eq('id', formData.id);
      if (clientError) throw clientError;

      for (const link of links) {
        const { error: linkError } = await supabase.from('links').update({
          title: link.title,
          url: link.url,
          icon: link.icon, // <--- GUARDAMOS EL ICONO ELEGIDO
          active: link.active,
          position: link.position
        }).eq('id', link.id);
        if (linkError) throw linkError;
      }
      
      alert('¡Configuración Elite Sincronizada! 🏔️✨');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addLink = async () => {
    try {
      const newLink = {
        client_id: formData.id,
        title: 'Nuevo Enlace',
        url: 'https://',
        icon: 'custom',
        position: links.length,
        active: true
      };
      const { data, error } = await supabase.from('links').insert(newLink).select().single();
      if (error) throw error;
      if (data) setLinks([...links, data]);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const updateLocalLink = (id: string, updates: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Eliminar enlace?')) return;
    try {
      await supabase.from('links').delete().eq('id', id);
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-40 px-8 animate-in fade-in duration-700">
      
      {/* HEADER ELITE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-6">
          <Link href={`/app/clients`} className="p-3 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-[42px] font-black italic tracking-tighter uppercase leading-none text-black">Configuración Elite</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em]">Control Maestro de Marca y Conversión</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('brand')} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white text-black shadow-xl shadow-black/5' : 'text-gray-400'}`}>
              <Layout className="w-4 h-4" /> Marca y Contacto
            </button>
            <button onClick={() => setActiveTab('links')} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-xl shadow-black/5' : 'text-gray-400'}`}>
              <Link2 className="w-4 h-4" /> Lista de Enlaces
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'brand' ? (
          <motion.div key="brand" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-10">
                 <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                    <div className="p-3.5 bg-black rounded-2xl"><Smartphone className="w-6 h-6 text-patagonia-gold" /></div>
                    <h3 className="font-black italic uppercase text-sm tracking-[0.15em]">Identidad Visual</h3>
                 </div>
                 <div className="space-y-8">
                    <InputField label="Nombre Comercial" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                    <InputField label="Slogan / Descripción" value={formData.description} onChange={(v: string) => setFormData({...formData, description: v})} />
                    <InputField label="URL del Logotipo" value={formData.logo_url} onChange={(v: string) => setFormData({...formData, logo_url: v})} />
                 </div>
              </div>

              <div className="bg-black p-12 rounded-[2.5rem] text-white shadow-2xl space-y-10 relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute top-0 right-0 p-6 opacity-10"><Zap className="w-24 h-24 text-patagonia-gold" /></div>
                 <div className="space-y-10 relative z-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                       <div className="flex items-center gap-4">
                          <div className="p-3.5 bg-patagonia-gold rounded-2xl"><Phone className="w-6 h-6 text-black" /></div>
                          <h3 className="font-black italic uppercase text-sm tracking-[0.15em]">Canales de Contacto</h3>
                       </div>
                       <button onClick={() => setFormData({...formData, lead_capture_active: !formData.lead_capture_active})} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${formData.lead_capture_active ? 'bg-[#22C55E] text-white' : 'bg-white/10 text-gray-500'}`}>{formData.lead_capture_active ? 'Barra Activa' : 'Barra Oculta'}</button>
                    </div>
                    <div className="space-y-8">
                       <InputFieldDark label="WhatsApp (Solo números)" value={formData.whatsapp} onChange={(v: string) => setFormData({...formData, whatsapp: v})} />
                       <InputFieldDark label="Teléfono de Llamada" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                       <InputFieldDark label="Dirección (Google Maps)" value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} />
                    </div>
                 </div>
                 <div className="pt-8 flex items-start gap-3 opacity-30 relative z-10">
                    <Settings2 className="w-4 h-4 mt-1" />
                    <p className="text-[8px] font-bold uppercase leading-relaxed tracking-wider">Estos datos activan los botones flotantes de "Llama", "WhatsApp" y "Dirección".</p>
                 </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-10">
               <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                  <div className="p-3.5 bg-black rounded-2xl"><Palette className="w-6 h-6 text-patagonia-gold" /></div>
                  <h3 className="font-black italic uppercase text-sm tracking-[0.15em]">Personalización de Interfaz</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Color de Marca</label>
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl border border-gray-100 shadow-inner" style={{ backgroundColor: formData.brand_color || '#000000' }} />
                        <input type="text" value={formData.brand_color || '#000000'} onChange={(e) => setFormData({...formData, brand_color: e.target.value})} className="flex-1 px-8 py-5 bg-gray-50 rounded-2xl font-black uppercase tracking-widest text-xs outline-none" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Tema del Micrositio</label>
                     <select value={formData.theme || 'neutral'} onChange={(e) => setFormData({...formData, theme: e.target.value})} className="w-full px-8 py-5 bg-gray-50 rounded-2xl font-black uppercase tracking-widest text-xs outline-none appearance-none">
                        <option value="neutral">Blanco Institucional</option>
                        <option value="dark">Negro Carbono</option>
                        <option value="gold">Oro Patagonia</option>
                     </select>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="links" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded-xl"><Link2 className="w-5 h-5 text-patagonia-gold" /></div>
                <h3 className="font-black italic uppercase text-xs tracking-widest text-black">Botones de Acción</h3>
              </div>
              <button onClick={addLink} className="px-10 py-5 bg-patagonia-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-patagonia-gold/20">Inyectar Nuevo Enlace</button>
            </div>

            <div className="space-y-6">
              {links.map((link) => (
                <div key={link.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-stretch gap-10 shadow-xl shadow-black/[0.01] group hover:border-patagonia-gold/20 transition-all">
                  
                  {/* FILA SUPERIOR: ICONO Y TÍTULOS */}
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex items-center gap-6">
                      <GripVertical className="w-8 h-8 text-gray-200 group-hover:text-patagonia-gold transition-colors" />
                      <div className="w-20 h-20 bg-black rounded-[1.75rem] flex items-center justify-center text-patagonia-gold shadow-2xl relative group/icon overflow-hidden">
                        <SmartIconPreview iconId={link.icon} url={link.url} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                      <InputField label="Texto del Botón" value={link.title} onChange={(v: string) => updateLocalLink(link.id, { title: v })} />
                      <InputField label="URL de Destino" value={link.url} onChange={(v: string) => updateLocalLink(link.id, { url: v })} />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={() => updateLocalLink(link.id, { active: !link.active })} className={`flex-1 md:flex-none px-6 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${link.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                        {link.active ? 'Visible' : 'Oculto'}
                      </button>
                      <button onClick={() => deleteLink(link.id)} className="p-5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"><Trash2 className="w-6 h-6" /></button>
                    </div>
                  </div>

                  {/* FILA INFERIOR: SELECTOR DE ICONOS */}
                  <div className="bg-gray-50/50 p-6 rounded-2xl space-y-4">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Seleccionar Identidad Visual del Botón</label>
                    <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                       {ICON_OPTIONS.map((opt) => {
                         const IconComp = opt.icon;
                         const isSelected = link.icon === opt.id;
                         return (
                           <button 
                            key={opt.id}
                            onClick={() => updateLocalLink(link.id, { icon: opt.id })}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isSelected ? 'bg-black text-patagonia-gold shadow-lg scale-110' : 'bg-white text-gray-300 hover:text-black hover:bg-white shadow-sm'}`}
                           >
                             <IconComp className="w-4 h-4" />
                             <span className="text-[7px] font-black uppercase tracking-tighter">{opt.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-8">
          <button onClick={handleGlobalSave} disabled={saving} className="bg-[#0A0A0A] text-white px-16 py-8 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex items-center gap-6 hover:scale-105 active:scale-95 transition-all group border border-white/5">
            <div className={`p-2.5 bg-white/10 rounded-xl ${saving ? 'animate-spin' : 'group-hover:rotate-12 transition-all'}`}>
              {saving ? <RefreshCw className="w-6 h-6 text-patagonia-gold" /> : <Save className="w-6 h-6 text-white" />}
            </div>
            <div className="text-left">
              <span className="block font-black uppercase italic tracking-[0.2em] text-xs leading-none">Aplicar Configuración</span>
              <span className="block text-[7px] font-bold uppercase tracking-[0.3em] text-white/30 mt-1">Sincronizar con Producción</span>
            </div>
          </button>
      </div>

      <div className="fixed bottom-10 left-10 z-50">
          <a href={`/${slug}`} target="_blank" className="flex items-center gap-4 px-10 py-6 bg-white border border-gray-100 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-black hover:text-white transition-all group">
            <Eye className="w-6 h-6 text-patagonia-gold group-hover:rotate-12 transition-all" />
            <span className="font-black uppercase italic tracking-widest text-[10px]">Vista Previa</span>
          </a>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="space-y-3 w-full">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/20 text-black" />
    </div>
  );
}

function InputFieldDark({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3 w-full">
      <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/40 text-white placeholder:text-white/10" />
    </div>
  );
}

function SmartIconPreview({ iconId, url }: { iconId?: string, url: string }) {
  // 1. Si hay un icono elegido manualmente, usarlo
  if (iconId) {
    const opt = ICON_OPTIONS.find(o => o.id === iconId);
    if (opt) {
      const Icon = opt.icon;
      return <Icon className="w-7 h-7" />;
    }
  }

  // 2. Fallback inteligente si no hay icono elegido
  const lower = (url || '').toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-7 h-7" />;
  if (lower.includes('instagr')) return <Instagram className="w-7 h-7" />;
  if (lower.includes('facebo')) return <Facebook className="w-7 h-7" />;
  return <Globe className="w-7 h-7" />;
}
