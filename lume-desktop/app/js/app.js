// ===========================================
// LUME APPLICATION ENTRY POINT
// ===========================================

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('🌟 Lume - Med Spa Client Retention Platform');
    console.log('Version: 1.0.0 (MVP)');

    // Initialize router
    router();

    // Set up global event listeners
    initializeGlobalListeners();
});

function initializeGlobalListeners() {
    // Global search functionality
    document.addEventListener('keydown', function (e) {
        // Cmd/Ctrl + K for quick search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals (placeholder)
        if (e.key === 'Escape') {
            closeAnyModals();
        }
    });

    // Handle clicks outside modals
    document.addEventListener('click', function (e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.header-user') && !e.target.closest('.dropdown-menu')) {
            closeDropdowns();
        }
    });
}

function closeAnyModals() {
    // Placeholder for modal close functionality
    const modals = document.querySelectorAll('.modal.open');
    modals.forEach(modal => modal.classList.remove('open'));
}

function closeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu.open');
    dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
}

// Logout function
function logout() {
    sessionStorage.removeItem('lume_authenticated');
    sessionStorage.removeItem('lume_user');
    navigateTo('/login');
}

// Toast notification system (simple version)
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Add to document
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }

    // Limit to 3 notifications
    while (container.children.length >= 3) {
        container.removeChild(container.firstChild);
    }

    container.appendChild(toast);

    // Add styles if not present
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideIn 0.3s ease;
                min-width: 250px;
            }
            .toast button {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: var(--gray-400);
                margin-left: auto;
            }
            .toast-success { border-left: 4px solid var(--success); }
            .toast-error { border-left: 4px solid var(--danger); }
            .toast-warning { border-left: 4px solid var(--warning); }
            .toast-info { border-left: 4px solid var(--info); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Utility: Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format numbers with abbreviations
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}


console.log('✅ Lume app initialized');
