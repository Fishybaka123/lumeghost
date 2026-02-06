// ===========================================
// CLIENT PROFILE PAGE - FULLY FUNCTIONAL
// ===========================================

function renderClientProfilePage(clientId) {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);

    if (!client) {
        return renderNotFoundPage('Client not found');
    }

    // Get AI analysis
    const analysis = ChurnAnalyzer ? ChurnAnalyzer.analyze(client) : { healthScore: client.healthScore, churnRisk: client.churnRisk, riskFactors: [] };
    const healthClass = getHealthScoreClass(analysis.healthScore);
    const churnClass = getChurnRiskClass(analysis.churnRisk);

    // Calculate expiry info
    let expiryInfo = 'No expiration';
    let expiryClass = '';
    if (client.expireDate) {
        const days = Math.ceil((new Date(client.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) {
            expiryInfo = `Expired ${Math.abs(days)} days ago`;
            expiryClass = 'danger';
        } else if (days <= 7) {
            expiryInfo = `Expires in ${days} days`;
            expiryClass = 'danger';
        } else if (days <= 14) {
            expiryInfo = `Expires in ${days} days`;
            expiryClass = 'warning';
        } else {
            expiryInfo = formatDate(client.expireDate);
        }
    }

    return `
        <div class="app-layout client-profile-page">
            ${createSidebar('clients')}
            
            <main class="main-content">
                ${createHeader(user)}
                
                <div class="page-content">
                    <button class="back-button" onclick="navigateTo('/clients')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        Back to Clients
                    </button>
                    
                    <!-- Profile Header -->
                    <div class="profile-section" style="margin-bottom: var(--spacing-6);">
                        <div class="profile-header-content" style="padding: var(--spacing-6);">
                            <div class="profile-avatar" style="background-color: ${client.avatarColor}">
                                ${getClientInitials(client)}
                            </div>
                            <div class="profile-info">
                                <h1 class="profile-name">${getClientFullName(client)}</h1>
                                <div class="profile-meta">
                                    <span class="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        ${client.email || 'No email'}
                                    </span>
                                    <span class="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        ${client.phone || 'No phone'}
                                    </span>
                                    <span class="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        ${client.packageName || 'No package'}
                                    </span>
                                </div>
                                <div class="profile-tags">
                                    <span class="membership-badge ${getMembershipBadgeClass(client.membershipType)}">
                                        ${getMembershipLabel(client.membershipType)}
                                    </span>
                                    <span class="churn-badge ${churnClass}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                        </svg>
                                        ${analysis.churnRisk}% Churn Risk
                                    </span>
                                    ${analysis.urgency === 'critical' ? '<span class="urgency-badge critical">⚠️ Critical</span>' : ''}
                                </div>
                            </div>
                            <div class="profile-actions">
                                <button class="btn btn-primary" onclick="sendNudge(${client.id})">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                                    </svg>
                                    Send Nudge
                                </button>
                                <button class="btn btn-secondary" onclick="scheduleAppointment(${client.id})">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    Schedule
                                </button>
                            </div>
                        </div>
                        
                        <!-- Stats Row -->
                        <div class="profile-stats">
                            <div class="profile-stat highlight">
                                <div class="profile-stat-value">${analysis.healthScore}</div>
                                <div class="profile-stat-label">Health Score</div>
                            </div>
                            <div class="profile-stat ${analysis.churnRisk >= 60 ? 'danger' : ''}">
                                <div class="profile-stat-value">${analysis.churnRisk}%</div>
                                <div class="profile-stat-label">Churn Risk</div>
                            </div>
                            <div class="profile-stat ${client.remainingSessions <= 2 ? 'danger' : 'success'}">
                                <div class="profile-stat-value">${client.remainingSessions !== undefined ? client.remainingSessions : 'N/A'}</div>
                                <div class="profile-stat-label">Sessions Left</div>
                            </div>
                            <div class="profile-stat ${expiryClass}">
                                <div class="profile-stat-value">${expiryInfo}</div>
                                <div class="profile-stat-label">Expiration</div>
                            </div>
                            <div class="profile-stat">
                                <div class="profile-stat-value">${client.visitCount || 0}</div>
                                <div class="profile-stat-label">Total Visits</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profile Content Grid -->
                    <div class="profile-content">
                        <!-- Left Column -->
                        <div class="left-column">
                            <!-- AI Insights -->
                            <div class="profile-section" style="margin-bottom: var(--spacing-6);">
                                <div class="profile-section-header">
                                    <h3 class="profile-section-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                            <path d="M12 17h.01"/>
                                        </svg>
                                        AI Insights
                                    </h3>
                                    <span class="badge badge-${analysis.urgency === 'critical' ? 'danger' : analysis.urgency === 'high' ? 'warning' : 'info'}">${analysis.urgency.toUpperCase()}</span>
                                </div>
                                <div class="profile-section-content">
                                    ${generateAIInsights(client, analysis)}
                                </div>
                            </div>
                            
                            <!-- Risk Factors -->
                            ${analysis.riskFactors.length > 0 ? `
                            <div class="profile-section" style="margin-bottom: var(--spacing-6);">
                                <div class="profile-section-header">
                                    <h3 class="profile-section-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                            <line x1="12" y1="9" x2="12" y2="13"/>
                                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                                        </svg>
                                        Risk Factors
                                    </h3>
                                </div>
                                <div class="profile-section-content">
                                    <ul class="risk-factors-list">
                                        ${analysis.riskFactors.map(factor => `
                                            <li class="risk-factor-item">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                                </svg>
                                                ${factor}
                                            </li>
                                        `).join('')}
                                    </ul>
                                    <div class="recommendation-box">
                                        <strong>Recommended Action:</strong> ${analysis.recommendation}
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- Visit Timeline -->
                            <div class="profile-section">
                                <div class="profile-section-header">
                                    <h3 class="profile-section-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        Visit Timeline
                                    </h3>
                                    <button class="btn btn-sm btn-ghost">View All</button>
                                </div>
                                <div class="profile-section-content">
                                    <div class="visit-timeline">
                                        ${(client.visits && client.visits.length > 0) ? client.visits.map((visit, index) => `
                                            <div class="timeline-item ${visit.status}">
                                                <div class="timeline-dot"></div>
                                                <div class="timeline-date">${formatDate(visit.date)}</div>
                                                <div class="timeline-content">
                                                    <div class="timeline-title">${visit.treatment}</div>
                                                    ${visit.amount > 0 ? `<div class="timeline-amount">${formatCurrency(visit.amount)}</div>` : ''}
                                                </div>
                                            </div>
                                        `).join('') : `
                                            <div class="empty-timeline">
                                                <p>No visit history available</p>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column -->
                        <div class="right-column">
                            <!-- Quick Actions -->
                            <div class="profile-section" style="margin-bottom: var(--spacing-6);">
                                <div class="profile-section-header">
                                    <h3 class="profile-section-title">Quick Actions</h3>
                                </div>
                                <div class="profile-section-content">
                                    <div class="quick-actions-list">
                                        <button class="quick-action-btn primary" onclick="sendNudge(${client.id})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                                            </svg>
                                            Send Personalized Nudge
                                        </button>
                                        <button class="quick-action-btn" onclick="scheduleAppointment(${client.id})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            Schedule Appointment
                                        </button>
                                        <button class="quick-action-btn" onclick="callClient(${client.id})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                                            </svg>
                                            Call Client
                                        </button>
                                        <button class="quick-action-btn" onclick="emailClient(${client.id})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                <polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                            Send Email
                                        </button>
                                        <button class="quick-action-btn" onclick="upgradeToVIP(${client.id})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="8" r="7"/>
                                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                            </svg>
                                            ${client.membershipType === 'vip' ? 'VIP Member ✓' : 'Upgrade to VIP'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Notes -->
                            <div class="profile-section">
                                <div class="profile-section-header">
                                    <h3 class="profile-section-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Notes
                                    </h3>
                                    <button class="btn btn-sm btn-ghost" onclick="saveNotes(${client.id})">Save</button>
                                </div>
                                <div class="profile-section-content">
                                    <textarea class="notes-input" placeholder="Add notes about this client...">${client.notes || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <!-- Nudge Modal -->
        <div id="nudge-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeNudgeModal()"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>📨 Personalized Nudge</h3>
                    <button class="modal-close" onclick="closeNudgeModal()">×</button>
                </div>
                <div class="modal-body" id="nudge-modal-body">
                    <!-- Content will be set dynamically -->
                </div>
            </div>
        </div>
        
        <!-- Schedule Modal -->
        <div id="schedule-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="closeScheduleModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📅 Schedule Appointment</h3>
                    <button class="modal-close" onclick="closeScheduleModal()">×</button>
                </div>
                <div class="modal-body" id="schedule-modal-body">
                    <!-- Content will be set dynamically -->
                </div>
            </div>
        </div>
    `;
}

function generateAIInsights(client, analysis) {
    const insights = [];

    // Generate insights based on current data
    if (analysis.churnRisk >= 60) {
        insights.push({
            type: 'warning',
            title: 'High Churn Risk Detected',
            message: `${client.firstName} shows ${analysis.churnRisk}% churn risk. ${analysis.recommendation}`,
            action: 'Send Re-engagement Nudge',
            actionFn: `sendNudge(${client.id})`
        });
    }

    if (client.remainingSessions !== undefined && client.remainingSessions <= 2) {
        insights.push({
            type: 'action',
            title: client.remainingSessions === 0 ? 'No Sessions Remaining' : 'Low Sessions Alert',
            message: `${client.firstName} has only ${client.remainingSessions} session(s) left. Consider sending a renewal offer.`,
            action: 'Send Renewal Nudge',
            actionFn: `sendNudge(${client.id})`
        });
    }

    if (client.expireDate) {
        const days = Math.ceil((new Date(client.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) {
            insights.push({
                type: 'warning',
                title: 'Package Expired',
                message: `${client.firstName}'s package expired ${Math.abs(days)} days ago. Reach out with a renewal offer.`,
                action: 'Send Renewal Offer',
                actionFn: `sendNudge(${client.id})`
            });
        } else if (days <= 14) {
            insights.push({
                type: 'action',
                title: 'Package Expiring Soon',
                message: `${client.firstName}'s ${client.packageName || 'package'} expires in ${days} days.`,
                action: 'Schedule Sessions',
                actionFn: `scheduleAppointment(${client.id})`
            });
        }
    }

    if (client.membershipType === 'vip' || (client.totalSpend && client.totalSpend > 5000)) {
        insights.push({
            type: 'success',
            title: 'High-Value Client',
            message: `${client.firstName} is a ${client.membershipType === 'vip' ? 'VIP member' : 'high-value client'}. Prioritize their experience.`,
            action: null
        });
    }

    // If no specific insights
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            title: 'Client Status: Good',
            message: `${client.firstName} appears to be in good standing. Continue regular engagement.`,
            action: 'Send Check-in',
            actionFn: `sendNudge(${client.id})`
        });
    }

    return insights.map(insight => `
        <div class="ai-insight-card ${insight.type}">
            <div class="ai-insight-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                </svg>
                <span class="ai-insight-label">${insight.title}</span>
            </div>
            <p class="ai-insight-text">${insight.message}</p>
            ${insight.action ? `
                <div class="ai-insight-action">
                    <button class="btn btn-sm btn-primary" onclick="${insight.actionFn}">${insight.action}</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ============================================
// FUNCTIONAL BUTTON HANDLERS
// ============================================

// Send Nudge - Opens modal with AI-generated message
function sendNudge(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client) {
        showToast('Client not found', 'error');
        return;
    }

    // Generate personalized nudge
    const nudge = NudgeGenerator.generate(client);

    const modal = document.getElementById('nudge-modal');
    const body = document.getElementById('nudge-modal-body');

    if (!modal || !body) {
        // If modal doesn't exist (called from clients list), show alert
        alert(`📨 Nudge for ${client.firstName}:\n\n${nudge.message}`);
        return;
    }

    body.innerHTML = `
        <div class="nudge-preview">
            <div class="nudge-header">
                <div class="nudge-recipient">
                    <strong>To:</strong> ${getClientFullName(client)} (${client.email || 'No email'})
                </div>
                <div class="nudge-type">
                    <span class="badge badge-${nudge.urgency === 'critical' ? 'danger' : nudge.urgency === 'high' ? 'warning' : 'info'}">
                        ${nudge.type.replace('-', ' ').toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div class="nudge-subject">
                <strong>Subject:</strong> ${nudge.subject}
            </div>
            
            <div class="nudge-channels">
                <strong>Recommended Channels:</strong>
                ${nudge.channels.map(ch => `<span class="channel-badge">${ch.toUpperCase()}</span>`).join(' ')}
            </div>
            
            <div class="nudge-message-container">
                <label>Message:</label>
                <textarea id="nudge-message-text" class="nudge-message-input" rows="12">${nudge.message}</textarea>
            </div>
            
            <div class="nudge-actions">
                <button class="btn btn-secondary" onclick="copyNudgeToClipboard()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy to Clipboard
                </button>
                <button class="btn btn-secondary" onclick="regenerateNudge(${clientId})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Regenerate
                </button>
                <button class="btn btn-primary" onclick="sendNudgeNow(${clientId})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                    </svg>
                    Send Now
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeNudgeModal() {
    const modal = document.getElementById('nudge-modal');
    if (modal) modal.style.display = 'none';
}

function copyNudgeToClipboard() {
    const textarea = document.getElementById('nudge-message-text');
    if (textarea) {
        NudgeGenerator.copyToClipboard(textarea.value);
        showToast('✓ Copied to clipboard!', 'success');
    }
}

function regenerateNudge(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client) return;

    // Generate a different type of nudge
    const types = ['renewal', 'low-sessions', 'expiring-soon', 're-engagement', 'check-in'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const nudge = NudgeGenerator.generate(client, randomType);

    const textarea = document.getElementById('nudge-message-text');
    if (textarea) {
        textarea.value = nudge.message;
    }

    showToast('✓ New message generated', 'success');
}

function sendNudgeNow(clientId) {
    const textarea = document.getElementById('nudge-message-text');
    const message = textarea ? textarea.value : '';

    // Get the nudge data for logging
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    const nudge = NudgeGenerator.generate(client);

    // Log to communication service
    if (CommunicationService) {
        CommunicationService.logNudge(clientId, {
            message: message,
            subject: nudge.subject,
            type: nudge.type,
            channels: nudge.channels,
            urgency: nudge.urgency
        });
    }

    // In a real app, this would send via API
    console.log('Sending nudge to client', clientId, ':', message);

    closeNudgeModal();
    showToast('✓ Nudge sent successfully!', 'success');
}

// Schedule Appointment
function scheduleAppointment(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client) {
        showToast('Client not found', 'error');
        return;
    }

    const modal = document.getElementById('schedule-modal');
    const body = document.getElementById('schedule-modal-body');

    if (!modal || !body) {
        alert(`📅 Schedule appointment for ${getClientFullName(client)}\n\n(Calendar integration coming soon)`);
        return;
    }

    // Get tomorrow's date as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    body.innerHTML = `
        <div class="schedule-form">
            <div class="form-group">
                <label>Client</label>
                <input type="text" class="input" value="${getClientFullName(client)}" disabled>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" class="input" id="schedule-date" value="${defaultDate}" min="${defaultDate}">
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <select class="input" id="schedule-time">
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00" selected>2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Service</label>
                <select class="input" id="schedule-service">
                    <option value="">Select service...</option>
                    <option value="consultation">Consultation</option>
                    <option value="botox">Botox Treatment</option>
                    <option value="filler">Dermal Fillers</option>
                    <option value="facial">HydraFacial</option>
                    <option value="laser">Laser Treatment</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea class="input" id="schedule-notes" rows="3" placeholder="Add any notes..."></textarea>
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeScheduleModal()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmSchedule(${clientId})">Schedule Appointment</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) modal.style.display = 'none';
}

function confirmSchedule(clientId) {
    const date = document.getElementById('schedule-date')?.value;
    const time = document.getElementById('schedule-time')?.value;
    const service = document.getElementById('schedule-service')?.value;

    if (!date || !service) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // In a real app, this would save to a calendar system
    console.log('Scheduling appointment:', { clientId, date, time, service });

    // Update client's next appointment
    if (ClientDataService) {
        ClientDataService.update(clientId, { nextAppointment: date });
    }

    closeScheduleModal();
    showToast('✓ Appointment scheduled!', 'success');
}

// Call Client
function callClient(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client || !client.phone) {
        showToast('No phone number available', 'error');
        return;
    }

    // Open tel: link
    window.location.href = `tel:${client.phone.replace(/\D/g, '')}`;
}

// Email Client
function emailClient(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client || !client.email) {
        showToast('No email available', 'error');
        return;
    }

    // Pre-generate a subject line
    const subject = encodeURIComponent(`Hello from Your Med Spa, ${client.firstName}!`);
    window.location.href = `mailto:${client.email}?subject=${subject}`;
}

