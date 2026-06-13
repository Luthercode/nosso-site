// =====================================================================
//  app.js — Nossa História (clone do Spotify, com player de música real).
//  Você só edita os JSONs em /data e as mídias em /assets.
// =====================================================================
import { loadAll, elapsedParts } from "./data.js";
import { icon, TYPE_ICON_NAME } from "./icons.js";

const $ = (s, r = document) => r.querySelector(s);
const els = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const TYPE_LABEL = { photo: "Foto", print: "Print", video: "Vídeo", audio: "Áudio", text: "Momento" };
const typeIcon = (type, size = 20) => icon(TYPE_ICON_NAME[type] || "image", { size });
const heartHTML = (on, size = 18) => icon(on ? "heartFill" : "heart", { size });

const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return isNaN(d) ? s : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};
const ACCENTS = {
  home: "#534b8c", library: "#1f7a4d", playlists: "#7c4dff", playlist: "#7c4dff", music: "#1f7a4d",
  albums: "#1db954", album: "#1db954", memories: "#1db954", letters: "#be4a78",
  achievements: "#9c7d1e", wrapped: "#7c4dff", future: "#3949ab", secrets: "#3a3a44",
  search: "#2a2a2a", story: "#15623a",
};

// ---------- storage ----------
const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let FAVS = new Set(store.get("ns_favs", []));            // memórias favoritas
let FAV_TRACKS = new Set(store.get("ns_fav_tracks", [])); // músicas curtidas
let RECENTS = store.get("ns_recents", []);
let SECRET_UNLOCKED = store.get("ns_secret", false);
let sfxOn = store.get("ns_sfx", true);
let libFilter = "tudo";

let DB = null;

// ---------- player de música ----------
let MUSIC = [];
let MIDX = 0;
let isPlaying = false;
let shuffle = store.get("ns_shuffle", false);
let repeat = store.get("ns_repeat", 0); // 0 off · 1 all · 2 one
let audio = null;

// =====================================================================
//  Boot
// =====================================================================
(async function init() {
  injectIcons();
  DB = await loadAll();
  MUSIC = DB.music;
  MIDX = Math.max(0, MUSIC.findIndex((t) => t.id === store.get("ns_midx_id", null)));

  $("#logoText").textContent = DB.config.appName || "Nossa História";
  buildSidebarLibrary();
  setupAudio();
  setupTopbar();
  setupNowPanel();
  setupModal();
  setupEasterEgg();
  setupScroll();
  setupInteractions();
  startCounters();

  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/home";
  route();
  loadTrack(MIDX, false);
})();

function injectIcons(root = document) {
  els("[data-icon]", root).forEach((e) => {
    if (e.dataset.done) return;
    e.innerHTML = icon(e.dataset.icon, { size: +e.dataset.iconSize || 20 });
    e.dataset.done = "1";
  });
}

// =====================================================================
//  Router
// =====================================================================
const routes = {
  home: viewHome, library: viewLibrary, playlists: viewPlaylists, playlist: viewPlaylist,
  albums: viewAlbums, album: viewAlbum, story: viewStory, memories: viewMemories,
  letters: viewLetters, achievements: viewAchievements, wrapped: viewWrapped,
  future: viewFuture, secrets: viewSecrets, search: viewSearch, music: viewMusic,
};

function route() {
  const parts = location.hash.replace(/^#\//, "").split("/");
  const name = parts[0] || "home";
  const arg = parts[1] ? decodeURIComponent(parts[1]) : undefined;
  const fn = routes[name] || viewHome;

  setAccent(ACCENTS[name] || "#333");
  const view = $("#view");
  view.scrollTop = 0;
  view.innerHTML = "";
  const inner = el("div", "view__inner fade-in");
  inner.append(fn(arg));
  view.append(inner);
  onScroll();
  revealScan(inner);

  els(".snav").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
  els(".bnav").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
}

// Animações de entrada ao rolar (cascata estilo moderno)
const revObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revObserver.unobserve(e.target); }
    }), { threshold: 0.06, rootMargin: "0px 0px -30px 0px" })
  : null;
function revealScan(root) {
  if (!revObserver) return;
  els(".shelf, .pagehero, .actionbar, .bigrow, .cardrow, .tracklist, .ach-list, .stats-grid, .letters-grid, .map, .goal, .wrapped-cover, .secret-locked, .finale-cta", root)
    .forEach((n, i) => { n.classList.add("rev"); n.style.setProperty("--rev-i", i % 8); revObserver.observe(n); });
}
function setAccent(color) { document.documentElement.style.setProperty("--accent", color); }

