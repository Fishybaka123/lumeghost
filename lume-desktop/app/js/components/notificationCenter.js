// ===========================================
// NOTIFICATION CENTER - Professional Notifications
// In-App, Push, & Preference Management
// ===========================================

const NotificationCenter = {
    // Notification storage
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    maxNotifications: 100,

    // Notification types
    TYPES: {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error',
        ALERT: 'alert',
        REMINDER: 'reminder',
        SYSTEM: 'system'
    },

    // Notification categories
    CATEGORIES: {
        CLIENT: 'client',
        APPOINTMENT: 'appointment',
        PAYMENT: 'payment',
        SYSTEM: 'system',
        MARKETING: 'marketing',
        ANALYTICS: 'analytics'
    },

    // User preferences
    preferences: {
        showDesktopNotifications: true,
        playSound: false,
        emailDigest: 'daily', // none, instant, daily, weekly
        categories: {
            client: true,
            appointment: true,
            payment: true,
            system: true,
            marketing: false,
            analytics: true
        }
    },

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadNotifications();
        this.loadPreferences();
        this.requestPushPermission();
        this.injectStyles();
        this.render();
        this.bindEvents();

        // Generate demo notifications if empty
        if (this.notifications.length === 0) {
            this.generateDemoNotifications();
        }

        this.updateBadge();
    },

    loadNotifications() {
        try {
            const stored = localStorage.getItem('lume_notifications');
            this.notifications = stored ? JSON.parse(stored) : [];
            this.unreadCount = this.notifications.filter(n => !n.read).length;
        } catch (e) {
            console.error('Failed to load notifications:', e);
            this.notifications = [];
        }
    },

    saveNotifications() {
        try {
            // Keep only the last N notifications
            if (this.notifications.length > this.maxNotifications) {
                this.notifications = this.notifications.slice(-this.maxNotifications);
            }
            localStorage.setItem('lume_notifications', JSON.stringify(this.notifications));
        } catch (e) {
            console.error('Failed to save notifications:', e);
        }
    },

    loadPreferences() {
        try {
            const stored = localStorage.getItem('lume_notification_prefs');
            if (stored) {
                this.preferences = { ...this.preferences, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load preferences:', e);
        }
    },

    savePreferences() {
        localStorage.setItem('lume_notification_prefs', JSON.stringify(this.preferences));
    },

    // ===========================================
    // PUSH NOTIFICATIONS
    // ===========================================

    async requestPushPermission() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'default') {
            // Don't ask immediately, wait for user action
            return;
        }
    },

    async showPushNotification(notification) {
        if (!this.preferences.showDesktopNotifications) return;
        if (Notification.permission !== 'granted') return;

        try {
            const n = new Notification(notification.title, {
                body: notification.message,
                icon: '/assets/icon.png',
                badge: '/assets/badge.png',
                tag: notification.id,
                data: notification
            });

            n.onclick = () => {
                window.focus();
                if (notification.action) {
                    notification.action();
                }
                n.close();
            };
        } catch (e) {
            console.error('Failed to show push notification:', e);
        }
    },

    // ===========================================
    // NOTIFICATION MANAGEMENT
    // ===========================================

    /**
     * Add a new notification
     * @param {Object} options - Notification options
     */
    add(options) {
        const notification = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            title: options.title || 'Notification',
            message: options.message || '',
            type: options.type || this.TYPES.INFO,
            category: options.category || this.CATEGORIES.SYSTEM,
            timestamp: new Date().toISOString(),
            read: false,
            actionLabel: options.actionLabel || null,
            actionUrl: options.actionUrl || null,
            data: options.data || null,
            persistent: options.persistent || false
        };

        // Check if category is enabled
        if (!this.preferences.categories[notification.category]) {
            return null;
        }

        this.notifications.unshift(notification);
        this.unreadCount++;
        this.saveNotifications();
        this.updateBadge();
        this.render();

        // Show push notification
        if (this.preferences.showDesktopNotifications) {
            this.showPushNotification(notification);
        }

        // Play sound
        if (this.preferences.playSound) {
            this.playNotificationSound();
        }

        return notification;
    },

    /**
     * Quick helper methods
     */
    info(title, message, options = {}) {
        return this.add({ ...options, title, message, type: this.TYPES.INFO });
    },

    success(title, message, options = {}) {
        return this.add({ ...options, title, message, type: this.TYPES.SUCCESS });
    },

    warning(title, message, options = {}) {
        return this.add({ ...options, title, message, type: this.TYPES.WARNING });
    },

    error(title, message, options = {}) {
        return this.add({ ...options, title, message, type: this.TYPES.ERROR });
    },

    alert(title, message, options = {}) {
        return this.add({ ...options, title, message, type: this.TYPES.ALERT });
    },

    /**
     * Mark notification as read
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.saveNotifications();
            this.updateBadge();
            this.render();
        }
    },

    /**
     * Mark all as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.render();
    },

    /**
     * Delete notification
     */
    delete(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index >= 0) {
            if (!this.notifications[index].read) {
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            }
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.updateBadge();
            this.render();
        }
    },

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.render();
    },

    // ===========================================
    // UI RENDERING
    // ===========================================

    injectStyles() {
        if (document.getElementById('notification-center-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-center-styles';
        styles.textContent = `
            .notification-panel {
                position: fixed;
                top: 60px;
                right: 16px;
                width: 380px;
                max-height: calc(100vh - 100px);
                background: var(--nav-surface, #1E2438);
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                z-index: 10000;
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid var(--nav-border, rgba(255,255,255,0.1));
            }
            
            .notification-panel.active {
                display: flex;
                animation: slideDown 0.2s ease-out;
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .notification-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.1));
            }
            
            .notification-panel-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--nav-text-primary, #fff);
                margin: 0;
            }
            
            .notification-panel-actions {
                display: flex;
                gap: 8px;
            }
            
            .notification-panel-actions button {
                background: none;
                border: none;
                color: var(--nav-accent, #4F7DF3);
                font-size: 12px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background 0.15s;
            }
            
            .notification-panel-actions button:hover {
                background: rgba(79, 125, 243, 0.15);
            }
            
            .notification-list {
                flex: 1;
                overflow-y: auto;
                max-height: 400px;
            }
            
            .notification-item {
                display: flex;
                gap: 12px;
                padding: 14px 20px;
                border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.05));
                cursor: pointer;
                transition: background 0.15s;
            }
            
            .notification-item:hover {
                background: rgba(255,255,255,0.03);
            }
            
            .notification-item.unread {
                background: rgba(79, 125, 243, 0.08);
            }
            
            .notification-item.unread::before {
                content: '';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 6px;
                height: 6px;
                background: var(--nav-accent, #4F7DF3);
                border-radius: 50%;
            }
            
            .notification-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 16px;
            }
            
            .notification-icon.info { background: rgba(79, 125, 243, 0.2); }
            .notification-icon.success { background: rgba(16, 185, 129, 0.2); }
            .notification-icon.warning { background: rgba(245, 158, 11, 0.2); }
            .notification-icon.error { background: rgba(239, 68, 68, 0.2); }
            .notification-icon.alert { background: rgba(236, 72, 153, 0.2); }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-size: 13px;
                font-weight: 500;
                color: var(--nav-text-primary, #fff);
                margin-bottom: 2px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .notification-title .badge {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                background: rgba(79, 125, 243, 0.2);
                color: var(--nav-accent, #4F7DF3);
            }
            
            .notification-message {
                font-size: 12px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.6));
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            .notification-time {
                font-size: 11px;
                color: var(--nav-text-secondary, rgba(255,255,255,0.4));
                margin-top: 4px;
            }
            
            .notification-action-btn {
                margin-top: 8px;
                padding: 4px 10px;
                font-size: 11px;
                background: var(--nav-accent, #4F7DF3);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .notification-delete {
                opacity: 0;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: none;
                background: none;
                color: var(--nav-text-secondary, rgba(255,255,255,0.4));
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.15s, background 0.15s;
            }
            
            .notification-item:hover .notification-delete {
                opacity: 1;
            }
            
            .notification-delete:hover {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }
            
            .notification-empty {
                padding: 40px 20px;
                text-align: center;
                color: var(--nav-text-secondary, rgba(255,255,255,0.5));
            }
            
            .notification-empty svg {
                width: 48px;
                height: 48px;
                margin-bottom: 12px;
                opacity: 0.3;
            }
            
            .notification-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 18px;
                height: 18px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 600;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .notification-badge:empty,
            .notification-badge[data-count="0"] {
                display: none;
            }
        `;
        document.head.appendChild(styles);
    },

    render() {
        const panel = document.getElementById('notification-panel');
        if (!panel) return;

        const list = panel.querySelector('.notification-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.notifications.map(n => this.renderNotificationItem(n)).join('');
    },

    renderNotificationItem(notification) {
        const icons = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            alert: '🔔',
            reminder: '⏰',
            system: '⚙️'
        };

        const icon = icons[notification.type] || '📌';
        const timeAgo = this.formatTimeAgo(notification.timestamp);

        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}"
                 onclick="NotificationCenter.handleNotificationClick('${notification.id}')">
                <div class="notification-icon ${notification.type}">${icon}</div>
                <div class="notification-content">
                    <div class="notification-title">
                        ${notification.title}
                        ${notification.category !== 'system' ? `<span class="badge">${notification.category}</span>` : ''}
                    </div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                    ${notification.actionLabel ? `
                        <button class="notification-action-btn" onclick="event.stopPropagation(); NotificationCenter.handleAction('${notification.id}')">
                            ${notification.actionLabel}
                        </button>
                    ` : ''}
                </div>
                <button class="notification-delete" onclick="event.stopPropagation(); NotificationCenter.delete('${notification.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
    },

    updateBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.setAttribute('data-count', this.unreadCount);
        });
    },

    formatTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return then.toLocaleDateString();
    },

    // ===========================================
    // EVENT HANDLERS
    // ===========================================

    bindEvents() {
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            const trigger = document.querySelector('.notification-trigger');

            if (panel && this.isOpen) {
                if (!panel.contains(e.target) && !trigger?.contains(e.target)) {
                    this.close();
                }
            }
        });

        // Keyboard shortcut: N to open notifications
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !this.isInputFocused()) {
                this.toggle();
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
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.add('active');
            this.isOpen = true;
        }
    },

    close() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.remove('active');
            this.isOpen = false;
        }
    },

    handleNotificationClick(id) {
        this.markAsRead(id);
        const notification = this.notifications.find(n => n.id === id);
        if (notification?.actionUrl) {
            navigateTo(notification.actionUrl);
            this.close();
        }
    },

    handleAction(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification?.actionUrl) {
            navigateTo(notification.actionUrl);
            this.close();
        }
    },

    playNotificationSound() {
        // Simple beep using Web Audio API
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gain.gain.value = 0.1;

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            // Audio not supported
        }
    },

    // ===========================================
    // DEMO NOTIFICATIONS
    // ===========================================

    generateDemoNotifications() {
        const demos = [
            {
                title: 'Welcome to Lume MedSpa AI',
                message: 'Your professional med spa management platform is ready. Explore the features!',
                type: 'success',
                category: 'system'
            },
            {
                title: 'High-Risk Client Alert',
                message: 'Sarah M. has a 78% churn risk. Consider reaching out with a personalized offer.',
                type: 'warning',
                category: 'client',
                actionLabel: 'View Client',
                actionUrl: '/clients'
            },
            {
                title: 'Weekly Report Available',
                message: 'Your client health analytics report for this week is ready to view.',
                type: 'info',
                category: 'analytics',
                actionLabel: 'View Report',
                actionUrl: '/analytics'
            }
        ];

        demos.forEach((demo, i) => {
            setTimeout(() => this.add(demo), i * 100);
        });
    }
};

// Create notification panel HTML
function createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel';
    panel.innerHTML = `
        <div class="notification-panel-header">
            <h3>🔔 Notifications</h3>
            <div class="notification-panel-actions">
                <button onclick="NotificationCenter.markAllAsRead()">Mark all read</button>
                <button onclick="NotificationCenter.clearAll()">Clear all</button>
            </div>
        </div>
        <div class="notification-list"></div>
    `;
    document.body.appendChild(panel);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createNotificationPanel();
        NotificationCenter.init();
    });
} else {
    createNotificationPanel();
    NotificationCenter.init();
}

// Expose globally
window.NotificationCenter = NotificationCenter;
