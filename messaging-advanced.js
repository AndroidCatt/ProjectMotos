// Advanced Messaging System - v13.0
// Threads, reactions, mentions, typing indicators, read receipts

class AdvancedMessagingSystem {
    constructor() {
        this.conversations = new Map();
        this.messages = new Map();
        this.threads = new Map();
        this.reactions = new Map();
        this.typingIndicators = new Map();
        this.readReceipts = new Map();
        this.mentions = new Map();

        this.currentUser = null;
        this.listeners = [];

        this.loadFromStorage();
        this.startTypingCleanup();

        console.log('[Messaging] Advanced messaging system initialized');
    }

    // ============================================
    // CONVERSATIONS
    // ============================================

    createConversation(participants, metadata = {}) {
        const conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const conversation = {
            id: conversationId,
            participants: [...new Set(participants)], // Remove duplicates
            metadata: {
                name: metadata.name || null,
                avatar: metadata.avatar || null,
                type: participants.length > 2 ? 'group' : 'direct',
                createdAt: new Date().toISOString(),
                createdBy: this.currentUser,
                ...metadata
            },
            lastMessage: null,
            unreadCount: {},
            pinned: false,
            muted: false,
            archived: false
        };

        // Initialize unread count for each participant
        participants.forEach(p => {
            conversation.unreadCount[p] = 0;
        });

        this.conversations.set(conversationId, conversation);
        this.saveToStorage();

        this.emit('conversation_created', conversation);

        return conversation;
    }

    getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }

    listConversations(userId, filters = {}) {
        let conversations = Array.from(this.conversations.values())
            .filter(conv => conv.participants.includes(userId));

        // Apply filters
        if (filters.archived !== undefined) {
            conversations = conversations.filter(c => c.archived === filters.archived);
        }
        if (filters.pinned !== undefined) {
            conversations = conversations.filter(c => c.pinned === filters.pinned);
        }
        if (filters.type) {
            conversations = conversations.filter(c => c.metadata.type === filters.type);
        }

        // Sort by last message time (pinned first)
        conversations.sort((a, b) => {
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;

            const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.metadata.createdAt);
            const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.metadata.createdAt);

            return bTime - aTime;
        });

        return conversations;
    }

    updateConversation(conversationId, updates) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return null;

        Object.assign(conversation, updates);
        this.conversations.set(conversationId, conversation);
        this.saveToStorage();

        this.emit('conversation_updated', conversation);

        return conversation;
    }

    // ============================================
    // MESSAGES
    // ============================================

    sendMessage(conversationId, content, options = {}) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const message = {
            id: messageId,
            conversationId,
            senderId: this.currentUser,
            content: {
                text: content.text || '',
                type: content.type || 'text', // text, image, file, video, audio, location
                attachments: content.attachments || [],
                metadata: content.metadata || {}
            },
            replyTo: options.replyTo || null, // For threading
            mentions: this.extractMentions(content.text),
            timestamp: new Date().toISOString(),
            edited: false,
            editedAt: null,
            deleted: false,
            deletedAt: null,
            reactions: [],
            readBy: [this.currentUser], // Sender has read
            deliveredTo: [this.currentUser]
        };

        this.messages.set(messageId, message);

        // Update conversation
        conversation.lastMessage = {
            id: messageId,
            text: content.text,
            senderId: this.currentUser,
            timestamp: message.timestamp
        };

        // Increment unread count for other participants
        conversation.participants.forEach(p => {
            if (p !== this.currentUser) {
                conversation.unreadCount[p] = (conversation.unreadCount[p] || 0) + 1;
            }
        });

        this.conversations.set(conversationId, conversation);

        // Handle threading
        if (options.replyTo) {
            this.addToThread(options.replyTo, messageId);
        }

        // Handle mentions
        if (message.mentions.length > 0) {
            this.handleMentions(message);
        }

        this.saveToStorage();
        this.emit('message_sent', message);

        // Simulate delivery
        setTimeout(() => {
            this.markAsDelivered(messageId, conversation.participants);
        }, 100);

        return message;
    }

    getMessage(messageId) {
        return this.messages.get(messageId);
    }

    getMessages(conversationId, options = {}) {
        const limit = options.limit || 50;
        const before = options.before || null;
        const after = options.after || null;

        let messages = Array.from(this.messages.values())
            .filter(msg => msg.conversationId === conversationId && !msg.deleted);

        // Filter by time
        if (before) {
            messages = messages.filter(m => new Date(m.timestamp) < new Date(before));
        }
        if (after) {
            messages = messages.filter(m => new Date(m.timestamp) > new Date(after));
        }

        // Sort by timestamp
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Apply limit
        if (!after) {
            messages = messages.slice(-limit); // Get last N messages
        } else {
            messages = messages.slice(0, limit);
        }

        return messages;
    }

    editMessage(messageId, newContent) {
        const message = this.messages.get(messageId);
        if (!message) return null;

        if (message.senderId !== this.currentUser) {
            throw new Error('Cannot edit messages from other users');
        }

        message.content.text = newContent;
        message.edited = true;
        message.editedAt = new Date().toISOString();

        this.messages.set(messageId, message);
        this.saveToStorage();

        this.emit('message_edited', message);

        return message;
    }

    deleteMessage(messageId, permanent = false) {
        const message = this.messages.get(messageId);
        if (!message) return null;

        if (message.senderId !== this.currentUser) {
            throw new Error('Cannot delete messages from other users');
        }

        if (permanent) {
            this.messages.delete(messageId);
        } else {
            message.deleted = true;
            message.deletedAt = new Date().toISOString();
            message.content.text = '[Mensaje eliminado]';
            this.messages.set(messageId, message);
        }

        this.saveToStorage();
        this.emit('message_deleted', { messageId, permanent });

        return message;
    }

    // ============================================
    // REACTIONS
    // ============================================

    addReaction(messageId, emoji) {
        const message = this.messages.get(messageId);
        if (!message) return null;

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            r => r.userId === this.currentUser && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction
            message.reactions = message.reactions.filter(r => r !== existingReaction);
        } else {
            // Add reaction
            message.reactions.push({
                userId: this.currentUser,
                emoji,
                timestamp: new Date().toISOString()
            });
        }

        this.messages.set(messageId, message);
        this.saveToStorage();

        this.emit('reaction_added', { messageId, emoji, userId: this.currentUser });

        return message;
    }

    getReactionsSummary(messageId) {
        const message = this.messages.get(messageId);
        if (!message) return {};

        const summary = {};

        message.reactions.forEach(reaction => {
            if (!summary[reaction.emoji]) {
                summary[reaction.emoji] = {
                    count: 0,
                    users: []
                };
            }
            summary[reaction.emoji].count++;
            summary[reaction.emoji].users.push(reaction.userId);
        });

        return summary;
    }

    // ============================================
    // THREADS
    // ============================================

    addToThread(parentMessageId, replyMessageId) {
        if (!this.threads.has(parentMessageId)) {
            this.threads.set(parentMessageId, {
                parentId: parentMessageId,
                replies: [],
                replyCount: 0,
                lastReply: null
            });
        }

        const thread = this.threads.get(parentMessageId);
        thread.replies.push(replyMessageId);
        thread.replyCount++;
        thread.lastReply = {
            id: replyMessageId,
            timestamp: new Date().toISOString()
        };

        this.threads.set(parentMessageId, thread);
        this.saveToStorage();

        this.emit('thread_updated', thread);
    }

    getThread(parentMessageId) {
        const thread = this.threads.get(parentMessageId);
        if (!thread) return null;

        const replies = thread.replies
            .map(id => this.messages.get(id))
            .filter(msg => msg && !msg.deleted)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
            ...thread,
            replies
        };
    }

    // ============================================
    // MENTIONS
    // ============================================

    extractMentions(text) {
        if (!text) return [];

        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }

        return mentions;
    }

    handleMentions(message) {
        message.mentions.forEach(username => {
            if (!this.mentions.has(username)) {
                this.mentions.set(username, []);
            }

            this.mentions.get(username).push({
                messageId: message.id,
                conversationId: message.conversationId,
                mentionedBy: message.senderId,
                timestamp: message.timestamp,
                read: false
            });
        });

        this.saveToStorage();
        this.emit('user_mentioned', { message, mentions: message.mentions });
    }

    getMentions(username, unreadOnly = false) {
        const mentions = this.mentions.get(username) || [];

        if (unreadOnly) {
            return mentions.filter(m => !m.read);
        }

        return mentions;
    }

    markMentionAsRead(username, messageId) {
        const mentions = this.mentions.get(username);
        if (!mentions) return;

        const mention = mentions.find(m => m.messageId === messageId);
        if (mention) {
            mention.read = true;
            this.saveToStorage();
        }
    }

    // ============================================
    // TYPING INDICATORS
    // ============================================

    startTyping(conversationId) {
        const key = `${conversationId}_${this.currentUser}`;

        this.typingIndicators.set(key, {
            conversationId,
            userId: this.currentUser,
            startedAt: Date.now()
        });

        this.emit('typing_started', { conversationId, userId: this.currentUser });

        // Auto-stop after 5 seconds
        setTimeout(() => {
            if (this.typingIndicators.has(key)) {
                this.stopTyping(conversationId);
            }
        }, 5000);
    }

    stopTyping(conversationId) {
        const key = `${conversationId}_${this.currentUser}`;
        this.typingIndicators.delete(key);

        this.emit('typing_stopped', { conversationId, userId: this.currentUser });
    }

    getTypingUsers(conversationId) {
        const typing = [];

        this.typingIndicators.forEach((value, key) => {
            if (value.conversationId === conversationId && value.userId !== this.currentUser) {
                typing.push(value.userId);
            }
        });

        return typing;
    }

    startTypingCleanup() {
        // Clean up stale typing indicators every 10 seconds
        setInterval(() => {
            const now = Date.now();
            const staleTimeout = 10000; // 10 seconds

            this.typingIndicators.forEach((value, key) => {
                if (now - value.startedAt > staleTimeout) {
                    this.typingIndicators.delete(key);
                }
            });
        }, 10000);
    }

    // ============================================
    // READ RECEIPTS
    // ============================================

    markAsRead(conversationId, messageIds = []) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        // Reset unread count for current user
        conversation.unreadCount[this.currentUser] = 0;
        this.conversations.set(conversationId, conversation);

        // Mark specific messages as read
        if (messageIds.length === 0) {
            // Mark all messages in conversation as read
            messageIds = Array.from(this.messages.values())
                .filter(m => m.conversationId === conversationId)
                .map(m => m.id);
        }

        messageIds.forEach(messageId => {
            const message = this.messages.get(messageId);
            if (message && !message.readBy.includes(this.currentUser)) {
                message.readBy.push(this.currentUser);
                this.messages.set(messageId, message);
            }
        });

        this.saveToStorage();
        this.emit('messages_read', { conversationId, userId: this.currentUser, messageIds });
    }

    markAsDelivered(messageId, userIds) {
        const message = this.messages.get(messageId);
        if (!message) return;

        userIds.forEach(userId => {
            if (!message.deliveredTo.includes(userId)) {
                message.deliveredTo.push(userId);
            }
        });

        this.messages.set(messageId, message);
        this.saveToStorage();

        this.emit('message_delivered', { messageId, userIds });
    }

    getUnreadCount(conversationId, userId = this.currentUser) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return 0;

        return conversation.unreadCount[userId] || 0;
    }

    getTotalUnreadCount(userId = this.currentUser) {
        let total = 0;

        this.conversations.forEach(conv => {
            if (conv.participants.includes(userId) && !conv.muted) {
                total += conv.unreadCount[userId] || 0;
            }
        });

        return total;
    }

    // ============================================
    // SEARCH
    // ============================================

    searchMessages(query, options = {}) {
        const conversationId = options.conversationId || null;
        const userId = options.userId || null;
        const contentType = options.contentType || null;

        let results = Array.from(this.messages.values())
            .filter(msg => !msg.deleted);

        // Filter by conversation
        if (conversationId) {
            results = results.filter(m => m.conversationId === conversationId);
        }

        // Filter by user
        if (userId) {
            results = results.filter(m => m.senderId === userId);
        }

        // Filter by content type
        if (contentType) {
            results = results.filter(m => m.content.type === contentType);
        }

        // Search in text content
        const lowerQuery = query.toLowerCase();
        results = results.filter(m =>
            m.content.text.toLowerCase().includes(lowerQuery)
        );

        // Sort by relevance (timestamp)
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return results.slice(0, options.limit || 50);
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    setCurrentUser(userId) {
        this.currentUser = userId;
        console.log('[Messaging] Current user set to:', userId);
    }

    // ============================================
    // STORAGE
    // ============================================

    saveToStorage() {
        try {
            localStorage.setItem('messaging_conversations', JSON.stringify(Array.from(this.conversations.entries())));
            localStorage.setItem('messaging_messages', JSON.stringify(Array.from(this.messages.entries())));
            localStorage.setItem('messaging_threads', JSON.stringify(Array.from(this.threads.entries())));
            localStorage.setItem('messaging_mentions', JSON.stringify(Array.from(this.mentions.entries())));
        } catch (error) {
            console.error('[Messaging] Error saving to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const conversations = localStorage.getItem('messaging_conversations');
            if (conversations) {
                this.conversations = new Map(JSON.parse(conversations));
            }

            const messages = localStorage.getItem('messaging_messages');
            if (messages) {
                this.messages = new Map(JSON.parse(messages));
            }

            const threads = localStorage.getItem('messaging_threads');
            if (threads) {
                this.threads = new Map(JSON.parse(threads));
            }

            const mentions = localStorage.getItem('messaging_mentions');
            if (mentions) {
                this.mentions = new Map(JSON.parse(mentions));
            }

            console.log('[Messaging] Loaded from storage:', {
                conversations: this.conversations.size,
                messages: this.messages.size,
                threads: this.threads.size
            });
        } catch (error) {
            console.error('[Messaging] Error loading from storage:', error);
        }
    }

    clearStorage() {
        this.conversations.clear();
        this.messages.clear();
        this.threads.clear();
        this.reactions.clear();
        this.mentions.clear();

        localStorage.removeItem('messaging_conversations');
        localStorage.removeItem('messaging_messages');
        localStorage.removeItem('messaging_threads');
        localStorage.removeItem('messaging_mentions');

        console.log('[Messaging] Storage cleared');
    }

    // ============================================
    // EVENTS
    // ============================================

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('messaging_' + event, { detail: data }));
    }

    on(event, callback) {
        const handler = (e) => callback(e.detail);
        window.addEventListener('messaging_' + event, handler);
        this.listeners.push({ event: 'messaging_' + event, handler });
    }

    off(event, callback) {
        window.removeEventListener('messaging_' + event, callback);
    }

    // ============================================
    // EXPORT
    // ============================================

    exportConversation(conversationId, format = 'json') {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return null;

        const messages = this.getMessages(conversationId, { limit: 10000 });

        const data = {
            conversation,
            messages,
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'text') {
            let text = `Conversation: ${conversation.metadata.name || conversationId}\n`;
            text += `Participants: ${conversation.participants.join(', ')}\n`;
            text += `Created: ${conversation.metadata.createdAt}\n\n`;
            text += '--- Messages ---\n\n';

            messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleString();
                text += `[${date}] ${msg.senderId}: ${msg.content.text}\n`;
            });

            return text;
        }
    }

    getStats() {
        return {
            totalConversations: this.conversations.size,
            totalMessages: this.messages.size,
            totalThreads: this.threads.size,
            unreadMessages: this.getTotalUnreadCount()
        };
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AdvancedMessagingSystem = AdvancedMessagingSystem;
    window.messagingSystem = new AdvancedMessagingSystem();
}

console.log('[Messaging] ✅ messaging-advanced.js loaded');
