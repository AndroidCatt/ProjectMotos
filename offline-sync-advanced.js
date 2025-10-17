/**
 * Sistema de Sincronización Offline Avanzado v15.0
 * Sincronización automática cuando hay conexión
 *
 * Características:
 * - Detección de conexión en tiempo real
 * - Cola de operaciones pendientes
 * - Sincronización automática al reconectar
 * - Resolución de conflictos
 * - Background sync (Service Worker)
 * - Indicador visual de estado
 */

class OfflineSyncAdvanced {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = this.loadSyncQueue();
        this.conflictResolver = null;
        this.syncInProgress = false;
        this.init();
    }

    init() {
        console.log('Offline Sync Advanced v15.0 inicializado');

        this.setupConnectionListeners();
        this.setupBackgroundSync();
        this.showConnectionStatus();

        // Intentar sincronizar si hay items en cola y estamos online
        if (this.isOnline && this.syncQueue.length > 0) {
            this.syncAll();
        }
    }

    // ====================================
    // DETECCIÓN DE CONEXIÓN
    // ====================================

    setupConnectionListeners() {
        window.addEventListener('online', () => {
            console.log('Conexión restaurada');
            this.isOnline = true;
            this.onConnectionRestored();
        });

        window.addEventListener('offline', () => {
            console.log('Conexión perdida');
            this.isOnline = false;
            this.onConnectionLost();
        });

        // Monitorear cambios en la calidad de conexión
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.onConnectionChange();
            });
        }
    }

    onConnectionRestored() {
        this.showNotification('🌐 Conexión restaurada', 'success');
        this.updateConnectionIndicator(true);

        // Sincronizar automáticamente
        setTimeout(() => {
            this.syncAll();
        }, 1000);
    }

    onConnectionLost() {
        this.showNotification('📵 Sin conexión - Modo offline activado', 'warning');
        this.updateConnectionIndicator(false);
    }

    onConnectionChange() {
        const connection = navigator.connection;
        console.log('Conexión cambió:', {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        });

        // Si la conexión es lenta, avisar al usuario
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            this.showNotification('🐌 Conexión lenta detectada', 'warning');
        }
    }

    // ====================================
    // COLA DE SINCRONIZACIÓN
    // ====================================

    addToSyncQueue(operation) {
        const item = {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            operation: operation.type,
            data: operation.data,
            endpoint: operation.endpoint,
            method: operation.method || 'POST',
            retries: 0,
            maxRetries: 3
        };

        this.syncQueue.push(item);
        this.saveSyncQueue();

        console.log('Operación agregada a la cola:', item);

        // Si estamos online, sincronizar inmediatamente
        if (this.isOnline) {
            this.syncItem(item);
        } else {
            this.showNotification('Operación guardada - se sincronizará al reconectar', 'info');
        }

        return item;
    }

    async syncItem(item) {
        if (!this.isOnline) {
            console.log('Sin conexión, operación en cola:', item.id);
            return false;
        }

        try {
            console.log('Sincronizando operación:', item.id);

            const response = await fetch(item.endpoint, {
                method: item.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item.data)
            });

            if (response.ok) {
                // Sincronización exitosa
                this.removeFromQueue(item.id);
                console.log('Operación sincronizada:', item.id);
                return true;
            } else {
                // Error del servidor
                item.retries++;
                if (item.retries >= item.maxRetries) {
                    this.handleFailedSync(item);
                }
                this.saveSyncQueue();
                return false;
            }
        } catch (error) {
            // Error de red
            console.error('Error al sincronizar:', error);
            item.retries++;
            this.saveSyncQueue();
            return false;
        }
    }

    async syncAll() {
        if (this.syncInProgress) {
            console.log('Sincronización ya en progreso');
            return;
        }

        if (this.syncQueue.length === 0) {
            console.log('No hay operaciones pendientes');
            return;
        }

        this.syncInProgress = true;
        this.showSyncProgress();

        const results = {
            success: 0,
            failed: 0,
            total: this.syncQueue.length
        };

        for (const item of [...this.syncQueue]) {
            const success = await this.syncItem(item);
            if (success) {
                results.success++;
            } else {
                results.failed++;
            }
        }

        this.syncInProgress = false;
        this.hideSyncProgress();

        console.log('Sincronización completa:', results);

        if (results.success > 0) {
            this.showNotification(
                `✅ ${results.success} operación(es) sincronizada(s)`,
                'success'
            );
        }

        if (results.failed > 0) {
            this.showNotification(
                `⚠️ ${results.failed} operación(es) pendiente(s)`,
                'warning'
            );
        }
    }

    removeFromQueue(itemId) {
        this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
        this.saveSyncQueue();
    }

    handleFailedSync(item) {
        console.error('Operación fallida después de max reintentos:', item);

        // Remover de la cola
        this.removeFromQueue(item.id);

        // Guardar en cola de fallidos para revisión manual
        this.saveFailedOperation(item);

        this.showNotification(
            `❌ Operación fallida: ${item.operation}`,
            'error'
        );
    }

    loadSyncQueue() {
        const stored = localStorage.getItem('syncQueue');
        return stored ? JSON.parse(stored) : [];
    }

    saveSyncQueue() {
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    saveFailedOperation(item) {
        const failed = JSON.parse(localStorage.getItem('failedOperations') || '[]');
        failed.push(item);
        localStorage.setItem('failedOperations', JSON.stringify(failed));
    }

    // ====================================
    // BACKGROUND SYNC (SERVICE WORKER)
    // ====================================

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
                // Registrar background sync
                this.registerBackgroundSync(registration);
            });
        }
    }

    async registerBackgroundSync(registration) {
        try {
            await registration.sync.register('sync-data');
            console.log('Background sync registrado');
        } catch (error) {
            console.error('Error al registrar background sync:', error);
        }
    }

    // ====================================
    // RESOLUCIÓN DE CONFLICTOS
    // ====================================

    detectConflict(localData, serverData) {
        // Comparar timestamps
        if (localData.updatedAt && serverData.updatedAt) {
            return new Date(localData.updatedAt) !== new Date(serverData.updatedAt);
        }

        // Comparar contenido
        return JSON.stringify(localData) !== JSON.stringify(serverData);
    }

    async resolveConflict(localData, serverData, type) {
        if (this.conflictResolver) {
            return await this.conflictResolver(localData, serverData, type);
        }

        // Estrategia por defecto: servidor gana
        return {
            resolved: serverData,
            strategy: 'server-wins'
        };
    }

    setConflictResolver(resolver) {
        this.conflictResolver = resolver;
    }

    // ====================================
    // INDICADORES VISUALES
    // ====================================

    showConnectionStatus() {
        // Agregar indicador de conexión
        if (!document.getElementById('connection-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'connection-indicator';
            indicator.className = this.isOnline ? 'online' : 'offline';
            indicator.innerHTML = `
                <div class="indicator-dot"></div>
                <div class="indicator-text">${this.isOnline ? 'Online' : 'Offline'}</div>
            `;

            document.body.appendChild(indicator);
        }

        // Mostrar cola pendiente si hay
        if (this.syncQueue.length > 0) {
            this.showSyncBadge(this.syncQueue.length);
        }
    }

    updateConnectionIndicator(isOnline) {
        const indicator = document.getElementById('connection-indicator');
        if (indicator) {
            indicator.className = isOnline ? 'online' : 'offline';
            indicator.querySelector('.indicator-text').textContent = isOnline ? 'Online' : 'Offline';
        }
    }

    showSyncBadge(count) {
        let badge = document.getElementById('sync-badge');

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'sync-badge';
            badge.className = 'sync-badge';
            document.body.appendChild(badge);
        }

        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    showSyncProgress() {
        let progress = document.getElementById('sync-progress');

        if (!progress) {
            progress = document.createElement('div');
            progress.id = 'sync-progress';
            progress.className = 'sync-progress';
            progress.innerHTML = `
                <div class="sync-spinner"></div>
                <div class="sync-text">Sincronizando...</div>
            `;
            document.body.appendChild(progress);
        }

        progress.style.display = 'flex';
    }

    hideSyncProgress() {
        const progress = document.getElementById('sync-progress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `sync-notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ====================================
    // API PÚBLICA
    // ====================================

    getPendingCount() {
        return this.syncQueue.length;
    }

    getConnectionInfo() {
        return {
            isOnline: this.isOnline,
            type: navigator.connection?.effectiveType || 'unknown',
            downlink: navigator.connection?.downlink || 0,
            rtt: navigator.connection?.rtt || 0,
            saveData: navigator.connection?.saveData || false,
            pendingOps: this.syncQueue.length
        };
    }

    clearQueue() {
        this.syncQueue = [];
        this.saveSyncQueue();
        this.showSyncBadge(0);
    }

    retrySingle(itemId) {
        const item = this.syncQueue.find(i => i.id === itemId);
        if (item) {
            item.retries = 0; // Reset retries
            return this.syncItem(item);
        }
        return Promise.resolve(false);
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.offlineSync = new OfflineSyncAdvanced();
}
