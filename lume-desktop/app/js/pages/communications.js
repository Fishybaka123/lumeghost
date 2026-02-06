// ===========================================
// COMMUNICATIONS PAGE
// ===========================================

function renderCommunicationsPage() {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    return `
        <div class="app-layout">
            ${createSidebar('communications')}
            
            <main class="main-content">
                ${createHeader(user)}
                
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Communications</h1>
                            <p>Manage all client communications and AI-powered automations</p>
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-primary" onclick="showNewMessageModal()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                New Message
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tab Navigation -->
                    <div class="comms-tabs">
                        <button class="comms-tab active" onclick="switchCommsTab('messages', this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Messages
                            <span class="tab-badge">12</span>
                        </button>
                        <button class="comms-tab" onclick="switchCommsTab('automations', this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                            AI Automations
                        </button>
                        <button class="comms-tab" onclick="switchCommsTab('templates', this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Templates
                        </button>
                    </div>
                    
                    <!-- Messages Section -->
                    <div id="messages-section" class="comms-section active">
                        <div class="comms-layout">
                            <!-- Thread List -->
                            <div class="thread-list">
                                <div class="thread-search">
                                    <div class="input-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="m21 21-4.35-4.35"/>
                                        </svg>
                                        <input type="text" class="input" placeholder="Search conversations...">
                                    </div>
                                </div>
                                ${renderMessageThreads()}
                            </div>
                            
                            <!-- Thread Detail -->
                            <div class="thread-detail">
                                ${renderThreadDetail()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Automations Section -->
                    <div id="automations-section" class="comms-section">
                        ${renderAutomationsSection()}
                    </div>
                    
                    <!-- Templates Section -->
                    <div id="templates-section" class="comms-section">
                        ${renderTemplatesSection()}
                    </div>
                </div>
            </main>
        </div>
    `;
}

const MESSAGE_THREADS = [
    {
        id: 1,
        clientName: 'Sarah Mitchell',
        initials: 'SM',
        avatarColor: '#8B5CF6',
        lastMessage: 'Thank you for the reminder! I\'ll book my appointment soon.',
        lastTime: '2h ago',
        unread: 1,
        channel: 'sms'
    },
    {
        id: 2,
        clientName: 'Lisa Thompson',
        initials: 'LT',
        avatarColor: '#3B82F6',
        lastMessage: 'Looking forward to my appointment next week!',
        lastTime: '1d ago',
        unread: 0,
        channel: 'email'
    },
    {
        id: 3,
        clientName: 'Jennifer Adams',
        initials: 'JA',
        avatarColor: '#10B981',
        lastMessage: 'Can I reschedule to Thursday instead?',
        lastTime: '2d ago',
        unread: 0,
        channel: 'sms'
    },
    {
        id: 4,
        clientName: 'Michael Chen',
        initials: 'MC',
        avatarColor: '#F59E0B',
        lastMessage: 'Thanks for the follow-up!',
        lastTime: '3d ago',
        unread: 0,
        channel: 'email'
    }
];

