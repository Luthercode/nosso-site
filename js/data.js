// =====================================================================
//  data.js — Lê TUDO do data/config.json (chaves em português).
//  Os arquivos em data/months/*.json são opcionais e, se existirem,
//  entram como meses adicionais. Mídias ficam em assets/media/.
// =====================================================================

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const TYPE_MAP = { foto: "photo", print: "print", video: "video", audio: "audio", texto: "text",
  photo: "photo", text: "text" };

async function fetchJSON(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

// ---------- normalizadores (aceitam PT e EN) ----------
function normMemory(r, j, monthId, monthLabel) {
  return {
    id: r.id || `${monthId}-${j}`,
    type: TYPE_MAP[r.tipo || r.type] || "text",
    title: r.titulo ?? r.title ?? "",
    date: r.data ?? r.date ?? "",
    src: r.arquivo ?? r.src ?? "",
    text: r.texto ?? r.text ?? "",
    tags: r.tags || [],
    monthId, monthLabel,
  };
}
function normMonth(raw, order) {
  const id = raw.id || `mes${order + 1}`;
  const label = raw.titulo ?? raw.label ?? id;
  const L = raw.carta || raw.letter;
  const S = raw.musica || raw.song;
  return {
    id, label, _order: order,
    subtitle: raw.subtitulo ?? raw.subtitle ?? "",
    cover: raw.capa ?? raw.cover ?? "",
    color: raw.cor ?? raw.color ?? "#1db954",
    memories: (raw.memorias || raw.memories || []).map((r, j) => normMemory(r, j, id, label)),
    letter: L ? { title: L.titulo ?? L.title ?? "", date: L.data ?? L.date ?? "", text: L.texto ?? L.text ?? "" } : null,
    song: S ? { title: S.titulo ?? S.title ?? "", artist: S.artista ?? S.artist ?? "", reason: S.motivo ?? S.reason ?? "", url: S.url ?? "", file: S.arquivo ?? S.file ?? "" } : null,
    achievements: (raw.conquistas || raw.achievements || []).map((a) => ({
      name: a.nome ?? a.name ?? "", icon: a.icone ?? a.icon ?? "🏆", date: a.data ?? a.date ?? "",
      description: a.descricao ?? a.description ?? "", rarity: a.raridade ?? a.rarity ?? "Conquista",
    })),
    games: raw.jogos || raw.games || [],
    movies: raw.filmes || raw.movies || [],
    stats: { callHours: raw.horasEmCall ?? raw.stats?.callHours ?? 0, memes: raw.memes ?? raw.stats?.memes ?? 0 },
    memeOfMonth: raw.memeDoMes ?? raw.memeOfMonth ?? "",
    bestMoment: raw.melhorMomento ?? raw.bestMoment ?? "",
  };
}
function normPlaylists(arr) {
  return (arr || []).map((p) => ({
    id: p.id, emoji: p.emoji || "🎵",
    name: p.nome ?? p.name ?? "", description: p.descricao ?? p.description ?? "",
    tags: p.tags || [], gradient: p.gradiente || p.gradient,
  }));
}
function normStory(raw) {
  if (!raw) return null;
  const a = raw.album || raw;
  return {
    album: {
      id: a.id || "album", emoji: a.emoji || "",
      title: a.titulo ?? a.title ?? "", description: a.descricao ?? a.description ?? "",
      year: a.ano ?? a.year ?? "", gradient: a.gradiente || a.gradient,
    },
    scenes: (raw.cenas || raw.scenes || a.cenas || a.scenes || []).map((s) => ({
      text: s.texto ?? s.text ?? "", big: s.grande ?? s.big ?? false,
      media: (s.midia || s.media) ? { type: TYPE_MAP[(s.midia || s.media).tipo || (s.midia || s.media).type] || "image", src: (s.midia || s.media).arquivo ?? (s.midia || s.media).src ?? "" } : null,
    })),
  };
}
function normFuture(raw) {
  raw = raw || {};
  return {
    places: (raw.lugares || raw.places || []).map((p) => ({ name: p.nome ?? p.name ?? "", x: p.x, y: p.y, done: p.realizado ?? p.done ?? false })),
    goals: (raw.metas || raw.goals || []).map((g) => ({ title: g.titulo ?? g.title ?? "", description: g.descricao ?? g.description ?? "", done: g.feito ?? g.done ?? false, date: g.data ?? g.date ?? "" })),
  };
}
function normSecrets(arr) {
  return (arr || []).map((s, i) => ({
    id: s.id || `secret-${i}`, type: TYPE_MAP[s.tipo || s.type] || "text",
    title: s.titulo ?? s.title ?? "", text: s.texto ?? s.text ?? "",
    src: s.arquivo ?? s.src ?? "", date: s.data ?? s.date ?? "",
  }));
}

// meses opcionais em arquivos separados
function monthCandidates(startDate) {
  const start = new Date((startDate || "2026-05-20") + "T00:00:00");
  const end = new Date(); end.setMonth(end.getMonth() + 2);
  const out = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= end && out.length < 720) { out.push(`${MONTH_NAMES[d.getMonth()]}${d.getFullYear()}`); d.setMonth(d.getMonth() + 1); }
  return out;
}
async function loadFileMonths(startDate) {
  const ids = monthCandidates(startDate);
  const results = await Promise.all(ids.map((id) => fetchJSON(`data/months/${id}.json`)));
  return results.map((m, i) => (m ? { ...m, id: m.id || ids[i] } : null)).filter(Boolean);
}

