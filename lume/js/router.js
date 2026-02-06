// ===========================================
// SIMPLE HASH-BASED ROUTER
// ===========================================

const routes = {
    '/': renderLoginPage,
    '/login': renderLoginPage,
    '/dashboard': renderDashboardPage,
    '/clients': renderClientsPage,
    '/clients/:id': renderClientProfilePage,
    '/communications': renderCommunicationsPage,
    '/analytics': renderAnalyticsPage,
    '/leads': renderPlaceholderPage.bind(null, 'Leads', 'Track and convert new leads'),
    '/operations': renderOperationsPage,
    '/settings': renderSettingsPage
};

function navigateTo(path) {
    window.location.hash = path;
}

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

function matchRoute(path) {
    // Check for exact match first
    if (routes[path]) {
        return { handler: routes[path], params: {} };
    }

    // Check for dynamic routes (e.g., /clients/:id)
    for (const route in routes) {
        if (route.includes(':')) {
            const routeParts = route.split('/');
            const pathParts = path.split('/');

            if (routeParts.length === pathParts.length) {
                const params = {};
                let match = true;

                for (let i = 0; i < routeParts.length; i++) {
                    if (routeParts[i].startsWith(':')) {
                        params[routeParts[i].slice(1)] = pathParts[i];
                    } else if (routeParts[i] !== pathParts[i]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    return { handler: routes[route], params };
                }
            }
        }
    }

    return null;
}

function router() {
    const path = getRoute();
    const app = document.getElementById('app');

    // Check authentication for protected routes
    const isAuthenticated = sessionStorage.getItem('lume_authenticated') === 'true';
    const publicRoutes = ['/', '/login', '/forgot-password'];

    if (!isAuthenticated && !publicRoutes.includes(path)) {
        navigateTo('/login');
        return;
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated && publicRoutes.includes(path)) {
        navigateTo('/dashboard');
        return;
    }

    const matched = matchRoute(path);

    if (matched) {
        if (Object.keys(matched.params).length > 0) {
            // Dynamic route with params
            app.innerHTML = matched.handler(matched.params.id);
        } else {
            app.innerHTML = matched.handler();
        }
    } else {
        app.innerHTML = renderNotFoundPage('Page not found');
    }

    // Scroll to top on navigation
    window.scrollTo(0, 0);
}

// Placeholder page for features not yet implemented
function renderPlaceholderPage(title, description) {
    const user = JSON.parse(sessionStorage.getItem('lume_user')) || { name: 'Admin', initials: 'AD' };
    const pageName = title.toLowerCase();

    return `
        <div class="app-layout">
            ${createSidebar(pageName)}
            
            <main class="main-content">
                ${createHeader(user)}
                
                <div class="page-content">
                    <div class="page-header">
                        <div class="page-title-section">
                            <h1>${title}</h1>
                            <p>${description}</p>
                        </div>
                    </div>
                    
                    <div class="card" style="text-align: center; padding: 80px 40px;">
                        <div style="margin-bottom: 24px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64" style="color: var(--gray-300);">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M3 9h18"/>
                                <path d="M9 21V9"/>
                            </svg>
                        </div>
                        <h2 style="margin-bottom: 8px; color: var(--gray-700);">Coming Soon</h2>
                        <p style="color: var(--gray-500); max-width: 400px; margin: 0 auto 24px;">
                            The ${title} feature is part of the full Lume experience. 
                            This placeholder shows where the feature will be integrated.
                        </p>
                        <div style="display: flex; gap: 12px; justify-content: center;">
                            <button class="btn btn-primary" onclick="navigateTo('/dashboard')">
                                Back to Dashboard
                            </button>
                            <button class="btn btn-secondary" onclick="navigateTo('/clients')">
                                View Clients
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

// Listen for hash changes
window.addEventListener('hashchange', router);
