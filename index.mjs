// index.mjs
//
// The theme's Astro integration. A site only needs:
//
//   import theme from 'astro-theme';
//   export default defineConfig({ site: '…', integrations: [theme()] });

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import themeOverrides from './integrations/theme-overrides.mjs';

// Resolve a path relative to this file, i.e. the theme's root folder:
const resolve = (p) => fileURLToPath(new URL(p, import.meta.url));

const PAGE_EXTENSIONS = ['.astro', '.md', '.mdx', '.html', '.ts', '.js'];

// Routes the theme provides. A route is only injected
// when the site doesn't have its own page for it in `src/pages/`:
const ROUTES = [
  { pattern: '/blog', entrypoint: './src/pages/blog.astro', page: 'blog' },
  // Individual blog posts and their subposts:
  { pattern: '/[...slug]', entrypoint: './src/pages/[...slug].astro', page: '[...slug]' },
];

// Whether the site has its own page `name`, as `name.<ext>` or `name/index.<ext>`:
function hasSitePage(pagesDir, name) {
  return PAGE_EXTENSIONS.some((ext) =>
    fs.existsSync(path.join(pagesDir, name + ext)) ||
    fs.existsSync(path.join(pagesDir, name, 'index' + ext))
  );
}

/**
 * @param {object} [options]
 * @param {string} [options.overridesDir='src/overrides'] Folder with the site's overrides of theme files.
 * @returns {import('astro').AstroIntegration}
 */
export default function astroTheme(options = {}) {
  return {
    name: 'astro-theme',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, injectRoute, logger }) => {
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

        const pagesDir = path.join(fileURLToPath(config.srcDir), 'pages');
        for (const route of ROUTES) {
          if (hasSitePage(pagesDir, route.page)) {
            logger.info(`using the site's own page for ${route.pattern}`);
            continue;
          }
          injectRoute({ pattern: route.pattern, entrypoint: resolve(route.entrypoint) });
        }
      },
    },
  };
}
