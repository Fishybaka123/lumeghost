// ===========================================
// CLIENT PROFILE PAGE
// ===========================================

function renderClientProfilePage(clientId) {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };
    const client = getClientById(clientId);

    if (!client) {
        return renderNotFoundPage('Client not found');
    }

    const healthClass = getHealthScoreClass(client.healthScore);
    const churnClass = getChurnRiskClass(client.churnRisk);

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
                                        ${client.email}
                                    </span>
                                    <span class="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        ${client.phone}
                                    </span>
                                    <span class="profile-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        Member since ${formatDate(client.memberSince)}
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
                                        ${client.churnRisk}% Churn Risk
                                    </span>
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
                                <div class="profile-stat-value">${client.healthScore}</div>
                                <div class="profile-stat-label">Health Score</div>
                            </div>
                            <div class="profile-stat ${client.churnRisk >= 60 ? 'danger' : ''}">
                                <div class="profile-stat-value">${client.churnRisk}%</div>
                                <div class="profile-stat-label">Churn Risk</div>
                            </div>
                            <div class="profile-stat success">
                                <div class="profile-stat-value">${formatCurrency(client.totalSpend)}</div>
                                <div class="profile-stat-label">Total Spend</div>
                            </div>
                            <div class="profile-stat">
                                <div class="profile-stat-value">${client.visitCount}</div>
                                <div class="profile-stat-label">Total Visits</div>
                            </div>
                            <div class="profile-stat">
                                <div class="profile-stat-value">${client.nextAppointment ? formatDate(client.nextAppointment) : 'None'}</div>
                                <div class="profile-stat-label">Next Appointment</div>
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
                                    <span class="badge badge-info">Placeholder</span>
                                </div>
                                <div class="profile-section-content">
                                    ${generateAIInsights(client)}
                                </div>
                            </div>
                            
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
                                        ${client.visits.map((visit, index) => `
                                            <div class="timeline-item ${visit.status}">
                                                <div class="timeline-dot"></div>
                                                <div class="timeline-date">${formatDate(visit.date)}</div>
                                                <div class="timeline-content">
                                                    <div class="timeline-title">${visit.treatment}</div>
                                                    ${visit.amount > 0 ? `<div class="timeline-amount">${formatCurrency(visit.amount)}</div>` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
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
                                        <button class="quick-action-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                                            </svg>
                                            Call Client
                                        </button>
                                        <button class="quick-action-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                            View Documents
                                        </button>
                                        <button class="quick-action-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="8" r="7"/>
                                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                            </svg>
                                            Add to VIP Program
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
    `;
}

function generateAIInsights(client) {
    const insights = [];

    // Generate insights based on client data
    if (client.churnRisk >= 60) {
        insights.push({
            type: 'warning',
            title: 'High Churn Risk Detected',
            message: `${client.firstName} hasn't visited in a while and shows signs of disengagement. Consider sending a personalized re-engagement offer.`,
            action: 'Send Re-engagement Nudge'
        });
    }

    if (!client.nextAppointment) {
        insights.push({
            type: 'action',
            title: 'No Upcoming Appointment',
            message: `${client.firstName} doesn't have any scheduled appointments. Based on their treatment history, they may be due for a follow-up.`,
            action: 'Schedule Follow-up'
        });
    }

    if (client.preferredTreatments.length > 0 && client.visitCount > 5) {
        insights.push({
            type: 'opportunity',
            title: 'Upsell Opportunity',
            message: `Based on ${client.firstName}'s preference for ${client.preferredTreatments[0]}, they might be interested in complementary treatments.`,
            action: 'View Recommendations'
        });
    }

    if (client.membershipType === 'vip' || client.totalSpend > 5000) {
        insights.push({
            type: 'success',
            title: 'Loyal Customer',
            message: `${client.firstName} is a high-value customer with ${formatCurrency(client.totalSpend)} lifetime spend. Consider exclusive perks to maintain loyalty.`,
            action: null
        });
    }

    // If no specific insights, show placeholder
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            title: 'AI Analysis Ready',
            message: 'When connected to your data, AI will provide personalized insights and recommendations for this client.',
            action: null
        });
    }

    return insights.map(insight => `
        <div class="ai-insight-card">
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
                    <button class="btn btn-sm btn-primary">${insight.action}</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function saveNotes(clientId) {
    const notesInput = document.querySelector('.notes-input');
    if (notesInput) {
        // In production, this would save to a database
        console.log('Saving notes for client', clientId, ':', notesInput.value);
        alert('✅ Notes saved successfully!');
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