// Upgrade to VIP
function upgradeToVIP(clientId) {
    const client = ClientDataService ? ClientDataService.getById(clientId) : getClientById(clientId);
    if (!client) {
        showToast('Client not found', 'error');
        return;
    }

    if (client.membershipType === 'vip') {
        showToast('Already a VIP member!', 'info');
        return;
    }

    if (confirm(`Upgrade ${getClientFullName(client)} to VIP membership?`)) {
        // Update membership
        if (ClientDataService) {
            ClientDataService.update(clientId, { membershipType: 'vip' });
        }

        showToast('✓ Upgraded to VIP!', 'success');

        // Refresh the page to show updated status
        navigateTo(`/clients/${clientId}`);
    }
}

function saveNotes(clientId) {
    const notesInput = document.querySelector('.notes-input');
    if (notesInput && ClientDataService) {
        ClientDataService.update(clientId, { notes: notesInput.value });
        showToast('✓ Notes saved!', 'success');
    }
}

function renderNotFoundPage(message) {
    return `
        <div class="app-layout">
            ${createSidebar('')}
            <main class="main-content">
                ${createHeader()}
                <div class="page-content">
                    <div class="empty-state" style="padding: 100px 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h3>${message}</h3>
                        <p>The page you're looking for doesn't exist.</p>
                        <button class="btn btn-primary" onclick="navigateTo('/dashboard')">Return to Dashboard</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}
