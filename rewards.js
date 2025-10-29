// ============================
// REWARDS SYSTEM SCRIPT
// ============================

// DOM elements
const watchBtn = document.getElementById("watchNow");
const skipBtn = document.getElementById("skipNow");
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const adPlaceholder = document.getElementById("adPlaceholder");
const balanceDisplay = document.getElementById("balanceDisplay");
const historyDiv = document.getElementById("history");

let balanceCoins = 0;
let adTimer = null;
let adDuration = 30;
let timeLeft = 30;

// Convert coins → Ksh (10 coins = 10 Ksh)
const coinsToKsh = coins => coins;

// Convert Ksh → coins (same ratio)
const kshToCoins = ksh => ksh;

// Random ad duration generator (10, 20, or 30s)
function getRandomDuration() {
  const random = Math.random();
  if (random < 0.2) return 10;
  else if (random < 0.5) return 20;
  else return 30; // most frequent
}

// Update displayed balance
function updateBalanceDisplay() {
  balanceDisplay.textContent = `${balanceCoins} Coins (~${coinsToKsh(balanceCoins)} Ksh)`;
}

// Add activity to history
function logHistory(action, detail) {
  const entry = document.createElement("div");
  entry.className = "small";
  entry.textContent = `${new Date().toLocaleTimeString()} — ${action}: ${detail}`;
  historyDiv.prepend(entry);
}

// ============================
// WATCH AD FUNCTION
// ============================
watchBtn.addEventListener("click", () => {
  adDuration = getRandomDuration();
  timeLeft = adDuration;
  timerDisplay.textContent = timeLeft;

  adPlaceholder.innerHTML = `<h3>📺 Ad playing... please wait</h3><p>Ad duration: ${adDuration}s</p>`;
  progressBar.style.width = "0%";
  progressBar.style.background = "#0f0";
  progressBar.style.transition = "width 1s linear";

  watchBtn.disabled = true;
  skipBtn.disabled = false;

  adTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    progressBar.style.width = `${((adDuration - timeLeft) / adDuration) * 100}%`;

    if (timeLeft <= 0) {
      clearInterval(adTimer);
      adCompleted();
    }
  }, 1000);
});

skipBtn.addEventListener("click", () => {
  clearInterval(adTimer);
  adPlaceholder.innerHTML = `<h3>⏭ Ad Skipped</h3><p>No coins earned.</p>`;
  progressBar.style.width = "0%";
  watchBtn.disabled = false;
  skipBtn.disabled = true;
  logHistory("Ad Skipped", "User skipped ad before completion.");
});

// ============================
// AD COMPLETED FUNCTION
// ============================
function adCompleted() {
  const coinsEarned = Math.floor(Math.random() * 50) + 20; // 20–70 coins
  balanceCoins += coinsEarned;

  adPlaceholder.innerHTML = `<h3>🎉 Ad Complete!</h3><p>You earned <b>${coinsEarned} coins</b> (~${coinsToKsh(coinsEarned)} Ksh)</p>`;
  updateBalanceDisplay();
  logHistory("Ad Completed", `+${coinsEarned} coins earned`);
  progressBar.style.width = "100%";
  watchBtn.disabled = false;
  skipBtn.disabled = true;
}

// ============================
// REDEEM LOGIC
// ============================
document.querySelectorAll("[data-reward]").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-reward");
    const cost = type === "paypal" ? 500 : 300; // coin cost for redemption

    const kshEquivalent = coinsToKsh(balanceCoins);

    if (kshEquivalent < 500) {
      alert("⚠️ You must have at least 500 Ksh (500 coins) to withdraw.");
      return;
    }

    if (balanceCoins < cost) {
      alert("Not enough coins to redeem this reward.");
      return;
    }

    balanceCoins -= cost;
    updateBalanceDisplay();
    logHistory("Redeemed", `${type.toUpperCase()} - ${cost} coins`);
    alert(`✅ ${type.toUpperCase()} redemption successful!`);
  });
});

// ============================
// INITIAL SETUP
// ============================
updateBalanceDisplay();
logHistory("System", "Ready to watch ads and earn rewards!");
