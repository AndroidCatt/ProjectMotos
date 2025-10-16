const sqlite3 = require('sqlite3').verbose();

// Crear/conectar base de datos
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al crear la base de datos:', err);
        return;
    }
    console.log('Base de datos creada/conectada exitosamente');
});

// Crear tablas
db.serialize(() => {
    // Tabla de marcas
    db.run(`CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        country TEXT DEFAULT 'Colombia',
        description TEXT
    )`);

    // Tabla de modelos
    db.run(`CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        year INTEGER,
        engine_cc INTEGER,
        FOREIGN KEY (brand_id) REFERENCES brands(id)
    )`);

    // Tabla de categorías
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
    )`);

    // Tabla de repuestos
    db.run(`CREATE TABLE IF NOT EXISTS parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        stock INTEGER DEFAULT 0,
        compatible_models TEXT,
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    // Tabla de conversaciones
    db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        user_message TEXT,
        bot_response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de carrito
    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (part_id) REFERENCES parts(id)
    )`);

    // Tabla de pedidos
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        delivery_address TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tabla de items de pedido
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (part_id) REFERENCES parts(id)
    )`);

    // Tabla de favoritos
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (part_id) REFERENCES parts(id),
        UNIQUE(user_id, part_id)
    )`);

    console.log('Tablas creadas exitosamente');

    // Insertar usuario administrador por defecto
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const adminPassword = 'admin123';

    bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error al crear hash de contraseña:', err);
            return;
        }

        db.run(`INSERT OR IGNORE INTO users (username, email, password, full_name, role)
                VALUES (?, ?, ?, ?, ?)`,
                ['admin', 'admin@repuestos.com', hash, 'Administrador', 'admin'],
                (err) => {
                    if (err) {
                        console.error('Error al crear usuario admin:', err);
                    } else {
                        console.log('Usuario administrador creado (username: admin, password: admin123)');
                    }
                });
    });

    // Insertar datos de marcas
    const brands = [
        { name: 'Auteco', description: 'Marca colombiana líder en motocicletas' },
        { name: 'AKT', description: 'Marca colombiana de motos económicas y deportivas' },
        { name: 'TVS', description: 'Marca india con presencia en Colombia' },
        { name: 'Boxer', description: 'Marca colombiana de motos de trabajo' }
    ];

    const insertBrand = db.prepare('INSERT OR IGNORE INTO brands (name, description) VALUES (?, ?)');
    brands.forEach(brand => {
        insertBrand.run(brand.name, brand.description);
    });
    insertBrand.finalize();

    // Insertar modelos
    const models = [
        { brand: 'Auteco', models: ['Discover 125', 'Pulsar NS 200', 'Pulsar NS 160', 'Victory 100'] },
        { brand: 'AKT', models: ['NKD 125', 'TTR 200', 'CR5 180', 'AK 125'] },
        { brand: 'TVS', models: ['Apache RTR 160', 'Apache RTR 200', 'Sport 100'] },
        { brand: 'Boxer', models: ['BM 150', 'BM 125', 'CT 100'] }
    ];

    db.all('SELECT * FROM brands', [], (err, brandRows) => {
        if (err) {
            console.error(err);
            return;
        }

        const insertModel = db.prepare('INSERT INTO models (brand_id, name, engine_cc) VALUES (?, ?, ?)');

        models.forEach(brandData => {
            const brand = brandRows.find(b => b.name === brandData.brand);
            if (brand) {
                brandData.models.forEach(modelName => {
                    const cc = parseInt(modelName.match(/\d+/)?.[0]) || 125;
                    insertModel.run(brand.id, modelName, cc);
                });
            }
        });
        insertModel.finalize();
    });

    // Insertar categorías
    const categories = [
        { name: 'Motor', description: 'Componentes del motor' },
        { name: 'Suspensión', description: 'Sistema de suspensión' },
        { name: 'Frenos', description: 'Sistema de frenos' },
        { name: 'Sistema Eléctrico', description: 'Componentes eléctricos' },
        { name: 'Transmisión', description: 'Sistema de transmisión' },
        { name: 'Otros', description: 'Otros repuestos' }
    ];

    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
    categories.forEach(cat => {
        insertCategory.run(cat.name, cat.description);
    });
    insertCategory.finalize();

    // Insertar repuestos con precios
    setTimeout(() => {
        db.all('SELECT * FROM brands', [], (err, brandRows) => {
            db.all('SELECT * FROM categories', [], (err, categoryRows) => {
                if (err || !brandRows || !categoryRows) {
                    console.error('Error al obtener datos:', err);
                    return;
                }

                const parts = [
                    // Motor
                    { category: 'Motor', name: 'Kit de arrastre completo', price: 120000, stock: 15, description: 'Kit completo de arrastre original' },
                    { category: 'Motor', name: 'Filtro de aceite', price: 15000, stock: 50, description: 'Filtro de aceite de alta calidad' },
                    { category: 'Motor', name: 'Bujía NGK', price: 8000, stock: 100, description: 'Bujía NGK original' },
                    { category: 'Motor', name: 'Empaque de motor completo', price: 45000, stock: 20, description: 'Set de empaques de motor' },
                    { category: 'Motor', name: 'Pistón con anillos', price: 85000, stock: 12, description: 'Pistón completo con anillos' },
                    { category: 'Motor', name: 'Cilindro', price: 150000, stock: 8, description: 'Cilindro cromado' },

                    // Suspensión
                    { category: 'Suspensión', name: 'Amortiguador delantero', price: 180000, stock: 10, description: 'Amortiguador delantero hidráulico' },
                    { category: 'Suspensión', name: 'Amortiguador trasero', price: 220000, stock: 8, description: 'Amortiguador trasero regulable' },
                    { category: 'Suspensión', name: 'Resortes de suspensión', price: 35000, stock: 25, description: 'Par de resortes' },
                    { category: 'Suspensión', name: 'Horquilla completa', price: 280000, stock: 5, description: 'Horquilla delantera completa' },

                    // Frenos
                    { category: 'Frenos', name: 'Pastillas de freno delanteras', price: 35000, stock: 40, description: 'Pastillas cerámicas de alto rendimiento' },
                    { category: 'Frenos', name: 'Pastillas de freno traseras', price: 28000, stock: 40, description: 'Pastillas traseras originales' },
                    { category: 'Frenos', name: 'Disco de freno delantero', price: 95000, stock: 15, description: 'Disco ventilado de 240mm' },
                    { category: 'Frenos', name: 'Bomba de freno', price: 75000, stock: 10, description: 'Bomba de freno hidráulica' },
                    { category: 'Frenos', name: 'Cable de freno', price: 12000, stock: 30, description: 'Cable de acero reforzado' },

                    // Sistema Eléctrico
                    { category: 'Sistema Eléctrico', name: 'Batería 12V', price: 95000, stock: 20, description: 'Batería de gel 12V 7Ah' },
                    { category: 'Sistema Eléctrico', name: 'Regulador de voltaje', price: 55000, stock: 18, description: 'Regulador rectificador' },
                    { category: 'Sistema Eléctrico', name: 'Bobina de encendido', price: 45000, stock: 15, description: 'Bobina de alto voltaje' },
                    { category: 'Sistema Eléctrico', name: 'CDI', price: 85000, stock: 12, description: 'Unidad CDI digital' },
                    { category: 'Sistema Eléctrico', name: 'Switch de encendido', price: 25000, stock: 25, description: 'Switch con llaves' },
                    { category: 'Sistema Eléctrico', name: 'Estator', price: 120000, stock: 8, description: 'Estator generador' },

                    // Transmisión
                    { category: 'Transmisión', name: 'Cadena 428', price: 65000, stock: 30, description: 'Cadena reforzada 428H 120L' },
                    { category: 'Transmisión', name: 'Piñón 14 dientes', price: 25000, stock: 35, description: 'Piñón de ataque' },
                    { category: 'Transmisión', name: 'Corona 42 dientes', price: 45000, stock: 35, description: 'Corona posterior' },
                    { category: 'Transmisión', name: 'Kit de embrague', price: 150000, stock: 10, description: 'Kit completo de embrague' },
                    { category: 'Transmisión', name: 'Cable de clutch', price: 18000, stock: 25, description: 'Cable de embrague' },

                    // Otros
                    { category: 'Otros', name: 'Llanta delantera 80/100-18', price: 120000, stock: 15, description: 'Llanta tubeless' },
                    { category: 'Otros', name: 'Llanta trasera 100/90-18', price: 145000, stock: 15, description: 'Llanta deportiva' },
                    { category: 'Otros', name: 'Filtro de aire', price: 25000, stock: 40, description: 'Filtro de alto flujo' },
                    { category: 'Otros', name: 'Espejos retrovisores', price: 35000, stock: 30, description: 'Par de espejos' },
                    { category: 'Otros', name: 'Maniguetas de freno', price: 28000, stock: 20, description: 'Par de maniguetas' }
                ];

                const insertPart = db.prepare(`
                    INSERT INTO parts (brand_id, category_id, name, description, price, stock, compatible_models)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                brandRows.forEach(brand => {
                    parts.forEach(part => {
                        const category = categoryRows.find(c => c.name === part.category);
                        if (category) {
                            insertPart.run(
                                brand.id,
                                category.id,
                                part.name,
                                part.description,
                                part.price,
                                part.stock,
                                'Todos los modelos'
                            );
                        }
                    });
                });

                insertPart.finalize();
                console.log('Datos de repuestos insertados exitosamente');
            });
        });
    }, 1000);
});

setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Base de datos inicializada completamente');
    });
}, 3000);
