import { supabase } from './supabase';

export const trackPageView = async (clientId: string) => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  
  const { error } = await supabase.from('page_views').insert({
    client_id: clientId,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
  });

  if (error) console.error('Error tracking page view:', error);
};

export const trackClick = async (clientId: string, linkId: string) => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);

  const { error } = await supabase.from('clicks').insert({
    client_id: clientId,
    link_id: linkId,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
  });

  if (error) console.error('Error tracking click:', error);
};
