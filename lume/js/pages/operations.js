// ===========================================
// OPERATIONS PAGE
// Day-to-day operation management for med spa
// ===========================================

function renderOperationsPage() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    return `
        <div class="app-layout-topnav">
            ${createTopNav('operations')}
            
            <main class="main-content" id="main-content">
                <div class="page-content center-content" style="display: flex; align-items: center; justify-content: center; height: calc(100vh - 80px);">
                    <div class="empty-state-card glass-card" style="max-width: 500px; border: none; box-shadow: var(--shadow-lg);">
                        <div class="empty-state-icon" style="background: var(--primary-50); color: var(--primary);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                        </div>
                        <h3>Operations Paused</h3>
                        <p>This module is currently undergoing scheduled maintenance and upgrades. All data is securely stored.</p>
                        <button class="btn btn-primary" onclick="navigateTo('/dashboard')">
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

/* 
// ORIGINAL OPERATIONS PAGE CODE - PRESERVED FOR LATER RESTORATION
function renderOperationsPage_ORIGINAL() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };

    return `
        <div class="app-layout-topnav">
            ${createTopNav('operations')}
            
            <main class="main-content" id="main-content">
                <div class="page-content operations-page">
                    <!-- Page Header -->
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>⚙️ Operations</h1>
                            <p>Manage your spa's day-to-day operations</p>
                        </div>
                        <div class="page-actions">
                            <button class="btn btn-primary" onclick="showQuickActionModal()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Quick Action
                            </button>
                        </div>
                    </div>
                    
                    <!-- Today's Overview -->
                    <section class="ops-section">
                        <div class="section-header">
                            <div class="section-header-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Today's Overview</h2>
                                <p>${formatTodayDate()}</p>
                            </div>
                        </div>
                        
                        <div class="today-stats-grid">
                            ${createTodayStat('Appointments', '0', 'calendar', 'blue')}
                            ${createTodayStat('Walk-ins', '0', 'users', 'emerald')}
                            ${createTodayStat('Pending Tasks', '0', 'clipboard', 'amber')}
                            ${createTodayStat('Completed', '0', 'check-circle', 'purple')}
                        </div>
                    </section>
                    
                    <!-- Quick Actions Grid -->
                    <section class="ops-section">
                        <div class="section-header">
                            <div class="section-header-icon emerald">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Common tasks at your fingertips</p>
                            </div>
                        </div>
                        
                        <div class="quick-actions-grid">
                            ${createQuickAction('Book Appointment', 'Schedule a new client visit', 'calendar-plus', 'blue', 'bookNewAppointment()')}
                            ${createQuickAction('Add Walk-in', 'Quick entry for walk-in clients', 'user-plus', 'emerald', 'addWalkIn()')}
                            ${createQuickAction('Check Inventory', 'View product stock levels', 'package', 'amber', 'openInventory()')}
                            ${createQuickAction('Send Reminder', 'Notify clients about appointments', 'bell', 'purple', 'sendReminders()')}
                            ${createQuickAction('Daily Report', 'Generate today\'s summary', 'file-text', 'cyan', 'generateDailyReport()')}
                            ${createQuickAction('Staff Schedule', 'View today\'s team assignments', 'users', 'coral', 'viewStaffSchedule()')}
                        </div>
                    </section>
                    
                    <!-- Operations Cards -->
                    <div class="ops-cards-grid">
                        <!-- Services Management -->
                        <section class="ops-card">
                            <div class="ops-card-header">
                                <div class="ops-card-icon purple">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3>Services & Treatments</h3>
                                    <p>Manage your spa menu</p>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="manageServices()">Manage</button>
                            </div>
                            <div class="ops-card-content">
                                ${renderServicesList()}
                            </div>
                        </section>
                        
                        <!-- Staff Management -->
                        <section class="ops-card">
                            <div class="ops-card-header">
                                <div class="ops-card-icon blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3>Staff & Team</h3>
                                    <p>Manage your team members</p>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="manageStaff()">Manage</button>
                            </div>
                            <div class="ops-card-content">
                                ${renderStaffList()}
                            </div>
                        </section>
                        
                        <!-- Inventory -->
                        <section class="ops-card">
                            <div class="ops-card-header">
                                <div class="ops-card-icon amber">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                        <path d="M16.5 9.4l-9-5.19"/>
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3>Inventory</h3>
                                    <p>Track products & supplies</p>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="openInventory()">View All</button>
                            </div>
                            <div class="ops-card-content">
                                ${renderInventoryStatus()}
                            </div>
                        </section>
                        
                        <!-- Room/Station Management -->
                        <section class="ops-card">
                            <div class="ops-card-header">
                                <div class="ops-card-icon emerald">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3>Rooms & Stations</h3>
                                    <p>Treatment room availability</p>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="manageRooms()">Manage</button>
                            </div>
                            <div class="ops-card-content">
                                ${renderRoomStatus()}
                            </div>
                        </section>
                    </div>
                    
                    <!-- Recent Activity -->
                    <section class="ops-section">
                        <div class="section-header">
                            <div class="section-header-icon cyan">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div>
                                <h2>Recent Activity</h2>
                                <p>Latest updates from your team</p>
                            </div>
                        </div>
                        
                        <div class="activity-list">
                            ${renderRecentActivity()}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;
}
*/

// Helper Functions
function formatTodayDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

function createTodayStat(label, value, icon, color) {
    const iconSvg = getOpsIcon(icon);
    return `
        <div class="today-stat ${color}">
            <div class="today-stat-icon">${iconSvg}</div>
            <div class="today-stat-info">
                <span class="stat-value">${value}</span>
                <span class="stat-label">${label}</span>
            </div>
        </div>
    `;
}

