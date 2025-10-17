// Advanced Monitoring System - v12.0 Final
// Prometheus metrics, Health checks, Performance monitoring

class AdvancedMonitoringSystem {
    constructor() {
        this.metrics = {
            requests: { total: 0, success: 0, errors: 0 },
            latency: [],
            memory: [],
            cpu: [],
            activeUsers: 0,
            websocketConnections: 0
        };

        this.healthChecks = [];
        this.alerts = [];
        this.performanceMarks = {};

        this.startMonitoring();
        console.log('[Monitoring] Advanced monitoring system initialized');
    }

    // ============================================
    // METRICS COLLECTION
    // ============================================

    startMonitoring() {
        // Monitorear cada 5 segundos
        setInterval(() => {
            this.collectSystemMetrics();
        }, 5000);

        // Performance observer
        if (window.PerformanceObserver) {
            this.setupPerformanceObserver();
        }

        // Error tracking
        window.addEventListener('error', (e) => this.trackError(e));
        window.addEventListener('unhandledrejection', (e) => this.trackPromiseRejection(e));
    }

    collectSystemMetrics() {
        // Memory usage
        if (performance.memory) {
            const memoryUsage = {
                used: performance.memory.usedJSHeapSize / (1024 * 1024),
                total: performance.memory.totalJSHeapSize / (1024 * 1024),
                limit: performance.memory.jsHeapSizeLimit / (1024 * 1024),
                timestamp: Date.now()
            };

            this.metrics.memory.push(memoryUsage);
            if (this.metrics.memory.length > 100) {
                this.metrics.memory.shift();
            }

            // Alert si uso de memoria > 90%
            const usage = (memoryUsage.used / memoryUsage.limit) * 100;
            if (usage > 90) {
                this.createAlert('high_memory', `Uso de memoria alto: ${usage.toFixed(1)}%`, 'warning');
            }
        }

        // Contar usuarios activos (desde localStorage)
        const activeUsers = this.countActiveUsers();
        this.metrics.activeUsers = activeUsers;

        // WebSocket connections
        if (window.videoCallSystem?.callState === 'in-call') {
            this.metrics.websocketConnections++;
        }
    }