function renderMessageThreads() {
    return `
        <div class="threads">
            ${MESSAGE_THREADS.map(thread => `
                <div class="thread-item ${thread.unread > 0 ? 'unread' : ''}" onclick="selectThread(${thread.id})">
                    <div class="thread-avatar" style="background: ${thread.avatarColor};">
                        ${thread.initials}
                    </div>
                    <div class="thread-content">
                        <div class="thread-header">
                            <span class="thread-name">${thread.clientName}</span>
                            <span class="thread-time">${thread.lastTime}</span>
                        </div>
                        <div class="thread-preview">
                            <span class="channel-icon">${thread.channel === 'sms' ? '💬' : '📧'}</span>
                            <span class="preview-text">${thread.lastMessage}</span>
                        </div>
                    </div>
                    ${thread.unread > 0 ? `<span class="unread-badge">${thread.unread}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderThreadDetail() {
    return `
        <div class="thread-header-bar">
            <div class="thread-client-info">
                <div class="thread-avatar" style="background: #8B5CF6;">SM</div>
                <div>
                    <h3>Sarah Mitchell</h3>
                    <span class="client-status">VIP Member • Last visit 6 days ago</span>
                </div>
            </div>
            <div class="thread-actions">
                <button class="btn btn-sm btn-ghost" title="Call">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                    </svg>
                </button>
                <button class="btn btn-sm btn-ghost" title="View Profile" onclick="navigateTo('/clients/1')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="messages-container">
            <div class="message-group">
                <div class="message-date">Today</div>
                
                <div class="message outgoing">
                    <div class="message-bubble">
                        <p>Hi Sarah! It's been a while since your last HydraFacial. Ready for a refresh? ✨</p>
                        <span class="message-time">2:30 PM</span>
                    </div>
                </div>
                
                <div class="message incoming">
                    <div class="message-bubble">
                        <p>Thank you for the reminder! I'll book my appointment soon.</p>
                        <span class="message-time">4:15 PM</span>
                    </div>
                </div>
            </div>
            
            <div class="message-group">
                <div class="message-date">Yesterday</div>
                
                <div class="message outgoing">
                    <div class="message-bubble">
                        <p>Hi Sarah! Just wanted to check in after your Botox treatment. How are you feeling? Any questions?</p>
                        <span class="message-time">10:00 AM</span>
                    </div>
                </div>
                
                <div class="message incoming">
                    <div class="message-bubble">
                        <p>Everything looks great! So happy with the results. Thank you! 💕</p>
                        <span class="message-time">11:30 AM</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="message-composer">
            <div class="composer-tools">
                <button class="composer-btn" title="Attach file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                </button>
                <button class="composer-btn ai-btn" title="AI Suggest" onclick="showAISuggestions()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    AI
                </button>
            </div>
            <input type="text" class="composer-input" placeholder="Type a message..." id="message-input">
            <button class="composer-send" onclick="sendMessage()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                </svg>
            </button>
        </div>
    `;
}

function renderAutomationsSection() {
    return `
        <div class="automations-grid">
            <div class="automation-card">
                <div class="automation-status active"></div>
                <div class="automation-header">
                    <span class="automation-icon">🔄</span>
                    <h4>Post-Treatment Follow-up</h4>
                </div>
                <p class="automation-desc">Automatically sends a check-in message 24 hours after any treatment.</p>
                <div class="automation-stats">
                    <span>📤 234 sent</span>
                    <span>📬 89% open rate</span>
                </div>
                <div class="automation-actions">
                    <button class="btn btn-sm btn-ghost">Edit</button>
                    <button class="btn btn-sm btn-ghost">Pause</button>
                </div>
            </div>
            
            <div class="automation-card">
                <div class="automation-status active"></div>
                <div class="automation-header">
                    <span class="automation-icon">⚠️</span>
                    <h4>At-Risk Re-engagement</h4>
                </div>
                <p class="automation-desc">Sends personalized offers to clients with churn risk > 50%.</p>
                <div class="automation-stats">
                    <span>📤 45 sent</span>
                    <span>💰 $12,400 saved</span>
                </div>
                <div class="automation-actions">
                    <button class="btn btn-sm btn-ghost">Edit</button>
                    <button class="btn btn-sm btn-ghost">Pause</button>
                </div>
            </div>
            
            <div class="automation-card">
                <div class="automation-status paused"></div>
                <div class="automation-header">
                    <span class="automation-icon">🎂</span>
                    <h4>Birthday Rewards</h4>
                </div>
                <p class="automation-desc">Sends birthday wishes with a special discount code.</p>
                <div class="automation-stats">
                    <span>📤 18 sent</span>
                    <span>🎁 72% redeemed</span>
                </div>
                <div class="automation-actions">
                    <button class="btn btn-sm btn-ghost">Edit</button>
                    <button class="btn btn-sm btn-primary">Activate</button>
                </div>
            </div>
            
            <div class="automation-card add-new">
                <button class="add-automation-btn" onclick="showNewAutomationModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <span>Create Automation</span>
                </button>
            </div>
        </div>
        
        <!-- AI Suggestions Section -->
        <div class="ai-suggestions-section">
            <h3>🤖 AI-Suggested Messages</h3>
            <div class="ai-suggestions-list">
                ${renderAISuggestions()}
            </div>
        </div>
    `;
}

function renderAISuggestions() {
    const suggestions = [
        {
            client: 'Emily Rodriguez',
            type: 'Re-engagement',
            message: 'Hi Emily! We noticed it\'s been a while since your last visit. We\'d love to see you again! Book this week for 15% off your next facial. 💆‍♀️',
            confidence: 92
        },
        {
            client: 'Michael Chen',
            type: 'Follow-up',
            message: 'Hi Michael! How is your skin feeling after the CoolSculpting consultation? Ready to schedule your first session? We have openings this week!',
            confidence: 85
        }
    ];

    return suggestions.map(s => `
        <div class="ai-suggestion-card">
            <div class="suggestion-header">
                <span class="suggestion-client">${s.client}</span>
                <span class="suggestion-type">${s.type}</span>
                <span class="suggestion-confidence">${s.confidence}% match</span>
            </div>
            <p class="suggestion-message">${s.message}</p>
            <div class="suggestion-actions">
                <button class="btn btn-sm btn-ghost">Edit</button>
                <button class="btn btn-sm btn-primary" onclick="sendAISuggestion('${s.client}')">Send</button>
            </div>
        </div>
    `).join('');
}

function renderTemplatesSection() {
    const templates = [
        { name: 'Welcome Message', category: 'Onboarding', usage: 145 },
        { name: 'Appointment Reminder', category: 'Scheduling', usage: 312 },
        { name: 'Post-Treatment Care', category: 'Follow-up', usage: 234 },
        { name: 'Referral Thank You', category: 'Loyalty', usage: 67 },
        { name: 'Re-engagement Offer', category: 'Retention', usage: 89 }
    ];

    return `
        <div class="templates-grid">
            ${templates.map(t => `
                <div class="template-card">
                    <div class="template-header">
                        <span class="template-category">${t.category}</span>
                        <span class="template-usage">Used ${t.usage}x</span>
                    </div>
                    <h4 class="template-name">${t.name}</h4>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-ghost">Preview</button>
                        <button class="btn btn-sm btn-ghost">Edit</button>
                        <button class="btn btn-sm btn-primary">Use</button>
                    </div>
                </div>
            `).join('')}
            
            <div class="template-card add-new">
                <button class="add-template-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <span>Create Template</span>
                </button>
            </div>
        </div>
    `;
}

function switchCommsTab(tab, btn) {
    // Update active tab button
    document.querySelectorAll('.comms-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // Show corresponding section
    document.querySelectorAll('.comms-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${tab}-section`).classList.add('active');
}

function selectThread(id) {
    console.log('Selected thread:', id);
    document.querySelectorAll('.thread-item').forEach(t => t.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function sendMessage() {
    const input = document.getElementById('message-input');
    if (input.value.trim()) {
        showToast('Message sent! 📤', 'success');
        input.value = '';
    }
}

function showAISuggestions() {
    showToast('🤖 AI is generating suggestions...', 'info');
}

function sendAISuggestion(client) {
    showToast(`Message sent to ${client}! 📤`, 'success');
}

function showNewMessageModal() {
    showToast('Opening new message composer...', 'info');
}

function showNewAutomationModal() {
    showToast('Opening automation builder...', 'info');
}
