-- TABLA: clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#000000',
    background_color TEXT DEFAULT '#ffffff',
    text_color TEXT DEFAULT '#000000',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLA: links
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    position INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABLA: page_views
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    referrer TEXT,
    user_agent TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- TABLA: clicks
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    referrer TEXT,
    user_agent TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- Índices para optimizar consultas de analytics
CREATE INDEX idx_page_views_client_id ON page_views(client_id);
CREATE INDEX idx_clicks_client_id ON clicks(client_id);
CREATE INDEX idx_clicks_link_id ON clicks(link_id);
CREATE INDEX idx_clients_slug ON clients(slug);

-- RLS (Row Level Security) - Por ahora permitimos lectura pública y protegemos escritura
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de clientes activos" ON clients FOR SELECT USING (active = true);
CREATE POLICY "Lectura pública de links activos" ON links FOR SELECT USING (active = true);
CREATE POLICY "Insertar visitas públicamente" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Insertar clics públicamente" ON clicks FOR INSERT WITH CHECK (true);