    setupPerformanceObserver() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.trackPerformanceEntry(entry);
            }
        });

        observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
    }

    trackPerformanceEntry(entry) {
        if (entry.entryType === 'navigation') {
            this.metrics.pageLoad = {
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                loadComplete: entry.loadEventEnd - entry.loadEventStart,
                domInteractive: entry.domInteractive,
                timestamp: Date.now()
            };
        } else if (entry.entryType === 'resource') {
            // Track resource loading times
            if (entry.duration > 1000) {
                this.createAlert('slow_resource', `Recurso lento: ${entry.name} (${entry.duration}ms)`, 'info');
            }
        }
    }

    // ============================================
    // REQUEST TRACKING
    // ============================================

    trackRequest(method, url, success = true, duration = 0) {
        this.metrics.requests.total++;

        if (success) {
            this.metrics.requests.success++;
        } else {
            this.metrics.requests.errors++;
        }

        this.metrics.latency.push({
            method,
            url,
            duration,
            success,
            timestamp: Date.now()
        });

        // Mantener solo últimos 1000
        if (this.metrics.latency.length > 1000) {
            this.metrics.latency.shift();
        }

        // Alert si latencia > 3 segundos
        if (duration > 3000) {
            this.createAlert('high_latency', `Request lento: ${url} (${duration}ms)`, 'warning');
        }
    }

    trackError(error) {
        this.createAlert('javascript_error', `Error: ${error.message}`, 'error');

        // Enviar a sistema de logging (ej: Sentry)
        console.error('[Monitoring] Error tracked:', error);
    }

    trackPromiseRejection(event) {
        this.createAlert('unhandled_rejection', `Promise rejection: ${event.reason}`, 'error');
    }

    // ============================================
    // HEALTH CHECKS
    // ============================================

    registerHealthCheck(name, checkFunction) {
        this.healthChecks.push({
            name,
            check: checkFunction,
            lastRun: null,
            status: 'unknown'
        });
    }

    async runHealthChecks() {
        const results = [];

        for (const healthCheck of this.healthChecks) {
            try {
                const result = await healthCheck.check();
                healthCheck.status = result.healthy ? 'healthy' : 'unhealthy';
                healthCheck.lastRun = Date.now();

                results.push({
                    name: healthCheck.name,
                    healthy: result.healthy,
                    message: result.message,
                    timestamp: healthCheck.lastRun
                });

                if (!result.healthy) {
                    this.createAlert('health_check_failed', `Health check failed: ${healthCheck.name}`, 'error');
                }
            } catch (error) {
                healthCheck.status = 'error';
                results.push({
                    name: healthCheck.name,
                    healthy: false,
                    message: error.message
                });
            }
        }

        return {
            overall: results.every(r => r.healthy),
            checks: results,
            timestamp: Date.now()
        };
    }

    // ============================================
    // ALERTS
    // ============================================

    createAlert(type, message, severity = 'info') {
        const alert = {
            id: 'alert_' + Date.now(),
            type,
            message,
            severity,
            timestamp: Date.now(),
            acknowledged: false
        };

        this.alerts.push(alert);

        // Mantener solo últimos 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }

        // Emitir evento
        this.emit('alert', alert);

        console.log(`[Monitoring] Alert [${severity}]: ${message}`);

        return alert;
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }

    getActiveAlerts() {
        return this.alerts.filter(a => !a.acknowledged);
    }

    // ============================================
    // PROMETHEUS METRICS
    // ============================================

    getPrometheusMetrics() {
        const metrics = [];

        // Requests
        metrics.push(`# HELP requests_total Total number of requests`);
        metrics.push(`# TYPE requests_total counter`);
        metrics.push(`requests_total{status="success"} ${this.metrics.requests.success}`);
        metrics.push(`requests_total{status="error"} ${this.metrics.requests.errors}`);

        // Active users
        metrics.push(`# HELP active_users Number of active users`);
        metrics.push(`# TYPE active_users gauge`);
        metrics.push(`active_users ${this.metrics.activeUsers}`);

        // Memory
        if (this.metrics.memory.length > 0) {
            const latest = this.metrics.memory[this.metrics.memory.length - 1];
            metrics.push(`# HELP memory_usage_mb Memory usage in MB`);
            metrics.push(`# TYPE memory_usage_mb gauge`);
            metrics.push(`memory_usage_mb ${latest.used.toFixed(2)}`);
        }

        // Latency
        if (this.metrics.latency.length > 0) {
            const avgLatency = this.metrics.latency.reduce((sum, l) => sum + l.duration, 0) / this.metrics.latency.length;
            metrics.push(`# HELP request_duration_ms Average request duration in ms`);
            metrics.push(`# TYPE request_duration_ms gauge`);
            metrics.push(`request_duration_ms ${avgLatency.toFixed(2)}`);
        }

        return metrics.join('\\n');
    }

    // ============================================
    // DASHBOARD DATA
    // ============================================

    getDashboardData() {
        const now = Date.now();
        const last5Min = now - (5 * 60 * 1000);

        // Recent latency
        const recentLatency = this.metrics.latency.filter(l => l.timestamp >= last5Min);
        const avgLatency = recentLatency.length > 0
            ? recentLatency.reduce((sum, l) => sum + l.duration, 0) / recentLatency.length
            : 0;

        // Error rate
        const recentErrors = this.metrics.latency.filter(l => l.timestamp >= last5Min && !l.success).length;
        const errorRate = recentLatency.length > 0 ? (recentErrors / recentLatency.length) * 100 : 0;

        // Memory trend
        const memoryTrend = this.metrics.memory.slice(-20);

        return {
            summary: {
                totalRequests: this.metrics.requests.total,
                successRate: ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) + '%',
                errorRate: errorRate.toFixed(2) + '%',
                avgLatency: avgLatency.toFixed(2) + 'ms',
                activeUsers: this.metrics.activeUsers,
                activeAlerts: this.getActiveAlerts().length
            },
            memory: memoryTrend,
            latency: recentLatency.slice(-50),
            alerts: this.getActiveAlerts().slice(-10)
        };
    }

    // ============================================
    // UTILITIES
    // ============================================

    countActiveUsers() {
        // Contar usuarios activos en los últimos 5 minutos
        const presence = JSON.parse(localStorage.getItem('realtime_presence') || '{}');
        const now = Date.now();
        const fiveMinAgo = now - (5 * 60 * 1000);

        return Object.values(presence).filter(p => {
            return new Date(p.lastSeen).getTime() >= fiveMinAgo;
        }).length;
    }

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('monitoring_' + event, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener('monitoring_' + event, (e) => callback(e.detail));
    }

    // ============================================
    // EXPORT
    // ============================================

    exportMetrics(format = 'json') {
        if (format === 'prometheus') {
            return this.getPrometheusMetrics();
        }

        return JSON.stringify({
            metrics: this.metrics,
            alerts: this.alerts,
            healthChecks: this.healthChecks,
            timestamp: Date.now()
        }, null, 2);
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AdvancedMonitoringSystem = AdvancedMonitoringSystem;
    window.monitoring = new AdvancedMonitoringSystem();

    // Registrar health checks por defecto
    window.monitoring.registerHealthCheck('localStorage', () => {
        try {
            localStorage.setItem('health_check', 'ok');
            localStorage.removeItem('health_check');
            return { healthy: true, message: 'localStorage is working' };
        } catch {
            return { healthy: false, message: 'localStorage is not available' };
        }
    });

    window.monitoring.registerHealthCheck('network', async () => {
        return { healthy: navigator.onLine, message: navigator.onLine ? 'Online' : 'Offline' };
    });
}
