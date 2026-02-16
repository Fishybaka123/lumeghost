// ===========================================
// IMPORT SERVICE - Smart Data Import
// CSV/Excel/JSON with Validation & Mapping
// ===========================================

const ImportService = {
    // Supported file types
    SUPPORTED_TYPES: {
        'text/csv': 'csv',
        'application/vnd.ms-excel': 'excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
        'application/json': 'json',
        'text/plain': 'csv' // Treat plain text as CSV
    },

    // Default column mappings for clients
    CLIENT_FIELD_MAPPINGS: {
        'name': ['name', 'full name', 'client name', 'customer name', 'first name', 'contact'],
        'email': ['email', 'e-mail', 'email address', 'mail'],
        'phone': ['phone', 'telephone', 'mobile', 'cell', 'phone number', 'tel'],
        'membershipTier': ['membership', 'tier', 'level', 'plan', 'membership tier', 'subscription'],
        'membershipTier': ['membership', 'tier', 'level', 'plan', 'membership tier', 'subscription'],
        'totalSpent': ['total spent', 'revenue', 'ltv', 'lifetime value', 'total revenue', 'spent'],
        'visitCount': ['visits', 'visit count', 'appointments', 'total visits', 'sessions'],
        'treatments': ['treatments', 'services', 'procedures', 'treatment history']
    },

    // Validation rules
    VALIDATION_RULES: {
        name: { required: true, minLength: 2, maxLength: 100 },
        email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { required: false, pattern: /^[\d\s\-\+\(\)]{7,20}$/ },
        membershipTier: { required: false, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'VIP'] },
        healthScore: { required: false, min: 0, max: 100 },
        churnRisk: { required: false, min: 0, max: 100 }
    },

    /**
     * Import file and process data
     * @param {File} file - File to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async importFile(file, options = {}) {
        const {
            type = 'clients',
            skipValidation = false,
            mergeStrategy = 'skip', // skip, overwrite, merge
            onProgress = null
        } = options;

        try {
            // Detect file type
            const fileType = this.detectFileType(file);
            if (!fileType) {
                throw new Error(`Unsupported file type: ${file.type}`);
            }

            // Report progress
            if (onProgress) onProgress({ stage: 'reading', progress: 10 });

            // Read file content
            const rawData = await this.readFile(file, fileType);
            if (onProgress) onProgress({ stage: 'parsing', progress: 30 });

            // Parse data based on type
            let parsedData;
            switch (fileType) {
                case 'csv':
                    parsedData = this.parseCSV(rawData);
                    break;
                case 'excel':
                    parsedData = this.parseExcel(rawData);
                    break;
                case 'json':
                    parsedData = JSON.parse(rawData);
                    break;
                default:
                    throw new Error('Unknown file type');
            }

            if (onProgress) onProgress({ stage: 'mapping', progress: 50 });

            // Auto-map columns
            const mappedData = this.autoMapColumns(parsedData, type);

            if (onProgress) onProgress({ stage: 'validating', progress: 70 });

            // Validate data
            const validationResult = skipValidation ?
                { valid: mappedData, invalid: [], errors: [] } :
                this.validateData(mappedData, type);

            if (onProgress) onProgress({ stage: 'processing', progress: 90 });

            // Check for duplicates
            const duplicateCheck = this.checkDuplicates(validationResult.valid, type);

            if (onProgress) onProgress({ stage: 'complete', progress: 100 });

            return {
                success: true,
                fileType,
                totalRecords: parsedData.length,
                validRecords: validationResult.valid.length,
                invalidRecords: validationResult.invalid.length,
                duplicates: duplicateCheck.duplicates.length,
                data: validationResult.valid,
                invalid: validationResult.invalid,
                duplicates: duplicateCheck.duplicates,
                newRecords: duplicateCheck.new,
                errors: validationResult.errors,
                columnMapping: mappedData.columnMapping
            };

        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Preview import without saving
     */
    async previewImport(file, options = {}) {
        const result = await this.importFile(file, { ...options, preview: true });
        return result;
    },

    /**
     * Confirm and save imported data
     */
    async confirmImport(importResult, options = {}) {
        const {
            mergeStrategy = 'skip',
            includeInvalid = false
        } = options;

        if (!importResult.success || !importResult.data) {
            showToast('No valid data to import', 'error');
            return { success: false };
        }

        let imported = 0;
        let updated = 0;
        let skipped = 0;

        const dataToImport = includeInvalid ?
            [...importResult.data, ...importResult.invalid] :
            importResult.data;

        // Process each record
        for (const record of dataToImport) {
            const existingIndex = this.findExistingRecord(record, 'clients');

            if (existingIndex >= 0) {
                switch (mergeStrategy) {
                    case 'overwrite':
                        // Update existing record
                        if (ClientDataService) {
                            ClientDataService.update(existingIndex, record);
                            updated++;
                        }
                        break;
                    case 'merge':
                        // Merge non-empty fields
                        if (ClientDataService) {
                            const existing = ClientDataService.getById(existingIndex);
                            const merged = this.mergeRecords(existing, record);
                            ClientDataService.update(existingIndex, merged);
                            updated++;
                        }
                        break;
                    case 'skip':
                    default:
                        skipped++;
                        break;
                }
            } else {
                // Add new record
                if (ClientDataService) {
                    // Ensure required fields
                    const newRecord = this.enrichRecord(record);
                    ClientDataService.add(newRecord);
                    imported++;
                }
            }
        }

        showToast(`Import complete: ${imported} added, ${updated} updated, ${skipped} skipped`, 'success');

        return {
            success: true,
            imported,
            updated,
            skipped,
            total: dataToImport.length
        };
    },

    // ===========================================
    // FILE READING
    // ===========================================

    detectFileType(file) {
        // Check by MIME type first
        if (this.SUPPORTED_TYPES[file.type]) {
            return this.SUPPORTED_TYPES[file.type];
        }

        // Check by extension
        const ext = file.name.split('.').pop().toLowerCase();
        switch (ext) {
            case 'csv': return 'csv';
            case 'xlsx':
            case 'xls': return 'excel';
            case 'json': return 'json';
            case 'txt': return 'csv';
            default: return null;
        }
    },

    async readFile(file, fileType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));

            if (fileType === 'excel') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    },

    // ===========================================
    // PARSING
    // ===========================================

    parseCSV(content) {
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return [];

        // Detect delimiter
        const delimiter = this.detectDelimiter(lines[0]);

        // Parse headers
        const headers = this.parseCSVLine(lines[0], delimiter);

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i], delimiter);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header.trim()] = values[idx]?.trim() || '';
                });
                data.push(row);
            }
        }

        data.originalHeaders = headers;
        return data;
    },

    parseCSVLine(line, delimiter = ',') {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);

        return values;
    },

    detectDelimiter(line) {
        const delimiters = [',', ';', '\t', '|'];
        let bestDelimiter = ',';
        let maxCount = 0;

        for (const d of delimiters) {
            const count = (line.match(new RegExp(`\\${d}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = d;
            }
        }

        return bestDelimiter;
    },

    parseExcel(arrayBuffer) {
        // Simplified Excel parsing - in production use SheetJS
        // For now, return empty array and show message
        console.log('Excel parsing requires SheetJS library');
        showToast('Excel import works best with CSV files', 'info');
        return [];
    },

    // ===========================================
    // COLUMN MAPPING
    // ===========================================

    autoMapColumns(data, type = 'clients') {
        if (!data || data.length === 0) return data;

        const mappings = type === 'clients' ? this.CLIENT_FIELD_MAPPINGS : {};
        const originalHeaders = data.originalHeaders || Object.keys(data[0]);
        const columnMapping = {};

        // Build reverse mapping
        const headerToField = {};
        for (const [field, variants] of Object.entries(mappings)) {
            for (const variant of variants) {
                headerToField[variant.toLowerCase()] = field;
            }
        }

        // Map columns
        originalHeaders.forEach(header => {
            const normalized = header.toLowerCase().trim();
            columnMapping[header] = headerToField[normalized] || header;
        });

        // Apply mapping to data
        const mappedData = data.map(row => {
            const mappedRow = {};
            for (const [original, mapped] of Object.entries(columnMapping)) {
                if (row[original] !== undefined) {
                    mappedRow[mapped] = this.parseValue(row[original], mapped);
                }
            }
            return mappedRow;
        });

        mappedData.columnMapping = columnMapping;
        return mappedData;
    },

    parseValue(value, field) {
        if (value === null || value === undefined || value === '') return null;

        // Parse based on field type
        switch (field) {
            case 'totalSpent':
            case 'healthScore':
            case 'churnRisk':
            case 'visitCount':
                const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
                return isNaN(num) ? null : num;

            case 'treatments':
                if (Array.isArray(value)) return value;
                return String(value).split(/[;,]/).map(t => t.trim()).filter(Boolean);

            case 'membershipTier':
                const tier = String(value).trim();
                // Normalize tier names
                const tiers = { 'bronze': 'Bronze', 'silver': 'Silver', 'gold': 'Gold', 'platinum': 'Platinum', 'vip': 'VIP' };
                return tiers[tier.toLowerCase()] || tier;

            default:
                return String(value).trim();
        }
    },

    // ===========================================
    // VALIDATION
    // ===========================================

    validateData(data, type = 'clients') {
        const rules = this.VALIDATION_RULES;
        const valid = [];
        const invalid = [];
        const errors = [];

        data.forEach((row, index) => {
            const rowErrors = [];

            for (const [field, rule] of Object.entries(rules)) {
                const value = row[field];

                if (rule.required && !value) {
                    rowErrors.push(`${field} is required`);
                }

                if (value) {
                    if (rule.minLength && String(value).length < rule.minLength) {
                        rowErrors.push(`${field} must be at least ${rule.minLength} characters`);
                    }
                    if (rule.maxLength && String(value).length > rule.maxLength) {
                        rowErrors.push(`${field} must be at most ${rule.maxLength} characters`);
                    }
                    if (rule.pattern && !rule.pattern.test(String(value))) {
                        rowErrors.push(`${field} format is invalid`);
                    }
                    if (rule.min !== undefined && Number(value) < rule.min) {
                        rowErrors.push(`${field} must be at least ${rule.min}`);
                    }
                    if (rule.max !== undefined && Number(value) > rule.max) {
                        rowErrors.push(`${field} must be at most ${rule.max}`);
                    }
                    if (rule.enum && !rule.enum.includes(value)) {
                        rowErrors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
                    }
                }
            }

            if (rowErrors.length > 0) {
                invalid.push({ ...row, _errors: rowErrors, _rowIndex: index });
                errors.push({ row: index + 1, errors: rowErrors });
            } else {
                valid.push(row);
            }
        });

        return { valid, invalid, errors };
    },

    // ===========================================
    // DUPLICATE DETECTION
    // ===========================================

    checkDuplicates(data, type = 'clients') {
        const existing = ClientDataService ? ClientDataService.getAll() : [];
        const duplicates = [];
        const newRecords = [];

        data.forEach(record => {
            const isDuplicate = existing.some(e =>
                (record.email && e.email && record.email.toLowerCase() === e.email.toLowerCase()) ||
                (record.phone && e.phone && this.normalizePhone(record.phone) === this.normalizePhone(e.phone)) ||
                (record.name && e.name && record.name.toLowerCase() === e.name.toLowerCase())
            );

            if (isDuplicate) {
                duplicates.push(record);
            } else {
                newRecords.push(record);
            }
        });

        return { duplicates, new: newRecords };
    },

    normalizePhone(phone) {
        return String(phone).replace(/\D/g, '');
    },

    findExistingRecord(record, type) {
        const existing = ClientDataService ? ClientDataService.getAll() : [];
        return existing.findIndex(e =>
            (record.email && e.email && record.email.toLowerCase() === e.email.toLowerCase()) ||
            (record.id && e.id === record.id)
        );
    },

    mergeRecords(existing, newRecord) {
        const merged = { ...existing };
        for (const [key, value] of Object.entries(newRecord)) {
            if (value !== null && value !== undefined && value !== '') {
                merged[key] = value;
            }
        }
        return merged;
    },

    enrichRecord(record) {
        // Add default values for required fields
        return {
            id: Date.now() + Math.random(),
            healthScore: record.healthScore || 70,
            churnRisk: record.churnRisk || 30,
            membershipTier: record.membershipTier || 'Silver',
            treatments: record.treatments || [],
            totalSpent: record.totalSpent || 0,
            visitCount: record.visitCount || 0,
            ...record
        };
    }
};

// Expose globally
window.ImportService = ImportService;

// UI Helper for file import
window.handleFileImport = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Processing import...', 'info');

    const result = await ImportService.importFile(file, {
        onProgress: (p) => console.log('Import progress:', p)
    });

    if (result.success) {
        // Show import preview modal
        showImportPreviewModal(result);
    } else {
        showToast(`Import failed: ${result.error}`, 'error');
    }

    // Reset input
    event.target.value = '';
};

// Import preview modal
window.showImportPreviewModal = function (result) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'import-preview-modal';

    modal.innerHTML = `
        <div class="modal animate-scale-in" style="max-width: 700px;">
            <div class="modal-header">
                <h2>📥 Import Preview</h2>
                <button class="modal-close" onclick="closeImportModal()">×</button>
            </div>
            <div class="modal-content">
                <div class="import-summary" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="import-stat" style="background: var(--nav-surface, #f5f7fa); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: var(--nav-accent, #4F7DF3);">${result.totalRecords}</div>
                        <div style="font-size: 12px; color: var(--nav-text-secondary, #666);">Total Records</div>
                    </div>
                    <div class="import-stat" style="background: #d1fae5; padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #059669;">${result.validRecords}</div>
                        <div style="font-size: 12px; color: #065f46;">Valid</div>
                    </div>
                    <div class="import-stat" style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #d97706;">${result.duplicates?.length || 0}</div>
                        <div style="font-size: 12px; color: #92400e;">Duplicates</div>
                    </div>
                    <div class="import-stat" style="background: #fee2e2; padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${result.invalidRecords}</div>
                        <div style="font-size: 12px; color: #991b1b;">Invalid</div>
                    </div>
                </div>
                
                ${result.errors.length > 0 ? `
                    <div class="import-errors" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px; color: #991b1b;">⚠️ Validation Errors</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #7f1d1d; max-height: 100px; overflow-y: auto;">
                            ${result.errors.slice(0, 5).map(e => `<li>Row ${e.row}: ${e.errors.join(', ')}</li>`).join('')}
                            ${result.errors.length > 5 ? `<li>...and ${result.errors.length - 5} more errors</li>` : ''}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="import-options" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Duplicate Handling:</label>
                    <select id="import-merge-strategy" class="input" style="width: 100%;">
                        <option value="skip">Skip duplicates (keep existing)</option>
                        <option value="overwrite">Overwrite duplicates (use imported)</option>
                        <option value="merge">Merge (fill empty fields only)</option>
                    </select>
                </div>
                
                <div class="import-preview-table" style="max-height: 200px; overflow: auto; border: 1px solid var(--nav-border, #e5e7eb); border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: var(--nav-bg-tertiary, #f3f4f6);">
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid var(--nav-border, #e5e7eb);">Name</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid var(--nav-border, #e5e7eb);">Email</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid var(--nav-border, #e5e7eb);">Membership</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid var(--nav-border, #e5e7eb);">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.data.slice(0, 10).map(r => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid var(--nav-border, #e5e7eb);">${r.name || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid var(--nav-border, #e5e7eb);">${r.email || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid var(--nav-border, #e5e7eb);">${r.membershipTier || '-'}</td>
                                    <td style="padding: 8px; border-bottom: 1px solid var(--nav-border, #e5e7eb);"><span style="color: #059669;">✓ Valid</span></td>
                                </tr>
                            `).join('')}
                            ${result.data.length > 10 ? `<tr><td colspan="4" style="padding: 8px; text-align: center; color: #666;">...and ${result.data.length - 10} more records</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmFileImport()">
                    Import ${result.validRecords} Records
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.pendingImportResult = result;
};

window.closeImportModal = function () {
    const modal = document.getElementById('import-preview-modal');
    if (modal) modal.remove();
    window.pendingImportResult = null;
};

window.confirmFileImport = async function () {
    if (!window.pendingImportResult) return;

    const strategy = document.getElementById('import-merge-strategy')?.value || 'skip';

    const result = await ImportService.confirmImport(window.pendingImportResult, {
        mergeStrategy: strategy
    });

    closeImportModal();

    if (result.success) {
        // Refresh the current page
        if (typeof navigateTo === 'function') {
            navigateTo('/clients');
        }
    }
};
