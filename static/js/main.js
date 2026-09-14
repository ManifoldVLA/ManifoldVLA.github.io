// Playback speed per video group (change to adjust)
const PLAYBACK_RATE = 2;      // 2x -- the page text says so
const SIM_PLAYBACK_RATE = 2;  // simulation compare clips

function pinRate(v, rate) {
  v.playbackRate = rate;
  // re-apply after seeking/reload — some browsers reset the rate
  v.addEventListener('loadedmetadata', () => { v.playbackRate = rate; });
  v.addEventListener('play', () => { v.playbackRate = rate; });
}

document.querySelectorAll('.teaser-video video, .video-card video').forEach((v) => {
  const rate = v.closest('.sim-grid') ? SIM_PLAYBACK_RATE : PLAYBACK_RATE;
  pinRate(v, rate);
});

// ---- Live phase badge on the teaser video ----
// Phase boundaries in *source* seconds (playbackRate does not shift them).
// Clip: static/videos/hero.mp4 = both_2 with 7.0-11.5 s removed.
// READ OFF THE FOOTAGE, not off the run log — replace with the logged
// phase-transition timestamps before this page is deployed.
const PHASE_TIMES = [
  { t: 0.0,  key: 'transport-object',  label: 'transport \u2192 cup' },
  { t: 5.5,  key: 'grasp',             label: 'handoff \u2192 frozen VLA grasps' },
  { t: 8.2,  key: 'transport-basket',  label: 'transport \u2192 box (cup attached)' },
  { t: 11.5, key: 'place',             label: 'handoff \u2192 frozen VLA places' },
  { t: 12.9, key: 'done',              label: 'sub-task goal reached' },
];

(function () {
  const video = document.getElementById('teaser-video');
  const badge = document.getElementById('phase-badge');
  if (!video || !badge) return;
  const textEl = badge.querySelector('.phase-text');

  function currentPhase(time) {
    let cur = PHASE_TIMES[0];
    for (const p of PHASE_TIMES) {
      if (time >= p.t) cur = p; else break;
    }
    return cur;
  }

  function paint() {
    const p = currentPhase(video.currentTime);
    if (badge.dataset.phase !== p.key) {
      badge.dataset.phase = p.key;
      textEl.textContent = p.label;
    }
  }

  // rAF keeps it smooth while the tab is visible, but Chrome suspends rAF in a
  // hidden tab and it never fires on a seek-while-paused. The media events do.
  function loop() { paint(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  ['timeupdate', 'seeking', 'seeked', 'play', 'pause', 'loadedmetadata']
    .forEach((e) => video.addEventListener(e, paint));
  paint();
})();

// ---- Click-to-zoom lightbox for phase panel images ----
(function () {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const big = box.querySelector('img');
  document.querySelectorAll('.phase-img img').forEach((img) => {
    img.addEventListener('click', () => {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.classList.add('open');
    });
  });
  box.addEventListener('click', () => box.classList.remove('open'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') box.classList.remove('open');
  });
})();
