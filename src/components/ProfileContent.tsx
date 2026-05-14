'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Globe, 
  ChevronRight, 
  ShieldCheck,
  ExternalLink,
  FileText,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';

export default function ProfileContent({ client, links: initialLinks }: { client: any, links: any[] }) {
  const [links, setLinks] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Efectos de Parallax y Opacidad Dinámica
  const headerY = useTransform(scrollY, [0, 300], [0, -50]);
  const logoScaleValue = useTransform(scrollY, [0, 300], [1, 0.8]);
  const progressWidth = useTransform(scrollY, [0, 800], ["0%", "100%"]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    setMounted(true);
    // Lógica de filtrado por horario (Day-Parting)
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const activeLinks = (initialLinks || []).filter(link => {
      if (!link.schedule_active) return true;
      if (!link.schedule_start || !link.schedule_end) return true;
      return currentHM >= link.schedule_start && currentHM <= link.schedule_end;
    });

    setLinks(activeLinks);

    const trackVisit = async () => {
      if (client?.id) {
        try {
          await supabase.from('page_views').insert({
            client_id: client.id,
            referrer: document.referrer,
            user_agent: navigator.userAgent
          });
        } catch (e) {
          console.error("Tracking error:", e);
        }
      }
    };

    trackVisit();
  }, [client?.id, initialLinks]);

  if (!mounted) return null; // Evitar hidratación fallida

  const handleLinkClick = async (link: any) => {
    let finalUrl = link.url;
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('wa.me')) {
      finalUrl = `https://${finalUrl}`;
    }
    if (finalUrl.startsWith('wa.me')) {
      finalUrl = `https://${finalUrl}`;
    }
    window.open(finalUrl, '_blank');

    triggerHaptic();
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

  // Variantes para revelado cinemático
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Aplicamos negro por defecto según pedido del usuario
  const isDark = true; 
  const brandColor = client.brand_color || '#000000';
  const secondaryColor = client.brand_color_secondary;

  const buttonStyle = {
    background: secondaryColor 
      ? `linear-gradient(135deg, ${brandColor}, ${secondaryColor})`
      : undefined,
    backgroundColor: !secondaryColor ? brandColor : undefined
  };

  return (
    <div className={`relative min-h-screen selection:bg-patagonia-gold selection:text-black overflow-x-hidden transition-colors duration-1000 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Contenedor Mobile-First */}
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col pb-40">
      
      {/* BARRA DE PROGRESO CINEMÁTICA */}
      <motion.div 
        style={{ width: progressWidth, backgroundColor: brandColor }}
        className="fixed top-0 left-0 h-1 z-[100] shadow-[0_0_10px_rgba(0,0,0,0.1)]"
      />

      {/* TEXTURAS DE FONDO */}
      <BackgroundPatterns pattern={client.background_pattern || 'none'} isDark={isDark} />

      {/* HEADER CON PARALLAX */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-xl mx-auto pt-24 pb-16 px-8 flex flex-col items-center text-center space-y-8 relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="relative group"
          style={{ scale: logoScaleValue }}
        >
          <div className={`absolute inset-0 blur-3xl rounded-full scale-150 transition-transform duration-700 ${isDark ? 'bg-patagonia-gold/10' : 'bg-black/5'}`} />
          <div 
            className={`relative overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-110 ${
              client.logo_shape === 'circle' ? 'rounded-full' : 
              client.logo_shape === 'square' ? 'rounded-2xl' : 'rounded-[2.8rem]'
            } ${isDark ? 'bg-zinc-900 shadow-patagonia-gold/5' : 'bg-gray-50 shadow-black/10'}`}
            style={{ 
              width: '112px', 
              height: '112px',
              border: client.logo_border_enabled ? `4px solid ${brandColor}` : 'none',
              padding: client.logo_border_enabled ? '4px' : '0'
            }}
          >
            {client.logo_url ? (
              <img 
                src={client.logo_url} 
                alt={client.name} 
                className={`w-full h-full object-cover ${client.logo_shape === 'circle' ? 'rounded-full' : 'rounded-none'}`} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black text-patagonia-gold font-black italic text-4xl">
                {client.name?.[0]}
              </div>
            )}
          </div>
        </motion.div>

        {client.description && (
          <motion.div variants={itemVariants} className="space-y-3">
             <p className={`font-bold uppercase text-[10px] tracking-[0.35em] leading-relaxed max-w-[280px] mx-auto opacity-60 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>
               {client.description}
             </p>
          </motion.div>
        )}
      </motion.div>

      {/* ENLACES */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-xl mx-auto px-8 space-y-5"
      >
        {links.map((link) => (
          <motion.button
            key={link.id}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={() => handleLinkClick(link)}
            className={`w-full p-6 border rounded-[2rem] flex items-center justify-between group transition-all duration-300 ${
              isDark 
              ? 'bg-zinc-900/50 border-zinc-800 text-white hover:bg-patagonia-gold hover:text-black hover:border-patagonia-gold' 
              : 'bg-gray-50 border-gray-100 text-black hover:bg-black hover:text-white'
            } shadow-sm hover:shadow-2xl`}
          >
            <div className="flex items-center gap-5">
               <div 
                 style={buttonStyle}
                 className={`relative overflow-hidden w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                   isDark ? 'text-black group-hover:scale-110' : 'text-white shadow-sm group-hover:scale-110'
                 }`}
               >
                  <ShineEffect />
                  <SmartIcon iconId={link.icon} url={link.url} />
               </div>
               <div className="text-left">
                  <span className="block font-black italic uppercase text-[12px] tracking-tight group-hover:tracking-wider transition-all duration-300">{link.title}</span>
                  <span className={`text-[7px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-zinc-500 group-hover:text-black/40' : 'text-gray-300 group-hover:text-patagonia-gold/60'}`}>
                    Digital Asset Access
                  </span>
               </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-zinc-800 group-hover:bg-black/10' : 'bg-white group-hover:bg-patagonia-gold/10'}`}>
              <ChevronRight className={`w-4 h-4 transition-all group-hover:translate-x-0.5 ${isDark ? 'text-zinc-600 group-hover:text-black' : 'text-gray-300 group-hover:text-patagonia-gold'}`} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* FOOTER */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        className="max-w-xl mx-auto mt-32 pb-16 flex flex-col items-center gap-4"
      >
         <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">PatagoniaCoach Click Network</span>
         </div>
         <p className="text-[6px] font-black uppercase tracking-widest text-gray-400">Authority Verification: ACTIVE • Secure Protocol: ENABLED</p>
      </motion.div>

      {/* BARRA DE CONTACTO (GLASSMORFISM 2.0) */}
      <AnimatePresence>
        {client.lead_capture_active && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 150, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 1 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50"
          >
            <div className={`bg-black/40 backdrop-blur-3xl rounded-[3rem] p-3 flex items-center justify-around shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5`}>
               
               {client.whatsapp && (
                 <a 
                   href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} 
                   target="_blank" 
                   onClick={triggerHaptic}
                   className="flex flex-col items-center gap-2 py-3 px-5 group relative"
                 >
                    {/* Pulso CTA Verde WhatsApp */}
                    <motion.div 
                      animate={{ scale: [1, 1.8, 1], opacity: [0, 0.4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-[#25D366]/30 rounded-full blur-2xl pointer-events-none"
                    />
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-2xl transition-all shadow-2xl relative z-10 flex items-center justify-center border border-white/10 bg-[#25D366] overflow-hidden"
                    >
                       <ShineEffect />
                       <MessageCircle className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                 </a>
               )}

               {client.phone && (
                 <a 
                   href={`tel:${client.phone}`} 
                   onClick={triggerHaptic}
                   className="flex flex-col items-center gap-2 py-3 px-5 group"
                 >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-2xl transition-all shadow-2xl flex items-center justify-center border border-white/10 bg-[#EF4444] overflow-hidden relative"
                    >
                       <ShineEffect />
                       <Phone className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#EF4444] transition-colors">Llamar</span>
                 </a>
               )}

               {client.address && (
                 <a 
                   href={client.address} 
                   target="_blank" 
                   onClick={triggerHaptic}
                   className="flex flex-col items-center gap-2 py-3 px-5 group"
                 >
                    <motion.div 
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-2xl transition-all shadow-2xl flex items-center justify-center border border-white/10 bg-[#3B82F6] overflow-hidden relative"
                    >
                       <ShineEffect />
                       <MapPin className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-[#3B82F6] transition-colors">Dirección</span>
                 </a>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div> {/* Fin del Contenedor Mobile */}
    </div>
  );
}

function BackgroundPatterns({ pattern, isDark }: { pattern: string, isDark: boolean }) {
  if (!pattern || pattern === 'none') return null;

  const color = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {pattern === 'dots' && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, 
            backgroundSize: '24px 24px' 
          }} 
        />
      )}
      {pattern === 'grid' && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      )}
      {pattern === 'lines' && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(0deg, ${color} 1px, transparent 1px)`, 
            backgroundSize: '100% 32px' 
          }} 
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-transparent via-transparent to-black' : 'from-transparent via-transparent to-white'}`} />
    </div>
  );
}

// Función para vibración háptica (solo móvil)
const triggerHaptic = () => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10); // Un clic casi imperceptible
  }
};

// Componente de Brillo Dinámico (Shine)
function ShineEffect() {
  return (
    <motion.div 
      initial={{ x: '-100%', skewX: -20 }}
      animate={{ x: '200%' }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20"
    />
  );
}

function SmartIcon({ iconId, url }: { iconId?: string, url: string }) {
  const lower = (url || '').toLowerCase();
  const baseClass = "w-6 h-6 transition-all duration-300 group-hover:scale-110";
  
  if (iconId === 'instagram' || lower.includes('instagr')) return <FaInstagram className={`${baseClass} text-[#E4405F]`} />;
  if (iconId === 'facebook' || lower.includes('facebo')) return <FaFacebook className={`${baseClass} text-[#1877F2]`} />;
  if (iconId === 'linkedin' || lower.includes('linkedi')) return <FaLinkedin className={`${baseClass} text-[#0A66C2]`} />;
  if (iconId === 'whatsapp' || lower.includes('wa.me')) return <MessageCircle className={`${baseClass} text-[#25D366]`} />;
  if (iconId === 'web') return <Globe className={`${baseClass} text-blue-400`} />;
  if (iconId === 'map') return <MapPin className={`${baseClass} text-red-500`} />;
  if (iconId === 'menu') return <FileText className={`${baseClass} text-patagonia-gold`} />;
  if (iconId === 'offer') return <Tag className={`${baseClass} text-green-500`} />;
  
  return <ExternalLink className={`${baseClass} opacity-50`} />;
}


