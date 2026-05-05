// ── Tipos que deben coincidir con las colecciones de Directus ──

export interface Artist {
  id:           string;
  name:         string;
  slug:         string;
  role:         'teacher' | 'band' | 'dj';
  image?:       string;
  nationality?: string;
  bio?:         string;
  specialties?: string[];
  website?:     string;
  instagram?:   string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Event {
  id:           string;
  name:         string;
  date:         string;        // ISO 8601: "2025-05-03"
  dateTo?:      string;        // ISO 8601: fecha de fin
  city:         string;
  country:      string;
  continent:    string;
  style:        string;
  type:         'festival' | 'social' | 'workshop' | 'competicion' | 'exchange';
  url?:         string;
  instagram?:   string;
  facebook?:    string;
  youtube?:     string;
  image?:       string;        // UUID del asset Directus
  description?: string;
  artists?:     Artist[];
  ticketUrl?:   string;
  map?:         LatLng;        // Coordenadas del venue
}

export interface Post {
  id:        string;
  title:     string;
  category:  string;
  excerpt:   string;
  date:      string;           // ISO 8601
  icon?:     string;
  slug:      string;
  content?:  string;
  author?:   string;
  readTime?: number;           // minutos
}

// ── Schema Directus (una entrada por colección) ──
export interface DirectusSchema {
  events:  Event[];
  posts:   Post[];
  artists: Artist[];
}
