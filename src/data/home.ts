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
  /** intro[1] 里要用荧光笔标出的一小段词，留空则不标 */
  highlight?: string;
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
  /** 标题点缀色，对应 themes.css 的 --accent-* */
  accent?: 'warm' | 'blue' | 'green' | 'violet' | 'red';
  pending?: boolean;
}

export const homeProfile: HomeProfile = {
  name: 'Sseaan',
  role: '计算机科学与技术 · 本科在读',
  intro: [
    '我是 Sean（Sseaan），来自广州。',
    '喜欢平面设计、折腾自托管，也喜欢收集文具和各种独立游戏。',
  ],
  highlight: '独立游戏',
};

export const experiences: ExperienceItem[] = [
  {
    period: '2026 — 至今',
    role: '计算机科学与技术 · 本科在读',
    org: '',
    summary: '在读本科，平时喜欢写点小工具。',
    tags: ['B.Eng.'],
  },
];

export const interests: Interest[] = [
  {
    title: '手帐',
    description: '~~每天~~偶尔写一点，留住当下的细节。',
    icon: 'notebook',
  },
  {
    title: '文具',
    description: '喜欢收集好看好用的本子、笔和印章。',
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
    name: '绝区零 / Zenless Zone Zero',
    platform: 'PC / 移动端',
    note: '战斗，爽！',
    icon: 'gamepad',
    accent: 'warm',
  },
  {
    name: '胡闹厨房 / Overcooked 1&2&All you can eat',
    platform: 'PC / 主机',
    note: '喜欢和朋友一起玩，飞盘困难户',
    icon: 'pan',
  },
  {
    name: '杯杯倒满 / Feed the Cups',
    platform: 'PC',
    note: 'MBA 上最好的烹饪游戏（（',
    icon: 'cups',
  },
];

export const homeSections = [
  { id: 'intro', label: '简介' },
  { id: 'writing', label: '最近', accent: 'warm' },
  { id: 'experience', label: '经历', accent: 'green' },
  { id: 'interests', label: '兴趣', accent: 'violet' },
  { id: 'games', label: '游戏', accent: 'red' },
] as const;
