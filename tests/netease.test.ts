import { describe, expect, it } from 'vitest';
import { parseNeteaseSongId } from '../src/lib/netease';

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
