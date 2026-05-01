/**
 * src/lib/directus.ts
 *
 * Cliente Directus con fallback automático a datos mock.
 * Para conectar con Directus real:
 *   1. Rellena .env con DIRECTUS_URL y DIRECTUS_TOKEN
 *   2. Crea las colecciones "events" y "posts" en Directus
 *      con los campos definidos en src/types/index.ts
 *   3. Pon USE_MOCK_DATA=false en .env
 */

import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import type { DirectusSchema, Event, Post } from '../types/index.js';

// ── Cliente ──────────────────────────────────────────────────────
const DIRECTUS_URL   = import.meta.env.DIRECTUS_URL   as string | undefined;
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_TOKEN as string | undefined;
const USE_MOCK       = import.meta.env.USE_MOCK_DATA === 'true'
                       || !DIRECTUS_URL
                       || !DIRECTUS_TOKEN;

/*
 * DIRECTUS CLIENT (descomenta cuando tengas instancia real)
 *
 * const client = createDirectus<DirectusSchema>(DIRECTUS_URL!)
 *   .with(staticToken(DIRECTUS_TOKEN!))
 *   .with(rest());
 */

// ── Fetchers ─────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  if (USE_MOCK) {
    console.info('[directus] Usando datos mock para events');
    return MOCK_EVENTS;
  }

  /*
   * VERSIÓN REAL — descomenta cuando Directus esté configurado:
   *
   * return await client.request(
   *   readItems('events', {
   *     sort: ['date'],
   *     filter: { date: { _gte: '$NOW' } },   // solo eventos futuros
   *     limit: 200,
   *   })
   * );
   */

  return MOCK_EVENTS; // fallback de seguridad
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    console.info('[directus] Usando datos mock para posts');
    return MOCK_POSTS;
  }

  /*
   * VERSIÓN REAL:
   *
   * return await client.request(
   *   readItems('posts', {
   *     sort: ['-date'],
   *     limit: 6,
   *     fields: ['id', 'title', 'category', 'excerpt', 'date', 'icon', 'slug'],
   *   })
   * );
   */

  return MOCK_POSTS; // fallback de seguridad
}

/**
 * Construye la URL pública de un asset de Directus.
 * Devuelve undefined si no hay URL o id de asset.
 */
export function assetUrl(assetId: string | undefined): string | undefined {
  if (!assetId || !DIRECTUS_URL) return undefined;
  return `${DIRECTUS_URL}/assets/${assetId}`;
}

// ════════════════════════════════════════════════════════════════
// MOCK DATA — datos de ejemplo mientras no hay CMS real
// ════════════════════════════════════════════════════════════════

