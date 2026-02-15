// ===========================================
// METRIC CARD COMPONENT
// ===========================================

function formatCurrency(value) {
    if (value == null || isNaN(value)) return '$0';
    return '$' + value.toLocaleString();
}

function createMetricCard(config) {
    // Safely destructure with defaults
    const label = config.label || 'Metric';
    const value = config.value != null ? config.value : 0;
    const prefix = config.prefix || '';
    const suffix = config.suffix || '';
    const change = config.change != null ? config.change : 0;
    const trend = config.trend || 'neutral';
    const icon = config.icon || '';
    const color = config.color || 'blue';

    // Format the value for display
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);
    const displayValue = `${prefix}${formattedValue}${suffix}`;

    const trendIcon = trend === 'positive'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
        : trend === 'negative'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>';

    // Don't show change if it's 0 (removed dash)
    const changeDisplay = change !== 0
        ? `<div class="metric-trend ${trend}">
               ${trendIcon}
               <span>${Math.abs(change)}%</span>
           </div>`
        : '';

    return `
        <div class="metric-card glass-card">
            <div class="metric-icon ${color}">
                ${icon}
            </div>
            <div class="metric-content">
                <div class="metric-label">${label}</div>
                <div class="metric-value">${displayValue}</div>
                ${changeDisplay}
            </div>
        </div>
    `;
}

// Pre-defined metric configurations
const METRIC_CONFIGS = {
    totalClients: {
        label: 'Total Clients',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        color: 'blue'
    },
    activeLeads: {
        label: 'Active Leads',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
        color: 'teal'
    },
    atRiskClients: {
        label: 'At-Risk Clients',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
        color: 'coral'
    },
    leadConversion: {
        label: 'Lead Conversion',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>',
        color: 'emerald'
    },
    revenueSaved: {
        label: 'Revenue Saved',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        color: 'amber'
    },
    healthScore: {
        label: 'AVG Health Score',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        color: 'purple'
    }
};

function createMetricFromData(key, data) {
    const config = METRIC_CONFIGS[key];
    if (!config) return '';

    // Handle case where data might be undefined
    const safeData = data || { value: 0, change: 0, trend: 'neutral' };

    return createMetricCard({
        ...config,
        value: safeData.value != null ? safeData.value : 0,
        prefix: safeData.prefix || '',
        suffix: safeData.suffix || '',
        change: safeData.change != null ? safeData.change : 0,
        trend: safeData.trend || 'neutral'
    });
}
