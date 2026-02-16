// ===========================================
// COMMUNICATIONS PAGE - Communication Hub
// ===========================================

let currentChannel = 'all';
let currentCommsSearch = '';
let selectedClientId = null;

function renderCommunicationsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    // Initialize communication service
    if (typeof CommunicationService !== 'undefined' && CommunicationService.init && !CommunicationService.messages.length) {
        // Silent init if needed
        CommunicationService.init();
    }

    const stats = (typeof CommunicationService !== 'undefined' && typeof CommunicationService.getStats === 'function')
        ? CommunicationService.getStats()
        : { total: 0, sms: 0, email: 0, unread: 0 };

    const recentMessages = (typeof CommunicationService !== 'undefined' && typeof CommunicationService.getRecent === 'function')
        ? CommunicationService.getRecent(15)
        : [];

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
                            <button class="btn btn-primary" onclick="openNewMessageModal()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                New Message
                            </button>
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
                    <div class="comm-tabs glass-panel">
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
                        <div class="comm-stat-card glass-card blue">
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
                        <div class="comm-stat-card glass-card cyan">
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
                        <div class="comm-stat-card glass-card pink">
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
                        <div class="comm-stat-card glass-card orange">
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
                    <div class="comm-messages-container glass-card" id="conversations-tab">
                        <div class="comm-messages-header">
                            <h3>💬 Recent Conversations</h3>
                        </div>
                        <div class="comm-messages-list" id="comm-messages-list">
                            ${renderMessagesList(recentMessages)}
                        </div>
                    </div>
                    
                    <!-- Automations Tab (hidden by default) -->
                    <div class="comm-automations-container" id="automations-tab" style="display: none;">
                        <div class="automation-card glass-card">
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
                        <div class="automation-card glass-card">
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
                        <div class="automation-card glass-card">
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

        <!-- New Message Modal -->
        <div id="new-message-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeNewMessageModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>New Message</h3>
                    <button class="modal-close" onclick="closeNewMessageModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label class="form-label" style="font-weight: 500; color: var(--gray-200);">Select Recipients</label>
                            <span id="selected-count-badge" style="font-size: 12px; color: var(--gray-400);">0 selected</span>
                        </div>
                        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                            <button type="button" class="btn btn-sm btn-secondary" onclick="toggleClientPicker()" id="select-more-btn" style="font-size: 12px; padding: 6px 14px;">Select More</button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="selectAllClients()" style="font-size: 12px; padding: 6px 14px;">Select All</button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="deselectAllClients()" style="font-size: 12px; padding: 6px 14px;">Deselect All</button>
                        </div>
                        <div id="client-picker-list" style="max-height: 180px; overflow-y: auto; border: 1px solid var(--gray-600); border-radius: var(--radius-md); background: rgba(0,0,0,0.2); display: none;">
                            <!-- Client checkboxes inserted here -->
                        </div>
                        <div id="selected-clients-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                            <!-- Selected client tags shown here -->
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--gray-200);">Message Type</label>
                        <div class="type-selector" style="display: flex; gap: 8px;">
                            <button type="button" class="type-btn active" onclick="setMsgType('sms', this)" style="padding: 8px 16px; border: 1px solid var(--gray-600); border-radius: 20px; background: rgba(255,255,255,0.1); color: var(--gray-200); cursor: pointer;">SMS</button>
                            <button type="button" class="type-btn" onclick="setMsgType('email', this)" style="padding: 8px 16px; border: 1px solid var(--gray-600); border-radius: 20px; background: rgba(255,255,255,0.05); color: var(--gray-200); cursor: pointer;">Email</button>
                            <button type="button" class="type-btn" onclick="setMsgType('note', this)" style="padding: 8px 16px; border: 1px solid var(--gray-600); border-radius: 20px; background: rgba(255,255,255,0.05); color: var(--gray-200); cursor: pointer;">Internal Note</button>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label class="form-label" style="font-weight: 500; color: var(--gray-200);">Message Content</label>
                            <button type="button" class="btn btn-sm" onclick="generateAIMessage()" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                                AI Generate
                            </button>
                        </div>
                        <textarea id="new-msg-content" class="input" rows="5" placeholder="Type your message here..." style="width: 100%; padding: 12px; border: 1px solid var(--gray-600); border-radius: var(--radius-md); font-family: inherit; resize: vertical; background: rgba(0,0,0,0.2); color: var(--gray-100);"></textarea>
                    </div>

                    <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                        <button class="btn btn-secondary" onclick="closeNewMessageModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="sendNewMessage()">Send Message</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global variable for current message type
