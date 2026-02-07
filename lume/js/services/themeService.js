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
        // Get saved preference or default to system
        this.currentTheme = localStorage.getItem(this.THEME_KEY) || this.THEMES.SYSTEM;

        // Setup system preference listener
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', (e) => this.handleSystemChange(e));

        // Apply initial theme
        this.applyTheme(this.currentTheme);

        // Announce to screen readers
        this.announceTheme();

        console.log('🎨 Theme Service initialized:', this.getAppliedTheme());
    },

    /**
     * Get the currently applied theme
     */
    getAppliedTheme() {
        if (this.currentTheme === this.THEMES.SYSTEM) {
            return this.mediaQuery?.matches ? this.THEMES.DARK : this.THEMES.LIGHT;
        }
        return this.currentTheme;
    },

    /**
     * Set theme preference
     * @param {string} theme - 'light', 'dark', or 'system'
     */
    setTheme(theme) {
        if (!Object.values(this.THEMES).includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }

        this.currentTheme = theme;
        localStorage.setItem(this.THEME_KEY, theme);
        this.applyTheme(theme);
        this.announceTheme();

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme, applied: this.getAppliedTheme() }
        }));
    },

    /**
     * Toggle between light and dark
     */
    toggle() {
        const applied = this.getAppliedTheme();
        const newTheme = applied === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        const root = document.documentElement;

        // Remove existing theme attributes
        root.removeAttribute('data-theme');

        if (theme === this.THEMES.SYSTEM) {
            // Let CSS media query handle it
            return;
        }

        // Set explicit theme
        root.setAttribute('data-theme', theme);
    },

    /**
     * Handle system preference change
     */
    handleSystemChange(e) {
        if (this.currentTheme === this.THEMES.SYSTEM) {
            // Re-apply to trigger any JS-based theming
            this.announceTheme();
            window.dispatchEvent(new CustomEvent('themechange', {
                detail: { theme: 'system', applied: e.matches ? 'dark' : 'light' }
            }));
        }
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
