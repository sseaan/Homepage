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
  '我是 Sean，也写作 Sseaan',
  '我喜欢写点小工具：跨平台的 Gotify 客户端、语音输入小工具，以及这个用 Astro 搭起来的站点',
  '不上课的时候会写手帐、收集文具，不然就玩点独游、绝区零。正在学习算法（打A应该不够实力）',
];

export const aboutSections = [
  {
    title: '我正在做的事',
    paragraphs: [
      '维护 Nexthrum：一个跨平台的 Gotify 桌面客户端，Rust 内核驱动，两套前端框架分别支持 Windows 和 macOS',
      '同时在做 powguard 和 Voxi：前者是自托管的 Cap 验证服务，后者是 macOS 菜单栏语音输入工具。除此之外就是学习算法',
    ],
  },
  {
    title: '这个站点',
    paragraphs: [
      '站点用 Astro 静态生成，文章从旧的 Astro Blog 迁移过来；评论用 Twikoo，Ech0 动态在访问时直接读取公开 Feed。',
      '设计上保持极简风和手绘元素，意图是尽量让内容本身成为主角。',
    ],
  },
];

export const techGroups: TechGroup[] = [
  {
    title: '语言',
    icon: 'languages',
    items: [
      { name: 'Rust' },
      { name: 'Go' },
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
