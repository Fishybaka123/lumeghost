// ===========================================
// HEADER COMPONENT - Enhanced with Dark Mode Toggle
// ===========================================

function createHeader(user = { name: 'Admin', initials: 'JD' }) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return `
        <header class="top-header" role="banner">
            <a href="#main-content" class="skip-link">Skip to main content</a>
            
            <div class="header-search">
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" class="input" placeholder="Search clients, leads, campaigns..." id="global-search" aria-label="Global search">
                </div>
            </div>
            
            <div class="header-actions">
                <!-- Dark Mode Toggle -->
                <button class="header-icon-btn theme-toggle" 
                        title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}" 
                        onclick="toggleTheme()"
                        aria-label="Toggle dark mode"
                        aria-pressed="${isDark}">
                    <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="${isDark ? 'display:none' : ''}">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="${isDark ? '' : 'display:none'}">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
                
                <button class="header-icon-btn" title="Notifications" id="notifications-btn" aria-label="View notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span class="notification-dot" aria-label="New notifications"></span>
                </button>
                
                <button class="header-icon-btn" title="Help" aria-label="Get help">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <path d="M12 17h.01"/>
                    </svg>
                </button>
                
                <div class="header-user" id="user-menu" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">
                    <div class="header-user-avatar" aria-hidden="true">${user.initials}</div>
                    <div class="header-user-info">
                        <span class="header-user-name">${user.name}</span>
                        <span class="header-user-role">Admin</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </div>
            </div>
        </header>
    `;
}

// Update theme toggle icons when theme changes
window.addEventListener('themechange', function (e) {
    const isDark = e.detail.applied === 'dark';
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    const toggleBtn = document.querySelector('.theme-toggle');

    if (sunIcon) sunIcon.style.display = isDark ? 'none' : '';
    if (moonIcon) moonIcon.style.display = isDark ? '' : 'none';
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', isDark);
        toggleBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
});
