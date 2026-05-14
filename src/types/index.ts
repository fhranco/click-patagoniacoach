export type Client = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  brand_color: string;
  brand_color_secondary: string | null; // Nuevo: Para gradientes
  background_color: string;
  background_pattern: 'none' | 'dots' | 'grid' | 'lines';
  logo_shape: 'circle' | 'squircle' | 'square'; // Nuevo
  logo_scale: number; // Nuevo
  logo_border_enabled: boolean; // Nuevo
  text_color: string;
  active: boolean;
  authority_mode: 'light' | 'dark';
  created_at: string;
};

export type Link = {
  id: string;
  client_id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  active: boolean;
  schedule_active: boolean; // Nuevo
  schedule_start: string | null; // Nuevo (HH:mm)
  schedule_end: string | null; // Nuevo (HH:mm)
  is_ab_test: boolean; // Nuevo
  title_variant: string | null; // Nuevo
  created_at: string;
};

export type PageView = {
  id: string;
  client_id: string;
  created_at: string;
  referrer: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export type Click = {
  id: string;
  client_id: string;
  link_id: string;
  created_at: string;
  referrer: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};
