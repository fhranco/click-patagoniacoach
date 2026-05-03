import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params; // Resolución correcta de la promesa de params
    const searchParams = request.nextUrl.searchParams;
    const headerList = await headers();

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

    // 2. Registro de Clic con Atribución
    await supabase.from('clicks').insert({
      client_id: link.client_id,
      link_id: linkId,
      user_agent: headerList.get('user-agent') || 'Unknown',
      referrer: headerList.get('referer') || 'Direct',
      ip_address: ip,
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign')
    });

    // 3. Lógica de Destino
    let destination = link.url.trim();
    const clientSlug = (link.clients as any)?.slug || 'unknown';

    if (destination.startsWith('http') && !destination.includes('wa.me') && !destination.includes('whatsapp')) {
      try {
        const urlObj = new URL(destination);
        urlObj.searchParams.set('utm_source', 'patagoniacoach_click');
        urlObj.searchParams.set('utm_medium', 'bio_link');
        urlObj.searchParams.set('utm_campaign', clientSlug);
        destination = urlObj.toString();
      } catch (e) {
        // Si no es una URL válida para el constructor de URL, la dejamos como está
      }
    }

    return Response.redirect(destination, 307);
    
  } catch (err) {
    console.error('API Redirect Error:', err);
    return Response.redirect(new URL('/', request.url), 307);
  }
}
