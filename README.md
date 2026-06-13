# Nossa História ❤️ — o streaming da nossa vida a dois

Uma plataforma estilo **Spotify** (dark, com player de música real), só que o catálogo inteiro é o nosso relacionamento. Você edita **um único arquivo** e o site se monta sozinho.

---

## ▶️ Como abrir

O site lê arquivos locais, então precisa de um servidor (abrir o `index.html` com dois cliques **não** funciona):

**VSCode (mais fácil):** instale a extensão **Live Server** → botão direito no `index.html` → **Open with Live Server**.

**Publicar de graça:** suba a pasta no [GitHub Pages](https://pages.github.com/) ou arraste no [Netlify Drop](https://app.netlify.com/drop).

---

## ✏️ Você edita UM arquivo só: `data/config.json`

Tudo está lá dentro: nomes, data, meses, fotos, cartas, conquistas, músicas, playlists, sonhos e segredos. As **mídias** (fotos/vídeos/áudios) vão na pasta `assets/media/` e você só aponta o caminho no config.

> ⚠️ É JSON: toda vírgula importa. Todo item de uma lista termina com vírgula, **menos o último**. Se o site ficar em branco, provavelmente é uma vírgula sobrando/faltando — cole o config em https://jsonlint.com para achar.

### Adicionar um mês novo
Dentro de `"meses"`, copie um bloco `{ ... }` e mude:
```jsonc
{
  "id": "julho2026",
  "titulo": "Julho 2026",
  "subtitulo": "Mais um capítulo",
  "capa": "assets/media/julho2026/capa.jpg",
  "cor": "#1db954",
  "horasEmCall": 40,
  "memes": 10,
  "jogos": ["Roblox"],
  "filmes": [],
  "carta":   { "titulo": "Carta de Julho", "data": "2026-07-15", "texto": "Use \\n pra quebrar linha." },
  "musica":  { "titulo": "", "artista": "", "motivo": "", "url": "" },
  "memorias": [
    { "tipo": "foto", "titulo": "", "data": "2026-07-10", "arquivo": "assets/media/julho2026/foto1.jpg", "texto": "", "tags": ["calls"] }
  ],
  "conquistas": [
    { "nome": "", "icone": "🏆", "data": "2026-07-20", "descricao": "", "raridade": "Rara" }
  ]
}
```
- `tipo` da memória: **foto · print · video · audio · texto**
- `tags` jogam a memória nas playlists. Tags prontas: `origins · madrugadas · engracados · calls · saudades · futuro · confidencial` (essa vai pro Arquivo Confidencial). Crie novas em `"playlists"`.

### Adicionar uma foto/vídeo/áudio
1. Coloque o arquivo em `assets/media/<mês>/` (ex: `assets/media/julho2026/foto1.jpg`).
2. Aponte o caminho no `arquivo` de uma memória (ou na `capa` do mês).
> Não existe upload — o arquivo precisa estar na pasta. Se faltar, o site mostra um ícone no lugar.

### Adicionar uma música
Em `"musica" > "lista"`: coloque o arquivo em `assets/media/music/` e preencha `arquivo`. Sem arquivo? Use `url` (YouTube/Spotify). Já vêm 3 músicas de exemplo (tons sem direitos autorais) — troque.

### Cartas, conquistas, playlists, sonhos, segredos
Tudo no mesmo `config.json`:
- **carta** e **conquistas** ficam dentro de cada mês.
- **playlists** (`"playlists"`) — coletam memórias pelas tags.
- **Nosso Futuro** (`"futuro"`) — `lugares` (mapa) e `metas`. Marque `"feito": true` quando realizar.
- **Roblox Origins** (`"album"`) — a história em cenas.
- **Segredos** (`"segredos"`) — Arquivo Confidencial.

---

## 🗂 Estrutura

```
nosso-site/
├── index.html
├── css/style.css
├── js/  (app.js, data.js, icons.js — não precisa mexer)
├── data/
│   └── config.json        ← VOCÊ EDITA SÓ ISSO
└── assets/media/          ← suas fotos, vídeos, áudios e músicas
    ├── maio2026/
    ├── junho2026/
    └── music/
```

> Os arquivos em `data/months/*.json` são **opcionais**: se você criar algum, ele entra como mês extra. Mas o normal é editar tudo no `config.json`.

---

## ❤️ Recursos

- **Player de música** real: play/pause, barra arrastável, anterior/próxima, aleatório, repetir, volume — com vinil girando no "Tocando agora".
- **Memórias favoritas**: ❤ em qualquer memória vira a playlist *Favoritas* (salvo no navegador).
- **Busca**, **Recomendado pra você**, **Máquina do Tempo** (⏳ no player).
- **Wrapped** animado, **Conquistas** estilo Steam, **Nosso Futuro** com mapa.
- **Final cinematográfico** (botão no fim de "Nosso Futuro"; música opcional em `assets/media/finale.mp3`).

## 🔒 O segredo
O **Arquivo Confidencial** está trancado. Para abrir: digite **`yamete`** em qualquer tela, ou use o campo de senha na própria página 🔒. Isso desbloqueia a conquista secreta.
