// ===========================================
// DASHBOARD BUILDER - Customizable Widgets
// Drag-and-Drop Layout with Chart Integration
// ===========================================

const DashboardBuilder = {
    // Dashboard configuration
    currentDashboard: null,
    widgets: [],
    isEditMode: false,
    draggedWidget: null,

    // Available widget types
    WIDGET_TYPES: {
        METRIC: {
            type: 'metric',
            name: 'Metric Card',
            icon: '📊',
            minWidth: 1,
            minHeight: 1,
            defaultWidth: 1,
            defaultHeight: 1
        },
        CHART_LINE: {
            type: 'chart_line',
            name: 'Line Chart',
            icon: '📈',
            minWidth: 2,
            minHeight: 2,
            defaultWidth: 3,
            defaultHeight: 2
        },
        CHART_BAR: {
            type: 'chart_bar',
            name: 'Bar Chart',
            icon: '📊',
            minWidth: 2,
            minHeight: 2,
            defaultWidth: 2,
            defaultHeight: 2
        },
        CHART_PIE: {
            type: 'chart_pie',
            name: 'Pie Chart',
            icon: '🥧',
            minWidth: 2,
            minHeight: 2,
            defaultWidth: 2,
            defaultHeight: 2
        },
        TABLE: {
            type: 'table',
            name: 'Data Table',
            icon: '📋',
            minWidth: 2,
            minHeight: 2,
            defaultWidth: 4,
            defaultHeight: 3
        },
        LIST: {
            type: 'list',
            name: 'Activity List',
            icon: '📝',
            minWidth: 1,
            minHeight: 2,
            defaultWidth: 2,
            defaultHeight: 3
        },
        GAUGE: {
            type: 'gauge',
            name: 'Gauge',
            icon: '⏱️',
            minWidth: 1,
            minHeight: 1,
            defaultWidth: 1,
            defaultHeight: 2
        }
    },

    // Data sources
    DATA_SOURCES: {
        clients_total: { name: 'Total Clients', fetch: () => ClientDataService?.getAll()?.length || 0 },
        clients_atrisk: {
            name: 'At-Risk Clients',
            fetch: () => {
                const clients = ClientDataService?.getAll() || [];
                if (typeof AdvancedChurnCalculator !== 'undefined') {
                    return clients.filter(c => {
                        const analysis = AdvancedChurnCalculator.analyze(c);
                        return analysis.churnRisk >= 50;
                    }).length;
                }
                return clients.filter(c => (c.churnRisk || 0) >= 50).length;
            }
        },
        avg_health: {
            name: 'Avg Health Score',
            fetch: () => {
                const clients = ClientDataService?.getAll() || [];
                if (!clients.length) return 0;

                let totalHealth = 0;

                if (typeof AdvancedChurnCalculator !== 'undefined') {
                    totalHealth = clients.reduce((sum, c) => {
                        const analysis = AdvancedChurnCalculator.analyze(c);
                        return sum + (analysis.healthScore || 0);
                    }, 0);
                } else {
                    totalHealth = clients.reduce((sum, c) => sum + (c.healthScore || 0), 0);
                }

                return Math.round(totalHealth / clients.length);
            }
        },
        total_revenue: { name: 'Total Revenue', fetch: () => (ClientDataService?.getAll() || []).reduce((s, c) => s + (c.totalSpent || 0), 0) },
        avg_churn: {
            name: 'Avg Churn Risk',
            fetch: () => {
                const clients = ClientDataService?.getAll() || [];
                if (!clients.length) return 0;

                let totalChurn = 0;

                if (typeof AdvancedChurnCalculator !== 'undefined') {
                    totalChurn = clients.reduce((sum, c) => {
                        const analysis = AdvancedChurnCalculator.analyze(c);
                        return sum + (analysis.churnRisk || 0);
                    }, 0);
                } else {
                    totalChurn = clients.reduce((sum, c) => sum + (c.churnRisk || 0), 0);
                }

                return Math.round(totalChurn / clients.length);
            }
        },
        recent_clients: { name: 'Recent Clients', fetch: () => (ClientDataService?.getAll() || []).slice(0, 5) },
        health_distribution: {
            name: 'Health Distribution',
            fetch: () => {
                const clients = ClientDataService?.getAll() || [];
                let healthy = 0, needsAttention = 0, atRisk = 0;

                clients.forEach(c => {
                    let score = c.healthScore || 0;
                    if (typeof AdvancedChurnCalculator !== 'undefined') {
                        score = AdvancedChurnCalculator.analyze(c).healthScore;
                    }

                    if (score >= 75) healthy++;
                    else if (score >= 50) needsAttention++;
                    else atRisk++;
                });

                return [
                    { label: 'Healthy (75-100)', value: healthy },
                    { label: 'Needs Attention (50-74)', value: needsAttention },
                    { label: 'At Risk (<50)', value: atRisk }
                ];
            }
        },
        membership_distribution: {
            name: 'Membership Tiers', fetch: () => {
                const clients = ClientDataService?.getAll() || [];
                const tiers = {};
                clients.forEach(c => {
                    const tier = c.membershipTier || 'Unknown';
                    tiers[tier] = (tiers[tier] || 0) + 1;
                });
                return Object.entries(tiers).map(([label, value]) => ({ label, value }));
            }
        }
    },

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadDashboard();
        this.injectStyles();
    },

    loadDashboard() {
        try {
            const stored = localStorage.getItem('lume_custom_dashboard');
            if (stored) {
                this.currentDashboard = JSON.parse(stored);
                this.widgets = this.currentDashboard.widgets || [];
            } else {
                this.createDefaultDashboard();
            }
        } catch (e) {
            console.error('Failed to load dashboard:', e);
            this.createDefaultDashboard();
        }
    },

    saveDashboard() {
        this.currentDashboard = {
            version: 1,
            name: 'My Dashboard',
            updatedAt: new Date().toISOString(),
            widgets: this.widgets
        };
        localStorage.setItem('lume_custom_dashboard', JSON.stringify(this.currentDashboard));
    },

    createDefaultDashboard() {
        this.widgets = [
            { id: 'w1', type: 'metric', x: 0, y: 0, w: 1, h: 1, config: { dataSource: 'clients_total', label: 'Total Clients', color: 'blue' } },
            { id: 'w2', type: 'metric', x: 1, y: 0, w: 1, h: 1, config: { dataSource: 'clients_atrisk', label: 'At-Risk', color: 'red' } },
            { id: 'w3', type: 'metric', x: 2, y: 0, w: 1, h: 1, config: { dataSource: 'avg_health', label: 'Avg Health', color: 'green', suffix: '%' } },
            { id: 'w4', type: 'metric', x: 3, y: 0, w: 1, h: 1, config: { dataSource: 'total_revenue', label: 'Revenue', color: 'purple', prefix: '$' } },
            { id: 'w5', type: 'chart_pie', x: 0, y: 1, w: 2, h: 2, config: { dataSource: 'health_distribution', title: 'Client Health' } },
            { id: 'w6', type: 'chart_pie', x: 2, y: 1, w: 2, h: 2, config: { dataSource: 'membership_distribution', title: 'Membership' } }
        ];
        this.saveDashboard();
    },

    // ===========================================
    // STYLES
    // ===========================================

    injectStyles() {
        if (document.getElementById('dashboard-builder-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-builder-styles';
        styles.textContent = `
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                padding: 20px;
            }
            
            .dashboard-widget {
                background: var(--nav-surface, #1E2438);
                border-radius: 12px;
                border: 1px solid var(--nav-border, rgba(255,255,255,0.1));
                overflow: hidden;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .dashboard-widget:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            }
            
            .dashboard-widget.edit-mode {
                cursor: move;
            }
            
            .dashboard-widget.edit-mode:hover {
                border-color: var(--nav-accent, #4F7DF3);
            }
            
            .dashboard-widget.dragging {
                opacity: 0.5;
            }
            
            .widget-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.05));
            }
            
            .widget-title {
                font-size: 13px;
                font-weight: 600;
                color: var(--nav-text-secondary, rgba(255,255,255,0.7));
            }
            
            .widget-actions {
                display: none;
            }
            
            .edit-mode .widget-actions {
                display: flex;
                gap: 4px;
            }
            
            .widget-action-btn {
                width: 24px;
                height: 24px;
                border: none;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .widget-action-btn:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .widget-content {
                padding: 16px;
            }
            
            /* Metric Widget */
            .widget-metric {
                text-align: center;
            }
            
            .widget-metric .metric-value {
                font-size: 36px;
                font-weight: 700;
                line-height: 1.2;
            }
            
            .widget-metric .metric-label {
                font-size: 12px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.6));
                margin-top: 4px;
            }
            
            .widget-metric.blue .metric-value { color: #4F7DF3; }
            .widget-metric.red .metric-value { color: #EF4444; }
            .widget-metric.green .metric-value { color: #10B981; }
            .widget-metric.purple .metric-value { color: #8B5CF6; }
            .widget-metric.amber .metric-value { color: #F59E0B; }
            
            /* Chart Widget */
            .widget-chart canvas {
                width: 100% !important;
                height: 100% !important;
            }
            
            .widget-chart-svg {
                width: 100%;
                height: 160px;
            }
            
            /* Pie Chart */
            .pie-chart-container {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .pie-chart {
                width: 120px;
                height: 120px;
                flex-shrink: 0;
            }
            
            .pie-legend {
                flex: 1;
            }
            
            .pie-legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                margin-bottom: 6px;
            }
            
            .pie-legend-color {
                width: 12px;
                height: 12px;
                border-radius: 2px;
            }
            
            /* Dashboard Controls */
            .dashboard-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }
            
            .dashboard-edit-btn {
                padding: 8px 16px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .dashboard-edit-btn.primary {
                background: var(--nav-accent, #4F7DF3);
                color: white;
            }
            
            .dashboard-edit-btn.secondary {
                background: rgba(255,255,255,0.1);
                color: var(--nav-text-primary, #fff);
            }
            
            /* Widget Picker */
            .widget-picker {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--nav-surface, #1E2438);
                border-radius: 16px;
                padding: 24px;
                min-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10001;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            
            .widget-picker-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
            }
            
            .widget-picker h3 {
                margin: 0 0 16px;
                font-size: 18px;
                color: var(--nav-text-primary, #fff);
            }
            
            .widget-picker-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
            
            .widget-picker-item {
                background: rgba(255,255,255,0.05);
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                text-align: center;
                transition: all 0.2s;
            }
            
            .widget-picker-item:hover {
                background: rgba(255,255,255,0.1);
                border-color: var(--nav-accent, #4F7DF3);
            }
            
            .widget-picker-item .icon {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .widget-picker-item .name {
                font-size: 13px;
                font-weight: 500;
                color: var(--nav-text-primary, #fff);
            }
        `;
        document.head.appendChild(styles);
    },

    // ===========================================
    // RENDERING
    // ===========================================

    render(container) {
        if (!container) return;

        const controlsHtml = `
            <div class="dashboard-controls">
                <button class="dashboard-edit-btn ${this.isEditMode ? 'primary' : 'secondary'}" onclick="DashboardBuilder.toggleEditMode()">
                    ${this.isEditMode ? '✓ Done Editing' : '✏️ Customize'}
                </button>
                ${this.isEditMode ? `
                    <button class="dashboard-edit-btn secondary" onclick="DashboardBuilder.showWidgetPicker()">
                        ➕ Add Widget
                    </button>
                    <button class="dashboard-edit-btn secondary" onclick="DashboardBuilder.resetToDefault()">
                        🔄 Reset
                    </button>
                ` : ''}
            </div>
        `;

        const widgetsHtml = this.widgets.map(widget => this.renderWidget(widget)).join('');

        container.innerHTML = `
            ${controlsHtml}
            <div class="dashboard-grid ${this.isEditMode ? 'edit-mode' : ''}" id="dashboard-grid">
                ${widgetsHtml}
            </div>
        `;

        // Setup drag and drop in edit mode
        if (this.isEditMode) {
            this.setupDragAndDrop();
        }
    },

    renderWidget(widget) {
        const gridStyles = `grid-column: span ${widget.w}; grid-row: span ${widget.h};`;

        let content = '';
        switch (widget.type) {
            case 'metric':
                content = this.renderMetricWidget(widget);
                break;
            case 'chart_pie':
                content = this.renderPieChartWidget(widget);
                break;
            case 'chart_bar':
            case 'chart_line':
                content = this.renderBarChartWidget(widget);
                break;
            case 'list':
                content = this.renderListWidget(widget);
                break;
            default:
                content = '<div class="widget-content">Widget</div>';
        }

        return `
            <div class="dashboard-widget ${this.isEditMode ? 'edit-mode' : ''}" 
                 data-id="${widget.id}" 
                 style="${gridStyles}"
                 draggable="${this.isEditMode}">
                <div class="widget-header">
                    <span class="widget-title">${widget.config?.title || widget.config?.label || 'Widget'}</span>
                    <div class="widget-actions">
                        <button class="widget-action-btn" onclick="DashboardBuilder.configureWidget('${widget.id}')">⚙️</button>
                        <button class="widget-action-btn" onclick="DashboardBuilder.removeWidget('${widget.id}')">🗑️</button>
                    </div>
                </div>
                ${content}
            </div>
        `;
    },

    renderMetricWidget(widget) {
        const config = widget.config || {};
        const source = this.DATA_SOURCES[config.dataSource];
        const value = source ? source.fetch() : 0;
        const displayValue = typeof value === 'number' ?
            `${config.prefix || ''}${value.toLocaleString()}${config.suffix || ''}` : value;

        return `
            <div class="widget-content widget-metric ${config.color || 'blue'}">
                <div class="metric-value">${displayValue}</div>
                <div class="metric-label">${config.label || source?.name || 'Value'}</div>
            </div>
        `;
    },

    renderPieChartWidget(widget) {
        const config = widget.config || {};
        const source = this.DATA_SOURCES[config.dataSource];
        const data = source ? source.fetch() : [];

        if (!Array.isArray(data) || data.length === 0) {
            return '<div class="widget-content">No data</div>';
        }

        const total = data.reduce((s, d) => s + d.value, 0);
        const colors = ['#4F7DF3', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

        // Create pie chart SVG
        let startAngle = 0;
        const paths = data.map((item, i) => {
            const angle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + angle;

            const x1 = 60 + 50 * Math.cos(startAngle);
            const y1 = 60 + 50 * Math.sin(startAngle);
            const x2 = 60 + 50 * Math.cos(endAngle);
            const y2 = 60 + 50 * Math.sin(endAngle);

            const largeArc = angle > Math.PI ? 1 : 0;
            const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

            startAngle = endAngle;
            return `<path d="${path}" fill="${colors[i % colors.length]}" />`;
        }).join('');

        const legend = data.map((item, i) => `
            <div class="pie-legend-item">
                <div class="pie-legend-color" style="background: ${colors[i % colors.length]}"></div>
                <span>${item.label}: ${item.value}</span>
            </div>
        `).join('');

        return `
            <div class="widget-content">
                <div class="pie-chart-container">
                    <svg class="pie-chart" viewBox="0 0 120 120">${paths}</svg>
                    <div class="pie-legend">${legend}</div>
                </div>
            </div>
        `;
    },

    renderBarChartWidget(widget) {
        const config = widget.config || {};
        const source = this.DATA_SOURCES[config.dataSource];
        const data = source ? source.fetch() : [];

        if (!Array.isArray(data) || data.length === 0) {
            return '<div class="widget-content">No data</div>';
        }

        const max = Math.max(...data.map(d => d.value));
        const bars = data.map((item, i) => {
            const height = (item.value / max) * 100;
            const color = ['#4F7DF3', '#10B981', '#F59E0B', '#EF4444'][i % 4];
            return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <div style="flex: 1; width: 100%; display: flex; align-items: flex-end;">
                        <div style="width: 100%; height: ${height}%; background: ${color}; border-radius: 4px 4px 0 0;"></div>
                    </div>
                    <span style="font-size: 10px; color: var(--nav-text-secondary);">${item.label}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="widget-content" style="height: 160px;">
                <div style="display: flex; gap: 8px; height: 100%;">${bars}</div>
            </div>
        `;
    },

    renderListWidget(widget) {
        const config = widget.config || {};
        const source = this.DATA_SOURCES[config.dataSource];
        const data = source ? source.fetch() : [];

        if (!Array.isArray(data) || data.length === 0) {
            return '<div class="widget-content">No data</div>';
        }

        const items = data.slice(0, 5).map(item => `
            <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                <span style="font-size: 13px;">${item.name || item.label}</span>
                <span style="font-size: 12px; color: var(--nav-text-secondary);">${item.value || item.healthScore || ''}</span>
            </div>
        `).join('');

        return `<div class="widget-content">${items}</div>`;
    },

    // ===========================================
    // EDIT MODE
    // ===========================================

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const container = document.querySelector('.custom-dashboard-section');
        if (container) this.render(container);
    },

    setupDragAndDrop() {
        const widgets = document.querySelectorAll('.dashboard-widget.edit-mode');

        widgets.forEach(widget => {
            widget.addEventListener('dragstart', (e) => {
                this.draggedWidget = widget.dataset.id;
                widget.classList.add('dragging');
            });

            widget.addEventListener('dragend', (e) => {
                widget.classList.remove('dragging');
                this.draggedWidget = null;
            });

            widget.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            widget.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.draggedWidget && this.draggedWidget !== widget.dataset.id) {
                    this.swapWidgets(this.draggedWidget, widget.dataset.id);
                }
            });
        });
    },

    swapWidgets(id1, id2) {
        const idx1 = this.widgets.findIndex(w => w.id === id1);
        const idx2 = this.widgets.findIndex(w => w.id === id2);

        if (idx1 >= 0 && idx2 >= 0) {
            [this.widgets[idx1], this.widgets[idx2]] = [this.widgets[idx2], this.widgets[idx1]];
            this.saveDashboard();
            const container = document.querySelector('.custom-dashboard-section');
            if (container) this.render(container);
        }
    },

    // ===========================================
    // WIDGET MANAGEMENT
    // ===========================================

    showWidgetPicker() {
        const overlay = document.createElement('div');
        overlay.className = 'widget-picker-overlay';
        overlay.onclick = () => this.closeWidgetPicker();

        const picker = document.createElement('div');
        picker.className = 'widget-picker';
        picker.innerHTML = `
            <h3>Add Widget</h3>
            <div class="widget-picker-grid">
                ${Object.entries(this.WIDGET_TYPES).map(([key, type]) => `
                    <div class="widget-picker-item" onclick="DashboardBuilder.addWidget('${type.type}')">
                        <div class="icon">${type.icon}</div>
                        <div class="name">${type.name}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(picker);
    },

    closeWidgetPicker() {
        document.querySelector('.widget-picker-overlay')?.remove();
        document.querySelector('.widget-picker')?.remove();
    },

    addWidget(type) {
        const widgetType = Object.values(this.WIDGET_TYPES).find(t => t.type === type);
        if (!widgetType) return;

        const newWidget = {
            id: 'w' + Date.now(),
            type: widgetType.type,
            x: 0,
            y: this.widgets.length,
            w: widgetType.defaultWidth,
            h: widgetType.defaultHeight,
            config: {
                dataSource: type === 'metric' ? 'clients_total' : 'health_distribution',
                title: widgetType.name,
                color: 'blue'
            }
        };

        this.widgets.push(newWidget);
        this.saveDashboard();
        this.closeWidgetPicker();

        const container = document.querySelector('.custom-dashboard-section');
        if (container) this.render(container);
    },

    removeWidget(id) {
        this.widgets = this.widgets.filter(w => w.id !== id);
        this.saveDashboard();

        const container = document.querySelector('.custom-dashboard-section');
        if (container) this.render(container);
    },

    configureWidget(id) {
        const widget = this.widgets.find(w => w.id === id);
        if (!widget) return;

        showToast('Widget configuration coming soon!', 'info');
    },

    resetToDefault() {
        if (confirm('Reset dashboard to default layout?')) {
            this.createDefaultDashboard();
            const container = document.querySelector('.custom-dashboard-section');
            if (container) this.render(container);
            showToast('Dashboard reset to default', 'success');
        }
    }
};

// Initialize
DashboardBuilder.init();

// Expose globally
window.DashboardBuilder = DashboardBuilder;
