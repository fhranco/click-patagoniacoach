'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  ArrowLeft,
  Layout,
  Palette,
  Type,
  CheckCircle2,
  Moon,
  Sun,
  Zap,
  UserPlus,
  MessageCircle,
  Mail,
  Smartphone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [slug]);

  const fetchClient = async () => {
    const { data } = await supabase.from('clients').select('*').eq('slug', slug).single();
    if (data) setClient(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        description: client.description,
        brand_color: client.brand_color,
        theme: client.theme,
        lead_capture_active: client.lead_capture_active,
        lead_capture_text: client.lead_capture_text,
        lead_capture_type: client.lead_capture_type,
        whatsapp: client.whatsapp,
        phone: client.phone,
        address: client.address,
        fb_pixel_id: client.fb_pixel_id,
        ga_tracking_id: client.ga_tracking_id
      })
      .eq('id', client.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic opacity-20 text-4xl text-black">SINCRONIZANDO...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <Link href={`/app/clients/${slug}`} className="text-gray-400 hover:text-black flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Ajustes Pro.</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className={`w-full md:w-auto btn-primary flex items-center justify-center gap-3 px-10 py-5 text-sm ${saved ? 'bg-green-500' : ''}`}>
          {saved ? <CheckCircle2 /> : <Save />}
          {saving ? 'Guardando...' : saved ? '¡Listo!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div className="space-y-10">
           {/* BARRA FLOTANTE DE CONTACTO */}
           <section className="card-premium p-8 space-y-6 border-2 border-black">
              <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-patagonia-gold" /> Canales Directos (Barra Flotante)
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Estos campos activan la barra inferior fija.</p>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp (Solo números, ej: 56912345678)</label>
                    <input type="text" value={client.whatsapp || ''} onChange={(e) => setClient({...client, whatsapp: e.target.value})} className="input-field" placeholder="569..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teléfono Llamadas (ej: +569...)</label>
                    <input type="text" value={client.phone || ''} onChange={(e) => setClient({...client, phone: e.target.value})} className="input-field" placeholder="+569..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dirección para Google Maps</label>
                    <input type="text" value={client.address || ''} onChange={(e) => setClient({...client, address: e.target.value})} className="input-field" placeholder="Calle Falsa 123, Punta Arenas" />
                 </div>
              </div>
           </section>

           {/* MARKETING & TRACKING */}
           <section className="card-premium p-8 space-y-6 border-2 border-blue-500/20 shadow-xl shadow-blue-500/5">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-blue-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Marketing & Tracking (Opcional)
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Inyecta scripts de rastreo para remarketing.</p>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Facebook Pixel ID</label>
                    <input type="text" value={client.fb_pixel_id || ''} onChange={(e) => setClient({...client, fb_pixel_id: e.target.value})} className="input-field" placeholder="Ej: 1234567890..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Google Analytics ID (G-XXXXX)</label>
                    <input type="text" value={client.ga_tracking_id || ''} onChange={(e) => setClient({...client, ga_tracking_id: e.target.value})} className="input-field" placeholder="Ej: G-XXXXXXXX" />
                 </div>
              </div>
           </section>

           {/* Captura de Leads */}
           <section className="card-premium p-8 space-y-8 border-2 border-patagonia-gold/20 shadow-xl shadow-patagonia-gold/5">
              <div className="flex items-center justify-between">
                 <h3 className="font-black uppercase tracking-widest text-[10px] text-patagonia-gold flex items-center gap-2">
                   <UserPlus className="w-4 h-4" /> Captura de Prospectos
                 </h3>
                 <div onClick={() => setClient({...client, lead_capture_active: !client.lead_capture_active})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${client.lead_capture_active ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${client.lead_capture_active ? 'translate-x-6' : ''}`} />
                 </div>
              </div>
              {client.lead_capture_active && (
                <div className="space-y-6 animate-in slide-in-from-top-4">
                   <input type="text" value={client.lead_capture_text} onChange={(e) => setClient({...client, lead_capture_text: e.target.value})} className="input-field" placeholder="Texto de invitación" />
                   <div className="grid grid-cols-3 gap-2">
                      {['whatsapp', 'email', 'both'].map((type) => (
                        <button key={type} onClick={() => setClient({...client, lead_capture_type: type})} className={`p-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${client.lead_capture_type === type ? 'border-patagonia-gold bg-patagonia-gold/5' : 'border-gray-50 text-gray-400'}`}>{type}</button>
                      ))}
                   </div>
                </div>
              )}
           </section>
        </div>

        <div className="space-y-6">
           <section className="card-premium p-8 space-y-6">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-patagonia-gold flex items-center gap-2">
                <Type className="w-4 h-4" /> Identidad Visual
              </h3>
              <div className="space-y-4">
                 <input type="text" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} className="input-field" />
                 <textarea value={client.description} onChange={(e) => setClient({...client, description: e.target.value})} className="input-field h-24" />
                 <input type="color" value={client.brand_color} onChange={(e) => setClient({...client, brand_color: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer" />
              </div>
           </section>

           <div className="grid gap-4">
              {['neutral', 'stealth', 'glass'].map((t) => (
                <button key={t} onClick={() => setClient({...client, theme: t})} className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${client.theme === t ? 'border-patagonia-gold bg-patagonia-gold/5 shadow-xl' : 'border-gray-50 bg-white'}`}>
                   <p className="font-black italic uppercase tracking-tighter text-xl">{t}</p>
                </button>
              ))}
           </div>
        </div>
      </div>

      <style jsx>{`
        .input-field { width: 100%; background: white; border: 1px solid #f3f4f6; border-radius: 1rem; padding: 1rem; font-weight: 700; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #facc15; }
      `}</style>
    </div>
  );
}
