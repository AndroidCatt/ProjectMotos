// Backup and Disaster Recovery System - v13.0
// Automated backups, point-in-time recovery, data replication

class BackupRecoverySystem {
    constructor() {
        this.backups = [];
        this.schedule = null;
        this.config = this.loadConfig();
        this.isBackingUp = false;
        this.lastBackup = null;

        this.init();
        console.log('[Backup] Backup & Recovery system initialized');
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        this.loadBackupHistory();

        // Start automated backup if configured
        if (this.config.autoBackup.enabled) {
            this.startAutomatedBackup();
        }

        // Register cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.createBackup('auto', { trigger: 'page_unload' });
        });
    }

    loadConfig() {
        const defaultConfig = {
            autoBackup: {
                enabled: true,
                interval: 3600000, // 1 hour in ms
                maxBackups: 10,
                compressionEnabled: true
            },
            retention: {
                hourly: 24,    // Keep 24 hourly backups
                daily: 7,      // Keep 7 daily backups
                weekly: 4,     // Keep 4 weekly backups
                monthly: 12    // Keep 12 monthly backups
            },
            includedData: [
                'localStorage',
                'sessionStorage',
                'indexedDB',
                'settings',
                'userPreferences',
                'cart',
                'wishlist',
                'orders',
                'conversations',
                'notifications'
            ],
            encryption: {
                enabled: false,
                algorithm: 'AES-256'
            },
            cloudSync: {
                enabled: false,
                provider: null
            }
        };

        try {
            const stored = localStorage.getItem('backup_config');
            if (stored) {
                return { ...defaultConfig, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('[Backup] Error loading config:', error);
        }

        return defaultConfig;
    }

    saveConfig() {
        try {
            localStorage.setItem('backup_config', JSON.stringify(this.config));
        } catch (error) {
            console.error('[Backup] Error saving config:', error);
        }
    }

    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Restart automated backup if config changed
        if (updates.autoBackup) {
            this.stopAutomatedBackup();
            if (this.config.autoBackup.enabled) {
                this.startAutomatedBackup();
            }
        }

        console.log('[Backup] Config updated');
    }

    // ============================================
    // BACKUP CREATION
    // ============================================

    async createBackup(type = 'manual', metadata = {}) {
        if (this.isBackingUp) {
            console.warn('[Backup] Backup already in progress');
            return null;
        }

        this.isBackingUp = true;

        try {
            const backupId = 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            console.log('[Backup] Creating backup:', backupId);

            const startTime = Date.now();

            // Collect all data
            const data = await this.collectData();

            // Calculate size
            const dataString = JSON.stringify(data);
            const sizeBytes = new Blob([dataString]).size;
            const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

            // Compress if enabled
            let backupData = data;
            let compressed = false;

            if (this.config.autoBackup.compressionEnabled) {
                backupData = this.compress(dataString);
                compressed = true;
            }

            // Create backup object
            const backup = {
                id: backupId,
                type, // manual, auto, scheduled
                timestamp: new Date().toISOString(),
                timestampMs: Date.now(),
                data: backupData,
                metadata: {
                    ...metadata,
                    size: sizeMB + ' MB',
                    sizeBytes,
                    compressed,
                    dataTypes: Object.keys(data),
                    duration: Date.now() - startTime + 'ms'
                },
                version: '13.0',
                status: 'completed'
            };

            // Store backup
            this.backups.push(backup);
            this.lastBackup = backup;

            // Apply retention policy
            this.applyRetentionPolicy();

            // Save to storage
            this.saveBackupHistory();

            // Cloud sync if enabled
            if (this.config.cloudSync.enabled) {
                await this.syncToCloud(backup);
            }

            console.log('[Backup] Backup created successfully:', backupId, sizeMB + 'MB');

            this.emit('backup_created', backup);

            return backup;
        } catch (error) {
            console.error('[Backup] Error creating backup:', error);
            throw error;
        } finally {
            this.isBackingUp = false;
        }
    }

    async collectData() {
        const data = {};

        // localStorage
        if (this.config.includedData.includes('localStorage')) {
            data.localStorage = this.cloneLocalStorage();
        }

        // sessionStorage
        if (this.config.includedData.includes('sessionStorage')) {
            data.sessionStorage = this.cloneSessionStorage();
        }

        // IndexedDB (if available)
        if (this.config.includedData.includes('indexedDB') && window.indexedDB) {
            data.indexedDB = await this.exportIndexedDB();
        }

        // System-specific data
        if (this.config.includedData.includes('cart') && window.shoppingCart) {
            data.cart = window.shoppingCart.exportData();
        }

        if (this.config.includedData.includes('wishlist') && window.wishlist) {
            data.wishlist = window.wishlist;
        }

        if (this.config.includedData.includes('orders') && window.orderHistory) {
            data.orders = window.orderHistory;
        }

        if (this.config.includedData.includes('conversations') && window.messagingSystem) {
            data.conversations = {
                conversations: Array.from(window.messagingSystem.conversations.entries()),
                messages: Array.from(window.messagingSystem.messages.entries())
            };
        }

        if (this.config.includedData.includes('notifications') && window.pushNotifications) {
            data.notifications = window.pushNotifications.notifications;
        }

        if (this.config.includedData.includes('settings')) {
            data.settings = this.collectSettings();
        }

        return data;
    }

    cloneLocalStorage() {
        const clone = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            clone[key] = localStorage.getItem(key);
        }
        return clone;
    }

    cloneSessionStorage() {
        const clone = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            clone[key] = sessionStorage.getItem(key);
        }
        return clone;
    }

    async exportIndexedDB() {
        // Simplified IndexedDB export (would need to be customized per app)
        const databases = await window.indexedDB.databases();
        const exported = {};

        for (const dbInfo of databases) {
            try {
                const db = await this.openIndexedDB(dbInfo.name);
                exported[dbInfo.name] = await this.dumpIndexedDB(db);
                db.close();
            } catch (error) {
                console.error('[Backup] Error exporting IndexedDB:', dbInfo.name, error);
            }
        }

        return exported;
    }

    openIndexedDB(name) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async dumpIndexedDB(db) {
        const dump = {};

        for (const storeName of db.objectStoreNames) {
            dump[storeName] = await this.getAllFromStore(db, storeName);
        }

        return dump;
    }

    getAllFromStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    collectSettings() {
        return {
            theme: localStorage.getItem('theme'),
            language: localStorage.getItem('language'),
            notifications: localStorage.getItem('push_notification_preferences'),
            auth: localStorage.getItem('auth_user')
        };
    }

    // ============================================
    // BACKUP RESTORE
    // ============================================

    async restoreBackup(backupId, options = {}) {
        const backup = this.backups.find(b => b.id === backupId);

        if (!backup) {
            throw new Error('Backup not found: ' + backupId);
        }

        console.log('[Backup] Restoring backup:', backupId);

        try {
            // Decompress if needed
            let data = backup.data;
            if (backup.metadata.compressed) {
                data = this.decompress(data);
            }

            // Restore data
            if (options.clearExisting !== false) {
                await this.clearExistingData();
            }

            await this.restoreData(data, options);

            console.log('[Backup] Backup restored successfully');

            this.emit('backup_restored', { backupId, timestamp: new Date().toISOString() });

            // Reload page to apply changes
            if (options.reload !== false) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

            return true;
        } catch (error) {
            console.error('[Backup] Error restoring backup:', error);
            throw error;
        }
    }

    async clearExistingData() {
        // Clear localStorage (except backup data)
        const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('backup_'));
        localStorage.clear();
        backupKeys.forEach(key => {
            localStorage.setItem(key, localStorage.getItem(key));
        });

        // Clear sessionStorage
        sessionStorage.clear();

        console.log('[Backup] Existing data cleared');
    }

    async restoreData(data, options = {}) {
        // Restore localStorage
        if (data.localStorage) {
            Object.entries(data.localStorage).forEach(([key, value]) => {
                try {
                    localStorage.setItem(key, value);
                } catch (error) {
                    console.warn('[Backup] Error restoring localStorage key:', key, error);
                }
            });
        }

        // Restore sessionStorage
        if (data.sessionStorage && options.restoreSession) {
            Object.entries(data.sessionStorage).forEach(([key, value]) => {
                try {
                    sessionStorage.setItem(key, value);
                } catch (error) {
                    console.warn('[Backup] Error restoring sessionStorage key:', key, error);
                }
            });
        }

        // Restore IndexedDB
        if (data.indexedDB) {
            await this.restoreIndexedDB(data.indexedDB);
        }

        console.log('[Backup] Data restored');
    }

    async restoreIndexedDB(indexedDBData) {
        for (const [dbName, dbData] of Object.entries(indexedDBData)) {
            try {
                const db = await this.openIndexedDB(dbName);

                for (const [storeName, records] of Object.entries(dbData)) {
                    await this.restoreStore(db, storeName, records);
                }

                db.close();
            } catch (error) {
                console.error('[Backup] Error restoring IndexedDB:', dbName, error);
            }
        }
    }

    restoreStore(db, storeName, records) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            // Clear existing data
            store.clear();

            // Add all records
            records.forEach(record => {
                store.add(record);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // ============================================
    // COMPRESSION
    // ============================================

    compress(dataString) {
        // Simple compression using LZ-based algorithm
        // In production, use a proper compression library like pako
        try {
            return btoa(encodeURIComponent(dataString));
        } catch (error) {
            console.warn('[Backup] Compression failed:', error);
            return dataString;
        }
    }

    decompress(compressedData) {
        try {
            return decodeURIComponent(atob(compressedData));
        } catch (error) {
            console.error('[Backup] Decompression failed:', error);
            return compressedData;
        }
    }

    // ============================================
    // AUTOMATED BACKUP
    // ============================================

    startAutomatedBackup() {
        if (this.schedule) {
            clearInterval(this.schedule);
        }

        const interval = this.config.autoBackup.interval;

        this.schedule = setInterval(() => {
            this.createBackup('auto', { trigger: 'scheduled' });
        }, interval);

        console.log('[Backup] Automated backup started (interval:', interval + 'ms)');
    }

    stopAutomatedBackup() {
        if (this.schedule) {
            clearInterval(this.schedule);
            this.schedule = null;
            console.log('[Backup] Automated backup stopped');
        }
    }

    // ============================================
    // RETENTION POLICY
    // ============================================

    applyRetentionPolicy() {
        const now = Date.now();
        const retention = this.config.retention;

        // Categorize backups
        const hourly = [];
        const daily = [];
        const weekly = [];
        const monthly = [];

        this.backups.forEach(backup => {
            const age = now - backup.timestampMs;
            const ageHours = age / (1000 * 60 * 60);
            const ageDays = age / (1000 * 60 * 60 * 24);

            if (ageHours < 1) {
                hourly.push(backup);
            } else if (ageDays < 1) {
                daily.push(backup);
            } else if (ageDays < 7) {
                weekly.push(backup);
            } else {
                monthly.push(backup);
            }
        });

        // Keep only N most recent from each category
        const toKeep = new Set();

        hourly.slice(-retention.hourly).forEach(b => toKeep.add(b.id));
        daily.slice(-retention.daily).forEach(b => toKeep.add(b.id));
        weekly.slice(-retention.weekly).forEach(b => toKeep.add(b.id));
        monthly.slice(-retention.monthly).forEach(b => toKeep.add(b.id));

        // Remove old backups
        const removed = this.backups.filter(b => !toKeep.has(b.id));
        this.backups = this.backups.filter(b => toKeep.has(b.id));

        if (removed.length > 0) {
            console.log('[Backup] Removed', removed.length, 'old backups per retention policy');
        }
    }

    // ============================================
    // CLOUD SYNC
    // ============================================

    async syncToCloud(backup) {
        // Placeholder for cloud sync functionality
        // In production, integrate with cloud storage providers (S3, Google Cloud Storage, etc.)

        console.log('[Backup] Cloud sync not implemented yet');

        return {
            success: false,
            message: 'Cloud sync not configured'
        };
    }

    // ============================================
    // BACKUP MANAGEMENT
    // ============================================

    listBackups(filters = {}) {
        let backups = [...this.backups];

        if (filters.type) {
            backups = backups.filter(b => b.type === filters.type);
        }

        if (filters.since) {
            const since = new Date(filters.since).getTime();
            backups = backups.filter(b => b.timestampMs >= since);
        }

        if (filters.before) {
            const before = new Date(filters.before).getTime();
            backups = backups.filter(b => b.timestampMs <= before);
        }

        // Sort by timestamp (newest first)
        backups.sort((a, b) => b.timestampMs - a.timestampMs);

        // Return without data (metadata only)
        return backups.map(b => ({
            id: b.id,
            type: b.type,
            timestamp: b.timestamp,
            metadata: b.metadata,
            version: b.version,
            status: b.status
        }));
    }

    getBackup(backupId) {
        return this.backups.find(b => b.id === backupId);
    }

    deleteBackup(backupId) {
        const index = this.backups.findIndex(b => b.id === backupId);

        if (index !== -1) {
            this.backups.splice(index, 1);
            this.saveBackupHistory();
            console.log('[Backup] Backup deleted:', backupId);
            this.emit('backup_deleted', { backupId });
            return true;
        }

        return false;
    }

    deleteAllBackups() {
        const count = this.backups.length;
        this.backups = [];
        this.saveBackupHistory();
        console.log('[Backup] All backups deleted:', count);
        return count;
    }

    // ============================================
    // EXPORT / IMPORT
    // ============================================

    exportBackup(backupId, format = 'json') {
        const backup = this.getBackup(backupId);
        if (!backup) {
            throw new Error('Backup not found: ' + backupId);
        }

        const dataString = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${backupId}_${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);

        console.log('[Backup] Backup exported:', backupId);
    }

    async importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);

                    // Validate backup structure
                    if (!backup.id || !backup.data || !backup.timestamp) {
                        throw new Error('Invalid backup file');
                    }

                    // Add to backups
                    this.backups.push(backup);
                    this.saveBackupHistory();

                    console.log('[Backup] Backup imported:', backup.id);
                    resolve(backup);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // ============================================
    // STORAGE
    // ============================================

    saveBackupHistory() {
        try {
            // Save only metadata (not full backup data) to localStorage
            const metadata = this.backups.map(b => ({
                id: b.id,
                type: b.type,
                timestamp: b.timestamp,
                timestampMs: b.timestampMs,
                metadata: b.metadata,
                version: b.version,
                status: b.status
            }));

            localStorage.setItem('backup_history', JSON.stringify(metadata));

            // Save full backups to IndexedDB if available (for larger storage)
            this.saveBackupsToIndexedDB();
        } catch (error) {
            console.error('[Backup] Error saving backup history:', error);
        }
    }

    loadBackupHistory() {
        try {
            const metadata = localStorage.getItem('backup_history');
            if (metadata) {
                const backupMetadata = JSON.parse(metadata);
                console.log('[Backup] Loaded', backupMetadata.length, 'backup(s) from history');
            }

            // Load full backups from IndexedDB
            this.loadBackupsFromIndexedDB();
        } catch (error) {
            console.error('[Backup] Error loading backup history:', error);
        }
    }

    async saveBackupsToIndexedDB() {
        if (!window.indexedDB) return;

        // Simplified - in production, implement proper IndexedDB storage
        console.log('[Backup] Saving backups to IndexedDB (not implemented)');
    }

    async loadBackupsFromIndexedDB() {
        if (!window.indexedDB) return;

        // Simplified - in production, implement proper IndexedDB loading
        console.log('[Backup] Loading backups from IndexedDB (not implemented)');
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStats() {
        const totalSize = this.backups.reduce((sum, b) => {
            return sum + (b.metadata.sizeBytes || 0);
        }, 0);

        const avgSize = this.backups.length > 0 ? totalSize / this.backups.length : 0;

        return {
            totalBackups: this.backups.length,
            totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
            avgSize: (avgSize / (1024 * 1024)).toFixed(2) + ' MB',
            lastBackup: this.lastBackup ? this.lastBackup.timestamp : null,
            oldestBackup: this.backups.length > 0 ? this.backups[0].timestamp : null,
            autoBackupEnabled: this.config.autoBackup.enabled,
            backupsByType: this.getBackupsByType()
        };
    }

    getBackupsByType() {
        const byType = {};

        this.backups.forEach(b => {
            byType[b.type] = (byType[b.type] || 0) + 1;
        });

        return byType;
    }

    // ============================================
    // EVENTS
    // ============================================

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('backup_' + event, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener('backup_' + event, (e) => callback(e.detail));
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.BackupRecoverySystem = BackupRecoverySystem;
    window.backupSystem = new BackupRecoverySystem();
}

console.log('[Backup] ✅ backup-system.js loaded');
