/* app.js - Watch & Earn Logic */

const LS_KEY_USER = 'we_user';
const LS_KEY_BAL = 'we_balance';

// Helper functions
function getUser() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_USER)) || { name: "Guest" }; }
  catch { return { name: "Guest" }; }
}

function getBalance() {
  return parseInt(localStorage.getItem(LS_KEY_BAL) || '0', 10);
}

function setBalance(v) {
  localStorage.setItem(LS_KEY_BAL, String(v));
}

// Random ad duration (mostly 30s)
function chooseAdDuration() {
  const r = Math.random();
  if (r < 0.7) return 30; // 70% chance
  if (r < 0.9) return 20; // 20% chance
  return 10; // 10% chance
}

// Coin animation
function spawnCoins(count = 15) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement("div");
    c.className = "coin";
    c.style.left = `${window.innerWidth / 2}px`;
    c.style.top = `${window.innerHeight / 2}px`;
    document.body.appendChild(c);

    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.5) * 400;

    c.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 1000, easing: "ease-out" }
    ).onfinish = () => c.remove();
  }
}

// Confetti animation
function burstConfetti(count = 30) {
  for (let i = 0; i < count; i++) {
    const conf = document.createElement("div");
    conf.style.position = "fixed";
    conf.style.width = "10px";
    conf.style.height = "10px";
    conf.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
    conf.style.left = `${Math.random() * 100}%`;
    conf.style.top = "0";
    conf.style.zIndex = 9999;
    document.body.appendChild(conf);

    conf.animate(
      [{ transform: "translateY(0)" }, { transform: `translateY(${window.innerHeight}px)` }],
      { duration: 2000 + Math.random() * 1000 }
    ).onfinish = () => conf.remove();
  }
}

// Rewards Page Logic
if (window.location.pathname.includes("rewards.html")) {
  const watchBtn = document.getElementById("watchBtn");
  const skipBtn = document.getElementById("skipBtn");
  const timerEl = document.getElementById("timer");
  const progressBar = document.getElementById("progressBar");
  const balanceDisplay = document.getElementById("balance");
  const adVideo = document.getElementById("adVideo");
  const adPlaceholder = document.getElementById("adPlaceholder");

  const adVideos = [
    "https://cdn.pixabay.com/vimeo/724171392/abstract-121134.mp4",
    "https://cdn.pixabay.com/vimeo/765875986/marketing-138923.mp4",
    "https://cdn.pixabay.com/vimeo/808585970/advertising-141497.mp4"
  ];

  let balance = getBalance();
  let duration = 0;
  let elapsed = 0;
  let watching = false;
  let intervalId = null;

  function updateBalanceUI() {
    balanceDisplay.textContent = balance;
  }

  function loadRandomAd() {
    const ad = adVideos[Math.floor(Math.random() * adVideos.length)];
    adVideo.src = ad;
    adVideo.style.display = "block";
    adPlaceholder.style.display = "none";
    adVideo.play();
  }

  function startAd() {
    if (watching) return;
    duration = chooseAdDuration();
    elapsed = 0;
    watching = true;
    loadRandomAd();

    watchBtn.disabled = true;
    skipBtn.disabled = true;
    setTimeout(() => (skipBtn.disabled = false), 5000);

    timerEl.textContent = duration;
    progressBar.style.width = "0%";

    intervalId = setInterval(() => {
      elapsed++;
      const remaining = duration - elapsed;
      timerEl.textContent = remaining;
      progressBar.style.width = `${(elapsed / duration) * 100}%`;

      if (elapsed >= duration) {
        clearInterval(intervalId);
        completeAd();
      }
    }, 1000);
  }

  function completeAd() {
    adVideo.pause();
    adVideo.style.display = "none";
    adPlaceholder.style.display = "block";
    watching = false;

    const reward = duration === 30 ? 50 : duration === 20 ? 35 : 20;
    balance += reward;
    setBalance(balance);
    updateBalanceUI();

    spawnCoins(25);
    burstConfetti(40);

    alert(`🎉 You earned ${reward} coins for watching a ${duration}s ad!`);
    watchBtn.disabled = false;
    skipBtn.disabled = true;
  }

  skipBtn.addEventListener("click", () => {
    if (!watching) return;
    if (!confirm("Skip the ad? You will not earn coins.")) return;
    clearInterval(intervalId);
    adVideo.pause();
    adVideo.style.display = "none";
    adPlaceholder.style.display = "block";
    watching = false;
    watchBtn.disabled = false;
    skipBtn.disabled = true;
    timerEl.textContent = "0";
  });

  watchBtn.addEventListener("click", startAd);

  updateBalanceUI();
}
