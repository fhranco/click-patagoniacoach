'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Instagram, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Globe, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [client, setClient] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Cliente (incluyendo los nuevos campos de contacto)
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', slug)
        .single();

      if (clientError || !clientData) {
        setLoading(false);
        return;
      }
      setClient(clientData);

      // 2. Cargar Enlaces Activos
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('active', true)
        .order('position', { ascending: true });

      setLinks(linksData || []);

      // 3. Registrar Visita (Analytics)
      await supabase.from('page_views').insert({
        client_id: clientData.id,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: any) => {
    // Registrar clic
    await supabase.from('clicks').insert({
      client_id: client.id,
      link_id: link.id,
      user_agent: navigator.userAgent
    });

    // Incrementar contador en la tabla links para el ranking
    await supabase.rpc('increment_link_clicks', { link_id: link.id });

    // Redirigir (manejo especial para wa.me)
    let finalUrl = link.url;
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('https')) {
      finalUrl = `https://${finalUrl}`;
    }
    window.open(finalUrl, '_blank');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  if (!client) return <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center"><h1 className="text-2xl font-black italic uppercase">404 - No Encontrado</h1><p className="text-gray-400 mt-2 font-bold uppercase text-[10px]">Esta marca no existe en nuestra red.</p></div>;

  const brandColor = client.brand_color || '#000000';

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-black selection:text-white pb-32`}>
      
      {/* HEADER: LOGO Y BIO */}
      <div className="max-w-xl mx-auto pt-20 pb-12 px-6 flex flex-col items-center text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-2xl shadow-black/5"
        >
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-patagonia-gold font-black italic text-3xl">
              {client.name[0]}
            </div>
          )}
        </motion.div>

        <div className="space-y-2">
           <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{client.name}</h1>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">{client.description}</p>
        </div>
      </div>

      {/* LISTA DE ENLACES PRINCIPALES */}
      <div className="max-w-xl mx-auto px-6 space-y-4">
        {links.map((link, i) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleLinkClick(link)}
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-between group hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-sm group-hover:bg-patagonia-gold transition-colors">
                  <SmartIcon url={link.url} />
               </div>
               <span className="font-black italic uppercase text-xs tracking-tighter">{link.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-patagonia-gold group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      {/* FOOTER WATERMARK */}
      <div className="max-w-xl mx-auto mt-20 pb-10 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
         <div className="h-[1px] w-20 bg-gray-200" />
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">PatagoniaCoach Click</span>
         </div>
      </div>

      {/* BARRA DE CONTACTO FLOTANTE (LA PETICIÓN DE FRANCO) */}
      <AnimatePresence>
        {client.lead_capture_active && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-[2.5rem] p-3 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10">
               
               {/* BOTÓN: WHATSAPP */}
               {client.whatsapp && (
                 <a 
                  href={`https://wa.me/${client.whatsapp}`} 
                  target="_blank"
                  className="flex-1 flex flex-col items-center gap-1 py-3 group"
                 >
                    <div className="p-2 bg-white/10 rounded-2xl group-hover:bg-patagonia-gold transition-all">
                      <MessageCircle className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/50">WhatsApp</span>
                 </a>
               )}

               {/* BOTÓN: LLAMADA */}
               {client.phone && (
                 <a 
                  href={`tel:${client.phone}`} 
                  className="flex-1 flex flex-col items-center gap-1 py-3 group"
                 >
                    <div className="p-2 bg-white/10 rounded-2xl group-hover:bg-patagonia-gold transition-all">
                      <Phone className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Llamar</span>
                 </a>
               )}

               {/* BOTÓN: DIRECCIÓN */}
               {client.address && (
                 <a 
                  href={client.address} 
                  target="_blank"
                  className="flex-1 flex flex-col items-center gap-1 py-3 group"
                 >
                    <div className="p-2 bg-white/10 rounded-2xl group-hover:bg-patagonia-gold transition-all">
                      <MapPin className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Mapa</span>
                 </a>
               )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SmartIcon({ url }: { url: string }) {
  const lower = (url || '').toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-4 h-4" />;
  if (lower.includes('instagr')) return <Instagram className="w-4 h-4" />;
  if (lower.includes('facebo')) return <span className="font-black text-xl leading-none">f</span>;
  return <Globe className="w-4 h-4" />;
}
