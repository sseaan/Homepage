import type { IconName } from '../components/icons/paths';

/**
 * About 页可编辑内容。
 * 文案根据 www.ssean.cn、blog.ssean.cn 与 GitHub 仓库整理。
 */

export interface TechGroup {
  title: string;
  icon: IconName;
  items: { name: string; note?: string }[];
}

export interface LanguageSkill {
  name: string;
  /** 熟练度描述用文字，不只用图形或颜色 */
  level: string;
  note?: string;
}

export const aboutIntro = [
  '我是 Sean，也写作 Sseaan。19 岁，常驻广州。',
  '我喜欢把想法做成能用的东西：跨平台的 Gotify 客户端、自托管的小服务，以及这个用 Astro 搭起来的站点。',
  '不上课的时候会写手帐、收集文具，或者玩绝区零。正在学 C，也愿意参与开源协作。',
];

export const aboutSections = [
  {
    title: '我正在做的事',
    paragraphs: [
      '维护 Nexthrum：一个跨平台的 Gotify 桌面客户端，Rust 内核，Windows 用 Tauri + React，macOS 用 SwiftUI。',
      '另一个小项目是 jandan-rss，用 Python 和 GitHub Actions 定时抓取煎蛋首页并生成 RSS。除此之外在学 C，也在寻找合适的开源项目参与。',
    ],
  },
  {
    title: '这个站点',
    paragraphs: [
      '站点用 Astro 静态生成，文章从旧的 Astro Blog 迁移过来；评论用 Twikoo，Ech0 动态在访问时直接读取公开 Feed。',
      '设计上保持黑白、细线和小量手绘元素，尽量让内容本身成为主角。',
    ],
  },
];

export const techGroups: TechGroup[] = [
  {
    title: '语言',
    icon: 'languages',
    items: [
      { name: 'Rust' },
      { name: 'TypeScript' },
      { name: 'Python' },
      { name: 'C', note: '学习中' },
    ],
  },
  {
    title: '前端',
    icon: 'code',
    items: [{ name: 'Astro' }, { name: 'React' }, { name: 'CSS' }],
  },
  {
    title: '客户端',
    icon: 'monitor',
    items: [{ name: 'Tauri' }, { name: 'SwiftUI' }],
  },
  {
    title: '工具与服务',
    icon: 'terminal',
    items: [{ name: 'Git' }, { name: 'GitHub Actions' }, { name: 'Docker' }, { name: 'Linux' }],
  },
];

/** 自然语言：用通用图标 + 文字，不用国旗作为唯一标识 */
export const languageSkills: LanguageSkill[] = [
  { name: '中文', level: '母语' },
  { name: 'English', level: '技术阅读与写作' },
];

/** About 页头部的短信息 */
export const aboutFacts = [
  { label: '现在所在', value: '广州', icon: 'globe' as IconName },
  { label: '时区', value: 'UTC+8', icon: 'clock' as IconName },
  { label: '在读', value: '计算机科学与技术', icon: 'notebook' as IconName },
];
