import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stepglow.app',
  vite: {
    plugins: [tailwindcss()],
  },
});
