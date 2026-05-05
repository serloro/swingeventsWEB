/**
 * src/lib/directus.ts
 *
 * Consulta las tablas personalizadas de Directus:
 *   festivals, events, event_artists, artists
 * filtradas por application_id = 'swingfestivals'.
 *
 * Si Directus no está disponible o USE_MOCK_DATA=true
 * se usa el dataset mock de abajo como fallback.
 */

import type { Event, Post, Artist, LatLng } from '../types/index.js';

// ── Config ───────────────────────────────────────────────────────
const RAW_URL          = import.meta.env.DIRECTUS_URL      as string | undefined;
const DIRECTUS_EMAIL   = import.meta.env.DIRECTUS_EMAIL    as string | undefined;
const DIRECTUS_PASS    = import.meta.env.DIRECTUS_PASSWORD as string | undefined;
const USE_MOCK         = import.meta.env.USE_MOCK_DATA === 'true';
const DIRECTUS_URL     = RAW_URL?.replace(/\/$/, '');
const HAS_DIRECTUS     =
  !!DIRECTUS_URL &&
  DIRECTUS_URL !== 'https://tu-directus.com' &&
  DIRECTUS_URL !== 'http://tu-directus.com' &&
  !!DIRECTUS_EMAIL &&
  !!DIRECTUS_PASS;

const APP_ID = 'swingfestivals';

// ── Helpers ──────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function assetUrl(idOrUrl: string | undefined): string | undefined {
  if (!idOrUrl) return undefined;
  if (idOrUrl.startsWith('http')) return idOrUrl;
  if (!DIRECTUS_URL) return undefined;
  return `${DIRECTUS_URL}/assets/${idOrUrl}`;
}

// ── Raw Directus response types ───────────────────────────────────

interface DFestival {
  id: string;
  title:       string | null;
  country:     string | null;
  city:        string | null;
  location:    string | null;
  description: string | null;
  website:     string | null;
  instagram:   string | null;
  facebook:    string | null;
  youtube:     string | null;
  imageUrl:    string | null;
  imagenB64:   string | null;
  map:         { type: string; coordinates: [number, number] } | { lat: number; lng: number } | null;
}

interface DEvent {
  id: string;
  festival_id: string | null;
  year:        number | null;
  dateFrom:    string | null;
  dateTo:      string | null;
  country:     string | null;
  city:        string | null;
  styles:      string | null;
  sourceUrl:   string | null;
}

interface DArtist {
  id: string;
  name:       string | null;
  website:    string | null;
  instagram:  string | null;
  imageUrl:   string | null;
  imagenB64:  string | null;
}

interface DEventArtist {
  id:        string;
  event_id:  string;
  artist_id: string;
}

// ── Map resolver: acepta GeoJSON Point o {lat,lng} ───────────────

function resolveMap(
  raw: DFestival['map'],
): LatLng | undefined {
  if (!raw) return undefined;
  if ('coordinates' in raw) {
    const [lng, lat] = raw.coordinates;
    return { lat, lng };
  }
  if ('lat' in raw && 'lng' in raw) return raw;
  return undefined;
}

// ── Image resolver: URL tiene prioridad sobre base64 ─────────────

function resolveImage(imageUrl: string | null, imagenB64: string | null): string | undefined {
  if (imageUrl) return assetUrl(imageUrl);
  if (imagenB64) {
    if (imagenB64.startsWith('data:')) return imagenB64;
    return `data:image/jpeg;base64,${imagenB64}`;
  }
  return undefined;
}

// ── Country → Continent lookup ────────────────────────────────────

