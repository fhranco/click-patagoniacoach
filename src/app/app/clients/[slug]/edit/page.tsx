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
  MapPin
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
      alert('¡Configuración guardada! 🏔️✨');
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
    <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-in fade-in duration-1000 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-patagonia-gold/5 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/5 blur-[120px] -z-10 rounded-full" />

      {/* Header Premium */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gray-100 pb-12"
      >
        <div className="flex items-center gap-8">
          <Link href={`/app/clients/${slug}`} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-3xl shadow-xl hover:scale-110 transition-all group">
            <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-patagonia-gold animate-pulse" />
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Studio de Marca</h1>
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.5em] mt-3 ml-1">Ecosistema Digital PatagoniaCoach</p>
          </div>
        </div>
        
        <div className="flex gap-2 p-2 bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-sm">
          <TabButton active={activeTab === 'brand'} onClick={() => setActiveTab('brand')} icon={<Palette className="w-4 h-4" />} label="Identidad" />
          <TabButton active={activeTab === 'links'} onClick={() => setActiveTab('links')} icon={<Link2 className="w-4 h-4" />} label="Enlaces" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'brand' ? (
          <motion.form 
            key="brand"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleClientSave} 
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* CARD: ADN DE MARCA */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-patagonia-gold/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative card-premium p-12 space-y-10 bg-white/80 backdrop-blur-md border-white/50 shadow-2xl shadow-black/[0.03]">
                   <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                     <div className="flex items-center gap-4">
                       <div className="p-4 bg-black rounded-[1.5rem] shadow-xl shadow-black/20"><Type className="w-6 h-6 text-patagonia-gold" /></div>
                       <h3 className="font-black italic uppercase text-lg tracking-tighter">ADN de Marca</h3>
                     </div>
                     <Zap className="w-5 h-5 text-gray-100 group-hover:text-patagonia-gold transition-colors" />
                   </div>
                   
                   <div className="space-y-8">
                      <PremiumInput label="Nombre de Fantasía" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Ej. Ruta9" />
                      <PremiumInput label="Lema Estratégico" value={formData.description} onChange={v => setFormData({...formData, description: v})} placeholder="Ej. Gastronomía de Altura" />
                      <PremiumInput label="Asset del Logotipo" value={formData.logo_url} onChange={v => setFormData({...formData, logo_url: v})} placeholder="URL de la imagen" />
                   </div>
                </div>
              </div>

              {/* CARD: CONTACTO Y UBICACIÓN */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative card-premium p-12 space-y-10 bg-white/80 backdrop-blur-md border-white/50 shadow-2xl shadow-black/[0.03]">
                   <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                     <div className="flex items-center gap-4">
                       <div className="p-4 bg-black rounded-[1.5rem] shadow-xl shadow-black/20"><Globe className="w-6 h-6 text-patagonia-gold" /></div>
                       <h3 className="font-black italic uppercase text-lg tracking-tighter">Puntos de Contacto</h3>
                     </div>
                     <MapPin className="w-5 h-5 text-gray-100 group-hover:text-patagonia-gold transition-colors" />
                   </div>
                   
                   <div className="space-y-8">
                      <PremiumInput label="WhatsApp de Atención" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} placeholder="+56 9 ..." />
                      <PremiumInput label="Teléfono Directo" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+56 2 ..." />
                      <PremiumInput label="Dirección Física" value={formData.address} onChange={v => setFormData({...formData, address: v})} placeholder="Ej. Av. Bulnes 123" />
                   </div>
                </div>
              </div>

              {/* CARD: ESTILO VISUAL */}
              <div className="lg:col-span-2 group relative">
                <div className="relative card-premium p-12 bg-black text-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden">
                   <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-patagonia-gold/10 to-transparent opacity-50" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <Palette className="w-6 h-6 text-patagonia-gold" />
                          <h3 className="font-black italic uppercase text-lg tracking-tighter">Personalización de Interfaz</h3>
                        </div>
                        <p className="text-gray-400 text-xs font-medium max-w-sm">Configura la temperatura visual del micrositio. El color de marca define la autoridad de los botones primarios.</p>
                        
                        <div className="flex gap-6 mt-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Color Hex</label>
                            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                              <input 
                                type="color" 
                                value={formData.brand_color} 
                                onChange={e => setFormData({...formData, brand_color: e.target.value})}
                                className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={formData.brand_color} 
                                onChange={e => setFormData({...formData, brand_color: e.target.value})}
                                className="bg-transparent border-none text-white font-mono font-black text-sm w-24 outline-none"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-3 flex-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tema de Diseño</label>
                            <select 
                              value={formData.theme} 
                              onChange={e => setFormData({...formData, theme: e.target.value})}
                              className="w-full h-[66px] bg-white/5 border border-white/10 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest text-white outline-none cursor-pointer hover:bg-white/10 transition-all"
                            >
                              <option value="neutral" className="bg-black">Neutral Edition</option>
                              <option value="stealth" className="bg-black">Stealth Mode</option>
                              <option value="glass" className="bg-black">Glass Effect</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-[300px] aspect-[16/9] bg-white/5 rounded-[2rem] border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-4">
                           <div className="w-12 h-12 rounded-2xl shadow-xl" style={{ backgroundColor: formData.brand_color }}></div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Previsualización de Tono</p>
                           <div className="flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-white/20"></div>
                              <div className="w-2 h-2 rounded-full bg-white/20"></div>
                              <div className="w-2 h-2 rounded-full bg-white/20"></div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-8 z-50 flex justify-center">
              <button disabled={saving} className="btn-primary px-16 py-6 flex items-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all group">
                <div className="p-2 bg-patagonia-gold rounded-lg group-hover:rotate-12 transition-transform">
                  <Save className="w-6 h-6 text-black" /> 
                </div>
                <span className="font-black uppercase italic tracking-widest text-sm">{saving ? 'Guardando en la Red...' : 'Aplicar Configuración'}</span>
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="links"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-black italic uppercase text-lg tracking-tighter">Estructura de Conversión</h3>
                <p className="text-gray-400 font-bold text-[8px] uppercase tracking-widest">Gestiona los puntos de salida del micrositio</p>
              </div>
              <button onClick={addLink} className="btn-secondary py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nuevo Disparador
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {links.map((link) => (
                <div key={link.id} className="card-premium p-10 flex flex-col lg:flex-row items-center gap-10 group hover:border-patagonia-gold/30 transition-all bg-white shadow-2xl shadow-black/[0.02]">
                  <div className="flex items-center gap-6 w-full lg:w-auto">
                     <div className="p-5 bg-gray-50 rounded-3xl text-gray-200 group-hover:text-patagonia-gold transition-all">
                        <GripVertical className="w-7 h-7 cursor-grab" />
                     </div>
                     <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-patagonia-gold shadow-2xl shadow-black/30 group-hover:scale-110 transition-transform">
                        <SmartIconPreview url={link.url} />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                     <PremiumInput 
                      label="Etiqueta Visible" 
                      value={link.title} 
                      onChange={v => updateLink(link.id, { title: v })} 
                     />
                     <PremiumInput 
                      label="Enlace de Destino" 
                      value={link.url} 
                      onChange={v => updateLink(link.id, { url: v })} 
                     />
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-8 lg:pt-0">
                     <button 
                      onClick={() => updateLink(link.id, { active: !link.active })}
                      className={`flex-1 lg:flex-none h-20 px-8 rounded-3xl border transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${link.active ? 'bg-green-50 text-green-600 border-green-100 shadow-lg shadow-green-500/10' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                     >
                        <Zap className={`w-5 h-5 ${link.active ? 'fill-green-500' : ''}`} /> {link.active ? 'Online' : 'Draft'}
                     </button>
                     <button 
                      onClick={() => deleteLink(link.id)}
                      className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-50 flex items-center justify-center shadow-sm"
                     >
                        <Trash2 className="w-6 h-6" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-black text-white shadow-2xl shadow-black/20 scale-105' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
    >
      {icon} {label}
    </button>
  );
}

function PremiumInput({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3 w-full group/field">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1 group-focus-within/field:text-patagonia-gold transition-colors">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-patagonia-gold/10 focus:bg-white transition-all text-black placeholder:text-gray-200"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/field:opacity-100 transition-opacity">
           <CheckCircle2 className="w-4 h-4 text-patagonia-gold" />
        </div>
      </div>
    </div>
  );
}

function SmartIconPreview({ url }: { url: string }) {
  const lower = (url || '').toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-8 h-8" />;
  if (lower.includes('instagr')) return <div className="w-8 h-8 border-4 border-current rounded-2xl relative"><div className="absolute top-1.5 right-1.5 w-2 h-2 bg-current rounded-full"></div></div>;
  if (lower.includes('facebo')) return <span className="font-black text-4xl leading-none">f</span>;
  return <Globe className="w-8 h-8" />;
}
