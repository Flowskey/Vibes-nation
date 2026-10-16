
const cfg = window.VIBES_CONFIG || {};

const configured = Boolean(
  typeof cfg.supabaseUrl === "string" &&
  cfg.supabaseUrl.startsWith("https://") &&
  typeof cfg.supabaseAnonKey === "string" &&
  cfg.supabaseAnonKey.trim().length > 0
);

if (!configured) {
  console.error(
    "VIBES NATION: Supabase configuration is missing or invalid."
  );
} else {
  console.log("VIBES NATION: Supabase configuration detected.");
}

