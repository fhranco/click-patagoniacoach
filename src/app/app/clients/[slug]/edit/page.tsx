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
      // 1. Guardar datos del cliente
      const { error: clientError } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', formData.id);
      
      if (clientError) throw clientError;

      // 2. Guardar todos los links
      for (const link of links) {
        await supabase
          .from('links')
          .update({
            title: link.title,
            url: link.url,
            active: link.active,
            position: link.position
          })
          .eq('id', link.id);
      }
      
      alert('¡Datos y Enlaces Guardados! 🏔️✨');
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

  const updateLocalLink = (id: string, updates: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id: string) => {
    if (!confirm('¿Seguro?')) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) setLinks(links.filter(l => l.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-40 px-6">
      
      {/* HEADER: VISTA PREVIA Y CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="flex items-center gap-6">
          <Link href={`/app/clients/${slug}`} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Studio</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Versión 2.1 - Control Total</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* BOTÓN VISTA PREVIA */}
          <a 
            href={`/${slug}`} 
            target="_blank" 
            className="flex items-center gap-2 px-8 py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20"
          >
            <Eye className="w-5 h-5 text-patagonia-gold" /> Vista Previa
          </a>
          
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
            <button onClick={() => setActiveTab('brand')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white text-black shadow-lg' : 'text-gray-400'}`}>Marca</button>
            <button onClick={() => setActiveTab('links')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white text-black shadow-lg' : 'text-gray-400'}`}>Enlaces</button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'brand' ? (
          <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-3"><Type className="w-5 h-5 text-patagonia-gold" /> Identidad</h3>
               <InputField label="Nombre" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
               <InputField label="Descripción" value={formData.description} onChange={v => setFormData({...formData, description: v})} />
               <InputField label="Logo URL" value={formData.logo_url} onChange={v => setFormData({...formData, logo_url: v})} />
            </div>

            <div className="bg-black p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20 text-patagonia-gold" /></div>
               <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-3"><Phone className="w-5 h-5 text-patagonia-gold" /> Canales</h3>
               <InputFieldDark label="WhatsApp" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} />
               <InputFieldDark label="Llamada" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
               <InputFieldDark label="Google Maps" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black italic uppercase text-xs tracking-widest text-gray-400">Botones Públicos</h3>
              <button onClick={addLink} className="px-6 py-4 bg-patagonia-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Nuevo Botón</button>
            </div>
            {links.map((link) => (
              <div key={link.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center gap-6 shadow-lg group">
                <GripVertical className="w-6 h-6 text-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                  <InputField label="Título" value={link.title} onChange={v => updateLocalLink(link.id, { title: v })} />
                  <InputField label="URL" value={link.url} onChange={v => updateLocalLink(link.id, { url: v })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateLocalLink(link.id, { active: !link.active })} className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase ${link.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {link.active ? 'Activo' : 'Oculto'}
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN GUARDADO GLOBAL */}
      <div className="fixed bottom-10 right-10 z-50">
        <button 
          onClick={handleGlobalSave} 
          disabled={saving}
          className="bg-black text-white px-12 py-7 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex items-center gap-4 hover:scale-110 active:scale-95 transition-all border border-white/10 group"
        >
          <div className={`p-2 bg-patagonia-gold rounded-xl ${saving ? 'animate-spin' : 'group-hover:rotate-12 transition-all'}`}>
            {saving ? <RefreshCw className="w-6 h-6 text-black" /> : <Save className="w-6 h-6 text-black" />}
          </div>
          <span className="font-black uppercase italic tracking-widest text-xs">
            {saving ? 'Guardando...' : 'Guardar Todo'}
          </span>
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/20" />
    </div>
  );
}

function InputFieldDark({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-patagonia-gold/40 text-white" />
    </div>
  );
}
