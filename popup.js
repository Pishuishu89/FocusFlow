const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggleTheme");

document.getElementById("start").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start" });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
});

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function pollStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
    if (!res) return;
    timerEl.textContent = formatTime(res.timeLeft);
    statusEl.textContent = res.running
      ? res.isFocus
        ? "Focus Mode"
        : "Break Time"
      : "Ready";
  });
}

function applyTheme(theme) {
  document.body.className = theme;
}

chrome.storage.sync.get(["theme"], (data) => {
  applyTheme(data.theme || "light");
});

toggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(newTheme);
  chrome.storage.sync.set({ theme: newTheme });
});

setInterval(pollStatus, 1000);
pollStatus();
