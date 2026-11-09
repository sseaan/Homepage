import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  parseNeteaseLyrics,
  parseNeteaseMusicSource,
  parseNeteasePlaylistId,
  parseNeteaseSongId,
} from '../src/lib/netease';

describe('parseNeteaseSongId', () => {
  it.each([
    ['347230', '347230'],
    ['https://music.163.com/song?id=347230', '347230'],
    ['https://music.163.com/song?id=347230&userid=1', '347230'],
    ['https://music.163.com/#/song?id=347230', '347230'],
    ['https://y.music.163.com/m/song?id=347230', '347230'],
    ['https://music.163.com/song/347230', '347230'],
  ])('parses %s', (input, expected) => {
    expect(parseNeteaseSongId(input)).toBe(expected);
  });

  it.each(['', '   ', 'not-a-song', 'https://music.163.com/song?id=abc', 'https://example.com/'])(
    'rejects %s',
    (input) => {
      expect(parseNeteaseSongId(input)).toBeNull();
    },
  );
});

describe('parseNeteasePlaylistId', () => {
  it.each([
    ['18577886483', '18577886483'],
    ['https://music.163.com/playlist?id=18577886483', '18577886483'],
    ['https://music.163.com/playlist?id=18577886483&userid=1', '18577886483'],
    ['https://music.163.com/#/playlist?id=18577886483', '18577886483'],
    ['https://y.music.163.com/m/playlist?id=18577886483', '18577886483'],
    ['https://music.163.com/playlist/18577886483', '18577886483'],
    ['https://music.163.com/discover/toplist?id=3778678', '3778678'],
  ])('parses %s', (input, expected) => {
    expect(parseNeteasePlaylistId(input)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    'not-a-playlist',
    'https://music.163.com/song?id=347230',
    'https://music.163.com/playlist?id=abc',
  ])('rejects %s', (input) => {
    expect(parseNeteasePlaylistId(input)).toBeNull();
  });
});

describe('parseNeteaseMusicSource', () => {
  it.each([
    ['347230', { type: 'song', id: '347230' }],
    ['https://music.163.com/song?id=347230', { type: 'song', id: '347230' }],
    ['song:347230', { type: 'song', id: '347230' }],
    ['https://music.163.com/playlist?id=18577886483', { type: 'playlist', id: '18577886483' }],
    ['https://music.163.com/#/playlist?id=18577886483', { type: 'playlist', id: '18577886483' }],
    ['playlist:18577886483', { type: 'playlist', id: '18577886483' }],
    ['playlist：18577886483', { type: 'playlist', id: '18577886483' }],
  ])('parses %s', (input, expected) => {
    expect(parseNeteaseMusicSource(input)).toEqual(expected);
  });

  it.each(['', '   ', 'not-a-source', 'playlist:abc', 'song:https://example.com/'])(
    'rejects %s',
    (input) => {
      expect(parseNeteaseMusicSource(input)).toBeNull();
    },
  );
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [Number.NaN, '0:00'],
    [Number.POSITIVE_INFINITY, '0:00'],
    [59.9, '0:59'],
    [60, '1:00'],
    [245, '4:05'],
    [3600, '60:00'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });
});

describe('parseNeteaseLyrics', () => {
  it('parses timestamps and drops metadata or empty lines', () => {
    const lyrics = parseNeteaseLyrics(
      [
        '[ti:测试歌曲]',
        '[ar:测试歌手]',
        '[00:12.34]第一句',
        '[00:15.5][00:18.00]重复句',
        '[00:20.123]最后一句',
        '[00:22.00]',
      ].join('\n'),
    );

    expect(lyrics).toEqual([
      { time: 12.34, text: '第一句' },
      { time: 15.5, text: '重复句' },
      { time: 18, text: '重复句' },
      { time: 20.123, text: '最后一句' },
    ]);
  });

  it('returns an empty array for instrumental or invalid lyrics', () => {
    expect(parseNeteaseLyrics('')).toEqual([]);
    expect(parseNeteaseLyrics('纯音乐，请欣赏')).toEqual([]);
  });
});
