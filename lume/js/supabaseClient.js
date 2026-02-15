// ===========================================
// SUPABASE CLIENT INITIALIZATION
// ===========================================

// The Supabase JS library from CDN exposes 'supabase' as a global object
// containing createClient. We need to grab that before we overwrite
// window.supabase with the actual client instance.

let client = null;
const supabaseLib = window.supabase;

if (supabaseLib && supabaseLib.createClient) {
    if (window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_ANON_KEY) {
        client = supabaseLib.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
    } else {
        console.error('❌ Supabase credentials missing in CONFIG');
    }
} else {
    // Graceful fallback if SDK fails to load or createClient is missing
    console.error('❌ Supabase SDK not loaded or createClient missing');
}

// Export as global window.supabase (overwriting the library object)
window.supabase = client;
