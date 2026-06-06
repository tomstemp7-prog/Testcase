(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────────
  var script = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var CLIENT_ID = script.getAttribute("data-client") || "thrive";
  var API_BASE = (script.getAttribute("data-api") || "").replace(/\/$/, "");
  var PRIMARY_COLOR = script.getAttribute("data-color") || "#FF5C35";
  var WELCOME_MSG =
    "Hi! I'm the Thrive London assistant. Ask me anything about our coffee machines, service plans, or getting a quote.";
  var ERROR_MSG =
    "Sorry, something went wrong. Please try again or call us on 020 3151 2000.";

  // ── State ─────────────────────────────────────────────────────────────────
  var conversationHistory = [];
  var isOpen = false;
  var isTyping = false;

  // ── CSS ───────────────────────────────────────────────────────────────────
  var css = [
    "#tcw-bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:" + PRIMARY_COLOR + ";cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.22);z-index:2147483646;border:none;transition:transform .15s ease,box-shadow .15s ease;}",
    "#tcw-bubble:hover{transform:scale(1.07);box-shadow:0 6px 20px rgba(0,0,0,.28);}",
    "#tcw-bubble svg{width:26px;height:26px;fill:#fff;transition:opacity .15s;}",
    "#tcw-window{position:fixed;bottom:92px;right:24px;width:380px;height:520px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18);display:flex;flex-direction:column;z-index:2147483645;background:#fff;transform:scale(.92) translateY(12px);opacity:0;pointer-events:none;transition:transform .2s ease,opacity .2s ease;}",
    "#tcw-window.tcw-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}",
    "#tcw-header{background:" + PRIMARY_COLOR + ";padding:16px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}",
    "#tcw-header-title{color:#fff;font-weight:700;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.01em;}",
    "#tcw-close{background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:6px;opacity:.85;transition:opacity .15s;}",
    "#tcw-close:hover{opacity:1;}",
    "#tcw-close svg{width:18px;height:18px;fill:#fff;}",
    "#tcw-messages{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:#fafafa;}",
    "#tcw-messages::-webkit-scrollbar{width:4px;}",
    "#tcw-messages::-webkit-scrollbar-track{background:transparent;}",
    "#tcw-messages::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}",
    ".tcw-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;word-break:break-word;}",
    ".tcw-msg a{color:inherit;text-decoration:underline;}",
    ".tcw-bot{align-self:flex-start;background:#eef0f2;color:#1a1a1a;border-bottom-left-radius:4px;}",
    ".tcw-user{align-self:flex-end;background:" + PRIMARY_COLOR + ";color:#fff;border-bottom-right-radius:4px;}",
    ".tcw-error{align-self:flex-start;background:#fff0ee;color:#c0392b;border:1px solid #f5c6c2;border-bottom-left-radius:4px;}",
    "#tcw-typing{align-self:flex-start;background:#eef0f2;padding:12px 16px;border-radius:14px;border-bottom-left-radius:4px;display:flex;gap:5px;align-items:center;}",
    ".tcw-dot{width:7px;height:7px;border-radius:50%;background:#aab0b8;animation:tcw-bounce 1.2s infinite ease-in-out;}",
    ".tcw-dot:nth-child(2){animation-delay:.2s;}",
    ".tcw-dot:nth-child(3){animation-delay:.4s;}",
    "@keyframes tcw-bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}",
    "#tcw-footer{padding:10px 12px;border-top:1px solid #e8eaed;background:#fff;flex-shrink:0;}",
    "#tcw-form{display:flex;gap:8px;align-items:center;}",
    "#tcw-input{flex:1;border:1.5px solid #e0e2e6;border-radius:10px;padding:9px 13px;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;outline:none;transition:border-color .15s;resize:none;background:#fff;color:#1a1a1a;}",
    "#tcw-input:focus{border-color:" + PRIMARY_COLOR + ";}",
    "#tcw-input::placeholder{color:#b0b5be;}",
    "#tcw-send{background:" + PRIMARY_COLOR + ";border:none;border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:opacity .15s;}",
    "#tcw-send:hover{opacity:.88;}",
    "#tcw-send:disabled{opacity:.45;cursor:not-allowed;}",
    "#tcw-send svg{width:17px;height:17px;fill:#fff;}",
    "#tcw-powered{text-align:center;font-size:11px;color:#b8bcc4;margin-top:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}",
    "@media(max-width:440px){#tcw-window{width:calc(100vw - 20px);right:10px;bottom:82px;height:calc(100dvh - 110px);border-radius:12px;}#tcw-bubble{right:12px;bottom:14px;}}",
  ].join("");

  // ── Inject CSS ─────────────────────────────────────────────────────────────
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Build DOM ──────────────────────────────────────────────────────────────
  // Chat bubble
  var bubble = document.createElement("button");
  bubble.id = "tcw-bubble";
  bubble.setAttribute("aria-label", "Open chat");
  bubble.innerHTML =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  // Chat window
  var win = document.createElement("div");
  win.id = "tcw-window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", "Thrive London chat assistant");

  // Header
  var header = document.createElement("div");
  header.id = "tcw-header";
  header.innerHTML =
    '<span id="tcw-header-title">Thrive London</span>' +
    '<button id="tcw-close" aria-label="Close chat">' +
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
    "</button>";

  // Messages container
  var messagesEl = document.createElement("div");
  messagesEl.id = "tcw-messages";
  messagesEl.setAttribute("aria-live", "polite");

  // Footer / input
  var footer = document.createElement("div");
  footer.id = "tcw-footer";
  footer.innerHTML =
    '<form id="tcw-form" autocomplete="off">' +
    '<input id="tcw-input" type="text" placeholder="Ask a question..." maxlength="1000" aria-label="Type your message" />' +
    '<button id="tcw-send" type="submit" aria-label="Send message">' +
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
    "</button>" +
    "</form>" +
    '<div id="tcw-powered">Powered by AI</div>';

  win.appendChild(header);
  win.appendChild(messagesEl);
  win.appendChild(footer);

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function appendMessage(text, type) {
    // type: 'bot' | 'user' | 'error'
    var el = document.createElement("div");
    el.className = "tcw-msg tcw-" + type;
    // Safely set text; linkify URLs
    el.innerHTML = linkify(escapeHtml(text));
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function linkify(str) {
    return str.replace(
      /(https?:\/\/[^\s<>"']+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    var el = document.createElement("div");
    el.id = "tcw-typing";
    el.innerHTML =
      '<div class="tcw-dot"></div><div class="tcw-dot"></div><div class="tcw-dot"></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById("tcw-typing");
    if (el) el.parentNode.removeChild(el);
    isTyping = false;
  }

  function setInputDisabled(disabled) {
    var input = document.getElementById("tcw-input");
    var send = document.getElementById("tcw-send");
    if (input) input.disabled = disabled;
    if (send) send.disabled = disabled;
  }

  // ── Open / Close ───────────────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    win.classList.add("tcw-open");
    bubble.setAttribute("aria-expanded", "true");
    var input = document.getElementById("tcw-input");
    if (input) setTimeout(function () { input.focus(); }, 220);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove("tcw-open");
    bubble.setAttribute("aria-expanded", "false");
  }

  bubble.addEventListener("click", function () {
    isOpen ? closeChat() : openChat();
  });

  document.getElementById("tcw-close").addEventListener("click", closeChat);

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) closeChat();
  });

  // ── Send message ───────────────────────────────────────────────────────────
  document.getElementById("tcw-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("tcw-input");
    var text = (input.value || "").trim();
    if (!text || isTyping) return;

    input.value = "";
    appendMessage(text, "user");
    sendMessage(text);
  });

  function sendMessage(text) {
    setInputDisabled(true);
    showTyping();

    var payload = {
      message: text,
      client_id: CLIENT_ID,
      conversation_history: conversationHistory,
    };

    fetch(API_BASE + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().catch(function () { return null; }).then(function (body) {
            throw new Error((body && body.detail) || "HTTP " + res.status);
          });
        }
        return res.json();
      })
      .then(function (data) {
        hideTyping();
        conversationHistory = data.conversation_history || [];
        appendMessage(data.response, "bot");
      })
      .catch(function (err) {
        hideTyping();
        console.error("[Thrive chatbot]", err);
        appendMessage(ERROR_MSG, "error");
      })
      .finally(function () {
        setInputDisabled(false);
        var input = document.getElementById("tcw-input");
        if (input) input.focus();
      });
  }

  // ── Welcome message ────────────────────────────────────────────────────────
  appendMessage(WELCOME_MSG, "bot");
})();
