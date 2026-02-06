// ===========================================
// MOCK CLIENT DATA
// ===========================================

const CLIENTS = [
    {
        id: 1,
        firstName: "Sarah",
        lastName: "Mitchell",
        email: "sarah.mitchell@email.com",
        phone: "(555) 234-5678",
        avatar: null,
        avatarColor: "#8b5cf6",
        healthScore: 85,
        churnRisk: 12,
        lastVisit: "2026-01-28",
        nextAppointment: "2026-02-10",
        membershipType: "premium",
        totalSpend: 4250,
        visitCount: 18,
        memberSince: "2024-06-15",
        preferredTreatments: ["Botox", "HydraFacial", "Microneedling"],
        notes: "Prefers morning appointments. Sensitive to retinol products.",
        visits: [
            { date: "2026-01-28", treatment: "HydraFacial Deluxe", amount: 250, status: "completed" },
            { date: "2026-01-14", treatment: "Botox - Forehead", amount: 450, status: "completed" },
            { date: "2025-12-20", treatment: "Chemical Peel", amount: 175, status: "completed" },
            { date: "2025-12-05", treatment: "Microneedling Session", amount: 350, status: "completed" }
        ]
    },
    {
        id: 2,
        firstName: "Jennifer",
        lastName: "Adams",
        email: "j.adams@email.com",
        phone: "(555) 345-6789",
        avatar: null,
        avatarColor: "#10b981",
        healthScore: 72,
        churnRisk: 28,
        lastVisit: "2026-01-20",
        nextAppointment: null,
        membershipType: "basic",
        totalSpend: 1850,
        visitCount: 8,
        memberSince: "2025-03-10",
        preferredTreatments: ["Laser Hair Removal", "Facials"],
        notes: "",
        visits: [
            { date: "2026-01-20", treatment: "Laser Hair Removal - Legs", amount: 300, status: "completed" },
            { date: "2025-12-15", treatment: "Classic Facial", amount: 125, status: "completed" },
            { date: "2025-11-28", treatment: "Laser Hair Removal - Underarms", amount: 150, status: "completed" }
        ]
    },
    {
        id: 3,
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@email.com",
        phone: "(555) 456-7890",
        avatar: null,
        avatarColor: "#f59e0b",
        healthScore: 45,
        churnRisk: 65,
        lastVisit: "2025-12-10",
        nextAppointment: null,
        membershipType: "basic",
        totalSpend: 980,
        visitCount: 4,
        memberSince: "2025-08-22",
        preferredTreatments: ["CoolSculpting"],
        notes: "Interested in body contouring treatments.",
        visits: [
            { date: "2025-12-10", treatment: "CoolSculpting Consultation", amount: 0, status: "completed" },
            { date: "2025-11-15", treatment: "Body Assessment", amount: 150, status: "completed" },
            { date: "2025-10-01", treatment: "Initial Consultation", amount: 0, status: "completed" }
        ]
    },
    {
        id: 4,
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.r@email.com",
        phone: "(555) 567-8901",
        avatar: null,
        avatarColor: "#ef4444",
        healthScore: 32,
        churnRisk: 78,
        lastVisit: "2025-11-05",
        nextAppointment: null,
        membershipType: "none",
        totalSpend: 425,
        visitCount: 2,
        memberSince: "2025-09-15",
        preferredTreatments: ["Facials"],
        notes: "Had a minor reaction to a product - follow up needed.",
        visits: [
            { date: "2025-11-05", treatment: "Signature Facial", amount: 175, status: "completed" },
            { date: "2025-09-15", treatment: "New Client Package", amount: 250, status: "completed" }
        ]
    },
    {
        id: 5,
        firstName: "Lisa",
        lastName: "Thompson",
        email: "lisa.t@email.com",
        phone: "(555) 678-9012",
        avatar: null,
        avatarColor: "#3b82f6",
        healthScore: 92,
        churnRisk: 5,
        lastVisit: "2026-02-01",
        nextAppointment: "2026-02-15",
        membershipType: "vip",
        totalSpend: 12500,
        visitCount: 42,
        memberSince: "2023-01-20",
        preferredTreatments: ["Botox", "Fillers", "PRP Therapy", "LED Light Therapy"],
        notes: "VIP client - always offer premium time slots. Refers many new clients.",
        visits: [
            { date: "2026-02-01", treatment: "Botox - Full Face", amount: 750, status: "completed" },
            { date: "2026-01-18", treatment: "PRP Hair Therapy", amount: 450, status: "completed" },
            { date: "2026-01-05", treatment: "LED Light Therapy", amount: 150, status: "completed" },
            { date: "2025-12-22", treatment: "Lip Filler Touch-up", amount: 350, status: "completed" }
        ]
    },
    {
        id: 6,
        firstName: "David",
        lastName: "Kim",
        email: "david.kim@email.com",
        phone: "(555) 789-0123",
        avatar: null,
        avatarColor: "#06b6d4",
        healthScore: 58,
        churnRisk: 42,
        lastVisit: "2026-01-10",
        nextAppointment: null,
        membershipType: "basic",
        totalSpend: 1200,
        visitCount: 5,
        memberSince: "2025-06-01",
        preferredTreatments: ["Laser Skin Resurfacing"],
        notes: "Concerned about acne scarring. Interested in package deals.",
        visits: [
            { date: "2026-01-10", treatment: "Laser Skin Resurfacing", amount: 400, status: "completed" },
            { date: "2025-11-20", treatment: "Chemical Peel", amount: 200, status: "completed" },
            { date: "2025-09-15", treatment: "Skin Analysis", amount: 100, status: "completed" }
        ]
    },
    {
        id: 7,
        firstName: "Amanda",
        lastName: "Foster",
        email: "a.foster@email.com",
        phone: "(555) 890-1234",
        avatar: null,
        avatarColor: "#ec4899",
        healthScore: 78,
        churnRisk: 18,
        lastVisit: "2026-01-25",
        nextAppointment: "2026-02-08",
        membershipType: "premium",
        totalSpend: 3800,
        visitCount: 15,
        memberSince: "2024-09-01",
        preferredTreatments: ["Microneedling", "HydraFacial", "Vitamin Injections"],
        notes: "Works in healthcare - flexible with late afternoon appointments.",
        visits: [
            { date: "2026-01-25", treatment: "Microneedling + PRP", amount: 500, status: "completed" },
            { date: "2026-01-11", treatment: "B12 Injection", amount: 50, status: "completed" },
            { date: "2025-12-28", treatment: "HydraFacial", amount: 200, status: "completed" }
        ]
    },
    {
        id: 8,
        firstName: "Robert",
        lastName: "Williams",
        email: "r.williams@email.com",
        phone: "(555) 901-2345",
        avatar: null,
        avatarColor: "#84cc16",
        healthScore: 25,
        churnRisk: 85,
        lastVisit: "2025-10-15",
        nextAppointment: null,
        membershipType: "none",
        totalSpend: 350,
        visitCount: 2,
        memberSince: "2025-10-01",
        preferredTreatments: [],
        notes: "Came in for gift card redemption. Has not scheduled follow-up.",
        visits: [
            { date: "2025-10-15", treatment: "Men's Facial", amount: 150, status: "completed" },
            { date: "2025-10-01", treatment: "Consultation", amount: 0, status: "completed" }
        ]
    },
    {
        id: 9,
        firstName: "Nicole",
        lastName: "Patel",
        email: "nicole.patel@email.com",
        phone: "(555) 012-3456",
        avatar: null,
        avatarColor: "#a855f7",
        healthScore: 88,
        churnRisk: 8,
        lastVisit: "2026-01-30",
        nextAppointment: "2026-02-12",
        membershipType: "premium",
        totalSpend: 5200,
        visitCount: 22,
        memberSince: "2024-02-14",
        preferredTreatments: ["Botox", "Chemical Peels", "Dermaplaning"],
        notes: "Birthday in March - consider sending special offer.",
        visits: [
            { date: "2026-01-30", treatment: "Dermaplaning + Peel", amount: 225, status: "completed" },
            { date: "2026-01-16", treatment: "Botox Touch-up", amount: 300, status: "completed" },
            { date: "2025-12-30", treatment: "New Year Glow Package", amount: 400, status: "completed" }
        ]
    },
    {
        id: 10,
        firstName: "James",
        lastName: "Martinez",
        email: "j.martinez@email.com",
        phone: "(555) 123-4567",
        avatar: null,
        avatarColor: "#14b8a6",
        healthScore: 52,
        churnRisk: 48,
        lastVisit: "2025-12-20",
        nextAppointment: null,
        membershipType: "basic",
        totalSpend: 800,
        visitCount: 4,
        memberSince: "2025-07-10",
        preferredTreatments: ["Laser Hair Removal"],
        notes: "",
        visits: [
            { date: "2025-12-20", treatment: "Laser Hair Removal - Back", amount: 350, status: "completed" },
            { date: "2025-10-25", treatment: "Laser Hair Removal - Back", amount: 350, status: "completed" },
            { date: "2025-08-15", treatment: "Consultation", amount: 0, status: "completed" }
        ]
    }
];

// Helper functions
function getClientById(id) {
    return CLIENTS.find(c => c.id === parseInt(id));
}

function getClientFullName(client) {
    return `${client.firstName} ${client.lastName}`;
}

function getClientInitials(client) {
    return `${client.firstName[0]}${client.lastName[0]}`;
}

function getHealthScoreClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

function getChurnRiskClass(risk) {
    if (risk >= 60) return 'high-risk';
    if (risk >= 30) return 'medium-risk';
    return 'low-risk';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function getMembershipBadgeClass(type) {
    switch (type) {
        case 'vip': return 'vip';
        case 'premium': return 'premium';
        default: return 'basic';
    }
}

function getMembershipLabel(type) {
    switch (type) {
        case 'vip': return '⭐ VIP';
        case 'premium': return '💎 Premium';
        case 'basic': return 'Basic';
        default: return 'No Membership';
    }
}
