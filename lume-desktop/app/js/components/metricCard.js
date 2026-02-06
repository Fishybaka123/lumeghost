// ===========================================
// METRIC CARD COMPONENT
// ===========================================

function createMetricCard(config) {
    const { label, value, prefix = '', suffix = '', change, trend, icon, color } = config;

    const formattedValue = typeof value === 'number' && !prefix && !suffix
        ? value.toLocaleString()
        : value;

    const displayValue = prefix === '$'
        ? formatCurrency(value).replace('$', '')
        : formattedValue;

    const trendIcon = trend === 'positive'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

    return `
        <div class="metric-card">
            <div class="metric-icon ${color}">
                ${icon}
            </div>
            <div class="metric-content">
                <div class="metric-label">${label}</div>
                <div class="metric-value">${prefix}${displayValue}${suffix}</div>
                <div class="metric-trend ${trend}">
                    ${trendIcon}
                    <span>${Math.abs(change)}%</span>
                </div>
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
        label: 'Health Score',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        color: 'purple'
    }
};

function createMetricFromData(key, data) {
    const config = METRIC_CONFIGS[key];
    if (!config) return '';

    return createMetricCard({
        ...config,
        value: data.value,
        prefix: data.prefix || '',
        suffix: data.suffix || '',
        change: data.change,
        trend: data.trend
    });
}