let currentMsgType = 'sms';

// Track selected clients for mass messaging
let selectedMessageClients = new Set();

function openNewMessageModal() {
    const modal = document.getElementById('new-message-modal');
    selectedMessageClients.clear();

    // Populate client checkboxes
    const listEl = document.getElementById('client-picker-list');
    if (listEl && ClientDataService) {
        const clients = ClientDataService.getAll();
        listEl.innerHTML = clients.map(c => `
            <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);" 
                   onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='none'">
                <input type="checkbox" value="${c.id}" onchange="toggleClientSelection('${c.id}', '${(c.firstName || '').replace(/'/g, '')} ${(c.lastName || '').replace(/'/g, '')}', this.checked)" 
                       style="accent-color: #6366f1; width: 16px; height: 16px;">
                <span style="color: var(--gray-100); font-size: 13px;">${c.firstName} ${c.lastName}</span>
                <span style="color: var(--gray-500); font-size: 11px; margin-left: auto;">${c.email || ''}</span>
            </label>
        `).join('');
    }

    // Reset
    document.getElementById('new-msg-content').value = '';
    document.getElementById('selected-clients-tags').innerHTML = '';
    document.getElementById('client-picker-list').style.display = 'none';
    updateSelectedCount();
    setMsgType('sms', document.querySelector('.type-btn'));

    if (modal) modal.style.display = 'flex';
}

