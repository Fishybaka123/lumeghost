// ===========================================
// CHURN ANALYZER SERVICE
// AI-powered churn prediction based on client data
// ===========================================

const ChurnAnalyzer = {
    /**
     * Analyze a client and calculate churn risk + health score
     */
    analyze(client) {
        const factors = [];
        let riskScore = 0;

        // Factor 1: Remaining Sessions (0-30 points)
        const sessionRisk = this.analyzeSessionsRemaining(client.remainingSessions);
        riskScore += sessionRisk.score;
        if (sessionRisk.factor) factors.push(sessionRisk.factor);

        // Factor 2: Expiration Date (0-35 points)
        const expiryRisk = this.analyzeExpiration(client.expireDate);
        riskScore += expiryRisk.score;
        if (expiryRisk.factor) factors.push(expiryRisk.factor);

        // Factor 3: Last Visit Recency (0-20 points)
        const visitRisk = this.analyzeLastVisit(client.lastVisit);
        riskScore += visitRisk.score;
        if (visitRisk.factor) factors.push(visitRisk.factor);

        // Factor 4: Membership Type (0-15 points)
        const membershipRisk = this.analyzeMembership(client.membershipType);
        riskScore += membershipRisk.score;
        if (membershipRisk.factor) factors.push(membershipRisk.factor);

        // Cap at 100
        const churnRisk = Math.min(100, Math.max(0, riskScore));
        const healthScore = Math.max(0, 100 - churnRisk);

        return {
            churnRisk,
            healthScore,
            riskFactors: factors,
            urgency: this.calculateUrgency(churnRisk, client.expireDate, client.remainingSessions),
            recommendation: this.getRecommendation(factors, client)
        };
    },

    /**
     * Analyze remaining sessions
     */
    analyzeSessionsRemaining(sessions) {
        if (sessions === 0) {
            return { score: 30, factor: 'No sessions remaining' };
        }
        if (sessions === 1) {
            return { score: 25, factor: 'Only 1 session left' };
        }
        if (sessions <= 3) {
            return { score: 15, factor: 'Low sessions remaining (≤3)' };
        }
        if (sessions <= 5) {
            return { score: 8, factor: null };
        }
        return { score: 0, factor: null };
    },

    /**
     * Analyze expiration date
     */
    analyzeExpiration(expireDate) {
        if (!expireDate) {
            return { score: 10, factor: 'No expiration date set' };
        }

        const today = new Date();
        const expiry = new Date(expireDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return { score: 35, factor: `Package expired ${Math.abs(daysUntilExpiry)} days ago` };
        }
        if (daysUntilExpiry <= 7) {
            return { score: 30, factor: `Package expires in ${daysUntilExpiry} days` };
        }
        if (daysUntilExpiry <= 14) {
            return { score: 22, factor: 'Package expires within 2 weeks' };
        }
        if (daysUntilExpiry <= 30) {
            return { score: 12, factor: 'Package expires within 1 month' };
        }
        return { score: 0, factor: null };
    },

    /**
     * Analyze last visit recency
     */
    analyzeLastVisit(lastVisit) {
        if (!lastVisit) {
            return { score: 20, factor: 'No visit history' };
        }

        const today = new Date();
        const visit = new Date(lastVisit);
        const daysSinceVisit = Math.ceil((today - visit) / (1000 * 60 * 60 * 24));

        if (daysSinceVisit > 90) {
            return { score: 20, factor: `No visit in ${daysSinceVisit} days` };
        }
        if (daysSinceVisit > 60) {
            return { score: 15, factor: 'No visit in over 2 months' };
        }
        if (daysSinceVisit > 30) {
            return { score: 8, factor: 'No visit in over 1 month' };
        }
        return { score: 0, factor: null };
    },

    /**
     * Analyze membership type
     */
    analyzeMembership(type) {
        switch (type) {
            case 'vip':
                return { score: 0, factor: null }; // VIPs are committed
            case 'premium':
                return { score: 5, factor: null };
            case 'basic':
                return { score: 10, factor: null };
            default:
                return { score: 15, factor: 'No active membership' };
        }
    },

    /**
     * Calculate urgency level for actions
     */
    calculateUrgency(churnRisk, expireDate, sessions) {
        if (churnRisk >= 70 || sessions === 0) return 'critical';
        if (churnRisk >= 50) return 'high';
        if (churnRisk >= 30) return 'medium';
        return 'low';
    },

    /**
     * Get recommendation based on risk factors
     */
    getRecommendation(factors, client) {
        if (factors.some(f => f.includes('expired'))) {
            return 'Send renewal offer with special discount';
        }
        if (factors.some(f => f.includes('No sessions'))) {
            return 'Offer package renewal before sessions run out';
        }
        if (factors.some(f => f.includes('expires in'))) {
            return 'Schedule remaining sessions before expiration';
        }
        if (factors.some(f => f.includes('No visit'))) {
            return 'Send re-engagement nudge with personalized offer';
        }
        return 'Maintain regular check-ins';
    },

    /**
     * Batch analyze multiple clients
     */
    analyzeAll(clients) {
        return clients.map(client => {
            const analysis = this.analyze(client);
            return {
                ...client,
                ...analysis
            };
        });
    }
};

// Export for use
window.ChurnAnalyzer = ChurnAnalyzer;
