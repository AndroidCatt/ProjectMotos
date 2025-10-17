// WebSocket Server - Servidor WebSocket Real v10.0
// Para uso en Node.js con la librería 'ws'

const WebSocketServer = require('ws').Server;
const http = require('http');

class RealTimeWebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = null;
        this.wss = null;
        this.clients = new Map();
        this.rooms = new Map();

        console.log('[WebSocket] Servidor inicializado en puerto', port);
    }

    start() {
        // Crear servidor HTTP
        this.server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('WebSocket Server is running\n');
        });

        // Crear servidor WebSocket
        this.wss = new WebSocketServer({ server: this.server });

        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            const clientInfo = {
                id: clientId,
                ws: ws,
                userId: null,
                username: 'Guest',
                rooms: new Set(['general']),
                lastPing: Date.now()
            };

            this.clients.set(clientId, clientInfo);

            console.log(`[WebSocket] Cliente conectado: ${clientId}`);

            // Enviar ID al cliente
            this.send(clientId, {
                type: 'connected',
                clientId: clientId,
                timestamp: Date.now()
            });

            // Handlers
            ws.on('message', (message) => this.handleMessage(clientId, message));
            ws.on('close', () => this.handleDisconnect(clientId));
            ws.on('error', (error) => this.handleError(clientId, error));
            ws.on('pong', () => this.handlePong(clientId));
        });

        // Iniciar servidor
        this.server.listen(this.port, () => {
            console.log(`[WebSocket] Servidor escuchando en puerto ${this.port}`);
        });

        // Ping interval para mantener conexiones vivas
        this.startHeartbeat();
    }

    stop() {
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
        console.log('[WebSocket] Servidor detenido');
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);
            const client = this.clients.get(clientId);

            console.log(`[WebSocket] Mensaje de ${clientId}:`, data.type);

            switch (data.type) {
                case 'auth':
                    this.handleAuth(clientId, data);
                    break;

                case 'join_room':
                    this.handleJoinRoom(clientId, data.room);
                    break;

                case 'leave_room':
                    this.handleLeaveRoom(clientId, data.room);
                    break;

                case 'chat_message':
                    this.handleChatMessage(clientId, data);
                    break;

                case 'typing_start':
                    this.handleTypingStart(clientId, data.room);
                    break;

                case 'typing_stop':
                    this.handleTypingStop(clientId, data.room);
                    break;

                case 'order_update':
                    this.handleOrderUpdate(clientId, data);
                    break;

                case 'notification':
                    this.handleNotification(clientId, data);
                    break;

                case 'subscribe':
                    this.handleSubscribe(clientId, data);
                    break;

                default:
                    console.warn(`[WebSocket] Tipo de mensaje desconocido: ${data.type}`);
            }
        } catch (error) {
            console.error('[WebSocket] Error al parsear mensaje:', error);
            this.send(clientId, {
                type: 'error',
                message: 'Invalid message format'
            });
        }
    }

    handleAuth(clientId, data) {
        const client = this.clients.get(clientId);
        client.userId = data.userId;
        client.username = data.username || 'User';

        console.log(`[WebSocket] Cliente autenticado: ${client.username} (${clientId})`);

        this.send(clientId, {
            type: 'auth_success',
            userId: client.userId,
            username: client.username
        });

        // Notificar a otros en las salas
        client.rooms.forEach(room => {
            this.broadcastToRoom(room, {
                type: 'user_joined',
                userId: client.userId,
                username: client.username,
                room: room
            }, clientId);
        });
    }

    handleJoinRoom(clientId, room) {
        const client = this.clients.get(clientId);
        client.rooms.add(room);

        if (!this.rooms.has(room)) {
            this.rooms.set(room, new Set());
        }
        this.rooms.get(room).add(clientId);

        console.log(`[WebSocket] ${client.username} se unió a ${room}`);

        this.send(clientId, {
            type: 'room_joined',
            room: room,
            users: this.getRoomUsers(room)
        });

        this.broadcastToRoom(room, {
            type: 'user_joined_room',
            userId: client.userId,
            username: client.username,
            room: room
        }, clientId);
    }

    handleLeaveRoom(clientId, room) {
        const client = this.clients.get(clientId);
        client.rooms.delete(room);

        if (this.rooms.has(room)) {
            this.rooms.get(room).delete(clientId);
        }

        console.log(`[WebSocket] ${client.username} salió de ${room}`);

        this.broadcastToRoom(room, {
            type: 'user_left_room',
            userId: client.userId,
            username: client.username,
            room: room
        });
    }

    handleChatMessage(clientId, data) {
        const client = this.clients.get(clientId);
        const room = data.room || 'general';

        const message = {
            type: 'chat_message',
            id: this.generateMessageId(),
            userId: client.userId,
            username: client.username,
            text: data.text,
            room: room,
            timestamp: Date.now()
        };

        console.log(`[WebSocket] Mensaje de chat en ${room}: ${client.username}`);

        this.broadcastToRoom(room, message);
    }

    handleTypingStart(clientId, room) {
        const client = this.clients.get(clientId);

        this.broadcastToRoom(room, {
            type: 'typing_start',
            userId: client.userId,
            username: client.username,
            room: room
        }, clientId);
    }

    handleTypingStop(clientId, room) {
        const client = this.clients.get(clientId);

        this.broadcastToRoom(room, {
            type: 'typing_stop',
            userId: client.userId,
            username: client.username,
            room: room
        }, clientId);
    }

    handleOrderUpdate(clientId, data) {
        // Enviar actualización de pedido al usuario específico
        const targetClients = Array.from(this.clients.values())
            .filter(c => c.userId === data.userId);

        targetClients.forEach(client => {
            this.send(client.id, {
                type: 'order_updated',
                order: data.order,
                timestamp: Date.now()
            });
        });

        console.log(`[WebSocket] Actualización de pedido enviada a ${data.userId}`);
    }

    handleNotification(clientId, data) {
        // Enviar notificación a usuario(s) específico(s)
        const targetUsers = Array.isArray(data.targetUsers) ? data.targetUsers : [data.targetUserId];

        targetUsers.forEach(userId => {
            const targetClients = Array.from(this.clients.values())
                .filter(c => c.userId === userId);

            targetClients.forEach(client => {
                this.send(client.id, {
                    type: 'notification',
                    notification: data.notification,
                    timestamp: Date.now()
                });
            });
        });

        console.log(`[WebSocket] Notificación enviada a ${targetUsers.length} usuarios`);
    }

    handleSubscribe(clientId, data) {
        const client = this.clients.get(clientId);

        if (!client.subscriptions) {
            client.subscriptions = new Set();
        }

        client.subscriptions.add(data.channel);

        this.send(clientId, {
            type: 'subscribed',
            channel: data.channel
        });

        console.log(`[WebSocket] ${client.username} suscrito a ${data.channel}`);
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);

        if (!client) return;

        console.log(`[WebSocket] Cliente desconectado: ${client.username} (${clientId})`);

        // Notificar a las salas
        client.rooms.forEach(room => {
            this.broadcastToRoom(room, {
                type: 'user_left',
                userId: client.userId,
                username: client.username,
                room: room
            });

            if (this.rooms.has(room)) {
                this.rooms.get(room).delete(clientId);
            }
        });

        this.clients.delete(clientId);
    }

    handleError(clientId, error) {
        console.error(`[WebSocket] Error en ${clientId}:`, error);
    }

    handlePong(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.lastPing = Date.now();
        }
    }

    // ============================================
    // SENDING MESSAGES
    // ============================================

    send(clientId, data) {
        const client = this.clients.get(clientId);

        if (!client || client.ws.readyState !== 1) {
            return false;
        }

        try {
            client.ws.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`[WebSocket] Error al enviar a ${clientId}:`, error);
            return false;
        }
    }

    broadcast(data, excludeClientId = null) {
        let sent = 0;

        this.clients.forEach((client, clientId) => {
            if (clientId !== excludeClientId) {
                if (this.send(clientId, data)) {
                    sent++;
                }
            }
        });

        console.log(`[WebSocket] Broadcast a ${sent} clientes`);
        return sent;
    }

    broadcastToRoom(room, data, excludeClientId = null) {
        if (!this.rooms.has(room)) {
            return 0;
        }

        let sent = 0;

        this.rooms.get(room).forEach(clientId => {
            if (clientId !== excludeClientId) {
                if (this.send(clientId, data)) {
                    sent++;
                }
            }
        });

        return sent;
    }

    // ============================================
    // HEARTBEAT (PING/PONG)
    // ============================================

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();

            this.clients.forEach((client, clientId) => {
                // Si no ha respondido en 60 segundos, desconectar
                if (now - client.lastPing > 60000) {
                    console.log(`[WebSocket] Cliente ${clientId} sin respuesta, desconectando`);
                    client.ws.terminate();
                    this.handleDisconnect(clientId);
                    return;
                }

                // Enviar ping
                if (client.ws.readyState === 1) {
                    client.ws.ping();
                }
            });
        }, 30000); // Cada 30 segundos
    }

    // ============================================
    // UTILITIES
    // ============================================

    generateClientId() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getRoomUsers(room) {
        if (!this.rooms.has(room)) {
            return [];
        }

        const users = [];

        this.rooms.get(room).forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client) {
                users.push({
                    userId: client.userId,
                    username: client.username
                });
            }
        });

        return users;
    }

    getStats() {
        return {
            totalClients: this.clients.size,
            totalRooms: this.rooms.size,
            rooms: Array.from(this.rooms.entries()).map(([room, clients]) => ({
                name: room,
                userCount: clients.size
            }))
        };
    }
}

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
    const server = new RealTimeWebSocketServer(8080);
    server.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n[WebSocket] Cerrando servidor...');
        server.stop();
        process.exit(0);
    });
}

module.exports = RealTimeWebSocketServer;