// =====================================================================
//  Mídia
// =====================================================================
function mediaEl(mem, { thumb = false } = {}) {
  const ph = () => mem.type === "text"
    ? el("div", "placeholder placeholder--text")
    : el("div", "placeholder", typeIcon(mem.type, thumb ? 22 : 56));
  if (!mem.src || mem.type === "text") return ph();
  if (mem.type === "video") {
    const v = el("video");
    v.src = mem.src; v.controls = !thumb; v.muted = thumb; v.playsInline = true; v.preload = "metadata";
    v.onerror = () => v.replaceWith(ph());
    return v;
  }
  if (mem.type === "audio") {
    if (thumb) return ph();
    const a = el("audio"); a.src = mem.src; a.controls = true; a.preload = "metadata";
    a.onerror = () => a.replaceWith(ph());
    return a;
  }
  const img = el("img"); img.src = mem.src; img.loading = "lazy"; img.alt = mem.title || "";
  img.onerror = () => img.replaceWith(ph());
  return img;
}
function gradientCss(g, fallback = ["#1db954", "#0a3d1f"]) {
  const [a, b] = Array.isArray(g) && g.length >= 2 ? g : fallback;
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// =====================================================================
//  ENGINE DE MÚSICA
// =====================================================================
function setupAudio() {
  audio = $("#audioEl");
  audio.volume = store.get("ns_vol", 0.8);
  $("#volume").value = audio.volume * 100;
  updateVolumeIcon();

  $("#btnPlay").onclick = playPause;
  $("#btnMiniPlay").onclick = (e) => { e.stopPropagation(); playPause(); };
  $("#btnPrev").onclick = prevTrack;
  $("#btnNext").onclick = () => nextTrack(true);
  $("#playerLike").onclick = (e) => { e.stopPropagation(); const id = MUSIC[MIDX]?.id; if (!id) return; const will = !FAV_TRACKS.has(id); toggleFavTrack(id); likeFx($("#playerLike"), will); };
  $("#playerCover").onclick = openNowPlaying;
  $("#playerMeta").onclick = openNowPlaying;
  $("#btnNowPanel").onclick = () => { const open = $("#app").classList.toggle("now-open"); if (open) renderNowPanel(); };
  $("#btnTimeMachine").onclick = timeMachine;
  $("#player").addEventListener("click", (e) => {
    if (window.matchMedia("(max-width: 760px)").matches && !e.target.closest(".player__like, .player__miniplay"))
      openNowPlaying();
  });

  $("#btnShuffle").classList.toggle("active", shuffle);
  $("#btnShuffle").onclick = () => { shuffle = !shuffle; $("#btnShuffle").classList.toggle("active", shuffle); store.set("ns_shuffle", shuffle); };
  applyRepeatIcon();
  $("#btnRepeat").onclick = () => { repeat = (repeat + 1) % 3; store.set("ns_repeat", repeat); applyRepeatIcon(); };

  const vol = $("#volume");
  vol.addEventListener("input", () => { audio.volume = vol.value / 100; store.set("ns_vol", audio.volume); updateVolumeIcon(); });
  $("#btnVolume").onclick = () => {
    if (audio.volume > 0) { audio._prev = audio.volume; audio.volume = 0; }
    else { audio.volume = audio._prev || 0.8; }
    vol.value = audio.volume * 100; store.set("ns_vol", audio.volume); updateVolumeIcon();
  };

  // seek
  const bar = $("#playerBar");
  let seeking = false;
  const ratio = (e) => { const r = bar.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
  const preview = (rt) => { $("#playerProgress").style.width = rt * 100 + "%"; if (audio.duration) $("#playerPos").textContent = fmtTime(rt * audio.duration); };
  bar.addEventListener("pointerdown", (e) => { if (!audio.duration) return; seeking = true; bar.setPointerCapture?.(e.pointerId); preview(ratio(e)); });
  bar.addEventListener("pointermove", (e) => { if (seeking) preview(ratio(e)); });
  const endSeek = (e) => { if (!seeking) return; seeking = false; if (audio.duration) audio.currentTime = ratio(e) * audio.duration; };
  bar.addEventListener("pointerup", endSeek);
  window.addEventListener("pointerup", endSeek);

  audio.addEventListener("timeupdate", () => {
    if (seeking || !audio.duration) return;
    $("#playerProgress").style.width = (audio.currentTime / audio.duration) * 100 + "%";
    $("#playerPos").textContent = fmtTime(audio.currentTime);
  });
  audio.addEventListener("loadedmetadata", () => { $("#playerTotal").textContent = fmtTime(audio.duration); });
  audio.addEventListener("play", () => { isPlaying = true; updatePlayIcons(); highlightPlayingRows(); });
  audio.addEventListener("pause", () => { isPlaying = false; updatePlayIcons(); highlightPlayingRows(); });
  audio.addEventListener("ended", onEnded);
}

function loadTrack(idx, autoplay) {
  if (!MUSIC.length) return;
  MIDX = (idx + MUSIC.length) % MUSIC.length;
  const t = MUSIC[MIDX];
  store.set("ns_midx_id", t.id);
  if (t.file) { audio.src = t.file; if (autoplay) audio.play().catch(() => {}); }
  else { audio.removeAttribute("src"); try { audio.load(); } catch {} isPlaying = false; }
  updateTrackUI();
}
function playPause() {
  const t = MUSIC[MIDX];
  if (!t) return;
  if (t.file) { if (audio.paused) { audio.play().catch(() => {}); sfx("play"); } else { audio.pause(); sfx("click"); } }
  else if (t.url) { window.open(t.url, "_blank"); }
  else showToast(icon("music", { size: 22 }), "Sem áudio ainda", "Adicione a música no config.json");
}
function nextTrack(user) {
  if (!MUSIC.length) return;
  let idx;
  if (shuffle) idx = Math.floor(Math.random() * MUSIC.length);
  else idx = MIDX + 1;
  if (!user && !shuffle && MIDX === MUSIC.length - 1 && repeat === 0) { return; }
  loadTrack(idx, true);
}
function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack(MIDX - 1, true);
}
function onEnded() {
  if (repeat === 2) { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  if (MIDX === MUSIC.length - 1 && repeat === 0) { isPlaying = false; updatePlayIcons(); return; }
  nextTrack(false);
}
function updateTrackUI() {
  const t = MUSIC[MIDX];
  if (!t) return;
  $("#playerTitle").textContent = t.title || "—";
  $("#playerSub").textContent = [t.artist, t.monthLabel].filter(Boolean).join(" · ") || "Trilha sonora";
  const cover = $("#playerCover");
  cover.innerHTML = "";
  if (t.cover) { const im = el("img"); im.src = t.cover; im.onerror = () => (cover.innerHTML = icon("music", { size: 20 })); cover.append(im); }
  else cover.innerHTML = icon("music", { size: 20 });
  setHeart($("#playerLike"), FAV_TRACKS.has(t.id));
  if (!t.file) { $("#playerTotal").textContent = t.url ? "link" : "--:--"; $("#playerProgress").style.width = "0%"; $("#playerPos").textContent = "0:00"; }
  updatePlayIcons();
  highlightPlayingRows();
  if ($("#app").classList.contains("now-open")) renderNowPanel();
}
function updatePlayIcons() {
  const ic = isPlaying ? "pause" : "play";
  $("#btnPlay").innerHTML = icon(ic, { size: 18 });
  $("#btnMiniPlay").innerHTML = icon(ic, { size: 22 });
  $("#app").classList.toggle("is-audio-playing", isPlaying);
}
function applyRepeatIcon() {
  const b = $("#btnRepeat");
  b.classList.toggle("active", repeat > 0);
  b.innerHTML = icon(repeat === 2 ? "repeatOne" : "repeat", { size: 18 });
}
function updateVolumeIcon() { $("#btnVolume").innerHTML = icon(audio.volume === 0 ? "volumeOff" : "volume", { size: 18 }); }
function setHeart(btn, on) { if (!btn) return; btn.classList.toggle("liked", on); btn.innerHTML = heartHTML(on, +btn.dataset.iconSize || 18); }

function toggleFavTrack(id) {
  if (!id) return;
  FAV_TRACKS.has(id) ? FAV_TRACKS.delete(id) : FAV_TRACKS.add(id);
  store.set("ns_fav_tracks", [...FAV_TRACKS]);
  setHeart($("#playerLike"), FAV_TRACKS.has(MUSIC[MIDX]?.id));
  els(`[data-favtrack="${CSS.escape(id)}"]`).forEach((b) => setHeart(b, FAV_TRACKS.has(id)));
}
function highlightPlayingRows() {
  const id = MUSIC[MIDX]?.id;
  els("[data-track]").forEach((row) => {
    const isCur = row.dataset.track === id;
    row.classList.toggle("track--playing", isCur);
    row.classList.toggle("is-playing", isCur && isPlaying);
  });
}
function playTrackId(id) {
  const i = MUSIC.findIndex((t) => t.id === id);
  if (i >= 0) loadTrack(i, true);
}

// =====================================================================
//  Memórias (modal, sem mexer no player de música)
// =====================================================================
function openMemory(mem, kicker = "Memória") {
  if (!mem) return;
  pushRecent(mem.id);
  const c = el("div");
  c.append(el("div", "mem-kicker", `${esc(kicker)} · ${esc(mem.monthLabel || "")}`));
  c.append(el("div", "mem-title", esc(mem.title || "Memória")));
  if (mem.date) c.append(el("div", "mem-date", fmtDate(mem.date)));
  if (mem.type !== "text") { const box = el("div", "mem-media"); box.append(mediaEl(mem)); c.append(box); }
  if (mem.text) c.append(el("p", "mem-text" + (mem.type === "text" ? " mem-text--solo" : ""), esc(mem.text)));
  const like = el("button", "mem-like" + (FAVS.has(mem.id) ? " liked" : ""));
  like.innerHTML = heartHTML(FAVS.has(mem.id), 24);
  like.onclick = () => { const will = !FAVS.has(mem.id); toggleFav(mem.id); like.classList.toggle("liked"); like.innerHTML = heartHTML(FAVS.has(mem.id), 24); likeFx(like, will); };
  c.append(like);
  openModal(c);
}
function toggleFav(id) {
  FAVS.has(id) ? FAVS.delete(id) : FAVS.add(id);
  store.set("ns_favs", [...FAVS]);
  els(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => setHeart(b, FAVS.has(id)));
  if (location.hash === "#/playlist/favoritos") route();
}
function pushRecent(id) { RECENTS = [id, ...RECENTS.filter((r) => r !== id)].slice(0, 10); store.set("ns_recents", RECENTS); }

// =====================================================================
//  Componentes
// =====================================================================
function shelf(title, moreHref) {
  const s = el("section", "shelf");
  const head = el("div", "shelf__head");
  const h = el("h2", "shelf__title");
  if (moreHref) { const a = el("a", null, esc(title)); a.href = moreHref; h.append(a); } else h.textContent = title;
  head.append(h);
  if (moreHref) { const a = el("a", "shelf__more", "Mostrar tudo"); a.href = moreHref; head.append(a); }
  s.append(head);
  return s;
}
function playlistCard(pl) {
  const card = el("div", "card");
  const art = el("div", "card__art", pl.emoji);
  art.style.background = gradientCss(pl.gradient);
  card.append(art);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); openMemory(playlistMemories(pl)[0], pl.name); };
  card.append(play, el("div", "card__title", esc(pl.name)), el("div", "card__sub", esc(pl.description || "")));
  card.onclick = () => (location.hash = `#/playlist/${pl.id}`);
  return card;
}
function albumCard(m) {
  const card = el("div", "card");
  const art = el("div", "card__art");
  art.style.background = `linear-gradient(135deg, ${m.color || "#1db954"}, #0a0a0d)`;
  if (m.cover) { const img = el("img"); img.src = m.cover; img.loading = "lazy"; img.onerror = () => (art.innerHTML = icon("disc", { size: 40 })); art.append(img); }
  else art.innerHTML = icon("disc", { size: 40 });
  card.append(art);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); playAlbum(m); };
  card.append(play, el("div", "card__title", esc(m.label || m.id)), el("div", "card__sub", esc(m.subtitle || "")));
  card.onclick = () => (location.hash = `#/album/${m.id}`);
  return card;
}
function playAlbum(m) {
  const i = MUSIC.findIndex((t) => t.id === `song-${m.id}` || (m.song?.title && t.title === m.song.title) || (t.monthLabel && t.monthLabel === m.label));
  if (i >= 0) loadTrack(i, true);
  else openMemory((m.memories || [])[0], m.label || m.id);
}
function memoryCard(mem) {
  const card = el("div", "card");
  const art = el("div", "card__art");
  art.style.background = "linear-gradient(135deg,#2a2a2a,#121212)";
  if (mem.src && mem.type !== "text" && mem.type !== "audio") art.append(mediaEl(mem, { thumb: true }));
  else if (mem.type === "text") art.classList.add("placeholder--text");
  else { art.style.color = "#fff"; art.innerHTML = typeIcon(mem.type, 40); }
  card.append(art);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); openMemory(mem); };
  card.append(play, el("div", "card__title", esc(mem.title || "Memória")), el("div", "card__sub", `${TYPE_LABEL[mem.type] || ""} · ${esc(mem.monthLabel || "")}`));
  card.onclick = () => openMemory(mem);
  return card;
}
function storyCard() {
  const a = DB.story?.album; if (!a) return el("span");
  const card = el("div", "card");
  const art = el("div", "card__art", a.emoji || "");
  if (!a.emoji) { art.style.color = "#fff"; art.innerHTML = icon("gamepad", { size: 40 }); }
  art.style.background = gradientCss(a.gradient);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); location.hash = "#/story"; };
  card.append(art, play, el("div", "card__title", esc(a.title)), el("div", "card__sub", esc(a.description || "")));
  card.onclick = () => (location.hash = "#/story");
  return card;
}
function playlistGrid(list) { const g = el("div", "cardrow"); list.forEach((pl) => g.append(playlistCard(pl))); return g; }
function albumGrid({ withStory = true } = {}) {
  const g = el("div", "cardrow");
  if (withStory && DB.story) g.append(storyCard());
  DB.months.forEach((m) => g.append(albumCard(m)));
  return g;
}
function playlistMemories(pl) {
  if ((pl.tags || []).includes("__favorites__")) return DB.memories.filter((m) => FAVS.has(m.id));
  return DB.memories.filter((m) => (m.tags || []).some((t) => (pl.tags || []).includes(t)));
}