function createQuickAction(title, description, icon, color, onclick) {
    const iconSvg = getOpsIcon(icon);
    return `
        <button class="quick-action-card ${color}" onclick="${onclick}">
            <div class="quick-action-icon">${iconSvg}</div>
            <div class="quick-action-info">
                <span class="quick-action-title">${title}</span>
                <span class="quick-action-desc">${description}</span>
            </div>
        </button>
    `;
}

function getOpsIcon(type) {
    const icons = {
        'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        'calendar-plus': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>',
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
        'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
        'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        'package': '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
        'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">${icons[type] || icons['clipboard']}</svg>`;
}

function renderServicesList() {
    const services = [
        { name: 'Botox', duration: '30 min', price: '$350-$550' },
        { name: 'HydraFacial', duration: '45 min', price: '$250' },
        { name: 'Laser Hair Removal', duration: '30-60 min', price: '$150-$400' },
        { name: 'Microneedling', duration: '60 min', price: '$350' },
        { name: 'Chemical Peel', duration: '30 min', price: '$175' }
    ];

    return `
        <div class="services-list">
            ${services.slice(0, 4).map(s => `
                <div class="service-item">
                    <span class="service-name">${s.name}</span>
                    <span class="service-duration">${s.duration}</span>
                    <span class="service-price">${s.price}</span>
                </div>
            `).join('')}
            <div class="view-more">+${services.length - 4} more services</div>
        </div>
    `;
}

function renderStaffList() {
    const staff = [
        { name: 'Dr. Sarah Chen', role: 'Lead Physician', status: 'available' },
        { name: 'Emily R.', role: 'Aesthetician', status: 'busy' },
        { name: 'Michael T.', role: 'Laser Tech', status: 'available' },
        { name: 'Lisa K.', role: 'Front Desk', status: 'available' }
    ];

    return `
        <div class="staff-list">
            ${staff.map(s => `
                <div class="staff-item">
                    <div class="staff-avatar">${s.name.charAt(0)}</div>
                    <div class="staff-info">
                        <span class="staff-name">${s.name}</span>
                        <span class="staff-role">${s.role}</span>
                    </div>
                    <span class="staff-status ${s.status}">${s.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderInventoryStatus() {
    const items = [
        { name: 'Botox (Allergan)', stock: 12, status: 'good' },
        { name: 'Hyaluronic Acid', stock: 8, status: 'good' },
        { name: 'Numbing Cream', stock: 3, status: 'low' },
        { name: 'Disposable Tips', stock: 45, status: 'good' }
    ];

    return `
        <div class="inventory-list">
            ${items.map(item => `
                <div class="inventory-item">
                    <span class="inventory-name">${item.name}</span>
                    <span class="inventory-stock ${item.status}">${item.stock} units</span>
                </div>
            `).join('')}
            <div class="inventory-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                1 item needs reorder
            </div>
        </div>
    `;
}

function renderRoomStatus() {
    const rooms = [
        { name: 'Treatment Room 1', status: 'available', icon: '🟢' },
        { name: 'Treatment Room 2', status: 'occupied', icon: '🔴' },
        { name: 'Laser Suite', status: 'available', icon: '🟢' },
        { name: 'Consultation', status: 'cleaning', icon: '🟡' }
    ];

    return `
        <div class="rooms-list">
            ${rooms.map(room => `
                <div class="room-item">
                    <span class="room-status-icon">${room.icon}</span>
                    <span class="room-name">${room.name}</span>
                    <span class="room-status ${room.status}">${room.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecentActivity() {
    const activities = [
        { action: 'Appointment completed', detail: 'HydraFacial - Sarah M.', time: '10 min ago', icon: '✅' },
        { action: 'Walk-in checked in', detail: 'Consultation request', time: '25 min ago', icon: '👤' },
        { action: 'Inventory updated', detail: 'Botox restocked (+20 units)', time: '1 hour ago', icon: '📦' },
        { action: 'Staff schedule updated', detail: 'Dr. Chen extended hours', time: '2 hours ago', icon: '📅' }
    ];

    return `
        <div class="activity-items">
            ${activities.map(a => `
                <div class="activity-item">
                    <span class="activity-icon">${a.icon}</span>
                    <div class="activity-info">
                        <span class="activity-action">${a.action}</span>
                        <span class="activity-detail">${a.detail}</span>
                    </div>
                    <span class="activity-time">${a.time}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Action Functions (placeholders)
function showQuickActionModal() {
    showToast('Quick action menu coming soon!', 'info');
}

function bookNewAppointment() {
    showToast('📅 Appointment booking coming soon!', 'info');
}

function addWalkIn() {
    showToast('👤 Walk-in registration coming soon!', 'info');
}

function openInventory() {
    showToast('📦 Full inventory management coming soon!', 'info');
}

function sendReminders() {
    showToast('🔔 Sending appointment reminders...', 'info');
    setTimeout(() => showToast('✅ Reminders sent successfully!', 'success'), 1500);
}

function generateDailyReport() {
    showToast('📊 Generating daily report...', 'info');
    setTimeout(() => showToast('✅ Report ready!', 'success'), 1500);
}

function viewStaffSchedule() {
    showToast('👥 Staff schedule view coming soon!', 'info');
}

function manageServices() {
    showToast('✨ Service management coming soon!', 'info');
}

function manageStaff() {
    showToast('👥 Staff management coming soon!', 'info');
}

function manageRooms() {
    showToast('🏠 Room management coming soon!', 'info');
}
