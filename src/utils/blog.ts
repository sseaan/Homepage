import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const formatDate = (date: Date) => dateFormatter.format(date);

export const isoDate = (date: Date) => date.toISOString();

export const sortByDateDesc = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

/** 粗估阅读时长：中文按 400 字/分钟，西文按 220 词/分钟 */
export const readingMinutes = (body?: string) => {
  if (!body) return 1;
  const cjk = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (body.match(/[a-zA-Z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
};

/** 上一组 / 下一组文章用于文章底部导航（按时间倒序，最新的在前） */
export const withAdjacentPosts = (posts: BlogPost[]) => {
  const sorted = sortByDateDesc(posts);
  return sorted.map((post, index) => ({
    post,
    next: sorted[index - 1] ?? null,
    prev: sorted[index + 1] ?? null,
  }));
};
