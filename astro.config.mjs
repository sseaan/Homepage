// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { remarkMarkdownExtras } from './src/lib/remark-markdown-extras.mjs';

/**
 * 正式域名确定后替换（RSS、sitemap、canonical 都依赖绝对地址）。
 * 也可以用环境变量 SITE_URL 在部署平台上覆盖，无需改代码。
 */
const SITE_URL = process.env.SITE_URL ?? 'https://www.ssean.cn';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  // 保持 HTML 空白语义，避免 JSX 压缩规则吃掉行内元素之间的空格
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkMarkdownExtras],
    }),
    shikiConfig: {
      // 双主题：正文用 CSS 令牌切换，代码块跟随站点明暗
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