function toggleClientPicker() {
    const list = document.getElementById('client-picker-list');
    if (list) {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleClientSelection(clientId, clientName, checked) {
    if (checked) {
        selectedMessageClients.add(clientId);
    } else {
        selectedMessageClients.delete(clientId);
    }
    updateSelectedTags();
    updateSelectedCount();
}

function selectAllClients() {
    const checkboxes = document.querySelectorAll('#client-picker-list input[type=checkbox]');
    checkboxes.forEach(cb => {
        cb.checked = true;
        selectedMessageClients.add(cb.value);
    });
    updateSelectedTags();
    updateSelectedCount();
    // Show the list so user can see
    document.getElementById('client-picker-list').style.display = 'block';
}

function deselectAllClients() {
    const checkboxes = document.querySelectorAll('#client-picker-list input[type=checkbox]');
    checkboxes.forEach(cb => cb.checked = false);
    selectedMessageClients.clear();
    updateSelectedTags();
    updateSelectedCount();
}

function updateSelectedCount() {
    const badge = document.getElementById('selected-count-badge');
    if (badge) {
        const count = selectedMessageClients.size;
        badge.textContent = count === 0 ? '0 selected' : `${count} selected`;
        badge.style.color = count > 0 ? '#6366f1' : 'var(--gray-400)';
    }
}

function updateSelectedTags() {
    const container = document.getElementById('selected-clients-tags');
    if (!container) return;

    const clients = ClientDataService ? ClientDataService.getAll() : [];
    const selected = clients.filter(c => selectedMessageClients.has(String(c.id)));

    if (selected.length === 0) {
        container.innerHTML = '<span style="color: var(--gray-500); font-size: 12px;">No recipients selected</span>';
        return;
    }

    const maxShow = 8;
    const tags = selected.slice(0, maxShow).map(c => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px;">
            ${c.firstName} ${c.lastName}
            <span onclick="removeClientSelection('${c.id}')" style="cursor: pointer; font-size: 14px; line-height: 1;">&times;</span>
        </span>
    `).join('');

    const extra = selected.length > maxShow ? `<span style="color: var(--gray-400); font-size: 12px;">+${selected.length - maxShow} more</span>` : '';
    container.innerHTML = tags + extra;
}

function removeClientSelection(clientId) {
    selectedMessageClients.delete(clientId);
    // Uncheck the checkbox
    const cb = document.querySelector(`#client-picker-list input[value="${clientId}"]`);
    if (cb) cb.checked = false;
    updateSelectedTags();
    updateSelectedCount();
}

function closeNewMessageModal() {
    const modal = document.getElementById('new-message-modal');
    if (modal) modal.style.display = 'none';
}

function setMsgType(type, btn) {
    currentMsgType = type;

    // Update UI
    document.querySelectorAll('.type-btn').forEach(b => {
        b.style.background = 'white';
        b.style.color = 'var(--gray-700)';
        b.style.borderColor = 'var(--gray-200)';
        b.classList.remove('active');
    });

    if (btn) {
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--primary)';
    }
}

function generateAIMessage() {
    const type = currentMsgType;
    const clientSelect = document.getElementById('new-msg-client');
    const clientId = clientSelect.value;
    let clientName = 'Client';

    if (clientId && ClientDataService) {
        const client = ClientDataService.getById(clientId);
        if (client) clientName = client.firstName;
    }

    const textarea = document.getElementById('new-msg-content');

    // Simulate AI generation with templates
    let templates = [];

    if (type === 'sms') {
        templates = [
            `Hi ${clientName}, this is a reminder for your upcoming appointment at Lume. Please reply 'C' to confirm.`,
            `Hello ${clientName}, we have a special offer on HydraFacials this week! Book now to save 15%.`,
            `Hi ${clientName}, it's been a while since your last visit. We'd love to see you again soon!`
        ];
    } else if (type === 'email') {
        templates = [
            `Subject: Your Appointment Confirmation\n\nDear ${clientName},\n\nWe look forward to seeing you for your appointment. Please arrive 10 minutes early.\n\nBest,\nLume Med Spa`,
            `Subject: Exclusive Member Offer\n\nHi ${clientName},\n\nAs a valued client, we're excited to offer you exclusive access to our new skincare line...\n\nWarmly,\nThe Lume Team`,
            `Subject: Follow-up on your treatment\n\nDear ${clientName},\n\nWe hope you're enjoying the results of your recent treatment. Here are some aftercare tips...\n\nBest,\nLume Med Spa`
        ];
    } else {
        templates = [
            `Client expressed interest in upgrading to the Premium membership package.`,
            `Follow up with ${clientName} in 2 weeks regarding skin reaction to new product.`,
            `Note: Client prefers room temperature water and extra pillows.`
        ];
    }

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    // "Type" the message for effect
    textarea.value = "Generating AI draft...";
    setTimeout(() => {
        textarea.value = randomTemplate;
    }, 800);
}

function sendNewMessage() {
    const content = document.getElementById('new-msg-content').value;

    if (selectedMessageClients.size === 0) {
        showToast('Please select at least one recipient', 'error');
        return;
    }

    if (!content) {
        showToast('Please enter a message', 'error');
        return;
    }

    if (CommunicationService) {
        let metadata = {};
        if (currentMsgType === 'email') metadata.subject = 'New Message';

        let sentCount = 0;
        selectedMessageClients.forEach(clientId => {
            CommunicationService.log(clientId, currentMsgType, content, metadata);
            sentCount++;
        });

        showToast(`Message sent to ${sentCount} client${sentCount > 1 ? 's' : ''} successfully`, 'success');
        closeNewMessageModal();
        refreshCommunications();
    }
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
