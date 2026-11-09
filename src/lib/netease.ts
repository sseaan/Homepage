/**
 * 网易云歌曲 / 歌单链接解析与展示辅助。
 * 只做纯文本解析，不依赖浏览器 API，方便在客户端与测试中复用。
 */

export type NeteaseSourceType = 'song' | 'playlist';

export interface NeteaseSource {
  type: NeteaseSourceType;
  id: string;
}

/** 歌单链接常见的路径/查询标记（song 链接不会命中） */
const playlistHint = /(?:^|\/)(?:playlist|toplist)\b|(?:^|[?&#])playlist=/i;

/**
 * 从网易云分享链接 / 纯数字 ID 中解析歌曲 ID。
 * 只用于明确的单曲场景；歌单请使用 parseNeteasePlaylistId。
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

/**
 * 从网易云歌单链接中解析歌单 ID。
 * 支持 /playlist?id=、/playlist/123、#/playlist?id= 与 top榜链接；纯数字按歌单处理。
 */
export const parseNeteasePlaylistId = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return raw;

  const pathId = raw.match(/\/playlist\/(\d+)/)?.[1];
  if (pathId) return pathId;

  if (!playlistHint.test(raw)) return null;

  const direct = raw.match(/(?:^|[?&#])id=(\d+)/)?.[1];
  if (direct) return direct;

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

/**
 * 解析 frontmatter / 配置里的音乐来源。
 * - 纯数字默认是单曲，保持旧文章兼容；
 * - 歌单用歌单链接，或 `playlist:18577886483` 前缀；
 * - 单曲也可用 `song:347230` 显式声明。
 */
export const parseNeteaseMusicSource = (value: string): NeteaseSource | null => {
  const raw = value.trim();
  if (!raw) return null;

  const prefixed = raw.match(/^(song|playlist)\s*[:：]\s*(.+)$/i);
  if (prefixed) {
    const type: NeteaseSourceType = prefixed[1].toLowerCase() === 'playlist' ? 'playlist' : 'song';
    const rest = prefixed[2];
    const id = type === 'playlist' ? parseNeteasePlaylistId(rest) : parseNeteaseSongId(rest);
    return id ? { type, id } : null;
  }

  if (playlistHint.test(raw)) {
    const playlistId = parseNeteasePlaylistId(raw);
    if (playlistId) return { type: 'playlist', id: playlistId };
  }

  const songId = parseNeteaseSongId(raw);
  if (songId) return { type: 'song', id: songId };

  const playlistId = parseNeteasePlaylistId(raw);
  return playlistId ? { type: 'playlist', id: playlistId } : null;
};

/** 秒数格式化为 m:ss；无效时长返回 0:00 */
export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
};

export interface LyricLine {
  /** 开始时间（秒） */
  time: number;
  text: string;
}

/**
 * 解析网易云 / 标准 LRC 歌词。
 * 只保留带时间戳且有文本的行，按时间排序；元数据标签（[ti:] 等）会被忽略。
 */
export const parseNeteaseLyrics = (value: string): LyricLine[] => {
  const lines: LyricLine[] = [];
  const timestamp = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const raw of value.split(/\r?\n/)) {
    const matches = [...raw.matchAll(timestamp)];
    if (matches.length === 0) continue;

    const text = raw.replace(/\[[^\]]*\]/g, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      const time = minutes * 60 + seconds + fraction;
      if (Number.isFinite(time)) lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
};
