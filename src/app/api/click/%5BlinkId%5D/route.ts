import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  const { linkId } = params;
  const headerList = headers();
  
  try {
    // 1. Buscar el link y su cliente asociado
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('url, client_id, active')
      .eq('id', linkId)
      .single();

    if (linkError || !link || !link.active) {
      return NextResponse.redirect(new URL('/error', request.url));
    }

    // 2. Extraer metadatos para el tracking
    const userAgent = headerList.get('user-agent') || 'Unknown';
    const referrer = headerList.get('referer') || 'Direct';
    
    // Capturar UTMs de la URL de origen (si vienen en el referer o si se pasaron por query)
    const url = new URL(request.url);
    const utm_source = url.searchParams.get('utm_source');
    const utm_medium = url.searchParams.get('utm_medium');
    const utm_campaign = url.searchParams.get('utm_campaign');

    // 3. Registrar el clic en la base de datos (Background)
    // No esperamos el resultado para que la redirección sea instantánea
    supabase.from('clicks').insert({
      client_id: link.client_id,
      link_id: linkId,
      user_agent: userAgent,
      referrer: referrer,
      utm_source,
      utm_medium,
      utm_campaign
    }).then(({ error }) => {
      if (error) console.error('Error recording click:', error);
    });

    // 4. Redirigir al destino final
    return NextResponse.redirect(new URL(link.url));
    
  } catch (err) {
    console.error('Click tracking error:', err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
