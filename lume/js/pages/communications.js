// ===========================================
// COMMUNICATIONS PAGE - Communication Hub
// ===========================================

let currentChannel = 'all';
let currentCommsSearch = '';
let selectedClientId = null;

function renderCommunicationsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Initialize communication service
    if (CommunicationService) {
        // Demo data generation removed per user request (Clear history)
    }

    const stats = CommunicationService ? CommunicationService.getStats() : { total: 0, sms: 0, email: 0, unread: 0 };
    const recentMessages = CommunicationService ? CommunicationService.getRecent(15) : [];

    return `
        <div class="app-layout-topnav communications-page">
            ${createTopNav('communications')}
            
            <main class="main-content" id="main-content">
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Communication Hub</h1>
                            <p>Manage all client conversations in one place</p>
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-secondary" onclick="refreshCommunications()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <polyline points="23 4 23 10 17 10"/>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                Refresh
                            </button>
                            <button class="btn btn-secondary" onclick="exportCommunications()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="comm-tabs">
                        <button class="comm-tab active" onclick="switchCommTab('conversations', this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Conversations
                        </button>
                        <button class="comm-tab" onclick="switchCommTab('automations', this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            Automations
                        </button>
                    </div>
                    
                    <!-- Stats Cards -->
                    <div class="comm-stats">
                        <div class="comm-stat-card blue">
                            <div class="comm-stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                            </div>
                            <div class="comm-stat-content">
                                <span class="comm-stat-label">Total Messages</span>
                                <span class="comm-stat-value">${stats.total}</span>
                            </div>
                        </div>
                        <div class="comm-stat-card cyan">
                            <div class="comm-stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                                </svg>
                            </div>
                            <div class="comm-stat-content">
                                <span class="comm-stat-label">SMS Sent</span>
                                <span class="comm-stat-value">${stats.sms}</span>
                            </div>
                        </div>
                        <div class="comm-stat-card pink">
                            <div class="comm-stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </div>
                            <div class="comm-stat-content">
                                <span class="comm-stat-label">Emails Sent</span>
                                <span class="comm-stat-value">${stats.email}</span>
                            </div>
                        </div>
                        <div class="comm-stat-card orange">
                            <div class="comm-stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </div>
                            <div class="comm-stat-content">
                                <span class="comm-stat-label">Unread</span>
                                <span class="comm-stat-value">${stats.unread}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Search and Filter -->
                    <div class="comm-filter-bar">
                        <div class="comm-search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input type="text" class="input" placeholder="Search by name, email, phone, or message content..." 
                                   id="comm-search-input" onkeyup="searchCommunications(this.value)">
                        </div>
                        <select class="input channel-select" onchange="filterByChannel(this.value)">
                            <option value="all">All Channels</option>
                            <option value="sms">SMS</option>
                            <option value="email">Email</option>
                            <option value="nudge">Nudges</option>
                            <option value="internal">Notes</option>
                        </select>
                    </div>
                    
                    <!-- Messages List -->
                    <div class="comm-messages-container" id="conversations-tab">
                        <div class="comm-messages-header">
                            <h3>💬 Recent Conversations</h3>
                        </div>
                        <div class="comm-messages-list" id="comm-messages-list">
                            ${renderMessagesList(recentMessages)}
                        </div>
                    </div>
                    
                    <!-- Automations Tab (hidden by default) -->
                    <div class="comm-automations-container" id="automations-tab" style="display: none;">
                        <div class="automation-card">
                            <div class="automation-header">
                                <h3>📅 Expiring Package Reminder</h3>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <p>Automatically send reminder when package expires in 7 days</p>
                            <div class="automation-stats">
                                <span>Sent this month: 12</span>
                            </div>
                        </div>
                        <div class="automation-card">
                            <div class="automation-header">
                                <h3>⚠️ Low Sessions Alert</h3>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <p>Notify when client has 2 or fewer sessions remaining</p>
                            <div class="automation-stats">
                                <span>Sent this month: 8</span>
                            </div>
                        </div>
                        <div class="automation-card">
                            <div class="automation-header">
                                <h3>👋 Re-engagement Campaign</h3>
                                <label class="toggle-switch">
                                    <input type="checkbox">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <p>Reach out to clients who haven't visited in 30+ days</p>
                            <div class="automation-stats">
                                <span>Sent this month: 5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <!-- Client History Modal -->
        <div id="client-history-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeClientHistoryModal()"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3 id="client-history-title">Message History</h3>
                    <button class="modal-close" onclick="closeClientHistoryModal()">×</button>
                </div>
                <div class="modal-body" id="client-history-body">
                    <!-- Content will be set dynamically -->
                </div>
            </div>
        </div>
    `;
}

function renderMessagesList(messages) {
    if (!messages || messages.length === 0) {
        return `
            <div class="comm-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <h3>No conversations yet</h3>
                <p>Messages will appear here once you start communicating with clients</p>
            </div>
        `;
    }

    return messages.map(msg => renderMessageItem(msg)).join('');
}

