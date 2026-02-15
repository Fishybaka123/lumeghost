// ===========================================
// SQLite Database Setup (using sql.js)
// ===========================================

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
const dbPath = path.join(__dirname, 'lume.db');

// Initialize database
async function initDatabase() {
    const SQL = await initSqlJs();

    // Try to load existing database
    try {
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
            console.log('✅ Loaded existing database from:', dbPath);
        } else {
            db = new SQL.Database();
            console.log('✅ Created new database');
        }
    } catch (err) {
        console.log('Creating new database...');
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            business_name TEXT DEFAULT '',
            settings TEXT DEFAULT '{}',
            verified INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            code TEXT NOT NULL,
            type TEXT DEFAULT 'email_verification',
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    try {
        db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        db.run('CREATE INDEX IF NOT EXISTS idx_verification_codes_user ON verification_codes(user_id)');
    } catch (e) {
        // Indexes may already exist
    }

    // Save to file
    saveDatabase();

    return db;
}

// Save database to file
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// User operations
const userOps = {
    // Create a new user
    create: (email, passwordHash, name) => {
        try {
            db.run(
                'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
                [email.toLowerCase(), passwordHash, name]
            );
            saveDatabase();

            // Get the created user
            const result = db.exec('SELECT last_insert_rowid() as id');
            const id = result[0]?.values[0][0];
            return { id, email: email.toLowerCase(), name };
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                throw new Error('Email already registered');
            }
            throw err;
        }
    },

    // Find user by email
    findByEmail: (email) => {
        const result = db.exec('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const columns = result[0].columns;
        const values = result[0].values[0];
        const user = columns.reduce((obj, col, i) => {
            obj[col] = values[i];
            return obj;
        }, {});

        if (user.settings && typeof user.settings === 'string') {
            try {
                user.settings = JSON.parse(user.settings);
            } catch (e) {
                user.settings = {};
            }
        }
        return user;
    },

    // Find user by ID
    findById: (id) => {
        const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const columns = result[0].columns;
        const values = result[0].values[0];
        return columns.reduce((obj, col, i) => {
            obj[col] = values[i];
            return obj;
        }, {});
    },

    // Mark user as verified
    verify: (userId) => {
        db.run('UPDATE users SET verified = 1, updated_at = datetime("now") WHERE id = ?', [userId]);
        saveDatabase();
    },

    // Update user profile
    updateProfile: (userId, data) => {
        // Handle settings JSON serialization
        let settingsJson = undefined;
        if (data.settings) {
            settingsJson = JSON.stringify(data.settings);
        }

        db.run(`
            UPDATE users 
            SET name = COALESCE(?, name),
                business_name = COALESCE(?, business_name),
                settings = COALESCE(?, settings),
                updated_at = datetime('now')
            WHERE id = ?
        `, [data.name, data.businessName, settingsJson, userId]);
        saveDatabase();
    },

    // Update password
    updatePassword: (userId, passwordHash) => {
        db.run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [passwordHash, userId]);
        saveDatabase();
    }
};

// Verification code operations
const codeOps = {
    // Create new verification code
    create: (userId, code, expiresInMinutes = 15) => {
        // Invalidate any existing codes for this user
        db.run('DELETE FROM verification_codes WHERE user_id = ? AND type = ?', [userId, 'email_verification']);

        // Create new code
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
        db.run(`
            INSERT INTO verification_codes (user_id, code, expires_at)
            VALUES (?, ?, ?)
        `, [userId, code, expiresAt]);
        saveDatabase();
    },

    // Verify code
    verify: (userId, code) => {
        const result = db.exec(`
            SELECT * FROM verification_codes 
            WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
        `, [userId, code]);

        if (result.length > 0 && result[0].values.length > 0) {
            const id = result[0].values[0][0];
            // Mark as used
            db.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [id]);
            saveDatabase();
            return true;
        }
        return false;
    },

    // Get active code for user (for resend)
    getActive: (userId) => {
        const result = db.exec(`
            SELECT * FROM verification_codes 
            WHERE user_id = ? AND used = 0 AND expires_at > datetime('now')
            ORDER BY created_at DESC LIMIT 1
        `, [userId]);

        if (result.length === 0 || result[0].values.length === 0) return null;

        const columns = result[0].columns;
        const values = result[0].values[0];
        return columns.reduce((obj, col, i) => {
            obj[col] = values[i];
            return obj;
        }, {});
    }
};

module.exports = {
    initDatabase,
    saveDatabase,
    userOps,
    codeOps,
    getDb: () => db
};
