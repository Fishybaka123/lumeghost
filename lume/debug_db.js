
// Debug Script for Supabase Insertion
// Run this in the console

(async () => {
    console.log("🐞 Starting DB Debug...");

    if (typeof supabase === 'undefined') {
        console.error("❌ Supabase client not found!");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("❌ No active user session!");
        return;
    }
    console.log("👤 Current User:", user.id);

    // 1. Check existing count
    const countResult = await supabase.from('clients').select('count', { count: 'exact' });
    console.log("📊 Current DB Count:", countResult.count);

    // 2. Attempt Manual Insert (Simulating ClientDataService)
    const testPayload = {
        user_id: user.id,
        first_name: "Debug",
        last_name: "Tester",
        email: "debug-" + Date.now() + "@example.com",
        status: "active",
        membership_type: "Debug Tier",
        remaining_sessions: 99,
        created_at: new Date(),
        updated_at: new Date()
    };

    console.log("🚀 Attempting Insert:", testPayload);

    const { data, error } = await supabase
        .from('clients')
        .insert([testPayload])
        .select();

    if (error) {
        console.error("❌ Insert Failed:", error);
    } else {
        console.log("✅ Insert Success:", data);
        if (data.length === 0) {
            console.error("⚠️ Insert Success but NO DATA returned. RLS Policy Issue?");
        }
    }

    // 3. Verify it's in the list
    const checkResult = await supabase
        .from('clients')
        .select('*')
        .eq('email', testPayload.email);

    console.log("🔍 Verification Fetch:", checkResult.data);
})();
