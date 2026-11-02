import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';


// Zod schema to type-check the frontmatter of the `blog` collection.
// The site defines the collection in its own `src/content.config.ts`,
// and can call `.extend()` on the result to add its own fields:
export const blogSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string().default('David Deprost'),
  });
