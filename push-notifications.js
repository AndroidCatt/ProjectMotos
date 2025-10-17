// Advanced Push Notifications System - v13.0
// Web Push API, Service Worker notifications, notification scheduling

class PushNotificationSystem {
    constructor() {
        this.notifications = [];
        this.subscriptions = new Map();
        this.scheduledNotifications = [];
        this.notificationQueue = [];
        this.preferences = this.loadPreferences();

        this.vapidPublicKey = 'BG3xPCq8_VqTxHYVZN8LqPfV9h3cRQYqH4YQVuVq8Rg7XN9dTU6mWzPxQVvN5kL8H7mNp2zR3yX9aT5nVxYqW4k'; // Demo key

        this.initializeServiceWorker();
        this.startScheduler();

        console.log('[Push] Push notification system initialized');
    }

    // ============================================
    // SERVICE WORKER INTEGRATION
    // ============================================

    async initializeServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[Push] Service Worker not supported');
            return;
        }

        if (!('PushManager' in window)) {
            console.warn('[Push] Push notifications not supported');
            return;
        }

        try {
            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.ready;
            console.log('[Push] Service Worker ready');

            // Check if already subscribed
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                console.log('[Push] Already subscribed to push notifications');
                this.handleSubscription(subscription);
            }
        } catch (error) {
            console.error('[Push] Service Worker initialization error:', error);
        }
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            throw new Error('Notifications not supported');
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('[Push] Notification permission granted');
            return true;
        } else if (permission === 'denied') {
            console.warn('[Push] Notification permission denied');
            return false;
        } else {
            console.warn('[Push] Notification permission dismissed');
            return false;
        }
    }

    async subscribe() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker not supported');
        }

        const permission = await this.requestPermission();
        if (!permission) {
            throw new Error('Notification permission not granted');
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            });

            console.log('[Push] Push subscription created:', subscription);

            this.handleSubscription(subscription);

            // Send subscription to server (in real app)
            // await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('[Push] Error subscribing to push notifications:', error);
            throw error;
        }
    }

    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                console.log('[Push] Unsubscribed from push notifications');

                // Remove from server (in real app)
                // await this.removeSubscriptionFromServer(subscription);
            }
        } catch (error) {
            console.error('[Push] Error unsubscribing:', error);
        }
    }

    handleSubscription(subscription) {
        const endpoint = subscription.endpoint;
        this.subscriptions.set(endpoint, {
            subscription,
            subscribedAt: new Date().toISOString()
        });
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // ============================================
    // SEND NOTIFICATIONS
    // ============================================

    async send(title, options = {}) {
        // Check preferences
        if (!this.shouldSendNotification(options.category)) {
            console.log('[Push] Notification blocked by preferences:', options.category);
            return null;
        }

        // Check quiet hours
        if (this.isQuietHours()) {
            console.log('[Push] In quiet hours, notification queued');
            this.queueNotification(title, options);
            return null;
        }

        const notificationOptions = {
            body: options.body || '',
            icon: options.icon || '/icon-192x192.png',
            badge: options.badge || '/badge-72x72.png',
            image: options.image || null,
            data: options.data || {},
            tag: options.tag || 'default',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            vibrate: options.vibrate || [200, 100, 200],
            actions: options.actions || [],
            timestamp: Date.now(),
            ...options
        };

        try {
            // Try using Service Worker notification
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, notificationOptions);
            } else {
                // Fallback to regular notification
                new Notification(title, notificationOptions);
            }

            const notification = {
                id: 'notif_' + Date.now(),
                title,
                options: notificationOptions,
                sentAt: new Date().toISOString(),
                read: false,
                clicked: false
            };

            this.notifications.push(notification);
            this.saveToStorage();

            this.emit('notification_sent', notification);

            return notification;
        } catch (error) {
            console.error('[Push] Error sending notification:', error);
            throw error;
        }
    }

    // ============================================
    // NOTIFICATION TYPES
    // ============================================

    async sendOrderNotification(order) {
        return this.send(`Pedido #${order.id}`, {
            body: `Tu pedido está ${order.status}`,
            icon: '/icon-order.png',
            category: 'orders',
            data: { type: 'order', orderId: order.id },
            actions: [
                { action: 'view', title: 'Ver pedido' },
                { action: 'track', title: 'Rastrear' }
            ]
        });
    }

    async sendMessageNotification(message) {
        return this.send(`Nuevo mensaje de ${message.senderName}`, {
            body: message.text.substring(0, 100),
            icon: message.senderAvatar || '/icon-message.png',
            category: 'messages',
            data: { type: 'message', messageId: message.id, conversationId: message.conversationId },
            tag: 'message_' + message.conversationId,
            actions: [
                { action: 'reply', title: 'Responder' },
                { action: 'mark_read', title: 'Marcar como leído' }
            ]
        });
    }

    async sendPromotionNotification(promotion) {
        return this.send(promotion.title, {
            body: promotion.description,
            icon: '/icon-promo.png',
            image: promotion.image,
            category: 'promotions',
            data: { type: 'promotion', promotionId: promotion.id },
            actions: [
                { action: 'view', title: 'Ver oferta' },
                { action: 'dismiss', title: 'Descartar' }
            ]
        });
    }

    async sendReviewNotification(review) {
        return this.send('Nueva reseña', {
            body: `${review.userName} dejó una reseña de ${review.rating}⭐`,
            icon: '/icon-review.png',
            category: 'reviews',
            data: { type: 'review', reviewId: review.id, productId: review.productId }
        });
    }

    async sendSystemNotification(message, level = 'info') {
        const icons = {
            info: '/icon-info.png',
            warning: '/icon-warning.png',
            error: '/icon-error.png',
            success: '/icon-success.png'
        };

        return this.send('Sistema', {
            body: message,
            icon: icons[level] || icons.info,
            category: 'system',
            data: { type: 'system', level }
        });
    }

    // ============================================
    // SCHEDULED NOTIFICATIONS
    // ============================================

    schedule(title, options, scheduledFor) {
        const scheduledNotification = {
            id: 'scheduled_' + Date.now(),
            title,
            options,
            scheduledFor: new Date(scheduledFor).toISOString(),
            sent: false,
            cancelled: false
        };

        this.scheduledNotifications.push(scheduledNotification);
        this.saveToStorage();

        console.log('[Push] Notification scheduled for:', scheduledFor);

        return scheduledNotification;
    }

    cancelScheduled(notificationId) {
        const notification = this.scheduledNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.cancelled = true;
            this.saveToStorage();
            console.log('[Push] Scheduled notification cancelled:', notificationId);
        }
    }

    startScheduler() {
        // Check every minute for scheduled notifications
        setInterval(() => {
            this.processScheduledNotifications();
        }, 60000);

        // Also check immediately
        this.processScheduledNotifications();
    }

    async processScheduledNotifications() {
        const now = new Date();

        for (const notification of this.scheduledNotifications) {
            if (notification.sent || notification.cancelled) continue;

            const scheduledTime = new Date(notification.scheduledFor);

            if (now >= scheduledTime) {
                try {
                    await this.send(notification.title, notification.options);
                    notification.sent = true;
                    this.saveToStorage();
                    console.log('[Push] Scheduled notification sent:', notification.id);
                } catch (error) {
                    console.error('[Push] Error sending scheduled notification:', error);
                }
            }
        }
    }

    // ============================================
    // NOTIFICATION QUEUE (for quiet hours)
    // ============================================

    queueNotification(title, options) {
        this.notificationQueue.push({ title, options, queuedAt: Date.now() });
        this.saveToStorage();
    }

    async processQueue() {
        console.log('[Push] Processing notification queue:', this.notificationQueue.length);

        while (this.notificationQueue.length > 0) {
            const { title, options } = this.notificationQueue.shift();
            await this.send(title, options);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s between notifications
        }

        this.saveToStorage();
    }

    clearQueue() {
        this.notificationQueue = [];
        this.saveToStorage();
        console.log('[Push] Notification queue cleared');
    }

    // ============================================
    // PREFERENCES
    // ============================================

    setPreferences(preferences) {
        this.preferences = {
            ...this.preferences,
            ...preferences
        };

        this.savePreferences();
        console.log('[Push] Preferences updated:', this.preferences);
    }

    shouldSendNotification(category) {
        if (!this.preferences.enabled) return false;

        const categoryPrefs = this.preferences.categories || {};

        if (category && categoryPrefs[category] !== undefined) {
            return categoryPrefs[category];
        }

        return true; // Default: enabled
    }

    isQuietHours() {
        if (!this.preferences.quietHours || !this.preferences.quietHours.enabled) {
            return false;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const { start, end } = this.preferences.quietHours;
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (startTime < endTime) {
            // Same day range (e.g., 22:00 - 07:00 next day)
            return currentTime >= startTime || currentTime < endTime;
        } else {
            // Overnight range (e.g., 08:00 - 22:00)
            return currentTime >= startTime && currentTime < endTime;
        }
    }

    getDefaultPreferences() {
        return {
            enabled: true,
            categories: {
                orders: true,
                messages: true,
                promotions: true,
                reviews: true,
                system: true
            },
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            sound: true,
            vibration: true,
            badge: true
        };
    }

    loadPreferences() {
        try {
            const stored = localStorage.getItem('push_notification_preferences');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('[Push] Error loading preferences:', error);
        }

        return this.getDefaultPreferences();
    }

    savePreferences() {
        try {
            localStorage.setItem('push_notification_preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('[Push] Error saving preferences:', error);
        }
    }

    // ============================================
    // NOTIFICATION MANAGEMENT
    // ============================================

    getNotifications(filters = {}) {
        let results = [...this.notifications];

        if (filters.unread) {
            results = results.filter(n => !n.read);
        }

        if (filters.category) {
            results = results.filter(n => n.options.category === filters.category);
        }

        if (filters.since) {
            const since = new Date(filters.since);
            results = results.filter(n => new Date(n.sentAt) >= since);
        }

        // Sort by timestamp (newest first)
        results.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

        return results;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveToStorage();
            this.emit('notification_read', notification);
        }
    }

    markAllAsRead(category = null) {
        let count = 0;

        this.notifications.forEach(notification => {
            if (!notification.read) {
                if (!category || notification.options.category === category) {
                    notification.read = true;
                    count++;
                }
            }
        });

        this.saveToStorage();
        console.log('[Push] Marked', count, 'notifications as read');

        return count;
    }

    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.saveToStorage();
            console.log('[Push] Notification deleted:', notificationId);
        }
    }

    clearAll(category = null) {
        if (category) {
            this.notifications = this.notifications.filter(n => n.options.category !== category);
        } else {
            this.notifications = [];
        }

        this.saveToStorage();
        console.log('[Push] Notifications cleared');
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStats() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const last7d = now - (7 * 24 * 60 * 60 * 1000);

        const recent24h = this.notifications.filter(n => new Date(n.sentAt).getTime() >= last24h);
        const recent7d = this.notifications.filter(n => new Date(n.sentAt).getTime() >= last7d);

        const byCategory = {};
        this.notifications.forEach(n => {
            const cat = n.options.category || 'uncategorized';
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        });

        return {
            total: this.notifications.length,
            unread: this.notifications.filter(n => !n.read).length,
            last24h: recent24h.length,
            last7d: recent7d.length,
            byCategory,
            scheduled: this.scheduledNotifications.filter(n => !n.sent && !n.cancelled).length,
            queued: this.notificationQueue.length
        };
    }

    // ============================================
    // STORAGE
    // ============================================

    saveToStorage() {
        try {
            localStorage.setItem('push_notifications', JSON.stringify(this.notifications));
            localStorage.setItem('push_scheduled', JSON.stringify(this.scheduledNotifications));
            localStorage.setItem('push_queue', JSON.stringify(this.notificationQueue));
        } catch (error) {
            console.error('[Push] Error saving to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const notifications = localStorage.getItem('push_notifications');
            if (notifications) {
                this.notifications = JSON.parse(notifications);
            }

            const scheduled = localStorage.getItem('push_scheduled');
            if (scheduled) {
                this.scheduledNotifications = JSON.parse(scheduled);
            }

            const queue = localStorage.getItem('push_queue');
            if (queue) {
                this.notificationQueue = JSON.parse(queue);
            }

            console.log('[Push] Loaded from storage:', {
                notifications: this.notifications.length,
                scheduled: this.scheduledNotifications.length,
                queued: this.notificationQueue.length
            });
        } catch (error) {
            console.error('[Push] Error loading from storage:', error);
        }
    }

    // ============================================
    // EVENTS
    // ============================================

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('push_' + event, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener('push_' + event, (e) => callback(e.detail));
    }

    // ============================================
    // EXPORT
    // ============================================

    exportData(format = 'json') {
        const data = {
            notifications: this.notifications,
            scheduled: this.scheduledNotifications,
            preferences: this.preferences,
            stats: this.getStats(),
            exportedAt: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }

        return data;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.PushNotificationSystem = PushNotificationSystem;
    window.pushNotifications = new PushNotificationSystem();
}

console.log('[Push] ✅ push-notifications.js loaded');
