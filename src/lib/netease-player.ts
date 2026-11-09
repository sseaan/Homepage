import { formatDuration, parseNeteaseMusicSource, type NeteaseSource } from './netease';

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

const joinUrl = (base: string, path: string) => `${base.replace(/\/+$/, '')}${path}`;

// HTTPS 站点上把 http 资源升级，本地 http 预览则保持原协议
const secureUrl = (value: string) =>
  window.location.protocol === 'https:' ? value.replace(/^http:/, 'https:') : value;

const sizedCover = (url: string, size: number): string => {
  if (!url) return '';
  const secure = secureUrl(url);
  return `${secure}${secure.includes('?') ? '&' : '?'}param=${size}y${size}`;
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

const setupPlayer = (root: HTMLElement) => {
  const apiBase = (root.dataset.apiBase ?? '').replace(/\/+$/, '');
  const parsedSource = parseNeteaseMusicSource(root.dataset.source ?? '');
  const sourceType = root.dataset.sourceType;
  const source: NeteaseSource | null =
    parsedSource && (sourceType === 'song' || sourceType === 'playlist')
      ? { type: sourceType, id: parsedSource.id }
      : parsedSource;
  const variant = root.dataset.variant === 'article' ? 'article' : 'global';
  const isGlobal = variant === 'global';

  if (!apiBase || !source) {
    root.remove();
    return;
  }

  const query = <T extends Element>(selector: string) => root.querySelector<T>(selector);

  const audio = query<HTMLAudioElement>('[data-music-audio]');
  const errorEl = query<HTMLElement>('[data-music-error]');
  if (!audio) {
    root.remove();
    return;
  }

  const coverImage = query<HTMLImageElement>('[data-music-cover]');
  const coverPlaceholder = query<HTMLElement>('[data-music-placeholder]');

  // 文章：右下角封面按钮
  const coverButton = query<HTMLButtonElement>('[data-music-toggle]');
  const toggleIcon = query<HTMLElement>('[data-music-toggle-icon]');
  const articleClose = query<HTMLButtonElement>('[data-music-close]');

  // 全局：入口按钮 + 面板
  const launcher = query<HTMLButtonElement>('[data-music-launcher]');
  const panel = query<HTMLElement>('[data-music-panel]');
  const panelClose = query<HTMLButtonElement>('[data-music-collapse]');
  const collectionLabel = query<HTMLElement>('[data-music-collection-label]');
  const collectionName = query<HTMLElement>('[data-music-collection-name]');
  const songName = query<HTMLElement>('[data-music-song]');
  const artistName = query<HTMLElement>('[data-music-artist]');
  const status = query<HTMLElement>('[data-music-status]');
  const list = query<HTMLOListElement>('[data-music-list]');
  const playButton = query<HTMLButtonElement>('[data-music-play]');
  const prevButton = query<HTMLButtonElement>('[data-music-prev]');
  const nextButton = query<HTMLButtonElement>('[data-music-next]');
  const progress = query<HTMLInputElement>('[data-music-progress]');
  const timeLabel = query<HTMLElement>('[data-music-time]');

  if (isGlobal && (!launcher || !panel)) {
    root.remove();
    return;
  }
  if (!isGlobal && !coverButton) {
    root.remove();
    return;
  }

  root.hidden = false;

  let collection: Collection | null = null;
  let currentIndex = 0;
  let loading: Promise<Collection> | null = null;
  let playToken = 0;
  let isPlaying = false;
  const urlCache = new Map<string, Promise<string | null>>();

  const currentTrack = (): Track | null => collection?.tracks[currentIndex] ?? null;

  const setError = (message: string | null) => {
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  };

  const setCover = (url: string) => {
    if (!coverImage) return;
    const sized = sizedCover(url, 320);
    if (!sized) {
      coverImage.hidden = true;
      if (coverPlaceholder) coverPlaceholder.hidden = false;
      return;
    }
    coverImage.src = sized;
    coverImage.alt = '';
    coverImage.hidden = false;
    if (coverPlaceholder) coverPlaceholder.hidden = true;
  };

  const setPlaying = (playing: boolean) => {
    isPlaying = playing;
    root.dataset.playing = String(playing);
    if (playing) {
      setError(null);
      root.dataset.state = 'playing';
    } else if (root.dataset.state !== 'error') {
      root.dataset.state = collection ? 'ready' : 'idle';
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
    if (launcher) {
      launcher.setAttribute(
        'aria-label',
        playing ? '打开音乐播放器（正在播放）' : '打开音乐播放器',
      );
    }
  };

  const updateActiveTrack = () => {
    root.querySelectorAll<HTMLElement>('[data-music-track]').forEach((row) => {
      const active = Number(row.dataset.musicTrack) === currentIndex;
      row.classList.toggle('is-active', active);
      if (active) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
  };

  const updateTrackUI = () => {
    const track = currentTrack();
    if (!track || !collection) return;

    setCover(track.cover || collection.cover);

    if (isGlobal) {
      if (songName) songName.textContent = track.name;
      if (artistName) artistName.textContent = track.artist || '未知艺术家';
      if (playButton) playButton.setAttribute('aria-label', isPlaying ? '暂停' : '播放');
    } else if (coverButton) {
      const label =
        collection.tracks.length > 1 ? `${collection.name} · ${track.name}` : track.name;
      coverButton.title = label;
      coverButton.setAttribute('aria-label', `${isPlaying ? '暂停' : '播放'}音乐：${track.name}`);
    }

    updateActiveTrack();
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
        void playIndex(index, true);
      });

      item.append(button);
      list.append(item);
    });

    list.hidden = false;
  };

  const applyCollection = (value: Collection) => {
    if (isGlobal) {
      if (collectionLabel) {
        collectionLabel.textContent = source.type === 'playlist' ? '歌单' : '单曲';
      }
      if (collectionName) collectionName.textContent = value.name;
      if (status) status.hidden = true;
      renderTrackList(value);
      updateTrackUI();
    } else {
      setCover(value.cover || value.tracks[0]?.cover || '');
      updateTrackUI();
    }
  };

  const ensureCollection = async (): Promise<Collection | null> => {
    if (collection) return collection;

    if (!loading) {
      loading = loadCollection(apiBase, source)
        .then((value) => {
          collection = value;
          currentIndex = 0;
          applyCollection(value);
          setError(null);
          root.dataset.state = 'ready';
          return value;
        })
        .catch((error: unknown) => {
          loading = null;
          if (status) status.hidden = true;
          root.dataset.state = 'error';
          if (isGlobal) {
            if (collectionName) collectionName.textContent = '加载失败';
            if (songName) songName.textContent = '无法加载歌单';
            if (artistName) artistName.textContent = '请检查网络或 API 配置';
            if (playButton) playButton.setAttribute('aria-label', '重试');
          }
          setError(source.type === 'playlist' ? '歌单加载失败，请稍后重试' : '音乐信息加载失败');
          throw error;
        });
    }

    try {
      return await loading;
    } catch {
      return null;
    }
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

  const playIndex = async (index: number, autoplay: boolean) => {
    const token = ++playToken;
    const value = await ensureCollection();
    if (!value || token !== playToken) return;

    const track = value.tracks[index];
    if (!track) return;

    currentIndex = index;
    updateTrackUI();
    resetProgress();

    const url = await getTrackUrl(track);
    if (token !== playToken) return;

    if (!url) {
      const row = root.querySelector<HTMLElement>(`[data-music-track="${index}"]`);
      row?.classList.add('is-unavailable');
      root.dataset.state = 'error';
      setError('该歌曲暂不可播放');
      return;
    }

    setError(null);

    if (audio.dataset.trackId !== track.id) {
      audio.pause();
      audio.src = url;
      audio.dataset.trackId = track.id;
      audio.load();
    } else if (audio.ended) {
      audio.currentTime = 0;
    }

    if (!autoplay) return;

    try {
      await audio.play();
    } catch {
      if (token !== playToken) return;
      root.dataset.state = 'error';
      setError('播放失败，请稍后重试');
    }
  };

  const togglePlayback = async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    const value = await ensureCollection();
    if (!value) return;

    const track = value.tracks[currentIndex];
    if (!track) return;

    if (audio.dataset.trackId !== track.id) {
      await playIndex(currentIndex, true);
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

  const skipTrack = async (delta: number) => {
    const value = await ensureCollection();
    if (!value) return;
    const length = value.tracks.length;
    if (length === 0) return;

    const nextIndex = (currentIndex + delta + length) % length;
    await playIndex(nextIndex, true);
  };

  const syncProgress = () => {
    if (!progress || !timeLabel) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (duration <= 0) return;

    progress.disabled = false;
    progress.value = String(Math.min(100, (audio.currentTime / duration) * 100));
    timeLabel.textContent = `${formatDuration(audio.currentTime)} / ${formatDuration(duration)}`;
  };

  progress?.addEventListener('input', () => {
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = (Number(progress.value) / 100) * duration;
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
    if (currentIndex < collection.tracks.length - 1) {
      void playIndex(currentIndex + 1, true);
    } else {
      setPlaying(false);
    }
  });
  audio.addEventListener('error', () => {
    if (!audio.currentSrc) return;
    root.dataset.state = 'error';
    setError('音频加载失败');
  });

  coverImage?.addEventListener('error', () => {
    coverImage.hidden = true;
    if (coverPlaceholder) coverPlaceholder.hidden = false;
  });

  if (isGlobal && launcher && panel) {
    const setPanelOpen = (open: boolean, restoreFocus = false) => {
      root.dataset.open = String(open);
      panel.hidden = !open;
      launcher.hidden = open;
      launcher.setAttribute('aria-expanded', String(open));

      if (open) {
        panel.focus({ preventScroll: true });
        void ensureCollection();
      } else if (restoreFocus) {
        launcher.focus();
      }
    };

    root.dataset.open = 'false';
    root.dataset.state = 'idle';
    setPlaying(false);
    resetProgress();

    launcher.addEventListener('click', () => setPanelOpen(true));
    panelClose?.addEventListener('click', () => setPanelOpen(false, true));
    playButton?.addEventListener('click', () => {
      void togglePlayback();
    });
    prevButton?.addEventListener('click', () => {
      void skipTrack(-1);
    });
    nextButton?.addEventListener('click', () => {
      void skipTrack(1);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.stopPropagation();
        setPanelOpen(false, true);
      }
    });
  } else if (coverButton) {
    const closeButton = articleClose;
    coverButton.addEventListener('click', () => {
      void togglePlayback();
    });
    closeButton?.addEventListener('click', () => {
      playToken += 1;
      audio.pause();
      root.remove();
    });

    void ensureCollection();
  }
};

document.querySelectorAll<HTMLElement>('[data-music-player]').forEach(setupPlayer);
