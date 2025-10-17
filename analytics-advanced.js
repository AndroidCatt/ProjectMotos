// Advanced Analytics System - Sistema de Analíticas Avanzadas v9.0
// Tracking de comportamiento, embudos de conversión, A/B testing, heatmaps

class AdvancedAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = this.loadEvents();
        this.funnels = this.defineFunnels();
        this.experiments = this.loadExperiments();
        this.userSegments = this.loadUserSegments();

        this.startSession();
        this.trackPageView();
        this.setupAutoTracking();
    }

    // ============================================
    // SESIÓN Y TRACKING BÁSICO
    // ============================================

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    startSession() {
        this.sessionStart = Date.now();
        this.trackEvent('session_start', {
            sessionId: this.sessionId,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    endSession() {
        const duration = Date.now() - this.sessionStart;
        this.trackEvent('session_end', {
            sessionId: this.sessionId,
            duration: duration
        });
    }

    loadEvents() {
        const saved = localStorage.getItem('analytics_events');
        return saved ? JSON.parse(saved) : [];
    }

    saveEvents() {
        // Mantener solo últimos 500 eventos
        if (this.events.length > 500) {
            this.events = this.events.slice(-500);
        }
        localStorage.setItem('analytics_events', JSON.stringify(this.events));
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userId: this.getUserId(),
            page: window.location.pathname,
            url: window.location.href
        };

        this.events.push(event);
        this.saveEvents();

        console.log('[Analytics] Event tracked:', eventName, properties);

        return event;
    }

    getUserId() {
        const user = window.authSystem?.getCurrentUser();
        return user ? user.id : 'anonymous';
    }

    trackPageView() {
        this.trackEvent('page_view', {
            path: window.location.pathname,
            title: document.title
        });
    }

    setupAutoTracking() {
        // Auto-track clicks en botones
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, a')) {
                this.trackEvent('click', {
                    element: e.target.tagName,
                    text: e.target.textContent.substring(0, 50),
                    id: e.target.id,
                    className: e.target.className
                });
            }
        });

        // Auto-track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                if (maxScroll >= 25 && maxScroll < 50) this.trackEvent('scroll_25');
                if (maxScroll >= 50 && maxScroll < 75) this.trackEvent('scroll_50');
                if (maxScroll >= 75 && maxScroll < 100) this.trackEvent('scroll_75');
                if (maxScroll >= 100) this.trackEvent('scroll_100');
            }
        });

        // Auto-track tiempo en página
        let timeOnPage = 0;
        setInterval(() => {
            timeOnPage += 10;
            if (timeOnPage % 30 === 0) { // Cada 30 segundos
                this.trackEvent('time_on_page', { seconds: timeOnPage });
            }
        }, 10000);

        // Track al salir
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    // ============================================
    // FUNNELS DE CONVERSIÓN
    // ============================================

    defineFunnels() {
        return {
            purchase: {
                name: 'Purchase Funnel',
                steps: [
                    { name: 'product_view', label: 'View Product' },
                    { name: 'add_to_cart', label: 'Add to Cart' },
                    { name: 'view_cart', label: 'View Cart' },
                    { name: 'checkout_start', label: 'Start Checkout' },
                    { name: 'checkout_complete', label: 'Complete Purchase' }
                ]
            },
            registration: {
                name: 'Registration Funnel',
                steps: [
                    { name: 'view_register', label: 'View Registration' },
                    { name: 'start_register', label: 'Start Form' },
                    { name: 'submit_register', label: 'Submit Form' },
                    { name: 'complete_register', label: 'Complete Registration' }
                ]
            }
        };
    }

    getFunnelAnalysis(funnelName, startDate = null, endDate = null) {
        const funnel = this.funnels[funnelName];
        if (!funnel) return null;

        let events = this.events;

        // Filtrar por fecha
        if (startDate) {
            events = events.filter(e => new Date(e.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            events = events.filter(e => new Date(e.timestamp) <= new Date(endDate));
        }

        // Contar usuarios únicos en cada paso
        const stepCounts = funnel.steps.map((step, index) => {
            const users = new Set();
            events.filter(e => e.name === step.name).forEach(e => users.add(e.userId));

            // Calcular tasa de conversión respecto al paso anterior
            let conversionRate = 100;
            if (index > 0) {
                const prevUsers = new Set();
                events.filter(e => e.name === funnel.steps[index - 1].name).forEach(e => prevUsers.add(e.userId));
                conversionRate = prevUsers.size > 0 ? (users.size / prevUsers.size) * 100 : 0;
            }

            return {
                step: step.label,
                users: users.size,
                conversionRate: conversionRate.toFixed(1)
            };
        });

        // Tasa de conversión total
        const totalConversion = stepCounts.length > 0
            ? (stepCounts[stepCounts.length - 1].users / stepCounts[0].users) * 100
            : 0;

        return {
            funnel: funnel.name,
            steps: stepCounts,
            totalConversionRate: totalConversion.toFixed(1)
        };
    }

    // ============================================
    // SEGMENTACIÓN DE USUARIOS
    // ============================================

    loadUserSegments() {
        return {
            new_users: { condition: (user) => this.isNewUser(user), label: 'New Users' },
            active_users: { condition: (user) => this.isActiveUser(user), label: 'Active Users' },
            high_value: { condition: (user) => this.isHighValueUser(user), label: 'High Value Users' },
            at_risk: { condition: (user) => this.isAtRiskUser(user), label: 'At Risk Users' }
        };
    }

    isNewUser(userId) {
        const userEvents = this.events.filter(e => e.userId === userId);
        const firstEvent = userEvents[0];
        if (!firstEvent) return false;

        const daysSinceFirst = (Date.now() - new Date(firstEvent.timestamp)) / (1000 * 60 * 60 * 24);
        return daysSinceFirst <= 7;
    }

    isActiveUser(userId) {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentEvents = this.events.filter(e =>
            e.userId === userId && new Date(e.timestamp) >= last30Days
        );
        return recentEvents.length >= 10;
    }

    isHighValueUser(userId) {
        const purchaseEvents = this.events.filter(e =>
            e.userId === userId && e.name === 'purchase'
        );

        const totalSpent = purchaseEvents.reduce((sum, e) =>
            sum + (e.properties.total || 0), 0
        );

        return totalSpent > 500000; // Más de $500,000 COP
    }

    isAtRiskUser(userId) {
        const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const eventsLast60Days = this.events.filter(e =>
            e.userId === userId && new Date(e.timestamp) >= last60Days
        ).length;

        const eventsLast30Days = this.events.filter(e =>
            e.userId === userId && new Date(e.timestamp) >= last30Days
        ).length;

        // Tenía actividad hace 30-60 días pero no en los últimos 30
        return eventsLast60Days > 5 && eventsLast30Days < 2;
    }

    getUserSegment(userId) {
        for (const [segmentId, segment] of Object.entries(this.userSegments)) {
            if (segment.condition(userId)) {
                return { id: segmentId, label: segment.label };
            }
        }
        return { id: 'general', label: 'General' };
    }

    // ============================================
    // A/B TESTING
    // ============================================

    loadExperiments() {
        const saved = localStorage.getItem('ab_experiments');
        return saved ? JSON.parse(saved) : {};
    }

    saveExperiments() {
        localStorage.setItem('ab_experiments', JSON.stringify(this.experiments));
    }

    createExperiment(name, variants) {
        this.experiments[name] = {
            name,
            variants: variants.map((v, i) => ({
                id: i,
                name: v,
                users: [],
                conversions: 0
            })),
            startDate: new Date().toISOString(),
            active: true
        };

        this.saveExperiments();
        return this.experiments[name];
    }

    assignVariant(experimentName, userId) {
        const experiment = this.experiments[experimentName];
        if (!experiment || !experiment.active) return null;

        // Ver si el usuario ya está asignado
        for (const variant of experiment.variants) {
            if (variant.users.includes(userId)) {
                return variant;
            }
        }

        // Asignar variante aleatoriamente (distribución equitativa)
        const randomVariant = experiment.variants[Math.floor(Math.random() * experiment.variants.length)];
        randomVariant.users.push(userId);

        this.saveExperiments();
        return randomVariant;
    }

    trackConversion(experimentName, userId) {
        const experiment = this.experiments[experimentName];
        if (!experiment) return;

        for (const variant of experiment.variants) {
            if (variant.users.includes(userId)) {
                variant.conversions++;
                break;
            }
        }

        this.saveExperiments();
        this.trackEvent('ab_conversion', { experiment: experimentName });
    }

    getExperimentResults(experimentName) {
        const experiment = this.experiments[experimentName];
        if (!experiment) return null;

        const results = experiment.variants.map(variant => {
            const conversionRate = variant.users.length > 0
                ? (variant.conversions / variant.users.length) * 100
                : 0;

            return {
                variant: variant.name,
                users: variant.users.length,
                conversions: variant.conversions,
                conversionRate: conversionRate.toFixed(2) + '%'
            };
        });

        return {
            experiment: experiment.name,
            startDate: experiment.startDate,
            results
        };
    }

    // ============================================
    // REPORTES Y DASHBOARD
    // ============================================

    getDashboardMetrics(period = 30) {
        const periodStart = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
        const periodEvents = this.events.filter(e => new Date(e.timestamp) >= periodStart);

        // Usuarios únicos
        const uniqueUsers = new Set(periodEvents.map(e => e.userId)).size;

        // Sesiones
        const sessions = new Set(periodEvents.map(e => e.sessionId)).size;

        // Páginas vistas
        const pageViews = periodEvents.filter(e => e.name === 'page_view').length;

        // Tasa de rebote (sesiones con solo 1 página vista)
        const sessionPageViews = {};
        periodEvents.filter(e => e.name === 'page_view').forEach(e => {
            sessionPageViews[e.sessionId] = (sessionPageViews[e.sessionId] || 0) + 1;
        });

        const bounces = Object.values(sessionPageViews).filter(count => count === 1).length;
        const bounceRate = sessions > 0 ? (bounces / sessions) * 100 : 0;

        // Duración promedio de sesión
        const sessionDurations = periodEvents
            .filter(e => e.name === 'session_end')
            .map(e => e.properties.duration || 0);

        const avgSessionDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
            : 0;

        // Eventos más comunes
        const eventCounts = {};
        periodEvents.forEach(e => {
            eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
        });

        const topEvents = Object.entries(eventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ event: name, count }));

        return {
            period: `${period} days`,
            uniqueUsers,
            sessions,
            pageViews,
            bounceRate: bounceRate.toFixed(1) + '%',
            avgSessionDuration: (avgSessionDuration / 1000 / 60).toFixed(1) + ' min',
            topEvents
        };
    }

    exportAnalytics(format = 'json') {
        const data = {
            events: this.events,
            experiments: this.experiments,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            let csv = 'Event,Timestamp,User,Session,Page\n';
            this.events.forEach(e => {
                csv += `${e.name},${e.timestamp},${e.userId},${e.sessionId},${e.page}\n`;
            });
            return csv;
        }

        return data;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AdvancedAnalytics = AdvancedAnalytics;

    // Inicializar automáticamente
    window.analytics = new AdvancedAnalytics();
}
