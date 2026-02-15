// ===========================================
// GLOBAL SEARCH - Professional Command Palette
// Cmd/Ctrl+K Quick Search with Multi-Entity Support
// ===========================================

const GlobalSearch = {
    isOpen: false,
    query: '',
    results: [],
    selectedIndex: 0,
    recentSearches: [],
    maxRecent: 5,

    // Search categories
    CATEGORIES: {
        CLIENTS: { name: 'Clients', icon: '👤', color: '#4F7DF3' },
        PAGES: { name: 'Pages', icon: '📄', color: '#10B981' },
        ACTIONS: { name: 'Actions', icon: '⚡', color: '#F59E0B' },
        COMMUNICATIONS: { name: 'Messages', icon: '💬', color: '#EC4899' },
        ANALYTICS: { name: 'Analytics', icon: '📊', color: '#8B5CF6' }
    },

    // Quick actions
    QUICK_ACTIONS: [
        { id: 'add-client', name: 'Add New Client', icon: '➕', action: () => navigateTo('/clients'), category: 'ACTIONS' },
        { id: 'export-data', name: 'Export Client Data', icon: '📥', action: () => ExportService?.exportClientsToCSV(), category: 'ACTIONS' },
        { id: 'import-data', name: 'Import Data', icon: '📤', action: () => document.getElementById('csv-file-input')?.click(), category: 'ACTIONS' },
        { id: 'export-pdf', name: 'Generate PDF Report', icon: '📑', action: () => ExportService?.exportClientsToPDF(), category: 'ACTIONS' },
        { id: 'dark-mode', name: 'Toggle Dark Mode', icon: '🌙', action: () => ThemeService?.toggle(), category: 'ACTIONS' },
        { id: 'refresh', name: 'Refresh Data', icon: '🔄', action: () => location.reload(), category: 'ACTIONS' },
        { id: 'settings', name: 'Open Settings', icon: '⚙️', action: () => navigateTo('/settings'), category: 'ACTIONS' },
        { id: 'notifications', name: 'View Notifications', icon: '🔔', action: () => NotificationCenter?.toggle(), category: 'ACTIONS' }
    ],

    // Page navigation
    PAGES: [
        { id: 'dashboard', name: 'Dashboard', icon: '🏠', path: '/dashboard', keywords: ['home', 'main', 'overview'] },
        { id: 'clients', name: 'Clients', icon: '👥', path: '/clients', keywords: ['customers', 'contacts', 'people'] },
        { id: 'analytics', name: 'Analytics', icon: '📊', path: '/analytics', keywords: ['reports', 'stats', 'metrics', 'charts'] },
        { id: 'communications', name: 'Communications', icon: '💬', path: '/communications', keywords: ['messages', 'sms', 'email', 'chat'] },
        { id: 'operations', name: 'Operations', icon: '⚙️', path: '/operations', keywords: ['ops', 'tasks', 'management'] },
        { id: 'settings', name: 'Settings', icon: '🔧', path: '/settings', keywords: ['preferences', 'config', 'profile', 'account'] }
    ],

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadRecentSearches();
        this.injectStyles();
        this.createSearchModal();
        this.bindEvents();
    },

    loadRecentSearches() {
        try {
            const stored = localStorage.getItem('lume_recent_searches');
            this.recentSearches = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.recentSearches = [];
        }
    },

    saveRecentSearches() {
        localStorage.setItem('lume_recent_searches', JSON.stringify(this.recentSearches.slice(0, this.maxRecent)));
    },

    addToRecent(item) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(r => r.id !== item.id);
        // Add to front
        this.recentSearches.unshift(item);
        // Trim to max
        this.recentSearches = this.recentSearches.slice(0, this.maxRecent);
        this.saveRecentSearches();
    },

    // ===========================================
    // STYLES
    // ===========================================

    injectStyles() {
        if (document.getElementById('global-search-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'global-search-styles';
        styles.textContent = `
            .search-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 99999;
                display: none;
                align-items: flex-start;
                justify-content: center;
                padding-top: 15vh;
            }
            
            .search-overlay.active {
                display: flex;
                animation: fadeIn 0.1s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .search-modal {
                width: 100%;
                max-width: 600px;
                background: var(--nav-surface, #1E2438);
                border-radius: 16px;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--nav-border, rgba(255,255,255,0.1));
                overflow: hidden;
                animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .search-input-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.1));
                gap: 12px;
            }
            
            .search-input-container svg {
                width: 20px;
                height: 20px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.5));
                flex-shrink: 0;
            }
            
            .search-input {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                font-size: 16px;
                color: var(--nav-text-primary, #fff);
                font-family: inherit;
            }
            
            .search-input::placeholder {
                color: var(--nav-text-secondary, rgba(255,255,255,0.4));
            }
            
            .search-shortcut {
                display: flex;
                gap: 4px;
            }
            
            .search-shortcut kbd {
                background: rgba(255,255,255,0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.5));
                font-family: monospace;
            }
            
            .search-results {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .search-results:empty::after {
                content: 'No results found';
                display: block;
                padding: 40px 20px;
                text-align: center;
                color: var(--nav-text-secondary, rgba(255,255,255,0.4));
            }
            
            .search-section {
                padding: 8px 0;
            }
            
            .search-section-header {
                padding: 8px 20px;
                font-size: 11px;
                font-weight: 600;
                color: var(--nav-text-secondary, rgba(255,255,255,0.5));
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .search-result-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 20px;
                cursor: pointer;
                transition: background 0.1s;
            }
            
            .search-result-item:hover,
            .search-result-item.selected {
                background: rgba(79, 125, 243, 0.15);
            }
            
            .search-result-item.selected {
                background: rgba(79, 125, 243, 0.2);
            }
            
            .search-result-icon {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                background: rgba(79, 125, 243, 0.15);
                flex-shrink: 0;
            }
            
            .search-result-content {
                flex: 1;
                min-width: 0;
            }
            
            .search-result-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--nav-text-primary, #fff);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .search-result-title mark {
                background: rgba(79, 125, 243, 0.3);
                color: inherit;
                border-radius: 2px;
            }
            
            .search-result-subtitle {
                font-size: 12px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.5));
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .search-result-badge {
                padding: 4px 8px;
                font-size: 10px;
                border-radius: 4px;
                background: rgba(255,255,255,0.1);
                color: var(--nav-text-secondary, rgba(255,255,255,0.6));
            }
            
            .search-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 20px;
                border-top: 1px solid var(--nav-border, rgba(255,255,255,0.1));
                font-size: 11px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.4));
            }
            
            .search-footer-hints {
                display: flex;
                gap: 16px;
            }
            
            .search-footer-hint {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .search-footer-hint kbd {
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
            
            .search-filters {
                display: flex;
                gap: 8px;
                padding: 12px 20px;
                border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.05));
                flex-wrap: wrap;
            }
            
            .search-filter {
                padding: 4px 10px;
                font-size: 12px;
                background: rgba(255,255,255,0.08);
                border: none;
                border-radius: 12px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.6));
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .search-filter:hover {
                background: rgba(255,255,255,0.12);
            }
            
            .search-filter.active {
                background: var(--nav-accent, #4F7DF3);
                color: white;
            }

            /* Hide filters as per user request */
            .search-filters {
                display: none !important;
            }
        `;
        document.head.appendChild(styles);
    },

    // ===========================================
    // MODAL CREATION
    // ===========================================

    createSearchModal() {
        if (document.getElementById('global-search-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'global-search-overlay';
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-modal" onclick="event.stopPropagation()">
                <div class="search-input-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" class="search-input" id="global-search-input" 
                           placeholder="Search clients, pages, actions..." 
                           autocomplete="off" spellcheck="false">
                    <div class="search-shortcut">
                        <kbd>esc</kbd>
                    </div>
                </div>
                <div class="search-filters" id="search-filters">
                    <button class="search-filter active" data-filter="all">All</button>
                    <button class="search-filter" data-filter="clients">👤 Clients</button>
                    <button class="search-filter" data-filter="pages">📄 Pages</button>
                    <button class="search-filter" data-filter="actions">⚡ Actions</button>
                </div>
                <div class="search-results" id="search-results"></div>
                <div class="search-footer">
                    <span>Lume MedSpa AI</span>
                </div>
            </div>
        `;

        overlay.addEventListener('click', () => this.close());
        document.body.appendChild(overlay);

        // Bind input events
        const input = document.getElementById('global-search-input');
        input.addEventListener('input', (e) => this.handleInput(e.target.value));
        input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Filter buttons
        const filters = document.querySelectorAll('.search-filter');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.search(this.query);
            });
        });
    },

    // ===========================================
    // EVENTS
    // ===========================================

    bindEvents() {
        // Global keyboard shortcut: Cmd/Ctrl + K
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }

            // Also support / when not in input
            if (e.key === '/' && !this.isInputFocused() && !this.isOpen) {
                e.preventDefault();
                this.open();
            }
        });
    },

    isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.isOpen = true;
            this.query = '';
            this.selectedIndex = 0;

            const input = document.getElementById('global-search-input');
            input.value = '';
            input.focus();

            // Show suggestions immediately on open
            this.showDefaultResults();
        }
    },

    close() {
        const overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.isOpen = false;
        }
    },

    handleInput(value) {
        this.query = value.trim();
        this.selectedIndex = 0;

        if (this.query.length === 0) {
            this.showDefaultResults();
        } else {
            this.search(this.query);
        }
    },

    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectNext();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectPrevious();
                break;
            case 'Enter':
                e.preventDefault();
                this.executeSelected();
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    },

    selectNext() {
        const items = document.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.updateSelection();
    },

    selectPrevious() {
        const items = document.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.updateSelection();
    },

    updateSelection() {
        const items = document.querySelectorAll('.search-result-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this.selectedIndex);
            if (i === this.selectedIndex) {
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    },

    executeSelected() {
        if (this.results.length === 0) return;

        const selected = this.results[this.selectedIndex];
        if (selected) {
            this.executeResult(selected);
        }
    },

    executeResult(result) {
        this.addToRecent({
            id: result.id,
            name: result.name,
            type: result.type,
            icon: result.icon
        });

        if (result.action) {
            result.action();
        } else if (result.path) {
            navigateTo(result.path);
        }

        this.close();
    },

    // ===========================================
    // SEARCH LOGIC
    // ===========================================

    search(query) {
        const q = query.toLowerCase();
        this.results = [];
        this.query = query; // Ensure internal query is updated
        const filter = this.currentFilter || 'all';

        let allMatches = [];

        // Search clients
        if (filter === 'all' || filter === 'clients') {
            const clients = this.searchClients(q);
            allMatches.push(...clients);
        }

        // Search pages
        if (filter === 'all' || filter === 'pages') {
            const pages = this.searchPages(q);
            allMatches.push(...pages);
        }

        // Search actions
        if (filter === 'all' || filter === 'actions') {
            const actions = this.searchActions(q);
            allMatches.push(...actions);
        }

        // Sort by relevance (prefix match is higher than contains)
        allMatches.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aPrefix = aName.startsWith(q);
            const bPrefix = bName.startsWith(q);

            if (aPrefix && !bPrefix) return -1;
            if (!aPrefix && bPrefix) return 1;

            // If both prefixes or both not, sort by length (shorter is more likely to be the direct match)
            return aName.length - bName.length;
        });

        // Pick top 3-5 as suggestions if we have a query
        if (q.length > 0) {
            const topResults = allMatches.slice(0, 3).map(r => ({ ...r, isSuggestion: true }));
            const remaining = allMatches.slice(3);
            this.results = [...topResults, ...remaining];
        } else {
            this.results = allMatches;
        }

        // Limit total results
        this.results = this.results.slice(0, 15);

        this.renderResults();
    },

    searchClients(query) {
        if (!ClientDataService) return [];

        const clients = ClientDataService.getAll() || [];
        return clients
            .filter(c =>
                (c.name && c.name.toLowerCase().includes(query)) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.phone && c.phone.includes(query))
            )
            .slice(0, 5)
            .map(c => ({
                id: `client-${c.id}`,
                type: 'client',
                name: c.name,
                subtitle: c.email || c.phone || `${c.membershipTier} Member`,
                icon: '👤',
                path: `/clients/${c.id}`,
                data: c
            }));
    },

    searchPages(query) {
        return this.PAGES
            .filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.keywords.some(k => k.includes(query))
            )
            .map(p => ({
                id: `page-${p.id}`,
                type: 'page',
                name: p.name,
                subtitle: `Navigate to ${p.name}`,
                icon: p.icon,
                path: p.path
            }));
    },

    searchActions(query) {
        return this.QUICK_ACTIONS
            .filter(a => a.name.toLowerCase().includes(query))
            .map(a => ({
                id: `action-${a.id}`,
                type: 'action',
                name: a.name,
                subtitle: 'Quick Action',
                icon: a.icon,
                action: a.action
            }));
    },

    showDefaultResults() {
        this.results = [];

        // 1. Show Recent Searches if any
        if (this.recentSearches.length > 0) {
            this.recentSearches.forEach(r => {
                this.results.push({
                    ...r,
                    subtitle: 'Recent',
                    // Re-link actions/paths
                    path: r.type === 'page' ? this.PAGES.find(p => p.id === r.id.replace('page-', ''))?.path : (r.path || null),
                    action: r.type === 'action' ? this.QUICK_ACTIONS.find(a => a.id === r.id.replace('action-', ''))?.action : null
                });
            });
        }

        // 2. Map some high-value Actions as suggestions if not many recents
        if (this.results.length < 5) {
            const suggestions = [
                this.QUICK_ACTIONS.find(a => a.id === 'add-client'),
                this.QUICK_ACTIONS.find(a => a.id === 'notifications'),
                this.PAGES.find(p => p.id === 'analytics')
            ].filter(Boolean);

            suggestions.forEach(s => {
                const id = s.path ? `page-${s.id}` : `action-${s.id}`;
                if (!this.results.find(r => r.id === id)) {
                    this.results.push({
                        id,
                        type: s.path ? 'page' : 'action',
                        name: s.name,
                        subtitle: 'Suggested',
                        icon: s.icon,
                        path: s.path,
                        action: s.action
                    });
                }
            });
        }

        // 3. Add top 3 clients as "Suggested" if space remains
        if (this.results.length < 8 && ClientDataService) {
            const clients = ClientDataService.getAll().slice(0, 3);
            clients.forEach(c => {
                if (!this.results.find(r => r.id === `client-${c.id}`)) {
                    this.results.push({
                        id: `client-${c.id}`,
                        type: 'client',
                        name: c.name,
                        subtitle: 'Suggested Client',
                        icon: '👤',
                        path: `/clients/${c.id}`,
                        data: c
                    });
                }
            });
        }

        this.renderResults();
    },

    // ===========================================
    // RENDERING
    // ===========================================

    renderResults() {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (this.results.length === 0) {
            container.innerHTML = this.query ? '' : ''; // Keep it clean if no matches
            return;
        }

        // Group results: Suggestions first, then by type
        const suggestions = [];
        const others = {};

        this.results.forEach((result, index) => {
            if (result.isSuggestion) {
                suggestions.push({ ...result, index });
            } else {
                const type = result.type;
                if (!others[type]) others[type] = [];
                others[type].push({ ...result, index });
            }
        });

        let html = '';
        const typeLabels = {
            client: 'Clients',
            page: 'Pages',
            action: 'Quick Actions',
            recent: 'Recent'
        };

        // Render Suggestions section
        if (suggestions.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">Suggestions</div>
                    ${suggestions.map(item => this.renderResultItem(item)).join('')}
                </div>
            `;
        }

        // Render other sections
        for (const [type, items] of Object.entries(others)) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">${typeLabels[type] || type}</div>
                    ${items.map(item => this.renderResultItem(item)).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
        this.updateSelection();
    },

    renderResultItem(result) {
        const highlighted = this.query ?
            this.highlightMatch(result.name, this.query) :
            result.name;

        return `
            <div class="search-result-item ${result.index === this.selectedIndex ? 'selected' : ''}" 
                 data-index="${result.index}"
                 onclick="GlobalSearch.executeResultByIndex(${result.index})">
                <div class="search-result-icon">${result.icon}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${highlighted}</div>
                    <div class="search-result-subtitle">${result.subtitle || ''}</div>
                </div>
                ${result.type === 'client' && result.data ? `
                    <span class="search-result-badge">${result.data.membershipTier || 'Member'}</span>
                ` : ''}
            </div>
        `;
    },

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    executeResultByIndex(index) {
        const result = this.results[index];
        if (result) {
            this.executeResult(result);
        }
    }
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalSearch.init());
} else {
    GlobalSearch.init();
}

// Expose globally
window.GlobalSearch = GlobalSearch;

// Helper function to open search
window.openSearch = () => GlobalSearch.open();
