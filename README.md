# Astro Starter Kit
```sh
bun create astro@latest my-new-project -- --template davidde/astro-starter
```

## Installed packages
```sh
"dependencies": {
    "@astrojs/mdx": "^8.1.2",
    "@astrojs/sitemap": "^3.7.4", # Auto-generates sitemap-index.xml for SEO
    "astro": "^7.4.2",
    "sharp": "^0.35.5" # Fast, native C++ image processing for Astro's <Image/> component
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3", # TailwindCSS!
    "@types/bun": "^1.4.4" # Typescript!
  }
```

### Possible additions/removals
```sh
# Install when building a blog/content collection with an RSS feed:
bun add @astrojs/rss
# Remove when not using MDX:
# (Also remove in `astro.config.mjs` integrations field)
bun remove @astrojs/mdx
```

## Project Structure
Inside of your Astro project, you'll see the following folders and files:
```text
/
├── public/
├── src/
│   └── assets/
│   └── components/
│   └── content/
│   └── layout/
│   └── pages/
│       └── index.astro
│   └── styles/
└── package.json
```

* Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.
* There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.
* Astro layouts, which are reusable templates that repeat across several pages, go in `src/layouts/`.
* User content goes in `src/content/` as markdown files, and will be generated into complete HTML webpages by Astro, using the pages in `src/pages/`, which themselves use the layout templates in `src/layouts/`.
* Any static assets, like favicon images, can be placed in the `public/` directory, while assets that should be optimized (fonts, images, etc.) can be placed in `src/assets/`.

## Bun Commands
All commands are run from the root of the project, from a terminal:
Use the `--bun` flag (`bun --bun dev`, etc.) to use the Bun runtime itself (much faster than the default Node.js runtime) for all binaries and subprocesses (like Astro, Vite or Next.js) started by that command.

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`                 | Starts local dev server at `localhost:4321`      |
| `bun build`               | Build your production site to `./dist/`          |
| `bun preview`             | Preview your build locally, before deploying     |
| `bun astro ...`           | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help`     | Get help using the Astro CLI                     |

Check out the [Astro documentation](https://docs.astro.build) or jump into the [Astro Discord server](https://astro.build/chat) for more.
