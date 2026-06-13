// =====================================================================
//  icons.js — ícones SVG (estilo Spotify) no lugar de emojis na interface.
//  Uso: icon("play", { size: 18, fill: true })
// =====================================================================
const STROKE = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.2V20h13V10.2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  library: '<rect x="4" y="4" width="3.6" height="16" rx="1"/><rect x="9.6" y="4" width="3.6" height="16" rx="1"/><path d="m16.4 5.2 3.4 1 3.2 12.4-3.4 1z" transform="rotate(-12 18 12)"/>',
  heart: '<path d="M12 20.3s-7.2-4.6-9.5-8.6C1 8.6 2.6 5.3 6.2 5.3c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3 3.6 0 5.2 3.3 3.7 6.4C19.2 15.7 12 20.3 12 20.3z"/>',
  x: '<path d="M6 6 18 18M18 6 6 18"/>',
  chevronLeft: '<path d="m15 5-7 7 7 7"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  sparkles: '<path d="M12 3l1.7 4.6L18.5 9l-4.8 1.4L12 15l-1.7-4.6L5.5 9l4.8-1.4z"/><path d="M18.5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  disc: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.4"/>',
  music: '<path d="M9 17.5V5.2l11-2.2v12.3"/><circle cx="6" cy="17.5" r="3"/><circle cx="17" cy="15.3" r="3"/>',
  image: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><circle cx="8.6" cy="9.6" r="1.7"/><path d="m4 17.5 4.8-4.6 3.7 3.5 3-2.8 4.5 4.3"/>',
  film: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="M7.5 4.5v15M16.5 4.5v15M3 9h4.5M16.5 9H21M3 15h4.5M16.5 15H21"/>',
  message: '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.5 7.5 8.5 5.6 8.5-5.6"/>',
  trophy: '<path d="M6.5 4.5h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M6.5 5.5H3.5v1.5a3 3 0 0 0 3 3M17.5 5.5h3v1.5a3 3 0 0 1-3 3"/><path d="M9.5 19.5h5M12 14.5v5"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.5 2.4 14.5 0 17M12 3.5c-2.4 2.5-2.4 14.5 0 17"/>',
  gamepad: '<rect x="2.5" y="7.5" width="19" height="9.5" rx="4.75"/><path d="M7 11v2.2M5.9 12.1h2.2"/><circle cx="15.6" cy="11.4" r="1"/><circle cx="18.1" cy="13.4" r="1"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3M3.5 4.2v3.8h3.8"/><path d="M12 7.5v5l3.2 1.9"/>',
  pip: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><rect x="12" y="11" width="7" height="6" rx="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone: '<path d="M6.6 3.8 4 6.4c0 7.6 6 13.6 13.6 13.6l2.6-2.6-4-2-1.9 1.9a11 11 0 0 1-5-5l1.9-1.9z"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 14a5 5 0 0 0 7.6 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
  camera: '<rect x="3" y="7.5" width="18" height="12" rx="2.2"/><circle cx="12" cy="13.5" r="3.3"/><path d="m8.2 7.5 1.3-2.8h5l1.3 2.8"/>',
  shuffle: '<path d="M16 4h4v4"/><path d="M4 20 20 4"/><path d="M16 20h4v-4"/><path d="m14.5 14.5 5.5 5.5"/><path d="m4 4 5 5"/>',
  repeat: '<path d="m17 2 3.5 3.5L17 9"/><path d="M3.5 11.5v-1A4 4 0 0 1 7.5 6.5h13"/><path d="m7 22-3.5-3.5L7 15"/><path d="M20.5 12.5v1a4 4 0 0 1-4 4h-13"/>',
  repeatOne: '<path d="m17 2 3.5 3.5L17 9"/><path d="M3.5 11.5v-1A4 4 0 0 1 7.5 6.5h13"/><path d="m7 22-3.5-3.5L7 15"/><path d="M20.5 12.5v1a4 4 0 0 1-4 4h-13"/><path d="M11.6 10.2h1.2v3.6" stroke-width="1.6"/>',
  volume: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4"/><path d="M18.5 6a8 8 0 0 1 0 12"/>',
  volumeOff: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  bell: '<path d="M6.2 9a5.8 5.8 0 0 1 11.6 0c0 4.5 2 5.8 2 5.8H4.2S6.2 13.5 6.2 9z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  bellOff: '<path d="M9 4.6A5.8 5.8 0 0 1 17.8 9c0 4.5 2 5.8 2 5.8H8M6.2 9c0 3.2-1.2 4.6-1.8 5.4"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="m3 3 18 18"/>',
};
// Ícones preenchidos (fill)
const FILL = {
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  pause: '<path d="M7 4.5h3.4v15H7zM13.6 4.5H17v15h-3.4z"/>',
  prev: '<path d="M6 5h2.2v14H6z"/><path d="M20 5 9.2 12 20 19z"/>',
  next: '<path d="M15.8 5H18v14h-2.2z"/><path d="M4 5 14.8 12 4 19z"/>',
  heartFill: '<path d="M12 20.6s-7.4-4.7-9.7-8.8C.9 8.4 2.6 4.8 6.3 4.8c2.1 0 3.4 1.3 4 2.4.6-1.1 1.9-2.4 4-2.4 3.7 0 5.4 3.6 4 7C19.4 15.9 12 20.6 12 20.6z"/>',
  heartBrand: '<path d="M12 20.6s-7.4-4.7-9.7-8.8C.9 8.4 2.6 4.8 6.3 4.8c2.1 0 3.4 1.3 4 2.4.6-1.1 1.9-2.4 4-2.4 3.7 0 5.4 3.6 4 7C19.4 15.9 12 20.6 12 20.6z"/>',
};

export function icon(name, { size = 24, cls = "", stroke = 2 } = {}) {
  if (FILL[name]) {
    return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true">${FILL[name]}</svg>`;
  }
  const body = STROKE[name] || "";
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// Mapa de tipos de memória -> ícone
export const TYPE_ICON_NAME = { photo: "camera", print: "image", video: "film", audio: "music", text: "message" };
