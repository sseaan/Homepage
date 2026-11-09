import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1, '标题不能为空'),
    // summary 是纯文本，用于列表卡片、文章顶部摘要和 RSS description
    summary: z.string().min(1, '摘要不能为空'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** 网易云歌曲链接或纯数字 ID；配合 PUBLIC_NETEASE_API_BASE 使用 */
    music: z.string().min(1).optional(),
  }),
});

export const collections = { blog };
