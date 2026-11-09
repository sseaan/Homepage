/**
 * Ech0 Atom Feed 解析、清洗与请求。
 *
 * 安全边界：
 * - Feed 内容视为不可信 HTML，先经 DOMPurify 白名单清洗，再交给页面插入；
 * - 链接只允许 http(s)，指向 echo.ssean.cn 的内部地址统一升级为 https；
 * - 图片必须使用 https（内部 http 先升级，其余 http 图片直接丢弃）；
 * - 外链统一加 target/rel，图片加 lazy / no-referrer。
 *
 * 浏览器与测试（jsdom）都会用到 DOM API，因此本模块只在客户端脚本或测试中导入。
 */
import DOMPurify from 'dompurify';

export interface Ech0Item {
  id: string;
  title: string;
  /** 在 Ech0 上查看原文的地址（已规范化） */
  url: string;
  publishedAt: Date;
  /** 已清洗、可安全插入的 HTML */
  html: string;
}

export interface Ech0Feed {
  title: string;
  /** 站点地址（已规范化到 https） */
  siteUrl: string;
  items: Ech0Item[];
  /** Feed 中的原始条目数 */
  total: number;
  /** 因缺字段 / 日期非法被跳过的条目数 */
  skipped: number;
}

export interface ParseOptions {
  feedUrl: string;
  maxItems?: number;
}

export interface FetchOptions extends ParseOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class Ech0ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Ech0ParseError';
  }
}

export class Ech0FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Ech0FetchError';
  }
}

const INTERNAL_HOST = 'echo.ssean.cn';
const DEFAULT_MAX_ITEMS = 10;

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'img',
  'span',
  'hr',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title'];

const FORBID_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'svg',
  'math',
  'video',
  'audio',
  'source',
];

const FORBID_ATTR = ['style', 'class', 'id', 'srcset', 'sizes', 'onerror', 'onload', 'onclick'];

/** 取直接子元素（忽略命名空间前缀差异） */
function childElement(parent: Element, localName: string): Element | undefined {
  return Array.from(parent.children).find((child) => child.localName === localName);
}

function childText(parent: Element, localName: string): string {
  return childElement(parent, localName)?.textContent?.trim() ?? '';
}

/** 规范化 URL：只保留 http(s)，内部域名升级为 https */
export function normalizeUrl(raw: string, base: string): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.hostname === INTERNAL_HOST || url.hostname.endsWith(`.${INTERNAL_HOST}`)) {
      url.protocol = 'https:';
    }
    return url;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * 清洗 Feed 中的 HTML。
 * @param raw 原始 HTML（或纯文本）
 * @param base 用于解析相对地址的基准 URL
 */
export function sanitizeEch0Html(raw: string, base: string): string {
  if (!raw) return '';

  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS,
    FORBID_ATTR,
    KEEP_CONTENT: true,
  });

  const container = document.implementation.createHTMLDocument('').createElement('div');
  container.innerHTML = clean;

  // 链接：只保留 http(s)，内部域名升级 https，外链加安全属性
  container.querySelectorAll('a').forEach((anchor) => {
    const resolved = normalizeUrl(anchor.getAttribute('href') ?? '', base);
    if (!resolved) {
      anchor.removeAttribute('href');
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      return;
    }
    anchor.setAttribute('href', resolved.href);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer nofollow ugc');
  });

  // 图片：必须 https；内部 http 先升级，其他 http 图片移除
  container.querySelectorAll('img').forEach((image) => {
    const resolved = normalizeUrl(image.getAttribute('src') ?? '', base);
    if (!resolved || resolved.protocol !== 'https:') {
      image.remove();
      return;
    }
    image.setAttribute('src', resolved.href);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    image.setAttribute('referrerpolicy', 'no-referrer');
    if (!image.hasAttribute('alt')) image.setAttribute('alt', '');
  });

  // Ech0 用 <span class="tag">#标签</span> 表示话题；class 被清洗掉后按文本补回站点样式
  container.querySelectorAll('span').forEach((span) => {
    if (span.textContent?.trim().startsWith('#')) span.classList.add('ech0-tag');
  });

  return container.innerHTML;
}

/** 解析 Atom 文本；不发起任何网络请求 */
export function parseEch0Feed(xml: string, options: ParseOptions): Ech0Feed {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  const root = doc.documentElement;

  if (parserError || !root || root.localName !== 'feed') {
    throw new Ech0ParseError('Feed 不是有效的 Atom 文档');
  }

  const feedUrl = options.feedUrl;
  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;

  const feedLink = Array.from(root.children).find(
    (child) =>
      child.localName === 'link' && (child.getAttribute('rel') || 'alternate') === 'alternate',
  );
  const siteUrl = normalizeUrl(feedLink?.getAttribute('href') ?? '', feedUrl)?.href ?? feedUrl;
  const title = childText(root, 'title') || 'Ech0';

  const entries = Array.from(root.children).filter((child) => child.localName === 'entry');
  const items: Ech0Item[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const entry of entries) {
    const id = childText(entry, 'id');
    const entryLink = Array.from(entry.children).find(
      (child) =>
        child.localName === 'link' && (child.getAttribute('rel') || 'alternate') === 'alternate',
    );
    const url = normalizeUrl(entryLink?.getAttribute('href') ?? '', siteUrl)?.href ?? siteUrl;
    const dateText = childText(entry, 'updated') || childText(entry, 'published');
    const publishedAt = new Date(dateText);

    if (!dateText || Number.isNaN(publishedAt.valueOf())) {
      skipped += 1;
      continue;
    }

    const key = id || url;
    if (seen.has(key)) continue;
    seen.add(key);

    const content = childElement(entry, 'content') ?? childElement(entry, 'summary');
    const type = content?.getAttribute('type') ?? 'text';
    const raw = content?.textContent ?? '';
    const rawHtml = type === 'html' || type === 'xhtml' ? raw : `<p>${escapeHtml(raw)}</p>`;

    items.push({
      id: key,
      title: childText(entry, 'title'),
      url,
      publishedAt,
      html: sanitizeEch0Html(rawHtml, url),
    });
  }

  items.sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());

  return {
    title,
    siteUrl,
    items: items.slice(0, Math.max(0, maxItems)),
    total: entries.length,
    skipped,
  };
}

/**
 * 请求并解析 Ech0 Feed。
 * - 不携带 Cookie / 站点登录态（credentials: 'omit'）
 * - 有明确超时，避免页面无限等待
 */
export async function fetchEch0Feed(options: FetchOptions): Promise<Ech0Feed> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetch(options.feedUrl, {
      credentials: 'omit',
      mode: 'cors',
      cache: 'no-store',
      headers: { Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Ech0FetchError(`Ech0 返回 HTTP ${response.status}`);
    }

    const xml = await response.text();
    return parseEch0Feed(xml, { feedUrl: options.feedUrl, maxItems: options.maxItems });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Ech0FetchError('读取 Feed 超时，请稍后重试。');
    }
    if (error instanceof Ech0FetchError || error instanceof Ech0ParseError) throw error;
    throw new Ech0FetchError('无法连接 Ech0，可能是网络问题或跨域限制。');
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
