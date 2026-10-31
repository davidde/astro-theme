// integrations/theme-overrides.mjs
//
// Per-file theme overrides ("shadowing") for Astro.
//
// Any import of `@theme/<path>` resolves to `<overridesDir>/<path>` if that
// file exists, otherwise to the theme's own `src/<path>`:
//
//   @theme/components/Header.astro
//     -> src/overrides/components/Header.astro   (if present in the site)
//     -> <theme>/src/components/Header.astro     (fallback)
//
// `@theme-original/<path>` always resolves to the theme's own file, so an
// override can import and wrap the component it replaces.
//
// Only imports written as `@theme/...` can be overridden, so the theme should
// import all its own files that way (relative imports bypass the overrides).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTENSIONS = ['', '.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.md', '.mdx'];

const toPosix = (p) => p.split(path.sep).join('/');

// Whether `file` lies inside `dir` (case-insensitive drive letters on Windows):
const isInside = (dir, file) => {
  const rel = path.relative(dir, file);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, base);
    return [toPosix(path.relative(base, full))];
  });
}

const isFile = (file) => fs.existsSync(file) && fs.statSync(file).isFile();

// Finds `spec` in `baseDir`, trying the known extensions and,
// for folder imports, the folder's `index` file:
function findFile(baseDir, spec) {
  for (const ext of EXTENSIONS) {
    const candidate = path.join(baseDir, spec + ext);
    if (isFile(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS.slice(1)) {
    const candidate = path.join(baseDir, spec, 'index' + ext);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

/**
 * @param {object}  [options]
 * @param {string}  [options.overridesDir='src/overrides'] Override folder, relative to the project root.
 * @param {string}  [options.alias='@theme']               Import prefix the theme uses.
 * @returns {import('astro').AstroIntegration}
 */
export default function themeOverrides(options = {}) {
  const {
    overridesDir = 'src/overrides',
    alias = '@theme',
  } = options;
  const prefix = `${alias}/`;
  const originalPrefix = `${alias}-original/`;
  // The theme's `src/` folder, located relative to this file (`<theme>/integrations/`),
  // so it works both inside the theme repo and in a site that includes the theme:
  const theme = fileURLToPath(new URL('../src/', import.meta.url));

  return {
    name: 'theme-overrides',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, logger }) => {
        const overrides = path.resolve(fileURLToPath(config.root), overridesDir);

        // Report active overrides, and warn about ones that match no theme file
        // (usually a typo in the file name or folder):
        const themeFiles = new Set(listFiles(theme));
        for (const file of listFiles(overrides)) {
          if (themeFiles.has(file)) logger.info(`override active: ${file}`);
          else logger.warn(`override has no matching theme file (typo?): ${file}`);
        }

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'theme-overrides:resolve',
                enforce: 'pre',

                async resolveId(id, importer, resolveOptions) {
                  const isOriginal = id.startsWith(originalPrefix);
                  if (!isOriginal && !id.startsWith(prefix)) return null;

                  // Keep query strings such as ?raw or ?url intact:
                  const rest = id.slice(isOriginal ? originalPrefix.length : prefix.length);
                  const [spec, ...queryParts] = rest.split('?');
                  const query = queryParts.length ? `?${queryParts.join('?')}` : '';

                  // Don't let `@theme/../...` escape the theme and override folders:
                  if (spec.split(/[\\/]/).includes('..')) {
                    this.error(`[theme-overrides] "${id}" must not contain ".."`);
                  }

                  const file = (isOriginal ? null : findFile(overrides, spec)) ?? findFile(theme, spec);
                  if (!file) {
                    this.error(`[theme-overrides] "${id}" not found in overrides or theme`);
                  }

                  // Hand the concrete path back to Vite so its normal
                  // resolution (and other plugins) still apply:
                  return this.resolve(toPosix(file) + query, importer, {
                    ...resolveOptions,
                    skipSelf: true,
                  });
                },

                // Adding or deleting an override changes which file an import
                // points to, so drop all cached modules and reload the page to
                // re-resolve everything. Editing an existing override hot-reloads as usual.
                configureServer(server) {
                  server.watcher.add(overrides);
                  const onChange = (file) => {
                    // (Ignore editor temp/swap files and other non-importable files.)
                    if (!isInside(overrides, path.resolve(file))) return;
                    if (!EXTENSIONS.includes(path.extname(file))) return;
                    logger.info(`override added/removed, reloading: ${toPosix(path.relative(overrides, file))}`);
                    for (const env of Object.values(server.environments ?? {})) {
                      env.moduleGraph.invalidateAll();
                    }
                    server.ws.send({ type: 'full-reload' });
                  };
                  server.watcher.on('add', onChange);
                  server.watcher.on('unlink', onChange);
                },
              },
            ],
          },
        });
      },
    },
  };
}
