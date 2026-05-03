'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [client, setClient] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
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

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('active', true)
        .order('position', { ascending: true });

      setLinks(linksData || []);

      await supabase.from('page_views').insert({
        client_id: clientData.id,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      });

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLinkClick = async (link: any) => {
    let finalUrl = link.url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }
    window.open(finalUrl, '_blank');

    try {
      await supabase.from('clicks').insert({
        client_id: client.id,
        link_id: link.id,
        user_agent: navigator.userAgent
      });
      await supabase.rpc('increment_link_clicks', { link_id: link.id });
    } catch (e) {
      console.warn("Analytics error", e);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  if (!client) return <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center"><h1 className="text-2xl font-black italic uppercase">Marca no registrada</h1><p className="text-gray-400 mt-2 font-bold uppercase text-[10px]">PatagoniaCoach Click Network</p></div>;

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white pb-32">
      
      {/* HEADER */}
      <div className="max-w-xl mx-auto pt-20 pb-12 px-6 flex flex-col items-center text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-[2.5rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-2xl shadow-black/5"
        >
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-patagonia-gold font-black italic text-3xl">
              {client.name?.[0]}
            </div>
          )}
        </motion.div>

        <div className="space-y-2">
           <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{client.name}</h1>
           <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] leading-relaxed max-w-[250px] mx-auto">{client.description}</p>
        </div>
      </div>

      {/* ENLACES */}
      <div className="max-w-xl mx-auto px-6 space-y-4">
        {links.map((link, i) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleLinkClick(link)}
            className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.75rem] flex items-center justify-between group hover:bg-black hover:text-white transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-sm group-hover:bg-patagonia-gold transition-colors">
                  <SmartIcon url={link.url} />
               </div>
               <span className="font-black italic uppercase text-[11px] tracking-tighter">{link.title}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-patagonia-gold group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>

      {/* FOOTER */}
      <div className="max-w-xl mx-auto mt-24 pb-12 flex flex-col items-center gap-4 opacity-20">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[7px] font-black uppercase tracking-[0.5em]">PatagoniaCoach Click</span>
         </div>
      </div>

      {/* BARRA DE CONTACTO */}
      <AnimatePresence>
        {client.lead_capture_active && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50"
          >
            <div className="bg-black/95 backdrop-blur-2xl rounded-[2.5rem] p-3 flex items-center justify-around shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10">
               
               {client.whatsapp && (
                 <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex flex-col items-center gap-1.5 py-3 px-4 group">
                    <div className="p-2.5 bg-white/5 rounded-2xl group-hover:bg-patagonia-gold transition-all shadow-inner">
                      <MessageCircle className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Chat</span>
                 </a>
               )}

               {client.phone && (
                 <a href={`tel:${client.phone}`} className="flex flex-col items-center gap-1.5 py-3 px-4 group">
                    <div className="p-2.5 bg-white/5 rounded-2xl group-hover:bg-patagonia-gold transition-all shadow-inner">
                      <Phone className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Llamar</span>
                 </a>
               )}

               {client.address && (
                 <a href={client.address} target="_blank" className="flex flex-col items-center gap-1.5 py-3 px-4 group">
                    <div className="p-2.5 bg-white/5 rounded-2xl group-hover:bg-patagonia-gold transition-all shadow-inner">
                      <MapPin className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Mapa</span>
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
  if (lower.includes('instagr')) return <div className="w-4 h-4 border-2 border-current rounded-sm relative"><div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-current rounded-full" /></div>;
  if (lower.includes('facebo')) return <span className="font-black text-lg leading-none">f</span>;
  return <ExternalLink className="w-4 h-4" />;
}