const MOCK_EVENTS: Event[] = [
  { id:'1',  date:'2025-05-03', name:'Madrid Swing Festival',       city:'Madrid',    country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'festival' },
  { id:'2',  date:'2025-05-08', name:'Sitges Balboa Beach',          city:'Sitges',    country:'España',         continent:'Europa',            style:'Balboa',       type:'festival' },
  { id:'3',  date:'2025-05-10', name:'Lindy Hop Sevilla',            city:'Sevilla',   country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'social'   },
  { id:'4',  date:'2025-05-15', name:'Paris Bal Swing',              city:'París',     country:'Francia',        continent:'Europa',            style:'Blues',        type:'social'   },
  { id:'5',  date:'2025-05-17', name:'Workshop con Skye & Frida',    city:'Barcelona', country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'workshop' },
  { id:'6',  date:'2025-05-22', name:'Berlin Solo Jazz Weekend',     city:'Berlín',    country:'Alemania',       continent:'Europa',            style:'Solo Jazz',    type:'workshop' },
  { id:'7',  date:'2025-05-24', name:'Campeonato Nacional Swing',    city:'Valencia',  country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'competicion' },
  { id:'8',  date:'2025-05-30', name:'London Swing Exchange',        city:'Londres',   country:'United Kingdom', continent:'Europa',            style:'Lindy Hop',    type:'exchange' },
  { id:'9',  date:'2025-06-05', name:'Warsaw Balboa Festival',       city:'Varsovia',  country:'Poland',         continent:'Europa',            style:'Balboa',       type:'festival' },
  { id:'10', date:'2025-06-07', name:'Verano Swing Bilbao',          city:'Bilbao',    country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'festival' },
  { id:'11', date:'2025-06-12', name:'NYC Lindy Exchange',           city:'Nueva York',country:'United States',  continent:'América del Norte', style:'Lindy Hop',    type:'exchange' },
  { id:'12', date:'2025-06-14', name:'Paris Swing Nights',           city:'París',     country:'Francia',        continent:'Europa',            style:'Charleston',   type:'social'   },
  { id:'13', date:'2025-06-19', name:'Rome Boogie Woogie Festival',  city:'Roma',      country:'Italia',         continent:'Europa',            style:'Boogie Woogie',type:'festival' },
  { id:'14', date:'2025-06-21', name:'Blues & Swing al Aire',        city:'Madrid',    country:'España',         continent:'Europa',            style:'Blues',        type:'social'   },
  { id:'15', date:'2025-06-28', name:'Herräng Dance Camp — Week 1',  city:'Herräng',   country:'Sweden',         continent:'Europa',            style:'Lindy Hop',    type:'festival' },
  { id:'16', date:'2025-07-05', name:'Taller Intensivo Balboa BCN',  city:'Barcelona', country:'España',         continent:'Europa',            style:'Balboa',       type:'workshop' },
  { id:'17', date:'2025-07-10', name:'San Francisco Lindy Fest',     city:'San Fran.', country:'United States',  continent:'América del Norte', style:'Lindy Hop',    type:'festival' },
  { id:'18', date:'2025-07-12', name:'Costa Swing Festival',         city:'Málaga',    country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'festival' },
  { id:'19', date:'2025-07-24', name:'Amsterdam Blues Exchange',     city:'Ámsterdam', country:'Netherlands',    continent:'Europa',            style:'Blues',        type:'exchange' },
  { id:'20', date:'2025-08-02', name:'Edinburgh Swing Festival',     city:'Edimburgo', country:'United Kingdom', continent:'Europa',            style:'Lindy Hop',    type:'festival' },
  { id:'21', date:'2025-08-08', name:'Valencia Swing Summer',        city:'Valencia',  country:'España',         continent:'Europa',            style:'Lindy Hop',    type:'social'   },
  { id:'22', date:'2025-08-21', name:'Tokyo Lindy Festival',         city:'Tokio',     country:'Japan',          continent:'Asia',              style:'Lindy Hop',    type:'festival' },
];

const MOCK_POSTS: Post[] = [
  { id:'1', slug:'origen-lindy-hop',       category:'Historia',   title:'El origen del Lindy Hop: Harlem, 1920',     excerpt:'Cómo nació el baile más influyente del siglo XX en las pistas del Savoy Ballroom.', icon:'♪', date:'2025-05-02' },
  { id:'2', slug:'conexion-swing',         category:'Técnica',    title:'Conexión en el swing: más allá del agarre',  excerpt:'El swing es un diálogo físico. Aprende a escuchar a tu pareja a través del torso.',  icon:'🎷',date:'2025-04-28' },
  { id:'3', slug:'festivales-europa-2025', category:'Festivales', title:'Los 5 mejores festivales europeos de 2025',  excerpt:'Desde Herräng hasta Swingroove: las citas imprescindibles para este verano.',         icon:'🎺',date:'2025-04-20' },
  { id:'4', slug:'big-band-nuevas',        category:'Música',     title:'La big band no ha muerto: nuevas orquestas', excerpt:'Una nueva generación rescata el sonido de los 40 con energía fresca.',               icon:'♩', date:'2025-04-15' },
  { id:'5', slug:'skye-humphries',         category:'Entrevista', title:'Skye Humphries: bailar con alma',             excerpt:'El campeón mundial habla de improvisación y por qué el swing no pasa de moda.',     icon:'♫', date:'2025-04-08' },
  { id:'6', slug:'mapa-swing-madrid',      category:'Escena',     title:'Mapa swing de Madrid: dónde bailar',         excerpt:'Guía actualizada de locales, horarios y nivel de pista en la capital.',              icon:'♬', date:'2025-04-01' },
];
