// ===========================================
// CLIENT UTILITY FUNCTIONS
// Common helper functions used across pages
// ===========================================

// Get full name from client object
function getClientFullName(client) {
    if (!client) return 'Unknown';

    const firstName = client.firstName || '';
    const lastName = client.lastName || '';

    if (firstName || lastName) {
        return (firstName + ' ' + lastName).trim();
    }

    return client.name || 'Unknown';
}

// Get initials from client object
function getClientInitials(client) {
    if (!client) return 'XX';

    const firstName = client.firstName || '';
    const lastName = client.lastName || '';

    if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    if (client.name) {
        const nameParts = client.name.split(' ').filter(p => p.length > 0);
        if (nameParts.length >= 2) {
            return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
        } else if (nameParts.length === 1) {
            return nameParts[0].substring(0, 2).toUpperCase();
        }
    }

    return 'XX';
}

// Get health score class for styling
function getHealthScoreClass(score) {
    if (score >= 70) return 'good';
    if (score >= 40) return 'medium';
    return 'poor';
}

// Get churn risk class for styling
function getChurnRiskClass(risk) {
    if (risk >= 60) return 'high';
    if (risk >= 30) return 'medium';
    return 'low';
}

// Get membership badge class
function getMembershipBadgeClass(type) {
    switch (type) {
        case 'vip': return 'vip';
        case 'premium': return 'premium';
        case 'basic': return 'basic';
        default: return 'none';
    }
}

// Get membership label
function getMembershipLabel(type) {
    switch (type) {
        case 'vip': return '⭐ VIP';
        case 'premium': return '💎 Premium';
        case 'basic': return '📋 Basic';
        default: return 'No Membership';
    }
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

// Get relative time (e.g., "2 days ago")
function getRelativeTime(dateStr) {
    if (!dateStr) return 'Never';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch (e) {
        return dateStr;
    }
}

// Get client by ID (fallback if ClientDataService not available)
function getClientById(id) {
    if (typeof ClientDataService !== 'undefined') {
        return ClientDataService.getById(id);
    }
    if (typeof CLIENTS !== 'undefined') {
        return CLIENTS.find(c => c.id === parseInt(id));
    }
    return null;
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Expose functions globally
window.getClientFullName = getClientFullName;
window.getClientInitials = getClientInitials;
window.getHealthScoreClass = getHealthScoreClass;
window.getChurnRiskClass = getChurnRiskClass;
window.getMembershipBadgeClass = getMembershipBadgeClass;
window.getMembershipLabel = getMembershipLabel;
window.formatDate = formatDate;
window.getRelativeTime = getRelativeTime;
window.getClientById = getClientById;
window.showToast = showToast;
