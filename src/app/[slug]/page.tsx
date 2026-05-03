'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ExternalLink, 
  MessageCircle, 
  CheckCircle2,
  MapPin,
  Smartphone,
  Globe,
  Mail
} from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';

export default function ClientProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug;
  
  const [client, setClient] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [leadName, setLeadName] = useState('');
  const [leadWsp, setLeadWsp] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (clientError || !clientData) {
          setError(true);
          setLoading(false);
          return;
        }

        setClient(clientData);

        // Actualizar el título de la pestaña del navegador
        document.title = `${clientData.name} | PatagoniaCoach Click`;

        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('client_id', clientData.id)
          .eq('active', true)
          .order('position', { ascending: true });

        if (linksData) {
          const filtered = linksData.filter(link => {
            const url = link.url.toLowerCase();
            const isWhatsApp = url.includes('wa.me') || url.includes('whatsapp');
            const isPhone = url.includes('tel:') || url.match(/^(\+?[\d\s-]{7,})$/);
            const isMap = url.includes('maps.google') || url.includes('goo.gl/maps');
            if (isWhatsApp && clientData.whatsapp) return false;
            if (isPhone && clientData.phone) return false;
            if (isMap && clientData.address) return false;
            return true;
          });
          setLinks(filtered);
        }

        setLoading(false);

        // Registro de Visita con Atribución
        const utm_source = searchParams.get('utm_source');
        const utm_medium = searchParams.get('utm_medium');
        const utm_campaign = searchParams.get('utm_campaign');
        const referrer = document.referrer || 'Direct';

        supabase.from('page_views').insert({ 
          client_id: clientData.id,
          utm_source,
          utm_medium,
          utm_campaign,
          referrer
        }).then();
        
        setTimeout(() => setShowProof(true), 5000);
        setTimeout(() => setShowProof(false), 12000);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, searchParams]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !client) return;
    setLeadStatus('loading');
    try {
      const { error: insertError } = await supabase.from('leads').insert({
        client_id: client.id,
        name: leadName,
        whatsapp: leadWsp || null,
        email: leadEmail || null
      });
      if (insertError) throw insertError;
      setLeadStatus('success');
    } catch (err: any) {
      setLeadStatus('error');
    }
  };

  const handleLinkClick = (linkId: string) => {
    const utm_source = searchParams.get('utm_source') || '';
    const utm_medium = searchParams.get('utm_medium') || '';
    const utm_campaign = searchParams.get('utm_campaign') || '';
    const url = `/api/click/${linkId}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" /></div>;
  if (error || !client) return <div className="h-screen flex items-center justify-center p-6 bg-white text-gray-400 text-center font-black italic text-4xl">404</div>;

  const theme = client.theme || 'neutral';
  const type = client.lead_capture_type || 'whatsapp';
  const hasContactInfo = client.phone || client.whatsapp || client.address;

  return (
    <main className={`h-[100dvh] w-full flex flex-col items-center overflow-hidden transition-all duration-1000 relative ${
      theme === 'stealth' ? 'bg-black text-white' : 
      theme === 'glass' ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-black'
    }`}>
      
      {/* TRACKING SCRIPTS */}
      {client.ga_tracking_id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${client.ga_tracking_id}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${client.ga_tracking_id}');`}
          </Script>
        </>
      )}

      {client.fb_pixel_id && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${client.fb_pixel_id}');fbq('track', 'PageView');`}
        </Script>
      )}

      {/* HEADER */}
      <header className="w-full max-w-md pt-8 pb-4 flex flex-col items-center text-center space-y-3 z-20 shrink-0">
         {client.logo_url && (
           <div className={`relative w-14 h-14 overflow-hidden border-2 border-white shadow-xl ${theme === 'neutral' ? 'rounded-full' : 'rounded-xl'}`}>
              <Image src={client.logo_url} alt={client.name} fill className="object-cover" />
           </div>
         )}
         <div className="space-y-0.5">
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">{client.name}</h1>
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-40 px-6 leading-tight">{client.description}</p>
         </div>
      </header>

      {/* CONTENIDO */}
      <div className="w-full max-w-md flex-1 overflow-y-auto no-scrollbar px-6 space-y-5 z-10 pb-40">
        <div className="space-y-2">
          {links.map((link) => (
            <button 
              key={link.id} 
              onClick={() => handleLinkClick(link.id)} 
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between border transition-all active:scale-95 ${theme === 'neutral' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/10'}`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'neutral' ? 'bg-gray-50 text-black' : 'bg-white/5 text-white'}`}>
                    <SmartIcon url={link.url} />
                 </div>
                 <span className="font-bold uppercase tracking-tight text-[10px]">{link.title}</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-10" />
            </button>
          ))}
        </div>

        {client.lead_capture_active && (
          <div className={`p-6 rounded-[2.5rem] border ${theme === 'neutral' ? 'bg-white border-gray-100 shadow-xl' : 'bg-white/5 border-white/10 backdrop-blur-xl'}`}>
             {leadStatus === 'success' ? (
               <div className="text-center py-4 space-y-2 animate-in zoom-in"><CheckCircle2 className="w-10 h-10 mx-auto text-green-500" /><p className="font-black italic uppercase text-xs text-center">¡Listo!</p></div>
             ) : (
               <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <div className="text-center mb-3">
                     <h3 className="font-black italic uppercase text-xs text-center w-full">{client.lead_capture_text || 'Únete a nosotros'}</h3>
                     <p className="text-[6px] font-bold uppercase tracking-widest opacity-30 text-center w-full">Lista VIP de Beneficios</p>
                  </div>
                  <div className="space-y-2">
                    <input type="text" placeholder="Tu Nombre" required value={leadName} onChange={(e) => setLeadName(e.target.value)} className={`w-full px-4 py-3 rounded-xl font-bold text-[10px] outline-none border focus:border-patagonia-gold transition-all ${theme === 'neutral' ? 'bg-gray-50 border-transparent text-black' : 'bg-white/5 border-white/10 text-white'}`} />
                    {(type === 'whatsapp' || type === 'both') && <input type="tel" placeholder="WhatsApp" required value={leadWsp} onChange={(e) => setLeadWsp(e.target.value)} className={`w-full px-4 py-3 rounded-xl font-bold text-[10px] outline-none border focus:border-patagonia-gold transition-all ${theme === 'neutral' ? 'bg-gray-50 border-transparent text-black' : 'bg-white/5 border-white/10 text-white'}`} />}
                    {(type === 'email' || type === 'both') && <input type="email" placeholder="Email" required value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className={`w-full px-4 py-3 rounded-xl font-bold text-[10px] outline-none border focus:border-patagonia-gold transition-all ${theme === 'neutral' ? 'bg-gray-50 border-transparent text-black' : 'bg-white/5 border-white/10 text-white'}`} />}
                  </div>
                  <button disabled={leadStatus === 'loading'} className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[8px] shadow-lg disabled:opacity-50" style={{ backgroundColor: client.brand_color, color: '#fff' }}>{leadStatus === 'loading' ? 'Enviando...' : 'Unirme Ahora'}</button>
               </form>
             )}
          </div>
        )}

        {/* WATERMARK BRANDING */}
        <div className="pt-8 pb-12 flex flex-col items-center opacity-20">
           <p className="text-[6px] font-black uppercase tracking-[0.3em]">Powered by</p>
           <p className="text-[8px] font-black italic tracking-tighter uppercase">PatagoniaCoach Click</p>
        </div>
      </div>

      {/* STICKY BAR */}
      {hasContactInfo && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className={`p-1.5 rounded-2xl flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 backdrop-blur-2xl ${theme === 'neutral' ? 'bg-black/95 border-white/10' : 'bg-white/10 border-white/10'}`} style={{ borderColor: theme === 'neutral' ? 'rgba(255,255,255,0.1)' : client.brand_color + '44' }}>
              {client.phone && <a href={`tel:${client.phone}`} className="flex-1 flex flex-col items-center py-2.5 gap-1 hover:bg-white/5 rounded-xl transition-all"><Smartphone className="w-4 h-4 text-white" /><span className="text-[6px] font-black uppercase tracking-widest text-white/50">Llamar</span></a>}
              {client.phone && client.whatsapp && <div className="w-px h-5 bg-white/10" />}
              {client.whatsapp && <a href={`https://wa.me/${client.whatsapp}`} className="flex-1 flex flex-col items-center py-2.5 gap-1 hover:bg-white/5 rounded-xl transition-all"><MessageCircle className="w-4 h-4 text-green-400" /><span className="text-[6px] font-black uppercase tracking-widest text-white/50">WhatsApp</span></a>}
              {client.whatsapp && client.address && <div className="w-px h-5 bg-white/10" />}
              {client.address && <a href={client.address.startsWith('http') ? client.address : `https://maps.google.com/?q=${encodeURIComponent(client.address)}`} target="_blank" className="flex-1 flex flex-col items-center py-2.5 gap-1 hover:bg-white/5 rounded-xl transition-all"><MapPin className="w-4 h-4 text-red-400" /><span className="text-[6px] font-black uppercase tracking-widest text-white/50">Mapa</span></a>}
          </div>
        </div>
      )}
    </main>
  );
}

function SmartIcon({ url }: { url: string }) {
  const lower = url.toLowerCase();
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return <MessageCircle className="w-4 h-4" />;
  if (lower.includes('instagr')) return <InstagramIcon />;
  if (lower.includes('facebo')) return <FacebookIcon />;
  if (lower.includes('linkedi')) return <LinkedinIcon />;
  if (lower.includes('tiktok')) return <TiktokIcon />;
  if (lower.includes('youtube')) return <YoutubeIcon />;
  if (lower.includes('@')) return <Mail className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

function InstagramIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function FacebookIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function LinkedinIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>; }
function YoutubeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>; }
function TiktokIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>; }
