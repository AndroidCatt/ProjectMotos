require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken, isAdmin, generateToken, hashPassword, comparePassword } = require('./auth');

const app = express();
const PORT = 3000;

// Inicializar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'repuestos-motos-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// ==================== CONFIGURACIÓN DE MULTER PARA UPLOAD DE IMÁGENES ====================

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads/products');
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único: timestamp + nombre original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB por imagen
    }
});

// ==================== ENDPOINTS DE AUTENTICACIÓN ====================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, full_name, phone, address } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const hashedPassword = await hashPassword(password);

        db.run(`INSERT INTO users (username, email, password, full_name, phone, address)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, full_name, phone, address],
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE')) {
                            return res.status(400).json({ error: 'Usuario o email ya existe' });
                        }
                        return res.status(500).json({ error: err.message });
                    }

                    const token = generateToken({
                        id: this.lastID,
                        username,
                        email,
                        role: 'customer'
                    });

                    res.json({
                        message: 'Usuario registrado exitosamente',
                        token,
                        user: { id: this.lastID, username, email, role: 'customer' }
                    });
                });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    db.get('SELECT * FROM users WHERE username = ? OR email = ?',
           [username, username],
           async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await comparePassword(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    });
});

// Obtener perfil del usuario
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email, full_name, phone, address, role FROM users WHERE id = ?',
           [req.user.id],
           (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(user);
    });
});

// ==================== ENDPOINTS DE CARRITO ====================

// Obtener carrito del usuario
app.get('/api/cart', authenticateToken, (req, res) => {
    const query = `
        SELECT c.*, p.name, p.description, p.price, p.stock, b.name as brand_name, cat.name as category_name
        FROM cart c
        JOIN parts p ON c.part_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN categories cat ON p.category_id = cat.id
        WHERE c.user_id = ?
    `;

    db.all(query, [req.user.id], (err, items) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            items,
            total,
            count: items.length
        });
    });
});

// Agregar al carrito
app.post('/api/cart', authenticateToken, (req, res) => {
    const { part_id, quantity = 1 } = req.body;

    // Verificar si ya está en el carrito
    db.get('SELECT * FROM cart WHERE user_id = ? AND part_id = ?',
           [req.user.id, part_id],
           (err, existing) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existing) {
            // Actualizar cantidad
            db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                   [quantity, existing.id],
                   (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Cantidad actualizada', cart_id: existing.id });
            });
        } else {
            // Insertar nuevo item
            db.run('INSERT INTO cart (user_id, part_id, quantity) VALUES (?, ?, ?)',
                   [req.user.id, part_id, quantity],
                   function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Agregado al carrito', cart_id: this.lastID });
            });
        }
    });
});

// Actualizar cantidad en carrito
app.put('/api/cart/:id', authenticateToken, (req, res) => {
    const { quantity } = req.body;

    db.run('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
           [quantity, req.params.id, req.user.id],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cantidad actualizada' });
    });
});

// Eliminar del carrito
app.delete('/api/cart/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart WHERE id = ? AND user_id = ?',
           [req.params.id, req.user.id],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Eliminado del carrito' });
    });
});

// Limpiar carrito
app.delete('/api/cart', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Carrito vaciado' });
    });
});

// ==================== ENDPOINTS DE PEDIDOS ====================

// Crear pedido
app.post('/api/orders', authenticateToken, (req, res) => {
    const { delivery_address, notes } = req.body;

    // Obtener items del carrito
    db.all(`SELECT c.*, p.price
            FROM cart c
            JOIN parts p ON c.part_id = p.id
            WHERE c.user_id = ?`,
           [req.user.id],
           (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Crear pedido
        db.run(`INSERT INTO orders (user_id, total, delivery_address, notes)
                VALUES (?, ?, ?, ?)`,
               [req.user.id, total, delivery_address, notes],
               function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const orderId = this.lastID;

            // Insertar items del pedido
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, part_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `);

            cartItems.forEach(item => {
                insertItem.run(orderId, item.part_id, item.quantity, item.price);

                // Actualizar stock
                db.run('UPDATE parts SET stock = stock - ? WHERE id = ?',
                       [item.quantity, item.part_id]);
            });

            insertItem.finalize();

            // Limpiar carrito
            db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

            res.json({
                message: 'Pedido creado exitosamente',
                order_id: orderId,
                total
            });
        });
    });
});

