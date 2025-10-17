// Backend API REST - Servidor Node.js con Express y SQLite v9.0
// Sistema completo de backend con autenticación JWT, rate limiting y validación

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'repuestos-motos-secret-key-2025';

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet()); // Seguridad HTTP headers
app.use(compression()); // Compresión GZIP
app.use(cors()); // CORS para frontend
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por ventana
});
app.use('/api/', limiter);

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5 // máximo 5 intentos de login
});

// ============================================
// BASE DE DATOS SQLite
// ============================================

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err);
    } else {
        console.log('📦 Base de datos SQLite conectada');
        initDatabase();
    }
});

function initDatabase() {
    // Tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1
        )
    `);

    // Tabla de productos
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            category TEXT NOT NULL,
            model TEXT,
            price REAL NOT NULL,
            discount REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            image TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla de pedidos
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_number TEXT UNIQUE NOT NULL,
            total REAL NOT NULL,
            subtotal REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            shipping_method TEXT,
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Tabla de items del pedido
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Tabla de reviews
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            title TEXT,
            comment TEXT NOT NULL,
            verified BOOLEAN DEFAULT 0,
            helpful INTEGER DEFAULT 0,
            not_helpful INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Tabla de analytics
    db.run(`
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            event_data TEXT,
            user_id INTEGER,
            session_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    console.log('✅ Tablas de base de datos inicializadas');
}

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// POST /api/auth/register - Registro de usuario
app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;

        // Validaciones
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        db.run(
            `INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, fullName || null, phone || null],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(409).json({ error: 'Usuario o email ya existe' });
                    }
                    return res.status(500).json({ error: 'Error al crear usuario' });
                }

                const userId = this.lastID;

                // Generar token
                const token = jwt.sign(
                    { id: userId, username, role: 'user' },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    message: 'Usuario registrado exitosamente',
                    token,
                    user: { id: userId, username, email, fullName, role: 'user' }
                });
            }
        );
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        db.get(
            `SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1`,
            [username, username],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al buscar usuario' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                // Verificar contraseña
                const validPassword = await bcrypt.compare(password, user.password);

                if (!validPassword) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                // Actualizar último login
                db.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

                // Generar token
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login exitoso',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/auth/me - Obtener usuario actual
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get(
        `SELECT id, username, email, full_name, phone, role, created_at, last_login FROM users WHERE id = ?`,
        [req.user.id],
        (err, user) => {
            if (err || !user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ user });
        }
    );
});

// ============================================
// RUTAS DE PRODUCTOS
// ============================================

// GET /api/products - Listar productos
app.get('/api/products', (req, res) => {
    const { brand, category, search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (brand) {
        query += ` AND brand = ?`;
        params.push(brand);
    }

    if (category) {
        query += ` AND category = ?`;
        params.push(category);
    }

    if (search) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json({ products, total: products.length });
    });
});

// GET /api/products/:id - Obtener producto por ID
app.get('/api/products/:id', (req, res) => {
    db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener producto' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ product });
    });
});

// POST /api/products - Crear producto (Admin)
app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
    const { name, brand, category, model, price, discount, stock, description } = req.body;

    db.run(
        `INSERT INTO products (name, brand, category, model, price, discount, stock, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, brand, category, model || null, price, discount || 0, stock || 0, description || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear producto' });
            }
            res.status(201).json({ message: 'Producto creado', productId: this.lastID });
        }
    );
});

// PUT /api/products/:id - Actualizar producto (Admin)
app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
    const { name, brand, category, price, discount, stock, description } = req.body;

    db.run(
        `UPDATE products SET name = ?, brand = ?, category = ?, price = ?,
         discount = ?, stock = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, brand, category, price, discount, stock, description, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar producto' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json({ message: 'Producto actualizado' });
        }
    );
});

// DELETE /api/products/:id - Eliminar producto (Admin)
app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar producto' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado' });
    });
});

// ============================================
// RUTAS DE PEDIDOS
// ============================================

// POST /api/orders - Crear pedido
app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, shippingAddress, shippingMethod, paymentMethod } = req.body;

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
    }

    // Calcular total
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const shippingCost = shippingMethod === 'express' ? 15000 : 10000;
    const total = subtotal + shippingCost;

    const orderNumber = 'ORD-' + Date.now();

    // Insertar pedido
    db.run(
        `INSERT INTO orders (user_id, order_number, total, subtotal, shipping_cost, payment_method, shipping_method, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, orderNumber, total, subtotal, shippingCost, paymentMethod, shippingMethod, JSON.stringify(shippingAddress)],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear pedido' });
            }

            const orderId = this.lastID;

            // Insertar items del pedido
            const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);

            items.forEach(item => {
                stmt.run(orderId, item.productId, item.quantity, item.price);
            });

            stmt.finalize();

            res.status(201).json({
                message: 'Pedido creado exitosamente',
                orderId,
                orderNumber,
                total
            });
        }
    );
});

