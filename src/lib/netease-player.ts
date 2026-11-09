import {
  formatDuration,
  parseNeteaseLyrics,
  parseNeteaseMusicSource,
  type LyricLine,
  type NeteaseSource,
} from './netease';

interface ApiArtist {
  name?: string;
}

interface ApiSong {
  id?: number | string;
  name?: string;
  ar?: ApiArtist[];
  artists?: ApiArtist[];
  al?: { picUrl?: string };
  album?: { picUrl?: string };
}

interface ApiPlaylist {
  name?: string;
  coverImgUrl?: string;
  tracks?: ApiSong[];
}

interface Track {
  id: string;
  name: string;
  artist: string;
  cover: string;
}

interface Collection {
  name: string;
  cover: string;
  tracks: Track[];
}

interface QueueState {
  collection: Collection;
  currentIndex: number;
  trackId: string;
  position: number;
  wasPlaying: boolean;
  history: number[];
}

interface CacheRecord<T> {
  savedAt: number;
  value: T;
}

const COLLECTION_CACHE_PREFIX = 'site-music:collection:v1:';
const LYRICS_CACHE_PREFIX = 'site-music:lyrics:v1:';
const SHUFFLE_KEY = 'site-music:shuffle';
const VOLUME_KEY = 'site-music:volume';
const MUTED_KEY = 'site-music:muted';
const COLLECTION_TTL = 24 * 60 * 60 * 1000;
const LYRICS_TTL = 7 * 24 * 60 * 60 * 1000;

