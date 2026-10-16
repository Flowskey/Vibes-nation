/* VIBES NATION — Supabase-connected app.js */
(() => {
  "use strict";

  const SUPABASE_URL = "https://snmvnbpbmagvcreqhyyj.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFxeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";

  localStorage.removeItem("demoMode");
  window.DEMO_MODE = false;

  if (!window.supabase?.createClient) {
    alert("Supabase library is missing. Check index.html.");
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  window.vibesSupabase = db;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const state = {
    user: null,
    profile: null,
    posts: [],
    chats: [],
    activeChat: null,
    likes: new Set(),
    activeFilter: "all",
    stories: [],
    realtime: null
  };

  const escapeHTML = s =>
    String(s ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  const initials = name =>
    String(name || "VN")
      .trim()
      .split(/\s+/)
      .map(x => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VN";

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  }

  const avatarClass = id =>
    ["grad1", "grad2", "grad3", "grad4", "grad5"][
      Math.abs(hash(String(id || ""))) % 5
    ];

  function ago(date) {
    const ms = Date.now() - new Date(date).getTime();
    if (!Number.isFinite(ms)) return "just now";

    const m = Math.max(0, Math.floor(ms / 60000));
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;

    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;

    return `${Math.floor(h / 24)} d ago`;
  }

  function toast(msg) {
    const t = $("#toast");
    if (!t) {
      console.log(msg);
      return;
    }

    t.textContent = msg;
    t.classList.add("show");

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(
      () => t.classList.remove("show"),
      2800
    );
  }

  function errorMessage(error) {
    console.error(error);
    return error?.message || "Something went wrong. Please try again.";
  }

  function requireLogin() {
    if (state.user) return true;

    openAuth("signin");
    toast("Please sign in to continue.");
    return false;
  }

  /* AUTHENTICATION UI */

  function installAuthUI() {
    if ($("#vnAuthBackdrop")) return;

    const style = document.createElement("style");

    style.textContent = `
      #vnAuthBackdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #080610d9;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
      }

      #vnAuthBackdrop.vn-hidden {
        display: none;
      }

      .vn-auth-card {
        width: min(440px, 100%);
        background: #171322;
        color: #fff;
        border: 1px solid #ffffff20;
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 20px 80px #0008;
      }

      .vn-auth-card h2 { margin: 0 0 8px; }

      .vn-auth-card p {
        color: #c8bfd9;
        font-size: 14px;
      }

      .vn-auth-card label {
        display: block;
        margin: 12px 0 5px;
        font-size: 13px;
      }

      .vn-auth-card input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        border-radius: 9px;
        border: 1px solid #ffffff30;
        background: #0f0c17;
        color: #fff;
      }

      .vn-auth-row {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .vn-auth-row button,
      .vn-auth-link {
        cursor: pointer;
        border: 0;
        border-radius: 9px;
        padding: 11px 14px;
      }

      .vn-auth-primary {
        background: #9d6bff;
        color: white;
        flex: 1;
      }

      .vn-auth-secondary {
        background: #ffffff14;
        color: #fff;
      }

      .vn-auth-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 14px;
        gap: 10px;
        flex-wrap: wrap;
      }

      .vn-auth-link {
        background: transparent;
        color: #c6a9ff;
        padding: 5px;
      }

      #vnAuthError {
        color: #ffaaaa;
        min-height: 18px;
        margin-top: 10px;
      }

      #vnAuthStatus {
        font-size: 13px;
        color: #b7f2d4;
        margin-top: 8px;
      }

      #vnUserBar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin: 8px 0;
      }

      #vnUserBar button { cursor: pointer; }
    `;

    document.head.appendChild(style);

    const backdrop = document.createElement("div");
    backdrop.id = "vnAuthBackdrop";
    backdrop.className = "vn-hidden";

    backdrop.innerHTML = `
      <section class="vn-auth-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vnAuthTitle">

        <h2 id="vnAuthTitle">Welcome to VIBES NATION</h2>
        <p id="vnAuthSubtitle">Sign in to your account.</p>

        <form id="vnAuthForm">

          <div id="vnNameWrap" hidden>
            <label for="vnDisplayName">Display name</label>
            <input id="vnDisplayName"
              maxlength="60"
              autocomplete="name"
              placeholder="Your name">

            <label for="vnUsername">Username</label>
            <input id="vnUsername"
              maxlength="24"
              pattern="[A-Za-z0-9_]+"
              placeholder="e.g. hussain_vibes"
              autocomplete="username">
          </div>

          <label for="vnEmail">Email</label>
          <input id="vnEmail"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com">

          <label for="vnPassword">Password</label>
          <input id="vnPassword"
            type="password"
            required
            minlength="6"
            autocomplete="current-password"
            placeholder="At least 6 characters">

          <div id="vnAuthError" role="alert"></div>
          <div id="vnAuthStatus" aria-live="polite"></div>

          <div class="vn-auth-row">
            <button class="vn-auth-primary"
              id="vnAuthSubmit"
              type="submit">Sign in</button>

            <button class="vn-auth-secondary"
              type="button"
              id="vnAuthClose">Close</button>
          </div>
        </form>

        <div class="vn-auth-foot">
          <span id="vnAuthSwitchText">New to VIBES NATION?</span>

          <button class="vn-auth-link"
            type="button"
            id="vnAuthSwitch">Create account</button>

          <button class="vn-auth-link"
            type="button"
            id="vnForgot">Forgot password?</button>
        </div>
      </section>
    `;

    document.body.appendChild(backdrop);

    $("#vnAuthClose").onclick = () =>
      backdrop.classList.add("vn-hidden");

    $("#vnAuthSwitch").onclick = () =>
      openAuth(authMode === "signin" ? "signup" : "signin");

    $("#vnForgot").onclick = resetPassword;
    $("#vnAuthForm").onsubmit = handleAuthSubmit;

    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) {
        backdrop.classList.add("vn-hidden");
      }
    });

    const bar = document.createElement("div");
    bar.id = "vnUserBar";

    const anchor = $("#pageTitle")?.parentElement || document.body;
    anchor.appendChild(bar);
  }

  let authMode = "signin";

  function openAuth(mode = "signin") {
    installAuthUI();
    authMode = mode;

    $("#vnAuthBackdrop").classList.remove("vn-hidden");

    $("#vnAuthTitle").textContent =
      mode === "signup"
        ? "Create your VIBES NATION account"
        : "Welcome back";

    $("#vnAuthSubtitle").textContent =
      mode === "signup"
        ? "Create an account to post and message securely."
        : "Sign in to continue to your community.";

    $("#vnNameWrap").hidden = mode !== "signup";

    $("#vnAuthSubmit").textContent =
      mode === "signup" ? "Create account" : "Sign in";

    $("#vnAuthSwitchText").textContent =
      mode === "signup"
        ? "Already have an account?"
        : "New to VIBES NATION?";

    $("#vnAuthSwitch").textContent =
      mode === "signup" ? "Sign in" : "Create account";

    $("#vnForgot").hidden = mode === "signup";

    $("#vnAuthError").textContent = "";
    $("#vnAuthStatus").textContent = "";
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = $("#vnEmail").value.trim().toLowerCase();
    const password = $("#vnPassword").value;

    const error = $("#vnAuthError");
    const status = $("#vnAuthStatus");
    const submit = $("#vnAuthSubmit");

    error.textContent = "";
    status.textContent = "";
    submit.disabled = true;

    try {
      if (authMode === "signup") {
        const displayName = $("#vnDisplayName").value.trim();

        const username = $("#vnUsername")
          .value.trim()
          .toLowerCase()
          .replace(/^@/, "");

        if (
          !displayName ||
          !/^[a-z0-9_]{3,24}$/.test(username)
        ) {
          throw new Error(
            "Enter your display name and a username (3–24 letters, numbers or underscores)."
          );
        }

        const { data, error: signError } =
          await db.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
                username
              }
            }
