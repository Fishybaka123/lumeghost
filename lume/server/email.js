// ===========================================
// SendGrid Email Service
// ===========================================

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const initEmail = () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey === 'YOUR_SENDGRID_API_KEY_HERE') {
        console.warn('⚠️  SendGrid API key not configured. Emails will be logged to console.');
        return false;
    }
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid initialized');
    return true;
};

// Generate 6-digit verification code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (toEmail, code, userName) => {
    const fromEmail = process.env.FROM_EMAIL || 'contact@forgedigtl.com';
    const fromName = process.env.FROM_NAME || 'Lume MedSpa';

    const msg = {
        to: toEmail,
        from: {
            email: fromEmail,
            name: fromName
        },
        subject: 'Verify Your Lume Account',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
                    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #0ea58e 0%, #14b8a6 100%); padding: 32px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; }
                    .content { padding: 32px; text-align: center; }
                    .greeting { font-size: 18px; color: #374151; margin-bottom: 16px; }
                    .message { color: #6b7280; margin-bottom: 32px; line-height: 1.6; }
                    .code-box { background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
                    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0ea58e; font-family: monospace; }
                    .expires { font-size: 14px; color: #9ca3af; margin-top: 8px; }
                    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
                    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✨ Lume MedSpa</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hi ${userName}! 👋</p>
                        <p class="message">
                            Welcome to Lume! Use the verification code below to complete your account setup.
                        </p>
                        <div class="code-box">
                            <div class="code">${code}</div>
                            <p class="expires">This code expires in 15 minutes</p>
                        </div>
                        <p class="message">
                            If you didn't create a Lume account, you can safely ignore this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Lume MedSpa. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Hi ${userName}! Your Lume verification code is: ${code}. This code expires in 15 minutes.`
    };

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
        console.log('\n📧 EMAIL WOULD BE SENT (SendGrid not configured):');
        console.log('   To:', toEmail);
        console.log('   Code:', code);
        console.log('   (Configure SENDGRID_API_KEY in .env to send real emails)\n');
        return { success: true, simulated: true };
    }

    try {
        await sgMail.send(msg);
        console.log('📧 Verification email sent to:', toEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Email send error:', error.response?.body || error.message);
        throw new Error('Failed to send verification email');
    }
};

// Send password reset email
const sendPasswordResetEmail = async (toEmail, code, userName) => {
    const fromEmail = process.env.FROM_EMAIL || 'contact@forgedigtl.com';
    const fromName = process.env.FROM_NAME || 'Lume MedSpa';

    const msg = {
        to: toEmail,
        from: {
            email: fromEmail,
            name: fromName
        },
        subject: 'Reset Your Lume Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
                    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 32px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; }
                    .content { padding: 32px; text-align: center; }
                    .greeting { font-size: 18px; color: #374151; margin-bottom: 16px; }
                    .message { color: #6b7280; margin-bottom: 32px; line-height: 1.6; }
                    .code-box { background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
                    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f59e0b; font-family: monospace; }
                    .expires { font-size: 14px; color: #9ca3af; margin-top: 8px; }
                    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
                    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset</h1>
                    </div>
                    <div class="content">
                        <p class="greeting">Hi ${userName}!</p>
                        <p class="message">
                            We received a request to reset your password. Use the code below to proceed.
                        </p>
                        <div class="code-box">
                            <div class="code">${code}</div>
                            <p class="expires">This code expires in 15 minutes</p>
                        </div>
                        <p class="message">
                            If you didn't request a password reset, please ignore this email or contact support.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Lume MedSpa. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Hi ${userName}! Your password reset code is: ${code}. This code expires in 15 minutes.`
    };

    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
        console.log('\n📧 PASSWORD RESET EMAIL WOULD BE SENT:');
        console.log('   To:', toEmail);
        console.log('   Code:', code);
        return { success: true, simulated: true };
    }

    try {
        await sgMail.send(msg);
        console.log('📧 Password reset email sent to:', toEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Email send error:', error.response?.body || error.message);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    initEmail,
    generateCode,
    sendVerificationEmail,
    sendPasswordResetEmail
};