export async function loadAll() {
  const config = (await fetchJSON("data/config.json")) || {};

  // ----- meses: do config + arquivos opcionais (sem duplicar id) -----
  const configMonths = (config.meses || config.months || []).map((m, i) => normMonth(m, i));
  const fileRaw = await loadFileMonths(config.startDate);
  const seen = new Set(configMonths.map((m) => m.id));
  const extraMonths = fileRaw.filter((m) => !seen.has(m.id)).map((m, i) => normMonth(m, configMonths.length + i));
  const months = [...configMonths, ...extraMonths].sort((a, b) => a._order - b._order);

  const memories = months.flatMap((m) => m.memories || []);
  memories.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  const achievements = months.flatMap((m) => (m.achievements || []).map((a) => ({ ...a, monthLabel: m.label })));
  achievements.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  // ----- trilha sonora -----
  const cfgMusic = config.musica || {};
  const music = (cfgMusic.lista || []).map((t, i) => ({
    id: t.id || `mus-${i}`, title: t.titulo ?? t.title ?? "Música", artist: t.artista ?? t.artist ?? "",
    file: t.arquivo ?? t.file ?? "", url: t.url ?? "", cover: t.capa ?? t.cover ?? "",
    reason: t.motivo ?? t.reason ?? "", monthLabel: "", date: t.date ?? "",
  }));

  // ----- demais seções: config primeiro, arquivos antigos como reserva -----
  const playlists = normPlaylists(config.playlists || (await fetchJSON("data/playlists.json"))?.playlists);
  const story = normStory(config.album || (await fetchJSON("data/story.json")));
  const future = normFuture(config.futuro || (await fetchJSON("data/future.json")));
  const secrets = normSecrets(config.segredos || (await fetchJSON("data/secrets.json"))?.items);

  const stats = computeStats(config, months, memories);
  stats.songs = music.length;

  return {
    config, months, memories, achievements, playlists, story, future, secrets, music,
    musicMeta: { name: cfgMusic.nome || "Trilha Sonora", description: cfgMusic.descricao || "", cover: cfgMusic.capa || "" },
    stats,
  };
}

export function computeStats(config, months, memories) {
  const count = (type) => memories.filter((m) => m.type === type).length;
  let callHours = 0, memes = 0, letters = 0, songs = 0, achievements = 0;
  const games = new Set(), movies = [];
  for (const m of months) {
    callHours += m.stats?.callHours || 0;
    memes += m.stats?.memes || 0;
    (m.games || []).forEach((g) => games.add(g));
    (m.movies || []).forEach((mv) => movies.push(mv));
    if (m.letter?.text) letters++;
    if (m.song?.title) songs++;
    achievements += (m.achievements || []).length;
  }
  return {
    days: daysSince(config.startDate), photos: count("photo"), videos: count("video"),
    prints: count("print"), audios: count("audio"), memories: memories.length,
    callHours, memes, games: [...games], movies, letters, songs, achievements, albums: months.length,
  };
}

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  const start = new Date(dateStr + "T00:00:00");
  if (isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}

export function elapsedParts(dateStr) {
  const start = new Date((dateStr || "") + "T00:00:00");
  if (isNaN(start)) return { years: 0, months: 0, days: 0, hours: 0, totalDays: 0 };
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.max(0, Math.floor((now - start) / 86400000));
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), hours: now.getHours(), totalDays };
}
