// ===========================================
// AUTH SERVICE - Development Bypass Mode
// ===========================================
// 
// ⚠️ DEV MODE ENABLED: Any email/password works
// 
// To re-enable REAL authentication:
// 1. Set DEV_BYPASS_AUTH = false below
// 2. Start the backend server: node server/server.js
// 3. Add your SendGrid API key in server/.env
//
// ===========================================

const DEV_BYPASS_AUTH = true;  // ← Set to FALSE to enable real auth

const API_BASE = 'http://localhost:3001/api';

const AuthService = {
    // Store for pending verification
    _pendingEmail: null,
    _pendingName: null,

    // Get stored token
    getToken() {
        return localStorage.getItem('lume_token');
    },

    // Set token
    setToken(token) {
        if (token) {
            localStorage.setItem('lume_token', token);
        } else {
            localStorage.removeItem('lume_token');
        }
    },

    // Get current user from storage
    getCurrentUser() {
        const userStr = localStorage.getItem('lume_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    // Set current user
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem('lume_user', JSON.stringify(user));
            // Set authentication flag that router checks
            sessionStorage.setItem('lume_authenticated', 'true');
            // Also set user in session for backward compatibility
            sessionStorage.setItem('lume_user', JSON.stringify({
                name: user.name,
                email: user.email,
                initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            }));
        } else {
            localStorage.removeItem('lume_user');
            sessionStorage.removeItem('lume_user');
            sessionStorage.removeItem('lume_authenticated');
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken() && !!this.getCurrentUser();
    },

    // Register new account
    async register(name, email, password) {
        // DEV BYPASS: Skip real registration
        if (DEV_BYPASS_AUTH) {
            const user = { id: 1, email, name, verified: true };
            this.setToken('dev_bypass_token_' + Date.now());
            this.setCurrentUser(user);
            return { success: true, user };
        }

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            this._pendingEmail = email;
            this._pendingName = name;

            return {
                success: true,
                message: data.message,
                needsVerification: true
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Verify email with code
    async verifyEmail(code) {
        // DEV BYPASS: Skip verification
        if (DEV_BYPASS_AUTH) {
            return { success: true };
        }

        const email = this._pendingEmail;

        if (!email) {
            throw new Error('No pending verification. Please register first.');
        }

        try {
            const response = await fetch(`${API_BASE}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            this.setToken(data.token);
            this.setCurrentUser(data.user);

            this._pendingEmail = null;
            this._pendingName = null;

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },

    // Resend verification code
    async resendCode() {
        // DEV BYPASS: Just return success
        if (DEV_BYPASS_AUTH) {
            return { success: true };
        }

        const email = this._pendingEmail;

        if (!email) {
            throw new Error('No pending verification');
        }

        try {
            const response = await fetch(`${API_BASE}/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend code');
            }

            return { success: true };
        } catch (error) {
            console.error('Resend code error:', error);
            throw error;
        }
    },

    // Login
    async login(email, password, rememberMe = false) {
        // DEV BYPASS: Accept any email/password
        if (DEV_BYPASS_AUTH) {
            const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const user = { id: 1, email, name, verified: true };
            this.setToken('dev_bypass_token_' + Date.now());
            this.setCurrentUser(user);
            return { success: true, user };
        }

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsVerification) {
                    this._pendingEmail = data.email;
                    return {
                        success: false,
                        needsVerification: true,
                        message: data.error
                    };
                }
                throw new Error(data.error || 'Login failed');
            }

            this.setToken(data.token);
            this.setCurrentUser(data.user);

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        // DEV BYPASS: Just clear local storage
        if (DEV_BYPASS_AUTH) {
            this.setToken(null);
            this.setCurrentUser(null);
            return { success: true };
        }

        const token = this.getToken();

        if (token) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.log('Logout request failed, clearing local state anyway');
            }
        }

        this.setToken(null);
        this.setCurrentUser(null);

        return { success: true };
    },

    // Get current user from server
    async fetchCurrentUser() {
        // DEV BYPASS: Return stored user
        if (DEV_BYPASS_AUTH) {
            return this.getCurrentUser();
        }

        const token = this.getToken();

        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.setToken(null);
                this.setCurrentUser(null);
                return null;
            }

            const data = await response.json();
            this.setCurrentUser(data.user);

            return data.user;
        } catch (error) {
            console.error('Fetch user error:', error);
            return null;
        }
    },

    // Update profile
    async updateProfile(name, businessName) {
        // DEV BYPASS: Update local storage directly
        if (DEV_BYPASS_AUTH) {
            const user = this.getCurrentUser();
            if (user) {
                user.name = name;
                user.businessName = businessName;
                this.setCurrentUser(user);
            }
            return { success: true, user };
        }

        const token = this.getToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, businessName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            this.setCurrentUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        // DEV BYPASS: Just return success
        if (DEV_BYPASS_AUTH) {
            return { success: true };
        }

        const token = this.getToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${API_BASE}/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    },

    // Set pending email
    setPendingEmail(email) {
        this._pendingEmail = email;
    },

    // Get pending email
    getPendingEmail() {
        return this._pendingEmail;
    }
};

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    if (DEV_BYPASS_AUTH) {
        console.log('⚠️ DEV MODE: Authentication bypass enabled. Any email/password works.');
    }

    if (AuthService.getToken()) {
        const user = await AuthService.fetchCurrentUser();
        if (user) {
            console.log('✅ User authenticated:', user.email);
        }
    }
});
