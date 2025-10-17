// Real-Time Analytics System - v13.0
// Live dashboards, event streaming, user activity tracking, heatmaps

class RealtimeAnalyticsSystem {
    constructor() {
        this.events = [];
        this.sessions = new Map();
        this.activeUsers = new Set();
        this.metrics = {
            pageViews: 0,
            uniqueVisitors: 0,
            bounceRate: 0,
            avgSessionDuration: 0,
            conversionRate: 0
        };

        this.currentSession = null;
        this.subscribers = [];
        this.bufferSize = 10000; // Keep last 10k events

        this.initSession();
        this.startTracking();
        this.startHeartbeat();

        console.log('[Analytics RT] Real-time analytics system initialized');
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    initSession() {
        const sessionId = this.getOrCreateSessionId();

        this.currentSession = {
            id: sessionId,
            userId: this.getUserId(),
            startTime: Date.now(),
            lastActivity: Date.now(),
            pageViews: 0,
            events: [],
            referrer: document.referrer || 'direct',
            landingPage: window.location.pathname,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            device: this.detectDevice(),
            browser: this.detectBrowser(),
            os: this.detectOS()
        };

        this.sessions.set(sessionId, this.currentSession);
        this.activeUsers.add(this.currentSession.userId);

        this.saveToStorage();

        console.log('[Analytics RT] Session started:', sessionId);
    }

    getOrCreateSessionId() {
        // Check if there's an active session (within 30 minutes)
        const stored = sessionStorage.getItem('analytics_session_id');
        const storedTime = sessionStorage.getItem('analytics_session_time');

        if (stored && storedTime) {
            const elapsed = Date.now() - parseInt(storedTime);
            if (elapsed < 30 * 60 * 1000) { // 30 minutes
                return stored;
            }
        }

        // Create new session
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
        sessionStorage.setItem('analytics_session_time', Date.now().toString());

        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');

        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
            this.metrics.uniqueVisitors++;
        }

        return userId;
    }

    updateSessionActivity() {
        if (this.currentSession) {
            this.currentSession.lastActivity = Date.now();
            sessionStorage.setItem('analytics_session_time', Date.now().toString());
        }
    }

    endSession() {
        if (!this.currentSession) return;

        const duration = Date.now() - this.currentSession.startTime;

        this.currentSession.endTime = Date.now();
        this.currentSession.duration = duration;
        this.currentSession.exitPage = window.location.pathname;

        this.track('session_end', {
            sessionId: this.currentSession.id,
            duration,
            pageViews: this.currentSession.pageViews,
            eventCount: this.currentSession.events.length
        });

        this.activeUsers.delete(this.currentSession.userId);

        console.log('[Analytics RT] Session ended:', this.currentSession.id, 'Duration:', duration + 'ms');
    }

    // ============================================
    // EVENT TRACKING
    // ============================================

    track(eventName, properties = {}, options = {}) {
        this.updateSessionActivity();

        const event = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: eventName,
            properties: {
                ...properties,
                page: window.location.pathname,
                url: window.location.href,
                title: document.title
            },
            context: {
                sessionId: this.currentSession?.id,
                userId: this.currentSession?.userId,
                timestamp: Date.now(),
                timestampISO: new Date().toISOString(),
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                scrollDepth: this.getScrollDepth()
            },
            metadata: options.metadata || {}
        };

        this.events.push(event);

        // Add to session
        if (this.currentSession) {
            this.currentSession.events.push(event.id);
        }

        // Buffer management
        if (this.events.length > this.bufferSize) {
            this.events.shift();
        }

        // Emit to subscribers in real-time
        this.emit('event', event);

        // Save periodically (every 10 events)
        if (this.events.length % 10 === 0) {
            this.saveToStorage();
        }