function tracklist(mems, emptyMsg) {
  const wrap = el("div", "tracklist");
  if (!mems.length) { wrap.append(el("p", "empty", emptyMsg || "Nada por aqui ainda.")); return wrap; }
  const head = el("div", "tl-head");
  head.append(el("span", null, "#"), el("span"), el("span", null, "Título"), el("span", null, "Data"), el("span"));
  wrap.append(head);
  mems.forEach((mem, i) => {
    const row = el("div", "track");
    const num = el("div", "track__num");
    num.append(el("span", "n", String(i + 1)));
    const pm = el("span", "play-mini"); pm.innerHTML = icon("play", { size: 12 }); num.append(pm);
    row.append(num);
    const art = el("div", "track__art"); art.append(mediaEl(mem, { thumb: true })); row.append(art);
    const main = el("div", "track__main");
    main.append(el("div", "track__title", esc(mem.title || "Memória")));
    main.append(el("div", "track__sub", `${TYPE_LABEL[mem.type] || "Memória"} · ${esc(mem.monthLabel || "")}`));
    row.append(main);
    row.append(el("div", "track__date", fmtDate(mem.date)));
    const like = el("button", "track__like" + (FAVS.has(mem.id) ? " liked" : ""));
    like.dataset.fav = mem.id; like.dataset.iconSize = 18; like.innerHTML = heartHTML(FAVS.has(mem.id), 18);
    like.onclick = (e) => { e.stopPropagation(); const will = !FAVS.has(mem.id); toggleFav(mem.id); likeFx(like, will); };
    row.append(like);
    row.onclick = () => openMemory(mem);
    wrap.append(row);
  });
  return wrap;
}

// lista de FAIXAS DE MÚSICA
function musicTracklist(tracks) {
  const wrap = el("div", "tracklist");
  if (!tracks.length) { wrap.append(el("p", "empty", "Adicione músicas em data/music.json.")); return wrap; }
  const head = el("div", "tl-head");
  head.append(el("span", null, "#"), el("span"), el("span", null, "Título"), el("span", null, "Mês"), el("span"));
  wrap.append(head);
  tracks.forEach((t, i) => {
    const row = el("div", "track");
    row.dataset.track = t.id;
    const num = el("div", "track__num");
    num.append(el("span", "n", String(i + 1)));
    const pm = el("span", "play-mini"); pm.innerHTML = icon("play", { size: 12 }); num.append(pm);
    num.append(el("span", "eq", "<i></i><i></i><i></i><i></i>"));
    row.append(num);
    const art = el("div", "track__art");
    if (t.cover) { const im = el("img"); im.src = t.cover; im.onerror = () => (art.innerHTML = icon("music", { size: 18 })); art.append(im); }
    else { art.style.color = "var(--txt-2)"; art.innerHTML = icon("music", { size: 18 }); }
    row.append(art);
    const main = el("div", "track__main");
    main.append(el("div", "track__title", esc(t.title)));
    main.append(el("div", "track__sub", `${esc(t.artist || "")}${t.reason ? " · " + esc(t.reason) : ""}`));
    row.append(main);
    row.append(el("div", "track__date", esc(t.monthLabel || fmtDate(t.date))));
    const like = el("button", "track__like" + (FAV_TRACKS.has(t.id) ? " liked" : ""));
    like.dataset.favtrack = t.id; like.dataset.iconSize = 18; like.innerHTML = heartHTML(FAV_TRACKS.has(t.id), 18);
    like.onclick = (e) => { e.stopPropagation(); const will = !FAV_TRACKS.has(t.id); toggleFavTrack(t.id); likeFx(like, will); };
    row.append(like);
    row.onclick = () => playTrackId(t.id);
    wrap.append(row);
  });
  setTimeout(highlightPlayingRows, 0);
  return wrap;
}

function pagehero({ kind, title, meta, art, gradient }) {
  const hero = el("div", "pagehero");
  const a = el("div", "pagehero__art");
  if (gradient) a.style.background = gradientCss(gradient);
  if (typeof art === "string") a.innerHTML = art;
  else if (art) a.append(art);
  const info = el("div", "pagehero__info");
  info.append(el("div", "pagehero__kind", esc(kind)));
  info.append(el("h1", "pagehero__title", esc(title)));
  if (meta) info.append(el("div", "pagehero__meta", meta));
  hero.append(a, info);
  return hero;
}
function actionbar(onPlay) {
  const bar = el("div", "actionbar");
  if (onPlay) { const p = el("button", "play-big"); p.innerHTML = icon("play", { size: 24 }); p.onclick = onPlay; bar.append(p); }
  return bar;
}

