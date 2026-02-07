// ===========================================
// SETTINGS PAGE
// ===========================================

function renderSettingsPage() {
    const user = AuthService ? AuthService.getCurrentUser() :
        JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD', email: 'admin@medspa.com' };

    const settings = user.settings || {};

    return `
        <div class="app-layout-topnav settings-page">
            ${createTopNav('settings')}
            
            <main class="main-content" id="main-content">
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>Settings</h1>
                            <p>Manage your account and preferences</p>
                        </div>
                    </div>
                    
                    <div class="settings-container">
                        <!-- Profile Section -->
                        <div class="settings-section">
                            <div class="settings-section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Profile
                                </h2>
                                <p>Your personal information</p>
                            </div>
                            <div class="settings-section-content">
                                <div class="settings-avatar-row">
                                    <div class="settings-avatar" style="background: var(--gradient-primary);">
                                        ${user.initials || 'U'}
                                    </div>
                                    <div class="settings-avatar-info">
                                        <p class="settings-avatar-name">${user.name || 'User'}</p>
                                        <p class="settings-avatar-email">${user.email || 'Not set'}</p>
                                    </div>
                                </div>
                                
                                <form class="settings-form" onsubmit="saveProfile(event)">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Full Name</label>
                                            <input type="text" class="input" id="settings-name" value="${user.name || ''}" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Email</label>
                                            <input type="email" class="input" id="settings-email" value="${user.email || ''}" disabled>
                                            <span class="input-hint">Email cannot be changed</span>
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">Save Profile</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Security Section -->
                        <div class="settings-section">
                            <div class="settings-section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    Security
                                </h2>
                                <p>Password and account security</p>
                            </div>
                            <div class="settings-section-content">
                                <form class="settings-form" onsubmit="changePassword(event)">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Current Password</label>
                                            <input type="password" class="input" id="current-password" placeholder="Enter current password">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>New Password</label>
                                            <input type="password" class="input" id="new-password" placeholder="At least 8 characters" minlength="8">
                                        </div>
                                        <div class="form-group">
                                            <label>Confirm New Password</label>
                                            <input type="password" class="input" id="confirm-password" placeholder="Confirm new password">
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-secondary">Change Password</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Business Section -->
                        <div class="settings-section">
                            <div class="settings-section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                    Business Information
                                </h2>
                                <p>Your med spa details</p>
                            </div>
                            <div class="settings-section-content">
                                <form class="settings-form" onsubmit="saveBusinessInfo(event)">
                                    <div class="form-group">
                                        <label>Spa Name</label>
                                        <input type="text" class="input" id="spa-name" value="${settings.spaName || ''}" placeholder="e.g., Glow Med Spa">
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" class="input" id="spa-phone" value="${settings.phone || ''}" placeholder="(555) 123-4567">
                                        </div>
                                        <div class="form-group">
                                            <label>Address</label>
                                            <input type="text" class="input" id="spa-address" value="${settings.address || ''}" placeholder="123 Main St, City, State">
                                        </div>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">Save Business Info</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Notifications Section -->
                        <div class="settings-section">
                            <div class="settings-section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                    </svg>
                                    Notifications
                                </h2>
                                <p>How you receive alerts</p>
                            </div>
                            <div class="settings-section-content">
                                <div class="notification-options">
                                    <label class="notification-option">
                                        <div class="notification-option-info">
                                            <span class="notification-option-title">Email Notifications</span>
                                            <span class="notification-option-desc">Receive alerts about at-risk clients and nudge reminders</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="email-notifications" ${settings.emailNotifications !== false ? 'checked' : ''} onchange="saveNotificationSettings()">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </label>
                                    <label class="notification-option">
                                        <div class="notification-option-info">
                                            <span class="notification-option-title">SMS Notifications</span>
                                            <span class="notification-option-desc">Get text alerts for urgent client situations</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="sms-notifications" ${settings.smsNotifications ? 'checked' : ''} onchange="saveNotificationSettings()">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Data Management Section -->
                        <div class="settings-section">
                            <div class="settings-section-header">
                                <h2>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <ellipse cx="12" cy="5" rx="9" ry="3"/>
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                                    </svg>
                                    Data Management
                                </h2>
                                <p>Export and manage your data</p>
                            </div>
                            <div class="settings-section-content">
                                <div class="data-actions">
                                    <div class="data-action">
                                        <div class="data-action-info">
                                            <h4>Export All Data</h4>
                                            <p>Download all your client data and communications</p>
                                        </div>
                                        <button class="btn btn-secondary" onclick="exportAllData()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="7 10 12 15 17 10"/>
                                                <line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                            Export
                                        </button>
                                    </div>
                                    <div class="data-action danger">
                                        <div class="data-action-info">
                                            <h4>Reset Demo Data</h4>
                                            <p>Clear all imported data and reset to demo clients</p>
                                        </div>
                                        <button class="btn btn-danger-outline" onclick="resetDemoData()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                                <polyline points="23 4 23 10 17 10"/>
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                            </svg>
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Logout Button -->
                        <div class="settings-footer">
                            <button class="btn btn-danger-outline" onclick="logoutUser()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

// Settings form handlers
function saveProfile(event) {
    event.preventDefault();

    const name = document.getElementById('settings-name').value;

    if (AuthService) {
        const result = AuthService.updateProfile({ name });
        if (result.success) {
            showToast('✓ Profile updated', 'success');
            // Refresh the page to show updated info
            navigateTo('/settings');
        } else {
            showToast(result.error, 'error');
        }
    } else {
        showToast('✓ Profile updated', 'success');
    }
}

function changePassword(event) {
    event.preventDefault();

    const current = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (!current || !newPass || !confirm) {
        showToast('Please fill in all password fields', 'error');
        return;
    }

    if (newPass !== confirm) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (newPass.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    if (AuthService) {
        const result = AuthService.changePassword(current, newPass);
        if (result.success) {
            showToast('✓ Password changed successfully', 'success');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            showToast(result.error, 'error');
        }
    } else {
        showToast('✓ Password changed', 'success');
    }
}

function saveBusinessInfo(event) {
    event.preventDefault();

    const spaName = document.getElementById('spa-name').value;
    const phone = document.getElementById('spa-phone').value;
    const address = document.getElementById('spa-address').value;

    if (AuthService) {
        const result = AuthService.updateProfile({
            settings: { spaName, phone, address }
        });
        if (result.success) {
            showToast('✓ Business info updated', 'success');
        } else {
            showToast(result.error, 'error');
        }
    } else {
        showToast('✓ Business info updated', 'success');
    }
}

function saveNotificationSettings() {
    const emailNotifications = document.getElementById('email-notifications').checked;
    const smsNotifications = document.getElementById('sms-notifications').checked;

    if (AuthService) {
        AuthService.updateProfile({
            settings: { emailNotifications, smsNotifications }
        });
    }

    showToast('✓ Notification settings saved', 'success');
}

function exportAllData() {
    const clients = ClientDataService ? ClientDataService.getAll() : [];
    const communications = CommunicationService ? CommunicationService.getAll() : [];

    const data = {
        exportDate: new Date().toISOString(),
        clients,
        communications
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lume_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    showToast('✓ Data exported successfully', 'success');
}

function resetDemoData() {
    if (confirm('Are you sure you want to reset to demo data? This will clear all your imported clients and communications.')) {
        if (ClientDataService) {
            ClientDataService.resetToDemoData();
        }
        if (CommunicationService) {
            localStorage.removeItem('lume_communications');
        }
        showToast('✓ Reset to demo data', 'success');
        navigateTo('/dashboard');
    }
}

function logoutUser() {
    if (AuthService) {
        AuthService.logout();
    } else {
        sessionStorage.removeItem('lume_authenticated');
        sessionStorage.removeItem('lume_user');
    }
    navigateTo('/login');
    showToast('Logged out successfully', 'info');
}