const CONTINENT: Record<string, string> = {
  España: 'Europa', Spain: 'Europa',
  France: 'Europa', Francia: 'Europa',
  Germany: 'Europa', Alemania: 'Europa',
  'United Kingdom': 'Europa', 'Reino Unido': 'Europa',
  Sweden: 'Europa', Suecia: 'Europa',
  Norway: 'Europa', Noruega: 'Europa',
  Poland: 'Europa', Polonia: 'Europa',
  Italy: 'Europa', Italia: 'Europa',
  Netherlands: 'Europa', 'Países Bajos': 'Europa',
  Belgium: 'Europa', 'Bélgica': 'Europa',
  'Czech Republic': 'Europa', 'República Checa': 'Europa',
  Slovakia: 'Europa', Eslovaquia: 'Europa',
  Hungary: 'Europa', 'Hungría': 'Europa',
  Austria: 'Europa',
  Switzerland: 'Europa', Suiza: 'Europa',
  Portugal: 'Europa',
  Denmark: 'Europa', Dinamarca: 'Europa',
  Finland: 'Europa', Finlandia: 'Europa',
  Estonia: 'Europa', Latvia: 'Europa', Lithuania: 'Europa',
  Croatia: 'Europa', Croacia: 'Europa',
  Serbia: 'Europa', Romania: 'Europa', 'Rumanía': 'Europa',
  Bulgaria: 'Europa', Greece: 'Europa', Grecia: 'Europa',
  Russia: 'Europa', Rusia: 'Europa',
  Ukraine: 'Europa', Ucrania: 'Europa',
  'United States': 'América del Norte',
  'Estados Unidos': 'América del Norte',
  USA: 'América del Norte',
  Canada: 'América del Norte', 'Canadá': 'América del Norte',
  Mexico: 'América del Norte', 'México': 'América del Norte',
  Brazil: 'América del Sur', Brasil: 'América del Sur',
  Argentina: 'América del Sur', Colombia: 'América del Sur',
  Chile: 'América del Sur', Peru: 'América del Sur', 'Perú': 'América del Sur',
  Japan: 'Asia', 'Japón': 'Asia',
  China: 'Asia',
  'South Korea': 'Asia', 'Corea del Sur': 'Asia',
  Taiwan: 'Asia', Thailand: 'Asia', Tailandia: 'Asia',
  Singapore: 'Asia', 'Singapur': 'Asia', India: 'Asia', Israel: 'Asia',
  Australia: 'Oceanía', 'New Zealand': 'Oceanía', 'Nueva Zelanda': 'Oceanía',
  'South Africa': 'África', 'Sudáfrica': 'África',
};

function getContinent(country: string | null | undefined): string {
  if (!country) return 'Europa';
  return CONTINENT[country] ?? 'Europa';
}

// ── Styles parser (text field, comma-separated or JSON array) ─────

function parseStyles(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {}
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Auth: login con email/password, token cacheado por build ─────

let _cachedToken: string | undefined;

async function getAuthToken(): Promise<string> {
  if (_cachedToken) return _cachedToken;
  if (!DIRECTUS_URL || !DIRECTUS_EMAIL || !DIRECTUS_PASS) {
    throw new Error('Credenciales Directus no configuradas');
  }

  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email: DIRECTUS_EMAIL, password: DIRECTUS_PASS }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Directus login: ${res.status} ${res.statusText} — ${body}`);
  }

  const json: { data: { access_token: string } } = await res.json();
  _cachedToken = json.data.access_token;
  return _cachedToken;
}

// ── Directus fetch helper ─────────────────────────────────────────

async function dfetch<T>(
  collection: string,
  filter?: Record<string, unknown>,
): Promise<T[]> {
  if (!DIRECTUS_URL) throw new Error('No DIRECTUS_URL configured');

  const token = await getAuthToken();

  const url = new URL(`${DIRECTUS_URL}/items/${collection}`);
  if (filter) url.searchParams.set('filter', JSON.stringify(filter));
  url.searchParams.set('limit', '-1');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Directus [${collection}]: ${res.status} ${res.statusText}`);
  }

  const json: { data: T[] } = await res.json();
  return json.data;
}

// ── Mappers ───────────────────────────────────────────────────────

function mapArtist(a: DArtist): Artist {
  return {
    id:        a.id,
    name:      a.name ?? 'Artista',
    slug:      slugify(a.name ?? a.id),
    role:      'teacher',
    image:     resolveImage(a.imageUrl, a.imagenB64),
    website:   a.website   ?? undefined,
    instagram: a.instagram ?? undefined,
  };
}

