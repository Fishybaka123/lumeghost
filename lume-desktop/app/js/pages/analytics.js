// ===========================================
// ANALYTICS PAGE
// ===========================================

function renderAnalyticsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    return `
        <div class="app-layout">
            ${createSidebar('analytics')}
            
            <main class="main-content">
                ${createHeader(user)}
                
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Analytics</h1>
                            <p>Track your med spa performance and client retention metrics</p>
                        </div>
                        <div class="page-actions">
                            <select class="filter-select" id="analytics-timeframe" onchange="updateAnalyticsTimeframe(this.value)">
                                <option value="mtd">Month to Date</option>
                                <option value="ytd">Year to Date</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="last90">Last 90 Days</option>
                            </select>
                            <button class="btn btn-secondary" onclick="exportAnalyticsReport()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Export Report
                            </button>
                        </div>
                    </div>
                    
                    <!-- Key Metrics Row -->
                    <div class="analytics-metrics-row">
                        ${createAnalyticsMetric('Revenue MTD', '$42,580', '+23%', 'positive', 'dollar-sign')}
                        ${createAnalyticsMetric('Revenue YTD', '$312,450', '+18%', 'positive', 'trending-up')}
                        ${createAnalyticsMetric('Churn Rate', '8.2%', '-2.1%', 'positive', 'users')}
                        ${createAnalyticsMetric('Avg Client LTV', '$2,340', '+12%', 'positive', 'heart')}
                    </div>
                    
                    <!-- Charts Row -->
                    <div class="analytics-charts-grid">
                        <!-- Revenue Chart -->
                        <div class="analytics-card large">
                            <div class="analytics-card-header">
                                <h3>Revenue Trend</h3>
                                <div class="chart-legend">
                                    <span class="legend-item"><span class="legend-color" style="background: var(--primary);"></span> This Year</span>
                                    <span class="legend-item"><span class="legend-color" style="background: var(--gray-300);"></span> Last Year</span>
                                </div>
                            </div>
                            <div class="chart-container" id="revenue-chart">
                                ${renderBarChart(ANALYTICS_DATA.revenueByMonth)}
                            </div>
                        </div>
                        
                        <!-- Churn Analysis -->
                        <div class="analytics-card">
                            <div class="analytics-card-header">
                                <h3>Churn Analysis</h3>
                            </div>
                            <div class="churn-gauge-container">
                                ${renderChurnGauge(8.2)}
                            </div>
                            <div class="churn-stats">
                                <div class="churn-stat">
                                    <span class="churn-stat-value">12</span>
                                    <span class="churn-stat-label">Clients Lost</span>
                                </div>
                                <div class="churn-stat">
                                    <span class="churn-stat-value">$8,400</span>
                                    <span class="churn-stat-label">Revenue Lost</span>
                                </div>
                                <div class="churn-stat">
                                    <span class="churn-stat-value">14 mo</span>
                                    <span class="churn-stat-label">Avg Lifespan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Second Row -->
                    <div class="analytics-charts-grid">
                        <!-- Treatment Popularity -->
                        <div class="analytics-card">
                            <div class="analytics-card-header">
                                <h3>Treatment Popularity</h3>
                                <button class="btn btn-sm btn-ghost">View All</button>
                            </div>
                            <div class="treatment-bars">
                                ${renderTreatmentBars(ANALYTICS_DATA.treatmentPopularity)}
                            </div>
                        </div>
                        
                        <!-- Client Acquisition -->
                        <div class="analytics-card">
                            <div class="analytics-card-header">
                                <h3>Client Acquisition</h3>
                            </div>
                            <div class="acquisition-sources">
                                ${renderAcquisitionSources(ANALYTICS_DATA.acquisitionSources)}
                            </div>
                        </div>
                        
                        <!-- Retention Funnel -->
                        <div class="analytics-card">
                            <div class="analytics-card-header">
                                <h3>Retention Funnel</h3>
                            </div>
                            <div class="retention-funnel">
                                ${renderRetentionFunnel()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Insights -->
                    <div class="analytics-insights-section">
                        <h3>🤖 AI Insights</h3>
                        <div class="insights-grid">
                            ${renderAnalyticsInsights()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

// Analytics Data
const ANALYTICS_DATA = {
    revenueByMonth: [
        { month: 'Jan', current: 28500, previous: 24000 },
        { month: 'Feb', current: 32100, previous: 26500 },
        { month: 'Mar', current: 29800, previous: 28000 },
        { month: 'Apr', current: 35600, previous: 30200 },
        { month: 'May', current: 38200, previous: 31500 },
        { month: 'Jun', current: 42580, previous: 34800 }
    ],
    treatmentPopularity: [
        { name: 'Botox', count: 145, revenue: 65250, color: '#00B8D9' },
        { name: 'HydraFacial', count: 98, revenue: 24500, color: '#4FD1C5' },
        { name: 'Laser Hair', count: 76, revenue: 22800, color: '#F59E0B' },
        { name: 'Microneedling', count: 54, revenue: 21600, color: '#FF6B6B' },
        { name: 'Chemical Peel', count: 42, revenue: 12600, color: '#8B5CF6' }
    ],
    acquisitionSources: [
        { source: 'Referrals', percentage: 35, color: '#10B981' },
        { source: 'Google', percentage: 28, color: '#3B82F6' },
        { source: 'Instagram', percentage: 22, color: '#EC4899' },
        { source: 'Walk-ins', percentage: 10, color: '#F59E0B' },
        { source: 'Other', percentage: 5, color: '#6B7280' }
    ]
};

function createAnalyticsMetric(label, value, change, trend, icon) {
    const isPositive = trend === 'positive';
    const iconSvg = getAnalyticsIcon(icon);

    return `
        <div class="analytics-metric-card">
            <div class="analytics-metric-icon">
                ${iconSvg}
            </div>
            <div class="analytics-metric-content">
                <span class="analytics-metric-label">${label}</span>
                <span class="analytics-metric-value">${value}</span>
                <span class="analytics-metric-change ${isPositive ? 'positive' : 'negative'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="${isPositive ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
                    </svg>
                    ${change}
                </span>
            </div>
        </div>
    `;
}

function getAnalyticsIcon(type) {
    const icons = {
        'dollar-sign': '<circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 10h8"/><path d="M8 14h8"/>',
        'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
    };

    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">${icons[type] || icons['dollar-sign']}</svg>`;
}

