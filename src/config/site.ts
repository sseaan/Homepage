import type { IconName } from '../components/icons/paths';

/**
 * 站点级配置：站点信息、导航、社交链接、页脚、Ech0、评论。
 *
 * TODO(content): 以下带 TODO 的字段需要站点维护者确认真实值；
 * 值为 null / 空数组时代码不会渲染对应内容（不会输出占位假信息）。
 */

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface SocialLink {
  label: string;
  /** 平台主页；填 null 时整条链接不渲染（页脚与 About 都按此过滤） */
  href: string | null;
  icon: IconName;
  /** 展示用的账号名或说明，可选 */
  handle?: string;
}

/** 可用的社交平台清单：没填链接的平台不会出现在页面上 */
export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/sseaan',
    icon: 'github',
    handle: '@sseaan',
  },
  {
    label: 'Email',
    href: 'mailto:i@ssean.cn',
    icon: 'mail',
    handle: 'i@ssean.cn',
  },
  { label: 'X', href: null, icon: 'x' },
  { label: 'Telegram', href: null, icon: 'telegram' },
  {
    label: 'Bilibili',
    href: 'https://space.bilibili.com/503207957',
    icon: 'bilibili',
    handle: '503207957',
  },
  { label: 'Instagram', href: null, icon: 'instagram' },
  { label: 'YouTube', href: null, icon: 'youtube' },
  { label: 'LinkedIn', href: null, icon: 'linkedin' },
  {
    label: 'Ech0',
    href: 'https://echo.ssean.cn',
    icon: 'draft',
    handle: 'echo.ssean.cn',
  },
];

/** 只保留已填写链接的平台 */
export const activeSocial = socialLinks.filter(
  (link): link is SocialLink & { href: string } =>
    typeof link.href === 'string' && link.href.length > 0,
);

export interface FilingRecord {
  /** 备案号，例如「XICP备00000000号」 */
  number: string;
  /** 官方查询链接 */
  href: string;
}

export const siteConfig = {
  /** 正式域名确定后同步修改 astro.config.mjs 的 site 或设置 SITE_URL 环境变量 */
  url: 'https://ssean.cn',
  name: 'Sseaan',
  title: 'Sseaan',
  tagline: '山河见证长久，片刻亦能生辉。',
  description: 'Sean（Sseaan）的个人主页：项目、文章、Ech0 动态与生活记录。',
  locale: 'zh-CN',

  author: {
    name: 'Sean',
    email: 'i@ssean.cn' as string | null,
    avatar: '/images/avatar.png' as string | null,
    avatarAlt: 'Sean 的头像',
  },

  nav: [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Blog', href: '/blog', icon: 'notebook' },
    { label: 'Ech0', href: '/ech0', icon: 'draft' },
    { label: 'About', href: '/about', icon: 'user' },
  ] satisfies NavItem[],

  /** 已填写链接的社交平台（见 socialLinks） */
  social: activeSocial,

  blog: {
    title: 'Blog',
    description: '一个分享世界的角落。',
    /** 列表页每页文章数，0 表示不翻页 */
    postsPerPage: 0,
  },

  footer: {
    copyrightHolder: 'Sean',
    startYear: 2025,
    /** TODO(content): 备案完成后再填写，未填写则不渲染 */
    icp: {
      number: '粤ICP备2026026245号',
      href: 'https://beian.miit.gov.cn/',
    } as FilingRecord | null,
    police: null as FilingRecord | null,
    /** TODO(content): 赞助入口（链接或说明页），null 时不渲染 */
    sponsor: null as { label: string; href: string } | null,
    /** 页脚一行自定义说明，null 时不渲染 */
    note: null as string | null,
  },

  ech0: {
    /** Ech0 实例 Atom Feed；浏览器访问 /ech0 时实时读取 */
    feedUrl: 'https://echo.ssean.cn/rss',
    siteUrl: 'https://echo.ssean.cn',
    /** 最多展示的动态条数 */
    maxItems: 10,
    requestTimeoutMs: 10_000,
  },

  comments: {
    provider: 'twikoo' as const,
    /**
     * Twikoo 后端 envId（EdgeOne Makers + 自定义域名）。
     * 可用构建时环境变量 PUBLIC_TWIKOO_ENV_ID 覆盖（本地 mock / 预览环境）。
     */
    envId: 'https://tk.mvr.cc' as string | null,
    /** 固定客户端版本，不使用 latest；升级前需做一次样式回归 */
    version: '2.0.17',
    /**
     * 自托管的固定版本脚本（public/vendor/twikoo）。
     * 不使用第三方 CDN：目标区域访问 jsDelivr 可能很慢，影响评论首屏。
     */
    scriptUrl: '/vendor/twikoo/twikoo-2.0.17.all.min.js',
    /** 延迟初始化：评论区距离视口多近时开始加载 */
    preloadMargin: '400px',
    /** 客户端脚本/初始化超时（毫秒） */
    timeoutMs: 20_000,
  },
} as const;

export const rssUrl = '/rss.xml';

/** 当前年份，用于页脚版权区间 */
export const currentYear = new Date().getFullYear();
