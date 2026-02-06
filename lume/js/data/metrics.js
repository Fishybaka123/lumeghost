// ===========================================
// DASHBOARD METRICS DATA
// Dynamic metrics calculated from actual client data
// ===========================================

// Helper to calculate metrics from actual clients
function calculateMetrics() {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : CLIENTS;

    const totalClients = clients.length;
    const atRiskClients = clients.filter(c => c.churnRisk >= 60).length;
    const healthyClients = clients.filter(c => c.healthScore >= 70).length;
    const avgHealthScore = totalClients > 0
        ? Math.round(clients.reduce((sum, c) => sum + (c.healthScore || 0), 0) / totalClients)
        : 0;

    // Estimate revenue saved (at-risk clients who didn't churn * avg spend)
    const avgSpend = totalClients > 0
        ? clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0) / totalClients
        : 0;
    const revenueSaved = Math.round(atRiskClients * avgSpend * 0.3); // 30% of at-risk revenue "saved"

    return {
        totalClients: {
            value: totalClients,
            change: 0,
            trend: 'neutral',
            label: 'Total Clients'
        },
        activeLeads: {
            value: 0,
            change: 0,
            trend: 'neutral',
            label: 'Active Leads'
        },
        atRiskClients: {
            value: atRiskClients,
            change: 0,
            trend: atRiskClients > 0 ? 'negative' : 'neutral',
            label: 'At-Risk Clients'
        },
        leadConversion: {
            value: 0,
            suffix: '%',
            change: 0,
            trend: 'neutral',
            label: 'Lead Conversion'
        },
        revenueSaved: {
            value: revenueSaved,
            prefix: '$',
            change: 0,
            trend: revenueSaved > 0 ? 'positive' : 'neutral',
            label: 'Revenue Saved'
        },
        healthScore: {
            value: avgHealthScore,
            change: 0,
            trend: avgHealthScore >= 70 ? 'positive' : avgHealthScore >= 50 ? 'neutral' : 'negative',
            label: 'Health Score'
        }
    };
}

// Default empty metrics (will be recalculated when clients load)
let METRICS = calculateMetrics();

// Function to refresh metrics after data changes
function refreshMetrics() {
    METRICS = calculateMetrics();
}

// Summary stats for client categories
function getClientStats() {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : CLIENTS;

    return {
        atRisk: clients.filter(c => c.churnRisk >= 60).length,
        healthy: clients.filter(c => c.healthScore >= 70).length,
        needsAttention: clients.filter(c => c.healthScore >= 40 && c.healthScore < 70).length,
        noRecentVisit: clients.filter(c => {
            if (!c.lastVisit) return true;
            const lastVisit = new Date(c.lastVisit);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastVisit < thirtyDaysAgo;
        }).length
    };
}

const CLIENT_STATS = getClientStats();

// AI Insights - only show when there's data
function getAIInsights() {
    const clients = typeof ClientDataService !== 'undefined' ? ClientDataService.getAll() : CLIENTS;

    if (clients.length === 0) {
        return [{
            id: 1,
            type: 'info',
            title: 'Get Started',
            message: 'Import your client data to see AI-powered insights and churn predictions.',
            action: 'Import Clients',
            actionUrl: '/clients'
        }];
    }

    const insights = [];
    const atRiskCount = clients.filter(c => c.churnRisk >= 60).length;

    if (atRiskCount > 0) {
        insights.push({
            id: 1,
            type: 'warning',
            title: 'High Churn Risk Alert',
            message: `${atRiskCount} client${atRiskCount > 1 ? 's' : ''} need attention. Consider sending a re-engagement nudge.`,
            action: 'View Clients',
            actionUrl: '/clients?filter=at-risk'
        });
    }

    return insights.length > 0 ? insights : [{
        id: 1,
        type: 'success',
        title: 'Looking Good!',
        message: 'All clients are healthy. Keep up the great work!',
        action: 'View Clients',
        actionUrl: '/clients'
    }];
}

const AI_INSIGHTS = getAIInsights();

// Notification data - empty by default
const NOTIFICATIONS = [];
