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
      'Rust 内核驱动的跨平台 Gotify 桌面客户端；Windows 使用 Tauri + React，macOS 使用 SwiftUI。',
    tech: ['Rust', 'Tauri', 'React', 'SwiftUI'],
    status: '持续开发',
    sourceUrl: 'https://github.com/sseaan/Nexthrum',
  },
  {
    name: 'powguard',
    summary:
      '自托管的 Cap 工作量证明验证码服务，兼容 @cap.js/widget，内置管理界面，单一 Go 二进制即可运行。',
    tech: ['Go', 'Cap.js', 'Self-hosted'],
    status: '开源',
    sourceUrl: 'https://github.com/sseaan/powguard',
  },
  {
    name: 'Voxi',
    summary: '一款原生 macOS 菜单栏语音输入工具。',
    tech: ['Swift', 'macOS'],
    status: 'macOS',
    sourceUrl: 'https://github.com/sseaan/Voxi',
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
  },
  {
    name: '胡闹厨房',
    platform: 'PC / 主机',
    note: '和朋友一起玩，飞盘|困难',
    icon: 'gamepad',
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
