// Authentication System - Sistema de Autenticación v7.0
// Sistema completo de registro, login y gestión de usuarios

class AuthSystem {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.users = this.loadUsers();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.initSessionCheck();
    }

    // ============================================
    // GESTIÓN DE USUARIOS EN LOCALSTORAGE
    // ============================================

    loadUsers() {
        const users = localStorage.getItem('chatbot_users');
        if (!users) {
            // Crear usuario demo por defecto
            const defaultUsers = [{
                id: this.generateUserId(),
                username: 'demo',
                email: 'demo@repuestos.co',
                password: this.hashPassword('demo123'),
                fullName: 'Usuario Demo',
                phone: '+57 300 000 0000',
                address: {
                    street: 'Calle Principal 123',
                    city: 'Bogotá',
                    department: 'Cundinamarca',
                    zipCode: '110111'
                },
                createdAt: new Date().toISOString(),
                lastLogin: null,
                orders: [],
                preferences: {
                    notifications: true,
                    newsletter: true,
                    theme: 'light'
                }
            }];
            localStorage.setItem('chatbot_users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }
        return JSON.parse(users);
    }

    saveUsers() {
        localStorage.setItem('chatbot_users', JSON.stringify(this.users));
    }

    loadCurrentUser() {
        const sessionData = localStorage.getItem('chatbot_session');
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);

        // Verificar si la sesión ha expirado
        const now = new Date().getTime();
        if (now - session.loginTime > this.sessionTimeout) {
            this.logout();
            return null;
        }

        return session.user;
    }

    saveCurrentUser(user) {
        const sessionData = {
            user: user,
            loginTime: new Date().getTime()
        };
        localStorage.setItem('chatbot_session', JSON.stringify(sessionData));
        this.currentUser = user;
    }

    // ============================================
    // REGISTRO DE USUARIOS
    // ============================================

    register(userData) {
        const { username, email, password, fullName, phone } = userData;

        // Validaciones
        const validation = this.validateRegistration(username, email, password);
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message,
                errors: validation.errors
            };
        }

        // Verificar si el usuario ya existe
        const existingUser = this.users.find(u =>
            u.username.toLowerCase() === username.toLowerCase() ||
            u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return {
                success: false,
                message: existingUser.username.toLowerCase() === username.toLowerCase()
                    ? 'El nombre de usuario ya está en uso'
                    : 'El correo electrónico ya está registrado'
            };
        }

        // Crear nuevo usuario
        const newUser = {
            id: this.generateUserId(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: this.hashPassword(password),
            fullName: fullName.trim(),
            phone: phone ? phone.trim() : '',
            address: {
                street: '',
                city: '',
                department: '',
                zipCode: ''
            },
            createdAt: new Date().toISOString(),
            lastLogin: null,
            orders: [],
            preferences: {
                notifications: true,
                newsletter: true,
                theme: 'light'
            }
        };

        this.users.push(newUser);
        this.saveUsers();

        return {
            success: true,
            message: '¡Registro exitoso! Ya puedes iniciar sesión',
            user: this.sanitizeUser(newUser)
        };
    }

    validateRegistration(username, email, password) {
        const errors = [];

        // Validar username
        if (!username || username.trim().length < 3) {
            errors.push('El nombre de usuario debe tener al menos 3 caracteres');
        }
        if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Ingresa un correo electrónico válido');
        }

        // Validar password
        if (!password || password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        if (password && !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
            errors.push('La contraseña debe contener letras y números');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors[0] : ''
        };
    }

    // ============================================
    // LOGIN Y LOGOUT
    // ============================================

    login(username, password) {
        // Buscar usuario por username o email
        const user = this.users.find(u =>
            u.username.toLowerCase() === username.toLowerCase() ||
            u.email.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
            return {
                success: false,
                message: 'Usuario o contraseña incorrectos'
            };
        }

        // Verificar contraseña
        const passwordHash = this.hashPassword(password);
        if (user.password !== passwordHash) {
            return {
                success: false,
                message: 'Usuario o contraseña incorrectos'
            };
        }

        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Crear sesión
        this.saveCurrentUser(user);

        return {
            success: true,
            message: `¡Bienvenido de nuevo, ${user.fullName}!`,
            user: this.sanitizeUser(user)
        };
    }

    logout() {
        localStorage.removeItem('chatbot_session');
        this.currentUser = null;
        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }

    // ============================================
    // GESTIÓN DE PERFIL
    // ============================================

    updateProfile(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const allowedFields = ['fullName', 'phone', 'address', 'preferences'];
        const user = this.users[userIndex];

        // Actualizar solo campos permitidos
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                if (field === 'address' && typeof updates[field] === 'object') {
                    user.address = { ...user.address, ...updates[field] };
                } else if (field === 'preferences' && typeof updates[field] === 'object') {
                    user.preferences = { ...user.preferences, ...updates[field] };
                } else {
                    user[field] = updates[field];
                }
            }
        }

        this.saveUsers();

        // Actualizar sesión actual si es el usuario logueado
        if (this.currentUser && this.currentUser.id === userId) {
            this.saveCurrentUser(user);
        }

        return {
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: this.sanitizeUser(user)
        };
    }

    updatePassword(userId, currentPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Verificar contraseña actual
        if (user.password !== this.hashPassword(currentPassword)) {
            return { success: false, message: 'La contraseña actual es incorrecta' };
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            return { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' };
        }

        // Actualizar contraseña
        user.password = this.hashPassword(newPassword);
        this.saveUsers();

        return {
            success: true,
            message: 'Contraseña actualizada exitosamente'
        };
    }

    // ============================================
    // GESTIÓN DE DIRECCIONES
    // ============================================

    updateAddress(userId, addressData) {
        return this.updateProfile(userId, { address: addressData });
    }

    getAddress(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.address : null;
    }

    // ============================================
    // HISTORIAL DE PEDIDOS
    // ============================================

    addOrder(userId, orderData) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const order = {
            id: this.generateOrderId(),
            date: new Date().toISOString(),
            ...orderData
        };

        this.users[userIndex].orders.push(order);
        this.saveUsers();

        return {
            success: true,
            message: 'Pedido registrado exitosamente',
            order: order
        };
    }

    getOrders(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.orders : [];
    }

    getOrder(userId, orderId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;

        return user.orders.find(o => o.id === orderId);
    }

    // ============================================
    // UTILIDADES
    // ============================================

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateOrderId() {
        return 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    // Hash simple para demostración (en producción usar bcrypt o similar)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        return hash.toString(36);
    }

    // Eliminar información sensible antes de enviar al cliente
    sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    initSessionCheck() {
        // Verificar sesión cada minuto
        setInterval(() => {
            if (this.currentUser) {
                const sessionData = localStorage.getItem('chatbot_session');
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    const now = new Date().getTime();

                    if (now - session.loginTime > this.sessionTimeout) {
                        this.logout();
                        this.onSessionExpired();
                    }
                }
            }
        }, 60000); // Cada minuto
    }

    onSessionExpired() {
        // Callback que se llamará cuando expire la sesión
        console.log('⚠️ Sesión expirada');
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'warning');
        }
    }

    // ============================================
    // RECUPERACIÓN DE CONTRASEÑA
    // ============================================

    requestPasswordReset(email) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Por seguridad, no revelar si el email existe
            return {
                success: true,
                message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña'
            };
        }

        // Generar token de recuperación (en producción, enviar por email)
        const resetToken = this.generateResetToken();
        const resetData = {
            userId: user.id,
            token: resetToken,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hora
        };

        localStorage.setItem('password_reset_' + user.id, JSON.stringify(resetData));

        return {
            success: true,
            message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña',
            token: resetToken // Solo para demo, en producción enviar por email
        };
    }

    resetPassword(userId, token, newPassword) {
        const resetDataStr = localStorage.getItem('password_reset_' + userId);
        if (!resetDataStr) {
            return { success: false, message: 'Token inválido o expirado' };
        }

        const resetData = JSON.parse(resetDataStr);

        // Verificar token y expiración
        if (resetData.token !== token) {
            return { success: false, message: 'Token inválido' };
        }

        if (new Date() > new Date(resetData.expiresAt)) {
            localStorage.removeItem('password_reset_' + userId);
            return { success: false, message: 'Token expirado' };
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Actualizar contraseña
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        user.password = this.hashPassword(newPassword);
        this.saveUsers();

        // Limpiar token usado
        localStorage.removeItem('password_reset_' + userId);

        return {
            success: true,
            message: 'Contraseña restablecida exitosamente'
        };
    }

    generateResetToken() {
        return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}
