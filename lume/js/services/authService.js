// ===========================================
// AUTH SERVICE - SUPABASE INTEGRATION
// ===========================================

const AuthService = {
    // Current user state
    _currentUser: null,

    // Initialize
    async init() {
        if (!supabase) return;

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            this._currentUser = session.user;
            await this._fetchUserProfile(session.user.id);
            console.log('✅ User authenticated:', session.user.email);
            // Signal that auth + profile are fully ready
            window.dispatchEvent(new CustomEvent('lume:auth:ready', { detail: session.user }));
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this._currentUser = session.user;
                await this._fetchUserProfile(session.user.id);
                // Trigger global event
                window.dispatchEvent(new CustomEvent('lume:auth:login', { detail: session.user }));
            } else if (event === 'SIGNED_OUT') {
                this._currentUser = null;
                localStorage.removeItem('lume_user');
                sessionStorage.removeItem('lume_authenticated');
                // Trigger global event
                window.dispatchEvent(new CustomEvent('lume:auth:logout'));
            }
        });
    },

    // Get current user object (normalized)
    getCurrentUser() {
        if (!this._currentUser) {
            // Fallback to storage for rapid UI rendering
            const stored = localStorage.getItem('lume_user');
            return stored ? JSON.parse(stored) : null;
        }

        const metadata = this._currentUser.user_metadata || {};

        // Return normalized user object
        return {
            id: this._currentUser.id,
            email: this._currentUser.email,
            name: metadata.full_name || this._currentUser.email.split('@')[0],
            businessName: metadata.business_name || 'My Med Spa',
            initials: this._getInitials(metadata.full_name || this._currentUser.email),
            metadata: metadata // Ensure this contains 'settings'
        };
    },

    // Login with password
    async login(email, password, rememberMe = false) {
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Session persistence is handled automatically by Supabase client
            // but we can set a flag for our own app logic
            if (rememberMe) {
                localStorage.setItem('lume_remember_me', 'true');
            } else {
                localStorage.removeItem('lume_remember_me');
            }

            // Profile fetch happens in onAuthStateChange
            // Profile fetch happens in onAuthStateChange

            // Log security event
            if (window.SecurityService) {
                window.SecurityService.logAction('login', 'auth', { email, rememberMe });
            }

            return { success: true, user: data.user };

        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Incorrect email or password');
            }
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Please confirm your email or disable Email Confirmation in Supabase settings.');
            }
            throw error;
        }
    },

    // Register new account
    async register(name, email, password) {
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        business_name: 'My Med Spa' // Default
                    }
                }
            });

            if (error) throw error;

            // If email confirmation is disabled in Supabase, user is signed in immediately
            if (data.session) {
                return { success: true, user: data.user };
            }

            // If email confirmation IS enabled, data.user is null/session is null
            // Check if user object exists but no session (confirmation required)
            if (data.user && !data.session) {
                return {
                    success: true,
                    message: 'Please check your email to verify your account.',
                    needsVerification: true
                };
            }

            return { success: true, user: data.user };

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        if (!supabase) return;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Log security event
            if (window.SecurityService) {
                window.SecurityService.logAction('logout', 'auth');
            }

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Force local cleanup anyway
            this._currentUser = null;
            localStorage.removeItem('lume_user');
            return { success: true }; // UI should still proceed
        }
    },

    // Reset Password Request
    async requestPasswordReset(email) {
        if (!supabase) return;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/#reset-password',
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    // Fetch and cache user profile
    async _fetchUserProfile(userId) {
        try {
            // Fetch from 'profiles' table for robust settings storage
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('settings, full_name, business_name')
                .eq('id', userId)
                .single();

            // Use profile settings if available, otherwise fall back to metadata
            const profileSettings = profile?.settings || {};
            const metadataSettings = this._currentUser.user_metadata?.settings || {};
            const mergedSettings = { ...metadataSettings, ...profileSettings };

            // Update metadata with profile data for consistency
            const metadata = {
                ...this._currentUser.user_metadata,
                full_name: profile?.full_name || this._currentUser.user_metadata?.full_name,
                business_name: profile?.business_name || this._currentUser.user_metadata?.business_name,
                settings: mergedSettings
            };

            const user = {
                id: userId,
                email: this._currentUser.email,
                name: metadata.full_name,
                businessName: metadata.business_name,
                initials: this._getInitials(metadata.full_name || this._currentUser.email),
                metadata: metadata
            };

            localStorage.setItem('lume_user', JSON.stringify(user));
            sessionStorage.setItem('lume_authenticated', 'true');

            console.log('✅ Profile loaded from DB:', user.name);
            return user;

        } catch (e) {
            console.warn('Profile fetch failed, using session metadata:', e);
            // Fallback to existing metadata logic
            const user = {
                id: userId,
                email: this._currentUser.email,
                name: this._currentUser.user_metadata?.full_name,
                businessName: this._currentUser.user_metadata?.business_name,
                initials: this._getInitials(this._currentUser.user_metadata?.full_name),
                metadata: this._currentUser.user_metadata
            };
            localStorage.setItem('lume_user', JSON.stringify(user));
            return user;
        }
    },

    // Update User Profile & Settings
    async updateProfile(name, businessName, settings) {
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        try {
            const userId = this._currentUser.id;

            // 1. Update 'profiles' table (Primary Storage)
            const { error: dbError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: name,
                    business_name: businessName,
                    settings: settings,
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            // 2. Update Auth Metadata (Secondary/Session Storage)
            const { data, error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: name,
                    business_name: businessName,
                    settings: settings
                }
            });

            if (authError) console.warn('Auth metadata update warning:', authError);

            // Update local cache
            if (data?.user) {
                this._currentUser = data.user;
                await this._fetchUserProfile(userId);
            }

            return { success: true };

        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    },

    // Helper: Get initials
    _getInitials(name) {
        if (!name) return 'XX';
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
});