const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, '')}${path}`;

// HTTPS 站点上把 http 资源升级，本地 http 预览则保持原协议
const secureUrl = (value: string) =>
  window.location.protocol === 'https:' ? value.replace(/^http:/, 'https:') : value;

const sizedCover = (url: string, size: number): string => {
  if (!url) return '';
  const secure = secureUrl(url);
  return `${secure}${secure.includes('?') ? '&' : '?'}param=${size}y${size}`;
};

const sourceKey = (source: NeteaseSource) => `${source.type}:${source.id}`;

const readStorage = <T>(key: string, ttl: number): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const record = JSON.parse(raw) as CacheRecord<T>;
    if (!record || typeof record.savedAt !== 'number' || Date.now() - record.savedAt > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return record.value;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // 存储被禁用或超出配额时忽略
  }
};

const readBoolean = (key: string, fallback: boolean): boolean => {
  try {
    const value = localStorage.getItem(key);
    if (value === '1') return true;
    if (value === '0') return false;
  } catch {
    // 忽略
  }
  return fallback;
};

const writeBoolean = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // 忽略
  }
};

const readNumber = (key: string, fallback: number): number => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  } catch {
    // 忽略
  }
  return fallback;
};

const writeNumber = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // 忽略
  }
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const mapTrack = (song: ApiSong): Track => {
  const artists = song.ar ?? song.artists ?? [];
  return {
    id: song.id === undefined || song.id === null ? '' : String(song.id),
    name: song.name?.trim() || '未知曲目',
    artist: artists
      .map((artist) => artist.name?.trim())
      .filter((name): name is string => Boolean(name))
      .join(' / '),
    cover: song.al?.picUrl ?? song.album?.picUrl ?? '',
  };
};

const isCollection = (value: unknown): value is Collection => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Collection;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.cover === 'string' &&
    Array.isArray(candidate.tracks) &&
    candidate.tracks.every(
      (track) =>
        track &&
        typeof track === 'object' &&
        typeof track.id === 'string' &&
        typeof track.name === 'string',
    )
  );
};

const loadCollection = async (apiBase: string, source: NeteaseSource): Promise<Collection> => {
  if (source.type === 'song') {
    const payload = await fetchJson<{ songs?: ApiSong[] }>(
      joinUrl(apiBase, `/song/detail?ids=${source.id}`),
    );
    const song = payload?.songs?.[0];
    if (!song) throw new Error('song');

    const track = mapTrack(song);
    if (!track.id) throw new Error('empty');
    return { name: track.name, cover: track.cover, tracks: [track] };
  }

  const detail = await fetchJson<{ playlist?: ApiPlaylist }>(
    joinUrl(apiBase, `/playlist/detail?id=${source.id}`),
  );
  const playlist = detail?.playlist;
  if (!playlist) throw new Error('playlist');

  let songs = Array.isArray(playlist.tracks) ? playlist.tracks : [];
  const full = await fetchJson<{ songs?: ApiSong[] }>(
    joinUrl(apiBase, `/playlist/track/all?id=${source.id}&limit=500&offset=0`),
  );
  if (full && Array.isArray(full.songs) && full.songs.length > 0) songs = full.songs;

  const tracks = songs.map(mapTrack).filter((track) => track.id);
  if (tracks.length === 0) throw new Error('empty');

  return {
    name: playlist.name?.trim() || '歌单',
    cover: playlist.coverImgUrl ?? tracks[0]?.cover ?? '',
    tracks,
  };
};

const readCollectionCache = (source: NeteaseSource): Collection | null => {
  const cached = readStorage<Collection>(
    `${COLLECTION_CACHE_PREFIX}${sourceKey(source)}`,
    COLLECTION_TTL,
  );
  return isCollection(cached) ? cached : null;
};

const loadCollectionCached = async (
  apiBase: string,
  source: NeteaseSource,
): Promise<Collection> => {
  const cached = readCollectionCache(source);
  if (cached) return cached;

  const value = await loadCollection(apiBase, source);
  writeStorage(`${COLLECTION_CACHE_PREFIX}${sourceKey(source)}`, value);
  return value;
};

const setupPlayer = (root: HTMLElement) => {
  const apiBase = (root.dataset.apiBase ?? '').replace(/\/+$/, '');
  const query = <T extends Element>(selector: string) => root.querySelector<T>(selector);

  const audio = query<HTMLAudioElement>('[data-music-audio]');
  const launcher = query<HTMLButtonElement>('[data-music-launcher]');
  const panel = query<HTMLElement>('[data-music-panel]');
  const panelClose = query<HTMLButtonElement>('[data-music-collapse]');
  const panelError = query<HTMLElement>('[data-music-panel-error]');
  const articleError = query<HTMLElement>('[data-music-article-error]');
  const collectionLabel = query<HTMLElement>('[data-music-collection-label]');
  const collectionName = query<HTMLElement>('[data-music-collection-name]');
  const songName = query<HTMLElement>('[data-music-song]');
  const artistName = query<HTMLElement>('[data-music-artist]');
  const panelCover = query<HTMLImageElement>('[data-music-panel-cover]');
  const panelPlaceholder = query<HTMLElement>('[data-music-panel-placeholder]');
  const status = query<HTMLElement>('[data-music-status]');
  const list = query<HTMLOListElement>('[data-music-list]');
  const listPanel = query<HTMLElement>('[data-music-list-panel]');
  const lyricsPanel = query<HTMLElement>('[data-music-lyrics-panel]');
  const lyricsBox = query<HTMLElement>('[data-music-lyrics]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-music-tab]'));
  const playButton = query<HTMLButtonElement>('[data-music-play]');
  const prevButton = query<HTMLButtonElement>('[data-music-prev]');
  const nextButton = query<HTMLButtonElement>('[data-music-next]');
  const shuffleButton = query<HTMLButtonElement>('[data-music-shuffle]');
  const muteButton = query<HTMLButtonElement>('[data-music-mute]');
  const volumeOnIcon = query<HTMLElement>('[data-music-volume-on]');
  const volumeOffIcon = query<HTMLElement>('[data-music-volume-off]');
  const volumeInput = query<HTMLInputElement>('[data-music-volume]');
  const progress = query<HTMLInputElement>('[data-music-progress]');
  const timeLabel = query<HTMLElement>('[data-music-time]');
  const coverButton = query<HTMLButtonElement>('[data-music-toggle]');
  const toggleIcon = query<HTMLElement>('[data-music-toggle-icon]');
  const coverImage = query<HTMLImageElement>('[data-music-cover]');
  const coverPlaceholder = query<HTMLElement>('[data-music-placeholder]');
  const articleClose = query<HTMLButtonElement>('[data-music-article-close]');

  if (!audio || !launcher || !panel || !coverButton) {
    root.remove();
    return;
  }

  const globalSourceRaw = (root.dataset.globalSource ?? '').trim();
  const globalSourceType = root.dataset.globalSourceType;
  const parsedGlobal = parseNeteaseMusicSource(globalSourceRaw);
  const globalSource: NeteaseSource | null =
    parsedGlobal && (globalSourceType === 'song' || globalSourceType === 'playlist')
      ? { type: globalSourceType, id: parsedGlobal.id }
      : parsedGlobal;

  let activeSource: NeteaseSource | null = null;
  let activeKey = '';
  let collection: Collection | null = null;
  let currentIndex = 0;
  let history: number[] = [];
  let collectionPromise: Promise<Collection | null> | null = null;
  let switchToken = 0;
  let playToken = 0;
  let lyricsToken = 0;
  let lyricsTrackId = '';
  let lyricsRequestTrack = '';
  let lyrics: LyricLine[] = [];
  let lyricsLoaded = false;
  let currentView: 'list' | 'lyrics' = 'list';
  let activeLyricIndex = -1;
  let booted = false;
  let isPlaying = false;
  let shuffle = readBoolean(SHUFFLE_KEY, false);
  let volume = Math.min(1, Math.max(0, readNumber(VOLUME_KEY, 0.8)));
  let muted = readBoolean(MUTED_KEY, false);
  let pendingSeek: { index: number; time: number } | null = null;
  const queueStates = new Map<string, QueueState>();
  const urlCache = new Map<string, Promise<string | null>>();

  const currentTrack = (): Track | null => collection?.tracks[currentIndex] ?? null;

  const setError = (message: string | null) => {
    [panelError, articleError].forEach((element) => {
      if (!element) return;
      if (message) {
        element.textContent = message;
        element.hidden = false;
      } else {
        element.textContent = '';
        element.hidden = true;
      }
    });
  };

  const setImage = (
    image: HTMLImageElement | null,
    placeholder: HTMLElement | null,
    url: string,
  ) => {
    if (!image) return;
    const sized = sizedCover(url, 320);
    if (!sized) {
      image.hidden = true;
      if (placeholder) placeholder.hidden = false;
      return;
    }
    image.src = sized;
    image.alt = '';
    image.hidden = false;
    if (placeholder) placeholder.hidden = true;
  };

  const updateVolumeUI = () => {
    const silent = muted || volume === 0;
    if (volumeOnIcon) volumeOnIcon.hidden = silent;
    if (volumeOffIcon) volumeOffIcon.hidden = !silent;
    if (muteButton) {
      muteButton.setAttribute('aria-pressed', String(muted));
      muteButton.setAttribute('aria-label', muted ? '取消静音' : '静音');
      muteButton.title = muted ? '取消静音' : '静音';
    }
    if (volumeInput) volumeInput.value = String(volume);
  };

  const applyVolume = (value: number, persist = true) => {
    volume = Math.min(1, Math.max(0, value));
    audio.volume = volume;
    audio.muted = muted;
    if (persist) writeNumber(VOLUME_KEY, volume);
    updateVolumeUI();
  };

  const setPlaying = (playing: boolean) => {
    isPlaying = playing;
    root.dataset.playing = String(playing);
    if (playing) {
      setError(null);
      root.dataset.state = 'playing';
    } else if (root.dataset.state !== 'error') {
      root.dataset.state = collection
        ? 'ready'
        : root.dataset.mode === 'article'
          ? 'loading'
          : 'idle';
    }

    if (coverButton) {
      const track = currentTrack();
      const label = track?.name ?? collection?.name ?? '文章音乐';
      coverButton.setAttribute('aria-pressed', String(playing));
      coverButton.setAttribute('aria-label', `${playing ? '暂停' : '播放'}音乐：${label}`);
      if (toggleIcon) toggleIcon.textContent = playing ? '❚❚' : '▶';
    }

    if (playButton) {
      playButton.setAttribute('aria-label', playing ? '暂停' : '播放');
      playButton.setAttribute('aria-pressed', String(playing));
    }
    root.querySelectorAll<HTMLElement>('[data-music-play-icon]').forEach((element) => {
      element.hidden = playing;
    });
    root.querySelectorAll<HTMLElement>('[data-music-pause-icon]').forEach((element) => {
      element.hidden = !playing;
    });
    root.querySelectorAll<HTMLElement>('[data-music-bars]').forEach((element) => {
      element.hidden = !playing;
    });
    launcher.setAttribute('aria-label', playing ? '打开音乐播放器（正在播放）' : '打开音乐播放器');
  };

  const updateShuffleUI = () => {
    if (!shuffleButton) return;
    shuffleButton.setAttribute('aria-pressed', String(shuffle));
    shuffleButton.title = shuffle ? '随机播放：开' : '随机播放：关';
  };

  const updateActiveTrack = () => {
    root.querySelectorAll<HTMLElement>('[data-music-track]').forEach((row) => {
      const active = Number(row.dataset.musicTrack) === currentIndex;
      row.classList.toggle('is-active', active);
      if (active) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
  };

  const renderLyrics = () => {
    if (!lyricsBox) return;
    lyricsBox.replaceChildren();
    activeLyricIndex = -1;

    if (!lyricsLoaded) {
      const loading = document.createElement('p');
      loading.className = 'music-panel__lyric-empty';
      loading.textContent = '歌词加载中…';
      lyricsBox.append(loading);
      return;
    }

    if (lyrics.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'music-panel__lyric-empty';
      empty.textContent = '暂无歌词 / 纯音乐';
      lyricsBox.append(empty);
      return;
    }

    lyrics.forEach((line, index) => {
      const element = document.createElement('p');
      element.className = 'music-panel__lyric';
      element.dataset.musicLyric = String(index);
      element.dataset.time = String(line.time);
      element.textContent = line.text;
      lyricsBox.append(element);
    });
  };

  const syncLyrics = (time: number) => {
    if (
      !lyricsBox ||
      currentView !== 'lyrics' ||
      root.dataset.mode !== 'global' ||
      lyrics.length === 0
    )
      return;

    let index = -1;
    for (let i = 0; i < lyrics.length; i += 1) {
      if (lyrics[i] && lyrics[i].time <= time + 0.15) index = i;
      else break;
    }
    if (index === activeLyricIndex) return;
    activeLyricIndex = index;

    lyricsBox.querySelectorAll<HTMLElement>('[data-music-lyric]').forEach((element) => {
      element.classList.toggle('is-active', Number(element.dataset.musicLyric) === index);
    });

    const active = lyricsBox.querySelector<HTMLElement>(`[data-music-lyric="${index}"]`);
    if (active) {
      const boxRect = lyricsBox.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      if (activeRect.top < boxRect.top + 8 || activeRect.bottom > boxRect.bottom - 8) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        lyricsBox.scrollTo({
          top:
            lyricsBox.scrollTop +
            activeRect.top -
            boxRect.top -
            boxRect.height / 2 +
            activeRect.height / 2,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }
    }
  };

  const loadLyrics = async (track: Track) => {
    if (!track.id || (lyricsLoaded && lyricsTrackId === track.id)) return;
    if (!lyricsLoaded && lyricsRequestTrack === track.id) return;

    const cacheKey = `${LYRICS_CACHE_PREFIX}${track.id}`;
    const cached = readStorage<LyricLine[]>(cacheKey, LYRICS_TTL);
    if (Array.isArray(cached)) {
      lyrics = cached;
      lyricsTrackId = track.id;
      lyricsRequestTrack = '';
      lyricsLoaded = true;
      renderLyrics();
      syncLyrics(audio.currentTime);
      return;
    }

    const token = ++lyricsToken;
    lyricsTrackId = track.id;
    lyricsRequestTrack = track.id;
    lyrics = [];
    lyricsLoaded = false;
    renderLyrics();

    const payload = await fetchJson<{ lrc?: { lyric?: string } }>(
      joinUrl(apiBase, `/lyric?id=${track.id}`),
    );
    if (token !== lyricsToken || lyricsTrackId !== track.id) return;

    lyricsRequestTrack = '';
    lyrics = parseNeteaseLyrics(payload?.lrc?.lyric ?? '');
    lyricsLoaded = true;
    writeStorage(cacheKey, lyrics);
    renderLyrics();
    syncLyrics(audio.currentTime);
  };

  const setView = (view: 'list' | 'lyrics') => {
    currentView = view;
    tabs.forEach((tab) => {
      const selected = tab.dataset.musicTab === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (listPanel) listPanel.hidden = view !== 'list';
    if (lyricsPanel) lyricsPanel.hidden = view !== 'lyrics';

    if (view === 'lyrics') {
      const track = currentTrack();
      if (track) void loadLyrics(track);
      syncLyrics(audio.currentTime);
    }
  };

  const updateTrackUI = () => {
    const track = currentTrack();
    if (!track || !collection) return;

    const cover = track.cover || collection.cover;
    setImage(panelCover, panelPlaceholder, cover);
    setImage(coverImage, coverPlaceholder, cover);

    if (songName) songName.textContent = track.name;
    if (artistName) artistName.textContent = track.artist || '未知艺术家';

    if (collectionLabel) {
      collectionLabel.textContent = activeSource?.type === 'playlist' ? '歌单' : '单曲';
    }
    if (collectionName) collectionName.textContent = collection.name;

    const label = collection.tracks.length > 1 ? `${collection.name} · ${track.name}` : track.name;
    coverButton.title = label;
    coverButton.setAttribute('aria-label', `${isPlaying ? '暂停' : '播放'}音乐：${track.name}`);
    if (playButton) playButton.setAttribute('aria-label', isPlaying ? '暂停' : '播放');

    if (lyricsTrackId !== track.id) {
      lyrics = [];
      lyricsLoaded = false;
      lyricsTrackId = '';
      lyricsRequestTrack = '';
      renderLyrics();
    }
    if (currentView === 'lyrics' && root.dataset.mode === 'global') void loadLyrics(track);

    updateActiveTrack();
    syncLyrics(audio.currentTime);
  };

  const renderTrackList = (value: Collection) => {
    if (!list) return;
    list.replaceChildren();

    value.tracks.forEach((track, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'music-panel__track';
      button.dataset.musicTrack = String(index);
      button.setAttribute('aria-label', `${track.name}${track.artist ? ` · ${track.artist}` : ''}`);

      const number = document.createElement('span');
      number.className = 'music-panel__track-index';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(index + 1).padStart(2, '0');

      const body = document.createElement('span');
      body.className = 'music-panel__track-body';

      const name = document.createElement('span');
      name.className = 'music-panel__track-name';
      name.textContent = track.name;

      const artist = document.createElement('span');
      artist.className = 'music-panel__track-artist';
      artist.textContent = track.artist || '未知艺术家';

      body.append(name, artist);
      button.append(number, body);
      button.addEventListener('click', () => {
        void playIndex(index, true, { reportError: true });
      });

      item.append(button);
      list.append(item);
    });

    list.hidden = false;
  };

  const renderCollection = (value: Collection) => {
    if (status) status.hidden = true;
    root.dataset.state = isPlaying ? 'playing' : 'ready';
    renderTrackList(value);
    updateTrackUI();
  };

  const captureState = () => {
    if (!activeKey || !collection) return;
    const track = collection.tracks[currentIndex];
    if (!track) return;

    queueStates.set(activeKey, {
      collection,
      currentIndex,
      trackId: track.id,
      position: audio.ended ? 0 : audio.currentTime || 0,
      wasPlaying: !audio.paused,
      history: [...history],
    });
  };

  const getTrackUrl = (track: Track): Promise<string | null> => {
    const cached = urlCache.get(track.id);
    if (cached) return cached;

    const request = (async (): Promise<string | null> => {
      for (const level of ['exhigh', 'standard'] as const) {
        const payload = await fetchJson<{ data?: { url?: string | null }[] }>(
          joinUrl(apiBase, `/song/url/v1?id=${track.id}&level=${level}`),
        );
        const url = payload?.data?.[0]?.url;
        if (typeof url === 'string' && url.length > 0) return secureUrl(url);
      }

      const legacy = await fetchJson<{ data?: { url?: string | null }[] }>(
        joinUrl(apiBase, `/song/url?id=${track.id}`),
      );
      const url = legacy?.data?.[0]?.url;
      return typeof url === 'string' && url.length > 0 ? secureUrl(url) : null;
    })();

    urlCache.set(track.id, request);
    void request.then((url) => {
      // 无音源不缓存，之后仍可重试
      if (!url) urlCache.delete(track.id);
    });
    return request;
  };

  const resetProgress = () => {
    if (progress) {
      progress.value = '0';
      progress.disabled = true;
    }
    if (timeLabel) timeLabel.textContent = '0:00 / 0:00';
  };

  const markUnavailable = (index: number) => {
    root
      .querySelector<HTMLElement>(`[data-music-track="${index}"]`)
      ?.classList.add('is-unavailable');
  };

  const playIndex = async (
    index: number,
    autoplay: boolean,
    options: { reportError?: boolean; seek?: number | null } = {},
  ) => {
    const value = collection;
    if (!value) return;

    const track = value.tracks[index];
    if (!track) return;

    const token = ++playToken;
    currentIndex = index;
    updateTrackUI();
    resetProgress();
    setError(null);

    const url = await getTrackUrl(track);
    if (token !== playToken) return;

    if (!url) {
      markUnavailable(index);
      root.dataset.state = 'error';
      setError('该歌曲暂不可播放');
      return;
    }

    root
      .querySelector<HTMLElement>(`[data-music-track="${index}"]`)
      ?.classList.remove('is-unavailable');

    if (audio.dataset.trackId !== track.id) {
      audio.pause();
      audio.src = url;
      audio.dataset.trackId = track.id;
      audio.load();
    }

    if (pendingSeek && pendingSeek.index !== index) pendingSeek = null;
    const seek = options.seek ?? (pendingSeek?.index === index ? pendingSeek.time : null);
    if (pendingSeek?.index === index) pendingSeek = null;
    if (typeof seek === 'number' && Number.isFinite(seek)) {
      const applySeek = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        const target = duration > 0 ? Math.min(seek, Math.max(0, duration - 0.5)) : seek;
        audio.currentTime = Math.max(0, target);
      };

      if (audio.readyState >= 1) applySeek();
      else audio.addEventListener('loadedmetadata', applySeek, { once: true });
    }

    if (!autoplay) return;

    try {
      await audio.play();
    } catch {
      if (token !== playToken) return;
      if (options.reportError) {
        root.dataset.state = 'error';
        setError('播放失败，请稍后重试');
      } else {
        setPlaying(false);
      }
    }
  };

  const chooseNextIndex = (delta: number): number => {
    const length = collection?.tracks.length ?? 0;
    if (length <= 1) return 0;

    if (!shuffle) return (currentIndex + delta + length) % length;

    if (delta < 0 && history.length > 0) {
      return history.pop() ?? currentIndex;
    }

    let next = currentIndex;
    while (next === currentIndex) next = Math.floor(Math.random() * length);
    if (delta > 0) {
      history.push(currentIndex);
      if (history.length > 50) history.shift();
    }
    return next;
  };

  const skipTrack = (delta: number) => {
    void playIndex(chooseNextIndex(delta), true, { reportError: true });
  };

  const togglePlayback = async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (!collection) {
      await ensureSourceLoaded();
      if (!collection) return;
    }

    const track = currentTrack();
    if (!track) return;

    if (audio.dataset.trackId !== track.id) {
      await playIndex(currentIndex, true, { reportError: true });
      return;
    }

    if (audio.ended) audio.currentTime = 0;
    try {
      setError(null);
      await audio.play();
    } catch {
      root.dataset.state = 'error';
      setError('播放失败，请稍后重试');
    }
  };

  const syncProgress = () => {
    if (!progress || !timeLabel) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (duration <= 0) return;

    progress.disabled = false;
    progress.value = String(Math.min(100, (audio.currentTime / duration) * 100));
    timeLabel.textContent = `${formatDuration(audio.currentTime)} / ${formatDuration(duration)}`;
    syncLyrics(audio.currentTime);
  };

  const setPanelOpen = (open: boolean, restoreFocus = false) => {
    root.dataset.open = String(open);
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));

    if (open) {
      panel.focus({ preventScroll: true });
      void ensureSourceLoaded();
    } else if (restoreFocus) {
      launcher.focus();
    }
  };

  const getPageSource = (): NeteaseSource | null => {
    const raw = (document.body.dataset.pageMusic ?? '').trim();
    return (raw ? parseNeteaseMusicSource(raw) : null) ?? globalSource;
  };

  const primeSource = (source: NeteaseSource, cached: Collection) => {
    activeKey = sourceKey(source);
    activeSource = source;
    collection = cached;
    currentIndex = 0;
    history = [];
    pendingSeek = null;
    audio.dataset.trackId = '';
    resetProgress();
    renderCollection(cached);
  };

  const ensureSourceLoaded = async (): Promise<void> => {
    const source = getPageSource();
    if (!source) return;

    const key = sourceKey(source);
    if (activeKey === key && collection) return;
    if (activeKey === key && collectionPromise) {
      await collectionPromise.catch(() => null);
      return;
    }

    await switchSource(source, false);
  };

  const switchSource = async (source: NeteaseSource, resume: boolean) => {
    const key = sourceKey(source);
    if (activeKey === key && (collection || collectionPromise)) return;

    const token = ++switchToken;
    captureState();
    audio.pause();
    playToken += 1;

    activeKey = key;
    activeSource = source;
    collection = null;
    currentIndex = 0;
    history = [];
    pendingSeek = null;
    setImage(panelCover, panelPlaceholder, '');
    setImage(coverImage, coverPlaceholder, '');
    lyrics = [];
    lyricsLoaded = false;
    lyricsTrackId = '';
    lyricsRequestTrack = '';
    activeLyricIndex = -1;
    setError(null);
    renderLyrics();
    root.dataset.state = 'loading';

    if (status) {
      status.hidden = false;
      status.textContent = source.type === 'playlist' ? '正在加载歌单…' : '正在加载歌曲…';
    }
    if (collectionName) collectionName.textContent = '加载中…';
    if (songName) songName.textContent = '正在加载…';
    if (artistName) artistName.textContent = '';

    const saved = queueStates.get(key);
    const request = saved?.collection
      ? Promise.resolve(saved.collection)
      : loadCollectionCached(apiBase, source);
    collectionPromise = request;

    let value: Collection;
    try {
      value = await request;
    } catch {
      if (token !== switchToken) return;
      collectionPromise = null;
      root.dataset.state = 'error';
      if (status) status.hidden = true;
      if (collectionName) collectionName.textContent = '加载失败';
      if (songName)
        songName.textContent = source.type === 'playlist' ? '无法加载歌单' : '无法加载歌曲';
      if (artistName) artistName.textContent = '请检查网络或 API 配置';
      setError(source.type === 'playlist' ? '歌单加载失败，请稍后重试' : '音乐信息加载失败');
      return;
    }

    if (token !== switchToken) return;
    collectionPromise = null;
    collection = value;

    if (saved) {
      const index = value.tracks.findIndex((track) => track.id === saved.trackId);
      currentIndex = index >= 0 ? index : Math.min(saved.currentIndex, value.tracks.length - 1);
      history = [...saved.history];
      pendingSeek = saved.position > 0 ? { index: currentIndex, time: saved.position } : null;
    }

    renderCollection(value);
    const shouldPlay = resume || Boolean(saved?.wasPlaying);
    if (shouldPlay) {
      await playIndex(currentIndex, true);
    } else {
      // 不自动播放时不要预取音频地址；等用户点击播放再请求
      audio.dataset.trackId = '';
      resetProgress();
      updateTrackUI();
    }
  };

  const syncPageContext = async (allowLoad = true) => {
    if (!apiBase) {
      root.remove();
      return;
    }

    const pageSource = getPageSource();
    const mode = (document.body.dataset.pageMusic ?? '').trim() ? 'article' : 'global';
    root.dataset.mode = mode;
    root.dataset.dismissed = 'false';

    if (!pageSource) {
      root.hidden = true;
      audio.pause();
      booted = true;
      return;
    }

    root.hidden = false;
    const key = sourceKey(pageSource);
    const same = activeKey === key && Boolean(collection || collectionPromise);

    if (same) {
      if (collection) updateTrackUI();
      booted = true;
      return;
    }

    const resume = booted && !audio.paused;
    const cached = readCollectionCache(pageSource);

    const panelOpen = root.dataset.open === 'true';

    // 首次进入普通页面时只读缓存；没有缓存就等用户打开面板，避免空抓歌单
    if (cached && !allowLoad) {
      primeSource(pageSource, cached);
    } else if (cached || resume || mode === 'article' || panelOpen) {
      void switchSource(pageSource, resume);
    }

    booted = true;
  };

  applyVolume(volume, false);
  updateShuffleUI();
  resetProgress();
  setPlaying(false);
  setView('list');

  launcher.addEventListener('click', () => setPanelOpen(true));
  panelClose?.addEventListener('click', () => setPanelOpen(false, true));
  playButton?.addEventListener('click', () => void togglePlayback());
  prevButton?.addEventListener('click', () => skipTrack(-1));
  nextButton?.addEventListener('click', () => skipTrack(1));
  coverButton.addEventListener('click', () => void togglePlayback());

  shuffleButton?.addEventListener('click', () => {
    shuffle = !shuffle;
    writeBoolean(SHUFFLE_KEY, shuffle);
    updateShuffleUI();
  });

  muteButton?.addEventListener('click', () => {
    muted = !muted;
    if (!muted && volume === 0) {
      volume = 0.8;
      writeNumber(VOLUME_KEY, volume);
    }
    audio.muted = muted;
    writeBoolean(MUTED_KEY, muted);
    updateVolumeUI();
  });

  volumeInput?.addEventListener('input', () => {
    muted = false;
    audio.muted = false;
    writeBoolean(MUTED_KEY, false);
    applyVolume(Number(volumeInput.value));
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.musicTab === 'lyrics' ? 'lyrics' : 'list';
      setView(view);
    });
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      next?.focus();
      next?.click();
    });
  });

  progress?.addEventListener('input', () => {
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = (Number(progress.value) / 100) * duration;
    syncLyrics(audio.currentTime);
  });

  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('timeupdate', syncProgress);
  audio.addEventListener('loadedmetadata', syncProgress);
  audio.addEventListener('durationchange', syncProgress);
  audio.addEventListener('ended', () => {
    if (!collection) {
      setPlaying(false);
      return;
    }
    if (shuffle || currentIndex < collection.tracks.length - 1) {
      void playIndex(chooseNextIndex(1), true);
    } else {
      setPlaying(false);
    }
  });
  audio.addEventListener('error', () => {
    if (!audio.currentSrc) return;
    audio.dataset.trackId = '';
    root.dataset.state = 'error';
    setError('音频加载失败');
  });

  panelCover?.addEventListener('error', () => {
    panelCover.hidden = true;
    if (panelPlaceholder) panelPlaceholder.hidden = false;
  });
  coverImage?.addEventListener('error', () => {
    coverImage.hidden = true;
    if (coverPlaceholder) coverPlaceholder.hidden = false;
  });

  articleClose?.addEventListener('click', () => {
    captureState();
    audio.pause();
    root.dataset.dismissed = 'true';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.mode === 'global' && !panel.hidden) {
      event.stopPropagation();
      setPanelOpen(false, true);
    }
  });

  let pageLoadSeen = false;

  document.addEventListener('astro:before-swap', captureState);
  document.addEventListener('astro:after-swap', () => {
    void syncPageContext(true);
  });
  document.addEventListener('astro:page-load', () => {
    // 首次 page-load 与下面的直接初始化重复，只处理后续导航
    if (!pageLoadSeen) {
      pageLoadSeen = true;
      return;
    }
    void syncPageContext(true);
  });
  window.addEventListener('pagehide', captureState);

  void syncPageContext(false);
};

const root = document.querySelector<HTMLElement>('[data-music-player]');

if (root && root.dataset.musicReady !== 'true') {
  root.dataset.musicReady = 'true';
  setupPlayer(root);
}
