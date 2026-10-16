

/* VIBES NATION — SUPABASE CONNECTION FIX */

function initVibesBackend() {
  const SUPABASE_URL =
    "https://snmvnbpbmagvcreqhyyj.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Admin client that bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)


  const status = document.getElementById("backendStatus");
  const authOpen = document.getElementById("authOpen");

  if (!window.supabase ||
      typeof window.supabase.createClient !== "function") {
    if (status) {
      status.textContent =
        "Connection error — Supabase library not loaded";
    }
    console.error("Supabase JavaScript library is unavailable.");
    return;
  }

  const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  window.vibesSupabase = sb;

  if (status) {
    status.textContent = "Connecting to Supabase...";
  }

  sb.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;

      const user = data.session?.user || null;

      if (authOpen) {
        authOpen.textContent = user ? "Sign out" : "Sign in";
      }

      if (status) {
        status.textContent = user
          ? "Connected · " + user.email
          : "Supabase connected · Sign in to continue";
      }

      console.log(
        "VIBES NATION Supabase initialized successfully."
      );
    })
    .catch(error => {
      console.error("Supabase connection error:", error);

      if (status) {
        status.textContent =
          "Connection error — check browser console";
      }
    });

  sb.auth.onAuthStateChange((_event, session) => {
    const user = session?.user || null;

    if (authOpen) {
      authOpen.textContent = user ? "Sign out" : "Sign in";
    }

    if (status) {
      status.textContent = user
        ? "Connected · " + user.email
        : "Supabase connected · Sign in to continue";
    }
  });

  window.refreshVibesConnection = async function () {
    const { data, error } = await sb.auth.getSession();

    if (error) {
      console.error(error);
      if (status) status.textContent = "Connection error";
      return false;
    }

    if (status) {
      status.textContent = data.session?.user
        ? "Connected · " + data.session.user.email
        : "Supabase connected · Sign in to continue";
    }

    return true;
  };
}

/* Load Supabase library before initializing the connection. */
(function loadVibesSupabase() {
  if (window.supabase?.createClient) {
    initVibesBackend();
    return;
  }

  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.async = true;

  script.onload = initVibesBackend;

  script.onerror = function () {
    const status = document.getElementById("backendStatus");

    if (status) {
      status.textContent =
        "Connection error — could not load Supabase";
    }

    console.error(
      "Failed to download the Supabase JavaScript library."
    );
  };

  document.head.appendChild(script);
})();
