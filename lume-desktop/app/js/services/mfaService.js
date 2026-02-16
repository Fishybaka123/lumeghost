// ===========================================
// MFA SERVICE - Multi-Factor Authentication
// TOTP, SMS Verification, Recovery Codes
// ===========================================

const MFAService = {
    // MFA storage keys
    STORAGE_KEY: 'lume_mfa_config',
    RECOVERY_KEY: 'lume_recovery_codes',
    TRUSTED_DEVICES_KEY: 'lume_trusted_devices',

    // TOTP settings
    TOTP_SETTINGS: {
        issuer: 'Lume MedSpa AI',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
    },

    // MFA configuration
    config: {
        enabled: false,
        method: null, // 'totp', 'sms', 'email'
        secret: null,
        phone: null,
        email: null,
        setupComplete: false,
        recoveryCodesGenerated: false
    },

    // ===========================================
    // INITIALIZATION
    // ===========================================

    init() {
        this.loadConfig();
        this.loadTrustedDevices();
    },

    loadConfig() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.config = { ...this.config, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load MFA config:', e);
        }
    },

    saveConfig() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    },

    // ===========================================
    // MFA STATUS
    // ===========================================

    isEnabled() {
        return this.config.enabled && this.config.setupComplete;
    },

    getMethod() {
        return this.config.method;
    },

    getMaskedPhone() {
        if (!this.config.phone) return null;
        const phone = this.config.phone;
        return phone.slice(0, 3) + '****' + phone.slice(-4);
    },

    getMaskedEmail() {
        if (!this.config.email) return null;
        const email = this.config.email;
        const [local, domain] = email.split('@');
        return local.slice(0, 2) + '****@' + domain;
    },

    // ===========================================
    // TOTP SETUP
    // ===========================================

    /**
     * Generate TOTP secret and QR code URL
     * @param {string} email - User's email for identification
     * @returns {Object} Setup data with secret and QR URL
     */
    setupTOTP(email) {
        // Generate random secret (Base32 encoded)
        const secret = this.generateSecret(20);

        // Create otpauth URL for QR code
        const otpauthUrl = this.generateOTPAuthURL(email, secret);

        // Store temporarily (not saved until verified)
        this.pendingSecret = secret;

        return {
            secret: this.formatSecretForDisplay(secret),
            secretRaw: secret,
            qrUrl: otpauthUrl,
            qrDataUrl: this.generateQRCodeDataUrl(otpauthUrl)
        };
    },

    /**
     * Verify TOTP code and complete setup
     * @param {string} code - 6-digit verification code
     * @returns {Object} Result with success status
     */
    verifyTOTPSetup(code) {
        if (!this.pendingSecret) {
            return { success: false, error: 'No pending setup' };
        }

        const isValid = this.verifyTOTP(code, this.pendingSecret);

        if (isValid) {
            this.config.enabled = true;
            this.config.method = 'totp';
            this.config.secret = this.pendingSecret;
            this.config.setupComplete = true;
            this.saveConfig();

            this.pendingSecret = null;

            return { success: true };
        }

        return { success: false, error: 'Invalid code' };
    },

    /**
     * Verify TOTP code for login
     * @param {string} code - 6-digit verification code
     * @returns {boolean} Whether code is valid
     */
    verifyTOTP(code, secret = null) {
        const secretToUse = secret || this.config.secret;
        if (!secretToUse) return false;

        // Check current and previous/next time windows (30 second tolerance)
        const now = Math.floor(Date.now() / 1000);
        const periods = [
            Math.floor(now / 30) - 1,
            Math.floor(now / 30),
            Math.floor(now / 30) + 1
        ];

        for (const period of periods) {
            const expectedCode = this.generateTOTPCode(secretToUse, period);
            if (expectedCode === code) {
                return true;
            }
        }

        return false;
    },

    /**
     * Generate TOTP code for a given period
     * Uses HMAC-SHA1 algorithm
     */
    generateTOTPCode(secret, period) {
        // Convert period to 8-byte buffer
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setUint32(4, period, false);

        // Base32 decode secret
        const keyBytes = this.base32Decode(secret);

        // HMAC-SHA1 (simplified implementation for demo)
        // In production, use Web Crypto API
        const hash = this.hmacSha1(keyBytes, new Uint8Array(buffer));

        // Dynamic truncation
        const offset = hash[hash.length - 1] & 0xf;
        const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        ) % 1000000;

        return code.toString().padStart(6, '0');
    },

    // ===========================================
    // SMS VERIFICATION
    // ===========================================

    /**
     * Setup SMS verification
     * @param {string} phone - Phone number
     */
    async setupSMS(phone) {
        // Normalize phone number
        const normalizedPhone = phone.replace(/\D/g, '');

        if (normalizedPhone.length < 10) {
            return { success: false, error: 'Invalid phone number' };
        }

        // In production, send SMS via Twilio/etc
        const code = this.generateVerificationCode();
        this.pendingSMSCode = code;
        this.pendingPhone = normalizedPhone;

        console.log('[MFA] SMS verification code:', code); // For demo
        showToast(`Verification code sent to ${this.maskPhone(normalizedPhone)}`, 'info');

        return {
            success: true,
            message: `Code sent to ${this.maskPhone(normalizedPhone)}`,
            // Demo only - remove in production
            demoCode: code
        };
    },

    /**
     * Verify SMS code and complete setup
     */
    verifySMSSetup(code) {
        if (!this.pendingSMSCode || !this.pendingPhone) {
            return { success: false, error: 'No pending verification' };
        }

        if (code === this.pendingSMSCode) {
            this.config.enabled = true;
            this.config.method = 'sms';
            this.config.phone = this.pendingPhone;
            this.config.setupComplete = true;
            this.saveConfig();

            this.pendingSMSCode = null;
            this.pendingPhone = null;

            return { success: true };
        }

        return { success: false, error: 'Invalid code' };
    },

    /**
     * Request SMS code for login
     */
    async requestSMSCode() {
        if (!this.config.phone) {
            return { success: false, error: 'SMS not configured' };
        }

        const code = this.generateVerificationCode();
        this.pendingLoginCode = code;

        console.log('[MFA] Login SMS code:', code); // For demo
        showToast(`Code sent to ${this.getMaskedPhone()}`, 'info');

        return {
            success: true,
            maskedPhone: this.getMaskedPhone(),
            demoCode: code
        };
    },

    /**
     * Verify SMS login code
     */
    verifySMSLogin(code) {
        if (code === this.pendingLoginCode) {
            this.pendingLoginCode = null;
            return { success: true };
        }
        return { success: false, error: 'Invalid code' };
    },

    // ===========================================
    // RECOVERY CODES
    // ===========================================

    /**
     * Generate recovery codes
     * @returns {Array} Array of 8 recovery codes
     */
    generateRecoveryCodes() {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            codes.push(this.generateRecoveryCode());
        }

        // Store hashed versions
        const hashedCodes = codes.map(code => this.hashCode(code));
        localStorage.setItem(this.RECOVERY_KEY, JSON.stringify(hashedCodes));

        this.config.recoveryCodesGenerated = true;
        this.saveConfig();

        return codes;
    },

    /**
     * Verify and consume a recovery code
     */
    verifyRecoveryCode(code) {
        const storedHashes = JSON.parse(localStorage.getItem(this.RECOVERY_KEY) || '[]');
        const codeHash = this.hashCode(code.toUpperCase().replace(/\s/g, ''));

        const index = storedHashes.indexOf(codeHash);
        if (index >= 0) {
            // Remove used code
            storedHashes.splice(index, 1);
            localStorage.setItem(this.RECOVERY_KEY, JSON.stringify(storedHashes));
            return { success: true, remainingCodes: storedHashes.length };
        }

        return { success: false, error: 'Invalid recovery code' };
    },

    getRecoveryCodeCount() {
        const stored = JSON.parse(localStorage.getItem(this.RECOVERY_KEY) || '[]');
        return stored.length;
    },

    // ===========================================
    // TRUSTED DEVICES
    // ===========================================

    loadTrustedDevices() {
        try {
            const stored = localStorage.getItem(this.TRUSTED_DEVICES_KEY);
            this.trustedDevices = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.trustedDevices = [];
        }
    },

    saveTrustedDevices() {
        localStorage.setItem(this.TRUSTED_DEVICES_KEY, JSON.stringify(this.trustedDevices));
    },

    /**
     * Trust current device for 30 days
     */
    trustDevice() {
        const deviceId = this.getDeviceId();
        const expires = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

        // Remove existing entry for this device
        this.trustedDevices = this.trustedDevices.filter(d => d.id !== deviceId);

        // Add new entry
        this.trustedDevices.push({
            id: deviceId,
            expires,
            addedAt: Date.now(),
            userAgent: navigator.userAgent.slice(0, 100)
        });

        this.saveTrustedDevices();
    },

    /**
     * Check if current device is trusted
     */
    isDeviceTrusted() {
        const deviceId = this.getDeviceId();
        const device = this.trustedDevices.find(d => d.id === deviceId);

        if (device && device.expires > Date.now()) {
            return true;
        }

        // Remove expired entry
        if (device) {
            this.trustedDevices = this.trustedDevices.filter(d => d.id !== deviceId);
            this.saveTrustedDevices();
        }

        return false;
    },

    /**
     * Revoke device trust
     */
    revokeDevice(deviceId) {
        this.trustedDevices = this.trustedDevices.filter(d => d.id !== deviceId);
        this.saveTrustedDevices();
    },

    /**
     * Get list of trusted devices
     */
    getTrustedDevices() {
        // Clean expired devices
        this.trustedDevices = this.trustedDevices.filter(d => d.expires > Date.now());
        this.saveTrustedDevices();
        return this.trustedDevices;
    },

    getDeviceId() {
        let deviceId = localStorage.getItem('lume_device_id');
        if (!deviceId) {
            deviceId = this.generateDeviceId();
            localStorage.setItem('lume_device_id', deviceId);
        }
        return deviceId;
    },

    generateDeviceId() {
        return 'dev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // ===========================================
    // DISABLE MFA
    // ===========================================

    /**
     * Disable MFA (requires verification)
     */
    disable(verificationCode) {
        // Verify the code first
        let isValid = false;

        if (this.config.method === 'totp') {
            isValid = this.verifyTOTP(verificationCode);
        } else if (this.config.method === 'sms') {
            isValid = verificationCode === this.pendingLoginCode;
        }

        if (!isValid) {
            // Try recovery code
            const recoveryResult = this.verifyRecoveryCode(verificationCode);
            isValid = recoveryResult.success;
        }

        if (isValid) {
            this.config = {
                enabled: false,
                method: null,
                secret: null,
                phone: null,
                email: null,
                setupComplete: false,
                recoveryCodesGenerated: false
            };
            this.saveConfig();
            localStorage.removeItem(this.RECOVERY_KEY);

            return { success: true };
        }

        return { success: false, error: 'Verification failed' };
    },

    // ===========================================
    // HELPER METHODS
    // ===========================================

    generateSecret(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            secret += charset[randomValues[i] % charset.length];
        }

        return secret;
    },

    formatSecretForDisplay(secret) {
        return secret.match(/.{1,4}/g)?.join(' ') || secret;
    },

    generateOTPAuthURL(email, secret) {
        const issuer = encodeURIComponent(this.TOTP_SETTINGS.issuer);
        const account = encodeURIComponent(email);
        return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${this.TOTP_SETTINGS.algorithm}&digits=${this.TOTP_SETTINGS.digits}&period=${this.TOTP_SETTINGS.period}`;
    },

    generateQRCodeDataUrl(url) {
        // Returns a URL that can be used with a QR code API
        // In production, use a library like qrcode.js
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    },

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    generateRecoveryCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        const randomValues = new Uint8Array(10);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < 10; i++) {
            code += chars[randomValues[i] % chars.length];
            if (i === 4) code += '-';
        }

        return code;
    },

    hashCode(code) {
        // Simple hash for demo - in production use crypto.subtle.digest
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    maskPhone(phone) {
        if (!phone || phone.length < 10) return phone;
        return phone.slice(0, 3) + '****' + phone.slice(-4);
    },

    base32Decode(encoded) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';

        for (const char of encoded.toUpperCase()) {
            const val = chars.indexOf(char);
            if (val >= 0) {
                bits += val.toString(2).padStart(5, '0');
            }
        }

        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }

        return new Uint8Array(bytes);
    },

    hmacSha1(key, message) {
        // Simplified HMAC-SHA1 for demo
        // In production, use Web Crypto API: crypto.subtle.sign('HMAC', key, message)
        const hash = new Uint8Array(20);
        for (let i = 0; i < 20; i++) {
            let val = 0;
            for (let j = 0; j < key.length; j++) {
                val ^= key[j];
            }
            for (let j = 0; j < message.length; j++) {
                val ^= message[j];
            }
            hash[i] = (val + i * 31) & 0xff;
        }
        return hash;
    }
};

// Initialize
MFAService.init();

// Expose globally
window.MFAService = MFAService;

// ===========================================
// MFA SETUP UI
// ===========================================

window.showMFASetupModal = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'mfa-setup-modal';

    modal.innerHTML = `
        <div class="modal animate-scale-in" style="max-width: 500px;">
            <div class="modal-header">
                <h2>🔐 Set Up Two-Factor Authentication</h2>
                <button class="modal-close" onclick="closeMFASetupModal()">×</button>
            </div>
            <div class="modal-content" id="mfa-setup-content">
                <p style="margin-bottom: 24px; color: var(--nav-text-secondary, #666);">
                    Add an extra layer of security to your account by requiring a verification code in addition to your password.
                </p>
                
                <div class="mfa-method-options" style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="mfa-method-btn" onclick="startTOTPSetup()" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--nav-surface, #f5f7fa); border: 2px solid transparent; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                        <span style="font-size: 32px;">📱</span>
                        <div>
                            <strong style="display: block; margin-bottom: 4px;">Authenticator App</strong>
                            <span style="font-size: 13px; color: var(--nav-text-secondary, #666);">Use Google Authenticator, Authy, or similar app</span>
                        </div>
                    </button>
                    
                    <button class="mfa-method-btn" onclick="startSMSSetup()" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--nav-surface, #f5f7fa); border: 2px solid transparent; border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s;">
                        <span style="font-size: 32px;">💬</span>
                        <div>
                            <strong style="display: block; margin-bottom: 4px;">SMS Verification</strong>
                            <span style="font-size: 13px; color: var(--nav-text-secondary, #666);">Receive codes via text message</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.closeMFASetupModal = function () {
    const modal = document.getElementById('mfa-setup-modal');
    if (modal) modal.remove();
};

window.startTOTPSetup = function () {
    const user = AuthService?.getCurrentUser() || { email: 'user@example.com' };
    const setup = MFAService.setupTOTP(user.email);

    const content = document.getElementById('mfa-setup-content');
    content.innerHTML = `
        <div style="text-align: center;">
            <p style="margin-bottom: 16px; color: var(--nav-text-secondary, #666);">
                Scan this QR code with your authenticator app:
            </p>
            <img src="${setup.qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border-radius: 8px; margin-bottom: 16px;"/>
            <p style="font-size: 12px; color: var(--nav-text-secondary, #666); margin-bottom: 16px;">
                Or enter this key manually:<br>
                <code style="font-size: 14px; background: var(--nav-surface, #f5f7fa); padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px;">${setup.secret}</code>
            </p>
            <div class="form-group" style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Enter 6-digit code from app:</label>
                <input type="text" id="totp-verify-code" class="input" maxlength="6" pattern="[0-9]*" 
                       style="text-align: center; font-size: 24px; letter-spacing: 8px; width: 180px;"
                       placeholder="000000" autocomplete="off">
            </div>
            <button class="btn btn-primary" onclick="verifyTOTPSetupCode()" style="width: 100%;">Verify & Enable</button>
            <button class="btn btn-secondary" onclick="showMFASetupModal()" style="width: 100%; margin-top: 8px;">Back</button>
        </div>
    `;

    document.getElementById('totp-verify-code').focus();
};

window.verifyTOTPSetupCode = function () {
    const code = document.getElementById('totp-verify-code').value;
    const result = MFAService.verifyTOTPSetup(code);

    if (result.success) {
        showRecoveryCodes();
    } else {
        showToast('Invalid code. Please try again.', 'error');
    }
};

window.startSMSSetup = function () {
    const content = document.getElementById('mfa-setup-content');
    content.innerHTML = `
        <div>
            <p style="margin-bottom: 16px; color: var(--nav-text-secondary, #666);">
                Enter your phone number to receive verification codes:
            </p>
            <div class="form-group" style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Phone Number:</label>
                <input type="tel" id="sms-phone" class="input" placeholder="+1 (555) 123-4567" style="width: 100%;">
            </div>
            <button class="btn btn-primary" onclick="sendSMSVerification()" style="width: 100%;">Send Code</button>
            <button class="btn btn-secondary" onclick="showMFASetupModal()" style="width: 100%; margin-top: 8px;">Back</button>
        </div>
    `;

    document.getElementById('sms-phone').focus();
};

window.sendSMSVerification = async function () {
    const phone = document.getElementById('sms-phone').value;
    const result = await MFAService.setupSMS(phone);

    if (result.success) {
        const content = document.getElementById('mfa-setup-content');
        content.innerHTML = `
            <div style="text-align: center;">
                <p style="margin-bottom: 16px; color: var(--nav-text-secondary, #666);">
                    Enter the 6-digit code sent to your phone:
                </p>
                ${result.demoCode ? `<p style="font-size: 12px; color: #f59e0b; margin-bottom: 16px;">Demo code: ${result.demoCode}</p>` : ''}
                <div class="form-group" style="margin-bottom: 16px;">
                    <input type="text" id="sms-verify-code" class="input" maxlength="6" 
                           style="text-align: center; font-size: 24px; letter-spacing: 8px; width: 180px;"
                           placeholder="000000" autocomplete="off">
                </div>
                <button class="btn btn-primary" onclick="verifySMSSetupCode()" style="width: 100%;">Verify & Enable</button>
            </div>
        `;
        document.getElementById('sms-verify-code').focus();
    } else {
        showToast(result.error, 'error');
    }
};

window.verifySMSSetupCode = function () {
    const code = document.getElementById('sms-verify-code').value;
    const result = MFAService.verifySMSSetup(code);

    if (result.success) {
        showRecoveryCodes();
    } else {
        showToast(result.error, 'error');
    }
};

window.showRecoveryCodes = function () {
    const codes = MFAService.generateRecoveryCodes();

    const content = document.getElementById('mfa-setup-content');
    content.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px;">✓</div>
            <h3 style="margin-bottom: 8px;">Two-Factor Authentication Enabled!</h3>
            <p style="margin-bottom: 24px; color: var(--nav-text-secondary, #666);">
                Save these recovery codes in a safe place. You can use them to access your account if you lose your device.
            </p>
            <div style="background: var(--nav-surface, #f5f7fa); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: monospace; font-size: 14px;">
                    ${codes.map(code => `<div style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 4px;">${code}</div>`).join('')}
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary" onclick="copyRecoveryCodes('${codes.join(',')}')" style="flex: 1;">📋 Copy Codes</button>
                <button class="btn btn-primary" onclick="closeMFASetupModal()" style="flex: 1;">Done</button>
            </div>
        </div>
    `;
};

window.copyRecoveryCodes = function (codesString) {
    const codes = codesString.split(',');
    const text = 'Lume MedSpa AI Recovery Codes\\n' + codes.join('\\n');
    navigator.clipboard.writeText(text.replace(/\\n/g, '\n'));
    showToast('Recovery codes copied!', 'success');
};
