let focusMinutes = 25;
let breakMinutes = 5;
let isFocus = true;
let timeLeft = focusMinutes * 60;
let timer = null;

const blockRuleId = 9999;
const whitelistDomains = [
  "notion.so",
  "chat.openai.com",
  "docs.google.com"
];

// Load saved focus/break values on startup
chrome.storage.sync.get(["focusMinutes", "breakMinutes"], (data) => {
  focusMinutes = data.focusMinutes || 25;
  breakMinutes = data.breakMinutes || 5;
  timeLeft = focusMinutes * 60;
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "start") {
    startTimer();
  } else if (msg.action === "stop") {
    stopTimer();
  } else if (msg.action === "getStatus") {
    sendResponse({
      timeLeft,
      isFocus,
      running: !!timer
    });
  } else if (msg.action === "saveTimes") {
    focusMinutes = msg.focus;
    breakMinutes = msg.break;
    stopTimer();
  }
});

function startTimer() {
  if (timer) return;

  timeLeft = (isFocus ? focusMinutes : breakMinutes) * 60;

  if (isFocus) {
    applyRedirectRule();
  } else {
    removeBlockRule();
  }

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      isFocus = !isFocus;

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: isFocus ? "Focus Time!" : "Break Time!",
        message: isFocus ? "Back to work 💪" : "Relax a bit 🧘",
        priority: 2
      });

      startTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  timeLeft = focusMinutes * 60;
  isFocus = true;
  removeBlockRule();
}

function applyRedirectRule() {
  const redirectPath = chrome.runtime.getURL("stayfocused.html");

  const rule = {
    id: blockRuleId,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: redirectPath }
    },
    condition: {
      urlFilter: "|http", // all http/https requests
      resourceTypes: ["main_frame"],
      excludedDomains: whitelistDomains
    }
  };

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [blockRuleId],
    addRules: [rule]
  });
}

function removeBlockRule() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [blockRuleId]
  });
}
