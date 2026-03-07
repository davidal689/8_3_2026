// ===================
// CONFIG
// ===================
const PASSCODE = "3006"; // đổi mật khẩu 4 số ở đây

// Nhạc MP3 local: tải file vào assets/music/ rồi đổi tên cho khớp
const TRACKS = [
  { name: "Ai Ngoài Anh", mp3: "assets/music/song1.mp3", cover: "assets/images/anh3.jpg" },
  { name: "Missing You", mp3: "assets/music/song2.mp3", cover: "assets/images/anh4.jpg" },
  { name: "In Love x Cố Đôi Điều", mp3: "assets/music/song3.mp3", cover: "assets/images/anh5.jpg" },
];
// Ảnh cho mục Image (thêm ảnh local vào assets/images/ hoặc dùng URL)
const IMAGES = [
  "assets/images/anh1.jpg",
  "assets/images/anh2.jpg",
  "assets/images/anh3.jpg",
  "assets/images/anh4.jpg",
  "assets/images/anh5.jpg",
  "assets/images/anh6.jpg",
];
const IMAGE_PLACEHOLDER = (i) => `https://picsum.photos/400/520?random=${i}`;

// Thư (tự sửa)
const LETTER_TEXT =
`Em à, ngày Quốc tế Phụ nữ năm nay, anh ở xa mình, không thể bên cạnh em đưa em đi chơi, đi ăn uống và không trực
tiếp ôm em vào lòng được. Nên anh làm bức thư này cùng với bó hoa dành tặng em, chúc em ngày Quốc tế Phụ nữ 08/03 vui vẻ,
xinh đẹp và hạnh phúc, luôn là công chúa nhớnn trong lòng anh. Yêu anh nhiều nữa nhá 💗
Anh yêu em nhiều lắm 💗

`;

// 50 chữ/phút => 60000ms/50 = 1200ms mỗi ký tự
const LETTER_DELAY_MS = 100;

// ===================
// HELPERS
// ===================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// lấy videoId từ link youtube/short/youtu.be hoặc trả về nếu đã là ID
function extractYouTubeId(input) {
  if (!input) return "";
  const s = String(input).trim();

  // nếu là ID (11 ký tự thường)
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  // youtu.be/ID
  let m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  // watch?v=ID
  m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  // shorts/ID
  m = s.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];

  return "";
}

function show(el) { if (el) el.classList.remove("hidden"); }
function hide(el) { if (el) el.classList.add("hidden"); }
function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// Tracks dùng MP3
const TRACKS_N = TRACKS.filter(t => t.mp3).map(t => ({
  name: t.name,
  mp3: t.mp3,
  cover: t.cover || "https://picsum.photos/200/200?random=music"
}));

// Xóa code YouTube không dùng nữa

// ===================
// LOCK SCREEN
// ===================
let input = "";
const lockHint = $("#lockHint");
const dots = $$(".dot");

function renderDots() {
  dots.forEach((d, i) => d.classList.toggle("filled", i < input.length));
}

function resetLock(msg = "Nhập mật khẩu để mở khóa") {
  input = "";
  renderDots();
  lockHint.textContent = msg;
}

function unlock() {
  hide($("#lockScreen"));
  show($("#menuScreen"));
}

const CUTE_CHARS = ["💗","✨","🌸","🧸","🍓","💖","🐰","🎀","💞","🫧"];

function spawnCutePop(anchorEl) {
  const card = document.querySelector(".lock-card");
  if (!card || !anchorEl) return;

  const r1 = card.getBoundingClientRect();
  const r2 = anchorEl.getBoundingClientRect();
  const x = (r2.left - r1.left) + r2.width / 2;
  const y = (r2.top - r1.top) + r2.height / 2;

  const el = document.createElement("span");
  el.className = "cute-pop";
  el.textContent = CUTE_CHARS[Math.floor(Math.random() * CUTE_CHARS.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  card.appendChild(el);

  setTimeout(() => el.remove(), 650);
}

function handleKey(k, btnEl) {
  if (input.length >= 4) return;
  input += k;
  renderDots();
  spawnCutePop(btnEl);

  if (input.length === 4) {
    if (input === PASSCODE) {
      lockHint.textContent = "Đúng rồi 💗";
      setTimeout(unlock, 250);
    } else {
      lockHint.textContent = "Sai mật khẩu rồi 🥺";
      const card = $(".lock-card");
      card.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }],
        { duration: 220, iterations: 1 }
      );
      setTimeout(() => resetLock("Thử lại nha 💗"), 350);
    }
  }
}

