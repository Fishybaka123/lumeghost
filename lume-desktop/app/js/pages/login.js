// ===========================================
// LOGIN PAGE
// ===========================================

function renderLoginPage() {
    return `
        <div class="login-page">
            <div class="login-branding">
                <div class="logo">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span class="logo-text">Lume</span>
                </div>
                
                <h1>Illuminate Your<br>Client Retention</h1>
                <p>AI-powered insights to predict churn, automate personalized nudges, and grow your med spa business.</p>
                
                <div class="login-features">
                    <div class="login-feature">
                        <div class="login-feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                        </div>
                        <span>Predict churn before it happens</span>
                    </div>
                    <div class="login-feature">
                        <div class="login-feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <path d="m22 2-7 20-4-9-9-4 20-7Z"/>
                            </svg>
                        </div>
                        <span>Automated personalized nudges</span>
                    </div>
                    <div class="login-feature">
                        <div class="login-feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <span>Track revenue saved from retention</span>
                    </div>
                </div>
            </div>
            
            <div class="login-form-container">
                <div class="login-card">
                    <h2>Welcome back</h2>
                    <p class="subtitle">Sign in to your Lume account</p>
                    
                    <form class="login-form" onsubmit="handleLogin(event)">
                        <div class="input-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" class="input" placeholder="you@medspa.com" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="password">Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="password" class="input" placeholder="••••••••" required>
                                <button type="button" class="password-toggle" onclick="togglePassword()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="remember-row">
                            <label class="remember-me">
                                <input type="checkbox" id="remember">
                                <span>Remember me</span>
                            </label>
                            <div class="forgot-password">
                                <a href="#/forgot-password">Forgot password?</a>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-lg">
                            Sign In
                        </button>
                    </form>
                    
                    <div class="login-divider">or continue with</div>
                    
                    <div class="login-alternatives">
                        <button type="button" class="btn btn-secondary" onclick="handleMagicLink()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Send Magic Link
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="handleBiometric()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12"/>
                                <path d="M12 6a6 6 0 0 1 6 6c0 3.314-2.686 6-6 6s-6-2.686-6-6"/>
                                <circle cx="12" cy="12" r="2"/>
                            </svg>
                            Sign in with Face ID
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simulate authentication (in production, this would call an API)
    if (email && password) {
        // Store auth state
        sessionStorage.setItem('lume_authenticated', 'true');
        sessionStorage.setItem('lume_user', JSON.stringify({
            email: email,
            name: email.split('@')[0],
            initials: email.substring(0, 2).toUpperCase()
        }));

        // Navigate to dashboard
        navigateTo('/dashboard');
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggle = document.querySelector('.password-toggle svg');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        toggle.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

function handleMagicLink() {
    const email = document.getElementById('email').value;
    if (!email) {
        alert('Please enter your email address first.');
        document.getElementById('email').focus();
        return;
    }
    alert(`✨ Magic link sent to ${email}!\n\n(In production, you would receive an email with a secure sign-in link)`);
}

function handleBiometric() {
    alert('🔐 Face ID Authentication\n\n(Biometric authentication will be integrated here for supported devices)');
}
