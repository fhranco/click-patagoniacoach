import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Usamos el Service Role para saltar RLS y poder auditar todo
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Verificación de seguridad (opcional: token secreto en el header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Obtener todos los links activos
    const { data: links, error } = await supabaseAdmin
      .from('links')
      .select('id, url, client_id')
      .eq('active', true);

    if (error) throw error;

    const results = [];

    // 2. Auditar cada link (en paralelo limitado o secuencial)
    for (const link of (links || [])) {
      try {
        const response = await fetch(link.url, { 
          method: 'HEAD', 
          next: { revalidate: 0 } 
        });
        
        const status = response.status;
        const isOk = status >= 200 && status < 400;

        // 3. Registrar el resultado en una tabla de logs (o actualizar el link)
        await supabaseAdmin.from('link_health_logs').insert({
          link_id: link.id,
          status_code: status,
          is_alive: isOk,
          checked_at: new Date().toISOString()
        });

        results.push({ id: link.id, status, isOk });
      } catch (err) {
        await supabaseAdmin.from('link_health_logs').insert({
          link_id: link.id,
          status_code: 0,
          is_alive: false,
          error_message: 'Fetch failed',
          checked_at: new Date().toISOString()
        });
        results.push({ id: link.id, status: 0, isOk: false });
      }
    }

    return NextResponse.json({ 
      message: 'Audit complete', 
      processed: results.length,
      failures: results.filter(r => !r.isOk).length 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
