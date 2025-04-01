const focusInput = document.getElementById("focusInput");
const breakInput = document.getElementById("breakInput");
const savedMsg = document.getElementById("saved");
const toggleBtn = document.getElementById("toggleTheme");

chrome.storage.sync.get(["focusMinutes", "breakMinutes", "theme"], (data) => {
  focusInput.value = data.focusMinutes || 25;
  breakInput.value = data.breakMinutes || 5;
  applyTheme(data.theme || "light");
});

document.getElementById("save").addEventListener("click", () => {
  const focus = parseInt(focusInput.value);
  const breakT = parseInt(breakInput.value);
  chrome.storage.sync.set({ focusMinutes: focus, breakMinutes: breakT });
  chrome.runtime.sendMessage({ action: "saveTimes", focus, break: breakT });
  savedMsg.style.display = "inline";
});

function applyTheme(theme) {
  document.body.className = theme;
}

toggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(newTheme);
  chrome.storage.sync.set({ theme: newTheme });
});