// =====================================================================
//  Views
// =====================================================================
function viewHome() {
  const root = el("div");
  setTopbarTitle("");
  const h = new Date().getHours();
  const period = h < 6 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  root.append(el("h1", "h-greet", `${period}, ${esc(DB.config.greetingName || "meu amor")} ❤️`));

  const big = el("div", "bigrow");
  shortcutItems().forEach((it) => {
    const card = el("div", "bigcard");
    const art = el("div", "bigcard__art"); art.style.background = it.art; art.style.color = "#fff";
    if (it.img) { const im = el("img"); im.src = it.img; im.onerror = () => (art.innerHTML = icon(it.iconName, { size: 26 })); art.append(im); }
    else art.innerHTML = icon(it.iconName, { size: 26 });
    card.append(art, el("div", "bigcard__title", esc(it.title)));
    const play = el("button", "bigcard__play"); play.innerHTML = icon("play", { size: 18 });
    play.onclick = (e) => { e.stopPropagation(); it.onclick(); };
    card.append(play);
    card.onclick = it.onclick;
    big.append(card);
  });
  root.append(big);

  const recents = RECENTS.map((id) => DB.memories.find((m) => m.id === id)).filter(Boolean);
  if (recents.length) {
    const s = shelf("Tocados recentemente", "#/memories");
    const g = el("div", "cardrow"); recents.slice(0, 6).forEach((mem) => g.append(memoryCard(mem)));
    s.append(g); root.append(s);
  }
  const sM = shelf("Trilha sonora", "#/music"); const gm = el("div", "cardrow");
  gm.append(musicHeroCard()); DB.music.slice(0, 5).forEach((t) => gm.append(songCard(t))); sM.append(gm); root.append(sM);

  const s2 = shelf("Feito para vocês", "#/playlists"); s2.append(playlistGrid(DB.playlists.slice(0, 6))); root.append(s2);
  const s3 = shelf("Nossos álbuns", "#/albums"); s3.append(albumGrid()); root.append(s3);
  return root;
}
function songCard(t) {
  const card = el("div", "card");
  const art = el("div", "card__art"); art.style.background = "linear-gradient(135deg,#1f7a4d,#0a0a0d)"; art.style.color = "#fff";
  if (t.cover) { const im = el("img"); im.src = t.cover; im.onerror = () => (art.innerHTML = icon("music", { size: 38 })); art.append(im); }
  else art.innerHTML = icon("music", { size: 38 });
  card.append(art);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); playTrackId(t.id); };
  card.append(play, el("div", "card__title", esc(t.title)), el("div", "card__sub", esc(t.artist || t.monthLabel || "")));
  card.onclick = () => playTrackId(t.id);
  return card;
}
function musicHeroCard() {
  const card = el("div", "card");
  const art = el("div", "card__art"); art.style.background = "linear-gradient(135deg,#7c4dff,#1ed760)"; art.style.color = "#fff";
  art.innerHTML = icon("music", { size: 40 });
  card.append(art);
  const play = el("button", "card__play"); play.innerHTML = icon("play", { size: 20 });
  play.onclick = (e) => { e.stopPropagation(); loadTrack(0, true); };
  card.append(play, el("div", "card__title", "Trilha Sonora"), el("div", "card__sub", "Tocar tudo, em ordem"));
  card.onclick = () => (location.hash = "#/music");
  return card;
}

function shortcutItems() {
  const items = [
    { iconName: "gamepad", title: "Roblox Origins", art: "linear-gradient(135deg,#1db954,#062b14)", onclick: () => (location.hash = "#/story") },
    { iconName: "heartFill", title: "Memórias Favoritas", art: "linear-gradient(135deg,#7c4dff,#1ed760)", onclick: () => (location.hash = "#/playlist/favoritos") },
    { iconName: "music", title: "Trilha Sonora", art: "linear-gradient(135deg,#1f7a4d,#0a3d1f)", onclick: () => (location.hash = "#/music") },
    { iconName: "mail", title: "Cartas", art: "linear-gradient(135deg,#f06292,#3d0a1f)", onclick: () => (location.hash = "#/letters") },
    { iconName: "chart", title: "Nosso Wrapped", art: "linear-gradient(135deg,#f06292,#7c4dff)", onclick: () => (location.hash = "#/wrapped") },
    { iconName: "globe", title: "Nosso Futuro", art: "linear-gradient(135deg,#3949ab,#0a1a3d)", onclick: () => (location.hash = "#/future") },
  ];
  const last = DB.months[DB.months.length - 1];
  if (last) items.push({ iconName: "disc", title: last.label || last.id, img: last.cover, art: `linear-gradient(135deg,${last.color || "#1db954"},#0a0a0d)`, onclick: () => (location.hash = `#/album/${last.id}`) });
  return items;
}

function viewLibrary() {
  const root = el("div");
  setTopbarTitle("Sua Biblioteca");
  root.append(el("h1", "h-greet", "Sua Biblioteca"));
  const s0 = shelf("Tudo da nossa história");
  const g = el("div", "cardrow");
  destinations().forEach((d) => {
    const card = el("div", "card");
    const art = el("div", "card__art"); art.style.background = d.art; art.style.color = "#fff";
    art.innerHTML = icon(d.unlock && SECRET_UNLOCKED ? "unlock" : d.iconName, { size: 34 });
    card.append(art, el("div", "card__title", esc(d.title)), el("div", "card__sub", esc(d.sub)));
    card.onclick = () => (location.hash = d.href);
    g.append(card);
  });
  s0.append(g); root.append(s0);
  const s1 = shelf("Playlists", "#/playlists"); s1.append(playlistGrid(DB.playlists)); root.append(s1);
  const s2 = shelf("Álbuns", "#/albums"); s2.append(albumGrid()); root.append(s2);
  const s3 = shelf("Estatísticas", "#/wrapped"); s3.append(statsGrid()); root.append(s3);
  return root;
}
function destinations() {
  return [
    { iconName: "music", title: "Trilha Sonora", sub: `${DB.music.length} músicas`, href: "#/music", art: "linear-gradient(135deg,#1f7a4d,#0a3d1f)" },
    { iconName: "music", title: "Playlists", sub: "Nossos momentos", href: "#/playlists", art: "linear-gradient(135deg,#7c4dff,#1a0a3d)" },
    { iconName: "disc", title: "Álbuns", sub: "Cada mês um álbum", href: "#/albums", art: "linear-gradient(135deg,#1db954,#062b14)" },
    { iconName: "image", title: "Memórias", sub: `${DB.memories.length} guardadas`, href: "#/memories", art: "linear-gradient(135deg,#3a3a3a,#000)" },
    { iconName: "mail", title: "Cartas", sub: `${DB.stats.letters} cartas`, href: "#/letters", art: "linear-gradient(135deg,#f06292,#3d0a1f)" },
    { iconName: "trophy", title: "Conquistas", sub: `${DB.stats.achievements} desbloqueadas`, href: "#/achievements", art: "linear-gradient(135deg,#c9a227,#26200a)" },
    { iconName: "chart", title: "Wrapped", sub: "O resumo do casal", href: "#/wrapped", art: "linear-gradient(135deg,#f06292,#7c4dff)" },
    { iconName: "globe", title: "Nosso Futuro", sub: "Metas e sonhos", href: "#/future", art: "linear-gradient(135deg,#3949ab,#0a1a3d)" },
    { iconName: "gamepad", title: "Roblox Origins", sub: "Onde tudo começou", href: "#/story", art: "linear-gradient(135deg,#1db954,#062b14)" },
    { iconName: "lock", unlock: true, title: "Segredos", sub: "Arquivo confidencial", href: "#/secrets", art: "linear-gradient(135deg,#3a3a44,#0a0a0a)" },
  ];
}

