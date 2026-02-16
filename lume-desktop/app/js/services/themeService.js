// ===========================================
// THEME SERVICE - Dark Mode & Accessibility
// ===========================================

const ThemeService = {
    THEME_KEY: 'lume_theme',
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    },

    currentTheme: 'system',
    mediaQuery: null,

    /**
     * Initialize theme service
     */
    init() {
        // PER USER REQUEST: Force Light Mode only
        this.currentTheme = this.THEMES.LIGHT;

        // Remove existing theme attributes and force light
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(this.THEME_KEY, 'light');

        // Setup system preference listener (inactive for now)
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        console.log('☀️ Theme Service initialized: Forced Light Mode');
    },

    /**
     * Get the currently applied theme
     */
    getAppliedTheme() {
        return this.THEMES.LIGHT;
    },

    /**
     * Set theme preference
     * @param {string} theme - 'light', 'dark', or 'system'
     */
    setTheme(theme) {
        // Forced light mode
        const forced = this.THEMES.LIGHT;
        this.currentTheme = forced;
        localStorage.setItem(this.THEME_KEY, forced);
        document.documentElement.setAttribute('data-theme', forced);
    },

    /**
     * Toggle between light and dark
     */
    toggle() {
        // Disabled for now
        showToast('Theme switching is currently disabled', 'info');
        return this.THEMES.LIGHT;
    },

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        // Force light
        document.documentElement.setAttribute('data-theme', 'light');
    },

    /**
     * Handle system preference change
     */
    handleSystemChange(e) {
        // Ignored
    },

    /**
     * Announce theme to screen readers
     */
    announceTheme() {
        const applied = this.getAppliedTheme();
        const announcement = `Theme changed to ${applied} mode`;

        // Use ARIA live region if available
        let liveRegion = document.getElementById('theme-announcement');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'theme-announcement';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = announcement;
    },

    /**
     * Check if reduced motion is preferred
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Check if high contrast is preferred
     */
    prefersHighContrast() {
        return window.matchMedia('(prefers-contrast: high)').matches;
    },

    /**
     * Get current color scheme info
     */
    getColorSchemeInfo() {
        return {
            preference: this.currentTheme,
            applied: this.getAppliedTheme(),
            systemPrefersDark: this.mediaQuery?.matches || false,
            reducedMotion: this.prefersReducedMotion(),
            highContrast: this.prefersHighContrast()
        };
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeService.init();
});

// Global toggle function for UI
function toggleTheme() {
    const newTheme = ThemeService.toggle();
    showToast(`Switched to ${newTheme} mode`, 'success');
    return newTheme;
}

// Expose globally
window.ThemeService = ThemeService;
window.toggleTheme = toggleTheme;
