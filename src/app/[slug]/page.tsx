'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { trackPageView } from '@/lib/analytics';
import { Client, Link as LinkType } from '@/types';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ClientProfile() {
  const { slug } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener cliente
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (clientError || !clientData) {
          setError(true);
          return;
        }

        setClient(clientData);

        // 2. Obtener links
        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('client_id', clientData.id)
          .eq('active', true)
          .order('position', { ascending: true });

        setLinks(linksData || []);

        // 3. Trackear visita
        trackPageView(clientData.id);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-patagonia-gold" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-gray-200" />
        <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
        <p className="text-gray-500">Este enlace no existe o ha sido desactivado.</p>
        <a href="/" className="text-patagonia-gold font-bold">Volver a PatagoniaCoach</a>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen flex flex-col items-center p-6 transition-colors duration-500"
      style={{ backgroundColor: client.background_color }}
    >
      <div className="w-full max-w-md flex flex-col items-center space-y-8 pt-12">
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-4 text-center">
          {client.logo_url ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <Image 
                src={client.logo_url} 
                alt={client.name} 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 border-4 border-white shadow-xl">
              {client.name[0]}
            </div>
          )}
          <div className="space-y-1">
            <h1 
              className="text-2xl font-bold"
              style={{ color: client.text_color }}
            >
              {client.name}
            </h1>
            <p 
              className="text-sm opacity-80 max-w-[280px]"
              style={{ color: client.text_color }}
            >
              {client.description}
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="w-full space-y-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={`/api/click/${link.id}`}
              className="w-full p-5 rounded-2xl flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md border border-white/10"
              style={{ 
                backgroundColor: client.brand_color,
                color: '#ffffff' // Texto siempre blanco sobre color de marca por legibilidad
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-tight">{link.title}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 flex flex-col items-center space-y-2 opacity-40">
          <p 
            className="text-[10px] uppercase tracking-[0.2em] font-black"
            style={{ color: client.text_color }}
          >
            Desarrollado por Agencia PatagoniaCoach
          </p>
          <div className="w-10 h-1 bg-current rounded-full" style={{ color: client.text_color }} />
        </footer>
      </div>
    </main>
  );
}