function viewPlaylists() {
  const root = el("div"); setTopbarTitle("Playlists");
  root.append(el("h1", "h-greet", "Playlists 🎵"));
  root.append(playlistGrid(DB.playlists));
  return root;
}
function viewPlaylist(id) {
  const pl = DB.playlists.find((p) => p.id === id);
  if (!pl) return el("p", "empty", "Playlist não encontrada.");
  setAccent((pl.gradient || [])[0] || "#7c4dff"); setTopbarTitle(pl.name);
  const mems = playlistMemories(pl);
  const root = el("div");
  const artNode = el("div", null, ""); artNode.style.cssText = "display:grid;place-items:center;color:#fff;width:100%;height:100%";
  artNode.innerHTML = pl.emoji || icon("music", { size: 64 });
  root.append(pagehero({ kind: "Playlist", title: pl.name, art: artNode, gradient: pl.gradient,
    meta: `<span>${esc(pl.description || "")} · ${mems.length} ${mems.length === 1 ? "memória" : "memórias"}</span>` }));
  root.append(actionbar(mems.length ? () => openMemory(mems[0], pl.name) : null));
  root.append(tracklist(mems, pl.id === "favoritos" ? "Favorite memórias com ❤ para vê-las aqui."
    : `Marque a tag "${esc((pl.tags || [])[0] || "")}" em uma memória para ela entrar aqui.`));
  return root;
}

function viewMusic() {
  const root = el("div");
  setTopbarTitle(DB.musicMeta.name || "Trilha Sonora");
  const artNode = el("div"); artNode.style.cssText = "display:grid;place-items:center;color:#fff;width:100%;height:100%;background:linear-gradient(135deg,#7c4dff,#1ed760)";
  artNode.innerHTML = icon("music", { size: 70 });
  if (DB.musicMeta.cover) { const im = el("img"); im.src = DB.musicMeta.cover; im.onerror = () => (artNode.innerHTML = icon("music", { size: 70 })); artNode.innerHTML = ""; artNode.append(im); }
  root.append(pagehero({ kind: "Playlist · Trilha sonora", title: DB.musicMeta.name || "Trilha Sonora",
    art: artNode, meta: `<span>${esc(DB.musicMeta.description || "")} · ${DB.music.length} músicas</span>` }));
  root.append(actionbar(DB.music.length ? () => loadTrack(0, true) : null));
  root.append(musicTracklist(DB.music));
  return root;
}

function viewAlbums() {
  const root = el("div"); setTopbarTitle("Álbuns");
  root.append(el("h1", "h-greet", "Álbuns 📀"));
  root.append(albumGrid());
  return root;
}
function viewAlbum(id) {
  const m = DB.months.find((x) => x.id === id);
  if (!m) return el("p", "empty", "Álbum não encontrado.");
  setAccent(m.color || "#1db954"); setTopbarTitle(m.label || m.id);
  const root = el("div");
  let artNode;
  if (m.cover) { const im = el("img"); im.src = m.cover; im.onerror = () => im.remove(); artNode = im; }
  else { artNode = el("div"); artNode.style.cssText = "display:grid;place-items:center;color:#fff;width:100%;height:100%"; artNode.innerHTML = icon("disc", { size: 64 }); }
  root.append(pagehero({ kind: "Álbum", title: m.label || m.id, art: artNode, gradient: [m.color || "#1db954", "#0a0a0d"],
    meta: `<span>${esc(m.subtitle || "")} · ${(m.memories || []).length} memórias · ${(m.achievements || []).length} conquistas</span>` }));
  root.append(actionbar((m.memories || []).length ? () => playAlbum(m) : null));

  const extras = el("div", "bigrow");
  if (m.letter?.text) {
    const c = el("div", "bigcard");
    const art = el("div", "bigcard__art"); art.style.color = "#fff"; art.innerHTML = icon("mail", { size: 24 });
    c.append(art, el("div", "bigcard__title", esc(m.letter.title || "Carta do mês")));
    c.onclick = () => openLetter(m.letter); extras.append(c);
  }
  if (m.song?.title) {
    const c = el("div", "bigcard");
    const art = el("div", "bigcard__art"); art.style.color = "#fff"; art.innerHTML = icon("music", { size: 24 });
    c.append(art, el("div", "bigcard__title", `${esc(m.song.title)} — ${esc(m.song.artist || "")}`));
    c.onclick = () => playAlbum(m); extras.append(c);
  }
  if (extras.children.length) root.append(extras);
  root.append(tracklist(m.memories || [], "Adicione memórias neste mês."));
  if ((m.achievements || []).length) { const s = shelf("Conquistas deste mês"); s.append(achList(m.achievements)); root.append(s); }
  return root;
}

function viewMemories() {
  const root = el("div"); setTopbarTitle("Memórias");
  root.append(el("h1", "h-greet", "Memórias 📸"));
  root.append(el("p", null, `<span style="color:var(--txt-2)">${DB.memories.length} memórias · curta com ❤</span>`));
  root.append(tracklist(DB.memories, "Adicione memórias nos arquivos de data/months/."));
  return root;
}

function viewLetters() {
  const root = el("div"); setTopbarTitle("Cartas");
  root.append(el("h1", "h-greet", "Cartas 💌"));
  const grid = el("div", "letters-grid");
  const withLetter = DB.months.filter((m) => m.letter?.text);
  if (!withLetter.length) grid.append(el("p", "empty", "As cartas aparecerão aqui."));
  withLetter.forEach((m) => {
    const card = el("div", "letter-card");
    const art = el("div", "letter-card__art"); art.style.color = "#fff"; art.innerHTML = icon("mail", { size: 48 });
    card.append(art);
    card.append(el("div", "letter-card__title", esc(m.letter.title || `Carta de ${m.label}`)));
    card.append(el("div", "letter-card__date", fmtDate(m.letter.date)));
    card.onclick = () => openLetter(m.letter);
    grid.append(card);
  });
  root.append(grid);
  return root;
}
let typeTimer = null;
function openLetter(L) {
  const c = el("div");
  c.append(el("div", "letter-open__kicker", "Carta"));
  c.append(el("div", "letter-open__title", esc(L.title || "Carta")));
  c.append(el("div", "letter-open__date", fmtDate(L.date)));
  const paper = el("div", "letter-open__paper"); c.append(paper);
  openModal(c);
  clearInterval(typeTimer);
  paper.textContent = "";
  const cursor = el("span", "typecursor"); paper.append(cursor);
  const text = L.text || ""; let i = 0;
  typeTimer = setInterval(() => {
    if (i >= text.length) { clearInterval(typeTimer); cursor.remove(); return; }
    cursor.insertAdjacentText("beforebegin", text[i++]);
  }, 22);
}

function achList(items) {
  const wrap = el("div", "ach-list");
  items.forEach((a, i) => {
    const row = el("div", "ach"); row.style.animationDelay = `${i * 0.07}s`;
    row.append(el("div", "ach__icon", a.icon || "🏆"));
    const main = el("div", "ach__main");
    main.append(el("div", "ach__name", esc(a.name || "Conquista")));
    main.append(el("div", "ach__desc", esc(a.description || "")));
    row.append(main);
    const right = el("div", "ach__right");
    right.append(el("span", "ach__rarity", esc(a.rarity || "Conquista")));
    right.append(el("span", "ach__date", fmtDate(a.date)));
    row.append(right);
    wrap.append(row);
  });
  return wrap;
}
function viewAchievements() {
  const root = el("div"); setTopbarTitle("Conquistas");
  root.append(el("h1", "h-greet", "Conquistas 🏆"));
  const all = [...DB.achievements];
  if (SECRET_UNLOCKED) all.push({ name: "Encontrou todos os segredos", icon: "🔓", date: store.get("ns_secret_date", ""), description: "Descobriu o Arquivo Confidencial.", rarity: "Secreta" });
  root.append(el("p", null, `<span style="color:var(--txt-2)">${all.length} conquistas. Estilo Steam.</span>`));
  root.append(all.length ? achList(all) : el("p", "empty", "As conquistas aparecerão aqui."));
  return root;
}

