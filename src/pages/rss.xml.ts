import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';
import { sortByDateDesc } from '../utils/blog';

export async function GET(context: APIContext) {
  const posts = sortByDateDesc(await getCollection('blog', ({ data }) => data.draft !== true));

  return rss({
    title: `${siteConfig.name} · Blog`,
    description: siteConfig.blog.description,
    site: context.site ?? siteConfig.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.summary,
      link: `/blog/${post.id}/`,
      categories: post.data.tags ?? [],
    })),
    customData: '<language>zh-CN</language>',
  });
}