        return event;
    }

    // ============================================
    // AUTO-TRACKING
    // ============================================

    startTracking() {
        // Page view
        this.trackPageView();

        // Clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmit(e);
        });

        // Scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const depth = this.getScrollDepth();
            if (depth > maxScrollDepth) {
                maxScrollDepth = depth;
                this.track('scroll_depth', { depth, milestone: Math.floor(depth / 25) * 25 });
            }
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_hidden');
            } else {
                this.track('page_visible');
            }
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
            this.saveToStorage();
        });

        // Page navigation (for SPAs)
        if (window.history.pushState) {
            const originalPushState = window.history.pushState;
            window.history.pushState = (...args) => {
                originalPushState.apply(window.history, args);
                this.trackPageView();
            };
        }

        console.log('[Analytics RT] Auto-tracking enabled');
    }

    trackPageView() {
        this.metrics.pageViews++;

        if (this.currentSession) {
            this.currentSession.pageViews++;
        }

        this.track('page_view', {
            path: window.location.pathname,
            referrer: document.referrer,
            title: document.title
        });
    }

    trackClick(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();

        let properties = {
            element: tagName,
            text: target.textContent?.substring(0, 100),
            x: event.clientX,
            y: event.clientY
        };

        // Special tracking for links
        if (tagName === 'a') {
            properties.href = target.href;
            properties.linkText = target.textContent;
        }

        // Special tracking for buttons
        if (tagName === 'button' || target.type === 'button') {
            properties.buttonText = target.textContent;
            properties.buttonId = target.id;
        }

        // Track data attributes
        for (const attr of target.attributes) {
            if (attr.name.startsWith('data-track-')) {
                properties[attr.name.replace('data-track-', '')] = attr.value;
            }
        }

        this.track('click', properties);
    }

    trackFormSubmit(event) {
        const form = event.target;

        const properties = {
            formId: form.id,
            formName: form.name,
            action: form.action,
            method: form.method,
            fieldCount: form.elements.length
        };

        this.track('form_submit', properties);
    }

    trackError(error) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
    }

    trackPerformance() {
        if (!window.performance) return;

        const navigation = performance.getEntriesByType('navigation')[0];

        if (navigation) {
            this.track('performance', {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                domInteractive: navigation.domInteractive,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize,
                decodedBodySize: navigation.decodedBodySize
            });
        }
    }

    // ============================================
    // CUSTOM EVENTS
    // ============================================

    trackConversion(type, value = 0, properties = {}) {
        this.track('conversion', {
            type,
            value,
            ...properties
        });

        this.updateMetrics();
    }

    trackProduct(action, product) {
        this.track('product_' + action, {
            productId: product.id,
            productName: product.name,
            price: product.price,
            category: product.category
        });
    }

    trackCart(action, item) {
        this.track('cart_' + action, {
            itemId: item.id,
            quantity: item.quantity,
            price: item.price
        });
    }

    trackCheckout(step, data = {}) {
        this.track('checkout_step_' + step, data);
    }

    trackSearch(query, resultsCount) {
        this.track('search', {
            query,
            resultsCount,
            hasResults: resultsCount > 0
        });
    }

    // ============================================
    // REAL-TIME METRICS
    // ============================================

    getActiveUsers() {
        return this.activeUsers.size;
    }

    getCurrentPageViews() {
        const last5Min = Date.now() - (5 * 60 * 1000);
        return this.events.filter(e =>
            e.name === 'page_view' && e.context.timestamp >= last5Min
        ).length;
    }

    getTopPages(limit = 10) {
        const pageViews = {};

        this.events
            .filter(e => e.name === 'page_view')
            .forEach(e => {
                const path = e.properties.path;
                pageViews[path] = (pageViews[path] || 0) + 1;
            });

        return Object.entries(pageViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([path, views]) => ({ path, views }));
    }

    getTopEvents(limit = 10) {
        const eventCounts = {};

        this.events.forEach(e => {
            eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));
    }

    getRecentEvents(limit = 50) {
        return this.events.slice(-limit).reverse();
    }

    getEventsByTimeRange(startTime, endTime) {
        return this.events.filter(e =>
            e.context.timestamp >= startTime && e.context.timestamp <= endTime
        );
    }

    getEventStream(duration = 60000) {
        // Get events from last N milliseconds
        const since = Date.now() - duration;
        return this.events.filter(e => e.context.timestamp >= since);
    }

    // ============================================
    // FUNNEL ANALYSIS
    // ============================================

    analyzeFunnel(steps) {
        // steps: ['page_view', 'product_view', 'add_to_cart', 'checkout', 'purchase']
        const funnelData = [];

        let previousCount = this.events.length;

        steps.forEach((step, index) => {
            const count = this.events.filter(e => e.name === step).length;
            const dropoff = index > 0 ? previousCount - count : 0;
            const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;

            funnelData.push({
                step,
                count,
                dropoff,
                conversionRate: conversionRate.toFixed(2) + '%'
            });

            previousCount = count;
        });

        return funnelData;
    }

    // ============================================
    // COHORT ANALYSIS
    // ============================================

    getCohortData(metric, period = 'day') {
        const cohorts = {};

        this.events.forEach(event => {
            const date = new Date(event.context.timestamp);
            let cohortKey;

            if (period === 'day') {
                cohortKey = date.toISOString().split('T')[0];
            } else if (period === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                cohortKey = weekStart.toISOString().split('T')[0];
            } else if (period === 'month') {
                cohortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!cohorts[cohortKey]) {
                cohorts[cohortKey] = { count: 0, users: new Set() };
            }

            cohorts[cohortKey].count++;
            cohorts[cohortKey].users.add(event.context.userId);
        });

        return Object.entries(cohorts).map(([date, data]) => ({
            date,
            count: data.count,
            uniqueUsers: data.users.size
        }));
    }

    // ============================================
    // UTILITIES
    // ============================================

    getScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (scrollHeight === 0) return 100;

        return Math.round((scrollTop / scrollHeight) * 100);
    }

    detectDevice() {
        const ua = navigator.userAgent;

        if (/mobile/i.test(ua)) return 'mobile';
        if (/tablet|ipad/i.test(ua)) return 'tablet';
        return 'desktop';
    }

    detectBrowser() {
        const ua = navigator.userAgent;

        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('MSIE') || ua.includes('Trident')) return 'IE';

        return 'Unknown';
    }

    detectOS() {
        const ua = navigator.userAgent;

        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';

        return 'Unknown';
    }

    // ============================================
    // HEARTBEAT
    // ============================================

    startHeartbeat() {
        // Send heartbeat every 30 seconds to indicate user is still active
        setInterval(() => {
            if (!document.hidden && this.currentSession) {
                this.track('heartbeat', {
                    sessionDuration: Date.now() - this.currentSession.startTime
                });

                this.updateMetrics();
            }
        }, 30000);
    }

    updateMetrics() {
        // Update aggregate metrics
        const sessions = Array.from(this.sessions.values());

        if (sessions.length > 0) {
            const totalDuration = sessions.reduce((sum, s) => {
                const duration = s.endTime ? (s.endTime - s.startTime) : (Date.now() - s.startTime);
                return sum + duration;
            }, 0);

            this.metrics.avgSessionDuration = Math.round(totalDuration / sessions.length);

            // Bounce rate (sessions with only 1 page view)
            const bouncedSessions = sessions.filter(s => s.pageViews === 1).length;
            this.metrics.bounceRate = ((bouncedSessions / sessions.length) * 100).toFixed(2);
        }

        // Conversion rate
        const conversions = this.events.filter(e => e.name === 'conversion').length;
        if (sessions.length > 0) {
            this.metrics.conversionRate = ((conversions / sessions.length) * 100).toFixed(2);
        }
    }

    // ============================================
    // DASHBOARD DATA
    // ============================================

    getDashboardData() {
        this.updateMetrics();

        return {
            overview: {
                activeUsers: this.getActiveUsers(),
                pageViews: this.metrics.pageViews,
                uniqueVisitors: this.metrics.uniqueVisitors,
                avgSessionDuration: Math.round(this.metrics.avgSessionDuration / 1000) + 's',
                bounceRate: this.metrics.bounceRate + '%',
                conversionRate: this.metrics.conversionRate + '%'
            },
            topPages: this.getTopPages(10),
            topEvents: this.getTopEvents(10),
            recentEvents: this.getRecentEvents(20),
            eventStream: this.getEventStream(60000), // Last 1 minute
            sessions: Array.from(this.sessions.values()).slice(-10)
        };
    }

    // ============================================
    // REAL-TIME SUBSCRIPTIONS
    // ============================================

    subscribe(callback, filter = null) {
        const subscriber = {
            id: 'sub_' + Date.now(),
            callback,
            filter
        };

        this.subscribers.push(subscriber);

        console.log('[Analytics RT] Subscriber added:', subscriber.id);

        return subscriber.id;
    }

    unsubscribe(subscriberId) {
        const index = this.subscribers.findIndex(s => s.id === subscriberId);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
            console.log('[Analytics RT] Subscriber removed:', subscriberId);
        }
    }

    emit(eventType, data) {
        this.subscribers.forEach(subscriber => {
            // Apply filter if exists
            if (subscriber.filter && !subscriber.filter(data)) {
                return;
            }

            try {
                subscriber.callback(eventType, data);
            } catch (error) {
                console.error('[Analytics RT] Error in subscriber callback:', error);
            }
        });
    }

    // ============================================
    // STORAGE
    // ============================================

    saveToStorage() {
        try {
            // Save only recent events (last 1000)
            const recentEvents = this.events.slice(-1000);
            localStorage.setItem('analytics_events', JSON.stringify(recentEvents));

            // Save sessions
            const sessionsArray = Array.from(this.sessions.entries());
            localStorage.setItem('analytics_sessions', JSON.stringify(sessionsArray));

            // Save metrics
            localStorage.setItem('analytics_metrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('[Analytics RT] Error saving to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const events = localStorage.getItem('analytics_events');
            if (events) {
                this.events = JSON.parse(events);
            }

            const sessions = localStorage.getItem('analytics_sessions');
            if (sessions) {
                this.sessions = new Map(JSON.parse(sessions));
            }

            const metrics = localStorage.getItem('analytics_metrics');
            if (metrics) {
                this.metrics = JSON.parse(metrics);
            }

            console.log('[Analytics RT] Loaded from storage:', {
                events: this.events.length,
                sessions: this.sessions.size
            });
        } catch (error) {
            console.error('[Analytics RT] Error loading from storage:', error);
        }
    }

    // ============================================
    // EXPORT
    // ============================================

    exportData(format = 'json') {
        const data = {
            events: this.events,
            sessions: Array.from(this.sessions.entries()),
            metrics: this.metrics,
            exportedAt: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.exportToCSV();
        }

        return data;
    }

    exportToCSV() {
        const headers = ['Timestamp', 'Event', 'User ID', 'Session ID', 'Page', 'Properties'];
        const rows = this.events.map(e => [
            e.context.timestampISO,
            e.name,
            e.context.userId,
            e.context.sessionId,
            e.properties.page,
            JSON.stringify(e.properties)
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csv;
    }

    getStats() {
        return {
            totalEvents: this.events.length,
            totalSessions: this.sessions.size,
            activeUsers: this.activeUsers.size,
            subscribers: this.subscribers.length,
            ...this.metrics
        };
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.RealtimeAnalyticsSystem = RealtimeAnalyticsSystem;
    window.realtimeAnalytics = new RealtimeAnalyticsSystem();

    // Auto-track errors
    window.addEventListener('error', (e) => {
        window.realtimeAnalytics.trackError(e.error || new Error(e.message));
    });

    // Track performance on load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.realtimeAnalytics.trackPerformance();
        }, 0);
    });
}

console.log('[Analytics RT] ✅ analytics-realtime.js loaded');