function mapEvent(
  e: DEvent,
  festMap:        Map<string, DFestival>,
  artistMap:      Map<string, Artist>,
  eventArtistMap: Map<string, string[]>,
): Event {
  const fest      = e.festival_id ? festMap.get(e.festival_id) : undefined;
  const styles    = parseStyles(e.styles);
  const country   = e.country ?? fest?.country ?? '';
  const city      = e.city    ?? fest?.city    ?? '';
  const date      = e.dateFrom ?? (e.year ? `${e.year}-01-01` : undefined);
  const artistIds = eventArtistMap.get(e.id) ?? [];
  const artists   = artistIds
    .map(id => artistMap.get(id))
    .filter(Boolean) as Artist[];

  return {
    id:          e.id,
    name:        fest?.title ?? `Festival ${e.year ?? ''}`,
    date:        date ?? '2025-01-01',
    city,
    country,
    continent:   getContinent(country),
    style:       styles[0] ?? 'Swing',
    type:        'festival',
    description: fest?.description ?? undefined,
    url:         fest?.website      ?? undefined,
    instagram:   fest?.instagram   ?? undefined,
    facebook:    fest?.facebook    ?? undefined,
    youtube:     fest?.youtube     ?? undefined,
    image:       resolveImage(fest?.imageUrl ?? null, fest?.imagenB64 ?? null),
    artists:     artists.length > 0 ? artists : undefined,
    ticketUrl:   e.sourceUrl ?? undefined,
    map:         resolveMap(fest?.map ?? null),
    dateTo:      e.dateTo ?? undefined,
  };
}

// ── Internal Directus fetchers ────────────────────────────────────

async function fetchEventsFromDirectus(): Promise<Event[]> {
  const [festivalsRaw, eventsRaw, artistsRaw] = await Promise.all([
    dfetch<DFestival>('festivals', { application_id: { _eq: APP_ID } }),
    dfetch<DEvent>('events',    { application_id: { _eq: APP_ID } }),
    dfetch<DArtist>('artists',   { application_id: { _eq: APP_ID } }),
  ]);

  const festMap   = new Map(festivalsRaw.map(f => [f.id, f]));
  const artistMap = new Map(artistsRaw.map(a => [a.id, mapArtist(a)]));

  let eventArtistsRaw: DEventArtist[] = [];
  if (eventsRaw.length > 0) {
    eventArtistsRaw = await dfetch<DEventArtist>('event_artists', {
      event_id: { _in: eventsRaw.map(e => e.id) },
    });
  }

  const eventArtistMap = new Map<string, string[]>();
  for (const ea of eventArtistsRaw) {
    if (!eventArtistMap.has(ea.event_id)) eventArtistMap.set(ea.event_id, []);
    eventArtistMap.get(ea.event_id)!.push(ea.artist_id);
  }

  const today = new Date().toISOString().slice(0, 10);

  return eventsRaw
    .filter(e => {
      const end = e.dateTo ?? e.dateFrom;
      return end != null && end >= today;
    })
    .map(e => mapEvent(e, festMap, artistMap, eventArtistMap))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchArtistsFromDirectus(): Promise<Artist[]> {
  const raw = await dfetch<DArtist>('artists', { application_id: { _eq: APP_ID } });
  return raw.map(mapArtist);
}

// ── Public API ────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  if (USE_MOCK || !HAS_DIRECTUS) return MOCK_EVENTS;
  try {
    return await fetchEventsFromDirectus();
  } catch (err) {
    console.warn('[directus] getEvents falló, usando mock:', err);
    return MOCK_EVENTS;
  }
}

export async function getPosts(): Promise<Post[]> {
  // No hay tabla de posts en Directus; se usan los mock.
  return MOCK_POSTS;
}

