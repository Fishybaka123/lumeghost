// ===========================================
// CSV PARSER SERVICE
// Parses imported CSV files with client data
// ===========================================

const CSVParser = {
    /**
     * Parse CSV text into client objects
     * Expected format: Last Name, First Name | Package Name | Remaining Sessions | Expire Date
     */
    parse(csvText) {
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length < 2) {
            throw new Error('CSV must have a header row and at least one data row');
        }

        // Parse header
        const headers = this.parseRow(lines[0]).map(h => h.toLowerCase().trim());

        // Find column indices
        const columns = this.mapColumns(headers);

        // Parse data rows
        const clients = [];
        for (let i = 1; i < lines.length; i++) {
            const row = this.parseRow(lines[i]);
            if (row.length === 0 || row.every(cell => !cell.trim())) continue;

            try {
                const client = this.parseClientRow(row, columns, i);
                if (client) clients.push(client);
            } catch (e) {
                console.warn(`Row ${i + 1} skipped: ${e.message}`);
            }
        }

        return clients;
    },

    /**
     * Parse a single CSV row, handling quoted values
     */
    parseRow(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    },

    /**
     * Map header names to column indices
     */
    mapColumns(headers) {
        const findColumn = (...names) => {
            for (const name of names) {
                const idx = headers.findIndex(h => h.includes(name));
                if (idx !== -1) return idx;
            }
            return -1;
        };

        return {
            name: findColumn('name', 'client', 'member'),
            lastName: findColumn('last name', 'lastname', 'last_name'),
            firstName: findColumn('first name', 'firstname', 'first_name'),
            package: findColumn('package', 'membership', 'plan', 'type'),
            sessions: findColumn('session', 'remaining', 'visits left'),
            expireDate: findColumn('expire', 'expiry', 'end date', 'valid until'),
            email: findColumn('email', 'e-mail'),
            phone: findColumn('phone', 'tel', 'mobile', 'cell')
        };
    },

    /**
     * Parse a data row into a client object
     */
    parseClientRow(row, columns, index) {
        let firstName = '';
        let lastName = '';

        // Handle "Last Name, First Name" format in name column
        if (columns.name !== -1 && row[columns.name]) {
            const nameParts = row[columns.name].split(',').map(p => p.trim());
            if (nameParts.length >= 2) {
                lastName = nameParts[0];
                firstName = nameParts[1];
            } else {
                // Fallback: treat as single name
                const parts = row[columns.name].split(' ');
                lastName = parts[0] || '';
                firstName = parts.slice(1).join(' ') || '';
            }
        } else {
            // Use separate columns if available
            firstName = columns.firstName !== -1 ? row[columns.firstName] || '' : '';
            lastName = columns.lastName !== -1 ? row[columns.lastName] || '' : '';
        }

        if (!firstName && !lastName) {
            throw new Error('Name is required');
        }

        // Parse package/membership
        const packageName = columns.package !== -1 ? row[columns.package] || '' : '';
        const membershipType = this.deriveMembershipType(packageName);

        // Parse remaining sessions
        const sessionsStr = columns.sessions !== -1 ? row[columns.sessions] : '0';
        const remainingSessions = parseInt(sessionsStr) || 0;

        // Parse expire date
        let expireDate = null;
        if (columns.expireDate !== -1 && row[columns.expireDate]) {
            expireDate = this.parseDate(row[columns.expireDate]);
        }

        // Optional fields
        const email = columns.email !== -1 ? row[columns.email] || '' : '';
        const phone = columns.phone !== -1 ? row[columns.phone] || '' : '';

        return {
            id: Date.now() + index,
            firstName,
            lastName,
            email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            phone: phone || '(555) 000-0000',
            avatar: null,
            avatarColor: this.generateColor(firstName + lastName),
            packageName,
            membershipType,
            remainingSessions,
            expireDate,
            // These will be calculated by ChurnAnalyzer
            healthScore: 50,
            churnRisk: 50,
            riskFactors: [],
            // Default values
            // Default values
            nextAppointment: null,
            totalSpend: 0,
            visitCount: 0,
            memberSince: new Date().toISOString().split('T')[0],
            preferredTreatments: packageName ? [packageName.split(' ')[0]] : [],
            notes: '',
            visits: []
        };
    },

    /**
     * Derive membership type from package name
     */
    deriveMembershipType(packageName) {
        const name = packageName.toLowerCase();
        if (name.includes('vip') || name.includes('platinum') || name.includes('unlimited')) {
            return 'vip';
        }
        if (name.includes('premium') || name.includes('gold') || name.includes('deluxe')) {
            return 'premium';
        }
        if (name.includes('basic') || name.includes('starter') || name.includes('essentials')) {
            return 'basic';
        }
        return 'basic';
    },

    /**
     * Parse various date formats
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Try common formats
        const formats = [
            /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
            /(\d{2})\/(\d{2})\/(\d{4})/,  // MM/DD/YYYY
            /(\d{2})-(\d{2})-(\d{4})/,  // MM-DD-YYYY
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                try {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        // Fallback: let JavaScript try to parse it
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (e) { }

        return null;
    },

    /**
     * Generate a consistent color from a string
     */
    generateColor(str) {
        const colors = [
            '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
            '#06b6d4', '#ec4899', '#84cc16', '#a855f7', '#14b8a6'
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
};

// Export for use
window.CSVParser = CSVParser;