// Obtener pedidos del usuario
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
           [req.user.id],
           (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(orders);
    });
});

// Obtener detalle de un pedido
app.get('/api/orders/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?',
           [req.params.id, req.user.id],
           (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Obtener items del pedido
        db.all(`SELECT oi.*, p.name, p.description
                FROM order_items oi
                JOIN parts p ON oi.part_id = p.id
                WHERE oi.order_id = ?`,
               [req.params.id],
               (err, items) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ ...order, items });
        });
    });
});

// ==================== ENDPOINTS DE FAVORITOS ====================

// Obtener favoritos
app.get('/api/favorites', authenticateToken, (req, res) => {
    const query = `
        SELECT f.*, p.name, p.description, p.price, p.stock, b.name as brand_name
        FROM favorites f
        JOIN parts p ON f.part_id = p.id
        JOIN brands b ON p.brand_id = b.id
        WHERE f.user_id = ?
    `;

    db.all(query, [req.user.id], (err, favorites) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(favorites);
    });
});

// Agregar a favoritos
app.post('/api/favorites', authenticateToken, (req, res) => {
    const { part_id } = req.body;

    db.run('INSERT INTO favorites (user_id, part_id) VALUES (?, ?)',
           [req.user.id, part_id],
           function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Ya está en favoritos' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Agregado a favoritos', id: this.lastID });
    });
});

// Eliminar de favoritos
app.delete('/api/favorites/:partId', authenticateToken, (req, res) => {
    db.run('DELETE FROM favorites WHERE user_id = ? AND part_id = ?',
           [req.user.id, req.params.partId],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Eliminado de favoritos' });
    });
});

// ==================== ENDPOINTS EXISTENTES (Nivel 2) ====================

app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM brands', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/models/:brandId', (req, res) => {
    const { brandId } = req.params;
    db.all('SELECT * FROM models WHERE brand_id = ?', [brandId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/parts', (req, res) => {
    const { brandId, categoryId } = req.query;

    let query = `
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM parts p
        JOIN categories c ON p.category_id = c.id
        JOIN brands b ON p.brand_id = b.id
        WHERE 1=1
    `;
    const params = [];

    if (brandId) {
        query += ' AND p.brand_id = ?';
        params.push(brandId);
    }

    if (categoryId) {
        query += ' AND p.category_id = ?';
        params.push(categoryId);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/search', (req, res) => {
    const { query } = req.body;

    const sql = `
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM parts p
        JOIN categories c ON p.category_id = c.id
        JOIN brands b ON p.brand_id = b.id
        WHERE p.name LIKE ? OR p.description LIKE ?
        LIMIT 20
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint de chat con GPT
app.post('/api/chat/gpt', async (req, res) => {
    const { message, context } = req.body;

    try {
        // Obtener información del catálogo
        db.all('SELECT name, price, stock FROM parts LIMIT 50', [], async (err, parts) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const catalogInfo = parts.map(p => `${p.name} - $${p.price} (Stock: ${p.stock})`).join('\n');

            const systemPrompt = `Eres un asistente experto en repuestos para motocicletas colombianas.
Tienes conocimiento sobre las marcas: Auteco, AKT, TVS y Boxer.

Catálogo disponible:
${catalogInfo}

Instrucciones:
- Responde de manera amigable y profesional
- Proporciona información sobre precios y disponibilidad cuando se pregunte
- Recomienda productos relevantes
- Si no sabes algo específico, sé honesto
- Mantén las respuestas concisas (máximo 200 palabras)
- Usa emojis ocasionalmente para ser más amigable
- Enfoca las respuestas en repuestos de motos colombianas`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 300,
                temperature: 0.7
            });

            const gptResponse = completion.choices[0].message.content;

            res.json({
                response: gptResponse,
                context: context
            });
        });
    } catch (error) {
        console.error('Error con OpenAI:', error);
        res.status(500).json({
            error: 'Error al procesar con GPT',
            message: error.message
        });
    }
});

// Endpoint de chat básico (fallback)
app.post('/api/chat', (req, res) => {
    const { message, context } = req.body;
    const natural = require('natural');
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());

    const intentions = {
        greeting: ['hola', 'buenos', 'buenas', 'saludos', 'hey'],
        price: ['precio', 'cuesta', 'valor', 'cuanto'],
        availability: ['disponible', 'stock', 'hay', 'tienen'],
        recommendation: ['recomendar', 'necesito', 'busco', 'quiero']
    };

    let detectedIntention = 'general';

    for (let [intention, keywords] of Object.entries(intentions)) {
        if (tokens.some(token => keywords.includes(token))) {
            detectedIntention = intention;
            break;
        }
    }

    res.json({
        intention: detectedIntention,
        tokens: tokens,
        context: context
    });
});

app.post('/api/conversations', (req, res) => {
    const { user_message, bot_response, session_id } = req.body;

    const sql = `INSERT INTO conversations (session_id, user_message, bot_response, timestamp)
                 VALUES (?, ?, ?, datetime('now'))`;

    db.run(sql, [session_id, user_message, bot_response], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.get('/api/conversations/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    db.all('SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp',
           [sessionId],
           (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ==================== ADMIN PANEL ====================

// Obtener todos los pedidos (Admin)
app.get('/api/admin/orders', authenticateToken, isAdmin, (req, res) => {
    db.all(`SELECT o.*, u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC`,
           [],
           (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(orders);
    });
});

// Actualizar estado de pedido (Admin)
app.put('/api/admin/orders/:id', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;

    db.run('UPDATE orders SET status = ? WHERE id = ?',
           [status, req.params.id],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Estado actualizado' });
    });
});

// Agregar repuesto (Admin)
app.post('/api/admin/parts', authenticateToken, isAdmin, (req, res) => {
    const { brand_id, category_id, name, description, price, stock } = req.body;

    db.run(`INSERT INTO parts (brand_id, category_id, name, description, price, stock, compatible_models)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
           [brand_id, category_id, name, description, price, stock, 'Todos los modelos'],
           function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Repuesto agregado', id: this.lastID });
    });
});

