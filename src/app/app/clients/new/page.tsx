'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Layout, 
  Type, 
  Palette,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function NewClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brand_color: '#000000',
    background_color: '#ffffff',
    text_color: '#000000'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('clients')
      .insert([formData])
      .select()
      .single();

    if (error) {
      alert('Error creando cliente: ' + error.message);
      setIsSubmitting(false);
    } else {
      router.push(`/app/clients/${data.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/clients" className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-black transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Nuevo Cliente.</h1>
          <p className="text-gray-400 font-light">Configura la identidad base de tu marca.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="card-premium space-y-6">
           <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Type className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Información Básica</h3>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nombre de la Marca</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Ruta9 Burger"
                  className="input-patagonia font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Slug URL (agenciapatagoniacoach.click/slug)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-sm">/</span>
                  <input 
                    required
                    type="text" 
                    placeholder="ruta9"
                    className="input-patagonia pl-10 font-mono lowercase"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Descripción Corta</label>
                <textarea 
                  rows={2}
                  placeholder="Ej: La Burger Regional de Magallanes"
                  className="input-patagonia resize-none italic"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
           </div>
        </div>

        {/* Visual Config Card */}
        <div className="card-premium space-y-6">
           <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Palette className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Identidad Visual</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Marca</label>
                <input 
                  type="color" 
                  className="w-full h-12 rounded-xl cursor-pointer border-none"
                  value={formData.brand_color}
                  onChange={(e) => setFormData({...formData, brand_color: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fondo Página</label>
                <input 
                  type="color" 
                  className="w-full h-12 rounded-xl cursor-pointer border-none"
                  value={formData.background_color}
                  onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Texto</label>
                <input 
                  type="color" 
                  className="w-full h-12 rounded-xl cursor-pointer border-none"
                  value={formData.text_color}
                  onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                />
              </div>
           </div>

           {/* Preview Mockup */}
           <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center space-y-4">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">Vista Previa Color</p>
              <div 
                className="w-full p-4 rounded-2xl flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: formData.brand_color, color: '#fff' }}
              >
                BOTÓN DE EJEMPLO
              </div>
           </div>
        </div>

        <button 
          disabled={isSubmitting}
          className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar y Configurar Enlaces
            </>
          )}
        </button>
      </form>
    </div>
  );
}
