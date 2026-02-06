// ===========================================
// NUDGE GENERATOR SERVICE
// AI-powered personalized message generation
// ===========================================

const NudgeGenerator = {
    /**
     * Generate a personalized nudge for a client
     */
    generate(client, type = 'auto') {
        // Auto-detect best nudge type based on client data
        if (type === 'auto') {
            type = this.detectBestNudgeType(client);
        }

        const context = this.buildContext(client);
        const template = this.getTemplate(type, client.membershipType);
        const message = this.fillTemplate(template, context);

        return {
            type,
            subject: this.generateSubject(type, context),
            message,
            urgency: context.urgency,
            channels: this.recommendChannels(client, type),
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Detect the best nudge type based on client situation
     */
    detectBestNudgeType(client) {
        // Analyze the client first
        const analysis = ChurnAnalyzer.analyze(client);

        if (client.remainingSessions === 0 ||
            (client.expireDate && new Date(client.expireDate) < new Date())) {
            return 'renewal';
        }
        if (client.remainingSessions <= 2) {
            return 'low-sessions';
        }
        if (analysis.churnRisk >= 60) {
            return 're-engagement';
        }
        if (client.expireDate) {
            const daysLeft = Math.ceil((new Date(client.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 14) {
                return 'expiring-soon';
            }
        }
        return 'check-in';
    },

    /**
     * Build context object for template filling
     */
    buildContext(client) {
        const analysis = ChurnAnalyzer.analyze(client);
        const firstName = client.firstName || 'Valued Client';
        const lastName = client.lastName || '';

        let daysUntilExpiry = null;
        if (client.expireDate) {
            daysUntilExpiry = Math.ceil((new Date(client.expireDate) - new Date()) / (1000 * 60 * 60 * 24));
        }

        let daysSinceVisit = null;
        if (client.lastVisit) {
            daysSinceVisit = Math.ceil((new Date() - new Date(client.lastVisit)) / (1000 * 60 * 60 * 24));
        }

        return {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            packageName: client.packageName || 'wellness package',
            membershipType: client.membershipType,
            membershipLabel: this.getMembershipLabel(client.membershipType),
            remainingSessions: client.remainingSessions,
            expireDate: client.expireDate ? new Date(client.expireDate).toLocaleDateString() : null,
            daysUntilExpiry,
            daysSinceVisit,
            urgency: analysis.urgency,
            healthScore: analysis.healthScore,
            recommendation: analysis.recommendation
        };
    },

    /**
     * Get template based on nudge type and membership level
     */
    getTemplate(type, membership) {
        const templates = {
            'renewal': {
                vip: `Hi {firstName}! 🌟\n\nAs one of our most valued VIP members, we wanted to personally reach out about your {packageName}.\n\nWe'd love to ensure you continue receiving the premium care you deserve. As a special thank you for your loyalty, we're offering you an exclusive 20% discount on your renewal.\n\nShall I schedule a quick call to discuss your renewal options?\n\nWarmly,\nYour Med Spa Team`,
                premium: `Hello {firstName},\n\nWe noticed your {packageName} is ready for renewal. We've truly enjoyed being part of your wellness journey!\n\nAs a Premium member, you're eligible for a 15% loyalty discount on your next package. Plus, we'll add a complimentary treatment of your choice.\n\nBook your renewal today: [Book Now]\n\nLooking forward to seeing you soon!`,
                default: `Hi {firstName},\n\nYour {packageName} is ready for renewal! We miss seeing you.\n\nRenew now and receive 10% off your next package, plus a free consultation to discuss your goals.\n\nReply to this message or call us to renew.\n\nBest,\nYour Med Spa Team`
            },
            'low-sessions': {
                vip: `Hey {firstName}! 👋\n\nJust a heads up – you have {remainingSessions} session(s) remaining on your {packageName}.\n\nAs our VIP, you get first access to our new treatment menu! Book your remaining sessions and let's chat about what's next for your wellness journey.\n\nShall I reserve your favorite time slot?\n\n💎 Your VIP Team`,
                premium: `Hi {firstName},\n\nFriendly reminder: You have {remainingSessions} session(s) left on your {packageName}.\n\nLet's make sure you get the most out of your membership! Book now, and I'll also share some exciting new treatments we think you'll love.\n\nBook here: [Schedule Now]`,
                default: `Hello {firstName},\n\nYou have {remainingSessions} session(s) remaining on your {packageName}. Don't let them go to waste!\n\nBook now to use your remaining sessions, and ask about our renewal discounts.\n\nSee you soon!`
            },
            'expiring-soon': {
                vip: `Hi {firstName}! ⏰\n\nYour {packageName} expires on {expireDate} – that's just {daysUntilExpiry} days away!\n\nLet's make sure you use your remaining {remainingSessions} sessions. I've reserved some premium time slots just for you.\n\nReply with your preferred times, and I'll get you scheduled right away.\n\n✨ Your VIP Concierge`,
                premium: `Hello {firstName},\n\nQuick reminder: Your {packageName} expires on {expireDate}.\n\nYou still have {remainingSessions} session(s) to enjoy! Book them now so you don't miss out on the amazing results.\n\nNeed help scheduling? Just reply to this message.\n\nWarmly,\nYour Care Team`,
                default: `Hi {firstName},\n\nYour {packageName} expires on {expireDate}. You have {remainingSessions} session(s) remaining.\n\nDon't let your sessions expire! Book now: [Schedule]\n\nQuestions? We're here to help.`
            },
            're-engagement': {
                vip: `{firstName}, we miss you! 💜\n\nIt's been a while since your last visit, and we wanted to check in. Your skin (and your wellbeing) deserve the VIP treatment!\n\nAs a special "welcome back" offer, enjoy a complimentary upgrade on your next visit. Just mention this message when you book.\n\nWe'd love to see you again soon.\n\nWith care,\nYour VIP Team`,
                premium: `Hi {firstName}!\n\nWe've missed seeing you at the spa! It's been {daysSinceVisit} days since your last visit.\n\nCome back and treat yourself – you deserve it! As a thank you for being a Premium member, enjoy 15% off your next treatment.\n\nBook now: [Schedule Visit]\n\nSee you soon!`,
                default: `Hello {firstName},\n\nWe miss you! It's been a while since your last visit, and we wanted to see how you're doing.\n\nWe'd love to welcome you back with a special 10% off any treatment. No strings attached – just our way of saying we care.\n\nReady to book? [Click Here]\n\nHope to see you soon!`
            },
            'check-in': {
                vip: `Hey {firstName}! 🌟\n\nJust wanted to say hi and see how you're feeling after your recent treatments. As always, your satisfaction is our top priority.\n\nAny feedback? Or ready to book your next session? I'm here for whatever you need!\n\n💎 Your VIP Concierge`,
                premium: `Hi {firstName},\n\nHope you're glowing! Just checking in to see how everything's going with your {packageName}.\n\nRemember, you have {remainingSessions} sessions available. Ready to book your next one?\n\nWe're always here if you need anything!`,
                default: `Hello {firstName},\n\nJust checking in! We hope you're enjoying your {packageName}.\n\nYou have {remainingSessions} sessions remaining. Would you like to schedule your next visit?\n\nLet us know if you have any questions!\n\nBest,\nYour Med Spa Team`
            }
        };

        const typeTemplates = templates[type] || templates['check-in'];
        return typeTemplates[membership] || typeTemplates['default'];
    },

    /**
     * Fill template with context values
     */
    fillTemplate(template, context) {
        let filled = template;

        Object.entries(context).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{${key}\\}`, 'g');
            filled = filled.replace(placeholder, value || '[N/A]');
        });

        return filled;
    },

    /**
     * Generate email subject line
     */
    generateSubject(type, context) {
        const subjects = {
            'renewal': `${context.firstName}, renew your ${context.packageName} with exclusive savings!`,
            'low-sessions': `${context.firstName}, use your remaining sessions! ✨`,
            'expiring-soon': `⏰ ${context.firstName}, your package expires in ${context.daysUntilExpiry} days`,
            're-engagement': `We miss you, ${context.firstName}! Here's a special offer 💜`,
            'check-in': `How are you feeling, ${context.firstName}?`
        };

        return subjects[type] || `A message for you, ${context.firstName}!`;
    },

    /**
     * Recommend best channels for this nudge
     */
    recommendChannels(client, type) {
        // Based on urgency and type, recommend channels
        if (type === 'renewal' || type === 'expiring-soon') {
            return ['sms', 'email', 'call'];
        }
        if (type === 're-engagement') {
            return ['email', 'sms'];
        }
        return ['email'];
    },

    /**
     * Get membership label
     */
    getMembershipLabel(type) {
        switch (type) {
            case 'vip': return 'VIP';
            case 'premium': return 'Premium';
            case 'basic': return 'Basic';
            default: return 'Member';
        }
    },

    /**
     * Copy nudge to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }
};

// Export for use
window.NudgeGenerator = NudgeGenerator;
