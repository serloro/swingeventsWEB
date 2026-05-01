// ── Tipos que deben coincidir con las colecciones de Directus ──

export interface Event {
  id:         string;
  name:       string;
  date:       string;        // ISO 8601: "2025-05-03"
  city:       string;
  country:    string;
  continent:  string;
  style:      string;
  type:       'festival' | 'social' | 'workshop' | 'competicion' | 'exchange';
  url?:       string;
  image?:     string;        // UUID del asset Directus
}

export interface Post {
  id:       string;
  title:    string;
  category: string;
  excerpt:  string;
  date:     string;         // ISO 8601
  icon?:    string;
  slug:     string;
}

// ── Schema Directus (una entrada por colección) ──
export interface DirectusSchema {
  events: Event[];
  posts:  Post[];
}