function renderBarChart(data) {
    const maxValue = Math.max(...data.map(d => Math.max(d.current, d.previous)));

    return `
        <div class="bar-chart">
            <div class="bar-chart-bars">
                ${data.map(d => `
                    <div class="bar-group">
                        <div class="bar-pair">
                            <div class="bar current" style="height: ${(d.current / maxValue) * 100}%;" title="$${d.current.toLocaleString()}"></div>
                            <div class="bar previous" style="height: ${(d.previous / maxValue) * 100}%;" title="$${d.previous.toLocaleString()}"></div>
                        </div>
                        <span class="bar-label">${d.month}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bar-chart-y-axis">
                <span>$${(maxValue / 1000).toFixed(0)}k</span>
                <span>$${(maxValue / 2000).toFixed(0)}k</span>
                <span>$0</span>
            </div>
        </div>
    `;
}

function renderChurnGauge(percentage) {
    const angle = (percentage / 100) * 180;

    return `
        <div class="churn-gauge">
            <svg viewBox="0 0 200 120" class="gauge-svg">
                <!-- Background arc -->
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E5E7EB" stroke-width="16" stroke-linecap="round"/>
                
                <!-- Value arc -->
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" stroke-width="16" stroke-linecap="round"
                      stroke-dasharray="${(percentage / 100) * 251.2} 251.2"/>
                
                <!-- Gradient definition -->
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#10B981"/>
                        <stop offset="50%" stop-color="#F59E0B"/>
                        <stop offset="100%" stop-color="#EF4444"/>
                    </linearGradient>
                </defs>
                
                <!-- Center text -->
                <text x="100" y="85" text-anchor="middle" class="gauge-value">${percentage}%</text>
                <text x="100" y="105" text-anchor="middle" class="gauge-label">Churn Rate</text>
            </svg>
        </div>
    `;
}

function renderTreatmentBars(treatments) {
    const maxCount = Math.max(...treatments.map(t => t.count));

    return treatments.map(t => `
        <div class="treatment-bar-row">
            <div class="treatment-info">
                <span class="treatment-name">${t.name}</span>
                <span class="treatment-count">${t.count}</span>
            </div>
            <div class="treatment-bar-container">
                <div class="treatment-bar" style="width: ${(t.count / maxCount) * 100}%; background: ${t.color};"></div>
            </div>
            <span class="treatment-revenue">$${(t.revenue / 1000).toFixed(1)}k</span>
        </div>
    `).join('');
}

function renderAcquisitionSources(sources) {
    return `
        <div class="acquisition-chart">
            <div class="donut-chart">
                ${renderDonutChart(sources)}
            </div>
            <div class="acquisition-legend">
                ${sources.map(s => `
                    <div class="legend-row">
                        <span class="legend-dot" style="background: ${s.color};"></span>
                        <span class="legend-name">${s.source}</span>
                        <span class="legend-value">${s.percentage}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderDonutChart(sources) {
    let currentAngle = 0;
    const radius = 50;
    const cx = 60;
    const cy = 60;

    const paths = sources.map(source => {
        const angle = (source.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        const x1 = cx + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = cy + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const x2 = cx + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const y2 = cy + radius * Math.sin((endAngle - 90) * Math.PI / 180);

        const largeArc = angle > 180 ? 1 : 0;

        currentAngle = endAngle;

        return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${source.color}"/>`;
    }).join('');

    return `
        <svg viewBox="0 0 120 120" class="donut-svg">
            ${paths}
            <circle cx="${cx}" cy="${cy}" r="30" fill="white"/>
        </svg>
    `;
}