// Actualizar repuesto (Admin)
app.put('/api/admin/parts/:id', authenticateToken, isAdmin, (req, res) => {
    const { name, description, price, stock } = req.body;

    db.run('UPDATE parts SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
           [name, description, price, stock, req.params.id],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Repuesto actualizado' });
    });
});

// Eliminar repuesto (Admin)
app.delete('/api/admin/parts/:id', authenticateToken, isAdmin, (req, res) => {
    db.run('DELETE FROM parts WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Repuesto eliminado' });
    });
});

// ==================== ENDPOINTS DE IMÁGENES (ADMIN) V4.0 ====================

// Subir imagen(es) para un producto (Admin) - Soporta múltiples imágenes
app.post('/api/admin/parts/:id/images', authenticateToken, isAdmin, upload.array('images', 5), (req, res) => {
    const partId = req.params.id;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No se subieron imágenes' });
    }

    // Primero verificar si el producto existe
    db.get('SELECT id FROM parts WHERE id = ?', [partId], (err, part) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!part) {
            // Eliminar archivos subidos si el producto no existe
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Insertar cada imagen en la tabla part_images
        const insertPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const imageUrl = `/uploads/products/${file.filename}`;
                const isPrimary = 0; // Por defecto no es primaria

                db.run(
                    'INSERT INTO part_images (part_id, image_url, is_primary) VALUES (?, ?, ?)',
                    [partId, imageUrl, isPrimary],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID, image_url: imageUrl, filename: file.filename });
                    }
                );
            });
        });

        Promise.all(insertPromises)
            .then(results => {
                // Si es la primera imagen, establecerla como primaria y actualizar parts.image_url
                if (results.length > 0) {
                    db.get('SELECT COUNT(*) as count FROM part_images WHERE part_id = ?', [partId], (err, row) => {
                        if (row.count === results.length) {
                            // Estas son las primeras imágenes del producto
                            const firstImageUrl = results[0].image_url;
                            db.run('UPDATE part_images SET is_primary = 1 WHERE id = ?', [results[0].id]);
                            db.run('UPDATE parts SET image_url = ? WHERE id = ?', [firstImageUrl, partId]);
                        }
                    });
                }
                res.json({
                    message: `${results.length} imagen(es) subida(s) exitosamente`,
                    images: results
                });
            })
            .catch(err => {
                // Eliminar archivos si hay error en BD
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
                res.status(500).json({ error: err.message });
            });
    });
});

