// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import themeOverrides from './integrations/theme-overrides.mjs';


// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    mdx(),
    sitemap(),
    themeOverrides(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Work Sans',
      cssVariable: '--font-work-sans',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/WorkSans-VariableFont-Normal.woff2'],
            weight: '100 900',
            style: 'normal',
            display: 'swap',
          },
          {
            src: ['./src/assets/fonts/WorkSans-VariableFont-Italic.woff2'],
            weight: '100 900',
            style: 'italic',
            display: 'swap',
          },
        ],
      },
    },
  ],
});