$$(".key").forEach(btn => {
  const k = btn.getAttribute("data-k");
  if (!k) return;
  btn.addEventListener("click", () => handleKey(k, btn));
});
$("#delKey").addEventListener("click", () => {
  input = input.slice(0, -1);
  renderDots();
});

// ===================
// MODAL + PANELS
// ===================
const modal = $("#modal");
const modalBackdrop = $("#modalBackdrop");
const modalClose = $("#modalClose");

const panels = {
  music: $("#panel-music"),
  image: $("#panel-image"),
  letter: $("#panel-letter"),
  gift: $("#panel-gift"),
};

function openPanel(name) {
  Object.values(panels).forEach(hide);
  show(modal);
  show(panels[name]);

  if (name === "music") initMusicOnce();
  if (name === "image") initImagesOnce();
  if (name === "letter") startLetter();
  if (name === "gift") initGiftOnce();
}

function closeModal() {
  hide(modal);
  Object.values(panels).forEach(hide);
  if (lightbox && !lightbox.classList.contains("hidden")) hide(lightbox);
  if (audioEl) audioEl.pause();
  if (playBtn) playBtn.textContent = "▶";
}

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (lightbox && !lightbox.classList.contains("hidden")) {
    hide(lightbox);
  } else if (modal && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

$$(".menu-item").forEach(btn => {
  btn.addEventListener("click", () => openPanel(btn.dataset.open));
});

// ===================
// MUSIC (HTML5 Audio - MP3 local)
// ===================
let musicInited = false;
let currentTrack = 0;
let audioEl = null;

const playBtn = $("#playBtn");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const playlistEl = $("#playlist");
const musicName = $("#musicName");
const timeNow = $("#timeNow");
const timeEnd = $("#timeEnd");
const seek = $("#seek");
const musicCover = $("#musicCover");

function updateCover() {
  const t = TRACKS_N[currentTrack];
  if (!t || !musicCover) return;
  musicCover.style.background = `url("${t.cover}") center/cover no-repeat`;
}

function setTrack(i, autoplay = false) {
  if (!TRACKS_N.length) {
    musicName.textContent = "Chưa có bài hát";
    return;
  }
  currentTrack = (i + TRACKS_N.length) % TRACKS_N.length;
  const t = TRACKS_N[currentTrack];
  musicName.textContent = t.name;
  updateCover();
  $$(".track").forEach((el, idx) => el.classList.toggle("active", idx === currentTrack));

  if (!audioEl) return;

  audioEl.src = t.mp3;
  audioEl.load();
  audioEl.onloadedmetadata = () => {
    timeEnd.textContent = formatTime(audioEl.duration);
  };
  if (autoplay) {
    audioEl.play().catch(() => {});
    playBtn.textContent = "⏸";
  } else {
    audioEl.pause();
    playBtn.textContent = "▶";
    timeNow.textContent = "0:00";
    timeEnd.textContent = "0:00";
    seek.value = "0";
  }
}

function togglePlay() {
  if (!audioEl || !TRACKS_N[currentTrack]) return;
  if (audioEl.paused) {
    audioEl.play().catch(() => {});
    playBtn.textContent = "⏸";
  } else {
    audioEl.pause();
    playBtn.textContent = "▶";
  }
}

function initMusicOnce() {
  if (musicInited) return;
  musicInited = true;

  audioEl = document.createElement("audio");
  audioEl.preload = "metadata";
  document.body.appendChild(audioEl);

  audioEl.addEventListener("timeupdate", () => {
    timeNow.textContent = formatTime(audioEl.currentTime);
    if (audioEl.duration && !seek.matches(":active")) {
      seek.value = String((audioEl.currentTime / audioEl.duration) * 100);
    }
  });
  audioEl.addEventListener("ended", () => setTrack(currentTrack + 1, true));
  audioEl.addEventListener("loadedmetadata", () => {
    timeEnd.textContent = formatTime(audioEl.duration);
  });

  TRACKS_N.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "track";
    row.innerHTML = `
      <div class="thumb track-thumb" style="background-image:url('${t.cover}')"></div>
      <div>
        <div class="tname">${escapeHtml(t.name)}</div>
        <div class="track-hint">Chạm để phát</div>
      </div>
    `;
    row.addEventListener("click", () => setTrack(i, true));
    playlistEl.appendChild(row);
  });

  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", () => setTrack(currentTrack - 1, true));
  nextBtn.addEventListener("click", () => setTrack(currentTrack + 1, true));

  seek.addEventListener("input", () => {
    if (!audioEl || !audioEl.duration) return;
    audioEl.currentTime = (Number(seek.value) / 100) * audioEl.duration;
  });

  setTrack(0, false);
}