// Obtener todas las imágenes de un producto
app.get('/api/parts/:id/images', (req, res) => {
    db.all(
        'SELECT * FROM part_images WHERE part_id = ? ORDER BY is_primary DESC, created_at ASC',
        [req.params.id],
        (err, images) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(images);
        }
    );
});

// Establecer imagen primaria de un producto (Admin)
app.put('/api/admin/parts/:partId/images/:imageId/primary', authenticateToken, isAdmin, (req, res) => {
    const { partId, imageId } = req.params;

    // Primero, quitar is_primary de todas las imágenes del producto
    db.run('UPDATE part_images SET is_primary = 0 WHERE part_id = ?', [partId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Establecer la nueva imagen como primaria
        db.run('UPDATE part_images SET is_primary = 1 WHERE id = ? AND part_id = ?', [imageId, partId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Imagen no encontrada' });
            }

            // Actualizar image_url en la tabla parts
            db.get('SELECT image_url FROM part_images WHERE id = ?', [imageId], (err, image) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                db.run('UPDATE parts SET image_url = ? WHERE id = ?', [image.image_url, partId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Imagen primaria actualizada' });
                });
            });
        });
    });
});

// Eliminar imagen de un producto (Admin)
app.delete('/api/admin/parts/:partId/images/:imageId', authenticateToken, isAdmin, (req, res) => {
    const { partId, imageId } = req.params;

    // Obtener info de la imagen antes de eliminarla
    db.get('SELECT * FROM part_images WHERE id = ? AND part_id = ?', [imageId, partId], (err, image) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }

        // Eliminar archivo físico
        const filePath = path.join(__dirname, 'public', image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar de la base de datos
        db.run('DELETE FROM part_images WHERE id = ?', [imageId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Si era la imagen primaria, establecer otra como primaria
            if (image.is_primary === 1) {
                db.get('SELECT * FROM part_images WHERE part_id = ? ORDER BY created_at ASC LIMIT 1', [partId], (err, newPrimary) => {
                    if (newPrimary) {
                        db.run('UPDATE part_images SET is_primary = 1 WHERE id = ?', [newPrimary.id]);
                        db.run('UPDATE parts SET image_url = ? WHERE id = ?', [newPrimary.image_url, partId]);
                    } else {
                        // No quedan más imágenes, poner placeholder
                        db.run('UPDATE parts SET image_url = NULL WHERE id = ?', [partId]);
                    }
                });
            }

            res.json({ message: 'Imagen eliminada exitosamente' });
        });
    });
});

// ==================== ENDPOINTS DE REVIEWS V3.5 ====================

// Obtener reviews de un producto
app.get('/api/reviews/:partId', (req, res) => {
    const query = `
        SELECT r.*, u.username, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.part_id = ?
        ORDER BY r.created_at DESC
    `;

    db.all(query, [req.params.partId], (err, reviews) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(reviews);
    });
});

// Agregar review
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { part_id, rating, comment } = req.body;

    if (!part_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    db.run(`INSERT INTO reviews (user_id, part_id, rating, comment) VALUES (?, ?, ?, ?)`,
           [req.user.id, part_id, rating, comment],
           function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Ya has calificado este producto' });
            }
            return res.status(500).json({ error: err.message });
        }

        // Actualizar rating promedio
        db.run(`
            UPDATE parts SET
                rating_average = (SELECT AVG(rating) FROM reviews WHERE part_id = ?),
                review_count = (SELECT COUNT(*) FROM reviews WHERE part_id = ?)
            WHERE id = ?
        `, [part_id, part_id, part_id]);

        res.json({ message: 'Review agregado', id: this.lastID });
    });
});

// Obtener review del usuario para un producto
app.get('/api/reviews/:partId/user', authenticateToken, (req, res) => {
    db.get('SELECT * FROM reviews WHERE part_id = ? AND user_id = ?',
           [req.params.partId, req.user.id],
           (err, review) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(review || null);
    });
});

// ==================== ENDPOINTS DE BÚSQUEDA AVANZADA V3.5 ====================

