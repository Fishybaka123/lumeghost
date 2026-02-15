
// Debug script to inspect Client Data and Health Score Calculation
const targetName = "Abendroth, Jennifer";

// 1. Find the client
const client = ClientDataService.getAll().find(c => c.name === targetName || c.name.includes("Abendroth"));

if (!client) {
    console.error(`Client "${targetName}" not found!`);
} else {
    console.log("=== CLIENT DATA ===");
    console.log("Name:", client.name);
    console.log("Remaining Sessions (Raw):", client.remainingSessions, typeof client.remainingSessions);
    console.log("Expire Date:", client.expireDate);
    console.log("Existing Health Score:", client.healthScore);

    // 2. Force Recalculation
    console.log("\n=== RECALCULATION ===");
    // Clear cache if possible or just call the internal method if accessible
    // We'll call analyze() which might hit cache, but let's see. 
    // If we can access the raw calculator:

    if (typeof AdvancedChurnCalculator !== 'undefined') {
        const metrics = AdvancedChurnCalculator.calculateHealthMetrics(client);
        console.log("Calculated Metrics:", JSON.stringify(metrics, null, 2));

        const fullAnalysis = AdvancedChurnCalculator.analyze(client);
        console.log("Full Analysis Health Score:", fullAnalysis.healthScore);
    } else {
        console.error("AdvancedChurnCalculator not found!");
    }
}
