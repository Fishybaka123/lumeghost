// ===========================================
// DASHBOARD METRICS DATA
// ===========================================

const METRICS = {
    totalClients: {
        value: 247,
        change: 12,
        trend: 'positive',
        label: 'Total Clients'
    },
    activeLeads: {
        value: 34,
        change: 18,
        trend: 'positive',
        label: 'Active Leads'
    },
    atRiskClients: {
        value: 18,
        change: -8,
        trend: 'positive', // decreasing at-risk is good
        label: 'At-Risk Clients'
    },
    leadConversion: {
        value: 68,
        suffix: '%',
        change: 12,
        trend: 'positive',
        label: 'Lead Conversion'
    },
    revenueSaved: {
        value: 24500,
        prefix: '$',
        change: 23,
        trend: 'positive',
        label: 'Revenue Saved'
    },
    healthScore: {
        value: 74,
        change: 15,
        trend: 'positive',
        label: 'Health Score'
    }
};

// Summary stats for client categories
const CLIENT_STATS = {
    atRisk: CLIENTS.filter(c => c.churnRisk >= 60).length,
    healthy: CLIENTS.filter(c => c.healthScore >= 70).length,
    needsAttention: CLIENTS.filter(c => c.healthScore >= 40 && c.healthScore < 70).length,
    noRecentVisit: CLIENTS.filter(c => {
        const lastVisit = new Date(c.lastVisit);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastVisit < thirtyDaysAgo;
    }).length
};

// AI Insights (placeholder for future AI integration)
const AI_INSIGHTS = [
    {
        id: 1,
        type: 'warning',
        title: 'High Churn Risk Alert',
        message: '4 clients haven\'t visited in over 60 days. Consider sending a re-engagement offer.',
        action: 'View Clients',
        actionUrl: '/clients?filter=at-risk'
    },
    {
        id: 2,
        type: 'opportunity',
        title: 'Upsell Opportunity',
        message: '12 clients who book facials have never tried microneedling. This is your top-converting upsell.',
        action: 'Create Campaign',
        actionUrl: '/communications/new'
    },
    {
        id: 3,
        type: 'success',
        title: 'Retention Win',
        message: 'Your VIP program prevented an estimated $8,500 in churn this month.',
        action: 'View Report',
        actionUrl: '/analytics'
    }
];

// Notification data
const NOTIFICATIONS = [
    { id: 1, type: 'alert', message: 'Emily Rodriguez marked as high churn risk', time: '5 min ago', read: false },
    { id: 2, type: 'appointment', message: 'Lisa Thompson appointment confirmed for Feb 15', time: '1 hour ago', read: false },
    { id: 3, type: 'nudge', message: 'AI sent re-engagement email to 3 clients', time: '2 hours ago', read: true },
    { id: 4, type: 'milestone', message: 'Sarah Mitchell reached $4,000 lifetime spend', time: '1 day ago', read: true }
];