// ===================
// IMAGES (2 rows opposite marquee + lightbox)
// ===================
let imagesInited = false;
const row1 = $("#row1");
const row2 = $("#row2");
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxBackdrop = $("#lightboxBackdrop");

function initImagesOnce() {
  if (imagesInited) return;
  imagesInited = true;

  const half = Math.ceil(IMAGES.length / 2);
  const group1 = IMAGES.slice(0, half);
  const group2 = IMAGES.slice(half);

  function renderRow(container, images) {
    // nhân đôi để loop mượt (animation -50%)
    const list = [...images, ...images];

    list.forEach((src, idx) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "photo";
      img.loading = "lazy";
      img.draggable = false;
      img.onerror = () => {
        img.src = IMAGE_PLACEHOLDER(idx);
        img.onerror = null;
      };

      img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        show(lightbox);
      });

      container.appendChild(img);
    });
  }

  renderRow(row1, group1.length ? group1 : IMAGES);
  renderRow(row2, group2.length ? group2 : IMAGES);

  lightboxBackdrop.addEventListener("click", () => hide(lightbox));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hide(lightbox);
  });
}

// ===================
// LETTER (typewriter)
// ===================
let letterTimer = null;
let letterIndex = 0;

const letterBody = $("#letterBody");
const replayLetter = $("#replayLetter");
const skipLetter = $("#skipLetter");

function clearLetterTimer() {
  if (letterTimer) clearTimeout(letterTimer);
  letterTimer = null;
}

function startLetter() {
  clearLetterTimer();
  letterIndex = 0;
  letterBody.textContent = "";

  const step = () => {
    letterBody.textContent = LETTER_TEXT.slice(0, letterIndex);
    letterIndex++;
    if (letterIndex <= LETTER_TEXT.length) {
      letterTimer = setTimeout(step, LETTER_DELAY_MS);
    }
  };
  step();
}

replayLetter.addEventListener("click", startLetter);
skipLetter.addEventListener("click", () => {
  clearLetterTimer();
  letterBody.textContent = LETTER_TEXT;
});

// ===================
// GIFT (flowers)
// ===================
let giftInited = false;
const giftStage = $("#giftStage");
const moreFlowers = $("#moreFlowers");
const resetFlowers = $("#resetFlowers");

function createFlower(x, y) {
  const f = document.createElement("div");
  f.className = "flower";
  f.style.left = `${x}px`;
  f.style.top = `${y}px`;
  f.style.transform = `translate(-50%, -50%) rotate(${(Math.random() * 24 - 12).toFixed(1)}deg)`;

  for (let i = 0; i < 6; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    p.style.setProperty("--r", `${i * 60}deg`);
    f.appendChild(p);
  }
  const c = document.createElement("div");
  c.className = "center";
  f.appendChild(c);

  const stem = document.createElement("div");
  stem.className = "stem";
  f.appendChild(stem);

  const leaf1 = document.createElement("div");
  leaf1.className = "leaf";
  f.appendChild(leaf1);

  const leaf2 = document.createElement("div");
  leaf2.className = "leaf leaf2";
  f.appendChild(leaf2);

  giftStage.appendChild(f);

  setTimeout(() => {
    f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    setTimeout(() => f.remove(), 950);
  }, 4500);
}

function sprinkleFlowers(count = 10) {
  const rect = giftStage.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const x = Math.random() * rect.width;
    const y = 80 + Math.random() * (rect.height - 120);
    setTimeout(() => createFlower(x, y), i * 140);
  }
}

function initGiftOnce() {
  if (giftInited) return;
  giftInited = true;

  sprinkleFlowers(14);

  setInterval(() => {
    if (modal.classList.contains("hidden") || panels.gift.classList.contains("hidden")) return;
    sprinkleFlowers(6);
  }, 2400);

  moreFlowers.addEventListener("click", () => sprinkleFlowers(12));
  resetFlowers.addEventListener("click", () => {
    giftStage.querySelectorAll(".flower").forEach(el => el.remove());
    sprinkleFlowers(14);
  });

  giftStage.addEventListener("click", (e) => {
    const rect = giftStage.getBoundingClientRect();
    createFlower(e.clientX - rect.left, e.clientY - rect.top);
  });
}