function statsGrid() {
  const s = DB.stats;
  const grid = el("div", "stats-grid");
  [
    ["heart", s.days, "Dias juntos"], ["phone", s.callHours, "Horas em call"], ["camera", s.photos, "Fotos"],
    ["film", s.videos, "Vídeos"], ["mail", s.letters, "Cartas"], ["gamepad", s.games.length, "Jogos"],
    ["music", s.songs, "Músicas"], ["smile", s.memes, "Memes"], ["trophy", s.achievements, "Conquistas"], ["disc", s.albums, "Álbuns"],
  ].forEach(([ic, num, label]) => {
    const c = el("div", "statcard");
    const i = el("div", "statcard__icon"); i.style.color = "var(--green)"; i.innerHTML = icon(ic, { size: 24 });
    c.append(i);
    const n = el("div", "statcard__num", "0"); c.append(n, el("div", "statcard__label", label));
    grid.append(c); countUp(n, num, 1200);
  });
  return grid;
}

function viewWrapped() {
  const root = el("div"); setTopbarTitle("Wrapped");
  root.append(el("h1", "h-greet", "Wrapped 📊"));
  const cover = el("div", "wrapped-cover");
  cover.append(el("div", "wrapped-cover__kicker", "Nossa História apresenta"));
  cover.append(el("div", "wrapped-cover__title", "O Wrapped do Casal"));
  cover.append(el("p", null, "<span style='color:#000;font-weight:700'>Toque para começar ▶</span>"));
  cover.onclick = startWrapped;
  root.append(cover);
  const s = shelf("Estatísticas premium"); s.append(statsGrid()); root.append(s);
  return root;
}
function wrappedSlides() {
  const s = DB.stats, last = DB.months[DB.months.length - 1] || {};
  const photos = DB.memories.filter((m) => (m.type === "photo" || m.type === "print") && m.src).map((m) => m.src);
  const pic = (i) => photos.length ? photos[i % photos.length] : "";
  const song = DB.music[0];
  const slides = [
    { kicker: `Desde ${fmtDate(DB.config.startDate)}`, big: s.days, label: "dias juntos ❤️", g: ["#1ed760", "#04361b"], img: pic(0) },
    { kicker: "E não paramos", big: s.callHours + "h", label: "horas em call 📞", g: ["#4dd0e1", "#062a33"] },
    { kicker: "Jogo mais jogado", big: s.games[0] || "Roblox", label: "🎮 onde tudo começou", g: ["#7c4dff", "#160a33"] },
    { kicker: "Nossa música mais tocada", big: song ? song.title : "", label: song ? `🎵 ${song.artist}` : "", g: ["#f06292", "#33061a"], img: song?.cover },
    { kicker: "Memórias guardadas", big: s.photos + s.videos, label: `📸 ${s.photos} fotos · 🎥 ${s.videos} vídeos`, g: ["#ffb347", "#33240a"], img: pic(1) },
    { kicker: "Palavras de amor", big: s.letters, label: "cartas escritas 💌", g: ["#f06292", "#1a0a3d"] },
    { kicker: "Risadas só nossas", big: s.memes, label: "😂 memes que a gente criou", g: ["#1ed760", "#1a0a3d"] },
    { kicker: "Conquistas desbloqueadas", big: s.achievements, label: "🏆 e só aumentando", g: ["#c9a227", "#26200a"] },
    { kicker: "Melhor momento", big: last.bestMoment || "Todos com você", label: "✨", g: ["#7c4dff", "#f06292"], img: pic(2), small: true },
    { kicker: "E o melhor de tudo", big: "Nós", label: "a história continua ❤️", g: ["#1ed760", "#7c4dff"], img: pic(0) },
  ];
  return slides.filter((x) => x.big !== "" && x.big != null);
}
function startWrapped() {
  const slides = wrappedSlides(); let i = 0;
  const w = el("div", "wrapped");
  const dots = el("div", "wrapped__dots"); slides.forEach(() => dots.append(el("span", "wrapped__dot")));
  const close = el("button", "wrapped__close"); close.innerHTML = icon("x", { size: 22 });
  close.onclick = (e) => { e.stopPropagation(); w.remove(); };
  const box = el("div");
  w.append(dots, close, box, el("div", "wrapped__hint", "toque para continuar"));
  const show = () => {
    const s = slides[i];
    if (s.img) w.style.background = `linear-gradient(150deg, ${s.g[0]}dd, ${s.g[1]}f2 80%), url("${encodeURI(s.img)}") center/cover no-repeat`;
    else w.style.background = `linear-gradient(150deg, ${s.g[0]}, ${s.g[1]} 75%)`;
    box.innerHTML = "";
    const sl = el("div", "wrapped__slide");
    sl.append(el("div", "wrapped__kicker", esc(s.kicker)),
      el("div", "wrapped__big" + (s.small ? " wrapped__big--sm" : ""), esc(String(s.big))),
      el("div", "wrapped__label", esc(s.label)));
    box.append(sl);
    [...dots.children].forEach((d, j) => d.classList.toggle("on", j <= i));
  };
  w.onclick = () => { i++; i < slides.length ? show() : w.remove(); };
  document.body.append(w); show();
}

function viewFuture() {
  const root = el("div"); setTopbarTitle("Nosso Futuro");
  root.append(el("h1", "h-greet", "Nosso Futuro 🌎"));
  const places = DB.future.places || [];
  if (places.length) {
    const map = el("div", "map");
    const stars = el("div", "map__stars");
    for (let i = 0; i < 40; i++) { const st = el("span", "map__star"); st.style.left = Math.random() * 100 + "%"; st.style.top = Math.random() * 100 + "%"; st.style.animationDelay = Math.random() * 3 + "s"; stars.append(st); }
    map.append(stars);
    places.forEach((p) => {
      const pin = el("div", "map__pin" + (p.done ? " map__pin--done" : ""));
      pin.style.left = (p.x ?? 50) + "%"; pin.style.top = (p.y ?? 50) + "%";
      pin.append(el("div", "map__pin-dot"), el("div", "map__pin-label", esc(p.name)));
      map.append(pin);
    });
    root.append(map);
  }
  const s = shelf("Metas, sonhos e planos");
  (DB.future.goals || []).forEach((g) => {
    const row = el("div", "goal" + (g.done ? " goal--done" : ""));
    row.append(el("div", "goal__check", g.done ? "✅" : "⭕"));
    const meta = el("div"); meta.append(el("div", "goal__title", esc(g.title)));
    if (g.description) meta.append(el("div", "goal__desc", esc(g.description)));
    row.append(meta);
    if (g.done && g.date) row.append(el("div", "goal__date", `Realizado em ${fmtDate(g.date)}`));
    s.append(row);
  });
  root.append(s);
  const cta = el("button", "finale-cta", "🎬 Reproduzir o final · uma mensagem pra você");
  cta.onclick = playFinale;
  root.append(cta);
  return root;
}
function playFinale() {
  const f = $("#finale"), line = $("#finaleLine");
  const cfg = DB.config.finale || {};
  const seq = [...(cfg.lines || []).map((t) => ({ t })), { t: cfg.title || "❤️ Feliz Dia dos Namorados ❤️", cls: "heart", hold: 4200 }, { t: cfg.outro || "", hold: 6000 }].filter((x) => x.t);
  f.hidden = false;
  let a = null;
  if (cfg.music) { a = new Audio(cfg.music); a.volume = 0.55; a.play().catch(() => {}); }
  let i = 0, timer = null;
  const end = () => { clearTimeout(timer); if (a) a.pause(); f.hidden = true; $("#finaleSkip").onclick = null; };
  const step = () => {
    if (i >= seq.length) return end();
    const { t, cls, hold } = seq[i++];
    line.className = "finale__line " + (cls || ""); line.textContent = t;
    requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add("show")));
    timer = setTimeout(() => { line.classList.remove("show"); timer = setTimeout(step, 1400); }, hold || 3400);
  };
  $("#finaleSkip").onclick = end; step();
}

