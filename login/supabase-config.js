// ═══════════ Supabase Configuration ═══════════
// Uses the Supabase JS client for authentication (Google OAuth via signInWithOAuth)

const SUPABASE_URL = 'https://nqfnnihztqudfmxubtpt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZm5uaWh6dHF1ZGZteHVidHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDkyMTgsImV4cCI6MjA4ODI4NTIxOH0.2-RBAUEVKQSgoXIGKJAgBPTDoGLr3suRKFiiOZppLQc';

// Initialize the Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose on window so other scripts (like ai-service.js) can use it
window.supabase = supabaseClient;
