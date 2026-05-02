export type Client = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  brand_color: string;
  background_color: string;
  text_color: string;
  active: boolean;
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
