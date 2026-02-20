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
                        <!-- Settings Tabs -->
                        <div class="settings-tabs" style="display: flex; gap: 20px; border-bottom: 1px solid var(--nav-border); margin-bottom: 30px;">
                            <button class="tab-btn active" onclick="switchSettingsTab('general')" style="padding: 12px 4px; background: none; border: none; border-bottom: 2px solid var(--nav-accent); color: var(--nav-text); font-weight: 600; cursor: pointer;">
                                General & Account
                            </button>
                            <button class="tab-btn" onclick="switchSettingsTab('fortress')" style="padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--nav-text-secondary); font-weight: 500; cursor: pointer;">
                                Security Fortress
                            </button>
                            <button class="tab-btn" onclick="switchSettingsTab('integrations')" style="padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--nav-text-secondary); font-weight: 500; cursor: pointer;">
                                Integrations & Data
                            </button>
                        </div>

                        <!-- TAB: GENERAL -->
                        <div id="tab-general" class="settings-tab-content">
                            <!-- Profile Section -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Profile</h2>
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
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary">Save Profile</button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Business Section -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Business Information</h2>
                                    <p>Your med spa details</p>
                                </div>
                                <div class="settings-section-content">
                                    <form class="settings-form" onsubmit="saveBusinessInfo(event)">
                                        <div class="form-group">
                                            <label>Spa Name</label>
                                            <input type="text" class="input" id="spa-name" value="${user.businessName || settings.spaName || ''}" placeholder="e.g., Glow Med Spa">
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Phone Number</label>
                                                <input type="tel" class="input" id="spa-phone" value="${settings.phone || ''}" placeholder="(555) 123-4567">
                                            </div>
                                            <div class="form-group">
                                                <label>Address</label>
                                                <input type="text" class="input" id="spa-address" value="${settings.address || ''}" placeholder="123 Main St">
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary">Save Business Info</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                             <!-- Password Section -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Password</h2>
                                    <p>Update your password</p>
                                </div>
                                <div class="settings-section-content">
                                    <form class="settings-form" onsubmit="changePassword(event)">
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Current Password</label>
                                                <input type="password" class="input" id="current-password" placeholder="Current password">
                                            </div>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>New Password</label>
                                                <input type="password" class="input" id="new-password" placeholder="At least 8 chars" minlength="8">
                                            </div>
                                            <div class="form-group">
                                                <label>Confirm</label>
                                                <input type="password" class="input" id="confirm-password" placeholder="Confirm new">
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-secondary">Change Password</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: FORTRESS -->
                        <div id="tab-fortress" class="settings-tab-content" style="display: none;">
                            ${window.SecurityDashboard && window.SecurityDashboard.renderContent ? window.SecurityDashboard.renderContent() : '<p>Loading Security Fortress...</p>'}
                        </div>

                        <!-- TAB: INTEGRATIONS & DATA -->
                        <div id="tab-integrations" class="settings-tab-content" style="display: none;">
                             <!-- Notifications Section -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Notifications</h2>
                                    <p>Alert preferences</p>
                                </div>
                                <div class="settings-section-content">
                                    <div class="notification-options">
                                        <label class="notification-option">
                                            <div class="notification-option-info">
                                                <span class="notification-option-title">Email Notifications</span>
                                                <span class="notification-option-desc">Receive alerts about at-risk clients</span>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="email-notifications" ${settings.emailNotifications !== false ? 'checked' : ''} onchange="saveNotificationSettings()">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </label>
                                        <label class="notification-option">
                                            <div class="notification-option-info">
                                                <span class="notification-option-title">SMS Notifications</span>
                                                <span class="notification-option-desc">Get text alerts for urgent situations</span>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="sms-notifications" ${settings.smsNotifications ? 'checked' : ''} onchange="saveNotificationSettings()">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Integrations -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Integrations</h2>
                                    <p>Connect tools</p>
                                </div>
                                <div class="settings-section-content">
                                    ${window.renderIntegrationsSettings ? window.renderIntegrationsSettings() : '<p>Integrations service unavailable</p>'}
                                </div>
                            </div>

                            <!-- Data Management -->
                            <div class="settings-section glass-panel">
                                <div class="settings-section-header">
                                    <h2>Data Management</h2>
                                    <p>Export and reset</p>
                                </div>
                                <div class="settings-section-content">
                                    <div class="data-actions">
                                        <div class="data-action">
                                            <button class="btn btn-secondary" onclick="exportAllData()">Export All Data</button>
                                        </div>
                                        <div class="data-action danger">
                                            <button class="btn btn-danger-outline" onclick="resetDemoData()">Reset Demo Data</button>
                                        </div>
                                        <div class="data-action danger">
                                            <button class="btn btn-danger" onclick="deleteAllClients()">Remove All Clients</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Logout -->
                        <div class="settings-footer" style="margin-top: 40px; text-align: right;">
                            <button class="btn btn-danger-outline" onclick="logoutUser()">
                                Log Out
                            </button>
                        </div>

                        <!-- Danger Zone: Clear All Data -->
                        <div class="settings-section glass-panel" style="margin-top: 40px; border: 1px solid rgba(239, 68, 68, 0.3);">
                            <div class="settings-section-header">
                                <h2 style="color: var(--danger, #ef4444);">⚠️ Danger Zone</h2>
                                <p>Permanently remove all client data from your account</p>
                            </div>
                            <div class="settings-section-content">
                                <p style="margin-bottom: 16px; color: var(--nav-text-secondary); font-size: 14px;">
                                    This will permanently delete all clients from the database. This action cannot be undone.
                                </p>
                                <button class="btn btn-danger" onclick="clearAllData()" style="width: 100%;">
                                    🗑️ Clear All Client Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Twilio Config Modal (Preserved) -->
        <div id="twilio-config-modal" class="modal" style="display: none;">
            <!-- ... modal content ... -->
             <div class="modal-backdrop" onclick="document.getElementById('twilio-config-modal').style.display='none'"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Configure Twilio SMS</h3>
                    <button class="modal-close" onclick="document.getElementById('twilio-config-modal').style.display='none'">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px;">Connect your Twilio account.</p>
                    <div class="form-group"><label>Account SID</label><input type="text" id="twilio-sid" class="input" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"></div>
                    <div class="form-group"><label>Auth Token</label><input type="password" id="twilio-token" class="input" placeholder="Your auth token"></div>
                    <div class="form-group"><label>Phone Number or Messaging Service SID</label><input type="text" id="twilio-phone" class="input" placeholder="MGxxxxxxxx or +1234567890"></div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="document.getElementById('twilio-config-modal').style.display='none'">Cancel</button>
                        <button class="btn btn-primary" onclick="handleTwilioSave()">Connect</button>
                    </div>
                </div>
            </div>
        </div>

    `;
}

// Global functions for Settings UI
window.switchSettingsTab = function (tabName) {
    // Hide all contents
    document.querySelectorAll('.settings-tab-content').forEach(el => el.style.display = 'none');
    // Show target
    const target = document.getElementById('tab-' + tabName);
    if (target) target.style.display = 'block';

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = 'var(--nav-text-secondary)';
    });

    // Highlight active button (find by onclick attribute match or just passed event)
    // Simple way: check event.target or just iterate
    if (window.event && window.event.target) {
        const activeBtn = window.event.target;
        activeBtn.classList.add('active');
        activeBtn.style.borderBottomColor = 'var(--nav-accent)';
        activeBtn.style.color = 'var(--nav-text)';
    }

    // If fortress, init it
    if (tabName === 'fortress' && window.SecurityDashboard && window.SecurityDashboard.init) {
        window.SecurityDashboard.init();
    }
};

window.handleTwilioSave = async function () {
    const config = {
        accountSid: document.getElementById('twilio-sid').value.trim(),
        authToken: document.getElementById('twilio-token').value.trim(),
        phoneNumber: document.getElementById('twilio-phone').value.trim()
    };

    if (!config.accountSid || !config.authToken || !config.phoneNumber) {
        showToast('Please fill in all Twilio fields', 'error');
        return;
    }

    if (window.IntegrationsService) {
        const result = await window.IntegrationsService.saveTwilioConfig(config);
        // Modal closing is handled inside saveTwilioConfig on success
        if (!result || !result.success) {
            console.error('Twilio save failed:', result?.error);
            // Don't close modal on failure so user can fix inputs
        }
    }
};

// Settings form handlers
async function saveProfile(event) {
    event.preventDefault();

    const name = document.getElementById('settings-name').value;

    if (AuthService) {
        try {
            const result = await AuthService.updateProfile(name);
            if (result.success) {
                showToast('✓ Profile updated', 'success');
                // Refresh the page to show updated info
                navigateTo('/settings');
            } else {
                showToast(result.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Error updating profile', 'error');
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

async function saveBusinessInfo(event) {
    event.preventDefault();

    const spaName = document.getElementById('spa-name').value;
    const phone = document.getElementById('spa-phone').value;
    const address = document.getElementById('spa-address').value;

    if (AuthService) {
        try {
            // Update profile with business info
            // The service might need an update to handle settings object, 
            // but for now we'll match the signature or update the service.
            const user = AuthService.getCurrentUser();
            const updatedSettings = { ...user.settings, spaName, phone, address };

            const result = await AuthService.updateProfile(user.name, spaName, updatedSettings);
            if (result.success) {
                showToast('✓ Business info updated', 'success');
            } else {
                showToast(result.error || 'Failed to update business info', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Error updating business info', 'error');
        }
    } else {
        showToast('✓ Business info updated', 'success');
    }
}

async function saveNotificationSettings() {
    const emailNotifications = document.getElementById('email-notifications').checked;
    const smsNotifications = document.getElementById('sms-notifications').checked;

    if (AuthService) {
        const user = AuthService.getCurrentUser();
        const updatedSettings = { ...user.settings, emailNotifications, smsNotifications };
        await AuthService.updateProfile(user.name, user.businessName, updatedSettings);
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

function deleteAllClients() {
    clearAllData();
}

function clearAllData() {
    if (confirm('⚠️ Are you sure you want to permanently delete ALL client data? This cannot be undone.')) {
        if (ClientDataService && ClientDataService.deleteAll) {
            ClientDataService.deleteAll().then(success => {
                if (success) {
                    showToast('✓ All client data has been cleared', 'success');
                    if (typeof refreshMetrics === 'function') refreshMetrics();
                    navigateTo('/dashboard');
                } else {
                    showToast('Failed to clear data', 'error');
                }
            });
        } else {
            showToast('Client service not available', 'error');
        }
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
