(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var MARK_TARGET = "qwertlexi";
  var markEl = document.getElementById("mark-text");
  var SCRAMBLE_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*{}[]";

  function scrambleMark() {
    if (!markEl) return;
    var frame = 0;
    var max = 24;
    var timer = setInterval(function () {
      frame += 1;
      markEl.textContent = MARK_TARGET
        .split("")
        .map(function (char, index) {
          if (frame > index * 2 + 6) return char;
          return SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
        })
        .join("");
      if (frame >= max) {
        clearInterval(timer);
        markEl.textContent = MARK_TARGET;
      }
    }, 40);
  }

  scrambleMark();
  setInterval(scrambleMark, 4800);

  var NOISE_POOL = ["low", "soft", "glow", "clean"];
  var MODE_POOL = ["idle", "orbit", "scan", "drift"];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function updateMetrics() {
    document.querySelectorAll("[data-metric]").forEach(function (el) {
      var key = el.getAttribute("data-metric");
      if (key === "noise") el.textContent = pick(NOISE_POOL);
      if (key === "latency") el.textContent = "~" + Math.floor(4 + Math.random() * 36) + "ms";
      if (key === "mode") el.textContent = pick(MODE_POOL);
    });
  }

  updateMetrics();
  setInterval(updateMetrics, 2200);

  var clockEl = document.getElementById("chrome-clock");
  var tickEl = document.getElementById("chrome-tick");
  var tickN = 0;

  function pad2(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    clockEl.textContent = pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds());
  }

  updateClock();
  setInterval(updateClock, 1000);
  setInterval(function () {
    tickN += 1;
    if (tickEl) tickEl.textContent = "tick " + tickN;
  }, 480);

  var canvas = document.getElementById("code-canvas");
  var stage = document.getElementById("main");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var rainColumns = [];
  var rainFont = 14;
  var rainChars = "01{}[]<>/constletfunctionreturnawait=>";

  function resizeCanvas() {
    if (!canvas || !ctx || !stage) return;
    var rect = stage.getBoundingClientRect();
    var ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    rainColumns = new Array(Math.ceil(rect.width / rainFont)).fill(0).map(function () {
      return Math.random() * rect.height;
    });
  }

  function drawRain() {
    if (!canvas || !ctx || !stage) return;
    var rect = stage.getBoundingClientRect();
    ctx.fillStyle = "rgba(76, 237, 226, 0.10)";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(3, 21, 25, 0.58)";
    ctx.font = rainFont + "px Courier Prime";
    rainColumns.forEach(function (y, index) {
      var char = rainChars.charAt(Math.floor(Math.random() * rainChars.length));
      ctx.fillText(char, index * rainFont, y);
      rainColumns[index] = y > rect.height + Math.random() * 120 ? -20 : y + rainFont * 0.92;
    });
    requestAnimationFrame(drawRain);
  }

  resizeCanvas();
  requestAnimationFrame(drawRain);
  window.addEventListener("resize", resizeCanvas);

  var portal = document.getElementById("portal");
  var backdrop = document.getElementById("stage-backdrop");
  var closeBtn = document.querySelector(".portal-close");
  var titleEl = document.getElementById("portal-title-active");
  var entries = document.querySelectorAll("[data-open-panel]");
  var panels = document.querySelectorAll(".panel[data-panel-id]");
  var mobileSheet = document.getElementById("mobile-sheet");
  var mobileMenuBtn = document.getElementById("mobile-menu-btn");
  var mobileSheetClose = document.getElementById("mobile-sheet-close");

  var TITLES = {
    photos: "摄影",
    cats: "猫",
    notes: "手记",
    about: "关于",
    links: "书签",
    signal: "信号",
    relay: "中继",
    tarot: "塔罗",
    music: "音乐"
  };

  function syncActive(id) {
    document.querySelectorAll(".entry[data-open-panel], .mobile-sheet-link[data-open-panel], .mobile-dock-btn[data-open-panel]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-open-panel") === id);
    });
  }

  function showPanel(id) {
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel-id") !== id;
    });
    if (titleEl) titleEl.textContent = TITLES[id] || "面板";
  }

  function closeMobileSheet() {
    if (!mobileSheet || !mobileMenuBtn) return;
    mobileSheet.hidden = true;
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    if ((portal && portal.hidden) && (!lightbox || lightbox.hidden)) {
      document.body.classList.remove("is-locked");
    }
  }

  function openPortal(id) {
    if (!portal || !backdrop) return;
    showPanel(id);
    syncActive(id);
    portal.hidden = false;
    backdrop.hidden = false;
    portal.setAttribute("aria-hidden", "false");
    portal.classList.add("is-open");
    document.body.classList.add("is-locked");
    closeMobileSheet();
  }

  function closePortal() {
    if (!portal || !backdrop) return;
    portal.classList.remove("is-open");
    portal.setAttribute("aria-hidden", "true");
    syncActive("");
    setTimeout(function () {
      if (!portal.classList.contains("is-open")) {
        portal.hidden = true;
        backdrop.hidden = true;
        panels.forEach(function (panel) {
          panel.hidden = true;
        });
      }
    }, 240);
    if (!mobileSheet || mobileSheet.hidden) {
      document.body.classList.remove("is-locked");
    }
  }

  entries.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-open-panel");
      if (!id) return;
      openPortal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closePortal);
  if (backdrop) backdrop.addEventListener("click", closePortal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePortal();
      closeMobileSheet();
      closeLightbox();
    }
  });

  if (mobileMenuBtn && mobileSheet) {
    mobileMenuBtn.addEventListener("click", function () {
      var isOpen = !mobileSheet.hidden;
      mobileSheet.hidden = isOpen;
      mobileMenuBtn.setAttribute("aria-expanded", String(!isOpen));
      document.body.classList.toggle("is-locked", !isOpen);
    });
  }

  if (mobileSheetClose) mobileSheetClose.addEventListener("click", closeMobileSheet);
  if (mobileSheet) {
    mobileSheet.addEventListener("click", function (event) {
      if (event.target === mobileSheet) closeMobileSheet();
    });
  }

  var photoChips = document.querySelectorAll("[data-photo-filter]");
  var photoCards = document.querySelectorAll(".photo-card");

  photoChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var value = chip.getAttribute("data-photo-filter");
      photoChips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
      photoCards.forEach(function (card) {
        var location = card.getAttribute("data-location");
        card.hidden = value !== "all" && location !== value;
      });
    });
  });

  var lightbox = document.getElementById("lightbox");
  var lightboxImage = lightbox ? lightbox.querySelector("img") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage || !src) return;
    lightbox.hidden = false;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
    document.body.classList.add("is-locked");
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    if (portal && portal.hidden && (!mobileSheet || mobileSheet.hidden)) {
      document.body.classList.remove("is-locked");
    }
  }

  document.querySelectorAll(".js-lightbox").forEach(function (button) {
    button.addEventListener("click", function () {
      var image = button.querySelector("img");
      if (!image) return;
      openLightbox(image.currentSrc || image.src, image.alt);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  var SIGNAL_LINES = [
    "signal ok · background hum stable",
    "travel archive synced with local light",
    "music window detached from main portal",
    "mobile channel opened",
    "noise floor: gentle"
  ];
  var signalTap = document.getElementById("signal-tap");
  var signalStream = document.getElementById("signal-stream");

  function appendSignalLine() {
    if (!signalStream) return;
    if (signalStream.textContent) signalStream.textContent += "\n";
    signalStream.textContent += pick(SIGNAL_LINES);
    signalStream.scrollTop = signalStream.scrollHeight;
  }

  if (signalTap) signalTap.addEventListener("click", appendSignalLine);

  var relayOutput = document.getElementById("relay-output");
  var relayForm = document.getElementById("relay-form");
  var relayInput = document.getElementById("relay-input");

  function relayLine(text, kind) {
    if (!relayOutput) return;
    var line = document.createElement("p");
    line.className = "relay-line";
    if (kind) line.classList.add("relay-line--" + kind);
    line.textContent = text;
    relayOutput.appendChild(line);
    relayOutput.scrollTop = relayOutput.scrollHeight;
  }

  function runRelayCommand(raw) {
    var value = String(raw || "").trim();
    if (!value) return;
    relayLine("> " + value);
    var parts = value.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    if (cmd === "help") {
      relayLine("help · clear · date · open <panel>", "sys");
      return;
    }
    if (cmd === "clear") {
      relayOutput.innerHTML = "";
      return;
    }
    if (cmd === "date") {
      relayLine(new Date().toString(), "sys");
      return;
    }
    if (cmd === "open" && parts[1] && TITLES[parts[1]]) {
      openPortal(parts[1]);
      relayLine("opened " + parts[1], "sys");
      return;
    }
    relayLine("未知指令，试试 help", "err");
  }

  if (relayOutput) relayLine("relay ready · type help", "sys");
  if (relayForm && relayInput) {
    relayForm.addEventListener("submit", function (event) {
      event.preventDefault();
      runRelayCommand(relayInput.value);
      relayInput.value = "";
    });
  }

  var TAROT_TEXT_DECK = [
    { id: "0", cn: "愚者", desc: "新的入口已经打开，先走一步再判断风向。" },
    { id: "I", cn: "魔术师", desc: "资源已经在手里，差的是一次开始。" },
    { id: "II", cn: "女祭司", desc: "别急着下结论，先让直觉把画面显影。" },
    { id: "XVII", cn: "星星", desc: "愿望不必喊得很大声，亮着就够了。" },
    { id: "XIX", cn: "太阳", desc: "这是一张适合向前的牌，带一点松弛感。" }
  ];

  var tarotDraw = document.getElementById("tarot-draw");
  var tarotCard = document.getElementById("tarot-card");
  var tarotRoman = document.getElementById("tarot-roman");
  var tarotName = document.getElementById("tarot-name");
  var tarotDesc = document.getElementById("tarot-desc");
  var tarotHint = document.getElementById("tarot-hint");
  var tarotBackUpload = document.getElementById("tarot-back-upload");
  var tarotFrontUpload = document.getElementById("tarot-front-upload");
  var tarotBackImage = document.getElementById("tarot-back-image");
  var tarotFrontImage = document.getElementById("tarot-front-image");
  var uploadedFronts = [];

  function loadFileAsUrl(file, callback) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (event) {
      callback(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  if (tarotBackUpload) {
    tarotBackUpload.addEventListener("change", function () {
      var file = tarotBackUpload.files && tarotBackUpload.files[0];
      if (!file || !tarotBackImage) return;
      loadFileAsUrl(file, function (url) {
        tarotBackImage.src = url;
        tarotBackImage.hidden = false;
      });
    });
  }

  if (tarotFrontUpload) {
    tarotFrontUpload.addEventListener("change", function () {
      uploadedFronts = [];
      Array.prototype.forEach.call(tarotFrontUpload.files || [], function (file, index) {
        loadFileAsUrl(file, function (url) {
          uploadedFronts[index] = {
            url: url,
            name: file.name.replace(/\.[^.]+$/, "")
          };
          if (tarotHint) tarotHint.textContent = "已载入 " + uploadedFronts.filter(Boolean).length + " 张牌面，抽牌时会优先使用它们。";
        });
      });
    });
  }

  function drawTarot() {
    if (!tarotCard) return;
    tarotCard.classList.remove("is-flipped");
    setTimeout(function () {
      var uploaded = uploadedFronts.filter(Boolean);
      var textCard = pick(TAROT_TEXT_DECK);
      if (uploaded.length && tarotFrontImage) {
        var imageCard = pick(uploaded);
        tarotFrontImage.src = imageCard.url;
        tarotFrontImage.hidden = false;
        if (tarotRoman) tarotRoman.textContent = "CUSTOM";
        if (tarotName) tarotName.textContent = imageCard.name;
        if (tarotDesc) tarotDesc.textContent = "使用你上传的牌面。";
      } else {
        if (tarotFrontImage) {
          tarotFrontImage.hidden = true;
          tarotFrontImage.removeAttribute("src");
        }
        if (tarotRoman) tarotRoman.textContent = "ARCANA · " + textCard.id;
        if (tarotName) tarotName.textContent = textCard.cn;
        if (tarotDesc) tarotDesc.textContent = textCard.desc;
      }
      tarotCard.classList.add("is-flipped");
      if (tarotHint) tarotHint.textContent = "再抽一张会重新洗牌并翻开新卡。";
    }, 180);
  }

  if (tarotDraw) tarotDraw.addEventListener("click", drawTarot);

  var TRACKS = [
    { title: "BIRDS OF A FEATHER", artist: "Billie Eilish", src: "../../Downloads/Billie Eilish - BIRDS OF A FEATHER.mp3", cover: "🪶" },
    { title: "Best Part", artist: "Daniel Caesar / H.E.R.", src: "../../Downloads/Daniel Caesar; H.E.R. - Best Part.mp3", cover: "✦" },
    { title: "Butterfly", artist: "Grimes", src: "../../Downloads/Grimes - Butterfly.mp3", cover: "🫧" },
    { title: "Oblivion", artist: "Grimes", src: "../../Downloads/Grimes - Oblivion.mp3", cover: "∞" },
    { title: "Realiti", artist: "Grimes", src: "../../Downloads/Grimes - Realiti.mp3", cover: "◌" },
    { title: "Episode 33", artist: "She Her Her Hers", src: "../../Downloads/She Her Her Hers - Episode 33.mp3", cover: "☾" },
    { title: "About You", artist: "The 1975", src: "../../Downloads/The 1975 - About You.mp3", cover: "♡" },
    { title: "Blinding Lights", artist: "The Weeknd", src: "../../Downloads/The Weeknd - Blinding Lights.mp3", cover: "✺" }
  ];

  var audio = new Audio();
  var currentTrackIndex = -1;
  var vizTimer = null;
  audio.volume = 0.82;

  var musicArt = document.getElementById("music-art");
  var musicTitle = document.getElementById("music-title");
  var musicArtist = document.getElementById("music-artist");
  var musicPlay = document.getElementById("music-play");
  var musicPrev = document.getElementById("music-prev");
  var musicNext = document.getElementById("music-next");
  var musicBar = document.getElementById("music-progress-bar");
  var musicFill = document.getElementById("music-progress-fill");
  var musicTimeCur = document.getElementById("music-time-cur");
  var musicTimeTot = document.getElementById("music-time-tot");
  var musicViz = document.getElementById("music-viz");
  var musicVol = document.getElementById("music-vol");
  var musicTracklist = document.getElementById("music-tracklist");
  var musicFloat = document.getElementById("music-float");
  var musicLauncher = document.getElementById("music-launcher");
  var musicFloatClose = document.getElementById("music-float-close");
  var musicWindowStatus = document.getElementById("music-window-status");
  var mobileNowPlaying = document.getElementById("mobile-now-playing");

  function fmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return minutes + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function openMusicFloat() {
    if (!musicFloat) return;
    musicFloat.hidden = false;
  }

  function closeMusicFloat() {
    if (!musicFloat) return;
    musicFloat.hidden = true;
  }

  document.querySelectorAll("[data-open-music-float]").forEach(function (button) {
    button.addEventListener("click", openMusicFloat);
  });

  if (musicFloatClose) musicFloatClose.addEventListener("click", closeMusicFloat);
  if (musicLauncher) musicLauncher.addEventListener("click", openMusicFloat);

  function renderTracklist() {
    if (!musicTracklist) return;
    musicTracklist.innerHTML = "";
    TRACKS.forEach(function (track, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "music-track";
      button.dataset.idx = String(index);
      button.innerHTML =
        '<span class="music-track-num">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<span class="music-track-info"><span class="music-track-name">' + track.cover + " " + track.title +
        '</span><span class="music-track-sub">' + track.artist + '</span></span>' +
        '<span class="music-track-dur" id="music-dur-' + index + '">--:--</span>';
      button.addEventListener("click", function () {
        loadTrack(index, true);
        openMusicFloat();
      });
      musicTracklist.appendChild(button);
    });
  }

  function updateTrackHighlight() {
    document.querySelectorAll(".music-track").forEach(function (button) {
      button.classList.toggle("is-current", Number(button.dataset.idx) === currentTrackIndex);
    });
  }

  function updateNowPlayingLabel(text) {
    if (mobileNowPlaying) mobileNowPlaying.textContent = text;
  }

  function loadTrack(index, autoplay) {
    currentTrackIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
    var track = TRACKS[currentTrackIndex];
    audio.src = track.src;
    audio.load();
    if (musicArt) musicArt.textContent = track.cover;
    if (musicTitle) musicTitle.textContent = track.title;
    if (musicArtist) musicArtist.textContent = track.artist;
    if (musicWindowStatus) musicWindowStatus.textContent = "ready";
    updateNowPlayingLabel(track.title);
    updateTrackHighlight();
    if (musicFill) musicFill.style.width = "0%";
    if (musicTimeCur) musicTimeCur.textContent = "0:00";
    if (musicTimeTot) musicTimeTot.textContent = "0:00";
    if (autoplay) {
      audio.play().catch(function () {});
    }
  }

  function setPlayUI(isPlaying) {
    if (musicPlay) musicPlay.textContent = isPlaying ? "⏸" : "▶";
    if (musicArt) musicArt.classList.toggle("is-playing", isPlaying);
    if (musicWindowStatus) musicWindowStatus.textContent = isPlaying ? "playing" : "paused";
    if (!musicViz) return;
    if (isPlaying) {
      if (!vizTimer) {
        vizTimer = setInterval(function () {
          musicViz.querySelectorAll(".music-viz-bar").forEach(function (bar) {
            bar.style.height = Math.floor(18 + Math.random() * 82) + "%";
          });
        }, 130);
      }
    } else {
      clearInterval(vizTimer);
      vizTimer = null;
      musicViz.querySelectorAll(".music-viz-bar").forEach(function (bar) {
        bar.style.height = "18%";
      });
    }
  }

  audio.addEventListener("play", function () {
    setPlayUI(true);
  });

  audio.addEventListener("pause", function () {
    setPlayUI(false);
  });

  audio.addEventListener("ended", function () {
    loadTrack(currentTrackIndex + 1, true);
  });

  audio.addEventListener("timeupdate", function () {
    if (!isFinite(audio.duration)) return;
    if (musicFill) musicFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    if (musicTimeCur) musicTimeCur.textContent = fmtTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", function () {
    if (musicTimeTot) musicTimeTot.textContent = fmtTime(audio.duration);
    var target = document.getElementById("music-dur-" + currentTrackIndex);
    if (target) target.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("error", function () {
    if (musicWindowStatus) musicWindowStatus.textContent = "file missing";
    if (musicTitle && TRACKS[currentTrackIndex]) {
      musicTitle.textContent = TRACKS[currentTrackIndex].title + " (未找到文件)";
    }
  });

  if (musicPlay) {
    musicPlay.addEventListener("click", function () {
      if (currentTrackIndex < 0) {
        loadTrack(0, true);
        openMusicFloat();
        return;
      }
      if (audio.paused) {
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    });
  }

  if (musicPrev) musicPrev.addEventListener("click", function () {
    loadTrack(currentTrackIndex - 1, !audio.paused);
  });

  if (musicNext) musicNext.addEventListener("click", function () {
    loadTrack(currentTrackIndex + 1, !audio.paused);
  });

  if (musicBar) {
    musicBar.addEventListener("click", function (event) {
      if (!isFinite(audio.duration) || audio.duration <= 0) return;
      var rect = musicBar.getBoundingClientRect();
      var ratio = (event.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
    });
  }

  if (musicVol) {
    musicVol.addEventListener("input", function () {
      audio.volume = parseFloat(musicVol.value) || 0.82;
    });
  }

  renderTracklist();
  if (TRACKS.length) loadTrack(0, false);
})();
