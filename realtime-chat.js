// Real-Time Chat System - Sistema de Chat en Tiempo Real v9.0
// WebSocket simulado para chat en tiempo real, soporte multi-usuario, typing indicators

class RealTimeChatSystem {
    constructor() {
        this.isConnected = false;
        this.userId = this.getUserId();
        this.currentRoom = 'general';
        this.messages = this.loadMessages();
        this.onlineUsers = new Set();
        this.typingUsers = new Set();
        this.listeners = {};

        // Simular WebSocket con polling y localStorage
        this.simulateWebSocket();
    }

    // ============================================
    // CONEXIÓN (SIMULADA)
    // ============================================

    getUserId() {
        const user = window.authSystem?.getCurrentUser();
        return user ? user.id : 'guest_' + Date.now();
    }

    simulateWebSocket() {
        // En producción, esto sería: new WebSocket('ws://localhost:8080')
        // Por ahora simulamos con localStorage y eventos

        this.isConnected = true;
        this.emit('connected', { userId: this.userId });

        // Simular presencia online
        this.updatePresence();
        setInterval(() => this.updatePresence(), 5000);

        // Escuchar cambios en localStorage (mensajes de otros "usuarios")
        window.addEventListener('storage', (e) => {
            if (e.key === 'realtime_messages') {
                this.handleNewMessages();
            } else if (e.key === 'realtime_typing') {
                this.handleTypingUpdate();
            } else if (e.key === 'realtime_presence') {
                this.handlePresenceUpdate();
            }
        });

        // Limpiar al cerrar
        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });
    }

    updatePresence() {
        const presence = this.loadPresence();
        presence[this.userId] = {
            userId: this.userId,
            username: this.getUsername(),
            lastSeen: new Date().toISOString(),
            room: this.currentRoom
        };

        // Limpiar usuarios offline (más de 10 segundos sin actualizar)
        const now = Date.now();
        Object.keys(presence).forEach(uid => {
            const timeSince = now - new Date(presence[uid].lastSeen).getTime();
            if (timeSince > 10000) {
                delete presence[uid];
            }
        });

        this.savePresence(presence);
        this.onlineUsers = new Set(Object.keys(presence));
        this.emit('presence', { onlineUsers: Array.from(this.onlineUsers) });
    }

    loadPresence() {
        const saved = localStorage.getItem('realtime_presence');
        return saved ? JSON.parse(saved) : {};
    }

    savePresence(presence) {
        localStorage.setItem('realtime_presence', JSON.stringify(presence));
    }

    getUsername() {
        const user = window.authSystem?.getCurrentUser();
        return user ? user.username : 'Guest';
    }

    disconnect() {
        const presence = this.loadPresence();
        delete presence[this.userId];
        this.savePresence(presence);

        this.isConnected = false;
        this.emit('disconnected');
    }

    // ============================================
    // MENSAJES
    // ============================================

    loadMessages() {
        const saved = localStorage.getItem('realtime_messages');
        return saved ? JSON.parse(saved) : [];
    }

    saveMessages() {
        // Mantener solo últimos 100 mensajes por room
        const roomMessages = {};

        this.messages.forEach(msg => {
            if (!roomMessages[msg.room]) {
                roomMessages[msg.room] = [];
            }
            roomMessages[msg.room].push(msg);
        });

        // Limitar a 100 mensajes por room
        Object.keys(roomMessages).forEach(room => {
            if (roomMessages[room].length > 100) {
                roomMessages[room] = roomMessages[room].slice(-100);
            }
        });

        // Reconstruir array de mensajes
        this.messages = Object.values(roomMessages).flat();

        localStorage.setItem('realtime_messages', JSON.stringify(this.messages));
    }

    sendMessage(text, type = 'text') {
        if (!text.trim()) return;

        const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: this.userId,
            username: this.getUsername(),
            text: text.trim(),
            type, // 'text', 'image', 'file', 'system'
            room: this.currentRoom,
            timestamp: new Date().toISOString(),
            reactions: {},
            edited: false
        };

        this.messages.push(message);
        this.saveMessages();

        this.emit('message', message);
        this.stopTyping();

        return message;
    }

    editMessage(messageId, newText) {
        const message = this.messages.find(m => m.id === messageId);

        if (!message || message.userId !== this.userId) {
            return { success: false, error: 'No puedes editar este mensaje' };
        }

        message.text = newText;
        message.edited = true;
        message.editedAt = new Date().toISOString();

        this.saveMessages();
        this.emit('message_edited', message);

        return { success: true, message };
    }

    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);

        if (index === -1) {
            return { success: false, error: 'Mensaje no encontrado' };
        }

        const message = this.messages[index];

        if (message.userId !== this.userId) {
            return { success: false, error: 'No puedes eliminar este mensaje' };
        }

        this.messages.splice(index, 1);
        this.saveMessages();

        this.emit('message_deleted', { messageId });

        return { success: true };
    }

    getMessages(room = this.currentRoom, limit = 50) {
        return this.messages
            .filter(m => m.room === room)
            .slice(-limit);
    }

    handleNewMessages() {
        const messages = this.loadMessages();

        // Encontrar mensajes nuevos
        const newMessages = messages.filter(m => {
            return !this.messages.some(existing => existing.id === m.id);
        });

        if (newMessages.length > 0) {
            this.messages = messages;

            newMessages.forEach(msg => {
                if (msg.userId !== this.userId && msg.room === this.currentRoom) {
                    this.emit('message', msg);

                    // Notificación desktop
                    this.showNotification(msg);
                }
            });
        }
    }

    // ============================================
    // TYPING INDICATORS
    // ============================================

    startTyping() {
        const typing = this.loadTyping();
        typing[this.userId] = {
            userId: this.userId,
            username: this.getUsername(),
            room: this.currentRoom,
            timestamp: new Date().toISOString()
        };

        this.saveTyping(typing);
    }

    stopTyping() {
        const typing = this.loadTyping();
        delete typing[this.userId];
        this.saveTyping(typing);
    }

    loadTyping() {
        const saved = localStorage.getItem('realtime_typing');
        return saved ? JSON.parse(saved) : {};
    }

    saveTyping(typing) {
        // Limpiar typing indicators antiguos (más de 3 segundos)
        const now = Date.now();
        Object.keys(typing).forEach(uid => {
            const timeSince = now - new Date(typing[uid].timestamp).getTime();
            if (timeSince > 3000) {
                delete typing[uid];
            }
        });

        localStorage.setItem('realtime_typing', JSON.stringify(typing));
    }

    handleTypingUpdate() {
        const typing = this.loadTyping();

        this.typingUsers = new Set(
            Object.values(typing)
                .filter(t => t.userId !== this.userId && t.room === this.currentRoom)
                .map(t => t.username)
        );

        this.emit('typing', { users: Array.from(this.typingUsers) });
    }

    // ============================================
    // REACCIONES
    // ============================================

    addReaction(messageId, emoji) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }

        // Toggle reacción
        const index = message.reactions[emoji].indexOf(this.userId);
        if (index > -1) {
            message.reactions[emoji].splice(index, 1);

            // Eliminar emoji si no hay reacciones
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }
        } else {
            message.reactions[emoji].push(this.userId);
        }

        this.saveMessages();
        this.emit('reaction', { messageId, reactions: message.reactions });
    }

    // ============================================
    // ROOMS (SALAS)
    // ============================================

    joinRoom(roomId) {
        this.currentRoom = roomId;
        this.emit('room_joined', { room: roomId });

        // Actualizar presencia
        this.updatePresence();

        return this.getMessages(roomId);
    }

    leaveRoom() {
        this.emit('room_left', { room: this.currentRoom });
        this.currentRoom = null;
    }

    getRoomUsers(roomId = this.currentRoom) {
        const presence = this.loadPresence();

        return Object.values(presence)
            .filter(p => p.room === roomId)
            .map(p => ({
                userId: p.userId,
                username: p.username,
                lastSeen: p.lastSeen
            }));
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================

    showNotification(message) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        // No notificar si la ventana está activa
        if (document.hasFocus()) return;

        new Notification(`${message.username}`, {
            body: message.text,
            icon: '/icon-192.png',
            tag: message.id
        });
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;

        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    // ============================================
    // UTILIDADES
    // ============================================

    searchMessages(query, room = this.currentRoom) {
        return this.messages.filter(m =>
            m.room === room &&
            m.text.toLowerCase().includes(query.toLowerCase())
        );
    }

    getUserMessages(userId, room = this.currentRoom) {
        return this.messages.filter(m =>
            m.room === room && m.userId === userId
        );
    }

    exportChat(room = this.currentRoom, format = 'json') {
        const messages = this.getMessages(room, 1000);

        if (format === 'json') {
            return JSON.stringify(messages, null, 2);
        } else if (format === 'text') {
            let text = `Chat Export - Room: ${room}\n`;
            text += `Exported: ${new Date().toLocaleString()}\n\n`;

            messages.forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                text += `[${time}] ${msg.username}: ${msg.text}\n`;
            });

            return text;
        }

        return messages;
    }

    clearChat(room = this.currentRoom) {
        this.messages = this.messages.filter(m => m.room !== room);
        this.saveMessages();
        this.emit('chat_cleared', { room });
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.RealTimeChatSystem = RealTimeChatSystem;
}