// Búsqueda avanzada con filtros
app.get('/api/search/advanced', (req, res) => {
    const {
        query,
        brand,
        category,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        sortBy = 'name',
        order = 'ASC'
    } = req.query;

    let sql = `
        SELECT p.*, b.name as brand_name, c.name as category_name,
               p.rating_average, p.review_count
        FROM parts p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (query) {
        sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`);
    }

    if (brand) {
        sql += ` AND b.name = ?`;
        params.push(brand);
    }

    if (category) {
        sql += ` AND c.name = ?`;
        params.push(category);
    }

    if (minPrice) {
        sql += ` AND p.price >= ?`;
        params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
        sql += ` AND p.price <= ?`;
        params.push(parseFloat(maxPrice));
    }

    if (minRating) {
        sql += ` AND p.rating_average >= ?`;
        params.push(parseFloat(minRating));
    }

    if (inStock === 'true') {
        sql += ` AND p.stock > 0`;
    }

    // Validar sortBy
    const validSorts = ['name', 'price', 'rating_average', 'stock', 'review_count'];
    const sortColumn = validSorts.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY p.${sortColumn} ${sortOrder}`;

    db.all(sql, params, (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// ==================== ENDPOINTS DE HISTORIAL DE CONVERSACIONES V3.5 ====================

// Guardar conversación
app.post('/api/conversations', (req, res) => {
    const { session_id, user_message, bot_response, intent, context } = req.body;
    const user_id = req.body.user_id || null;

    db.run(`INSERT INTO conversation_history
            (user_id, session_id, user_message, bot_response, intent, context)
            VALUES (?, ?, ?, ?, ?, ?)`,
           [user_id, session_id, user_message, bot_response, intent, JSON.stringify(context)],
           function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Conversación guardada', id: this.lastID });
    });
});

// Obtener historial de conversaciones del usuario
app.get('/api/conversations/history', authenticateToken, (req, res) => {
    const limit = parseInt(req.query.limit) || 50;

    db.all(`SELECT * FROM conversation_history
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?`,
           [req.user.id, limit],
           (err, conversations) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(conversations);
    });
});

// ==================== ENDPOINTS DE ESTADÍSTICAS (ADMIN) V3.5 ====================

// Dashboard de estadísticas
app.get('/api/admin/dashboard', authenticateToken, isAdmin, (req, res) => {
    const stats = {};

    // Total de usuarios
    db.get('SELECT COUNT(*) as total FROM users', [], (err, result) => {
        stats.totalUsers = result?.total || 0;

        // Total de pedidos
        db.get('SELECT COUNT(*) as total, SUM(total) as revenue FROM orders', [], (err, result) => {
            stats.totalOrders = result?.total || 0;
            stats.totalRevenue = result?.revenue || 0;

            // Total de productos
            db.get('SELECT COUNT(*) as total, SUM(stock) as totalStock FROM parts', [], (err, result) => {
                stats.totalParts = result?.total || 0;
                stats.totalStock = result?.totalStock || 0;

                // Productos más vendidos
                db.all(`SELECT p.id, p.name, SUM(oi.quantity) as sold, b.name as brand_name
                        FROM order_items oi
                        JOIN parts p ON oi.part_id = p.id
                        JOIN brands b ON p.brand_id = b.id
                        GROUP BY p.id
                        ORDER BY sold DESC
                        LIMIT 10`, [], (err, topProducts) => {
                    stats.topProducts = topProducts || [];

                    // Productos con bajo stock
                    db.all(`SELECT p.id, p.name, p.stock, b.name as brand_name
                            FROM parts p
                            JOIN brands b ON p.brand_id = b.id
                            WHERE p.stock < 10
                            ORDER BY p.stock ASC
                            LIMIT 10`, [], (err, lowStock) => {
                        stats.lowStock = lowStock || [];

                        // Últimas reviews
                        db.all(`SELECT r.*, p.name as part_name, u.username
                                FROM reviews r
                                JOIN parts p ON r.part_id = p.id
                                JOIN users u ON r.user_id = u.id
                                ORDER BY r.created_at DESC
                                LIMIT 10`, [], (err, recentReviews) => {
                            stats.recentReviews = recentReviews || [];

                            // Pedidos por estado
                            db.all(`SELECT status, COUNT(*) as count
                                    FROM orders
                                    GROUP BY status`, [], (err, ordersByStatus) => {
                                stats.ordersByStatus = ordersByStatus || [];

                                res.json(stats);
                            });
                        });
                    });
                });
            });
        });
    });
});

// Estadísticas de ventas por periodo
app.get('/api/admin/sales-stats', authenticateToken, isAdmin, (req, res) => {
    const { period = 'month' } = req.query;

    let dateFormat = '%Y-%m';
    if (period === 'day') dateFormat = '%Y-%m-%d';
    if (period === 'year') dateFormat = '%Y';

    db.all(`SELECT strftime('${dateFormat}', created_at) as period,
                   COUNT(*) as orders,
                   SUM(total) as revenue
            FROM orders
            GROUP BY period
            ORDER BY period DESC
            LIMIT 12`, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(stats);
    });
});

// ==================== ENDPOINTS V4.0 - CUPONES Y DESCUENTOS ====================

// Validar cupón
app.post('/api/coupons/validate', authenticateToken, (req, res) => {
    const { code, total } = req.body;

    db.get(`SELECT * FROM coupons WHERE code = ? AND is_active = 1`, [code], (err, coupon) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!coupon) {
            return res.status(404).json({ error: 'Cupón no válido' });
        }

        // Validar fecha
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            return res.status(400).json({ error: 'Cupón expirado' });
        }

        // Validar usos
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return res.status(400).json({ error: 'Cupón ya alcanzó el máximo de usos' });
        }

        // Validar monto mínimo
        if (total < coupon.min_purchase) {
            return res.status(400).json({
                error: `Compra mínima de $${coupon.min_purchase} requerida`
            });
        }

        // Calcular descuento
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (total * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }

        res.json({
            valid: true,
            coupon: coupon,
            discount: discount,
            final_total: total - discount
        });
    });
});

// Obtener cupones activos
app.get('/api/coupons/active', (req, res) => {
    db.all(`SELECT code, description, discount_type, discount_value, min_purchase
            FROM coupons
            WHERE is_active = 1 AND (valid_until IS NULL OR valid_until > datetime('now'))
            AND (max_uses IS NULL OR current_uses < max_uses)
            ORDER BY discount_value DESC
            LIMIT 5`, [], (err, coupons) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(coupons);
    });
});

// ==================== ENDPOINTS V4.0 - PRODUCTOS RELACIONADOS ====================

// Obtener productos relacionados
app.get('/api/parts/:id/related', (req, res) => {
    const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name, rp.score
        FROM related_products rp
        JOIN parts p ON rp.related_part_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE rp.part_id = ?
        ORDER BY rp.score DESC, p.rating_average DESC
        LIMIT 6
    `;

    db.all(query, [req.params.id], (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// Productos frecuentemente comprados juntos
app.get('/api/parts/:id/frequently-bought-together', (req, res) => {
    const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name, COUNT(*) as frequency
        FROM order_items oi1
        JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi2.part_id != ?
        JOIN parts p ON oi2.part_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE oi1.part_id = ?
        GROUP BY oi2.part_id
        ORDER BY frequency DESC
        LIMIT 4
    `;

    db.all(query, [req.params.id, req.params.id], (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// ==================== ENDPOINTS V4.0 - BÚSQUEDA MEJORADA ====================

// Autocompletado de búsqueda
app.get('/api/search/autocomplete', (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json([]);
    }

    const query = `
        SELECT DISTINCT name, category_id
        FROM parts
        WHERE name LIKE ?
        ORDER BY popularity_score DESC
        LIMIT 8
    `;

    db.all(query, [`%${q}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Guardar búsqueda
app.post('/api/search/save', (req, res) => {
    const { query, results_count, session_id } = req.body;
    const user_id = req.body.user_id || null;

    db.run(`INSERT INTO search_history (user_id, session_id, search_query, results_count)
            VALUES (?, ?, ?, ?)`,
           [user_id, session_id, query, results_count],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Búsquedas populares
app.get('/api/search/popular', (req, res) => {
    db.all(`SELECT search_query, COUNT(*) as count
            FROM search_history
            WHERE created_at > datetime('now', '-7 days')
            GROUP BY search_query
            ORDER BY count DESC
            LIMIT 5`, [], (err, searches) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(searches);
    });
});

// ==================== ENDPOINTS V4.0 - PREFERENCIAS DE USUARIO ====================

// Obtener preferencias
app.get('/api/user/preferences', authenticateToken, (req, res) => {
    db.get(`SELECT * FROM user_preferences WHERE user_id = ?`, [req.user.id], (err, prefs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!prefs) {
            // Crear preferencias por defecto
            db.run(`INSERT INTO user_preferences (user_id) VALUES (?)`, [req.user.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                db.get(`SELECT * FROM user_preferences WHERE id = ?`, [this.lastID], (err, newPrefs) => {
                    res.json(newPrefs);
                });
            });
        } else {
            res.json(prefs);
        }
    });
});

// Actualizar preferencias
app.put('/api/user/preferences', authenticateToken, (req, res) => {
    const { theme, preferred_brand_id, preferred_motorcycle_model, email_notifications, show_onboarding } = req.body;

    const updates = [];
    const params = [];

    if (theme !== undefined) { updates.push('theme = ?'); params.push(theme); }
    if (preferred_brand_id !== undefined) { updates.push('preferred_brand_id = ?'); params.push(preferred_brand_id); }
    if (preferred_motorcycle_model !== undefined) { updates.push('preferred_motorcycle_model = ?'); params.push(preferred_motorcycle_model); }
    if (email_notifications !== undefined) { updates.push('email_notifications = ?'); params.push(email_notifications); }
    if (show_onboarding !== undefined) { updates.push('show_onboarding = ?'); params.push(show_onboarding); }

    updates.push('updated_at = datetime("now")');
    params.push(req.user.id);

    const query = `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`;

    db.run(query, params, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Preferencias actualizadas' });
    });
});

// ==================== ENDPOINTS V4.0 - NOTIFICACIONES ====================

// Obtener notificaciones
app.get('/api/notifications', authenticateToken, (req, res) => {
    const { unread_only } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    if (unread_only === 'true') {
        query += ' AND is_read = 0';
    }
    query += ' ORDER BY created_at DESC LIMIT 20';

    db.all(query, [req.user.id], (err, notifications) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(notifications);
    });
});

// Marcar notificación como leída
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
           [req.params.id, req.user.id],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Notificación marcada como leída' });
    });
});

