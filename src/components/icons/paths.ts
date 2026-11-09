/**
 * 全站图标（Lucide 风格，24×24，描边 SVG）。
 * 只在这里维护实际用到的图标，避免整包引入图标库。
 * 形状以原始 SVG 片段保存，由 Icon.astro 统一包裹 <svg>。
 */
export const iconShapes = {
  home: '<path d="m3 10.5 9-7.5 9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6.5H9v6.5H4.5A1.5 1.5 0 0 1 3 20z"/>',
  notebook:
    '<path d="M6.5 2.5H19a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H6.5a3 3 0 0 1 0-6H20"/><path d="M6.5 2.5a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3"/>',
  draft:
    '<path d="M12.5 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-5.5"/><path d="M17.4 3.6a2 2 0 0 1 2.8 2.8L13.2 13.4l-3.7 1 1-3.7z"/>',
  activity:
    '<path d="M21 11.5a9 9 0 1 0-3.2 6.9"/><path d="M21 6v5.5h-5.5"/><circle cx="12" cy="12" r="2.5"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 21v-1.2A5.3 5.3 0 0 1 9.8 14.5h4.4a5.3 5.3 0 0 1 5.3 5.3V21"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9 6.5 6.5M17.5 17.5l1.6 1.6M19.1 4.9 17.5 6.5M6.5 17.5 4.9 19.1"/>',
  moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7 7 0 0 0 9.7 9.7z"/>',
  monitor: '<rect x="2.5" y="3.5" width="19" height="13.5" rx="2"/><path d="M8.5 21h7M12 17v4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5 0-1.3-.5-2.5-1.5-3.5.4-1.5.4-3 0-4.5 0 0-1.3.4-3.5 1.5-1-.3-2-.4-3-.4s-2 .1-3 .4C6.3 2.9 5 2.5 5 2.5c-.4 1.5-.4 3 0 4.5C4 8 3.5 9.2 3.5 10.5c0 3.5 3 5.5 6 5.5-.5.6-.8 1.4-.9 2.2M9 19.5C6.5 20.5 5 19 5 19"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 7 8.2 5.4a1.5 1.5 0 0 0 1.6 0L21 7"/>',
  rss: '<path d="M4.5 11a8.5 8.5 0 0 1 8.5 8.5"/><path d="M4.5 4.5a15 15 0 0 1 15 15"/><circle cx="5.5" cy="18.5" r="1.4" fill="currentColor" stroke="none"/>',
  external:
    '<path d="M14.5 3.5H20.5V9.5"/><path d="M10.5 13.5 20.5 3.5"/><path d="M19 14v5.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5h5.5"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  code: '<path d="m15.5 18 5.5-6-5.5-6"/><path d="m8.5 6-5.5 6 5.5 6"/>',
  terminal: '<path d="m4.5 17 5.5-5-5.5-5"/><path d="M12.5 19h7"/>',
  play: '<path d="M6.5 3.7 20 12 6.5 20.3z"/>',
  pause:
    '<rect x="7.5" y="4.5" width="3.5" height="15" rx="0.6" fill="currentColor" stroke="none"/><rect x="13" y="4.5" width="3.5" height="15" rx="0.6" fill="currentColor" stroke="none"/>',
  'skip-back':
    '<path d="M18.5 5.5v13L8 12z" fill="currentColor" stroke="none"/><path d="M5.5 5.5v13"/>',
  'skip-forward':
    '<path d="M5.5 5.5v13L16 12z" fill="currentColor" stroke="none"/><path d="M18.5 5.5v13"/>',
  gamepad:
    '<path d="M6 11h3.5M7.75 9.25v3.5"/><path d="M16 10.5h.01M18.5 12.5h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.98 3.6l-.63 5.7A3.9 3.9 0 0 0 6 18.7c.9 0 1.75-.36 2.4-1l1.35-1.35a2 2 0 0 1 1.4-.58h1.7a2 2 0 0 1 1.4.58L15.6 17.7c.65.64 1.5 1 2.4 1a3.9 3.9 0 0 0 3.91-4.4l-.63-5.7A4 4 0 0 0 17.3 5z"/>',
  music:
    '<path d="M9.5 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="3"/><circle cx="17.5" cy="16" r="3"/>',
  link: '<path d="M10 13.5a5 5 0 0 0 7.4.4l2.6-2.6a5 5 0 0 0-7-7L11.5 5.8"/><path d="M14 10.5a5 5 0 0 0-7.4-.4L4 12.7a5 5 0 0 0 7 7l1.5-1.5"/>',
  share:
    '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 13.2 7.2 4.2M15.6 6.6 8.4 10.8"/>',
  weibo:
    '<path d="M9.8 18.5c-3.3 1.3-6.3.4-6.8-2.1-.5-2.5 1.8-5.4 5.1-6.7 3.3-1.3 6.3-.4 6.8 2.1.5 2.5-1.8 5.4-5.1 6.7z"/><path d="M14.7 4.8c2.7-.8 5 .4 5.6 2.8"/><path d="M14.3 8.1c1.5-.4 2.8.2 3.2 1.6"/>',
  'book-open':
    '<path d="M12 6.5C10.5 5 8.5 4 5 4H3v14h2c3.5 0 5.5 1 7 2.5 1.5-1.5 3.5-2.5 7-2.5h2V4h-2c-3.5 0-5.5 1-7 2.5z"/><path d="M12 6.5v14"/>',
  languages:
    '<path d="M3 5.5h9"/><path d="M7.5 3.5v2"/><path d="M10.5 5.5c-.6 4-3 7-6.5 8.5"/><path d="M5 9.5c1 2 2.8 3.6 5 4.5"/><path d="m12.5 21 4-10 4 10"/><path d="M14 17.5h5"/>',
  briefcase:
    '<rect x="2.5" y="7" width="19" height="13.5" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M2.5 12.5h19"/>',
  sparkles:
    '<path d="m12 3 1.8 4.4L18.2 9.2 13.8 11 12 15.4 10.2 11 5.8 9.2 10.2 7.4z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  star: '<path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  database:
    '<ellipse cx="12" cy="5.5" rx="8.5" ry="3"/><path d="M3.5 5.5v13c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-13"/><path d="M3.5 12c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3"/>',
  server:
    '<rect x="2.5" y="3.5" width="19" height="7" rx="2"/><rect x="2.5" y="13.5" width="19" height="7" rx="2"/><path d="M6.5 7h.01M6.5 17h.01"/>',
  palette:
    '<path d="M12 21a9 9 0 1 1 9-9c0 2-1.6 3.2-3.5 3.2h-2.2a2.3 2.3 0 0 0-1.7 3.8A1.9 1.9 0 0 1 12 21z"/><circle cx="8" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="12.5" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/>',
  coffee:
    '<path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 9.5h1.5a2.75 2.75 0 0 1 0 5.5H17"/><path d="M4 21.5h13"/>',
  camera:
    '<path d="M14.5 4.5h-5L7.5 7.5H4.5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H16.5z"/><circle cx="12" cy="13" r="3.2"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
  alert:
    '<path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
  refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M21 3.5V9h-5.5"/>',
  'chevron-down': '<path d="m6 9.5 6 6 6-6"/>',
  check: '<path d="m20 6.5-10.5 11L4 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  heart:
    '<path d="M20.6 5.1a5 5 0 0 0-7.1 0L12 6.6l-1.5-1.5a5 5 0 0 0-7.1 7.1l8.6 8.6 8.6-8.6a5 5 0 0 0 0-7.1z"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="m14 6 4 4"/>',
  x: '<path fill="currentColor" stroke="none" d="M17.7 3.2h3.1l-6.8 7.8 8 10.8h-6.3l-4.9-6.5-5.6 6.5H2l7.3-8.4L1.6 3.2h6.4l4.4 5.9zm-1.1 16.6h1.7L7.5 5H5.7z"/>',
  telegram:
    '<path d="m21.6 3.2-3 17-6.1-4.5-3.2 3.1.4-5.4 9.2-8.2-11 7.2-4.7-1.8z"/><path d="m21.6 3.2-8.1 12.2"/>',
  bilibili:
    '<rect x="2.5" y="7.5" width="19" height="12" rx="3.2"/><path d="M7 3.6 10 7M17 3.6 14 7"/><path d="M8.4 12.2v2M15.6 12.2v2"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.9" r="1" fill="currentColor" stroke="none"/>',
  youtube:
    '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10.4 9.4 5.2 2.6-5.2 2.6z" fill="currentColor" stroke="none"/>',
  linkedin:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.4 10.4V17M7.4 7.4v.1"/><path d="M11.6 17v-3.9a2.3 2.3 0 0 1 4.6 0V17"/>',
  tag: '<path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12.6V4a1.5 1.5 0 0 1 1.5-1.5h8.6a2 2 0 0 1 1.4.6l6.5 6.5a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/>',
} as const;

export type IconName = keyof typeof iconShapes;