// GET /api/orders - Listar pedidos del usuario
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [req.user.id],
        (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener pedidos' });
            }
            res.json({ orders });
        }
    );
});

// GET /api/orders/:id - Obtener detalle del pedido
app.get('/api/orders/:id', authenticateToken, (req, res) => {
    db.get(
        `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id],
        (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener pedido' });
            }
            if (!order) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            // Obtener items
            db.all(
                `SELECT oi.*, p.name, p.brand FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id],
                (err, items) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al obtener items' });
                    }
                    res.json({ order, items });
                }
            );
        }
    );
});

// ============================================
// RUTAS DE REVIEWS
// ============================================

// GET /api/products/:id/reviews - Obtener reviews de un producto
app.get('/api/products/:id/reviews', (req, res) => {
    db.all(
        `SELECT r.*, u.username, u.full_name FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ? AND r.status = 'approved'
         ORDER BY r.created_at DESC`,
        [req.params.id],
        (err, reviews) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener reviews' });
            }
            res.json({ reviews });
        }
    );
});

// POST /api/products/:id/reviews - Crear review
app.post('/api/products/:id/reviews', authenticateToken, (req, res) => {
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ error: 'Rating y comentario son requeridos' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating debe estar entre 1 y 5' });
    }

    db.run(
        `INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, req.user.id, rating, title || null, comment],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear review' });
            }
            res.status(201).json({ message: 'Review creada', reviewId: this.lastID });
        }
    );
});

// ============================================
// RUTAS DE ANALYTICS
// ============================================

// POST /api/analytics/event - Registrar evento
app.post('/api/analytics/event', (req, res) => {
    const { eventType, eventData, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;

    db.run(
        `INSERT INTO analytics_events (event_type, event_data, user_id, session_id) VALUES (?, ?, ?, ?)`,
        [eventType, JSON.stringify(eventData), userId, sessionId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al registrar evento' });
            }
            res.status(201).json({ message: 'Evento registrado' });
        }
    );
});

// GET /api/analytics/stats - Estadísticas (Admin)
app.get('/api/analytics/stats', authenticateToken, requireAdmin, (req, res) => {
    const stats = {};

    // Total usuarios
    db.get(`SELECT COUNT(*) as total FROM users`, (err, result) => {
        stats.totalUsers = result.total;

        // Total pedidos
        db.get(`SELECT COUNT(*) as total, SUM(total) as revenue FROM orders`, (err, result) => {
            stats.totalOrders = result.total;
            stats.totalRevenue = result.revenue || 0;

            // Total productos
            db.get(`SELECT COUNT(*) as total FROM products`, (err, result) => {
                stats.totalProducts = result.total;

                res.json({ stats });
            });
        });
    });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 API REST Server v9.0 corriendo en http://localhost:${PORT}`);
    console.log(`📚 Endpoints disponibles:`);
    console.log(`   POST /api/auth/register - Registro de usuario`);
    console.log(`   POST /api/auth/login - Iniciar sesión`);
    console.log(`   GET  /api/auth/me - Obtener usuario actual`);
    console.log(`   GET  /api/products - Listar productos`);
    console.log(`   POST /api/products - Crear producto (Admin)`);
    console.log(`   GET  /api/orders - Listar pedidos`);
    console.log(`   POST /api/orders - Crear pedido`);
    console.log(`   GET  /api/products/:id/reviews - Reviews de producto`);
    console.log(`   POST /api/analytics/event - Registrar evento`);
});

// Manejo de errores global
process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Promesa rechazada no manejada:', err);
});
