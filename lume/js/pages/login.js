// ===========================================
// LOGIN PAGE - With Registration & Email Verification
// ===========================================

let currentAuthTab = 'login';
let verificationStep = false;

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
                <div class="login-card glass-card">
                    <!-- Tab Toggle -->
                    <div class="auth-tabs">
                        <button class="auth-tab active" id="login-tab" onclick="switchAuthTab('login')">Sign In</button>
                        <button class="auth-tab" id="register-tab" onclick="switchAuthTab('register')">Create Account</button>
                    </div>
                    
                    <!-- Login Form -->
                    <div id="login-form-section">
                        <p class="subtitle">Welcome back to Lume</p>
                        
                        <form class="login-form" onsubmit="handleLogin(event)">
                            <div class="input-group">
                                <label for="login-email">Email</label>
                                <input type="email" id="login-email" class="input" placeholder="you@medspa.com" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="login-password">Password</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="login-password" class="input" placeholder="••••••••" required>
                                    <button type="button" class="password-toggle" onclick="togglePassword('login-password')">
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
                                    <a href="#" onclick="showForgotPassword(event)">Forgot password?</a>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-lg">
                                Sign In
                            </button>
                            
                            <p class="auth-switch-text">
                                Don't have an account? <a href="#" onclick="switchAuthTab('register'); return false;">Create one</a>
                            </p>
                        </form>
                    </div>
                    
                    <!-- Registration Form -->
                    <div id="register-form-section" style="display: none;">
                        <p class="subtitle">Create your Lume account</p>
                        
                        <form class="login-form" onsubmit="handleRegister(event)">
                            <div class="input-group">
                                <label for="register-name">Full Name</label>
                                <input type="text" id="register-name" class="input" placeholder="Jane Smith" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="register-email">Email</label>
                                <input type="email" id="register-email" class="input" placeholder="you@medspa.com" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="register-password">Password</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="register-password" class="input" placeholder="At least 8 characters" required minlength="8">
                                    <button type="button" class="password-toggle" onclick="togglePassword('register-password')">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="input-group">
                                <label for="register-confirm">Confirm Password</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="register-confirm" class="input" placeholder="••••••••" required>
                                    <button type="button" class="password-toggle" onclick="togglePassword('register-confirm')">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-lg">
                                Create Account
                            </button>
                            
                            <p class="auth-switch-text">
                                Already have an account? <a href="#" onclick="switchAuthTab('login'); return false;">Sign in</a>
                            </p>
                        </form>
                    </div>
                    
                    <!-- Verification Code Section -->
                    <div id="verification-section" style="display: none;">
                        <div class="verification-content">
                            <div class="verification-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </div>
                            <h3>Check Your Email</h3>
                            <p class="subtitle" id="verification-email-display">We sent a verification code to your email</p>
                            
                            <div class="verification-code-input">
                                <input type="text" id="code-1" maxlength="1" oninput="handleCodeInput(1)" onkeydown="handleCodeKeydown(event, 1)">
                                <input type="text" id="code-2" maxlength="1" oninput="handleCodeInput(2)" onkeydown="handleCodeKeydown(event, 2)">
                                <input type="text" id="code-3" maxlength="1" oninput="handleCodeInput(3)" onkeydown="handleCodeKeydown(event, 3)">
                                <input type="text" id="code-4" maxlength="1" oninput="handleCodeInput(4)" onkeydown="handleCodeKeydown(event, 4)">
                                <input type="text" id="code-5" maxlength="1" oninput="handleCodeInput(5)" onkeydown="handleCodeKeydown(event, 5)">
                                <input type="text" id="code-6" maxlength="1" oninput="handleCodeInput(6)" onkeydown="handleCodeKeydown(event, 6)">
                            </div>
                            
                            <div id="verification-error" class="verification-error" style="display: none;"></div>
                            
                            <button type="button" class="btn btn-primary btn-lg" onclick="submitVerificationCode()">
                                Verify Email
                            </button>
                            
                            <p class="resend-text">
                                Didn't receive the code? <a href="#" onclick="resendCode(event)">Resend</a>
                            </p>
                            
                            <p class="auth-switch-text">
                                <a href="#" onclick="cancelVerification(event)">← Back to registration</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="login-legal-footer" style="text-align: center; padding: 24px 0; width: 100%;">
                <a href="/privacy-policy" style="color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.8rem; margin: 0 12px;">Privacy Policy</a>
                <a href="/terms-and-conditions" style="color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.8rem; margin: 0 12px;">Terms & Conditions</a>
                <p style="color: rgba(255,255,255,0.25); font-size: 0.75rem; margin-top: 8px;">&copy; 2026 Lume. All rights reserved.</p>
            </div>
        </div>
    `;
}

function switchAuthTab(tab) {
    currentAuthTab = tab;

    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginSection = document.getElementById('login-form-section');
    const registerSection = document.getElementById('register-form-section');
    const verifySection = document.getElementById('verification-section');

    // Hide verification if switching tabs
    if (verifySection) verifySection.style.display = 'none';

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember').checked;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';

    try {
        const result = await AuthService.login(email, password, remember);

        if (result.success) {
            showToast('✓ Welcome back!', 'success');
            navigateTo('/dashboard');
        } else if (result.needsVerification) {
            // User needs to verify email first
            AuthService.setPendingEmail(result.email || email);
            showVerificationSection(email);
            showToast('Please verify your email first', 'info');
        }
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Validate passwords match
    if (password !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }

    // Validate password strength
    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

    try {
        const result = await AuthService.register(name, email, password);

        if (result.success) {
            showToast('✓ Account created! Signing you in...', 'success');
            // Auto login usually handled by Supabase session handling
            // But we can force navigation just in case
            setTimeout(() => {
                navigateTo('/dashboard');
            }, 1500);
        }
    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
    }
}

function showVerificationSection(email) {
    const loginSection = document.getElementById('login-form-section');
    const registerSection = document.getElementById('register-form-section');
    const verifySection = document.getElementById('verification-section');
    const emailDisplay = document.getElementById('verification-email-display');

    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    verifySection.style.display = 'block';

    emailDisplay.textContent = `We sent a 6 - digit code to ${email} `;

    // Focus on first code input
    setTimeout(() => {
        document.getElementById('code-1')?.focus();
    }, 100);
}

function handleCodeInput(index) {
    const input = document.getElementById(`code - ${index} `);
    const value = input.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) {
        input.value = '';
        return;
    }

    // Move to next input
    if (value && index < 6) {
        document.getElementById(`code - ${index + 1} `)?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 6 && value) {
        const code = getFullCode();
        if (code.length === 6) {
            submitVerificationCode();
        }
    }
}

function handleCodeKeydown(event, index) {
    // Handle backspace - move to previous input
    if (event.key === 'Backspace' && !event.target.value && index > 1) {
        document.getElementById(`code - ${index - 1} `)?.focus();
    }

    // Handle paste
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        navigator.clipboard.readText().then(text => {
            const digits = text.replace(/\D/g, '').substring(0, 6);
            for (let i = 0; i < digits.length; i++) {
                const inp = document.getElementById(`code - ${i + 1} `);
                if (inp) inp.value = digits[i];
            }
            if (digits.length === 6) {
                submitVerificationCode();
            }
        }).catch(() => { });
    }
}

function getFullCode() {
    let code = '';
    for (let i = 1; i <= 6; i++) {
        code += document.getElementById(`code - ${i} `)?.value || '';
    }
    return code;
}

async function submitVerificationCode() {
    const code = getFullCode();
    const verifyBtn = document.querySelector('#verification-section button.btn-primary');

    if (code.length !== 6) {
        showVerificationError('Please enter all 6 digits');
        return;
    }

    // Disable button and show loading state
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<span class="spinner"></span> Verifying...';
    }

    try {
        const result = await AuthService.verifyEmail(code);

        if (result.success) {
            showToast('✓ Email verified! Welcome to Lume!', 'success');
            navigateTo('/dashboard');
        }
    } catch (error) {
        showVerificationError(error.message || 'Invalid code');
        // Clear inputs
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`code - ${i} `).value = '';
        }
        document.getElementById('code-1')?.focus();
    } finally {
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = 'Verify Email';
        }
    }
}

function showVerificationError(message) {
    const errorEl = document.getElementById('verification-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

async function resendCode(event) {
    event.preventDefault();
    const link = event.target;

    link.textContent = 'Sending...';
    link.style.pointerEvents = 'none';

    try {
        await AuthService.resendCode();
        showToast('✓ New verification code sent!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to resend code', 'error');
    } finally {
        link.textContent = 'Resend';
        link.style.pointerEvents = 'auto';
    }
}

function cancelVerification(event) {
    event.preventDefault();
    localStorage.removeItem('lume_pending_verification');
    switchAuthTab('register');
}

function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggle = passwordInput.parentElement.querySelector('.password-toggle svg');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.innerHTML = `
        < path d = "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
    `;
    } else {
        passwordInput.type = 'password';
        toggle.innerHTML = `
        < path d = "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
    `;
    }
}

function showForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    if (email) {
        showToast(`Password reset link sent to ${email} `, 'info');
    } else {
        showToast('Please enter your email address first', 'warning');
        document.getElementById('login-email').focus();
    }
}
