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
  AlertCircle
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

      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('client_id', client.id)
        .order('position', { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      alert("Error al cargar datos: " + err.message);
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

      // 2. Guardar todos los links
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
        
        if (linkError) throw linkError;
      }
      
      alert('¡Sincronización Exitosa! 🏔️✨');
    } catch (err: any) {
      alert('Error de guardado: ' + err.message);
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
        position: links.length,
        active: true
      };
      
      const { data, error } = await supabase
        .from('links')
        .insert(newLink)
        .select()
        .single();

      if (error) {
        console.error("Insert Error:", error);
        throw error;
      }
      
      if (data) {
        setLinks([...links, data]);
      }
    } catch (err: any) {
      alert("No se pudo crear el enlace. Razón: " + err.message + ". ¿Revisaste los permisos SQL?");
    }
  };

  const updateLocalLink = (id: string, updates: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este botón?')) return;
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      setLinks(links.filter(l => l.id !== id));
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-40 px-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="flex items-center gap-6">
          <Link href={`/app/clients/${slug}`} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Configuración</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Control de Alta Autoridad</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a href={`/${slug}`} target="_blank" className="flex items-center gap-2 px-8 py-5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
            <Eye className="w-5 h-5 text-patagonia-gold" /> Ver Sitio
          </a>
          
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
            <button onClick={() => setActiveTab('brand')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white text-black shadow-lg' : 'text-gray-400'}`}>Marca</button>
            <button onClick={() => setActiveTab('links')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-lg' : 'text-gray-400'}`}>Enlaces</button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'brand' ? (
          <motion.div key="brand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-3"><Type className="w-5 h-5 text-patagonia-gold" /> Identidad Visual</h3>
               <InputField label="Nombre Comercial" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
               <InputField label="Slogan / Descripción" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
               <InputField label="URL Logotipo" value={formData.logo_url} onChange={v => setFormData({...formData, logo_url: v})} />
            </div>

            <div className="bg-black p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20 text-patagonia-gold" /></div>
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-3"><Phone className="w-5 h-5 text-patagonia-gold" /> Canales de Contacto</h3>
               <InputFieldDark label="WhatsApp" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} placeholder="569..." />
               <InputFieldDark label="Teléfono Llamada" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+56..." />
               <InputFieldDark label="Google Maps Link" value={formData.address} onChange={v => setFormData({...formData, address: v})} placeholder="https://maps..." />
            </div>
          </motion.div>
        ) : (
          <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black italic uppercase text-xs tracking-widest text-gray-400">Estructura de Botones</h3>
              <button onClick={addLink} className="flex items-center gap-2 px-8 py-5 bg-patagonia-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-patagonia-gold/20">
                <Plus className="w-5 h-5" /> Inyectar Botón
              </button>
            </div>

            {links.length === 0 && (
              <div className="p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
                 <Link2 className="w-12 h-12 text-gray-200" />
                 <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hay enlaces activos. ¡Crea el primero!</p>
              </div>
            )}

            {links.map((link) => (
              <div key={link.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center gap-6 shadow-xl group hover:border-patagonia-gold/30 transition-all">
                <GripVertical className="w-6 h-6 text-gray-200 group-hover:text-patagonia-gold transition-colors" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                  <InputField label="Texto del Botón" value={link.title} onChange={v => updateLocalLink(link.id, { title: v })} />
                  <InputField label="URL de Destino" value={link.url} onChange={v => updateLocalLink(link.id, { url: v })} />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => updateLocalLink(link.id, { active: !link.active })} className={`flex-1 md:flex-none px-6 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${link.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400'}`}>
                    {link.active ? 'Público' : 'Oculto'}
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER: BOTÓN GUARDADO GLOBAL */}
      <div className="fixed bottom-10 right-10 z-50">
        <button 
          onClick={handleGlobalSave} 
          disabled={saving}
          className="bg-black text-white px-12 py-7 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex items-center gap-5 hover:scale-110 active:scale-95 transition-all border border-white/10 group"
        >
          <div className={`p-2.5 bg-patagonia-gold rounded-xl ${saving ? 'animate-spin' : 'group-hover:rotate-12 transition-all'}`}>
            {saving ? <RefreshCw className="w-7 h-7 text-black" /> : <Save className="w-7 h-7 text-black" />}
          </div>
          <div className="text-left">
            <span className="block font-black uppercase italic tracking-widest text-[10px] leading-none">Guardar Cambios</span>
            <span className="block text-[7px] font-bold text-white/40 uppercase tracking-tighter mt-1">{saving ? 'Procesando...' : 'Sincronización Total'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="space-y-2 w-full">
      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/20 text-black" />
    </div>
  );
}

function InputFieldDark({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2 w-full">
      <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/40 text-white placeholder:text-white/20" />
    </div>
  );
}
