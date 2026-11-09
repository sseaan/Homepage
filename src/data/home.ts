import type { IconName } from '../components/icons/paths';

/**
 * Home 页可编辑内容。
 * 个人信息来自 www.ssean.cn、blog.ssean.cn 与 GitHub 仓库。
 */

export interface HomeProfile {
  name: string;
  role: string;
  /** 一两段简短自我介绍，About 页承载更完整的版本 */
  intro: string[];
}

export interface Project {
  name: string;
  summary: string;
  tech: string[];
  status?: string;
  sourceUrl?: string;
  demoUrl?: string;
  pending?: boolean;
}

export interface ExperienceItem {
  period: string;
  role: string;
  org: string;
  summary: string;
  tags?: string[];
  pending?: boolean;
}

export interface Interest {
  title: string;
  description: string;
  icon: IconName;
  pending?: boolean;
}

export interface Game {
  name: string;
  platform: string;
  note: string;
  icon: IconName;
  /** 特殊视觉风格；zzz 为绝区零的橙色点缀，overcooked 为胡闹厨房的番茄红点缀 */
  accent?: 'zzz' | 'overcooked';
  pending?: boolean;
}

export const homeProfile: HomeProfile = {
  name: 'Sseaan',
  role: '计算机科学与技术 · 本科在读',
  intro: [
    '我是 Sean（Sseaan），19 岁，常驻广州。',
    '喜欢平面设计、自托管折腾，也喜欢写手帐、收集文具和玩绝区零。正在学 C，也愿意参与开源协作。',
  ],
};

export const projects: Project[] = [
  {
    name: 'Nexthrum',
    summary:
      '跨平台 Gotify 桌面客户端，Rust 内核驱动；Windows 用 Tauri + React，macOS 用 SwiftUI。',
    tech: ['Rust', 'Tauri', 'React', 'SwiftUI'],
    status: '开源',
    sourceUrl: 'https://github.com/sseaan/Nexthrum',
  },
  {
    name: 'jandan-rss',
    summary: '煎蛋网首页文章 RSS，用 GitHub Actions 定时抓取更新。',
    tech: ['Python', 'GitHub Actions', 'RSS'],
    status: '运行中',
    sourceUrl: 'https://github.com/sseaan/jandan-rss',
    demoUrl: 'https://sseaan.github.io/jandan-rss/feed.xml',
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: '2026 — 至今',
    role: '计算机科学与技术 · 本科在读',
    org: '',
    summary: '在读本科，平时做客户端、自托管和小工具。',
    tags: ['B.Eng.'],
  },
];

export const interests: Interest[] = [
  {
    title: '手帐',
    description: '每天写一点，留住当下的细节。',
    icon: 'notebook',
  },
  {
    title: '文具',
    description: '喜欢收集好看的本子和笔。',
    icon: 'pencil',
  },
  {
    title: '平面设计',
    description: '对排版、像素和视觉细节有兴趣。',
    icon: 'palette',
  },
  {
    title: '自托管',
    description: '折腾服务器、Docker 和各种小服务。',
    icon: 'server',
  },
];

export const games: Game[] = [
  {
    name: '绝区零',
    platform: 'PC / 移动端',
    note: '战斗，爽！',
    icon: 'gamepad',
    accent: 'zzz',
  },
  {
    name: '胡闹厨房',
    platform: 'PC / 主机',
    note: '和朋友一起玩，飞盘|困难',
    icon: 'gamepad',
    accent: 'overcooked',
  },
];

export const homeSections = [
  { id: 'intro', label: '简介' },
  { id: 'writing', label: '最近' },
  { id: 'projects', label: '项目' },
  { id: 'experience', label: '经历' },
  { id: 'interests', label: '兴趣' },
  { id: 'games', label: '游戏' },
] as const;
