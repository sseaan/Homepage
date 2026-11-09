import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { Ech0ParseError, normalizeUrl, parseEch0Feed, sanitizeEch0Html } from '../src/lib/ech0';

const fixture = (name: string) =>
  readFileSync(path.join(process.cwd(), 'tests/fixtures', name), 'utf8');
const FEED_URL = 'https://echo.ssean.cn/rss';

describe('parseEch0Feed', () => {
  it('排序、去重、跳过非法日期并按数量截断', () => {
    const feed = parseEch0Feed(fixture('ech0-valid.xml'), { feedUrl: FEED_URL, maxItems: 10 });

    expect(feed.title).toBe('Test Ech0');
    expect(feed.siteUrl).toBe('https://echo.ssean.cn/');
    expect(feed.total).toBe(6);
    expect(feed.skipped).toBe(1);
    expect(feed.items.map((item) => item.title)).toEqual(['New', 'Plain text', 'Middle', 'Old']);
    expect(new Set(feed.items.map((item) => item.id)).size).toBe(feed.items.length);
  });

  it('maxItems 限制返回数量', () => {
    const feed = parseEch0Feed(fixture('ech0-valid.xml'), { feedUrl: FEED_URL, maxItems: 2 });
    expect(feed.items.map((item) => item.title)).toEqual(['New', 'Plain text']);
  });

  it('把内部 http 链接与图片升级为 https', () => {
    const feed = parseEch0Feed(fixture('ech0-valid.xml'), { feedUrl: FEED_URL, maxItems: 10 });
    const newest = feed.items[0];

    expect(newest.url).toBe('https://echo.ssean.cn/echo/3');
    expect(newest.html).toContain('src="https://echo.ssean.cn/api/files/a.png"');
    expect(newest.html).toContain('referrerpolicy="no-referrer"');
    expect(newest.html).toContain('loading="lazy"');
    expect(newest.html).not.toContain('http://echo.ssean.cn');
    expect(feed.items.at(-1)?.html).toContain('ech0-tag');
  });

  it('纯文本 content 中的 HTML 会被当作文本', () => {
    const feed = parseEch0Feed(fixture('ech0-valid.xml'), { feedUrl: FEED_URL, maxItems: 10 });
    const plain = feed.items.find((item) => item.title === 'Plain text');
    expect(plain?.html).not.toContain('<b>');
    expect(plain?.html).toContain('&lt;b&gt;not bold&lt;/b&gt;');
  });

  it('空 Feed 返回空列表而不是报错', () => {
    const feed = parseEch0Feed(fixture('ech0-empty.xml'), { feedUrl: FEED_URL });
    expect(feed.items).toEqual([]);
    expect(feed.total).toBe(0);
  });

  it('无效 XML 抛出 Ech0ParseError', () => {
    expect(() => parseEch0Feed(fixture('ech0-invalid.xml'), { feedUrl: FEED_URL })).toThrow(
      Ech0ParseError,
    );
    expect(() => parseEch0Feed('<html></html>', { feedUrl: FEED_URL })).toThrow(Ech0ParseError);
    expect(() => parseEch0Feed('', { feedUrl: FEED_URL })).toThrow(Ech0ParseError);
  });
});

describe('sanitizeEch0Html', () => {
  const base = 'https://echo.ssean.cn/echo/evil';

  it('移除脚本、样式、iframe、事件处理器和危险协议', () => {
    const html = sanitizeEch0Html(fixture('ech0-malicious.xml'), base);
    const feed = parseEch0Feed(fixture('ech0-malicious.xml'), { feedUrl: FEED_URL });
    const content = feed.items[0]?.html ?? html;

    expect(content).not.toContain('<script');
    expect(content).not.toContain('<style');
    expect(content).not.toContain('<iframe');
    expect(content).not.toContain('onclick');
    expect(content).not.toContain('onerror');
    expect(content).not.toContain('javascript:');
    expect(content).not.toContain('style=');
    expect(content).toContain('hello');
    expect(content).toContain('ech0-tag');
  });

  it('内部链接升级 https，外链补 target/rel', () => {
    const feed = parseEch0Feed(fixture('ech0-malicious.xml'), { feedUrl: FEED_URL });
    const content = feed.items[0]?.html ?? '';

    expect(content).toContain('href="https://echo.ssean.cn/x"');
    expect(content).toContain('href="https://example.com/"');
    expect(content).toContain('rel="noopener noreferrer nofollow ugc"');
    expect(content).toContain('target="_blank"');
  });

  it('图片必须是 https：内部升级，外部 http 与 data URI 删除', () => {
    const feed = parseEch0Feed(fixture('ech0-malicious.xml'), { feedUrl: FEED_URL });
    const content = feed.items[0]?.html ?? '';

    expect(content).toContain('src="https://echo.ssean.cn/a.png"');
    expect(content).not.toContain('evil.example/b.png');
    expect(content).not.toContain('data:image');
  });

  it('相对链接按文章地址解析', () => {
    const html = sanitizeEch0Html('<p><a href="/echo/next">next</a></p>', base);
    expect(html).toContain('href="https://echo.ssean.cn/echo/next"');
  });

  it('非 http(s) 协议不保留 href', () => {
    const html = sanitizeEch0Html('<p><a href="mailto:x@example.com">mail</a></p>', base);
    expect(html).not.toContain('href=');
    expect(html).toContain('mail');
  });
});

describe('normalizeUrl', () => {
  it('只允许 http(s)，内部域名强制 https', () => {
    expect(normalizeUrl('http://echo.ssean.cn/echo/1', FEED_URL)?.href).toBe(
      'https://echo.ssean.cn/echo/1',
    );
    expect(normalizeUrl('https://example.com/a', FEED_URL)?.href).toBe('https://example.com/a');
    expect(normalizeUrl('javascript:alert(1)', FEED_URL)).toBeNull();
    expect(normalizeUrl('mailto:a@example.com', FEED_URL)).toBeNull();
    expect(normalizeUrl('', FEED_URL)).toBeNull();
  });
});