// Marcar todas como leídas
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
    db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    });
});

// ==================== ENDPOINTS V4.0 - PRODUCTOS DESTACADOS ====================

// Obtener productos destacados
app.get('/api/parts/featured', (req, res) => {
    const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM parts p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_featured = 1
        ORDER BY p.popularity_score DESC
        LIMIT 8
    `;

    db.all(query, [], (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// Obtener productos en oferta
app.get('/api/parts/deals', (req, res) => {
    const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM parts p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.discount_percentage > 0
        ORDER BY p.discount_percentage DESC
        LIMIT 12
    `;

    db.all(query, [], (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// ==================== ENDPOINTS V4.0 - COMPARACIÓN ====================

// Guardar comparación
app.post('/api/comparisons', (req, res) => {
    const { part_ids, session_id } = req.body;
    const user_id = req.body.user_id || null;

    db.run(`INSERT INTO product_comparisons (user_id, session_id, part_ids)
            VALUES (?, ?, ?)`,
           [user_id, session_id, JSON.stringify(part_ids)],
           (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Obtener datos para comparación
app.post('/api/parts/compare', (req, res) => {
    const { part_ids } = req.body;

    if (!part_ids || part_ids.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron productos para comparar' });
    }

    const placeholders = part_ids.map(() => '?').join(',');
    const query = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM parts p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.id IN (${placeholders})
    `;

    db.all(query, part_ids, (err, parts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(parts);
    });
});

// ==================== RUTAS ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Servidor Nivel 4.1 corriendo`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`✨ Nuevas características v4.1:`);
    console.log(`   - 🎨 Tarjetas de productos compactas`);
    console.log(`   - 🖼️ Gestión de imágenes corregida`);
    console.log(`   - ⚡ Navegación mejorada`);
    console.log(`========================================`);
});

// Cerrar base de datos al terminar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Base de datos cerrada');
        process.exit(0);
    });
});
