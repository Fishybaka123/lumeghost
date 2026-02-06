// ===========================================
// HEADER COMPONENT
// ===========================================

function createHeader(user = { name: 'Admin', initials: 'JD' }) {
    return `
        <header class="top-header">
            <div class="header-search">
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" class="input" placeholder="Search clients, leads, campaigns..." id="global-search">
                </div>
            </div>
            
            <div class="header-actions">
                <button class="header-icon-btn" title="Notifications" id="notifications-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span class="notification-dot"></span>
                </button>
                
                <button class="header-icon-btn" title="Help">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <path d="M12 17h.01"/>
                    </svg>
                </button>
                
                <div class="header-user" id="user-menu">
                    <div class="header-user-avatar">${user.initials}</div>
                    <div class="header-user-info">
                        <span class="header-user-name">${user.name}</span>
                        <span class="header-user-role">Admin</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </div>
            </div>
        </header>
    `;
}
