import { defineConfig } from 'astro/config';

export default defineConfig({
  // Cambia a 'server' si quieres SSR (útil para filtros server-side)
  output: 'static',

  // Si usas SSR descomenta esto y añade el adaptador que necesites:
  // adapter: node({ mode: 'standalone' }),
});
