// ===========================================
// ADVANCED CHURN CALCULATOR
// ML-powered churn prediction with ensemble methods
// ===========================================

const AdvancedChurnCalculator = {
    // Cache for performance optimization
    _cache: new Map(),
    _cacheTimeout: 60000, // 1 minute cache

    /**
     * Comprehensive client analysis with all predictions
     * Target: <500ms execution time
     */
    analyze(client) {
        const startTime = performance.now();

        // Check cache
        const cacheKey = `${client.id}_${JSON.stringify(client)}`;
        const cached = this._getFromCache(cacheKey);
        if (cached) return cached;

        // Calculate all metrics
        const healthMetrics = this.calculateHealthMetrics(client);
        const churnPrediction = this.predictChurn(client, healthMetrics);
        const ltvProjection = this.calculateLTV(client, churnPrediction);
        const riskBreakdown = this.calculateRiskBreakdown(client);
        const retentionActions = this.getRetentionActions(client, churnPrediction, riskBreakdown);

        const result = {
            // Core scores
            healthScore: healthMetrics.overall,
            churnRisk: Math.round(churnPrediction.probability * 100),

            // Sub-metrics
            healthMetrics: {
                engagement: healthMetrics.engagement,
                loyalty: healthMetrics.loyalty,
                satisfaction: healthMetrics.satisfaction,
                overall: healthMetrics.overall
            },

            // Churn prediction
            churnPrediction: {
                probability: churnPrediction.probability,
                predictedDate: churnPrediction.predictedDate,
                confidenceInterval: churnPrediction.confidenceInterval,
                daysUntilChurn: churnPrediction.daysUntilChurn,
                confidence: churnPrediction.confidence
            },

            // LTV
            lifetime: {
                currentLTV: ltvProjection.currentLTV,
                projectedLTV: ltvProjection.projectedLTV,
                churnAdjustedLTV: ltvProjection.churnAdjustedLTV,
                monthlyValue: ltvProjection.monthlyValue,
                confidenceRange: ltvProjection.confidenceRange
            },

            // Risk factors
            riskBreakdown: riskBreakdown,

            // Recommendations
            retentionActions: retentionActions,

            // Legacy compatibility
            riskFactors: riskBreakdown.factors.map(f => f.description),
            urgency: this._determineUrgency(churnPrediction.probability),
            recommendation: retentionActions[0]?.action || 'Maintain regular engagement',

            // Meta
            calculatedAt: new Date().toISOString(),
            executionTimeMs: Math.round(performance.now() - startTime)
        };

        // Cache result
        this._setCache(cacheKey, result);

        return result;
    },

    /**
     * Calculate health sub-metrics
     */
    calculateHealthMetrics(client) {
        // Engagement Score (0-100)
        // Based on: visit frequency, session usage rate, time since last visit
        const engagement = this._calculateEngagement(client);

        // Loyalty Score (0-100)
        // Based on: tenure, renewal history, membership tier, referrals
        const loyalty = this._calculateLoyalty(client);

        // Satisfaction Score (0-100)
        // Inferred from: visit patterns, no-shows, spending trends
        const satisfaction = this._calculateSatisfaction(client);

        // Overall health: weighted average
        const overall = Math.round(
            engagement * 0.35 +
            loyalty * 0.35 +
            satisfaction * 0.30
        );

        return {
            engagement: Math.round(engagement),
            loyalty: Math.round(loyalty),
            satisfaction: Math.round(satisfaction),
            overall: Math.max(0, Math.min(100, overall))
        };
    },

    /**
     * Calculate engagement score
     */
    _calculateEngagement(client) {
        let score = 50; // Base score

        // Visit recency impact (-30 to +20)
        if (client.lastVisit) {
            const daysSince = this._daysSince(client.lastVisit);
            if (daysSince <= 7) score += 20;
            else if (daysSince <= 14) score += 15;
            else if (daysSince <= 30) score += 10;
            else if (daysSince <= 60) score -= 10;
            else if (daysSince <= 90) score -= 20;
            else score -= 30;
        } else {
            score -= 25;
        }

        // Session usage rate (-20 to +20)
        if (client.remainingSessions !== undefined && client.totalSessions) {
            const usageRate = 1 - (client.remainingSessions / client.totalSessions);
            if (usageRate >= 0.8) score += 15;
            else if (usageRate >= 0.5) score += 10;
            else if (usageRate >= 0.3) score += 5;
            else if (usageRate < 0.2) score -= 15;
        } else if (client.remainingSessions !== undefined) {
            // No total, use remaining as proxy
            if (client.remainingSessions >= 10) score += 10;
            else if (client.remainingSessions >= 5) score += 5;
            else if (client.remainingSessions <= 2) score -= 15;
        }

        // Visit count impact
        const visits = client.visitCount || 0;
        if (visits >= 20) score += 15;
        else if (visits >= 10) score += 10;
        else if (visits >= 5) score += 5;
        else if (visits === 0) score -= 20;

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Calculate loyalty score
     */
    _calculateLoyalty(client) {
        let score = 50; // Base score

        // Membership tier impact (-15 to +25)
        const membershipScores = {
            vip: 25,
            premium: 15,
            basic: 5,
            none: -15
        };
        score += membershipScores[client.membershipType] || membershipScores.none;

        // Tenure impact (-10 to +20)
        if (client.joinDate) {
            const tenureMonths = this._monthsSince(client.joinDate);
            if (tenureMonths >= 24) score += 20;
            else if (tenureMonths >= 12) score += 15;
            else if (tenureMonths >= 6) score += 10;
            else if (tenureMonths >= 3) score += 5;
            else score -= 5;
        }

        // Total spend impact (-5 to +15)
        const spend = client.totalSpend || (client.visitCount || 0) * 285;
        if (spend >= 5000) score += 15;
        else if (spend >= 2500) score += 10;
        else if (spend >= 1000) score += 5;
        else if (spend < 200) score -= 5;

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Calculate satisfaction score (inferred)
     */
    _calculateSatisfaction(client) {
        let score = 65; // Start higher - assume satisfied unless signals otherwise

        // No-show pattern impact (simulated from visit patterns)
        const visits = client.visitCount || 0;
        const missedRatio = client.missedAppointments ?
            client.missedAppointments / Math.max(1, visits + client.missedAppointments) : 0;

        if (missedRatio >= 0.3) score -= 25;
        else if (missedRatio >= 0.2) score -= 15;
        else if (missedRatio >= 0.1) score -= 8;
        else if (missedRatio === 0 && visits >= 5) score += 10;

        // Visit frequency consistency
        if (client.lastVisit) {
            const avgDaysBetween = client.avgDaysBetweenVisits || 30;
            const daysSinceLastVisit = this._daysSince(client.lastVisit);

            if (daysSinceLastVisit > avgDaysBetween * 2) score -= 15;
            else if (daysSinceLastVisit > avgDaysBetween * 1.5) score -= 8;
            else if (daysSinceLastVisit <= avgDaysBetween) score += 10;
        }

        // Spending trend (if available)
        if (client.spendingTrend === 'increasing') score += 15;
        else if (client.spendingTrend === 'decreasing') score -= 15;

        // Feedback score (if available)
        if (client.feedbackScore) {
            if (client.feedbackScore >= 4.5) score += 15;
            else if (client.feedbackScore >= 4) score += 8;
            else if (client.feedbackScore < 3) score -= 20;
        }

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Predict churn with ensemble methods
     */
    predictChurn(client, healthMetrics) {
        // Multi-factor probability calculation
        const factors = {
            // Session-based risk (0-0.35)
            sessionRisk: this._calculateSessionRisk(client),

            // Expiry-based risk (0-0.30)
            expiryRisk: this._calculateExpiryRisk(client),

            // Engagement decay risk (0-0.20)
            engagementRisk: (100 - healthMetrics.engagement) / 500,

            // Loyalty risk (0-0.15)
            loyaltyRisk: (100 - healthMetrics.loyalty) / 667
        };

        // Ensemble: weighted average with seasonal adjustment
        let baseProbability =
            factors.sessionRisk * 0.35 +
            factors.expiryRisk * 0.30 +
            factors.engagementRisk * 0.20 +
            factors.loyaltyRisk * 0.15;

        // Apply seasonal factor
        const seasonalAdjustment = MarketBenchmarks?.getCurrentSeasonalFactor() || 1.0;
        let probability = baseProbability * seasonalAdjustment;

        // Apply segment-specific baseline
        const segmentBaseline = MarketBenchmarks?.getSegmentChurnRate(client.membershipType) || 0.35;
        probability = (probability * 0.7) + (segmentBaseline * 0.3);

        // Cap at 0-1
        probability = Math.max(0, Math.min(1, probability));

        // Calculate predicted churn date
        const churnDateData = this._predictChurnDate(client, probability);

        return {
            probability,
            predictedDate: churnDateData.date,
            daysUntilChurn: churnDateData.days,
            confidenceInterval: churnDateData.confidenceInterval,
            confidence: churnDateData.confidence
        };
    },

    /**
     * Calculate session-based risk
     */
    _calculateSessionRisk(client) {
        if (client.remainingSessions === undefined) return 0.15;

        if (client.remainingSessions === 0) return 0.95;
        if (client.remainingSessions === 1) return 0.75;
        if (client.remainingSessions <= 2) return 0.55;
        if (client.remainingSessions <= 3) return 0.35;
        if (client.remainingSessions <= 5) return 0.20;
        return 0.05;
    },

    /**
     * Calculate expiry-based risk
     */
    _calculateExpiryRisk(client) {
        if (!client.expireDate) return 0.20;

        const daysUntil = this._daysUntil(client.expireDate);

        if (daysUntil < 0) return 0.90; // Already expired
        if (daysUntil <= 7) return 0.70;
        if (daysUntil <= 14) return 0.50;
        if (daysUntil <= 30) return 0.30;
        if (daysUntil <= 60) return 0.15;
        return 0.05;
    },

    /**
     * Predict churn date with confidence intervals
     */
    _predictChurnDate(client, probability) {
        const now = new Date();

        // Base: use expiry date if available
        let baseDays = 90; // Default to 90 days

        if (client.expireDate) {
            const expiryDays = this._daysUntil(client.expireDate);
            if (expiryDays > 0) {
                baseDays = Math.min(baseDays, expiryDays + 14); // Usually churn 2 weeks after expiry
            } else {
                baseDays = Math.max(7, 30 + expiryDays); // Already expired
            }
        }

        // Adjust based on sessions
        if (client.remainingSessions !== undefined) {
            const avgDaysPerSession = 14; // Assume bi-weekly visits
            const sessionDays = client.remainingSessions * avgDaysPerSession;
            baseDays = Math.min(baseDays, sessionDays + 21);
        }

        // Adjust based on probability
        const adjustedDays = Math.round(baseDays * (1 - probability * 0.5));

        // Calculate confidence interval
        const confidenceMargin = Math.round(adjustedDays * 0.3);

        const predictedDate = new Date(now);
        predictedDate.setDate(predictedDate.getDate() + adjustedDays);

        // Determine confidence level
        let confidence = 'medium';
        if (probability >= 0.7 && client.expireDate) confidence = 'high';
        else if (probability <= 0.3) confidence = 'low';

        return {
            days: adjustedDays,
            date: predictedDate.toISOString().split('T')[0],
            confidenceInterval: {
                low: Math.max(1, adjustedDays - confidenceMargin),
                high: adjustedDays + confidenceMargin
            },
            confidence
        };
    },

    /**
     * Calculate Lifetime Value projections
     */
    calculateLTV(client, churnPrediction) {
        // Current LTV (actual spend)
        const currentLTV = client.totalSpend ||
            (client.visitCount || 0) * MarketBenchmarks.AVERAGE_SESSION_VALUE;

        // Monthly value estimation
        const visitCount = client.visitCount || 0;
        const tenureMonths = client.joinDate ? this._monthsSince(client.joinDate) : 3;
        const monthlyValue = tenureMonths > 0 ? currentLTV / tenureMonths :
            MarketBenchmarks.AVERAGE_LTV_YEARLY / 12;

        // Projected 12-month LTV (assuming no churn)
        const projectedLTV = currentLTV + (monthlyValue * 12);

        // Churn-adjusted LTV
        const survivalProbability = 1 - churnPrediction.probability;
        const expectedMonthsRemaining = Math.min(12, churnPrediction.daysUntilChurn / 30);
        const churnAdjustedLTV = currentLTV + (monthlyValue * expectedMonthsRemaining * survivalProbability);

        // Confidence range
        const variance = 0.25;
        const confidenceRange = {
            low: Math.round(churnAdjustedLTV * (1 - variance)),
            high: Math.round(churnAdjustedLTV * (1 + variance))
        };

        return {
            currentLTV: Math.round(currentLTV),
            projectedLTV: Math.round(projectedLTV),
            churnAdjustedLTV: Math.round(churnAdjustedLTV),
            monthlyValue: Math.round(monthlyValue),
            confidenceRange
        };
    },

    /**
     * Calculate detailed risk breakdown
     */
    calculateRiskBreakdown(client) {
        const weights = MarketBenchmarks?.riskFactorWeights || {
            noShowPatterns: 0.30,
            sessionBurnRate: 0.25,
            engagementDecline: 0.20,
            expirationProximity: 0.15,
            membershipStatus: 0.10
        };

        const factors = [];

        // No-show patterns (30%)
        const noShowScore = this._scoreNoShowRisk(client);
        factors.push({
            category: 'No-Show Patterns',
            weight: weights.noShowPatterns,
            score: noShowScore,
            contribution: noShowScore * weights.noShowPatterns,
            description: noShowScore > 0.5 ?
                'Irregular visit patterns detected' :
                'Consistent appointment attendance'
        });

        // Session burn rate (25%)
        const sessionScore = this._scoreSessionBurnRate(client);
        factors.push({
            category: 'Session Usage',
            weight: weights.sessionBurnRate,
            score: sessionScore,
            contribution: sessionScore * weights.sessionBurnRate,
            description: this._getSessionDescription(client)
        });

        // Engagement decline (20%)
        const engagementScore = this._scoreEngagementDecline(client);
        factors.push({
            category: 'Engagement Level',
            weight: weights.engagementDecline,
            score: engagementScore,
            contribution: engagementScore * weights.engagementDecline,
            description: engagementScore > 0.5 ?
                'Declining engagement detected' :
                'Good engagement levels'
        });

        // Expiration proximity (15%)
        const expiryScore = this._scoreExpirationProximity(client);
        factors.push({
            category: 'Package Expiration',
            weight: weights.expirationProximity,
            score: expiryScore,
            contribution: expiryScore * weights.expirationProximity,
            description: this._getExpiryDescription(client)
        });

        // Membership status (10%)
        const membershipScore = this._scoreMembershipRisk(client);
        factors.push({
            category: 'Membership Status',
            weight: weights.membershipStatus,
            score: membershipScore,
            contribution: membershipScore * weights.membershipStatus,
            description: client.membershipType === 'vip' ?
                'VIP member - high retention' :
                client.membershipType === 'premium' ?
                    'Premium member' :
                    'Basic or no membership'
        });

        // Calculate total weighted risk
        const totalRisk = factors.reduce((sum, f) => sum + f.contribution, 0);

        return {
            totalRisk: Math.round(totalRisk * 100),
            factors: factors.map(f => ({
                ...f,
                score: Math.round(f.score * 100),
                contribution: Math.round(f.contribution * 100),
                weightPercentage: Math.round(f.weight * 100)
            }))
        };
    },

    /**
     * Score no-show risk
     */
    _scoreNoShowRisk(client) {
        const visits = client.visitCount || 0;
        const missed = client.missedAppointments || 0;

        if (visits + missed === 0) return 0.3; // Unknown

        const ratio = missed / (visits + missed);
        if (ratio >= 0.4) return 0.95;
        if (ratio >= 0.3) return 0.75;
        if (ratio >= 0.2) return 0.55;
        if (ratio >= 0.1) return 0.35;
        return 0.10;
    },

    /**
     * Score session burn rate
     */
    _scoreSessionBurnRate(client) {
        if (client.remainingSessions === undefined) return 0.3;

        if (client.remainingSessions === 0) return 1.0;
        if (client.remainingSessions === 1) return 0.85;
        if (client.remainingSessions <= 2) return 0.65;
        if (client.remainingSessions <= 5) return 0.35;
        return 0.10;
    },

    /**
     * Score engagement decline
     */
    _scoreEngagementDecline(client) {
        if (!client.lastVisit) return 0.70;

        const daysSince = this._daysSince(client.lastVisit);
        if (daysSince >= 90) return 0.90;
        if (daysSince >= 60) return 0.70;
        if (daysSince >= 45) return 0.50;
        if (daysSince >= 30) return 0.30;
        if (daysSince >= 14) return 0.15;
        return 0.05;
    },

    /**
     * Score expiration proximity
     */
    _scoreExpirationProximity(client) {
        if (!client.expireDate) return 0.40;

        const daysUntil = this._daysUntil(client.expireDate);
        if (daysUntil < 0) return 1.0;
        if (daysUntil <= 7) return 0.85;
        if (daysUntil <= 14) return 0.65;
        if (daysUntil <= 30) return 0.40;
        if (daysUntil <= 60) return 0.20;
        return 0.05;
    },

    /**
     * Score membership risk
     */
    _scoreMembershipRisk(client) {
        const scores = {
            vip: 0.05,
            premium: 0.20,
            basic: 0.50,
            none: 0.80
        };
        return scores[client.membershipType] || scores.none;
    },

    /**
     * Get session description
     */
    _getSessionDescription(client) {
        if (client.remainingSessions === undefined) return 'Session data not available';
        if (client.remainingSessions === 0) return 'No sessions remaining';
        if (client.remainingSessions === 1) return 'Only 1 session left';
        if (client.remainingSessions <= 3) return `${client.remainingSessions} sessions remaining - running low`;
        return `${client.remainingSessions} sessions remaining`;
    },

    /**
     * Get expiry description
     */
    _getExpiryDescription(client) {
        if (!client.expireDate) return 'No expiration date set';

        const daysUntil = this._daysUntil(client.expireDate);
        if (daysUntil < 0) return `Expired ${Math.abs(daysUntil)} days ago`;
        if (daysUntil === 0) return 'Expires today';
        if (daysUntil === 1) return 'Expires tomorrow';
        if (daysUntil <= 7) return `Expires in ${daysUntil} days`;
        if (daysUntil <= 14) return 'Expires within 2 weeks';
        if (daysUntil <= 30) return 'Expires within 1 month';
        return `Expires in ${daysUntil} days`;
    },

    /**
     * Get retention action recommendations with expected impact
     */
    getRetentionActions(client, churnPrediction, riskBreakdown) {
        const actions = [];
        const successRates = MarketBenchmarks?.actionSuccessRates || {};

        // Determine priority actions based on risk factors
        const topFactors = riskBreakdown.factors
            .sort((a, b) => b.contribution - a.contribution)
            .slice(0, 3);

        // Session-related actions
        if (client.remainingSessions !== undefined && client.remainingSessions <= 3) {
            actions.push({
                action: 'Send package renewal offer',
                type: 'renewal',
                expectedImpact: Math.round((successRates.discountOffer || 0.45) * 100),
                priority: client.remainingSessions === 0 ? 'critical' : 'high',
                timing: 'Immediate',
                description: 'Offer personalized renewal package before sessions run out'
            });
        }

        // Expiration-related actions
        if (client.expireDate) {
            const daysUntil = this._daysUntil(client.expireDate);
            if (daysUntil < 0) {
                actions.push({
                    action: 'Launch reactivation campaign',
                    type: 'reactivation',
                    expectedImpact: Math.round((successRates.reactivationCampaign || 0.18) * 100),
                    priority: 'critical',
                    timing: 'Immediate',
                    description: 'Win-back campaign with special offer for lapsed client'
                });
            } else if (daysUntil <= 14) {
                actions.push({
                    action: 'Schedule remaining sessions',
                    type: 'scheduling',
                    expectedImpact: Math.round((successRates.appointmentReminder || 0.55) * 100),
                    priority: 'high',
                    timing: 'Within 24 hours',
                    description: 'Help client use remaining sessions before expiration'
                });
            }
        }

        // Engagement-related actions
        if (client.lastVisit) {
            const daysSince = this._daysSince(client.lastVisit);
            if (daysSince >= 30) {
                actions.push({
                    action: 'Send personalized check-in nudge',
                    type: 'nudge',
                    expectedImpact: Math.round((successRates.personalizedNudge || 0.32) * 100),
                    priority: daysSince >= 60 ? 'high' : 'medium',
                    timing: daysSince >= 60 ? 'Within 24 hours' : 'Within 1 week',
                    description: 'Personalized message to re-engage the client'
                });
            }
        }

        // VIP upgrade opportunity
        if (client.membershipType !== 'vip' &&
            (client.totalSpend >= 2000 || (client.visitCount || 0) >= 10)) {
            actions.push({
                action: 'Offer VIP membership upgrade',
                type: 'upgrade',
                expectedImpact: Math.round((successRates.vipUpgradeOffer || 0.22) * 100),
                priority: 'medium',
                timing: 'Next interaction',
                description: 'Client qualifies for VIP tier - lock in long-term loyalty'
            });
        }

        // Birthday special (if birthday is within 30 days)
        if (client.birthday) {
            const birthday = new Date(client.birthday);
            const now = new Date();
            birthday.setFullYear(now.getFullYear());
            const daysUntilBirthday = Math.round((birthday - now) / (1000 * 60 * 60 * 24));

            if (daysUntilBirthday >= 0 && daysUntilBirthday <= 30) {
                actions.push({
                    action: 'Send birthday special offer',
                    type: 'birthday',
                    expectedImpact: Math.round((successRates.birthdaySpecial || 0.48) * 100),
                    priority: 'medium',
                    timing: `${daysUntilBirthday} days before birthday`,
                    description: 'Celebrate their birthday with a special offer'
                });
            }
        }

        // Default action if nothing else applies
        if (actions.length === 0) {
            actions.push({
                action: 'Maintain regular engagement',
                type: 'maintenance',
                expectedImpact: Math.round((successRates.feedbackRequest || 0.28) * 100),
                priority: 'low',
                timing: 'At next visit',
                description: 'Continue building the relationship'
            });
        }

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return actions;
    },

    /**
     * Batch analyze multiple clients efficiently
     */
    analyzeAll(clients) {
        return clients.map(client => {
            const analysis = this.analyze(client);
            return {
                ...client,
                ...analysis
            };
        });
    },

    /**
     * Analyze and update on data change (auto-trigger)
     */
    onDataUpdate(client) {
        // Clear cache for this client
        this._clearCacheForClient(client.id);

        // Recalculate
        return this.analyze(client);
    },

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    _daysSince(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    },

    _daysUntil(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    },

    _monthsSince(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30.44));
    },

    _determineUrgency(probability) {
        if (probability >= 0.7) return 'critical';
        if (probability >= 0.5) return 'high';
        if (probability >= 0.3) return 'medium';
        return 'low';
    },

    _getFromCache(key) {
        const cached = this._cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this._cacheTimeout)) {
            return cached.data;
        }
        return null;
    },

    _setCache(key, data) {
        this._cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    _clearCacheForClient(clientId) {
        for (const key of this._cache.keys()) {
            if (key.startsWith(`${clientId}_`)) {
                this._cache.delete(key);
            }
        }
    }
};

// Export for use
window.AdvancedChurnCalculator = AdvancedChurnCalculator;