function viewSecrets() {
  const root = el("div"); setTopbarTitle("Segredos");
  if (!SECRET_UNLOCKED) {
    const lock = el("div", "secret-locked");
    const ic = el("div", "secret-locked__icon"); ic.innerHTML = icon("lock", { size: 64 }); lock.append(ic);
    lock.append(el("div", "secret-locked__title", "Arquivo Confidencial"));
    lock.append(el("p", null, "Esta área está trancada. Só quem viveu o começo sabe a palavra que abre tudo."));
    const form = el("form", "secret-form");
    const input = el("input"); input.type = "text"; input.placeholder = "digite a palavra mágica…"; input.autocomplete = "off";
    const btn = el("button", null, "Abrir"); btn.type = "submit";
    form.append(input, btn);
    form.onsubmit = (e) => { e.preventDefault(); if (input.value.trim().toLowerCase().replace(/\s+/g, "") === "yamete") unlockSecret(); else { input.value = ""; input.placeholder = "não foi dessa vez… 🤫"; } };
    lock.append(form);
    lock.append(el("p", "secret-locked__hint", "Dica: as duas palavras que começaram tudo, dentro do Roblox. 🎮"));
    root.append(lock);
    return root;
  }
  root.append(el("h1", "h-greet", "Arquivo Confidencial 🔓"));
  root.append(el("p", null, "<span style='color:var(--txt-2)'>Memes, piadas internas e momentos que ninguém mais pode ver.</span>"));
  const items = [
    ...DB.secrets.map((s, i) => ({ ...s, id: s.id || `secret-${i}`, monthLabel: "Confidencial" })),
    ...DB.memories.filter((m) => (m.tags || []).includes("confidencial")),
  ];
  if (items.length) root.append(tracklist(items));
  return root;
}
function unlockSecret() {
  SECRET_UNLOCKED = true;
  store.set("ns_secret", true);
  store.set("ns_secret_date", new Date().toISOString().slice(0, 10));
  showToast(icon("unlock", { size: 24 }), "Conquista desbloqueada", "Encontrou todos os segredos");
  buildSidebarLibrary();
  route();
}
function setupEasterEgg() {
  let buf = "";
  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1 || e.target.matches("input,textarea")) return;
    buf = (buf + e.key.toLowerCase()).slice(-6);
    if (buf === "yamete" && !SECRET_UNLOCKED) unlockSecret();
  });
}

function viewStory() {
  const st = DB.story; const root = el("div");
  if (!st) { root.append(el("p", "empty", "Adicione data/story.json.")); return root; }
  setAccent((st.album.gradient || [])[0] || "#1db954"); setTopbarTitle(st.album.title);
  const artNode = el("div"); artNode.style.cssText = "display:grid;place-items:center;color:#fff;width:100%;height:100%";
  artNode.innerHTML = st.album.emoji || icon("gamepad", { size: 64 });
  root.append(pagehero({ kind: "Álbum especial", title: st.album.title, art: artNode, gradient: st.album.gradient,
    meta: `<span>${esc(st.album.description)} · ${st.album.year || ""}</span>` }));
  const obs = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("show"); obs.unobserve(e.target); } }); }, { threshold: 0.35 });
  (st.scenes || []).forEach((sc) => {
    const block = el("div", "scene" + (sc.big ? " scene--big" : ""));
    block.append(el("p", null, esc(sc.text)));
    if (sc.media?.src) { const box = el("div", "scene__media"); box.append(mediaEl({ type: sc.media.type, src: sc.media.src })); block.append(box); }
    root.append(block); obs.observe(block);
  });
  const fin = el("div"); fin.style.cssText = "text-align:center;padding:30px 0";
  const btn = el("button", "play-big"); btn.style.margin = "0 auto"; btn.innerHTML = icon("play", { size: 24 });
  btn.onclick = () => (location.hash = "#/music");
  fin.append(btn, el("p", null, "<span style='color:var(--txt-2);margin-top:10px;display:block'>Tocar a trilha sonora</span>"));
  root.append(fin);
  return root;
}

function viewSearch() {
  const root = el("div"); setTopbarTitle("");
  const box = el("div", "search-box");
  const input = el("input", "search-input"); input.type = "search"; input.placeholder = "O que você quer relembrar?"; input.autocomplete = "off";
  box.append(input); root.append(box);
  const results = el("div"); root.append(results);
  const render = (q) => {
    results.innerHTML = ""; q = q.trim().toLowerCase();
    if (!q) {
      const s = shelf("Navegar por tudo"); s.append(playlistGrid(DB.playlists)); results.append(s);
      const s2 = shelf("Álbuns"); s2.append(albumGrid()); results.append(s2);
      return;
    }
    const has = (s) => String(s || "").toLowerCase().includes(q);
    const mems = DB.memories.filter((m) => has(m.title) || has(m.text) || (m.tags || []).some(has) || has(m.monthLabel));
    const songs = DB.music.filter((t) => has(t.title) || has(t.artist) || has(t.reason));
    const pls = DB.playlists.filter((p) => has(p.name) || has(p.description));
    const albs = DB.months.filter((m) => has(m.label) || has(m.subtitle));
    let any = false;
    if (pls.length || albs.length) {
      results.append(el("div", "search-section-title", "Playlists e álbuns"));
      const g = el("div", "cardrow"); pls.forEach((p) => g.append(playlistCard(p))); albs.forEach((m) => g.append(albumCard(m))); results.append(g); any = true;
    }
    if (songs.length) { results.append(el("div", "search-section-title", "Músicas")); results.append(musicTracklist(songs)); any = true; }
    if (mems.length) { results.append(el("div", "search-section-title", "Memórias")); results.append(tracklist(mems, "")); any = true; }
    if (!any) results.append(el("p", "empty", `Nada encontrado para “${esc(q)}”.`));
  };
  input.addEventListener("input", () => render(input.value));
  render(""); setTimeout(() => input.focus(), 60);
  return root;
}

// =====================================================================
//  Now Playing (mostra a MÚSICA atual)
// =====================================================================
function setupNowPanel() { $("#nowPanelClose").onclick = () => $("#app").classList.remove("now-open"); }
function openNowPlaying() { $("#app").classList.add("now-open"); renderNowPanel(); }
function renderNowPanel() {
  const t = MUSIC[MIDX];
  $("#nowPanelMonth").textContent = "Tocando agora";
  const body = $("#nowPanelBody"); body.innerHTML = "";
  const art = el("div", "np-art"); art.style.color = "#fff";
  if (t?.cover) { const im = el("img"); im.src = t.cover; im.onerror = () => (art.innerHTML = icon("music", { size: 54 })); art.append(im); }
  else art.innerHTML = icon("music", { size: 54 });
  body.append(art);
  if (t) {
    const head = el("div");
    head.append(el("div", "np-title", esc(t.title || "Música")));
    head.append(el("div", "np-date", [t.artist, t.monthLabel].filter(Boolean).join(" · ")));
    body.append(head);
    if (t.reason) { const b = el("div", "np-block"); b.append(el("div", "np-block__kicker", "Por que essa música"), el("div", "np-block__body", esc(t.reason))); body.append(b); }
  }
  const frases = DB.config.frasesDoDia || [];
  if (frases.length) { const b = el("div", "np-block"); b.append(el("div", "np-block__kicker", "Frase do dia"), el("div", "np-block__body", esc(frases[Math.floor(Date.now() / 86400000) % frases.length]))); body.append(b); }
  const lastLetter = [...DB.months].reverse().find((m) => m.letter?.text);
  if (lastLetter) { const b = el("div", "np-block np-block--click"); b.append(el("div", "np-block__kicker", "Última carta"), el("div", "np-block__body", `<strong>${esc(lastLetter.letter.title || "Carta")}</strong> · ${fmtDate(lastLetter.letter.date)}`)); b.onclick = () => openLetter(lastLetter.letter); body.append(b); }
  const curios = DB.config.curiosidades || [];
  if (curios.length) { const b = el("div", "np-block"); b.append(el("div", "np-block__kicker", "Curiosidade"), el("div", "np-block__body", esc(curios[Math.floor(Math.random() * curios.length)]))); body.append(b); }
}