function renderMessageItem(msg) {
    const timeAgo = getTimeAgo(msg.timestamp);
    const channelIcon = getChannelIcon(msg.channel || msg.type);
    const channelLabel = getChannelLabel(msg.channel || msg.type);
    const initials = msg.clientName ? msg.clientName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    // Truncate content
    const maxLength = 80;
    const content = msg.content.length > maxLength
        ? msg.content.substring(0, maxLength) + '...'
        : msg.content;

    return `
        <div class="comm-message-item ${msg.read ? '' : 'unread'}" onclick="viewClientHistory(${msg.clientId})">
            <div class="comm-message-avatar">
                ${initials}
            </div>
            <div class="comm-message-content">
                <div class="comm-message-header">
                    <span class="comm-message-name">${msg.clientName}</span>
                    <span class="comm-message-time">${timeAgo}</span>
                </div>
                <div class="comm-message-preview">
                    ${msg.subject ? `<strong>${msg.subject}:</strong> ` : ''}${content}
                </div>
                <div class="comm-message-meta">
                    <span class="comm-channel-badge ${msg.channel || msg.type}">
                        ${channelIcon} ${channelLabel}
                    </span>
                    ${msg.nudgeType ? `<span class="comm-nudge-type">${msg.nudgeType}</span>` : ''}
                </div>
            </div>
            ${!msg.read ? '<div class="comm-unread-dot"></div>' : ''}
        </div>
    `;
}

function getChannelIcon(channel) {
    switch (channel) {
        case 'sms': return '📱';
        case 'email': return '✉️';
        case 'nudge': return '🚀';
        case 'call': return '📞';
        case 'internal':
        case 'note': return '📝';
        default: return '💬';
    }
}

function getChannelLabel(channel) {
    switch (channel) {
        case 'sms': return 'SMS';
        case 'email': return 'Email';
        case 'nudge': return 'Nudge';
        case 'call': return 'Call';
        case 'internal':
        case 'note': return 'Note';
        default: return 'Message';
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function switchCommTab(tab, button) {
    // Update tab buttons
    document.querySelectorAll('.comm-tab').forEach(t => t.classList.remove('active'));
    button.classList.add('active');

    // Show/hide tab content
    if (tab === 'conversations') {
        document.getElementById('conversations-tab').style.display = 'block';
        document.getElementById('automations-tab').style.display = 'none';
    } else {
        document.getElementById('conversations-tab').style.display = 'none';
        document.getElementById('automations-tab').style.display = 'block';
    }
}

function searchCommunications(term) {
    currentCommsSearch = term;
    let messages;

    if (term.length > 0) {
        messages = CommunicationService.search(term);
    } else {
        messages = CommunicationService.getRecent(15);
    }

    // Apply channel filter
    if (currentChannel !== 'all') {
        messages = messages.filter(m => m.channel === currentChannel || m.type === currentChannel);
    }

    const container = document.getElementById('comm-messages-list');
    if (container) {
        container.innerHTML = renderMessagesList(messages);
    }
}

function filterByChannel(channel) {
    currentChannel = channel;
    let messages;

    if (channel === 'all') {
        messages = CommunicationService.getRecent(15);
    } else {
        messages = CommunicationService.getByChannel(channel);
        if (messages.length === 0) {
            messages = CommunicationService.getByType(channel);
        }
    }

    // Apply search filter
    if (currentCommsSearch) {
        const q = currentCommsSearch.toLowerCase();
        messages = messages.filter(m =>
            m.clientName.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.subject?.toLowerCase().includes(q)
        );
    }

    const container = document.getElementById('comm-messages-list');
    if (container) {
        container.innerHTML = renderMessagesList(messages);
    }
}

function viewClientHistory(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : null;
    const messages = CommunicationService ? CommunicationService.getByClient(clientId) : [];

    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';

    const modal = document.getElementById('client-history-modal');
    const title = document.getElementById('client-history-title');
    const body = document.getElementById('client-history-body');

    if (!modal || !body) return;

    title.textContent = `📋 ${clientName} - Communication History`;

    // Mark all as read
    messages.forEach(m => CommunicationService.markAsRead(m.id));

    body.innerHTML = `
        <div class="client-history-header">
            <div class="client-history-info">
                <p><strong>Email:</strong> ${client?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${client?.phone || 'N/A'}</p>
                <p><strong>Total Messages:</strong> ${messages.length}</p>
            </div>
            <div class="client-history-actions">
                <button class="btn btn-secondary btn-sm" onclick="sendNudge(${clientId}); closeClientHistoryModal();">
                    Send Nudge
                </button>
            </div>
        </div>
        
        <div class="client-history-timeline">
            ${messages.length > 0 ? messages.map(msg => `
                <div class="history-item">
                    <div class="history-item-icon ${msg.channel || msg.type}">
                        ${getChannelIcon(msg.channel || msg.type)}
                    </div>
                    <div class="history-item-content">
                        <div class="history-item-header">
                            <span class="history-item-type">${getChannelLabel(msg.channel || msg.type)}</span>
                            <span class="history-item-time">${formatDateTime(msg.timestamp)}</span>
                        </div>
                        ${msg.subject ? `<div class="history-item-subject">${msg.subject}</div>` : ''}
                        <div class="history-item-message">${msg.content}</div>
                    </div>
                </div>
            `).join('') : `
                <div class="comm-empty-state">
                    <p>No communication history with this client yet.</p>
                    <button class="btn btn-primary" onclick="sendNudge(${clientId}); closeClientHistoryModal();">
                        Send First Message
                    </button>
                </div>
            `}
        </div>
    `;

    modal.style.display = 'flex';
}

function closeClientHistoryModal() {
    const modal = document.getElementById('client-history-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Refresh the list to update read status
    navigateTo('/communications');
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function refreshCommunications() {
    navigateTo('/communications');
    showToast('✓ Refreshed', 'success');
}

function exportCommunications() {
    const messages = CommunicationService ? CommunicationService.getAll() : [];

    // Create CSV
    const headers = ['Date', 'Client', 'Email', 'Phone', 'Channel', 'Subject', 'Message'];
    const rows = messages.map(m => [
        new Date(m.timestamp).toISOString(),
        m.clientName,
        m.clientEmail || '',
        m.clientPhone || '',
        m.channel || m.type,
        m.subject || '',
        `"${m.content.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    showToast('✓ Exported communications', 'success');
}
