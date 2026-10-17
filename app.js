
/* VIBES NATION — SUPABASE CONNECTION FIX */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://snmvnbpbmagvcreqhyyj.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";

  function setStatus(message) {
    const status = document.getElementById("backendStatus");
    if (status) status.textContent = message;
  }

  function setAuthButton(user) {
    const button = document.getElementById("authOpen");
    if (button) {
      button.textContent = user ? "Sign out" : "Sign in";
    }
  }

  async function initVibesBackend() {
    if (!window.supabase ||
        typeof window.supabase.createClient !== "function") {
      setStatus("Connection error — Supabase library not loaded");
      console.error("Supabase library is unavailable.");
      return;
    }

    if (window.vibesSupabase) return;

    const sb = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    window.vibesSupabase = sb;
    setStatus("Connecting to Supabase...");

    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;

      const user = data.session?.user || null;
      setAuthButton(user);
      setStatus(
        user
          ? "Connected · " + (user.email || user.id)
          : "Supabase connected · Sign in to continue"
      );

      console.log("VIBES NATION: Supabase initialized.");
    } catch (error) {
      console.error("Supabase connection error:", error);
      setStatus("Connection error — check browser console");
    }

    sb.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setAuthButton(user);
      setStatus(
        user
          ? "Connected · " + (user.email || user.id)
          : "Supabase connected · Sign in to continue"
      );
    });

    window.refreshVibesConnection = async function () {
      try {
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;

        const user = data.session?.user || null;
        setAuthButton(user);
        setStatus(
          user
            ? "Connected · " + (user.email || user.id)
            : "Supabase connected · Sign in to continue"
        );
        return true;
      } catch (error) {
        console.error("Refresh connection failed:", error);
        setStatus("Connection error");
        return false;
      }
    };
  }

  function loadVibesSupabase() {
    if (window.supabase?.createClient) {
      initVibesBackend();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.async = true;

    script.onload = initVibesBackend;
    script.onerror = function () {
      setStatus("Connection error — could not load Supabase");
      console.error("Failed to load Supabase JavaScript.");
    };

    document.head.appendChild(script);
  }

  loadVibesSupabase();
})();
