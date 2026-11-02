// index.mjs
//
// The theme's Astro integration. A site only needs:
//
//   import theme from 'astro-theme';
//   export default defineConfig({ site: '…', integrations: [theme()] });
//
// The theme provides components, layouts and styles; all pages live in the site.

import { fileURLToPath } from 'node:url';
import { fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import themeOverrides from './integrations/theme-overrides.mjs';

// Resolve a path relative to this file, i.e. the theme's root folder:
const resolve = (p) => fileURLToPath(new URL(p, import.meta.url));

/**
 * @param {object} [options]
 * @param {string} [options.overridesDir='src/overrides'] Folder with the site's overrides of theme files.
 * @returns {import('astro').AstroIntegration}
 */
export default function astroTheme(options = {}) {
  return {
    name: 'astro-theme',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          integrations: [
            mdx(),
            sitemap(),
            themeOverrides({ overridesDir: options.overridesDir }),
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
                    src: [resolve('./src/assets/fonts/WorkSans-VariableFont-Normal.woff2')],
                    weight: '100 900',
                    style: 'normal',
                    display: 'swap',
                  },
                  {
                    src: [resolve('./src/assets/fonts/WorkSans-VariableFont-Italic.woff2')],
                    weight: '100 900',
                    style: 'italic',
                    display: 'swap',
                  },
                ],
              },
            },
          ],
        });
      },
    },
  };
}