// =====================================================================
//  Topbar / scroll / sidebar / contadores
// =====================================================================
function setupTopbar() {
  $("#btnBack").onclick = () => history.back();
  $("#btnFwd").onclick = () => history.forward();
  $("#btnRecommend").onclick = recommend;
  $("#avatar").onclick = () => (location.hash = "#/home");
  $("#logo").onclick = () => (location.hash = "#/home");
  const sfxBtn = $("#btnSfx");
  const renderSfx = () => { sfxBtn.innerHTML = icon(sfxOn ? "bell" : "bellOff", { size: 18 }); sfxBtn.classList.toggle("sfx-off", !sfxOn); };
  renderSfx();
  sfxBtn.onclick = () => { sfxOn = !sfxOn; store.set("ns_sfx", sfxOn); renderSfx(); if (sfxOn) sfx("like"); };
}
function setTopbarTitle(t) { $("#topbar").dataset.title = t || ""; $("#topbarTitle").textContent = t || ""; }
function setupScroll() { $("#view").addEventListener("scroll", onScroll, { passive: true }); }
function onScroll() {
  const y = $("#view").scrollTop;
  $("#topbar").classList.toggle("scrolled", y > 24);
  $("#topbarTitle").classList.toggle("show", !!$("#topbar").dataset.title && y > 200);
}
function recommend() {
  const pool = [...DB.memories, ...DB.months.filter((m) => m.letter?.text).map((m) => ({ _letter: m.letter }))];
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick._letter) openLetter(pick._letter); else openMemory(pick, "Recomendado pra você hoje");
}
function timeMachine() {
  if (!DB.memories.length) return;
  openMemory(DB.memories[Math.floor(Math.random() * DB.memories.length)], "⏳ Viajando no tempo");
}

function buildSidebarLibrary() {
  const chips = $("#libChips"); chips.innerHTML = "";
  ["Tudo", "Playlists", "Álbuns"].forEach((label) => {
    const c = el("button", "chip" + (libFilter === label.toLowerCase() ? " active" : ""), label);
    c.onclick = () => { libFilter = label.toLowerCase(); buildSidebarLibrary(); };
    chips.append(c);
  });
  const list = $("#libraryList"); list.innerHTML = "";
  const rows = [];
  if (libFilter === "tudo") destinations().forEach((d) => rows.push({ iconName: d.unlock && SECRET_UNLOCKED ? "unlock" : d.iconName, name: d.title, sub: d.sub, href: d.href, art: d.art }));
  if (libFilter === "tudo" || libFilter === "playlists") DB.playlists.forEach((p) => rows.push({ emoji: p.emoji, name: p.name, sub: "Playlist", href: `#/playlist/${p.id}`, grad: p.gradient }));
  if (libFilter === "tudo" || libFilter === "álbuns") DB.months.forEach((m) => rows.push({ iconName: "disc", name: m.label || m.id, sub: "Álbum", href: `#/album/${m.id}`, cover: m.cover, color: m.color }));
  rows.forEach((r) => {
    const row = el("button", "librow");
    const art = el("div", "librow__art");
    if (r.cover) { const im = el("img"); im.src = r.cover; im.onerror = () => { im.remove(); art.innerHTML = icon(r.iconName || "disc", { size: 22 }); }; art.append(im); }
    else if (r.emoji) { art.textContent = r.emoji; art.style.background = r.grad ? gradientCss(r.grad) : "var(--elevated)"; }
    else { art.style.background = r.art || (r.color ? `linear-gradient(135deg,${r.color},#0a0a0d)` : "var(--elevated)"); art.style.color = "#fff"; art.innerHTML = icon(r.iconName || "disc", { size: 22 }); }
    const meta = el("div", "librow__meta");
    meta.append(el("div", "librow__name", esc(r.name)), el("div", "librow__sub", esc(r.sub)));
    row.append(art, meta);
    row.onclick = () => (location.hash = r.href);
    list.append(row);
  });
}

function startCounters() {
  const tick = () => {
    const p = elapsedParts(DB.config.startDate);
    $("#sidebarCounter").innerHTML = `<strong>${p.totalDays}</strong> dias juntos<br><strong>${p.years}</strong>a · <strong>${p.months}</strong>m · <strong>${p.days}</strong>d`;
  };
  tick(); setInterval(tick, 30000);
}

// =====================================================================
//  Modal / Toast / utils
// =====================================================================
function setupModal() {
  $("#modalClose").onclick = closeModal;
  $("#modalBackdrop").onclick = closeModal;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
function openModal(node) { const c = $("#modalContent"); c.innerHTML = ""; c.append(node); $("#modal").hidden = false; }
function closeModal() { clearInterval(typeTimer); $("#modalContent").querySelectorAll("video,audio").forEach((m) => m.pause()); $("#modal").hidden = true; }

let toastTimer = null;
function showToast(iconHTML, kicker, name) {
  const t = $("#toast"); t.innerHTML = "";
  const ic = el("div", "toast__icon"); ic.innerHTML = iconHTML; t.append(ic);
  const meta = el("div"); meta.append(el("div", "toast__kicker", esc(kicker)), el("div", "toast__name", esc(name))); t.append(meta);
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 4200);
}
function countUp(node, target, duration) {
  const num = typeof target === "number" ? target : parseInt(target, 10);
  if (!isFinite(num)) { node.textContent = target; return; }
  const start = performance.now();
  const frame = (now) => { const p = Math.min(1, (now - start) / duration); node.textContent = Math.round(num * (1 - Math.pow(1 - p, 3))).toLocaleString("pt-BR"); if (p < 1) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}

// =====================================================================
//  Efeitos sonoros (Web Audio — sem arquivos) e visuais
// =====================================================================
let _actx = null;
function actx() {
  if (!_actx) { try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
  if (_actx && _actx.state === "suspended") _actx.resume();
  return _actx;
}
function sfx(kind) {
  if (!sfxOn) return;
  const ac = actx(); if (!ac) return;
  const now = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = "sine";
  let d = 0.07, vol = 0.05;
  if (kind === "like") { o.frequency.setValueAtTime(523, now); o.frequency.exponentialRampToValueAtTime(880, now + 0.09); d = 0.18; vol = 0.06; }
  else if (kind === "play") { o.frequency.setValueAtTime(392, now); o.frequency.exponentialRampToValueAtTime(523, now + 0.07); d = 0.12; }
  else if (kind === "open") { o.frequency.setValueAtTime(680, now); d = 0.09; }
  else { o.frequency.setValueAtTime(520, now); d = 0.045; vol = 0.035; }
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.start(now); o.stop(now + d + 0.02);
}
function ripple(target, x, y) {
  const rect = target.getBoundingClientRect();
  const r = el("span", "ripple");
  const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = size + "px";
  r.style.left = (x - rect.left - size / 2) + "px";
  r.style.top = (y - rect.top - size / 2) + "px";
  target.appendChild(r);
  setTimeout(() => r.remove(), 600);
}
function heartBurst(btn) {
  const rect = btn.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const h = el("span", "heart-burst", "❤");
    h.style.left = (rect.left + rect.width / 2) + "px";
    h.style.top = (rect.top + rect.height / 2) + "px";
    h.style.setProperty("--dx", (Math.random() * 54 - 27) + "px");
    h.style.setProperty("--rot", (Math.random() * 50 - 25) + "deg");
    h.style.animationDelay = (i * 0.04) + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1000);
  }
}
function likeFx(btn, willLike) { if (willLike) { sfx("like"); heartBurst(btn); } else sfx("click"); }
function setupInteractions() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".track__like,.player__like,.mem-like,#btnPlay,#btnMiniPlay,.card__play,.bigcard__play,.play-big")) return;
    if (e.target.closest("button, a[href], .card, .bigcard, .librow, .track, .chip, .letter-card, .goal, .map__pin, .wrapped")) sfx("click");
  }, true);
  document.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".card, .bigcard, .play-big, .pbtn--play, .letter-card, .librow, .bnav, .statcard, .ach");
    if (t) ripple(t, e.clientX, e.clientY);
  });
}
