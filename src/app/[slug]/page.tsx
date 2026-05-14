import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProfileContent from '@/components/ProfileContent';

// ISR desactivado temporalmente para ver cambios al instante
export const revalidate = 0;

// Generar rutas estáticas para los slugs (opcional, mejora velocidad inicial)
export async function generateStaticParams() {
  const { data: clients } = await supabase.from('clients').select('slug');
  return clients?.map((client) => ({ slug: client.slug })) || [];
}

export default async function ClientProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Fetch de datos en el SERVIDOR (Máxima velocidad y SEO)
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single();

  if (clientError || !client) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('client_id', client.id)
    .eq('active', true)
    .order('position', { ascending: true });

  // 2. Pasar los datos al componente de CLIENTE para las animaciones y micro-interacciones
  return <ProfileContent client={client} links={links || []} />;
}
