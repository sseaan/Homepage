/**
 * 项目列表与预览图。
 * 预览来源：Nexthrum 仓库 docs/images、Voxi 本机设置窗口、powguard 管理面板登录页、
 * 煎蛋 RSS 线上订阅页。更新时替换 src/assets/projects/*.png：
 * 统一保持 4:3，卡片里不做二次裁切。
 */
import type { ImageMetadata } from 'astro';
import nexthrumPreview from '../assets/projects/nexthrum.png';
import voxiPreview from '../assets/projects/voxi.png';
import powguardPreview from '../assets/projects/powguard.png';
import jandanPreview from '../assets/projects/jandan-rss.png';

export type ProjectAccent = 'warm' | 'blue' | 'green' | 'violet' | 'red';

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  /** 一行状态，例如「持续开发」「v1.1.0」 */
  status: string;
  /** 卡片上的一句话说明 */
  tagline: string;
  tech: string[];
  /** 点缀色，对应 themes.css 的 --accent-* */
  accent: ProjectAccent;
  /** 卡片顶部的小字：网页显示域名，应用显示平台 */
  meta: string;
  /** 点击预览图与标题去的地方 */
  primaryUrl: string;
  links: ProjectLink[];
  preview: ImageMetadata;
  previewAlt: string;
}

export const projects: Project[] = [
  {
    slug: 'nexthrum',
    name: 'Nexthrum',
    status: 'v2.0.1',
    tagline: '跨平台 Gotify 桌面客户端，Rust 内核 + 双端原生外壳。',
    tech: ['Rust', 'Tauri', 'React', 'SwiftUI'],
    accent: 'blue',
    meta: 'Windows · macOS',
    primaryUrl: 'https://github.com/sseaan/Nexthrum',
    links: [
      { label: '源码', href: 'https://github.com/sseaan/Nexthrum' },
      { label: '下载', href: 'https://github.com/sseaan/Nexthrum/releases' },
    ],
    preview: nexthrumPreview,
    previewAlt: 'Nexthrum macOS 客户端的消息界面',
  },
  {
    slug: 'voxi',
    name: 'Voxi',
    status: 'v1.1.0',
    tagline: '菜单栏语音输入：按快捷键说话，结果直接写进当前输入框。',
    tech: ['Swift', 'SwiftUI', 'macOS'],
    accent: 'violet',
    meta: 'macOS',
    primaryUrl: 'https://github.com/sseaan/Voxi',
    links: [
      { label: '源码', href: 'https://github.com/sseaan/Voxi' },
      { label: '下载', href: 'https://github.com/sseaan/Voxi/releases' },
    ],
    preview: voxiPreview,
    previewAlt: 'Voxi 设置窗口里的模型来源与优先级列表',
  },
  {
    slug: 'powguard',
    name: 'powguard',
    status: 'Beta',
    tagline: '自托管的 Cap 工作量证明验证服务端，单二进制 + SQLite。',
    tech: ['Go', 'SQLite', 'Cap.js'],
    accent: 'green',
    meta: 'Self-Hosted',
    primaryUrl: 'https://cap.mvr.cc/',
    links: [
      { label: '源码', href: 'https://github.com/sseaan/powguard' },
      { label: '演示', href: 'https://cap.mvr.cc/' },
    ],
    preview: powguardPreview,
    previewAlt: 'powguard 管理面板的登录页',
  },
  {
    slug: 'jandan-rss',
    name: '煎蛋 RSS',
    status: '在线 · 每 12 小时更新',
    tagline: '把煎蛋首页重新拼成带全文的 RSS 2.0。',
    tech: ['Python', 'GitHub Actions', 'RSS'],
    accent: 'warm',
    meta: 'sseaan.github.io',
    primaryUrl: 'https://sseaan.github.io/jandan-rss/',
    links: [
      { label: '源码', href: 'https://github.com/sseaan/jandan-rss' },
      { label: '订阅', href: 'https://sseaan.github.io/jandan-rss/feed.xml' },
    ],
    preview: jandanPreview,
    previewAlt: '煎蛋 RSS 的订阅说明页',
  },
];