function renderRetentionFunnel() {
    const stages = [
        { label: 'New Clients', value: 100, count: 247 },
        { label: '2nd Visit', value: 78, count: 193 },
        { label: '3+ Visits', value: 62, count: 153 },
        { label: 'Members', value: 45, count: 111 },
        { label: 'VIP', value: 18, count: 44 }
    ];

    return stages.map((stage, i) => `
        <div class="funnel-stage">
            <div class="funnel-bar" style="width: ${stage.value}%; background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);"></div>
            <div class="funnel-info">
                <span class="funnel-label">${stage.label}</span>
                <span class="funnel-count">${stage.count}</span>
                <span class="funnel-percent">${stage.value}%</span>
            </div>
        </div>
    `).join('');
}

function renderAnalyticsInsights() {
    const insights = [
        {
            type: 'success',
            title: 'Strong Retention',
            message: 'Your 78% second-visit rate is 15% above industry average. Keep up the excellent follow-up communications!'
        },
        {
            type: 'warning',
            title: 'Botox Revenue Opportunity',
            message: 'Botox clients have 3x higher LTV. Consider promoting Botox packages to your HydraFacial clients.'
        },
        {
            type: 'info',
            title: 'Referral Growth',
            message: '35% of new clients come from referrals. Launching a referral rewards program could boost this further.'
        }
    ];

    return insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-header">
                <span class="insight-icon">${insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : '💡'}</span>
                <span class="insight-title">${insight.title}</span>
            </div>
            <p class="insight-message">${insight.message}</p>
        </div>
    `).join('');
}

function updateAnalyticsTimeframe(timeframe) {
    console.log('Updating analytics to:', timeframe);
    showToast(`Updated to ${timeframe.toUpperCase()} view`, 'info');
}

function exportAnalyticsReport() {
    showToast('📊 Generating analytics report...', 'info');
    setTimeout(() => {
        showToast('✅ Report ready for download!', 'success');
    }, 1500);
}
