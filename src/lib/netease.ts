/**
 * 从网易云分享链接 / 纯数字 ID 中解析歌曲 ID。
 * 只做纯文本解析，不依赖浏览器 API，方便在客户端与测试中复用。
 */
export const parseNeteaseSongId = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return raw;

  const direct = raw.match(/(?:^|[?&#])id=(\d+)/)?.[1];
  if (direct) return direct;

  const pathId = raw.match(/\/song\/(\d+)/)?.[1];
  if (pathId) return pathId;

  try {
    const url = new URL(raw, 'https://music.163.com');
    const id = url.searchParams.get('id');
    if (id && /^\d+$/.test(id)) return id;

    const hashId = url.hash.match(/[?&]id=(\d+)/)?.[1];
    if (hashId) return hashId;
  } catch {
    // 不是合法 URL 时返回 null
  }

  return null;
};
