// ===========================================
// Lume Authentication Server
// ===========================================

require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const { initDatabase, userOps, codeOps } = require('./database');
const { initEmail, generateCode, sendVerificationEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';

// Database will be initialized async

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'file://'],
    credentials: true
}));
app.use(express.json());

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ===========================================
// Auth Middleware
// ===========================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// ===========================================
// API Routes
// ===========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register new account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if email already exists
        const existingUser = userOps.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = userOps.create(email, passwordHash, name);

        // Generate verification code
        const code = generateCode();
        codeOps.create(user.id, code);

        // Send verification email
        await sendVerificationEmail(email, code, name);

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            message: 'Account created. Please check your email for the verification code.',
            userId: user.id,
            email: user.email
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message || 'Failed to create account' });
    }
});

// Verify email with code
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and verification code are required' });
        }

        // Find user
        const user = userOps.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Verify code
        const isValid = codeOps.verify(user.id, code);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        // Mark user as verified
        userOps.verify(user.id);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`✅ User verified: ${email}`);

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                verified: true
            }
        });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Resend verification code
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = userOps.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new code
        const code = generateCode();
        codeOps.create(user.id, code);

        // Send verification email
        await sendVerificationEmail(email, code, user.name);

        res.json({ message: 'Verification code sent' });
    } catch (err) {
        console.error('Resend code error:', err);
        res.status(500).json({ error: 'Failed to resend code' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = userOps.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if verified
        if (!user.verified) {
            // Generate new code and send
            const code = generateCode();
            codeOps.create(user.id, code);
            await sendVerificationEmail(email, code, user.name);

            return res.status(403).json({
                error: 'Email not verified. A new verification code has been sent.',
                needsVerification: true,
                email: user.email
            });
        }

        // Generate JWT token
        const expiresIn = rememberMe ? '30d' : '24h';
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn }
        );

        console.log(`✅ User logged in: ${email}`);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                businessName: user.business_name || '',
                verified: true
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = userOps.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            businessName: user.business_name || '',
            verified: !!user.verified,
            createdAt: user.created_at
        }
    });
});

// Update profile (protected route)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, businessName } = req.body;

        userOps.updateProfile(req.user.id, { name, businessName });

        const user = userOps.findById(req.user.id);

        res.json({
            message: 'Profile updated',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                businessName: user.business_name || ''
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password (protected route)
app.put('/api/auth/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const user = userOps.findById(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        userOps.updatePassword(req.user.id, passwordHash);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Logout (client-side token removal, but we can track it)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    // In a more robust system, you'd blacklist the token here
    console.log(`✅ User logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully' });
});

// ===========================================
// Start Server
// ===========================================

async function startServer() {
    try {
        // Initialize database first
        await initDatabase();

        // Initialize email service
        initEmail();

        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 ═══════════════════════════════════════════════');
            console.log('   LUME AUTHENTICATION SERVER');
            console.log('═══════════════════════════════════════════════════');
            console.log(`   🌐 Server running at: http://localhost:${PORT}`);
            console.log(`   📧 Emails from: ${process.env.FROM_EMAIL || 'contact@forgedigtl.com'}`);
            console.log('═══════════════════════════════════════════════════');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