export async function getArtists(): Promise<Artist[]> {
  if (USE_MOCK || !HAS_DIRECTUS) return MOCK_ARTISTS;
  try {
    return await fetchArtistsFromDirectus();
  } catch (err) {
    console.warn('[directus] getArtists falló, usando mock:', err);
    return MOCK_ARTISTS;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return MOCK_POSTS.find(p => p.slug === slug);
}

export async function getEventBySlug(festival: string, year: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find(e =>
    e.type === 'festival' &&
    slugify(e.name) === festival &&
    String(new Date(e.date).getFullYear()) === year,
  );
}

export async function getArtistBySlug(slug: string): Promise<Artist | undefined> {
  const [artists, events] = await Promise.all([getArtists(), getEvents()]);
  const direct = artists.find(a => a.slug === slug);
  if (direct) return direct;
  for (const e of events) {
    const a = e.artists?.find(a => a.slug === slug);
    if (a) return a;
  }
  return undefined;
}

// ════════════════════════════════════════════════════════════════
// MOCK DATA  (fallback cuando Directus no está disponible)
// ════════════════════════════════════════════════════════════════

const MOCK_ARTISTS: Artist[] = [
  {
    id: 'a1', name: 'Skye Humphries', slug: 'skye-humphries',
    role: 'teacher', nationality: 'Estados Unidos',
    bio: 'Campeón mundial de Lindy Hop y uno de los embajadores más reconocidos del swing contemporáneo. Conocido por su musicalidad excepcional y su capacidad para conectar el baile con la tradición del jazz de Harlem, Skye ha enseñado en más de 50 países. Su filosofía de baile parte de la escucha activa y la improvisación honesta.',
    specialties: ['Lindy Hop', 'Charleston', 'Balboa'],
    instagram: '@skyehumphries',
  },
  {
    id: 'a2', name: 'Frida Segerdahl', slug: 'frida-segerdahl',
    role: 'teacher', nationality: 'Suecia',
    bio: 'Bailarina y coreógrafa sueca formada en el corazón del swing europeo. Frida ha desarrollado un estilo que fusiona la autenticidad del Harlem original con sensibilidades contemporáneas. También es instructora de formación pedagógica para profesores de swing en toda Europa.',
    specialties: ['Lindy Hop', 'Solo Jazz', 'Authentic Jazz'],
    instagram: '@fridasegerdahl',
  },
  {
    id: 'a3', name: 'Mickey Fortanasce', slug: 'mickey-fortanasce',
    role: 'teacher', nationality: 'Estados Unidos',
    bio: 'Especialista en Balboa de Los Ángeles, Mickey es uno de los instructores más rigurosos del circuito internacional. Ha documentado y preservado la tradición del Balboa puro estudiando con los últimos bailarines originales de la costa oeste americana.',
    specialties: ['Balboa', 'Balboa Pure', 'Swing'],
  },
  {
    id: 'a4', name: 'Kelly Arsenault', slug: 'kelly-arsenault',
    role: 'teacher', nationality: 'Estados Unidos',
    bio: 'Compañera de baile y docencia de Mickey Fortanasce, Kelly aporta ligereza, expresividad y gran musicalidad al Balboa. Su comprensión del fraseo musical la hace especialmente valorada en eventos dedicados a este estilo íntimo y técnicamente exigente.',
    specialties: ['Balboa', 'Lindy Hop'],
  },
  {
    id: 'a5', name: 'Todd Yannacone', slug: 'todd-yannacone',
    role: 'teacher', nationality: 'Estados Unidos',
    bio: 'El referente mundial del Solo Jazz y el Rhythm Tap. Todd lleva el vocabulario de los bailarines del Harlem de los años 30 y 40 a escenarios de todo el mundo con un rigor histórico único y una energía absolutamente contagiosa en pista.',
    specialties: ['Solo Jazz', 'Rhythm Tap', 'Authentic Jazz'],
  },
  {
    id: 'a6', name: 'Aurélie Deschamps', slug: 'aurelie-deschamps',
    role: 'teacher', nationality: 'Francia',
    bio: 'Especialista en Blues y Slow Drag, Aurélie es una de las voces más importantes de la escena de baile afroamericano en Europa. Su trabajo pedagógico une la práctica del baile con su contexto histórico y cultural.',
    specialties: ['Blues', 'Slow Drag', 'Lindy Hop'],
  },
  {
    id: 'a7', name: 'The Cannonball Orchestra', slug: 'cannonball-orchestra',
    role: 'band', nationality: 'Suecia',
    bio: 'La big band sueca más activa de la escena swing europea. Con más de quince músicos en escena, The Cannonball Orchestra recrea el sonido de las grandes orquestas de la era del swing con un frescor y una potencia únicos, ideales para llenar pistas de baile.',
    specialties: ['Big Band', 'Swing', 'Jazz'],
  },
  {
    id: 'a8', name: 'Jonathan Stout & His Campus Five', slug: 'jonathan-stout-campus-five',
    role: 'band', nationality: 'Estados Unidos',
    bio: 'Quinteto de jazz de California que lleva el sonido de los años 40 con una fidelidad y energía excepcionales. Jonathan Stout, pianista y arreglista, ha creado uno de los grupos más queridos del circuito internacional de festivales de swing.',
    specialties: ['Jazz', 'Swing', 'Blues'],
  },
  {
    id: 'a9', name: 'Kristoffer Kompen Septet', slug: 'kristoffer-kompen-septet',
    role: 'band', nationality: 'Noruega',
    bio: 'El septet del trombonista noruego Kristoffer Kompen fusiona el jazz escandinavo con el swing americano en una propuesta de sonido única. Sus actuaciones en festivales europeos son legendarias por la energía que generan en la pista.',
    specialties: ['Swing', 'Jazz', 'Big Band'],
  },
];

const [skye, frida, mickey, kelly, todd, aurelie, cannonball, jstout, kompen] = MOCK_ARTISTS;

const MOCK_EVENTS: Event[] = [
  {
    id: '1', date: '2025-05-03', name: 'Madrid Swing Festival',
    city: 'Madrid', country: 'España', continent: 'Europa', style: 'Lindy Hop', type: 'festival',
    description: 'Cuatro días de swing puro en el corazón de Madrid. El festival que ha convertido la capital española en un punto de referencia del Lindy Hop europeo, con una programación internacional de primer nivel y una pista de madera que no para en toda la noche.',
    artists: [skye, frida, cannonball, jstout],
    ticketUrl: 'https://example.com/tickets',
  },
  {
    id: '2', date: '2025-05-08', name: 'Sitges Balboa Beach',
    city: 'Sitges', country: 'España', continent: 'Europa', style: 'Balboa', type: 'festival',
    description: 'El festival de Balboa más especial de la península ibérica, con vistas al mar y un ambiente íntimo que lo ha convertido en cita obligada para los amantes de este estilo técnico y elegante.',
    artists: [mickey, kelly, jstout],
    ticketUrl: 'https://example.com/tickets',
  },
  { id: '3',  date: '2025-05-10', name: 'Lindy Hop Sevilla',           city: 'Sevilla',    country: 'España',         continent: 'Europa',            style: 'Lindy Hop',     type: 'social' },
  { id: '4',  date: '2025-05-15', name: 'Paris Bal Swing',             city: 'París',      country: 'Francia',        continent: 'Europa',            style: 'Blues',         type: 'social' },
  { id: '5',  date: '2025-05-17', name: 'Workshop con Skye & Frida',   city: 'Barcelona',  country: 'España',         continent: 'Europa',            style: 'Lindy Hop',     type: 'workshop', artists: [skye, frida] },
  { id: '6',  date: '2025-05-22', name: 'Berlin Solo Jazz Weekend',    city: 'Berlín',     country: 'Alemania',       continent: 'Europa',            style: 'Solo Jazz',     type: 'workshop', artists: [todd] },
  { id: '7',  date: '2025-05-24', name: 'Campeonato Nacional Swing',   city: 'Valencia',   country: 'España',         continent: 'Europa',            style: 'Lindy Hop',     type: 'competicion' },
  { id: '8',  date: '2025-05-30', name: 'London Swing Exchange',       city: 'Londres',    country: 'United Kingdom', continent: 'Europa',            style: 'Lindy Hop',     type: 'exchange' },
  {
    id: '9', date: '2025-06-05', name: 'Warsaw Balboa Festival',
    city: 'Varsovia', country: 'Poland', continent: 'Europa', style: 'Balboa', type: 'festival',
    description: 'El festival de Balboa más completo de Europa Central, reuniendo a la elite mundial de este estilo en la hermosa Varsovia. Tres días de clases intensivas, sociales nocturnas y la mejor música para bailar Balboa.',
    artists: [mickey, kelly, jstout],
  },
  {
    id: '10', date: '2025-06-07', name: 'Verano Swing Bilbao',
    city: 'Bilbao', country: 'España', continent: 'Europa', style: 'Lindy Hop', type: 'festival',
    description: 'El festival de verano del norte de España que combina Lindy Hop, jazz en directo y la inigualable gastronomía vasca. Un fin de semana para el recuerdo en el País Vasco.',
    artists: [frida, kompen],
  },
  { id: '11', date: '2025-06-12', name: 'NYC Lindy Exchange',          city: 'Nueva York', country: 'United States',  continent: 'América del Norte', style: 'Lindy Hop',     type: 'exchange' },
  { id: '12', date: '2025-06-14', name: 'Paris Swing Nights',          city: 'París',      country: 'Francia',        continent: 'Europa',            style: 'Charleston',    type: 'social' },
  {
    id: '13', date: '2025-06-19', name: 'Rome Boogie Woogie Festival',
    city: 'Roma', country: 'Italia', continent: 'Europa', style: 'Boogie Woogie', type: 'festival',
    description: 'El mayor festival de Boogie Woogie y Rock\'n\'Roll de Italia, celebrando las raíces afroamericanas de la danza con artistas venidos de todo el mundo a la Ciudad Eterna.',
  },
  { id: '14', date: '2025-06-21', name: 'Blues & Swing al Aire',       city: 'Madrid',     country: 'España',         continent: 'Europa',            style: 'Blues',         type: 'social' },
  {
    id: '15', date: '2025-06-28', name: 'Herräng Dance Camp — Week 1',
    city: 'Herräng', country: 'Sweden', continent: 'Europa', style: 'Lindy Hop', type: 'festival',
    description: 'El festival fundacional del swing moderno. Cinco semanas de inmersión total en la cultura swing, con los mejores profesores del mundo y una comunidad que transforma a quienes la viven. Herräng no es solo un festival: es un estado mental.',
    artists: [skye, frida, todd, kompen],
  },
  { id: '16', date: '2025-07-05', name: 'Taller Intensivo Balboa BCN', city: 'Barcelona',  country: 'España',         continent: 'Europa',            style: 'Balboa',        type: 'workshop', artists: [mickey, kelly] },
  {
    id: '17', date: '2025-07-10', name: 'San Francisco Lindy Fest',
    city: 'San Fran.', country: 'United States', continent: 'América del Norte', style: 'Lindy Hop', type: 'festival',
    description: 'El festival de Lindy Hop de la bahía de San Francisco, celebrando la costa oeste del swing americano con una selección de instructores y bandas de primer nivel internacional.',
    artists: [skye, jstout],
  },
  {
    id: '18', date: '2025-07-12', name: 'Costa Swing Festival',
    city: 'Málaga', country: 'España', continent: 'Europa', style: 'Lindy Hop', type: 'festival',
    description: 'Swing y sol mediterráneo en la costa malagueña. Un festival de ambiente relajado y alta calidad que combina las mejores vistas del Mediterráneo con noches de baile interminables.',
    artists: [frida, aurelie, cannonball],
  },
  { id: '19', date: '2025-07-24', name: 'Amsterdam Blues Exchange',    city: 'Ámsterdam',  country: 'Netherlands',    continent: 'Europa',            style: 'Blues',         type: 'exchange' },
  {
    id: '20', date: '2025-08-02', name: 'Edinburgh Swing Festival',
    city: 'Edimburgo', country: 'United Kingdom', continent: 'Europa', style: 'Lindy Hop', type: 'festival',
    description: 'La magia de Edimburgo como escenario para un festival que combina una programación rigurosa con la hospitalidad escocesa. Especialmente recomendado para amantes del vintage y la historia del swing.',
    artists: [todd, aurelie, cannonball],
  },
  { id: '21', date: '2025-08-08', name: 'Valencia Swing Summer',       city: 'Valencia',   country: 'España',         continent: 'Europa',            style: 'Lindy Hop',     type: 'social' },
  {
    id: '22', date: '2025-08-21', name: 'Tokyo Lindy Festival',
    city: 'Tokio', country: 'Japan', continent: 'Asia', style: 'Lindy Hop', type: 'festival',
    description: 'El mayor festival de Lindy Hop de Asia, con una comunidad japonesa apasionada que ha creado una escena única donde la precisión y el estilo se fusionan con la energía del jazz.',
    artists: [skye, jstout],
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: '1', slug: 'origen-lindy-hop',
    category: 'Historia', icon: '♪', date: '2025-05-02',
    author: 'Redacción Swing Festivals', readTime: 5,
    title: 'El origen del Lindy Hop: Harlem, 1920',
    excerpt: 'Cómo nació el baile más influyente del siglo XX en las pistas del Savoy Ballroom.',
    content: `El Lindy Hop nació en las pistas del Savoy Ballroom de Harlem, Nueva York, alrededor de 1928. Frankie Manning, Norma Miller y otros pioneros crearon un vocabulario de movimientos que capturaba la energía eléctrica del jazz de la época.

El nombre "Lindy Hop" se atribuye a una frase del bailarín "Shorty" George Snowden, quien durante un maratón de baile en 1928 declaró estar "hopping over to Europe like Lindy" —Charles Lindbergh acababa de cruzar el Atlántico—. La expresión, capturada por un reportero del New York Mirror, dio nombre al baile para siempre.

Lo que hace especial al Lindy Hop es su estructura dialógica: no existe una coreografía fija, sino un vocabulario compartido que cada pareja improvisa en tiempo real, respondiendo a la música y al compañero. Esto lo diferencia radicalmente de otros bailes de pareja de la época, que dependían de secuencias fijas.

Durante los años 30 y 40, el Lindy Hop viajó del Harlem a las salas de baile de todo Estados Unidos y después al mundo entero. Las grandes orquestas de Count Basie, Duke Ellington y Benny Goodman proporcionaban el combustible musical que hacía posible la magia en la pista.

Tras décadas de declive en los años 50 y 60, cuando el rock desplazó al swing, un grupo de entusiastas suecos "redescubrió" el baile en los años 80 gracias a las grabaciones en vídeo de los bailarines originales. Este revival, iniciado en Estocolmo, nos ha traído el movimiento global que disfrutamos hoy.`,
  },
  {
    id: '2', slug: 'conexion-swing',
    category: 'Técnica', icon: '🎷', date: '2025-04-28',
    author: 'Equipo Editorial', readTime: 4,
    title: 'Conexión en el swing: más allá del agarre',
    excerpt: 'El swing es un diálogo físico. Aprende a escuchar a tu pareja a través del torso.',
    content: `La conexión física entre dos bailarines es el fundamento invisible sobre el que se construye cualquier baile de pareja. En el swing, especialmente en el Lindy Hop, esta conexión no pasa principalmente por las manos sino por el torso, el centro de gravedad del cuerpo.

Imagina que tu cuerpo es una antena: las señales de dirección, velocidad y ritmo se emiten desde el centro de gravedad y se reciben en el mismo punto del compañero. Las manos simplemente mantienen el canal abierto, sin tensión innecesaria ni flaccidez que corte la señal.

Una conexión sana tiene tres propiedades fundamentales: tono muscular —sin exceso de tensión ni flaccidez—, elasticidad —capacidad de absorber y transmitir energía sin perderla— y atención —presencia total al presente del baile, sin anticipar lo que viene a continuación.

El error más común es confundir "seguir bien" con "adivinar". Un buen seguidor no predice lo que va a pasar, eso corta la conversación; escucha y responde en tiempo real. Un buen líder no arrastra a su pareja, sino que propone movimientos y espera la respuesta.

La calidad de la conexión determina el nivel de improvisación posible. A mayor calidad de conexión, mayor posibilidad de sorpresa mutua y creatividad compartida en la pista.`,
  },
  {
    id: '3', slug: 'festivales-europa-2025',
    category: 'Festivales', icon: '🎺', date: '2025-04-20',
    author: 'Redacción Swing Festivals', readTime: 6,
    title: 'Los 5 mejores festivales europeos de 2025',
    excerpt: 'Desde Herräng hasta Swingroove: las citas imprescindibles para este verano.',
    content: `El verano europeo de swing de 2025 viene cargado de opciones. Si tienes que elegir, aquí nuestra selección de festivales imprescindibles.

**Herräng Dance Camp — Suecia, julio**

El festival fundacional. Cinco semanas de inmersión total en la cultura swing, con los mejores profesores del mundo y una comunidad que te cambia la vida. Herräng no es solo un festival: es un estado mental que marca un antes y un después en tu relación con el swing.

**Madrid Swing Festival — España, mayo**

La referencia española con una programación internacional de primer nivel. Este año trae a Skye Humphries y Frida Segerdahl junto con la Cannonball Orchestra. El Palacio del Jazz se convierte en el epicentro del swing ibérico durante cuatro días memorables.

**Warsaw Balboa Festival — Polonia, junio**

Especializado en Balboa, este festival polaco ha conseguido reunir a la elite mundial de este estilo íntimo y técnico. Mickey Fortanasce y Kelly Arsenault encabezan el cartel de un evento que cada año supera su propio nivel.

**Edinburgh Swing Festival — Reino Unido, agosto**

La magia de Edimburgo como escenario para un festival que combina una programación rigurosa con la hospitalidad escocesa. Especialmente recomendado para amantes del vintage y los eventos históricos del swing.

**Costa Swing Festival — España, julio**

Swing y sol mediterráneo en la costa malagueña. Un festival de ambiente relajado y alta calidad que combina las mejores vistas del Mediterráneo con noches de baile que se prolongan hasta el amanecer.`,
  },
  {
    id: '4', slug: 'big-band-nuevas',
    category: 'Música', icon: '♩', date: '2025-04-15',
    author: 'Equipo Editorial', readTime: 4,
    title: 'La big band no ha muerto: nuevas orquestas',
    excerpt: 'Una nueva generación rescata el sonido de los 40 con energía fresca.',
    content: `Contra todo pronóstico, el formato big band goza de una salud envidiable en 2025. Lejos de ser un museo sonoro, una nueva generación de músicos está reinventando el sonido de las grandes orquestas de los años 30 y 40 con una energía y frescura que las pistas de baile agradecen enormemente.

The Cannonball Orchestra, de Suecia, es quizás el ejemplo más brillante de esta renovación. Con más de quince músicos en escena, sus actuaciones combinan el rigor histórico con una potencia sonora contemporánea que hace imposible quedarse quieto.

En Estados Unidos, Jonathan Stout & His Campus Five llevan el sonido de los años 40 a festivales de todo el mundo con una fidelidad que supera muchas grabaciones originales. Su pianista y arreglista ha creado una referencia absoluta en el estudio del jazz de baile.

El fenómeno no es solo europeo y americano: en Japón, Brasil y Argentina han surgido orquestas que combinan la tradición del swing con elementos musicales locales, creando híbridos fascinantes que expanden el vocabulario sonoro del género.

El secreto de este revival es simple: el swing es, ante todo, música para bailar. Y mientras haya pistas de baile llenas, habrá músicos dispuestos a tocar para ellas.`,
  },
  {
    id: '5', slug: 'skye-humphries',
    category: 'Entrevista', icon: '♫', date: '2025-04-08',
    author: 'Redacción Swing Festivals', readTime: 7,
    title: 'Skye Humphries: bailar con alma',
    excerpt: 'El campeón mundial habla de improvisación y por qué el swing no pasa de moda.',
    content: `Skye Humphries es uno de esos bailarines que hace que todo parezca sencillo. Múltiple campeón mundial de Lindy Hop, ha enseñado en más de cincuenta países y es considerado uno de los grandes embajadores del swing contemporáneo. Le encontramos en Madrid, entre clases y sociales.

**¿Cuándo supiste que el swing era tu camino?**

Fue en una actuación de Frankie Manning que vi cuando era adolescente. Algo en esa alegría, en esa música, me llegó muy hondo. No era solo técnica, era generosidad. El swing te obliga a compartir.

**El swing lleva décadas resurgiendo. ¿Por qué no pasa de moda?**

Porque es honesto. No te puedes esconder en el swing. Tienes que escuchar a tu pareja, escuchar la música, estar presente. En un mundo que va muy rápido y muy para adentro, el swing te saca de ti mismo. Eso es irremplazable.

**¿Qué consejo darías a alguien que empieza?**

Que vaya a las sociales antes que a las clases. Que vea a la gente bailar. Que sienta la música. Las clases sin esa base emocional son como aprender gramática sin haber escuchado nunca el idioma.

**¿Y a uno que lleva años bailando?**

Que escuche más. Siempre hay más que escuchar. En la música, en tu pareja, en tu propio cuerpo. El swing es un idioma que se aprende toda la vida.`,
  },
  {
    id: '6', slug: 'mapa-swing-madrid',
    category: 'Escena', icon: '♬', date: '2025-04-01',
    author: 'Equipo Editorial', readTime: 5,
    title: 'Mapa swing de Madrid: dónde bailar',
    excerpt: 'Guía actualizada de locales, horarios y nivel de pista en la capital.',
    content: `Madrid tiene una de las escenas de swing más activas de Europa. Cada semana hay opciones para todos los niveles, desde principiantes que acaban de descubrir el Lindy Hop hasta bailarines avanzados buscando la improvisación más pura.

**Lunes — La Sala del Jazz, Malasaña**

La sesión más veterana de Madrid. Cada lunes, el Café Central acoge una sesión con DJ y sala dedicada al swing vintage. Nivel mixto, ambiente acogedor, entrada libre hasta las 23h.

**Miércoles — Swing en el Parque (mayo-septiembre)**

En temporada de buen tiempo, la explanada del Retiro se convierte en pista de baile improvisada. Completamente gratuito, todos los niveles, energía incomparable.

**Viernes — Social del Club Swing Madrid**

La gran social semanal de la escena madrileña. Clases previas de 20:00 a 21:30 para todos los niveles y social libre hasta la madrugada. El lugar donde la escena se encuentra.

**Sábado — Palacio del Jazz**

El espacio de referencia para las grandes noches de swing con banda en directo. Programa variable, consultar agenda mensual en su web.

**Domingo — Matinée de Blues**

Para quienes prefieren un ritmo más pausado, los domingos por la tarde el Café del Congreso acoge sesiones de Blues y Slow Drag en un ambiente íntimo e irresistible.`,
  },
];
