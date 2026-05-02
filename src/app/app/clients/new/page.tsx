'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Type, 
  Palette,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    brand_color: '#000000',
    background_color: '#ffffff',
    text_color: '#000000'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // 1. Subir a Supabase Storage (Asegúrate de crear el bucket 'logos')
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (err) {
      alert('Error subiendo imagen. ¿Creaste el bucket "logos" en Supabase Storage?');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

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
        <div className="card-premium space-y-6">
           <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Type className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Información Básica</h3>
           </div>
           
           <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Logo de la Marca</label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.logo_url ? (
                      <>
                        <Image src={formData.logo_url} alt="Logo preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData({...formData, logo_url: ''})}
                          className="absolute top-1 right-1 p-1 bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      isUploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : <ImageIcon className="w-6 h-6 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="btn-outline cursor-pointer py-3 text-xs flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <p className="text-[10px] text-gray-400">Recomendado: 512x512px. JPG o PNG.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nombre de la Marca</label>
                <input required type="text" placeholder="Ej: Ruta9 Burger" className="input-patagonia font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Slug URL (agenciapatagoniacoach.click/slug)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-sm">/</span>
                  <input required type="text" placeholder="ruta9" className="input-patagonia pl-10 font-mono lowercase" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Descripción Corta</label>
                <textarea rows={2} placeholder="Ej: La Burger Regional de Magallanes" className="input-patagonia resize-none italic" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
           </div>
        </div>

        <div className="card-premium space-y-6">
           <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <Palette className="w-5 h-5 text-patagonia-gold" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Identidad Visual</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Marca</label>
                <input type="color" className="w-full h-12 rounded-xl cursor-pointer border-none shadow-sm" value={formData.brand_color} onChange={(e) => setFormData({...formData, brand_color: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fondo Página</label>
                <input type="color" className="w-full h-12 rounded-xl cursor-pointer border-none shadow-sm" value={formData.background_color} onChange={(e) => setFormData({...formData, background_color: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Texto</label>
                <input type="color" className="w-full h-12 rounded-xl cursor-pointer border-none shadow-sm" value={formData.text_color} onChange={(e) => setFormData({...formData, text_color: e.target.value})} />
              </div>
           </div>
        </div>

        <button disabled={isSubmitting || isUploading} className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] font-black disabled:opacity-50">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar y Configurar Enlaces</>}
        </button>
      </form>
    </div>
  );
}
