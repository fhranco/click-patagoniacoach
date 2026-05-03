import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const linkId = resolvedParams.linkId;
    const headerList = await headers();

    // Capturar IP Real (considerando proxies de Vercel/Cloudflare)
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // 1. Obtener Link y Slug
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('url, client_id, clients(slug)')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return Response.redirect(new URL('/', request.url), 307);
    }

    // 2. Registro de Clic ENRIQUECIDO (IP + Metadata)
    await supabase.from('clicks').insert({
      client_id: link.client_id,
      link_id: linkId,
      user_agent: headerList.get('user-agent') || 'Unknown',
      referrer: headerList.get('referer') || 'Direct',
      ip_address: ip
    });

    // 3. Lógica de Destino con UTMs
    let destination = link.url.trim();
    const clientSlug = (link.clients as any)?.slug || 'unknown';

    if (destination.startsWith('http') && !destination.includes('wa.me') && !destination.includes('whatsapp')) {
      const urlObj = new URL(destination);
      urlObj.searchParams.set('utm_source', 'patagoniacoach_click');
      urlObj.searchParams.set('utm_medium', 'bio_link');
      urlObj.searchParams.set('utm_campaign', clientSlug);
      destination = urlObj.toString();
    }

    if (destination.includes('wa.me')) {
      const message = encodeURIComponent(`Hola! Vengo desde tu link de ${clientSlug}...`);
      destination = `${destination}${destination.includes('?') ? '&' : '?'}text=${message}`;
    }

    return Response.redirect(destination, 307);
    
  } catch (err) {
    console.error('API Redirect Error:', err);
    return Response.redirect(new URL('/', request.url), 307);
  }
}
