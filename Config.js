// VIBES NATION - FINAL FIX - READY TO PASTE
const SUPABASE_URL = "https://snmvnbpbmagvcreqxyyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXZuYnBibWFndmNyZXFoeXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjE3NjEsImV4cCI6MjEwNzYzNzc2MX0.qlrg7DZBuySqgQTrpRQJ2cetkNO1eFzM00_vrnPRQlA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = supabaseClient;
