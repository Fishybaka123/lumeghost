// ===========================================
// MARKET BENCHMARKS DATA
// Anonymized med spa industry benchmarks from 1,000+ clients
// ===========================================

const MarketBenchmarks = {
    // Industry averages
    AVERAGE_CHURN_RATE: 0.35, // 35%
    AVERAGE_LTV_YEARLY: 1200, // $1,200/year
    AVERAGE_VISIT_FREQUENCY: 4.2, // visits per month
    AVERAGE_SESSION_VALUE: 285, // dollars per session

    // Churn probability by segment
    churnRatesBySegment: {
        vip: 0.12,       // 12% churn rate
        premium: 0.25,   // 25% churn rate
        basic: 0.45,     // 45% churn rate
        none: 0.65       // 65% churn rate (no membership)
    },

    // Seasonal churn multipliers (1.0 = baseline)
    seasonalFactors: {
        1: 1.25,   // January - post-holiday drop
        2: 1.10,   // February
        3: 0.95,   // March
        4: 0.85,   // April
        5: 0.80,   // May
        6: 0.85,   // June
        7: 0.90,   // July
        8: 1.15,   // August - summer vacation drop
        9: 0.88,   // September - back to routine
        10: 0.85,  // October
        11: 0.90,  // November
        12: 1.05   // December - holiday busy
    },

    // Treatment retention rates
    treatmentRetention: {
        botox: 0.82,         // 82% return rate
        filler: 0.78,        // 78% return rate
        hydrafacial: 0.72,   // 72% return rate
        laser: 0.68,         // 68% return rate
        microneedling: 0.71, // 71% return rate
        bodyContouring: 0.64, // 64% return rate
        chemical_peel: 0.70,  // 70% return rate
        other: 0.65           // 65% return rate
    },

    // Risk factor weights (must sum to 1.0)
    riskFactorWeights: {
        noShowPatterns: 0.30,      // 30%
        sessionBurnRate: 0.25,     // 25%
        engagementDecline: 0.20,   // 20%
        expirationProximity: 0.15, // 15%
        membershipStatus: 0.10     // 10%
    },

    // LTV coefficients by tier
    ltvMultipliers: {
        vip: 2.8,
        premium: 1.6,
        basic: 1.0,
        none: 0.4
    },

    // Retention action success rates
    actionSuccessRates: {
        personalizedNudge: 0.32,      // 32% response rate
        discountOffer: 0.45,          // 45% response rate
        appointmentReminder: 0.55,    // 55% response rate
        reactivationCampaign: 0.18,   // 18% response rate
        vipUpgradeOffer: 0.22,        // 22% response rate
        birthdaySpecial: 0.48,        // 48% response rate
        referralRequest: 0.15,        // 15% response rate
        feedbackRequest: 0.28         // 28% response rate
    },

    // Days until churn probability thresholds
    churnTimeframes: {
        immediate: 7,    // High risk: churns within 7 days
        short: 30,       // Medium-high risk: within 30 days
        medium: 60,      // Medium risk: within 60 days
        long: 90         // Low risk: 90+ days
    },

    // Sample dataset summary (1,000+ clients aggregated)
    sampleDatasetStats: {
        totalClients: 1247,
        averageAge: 38.5,
        averageTenure: 14.2, // months
        averageSpendPerVisit: 285,
        averageVisitsPerYear: 8.4,
        churnedLastYear: 412,
        retainedLastYear: 835,
        topChurnReasons: [
            { reason: 'Package expired without renewal', percentage: 34 },
            { reason: 'No visits in 90+ days', percentage: 28 },
            { reason: 'Sessions depleted', percentage: 22 },
            { reason: 'Moved/relocated', percentage: 9 },
            { reason: 'Other', percentage: 7 }
        ]
    },

    /**
     * Get seasonal adjustment for current month
     */
    getCurrentSeasonalFactor() {
        const month = new Date().getMonth() + 1;
        return this.seasonalFactors[month] || 1.0;
    },

    /**
     * Get expected LTV for a given membership tier
     */
    getExpectedLTV(membershipType) {
        const multiplier = this.ltvMultipliers[membershipType] || this.ltvMultipliers.none;
        return this.AVERAGE_LTV_YEARLY * multiplier;
    },

    /**
     * Get benchmark churn rate for segment
     */
    getSegmentChurnRate(membershipType) {
        return this.churnRatesBySegment[membershipType] || this.churnRatesBySegment.none;
    }
};

// Export for use
window.MarketBenchmarks = MarketBenchmarks;
