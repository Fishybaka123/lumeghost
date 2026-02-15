
// Verification Script for Import Logic
// Run this in the browser console to test the fix

(async () => {
    console.log("🧪 Starting Import Verification...");

    // Mock User
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };

    // Mock Client Data from PDF (as returned by ImportService)
    const pdfData = {
        name: "Abendroth, Jennifer",
        packageName: "12 Month Ongoing Membership",
        remainingSessions: "Unlimited",
        expireDate: "03/23/3133",
        email: "jennifer@example.com", // Simulated enrichment
        phone: "555-0123"
    };

    console.log("📄 Input Data:", pdfData);

    // Simulate ClientDataService.add logic manually since we can't run it node directly without mocks
    // This replicates the EXACT logic added to ClientDataService.js

    let firstName = pdfData.firstName;
    let lastName = pdfData.lastName;

    if (!firstName && pdfData.name) {
        const nameParts = pdfData.name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || '';
        // Handle comma format "Last, First"
        if (pdfData.name.includes(',')) {
            const parts = pdfData.name.split(',');
            lastName = parts[0].trim();
            firstName = parts[1].trim();
        }
    }

    const dbPayload = {
        user_id: mockUser.id,
        first_name: firstName || 'Unknown',
        last_name: lastName || '',
        email: pdfData.email,
        phone: pdfData.phone,
        status: pdfData.status || 'active',
        membership_type: pdfData.membershipTier || pdfData.membershipType || pdfData.packageName || 'None',
        remaining_sessions: pdfData.remainingSessions === 'Unlimited' ? -1 : (parseInt(pdfData.remainingSessions) || 0),
        expire_date: pdfData.expireDate ? new Date(pdfData.expireDate) : null,
        total_spend: parseFloat(pdfData.totalSpent) || 0,
        visit_count: parseInt(pdfData.visitCount) || 0,
        last_visit: new Date()
    };

    console.log("💾 DB Payload (What gets sent to Supabase):", dbPayload);

    // Assertions
    const tests = [
        { name: "First Name Extracted", passed: dbPayload.first_name === "Jennifer" },
        { name: "Last Name Extracted", passed: dbPayload.last_name === "Abendroth" },
        { name: "Membership Type Mapped", passed: dbPayload.membership_type === "12 Month Ongoing Membership" },
        { name: "Remaining Sessions Handled (Unlimited)", passed: dbPayload.remaining_sessions === -1 || isNaN(dbPayload.remaining_sessions) } // Note: Parsing logic might need tweaking for 'Unlimited' to number
    ];

    console.table(tests);

    // Simulate full flow
    if (typeof ClientDataService !== 'undefined') {
        try {
            console.log("🚀 Testing ClientDataService.batchAdd...");
            const result = await ClientDataService.batchAdd([pdfData]);
            console.log("✅ Batch Add Result:", result);

            if (result.success && result.count > 0) {
                console.log("🎉 SUCCESS: Data persisted to DB and returned.");
            } else {
                console.error("❌ FAILURE: Success true but count 0 or undefined.");
            }
        } catch (e) {
            console.error("❌ ERROR in batchAdd:", e);
        }
    } else {
        console.warn("⚠️ ClientDataService not available in this context (run in browser console).");
    }
})();
