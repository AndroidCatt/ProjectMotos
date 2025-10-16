const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos existente
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos para actualizar a v4.0');
});

db.serialize(() => {
    console.log('Iniciando actualización a versión 4.0...\n');

    // Tabla de comparación de productos
    db.run(`CREATE TABLE IF NOT EXISTS product_comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT NOT NULL,
        part_ids TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla product_comparisons:', err);
        else console.log('✓ Tabla product_comparisons creada');
    });

    // Tabla de cupones y descuentos
    db.run(`CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        discount_type TEXT DEFAULT 'percentage',
        discount_value REAL NOT NULL,
        min_purchase REAL DEFAULT 0,
        max_uses INTEGER DEFAULT NULL,
        current_uses INTEGER DEFAULT 0,
        valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
        valid_until DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creando tabla coupons:', err);
        else console.log('✓ Tabla coupons creada');
    });

    // Tabla de uso de cupones
    db.run(`CREATE TABLE IF NOT EXISTS coupon_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coupon_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        order_id INTEGER,
        discount_amount REAL NOT NULL,
        used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla coupon_usage:', err);
        else console.log('✓ Tabla coupon_usage creada');
    });

    // Tabla de productos relacionados
    db.run(`CREATE TABLE IF NOT EXISTS related_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_id INTEGER NOT NULL,
        related_part_id INTEGER NOT NULL,
        relation_type TEXT DEFAULT 'similar',
        score REAL DEFAULT 1.0,
        FOREIGN KEY (part_id) REFERENCES parts(id),
        FOREIGN KEY (related_part_id) REFERENCES parts(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla related_products:', err);
        else console.log('✓ Tabla related_products creada');
    });

    // Tabla de búsquedas (para autocompletado)
    db.run(`CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT,
        search_query TEXT NOT NULL,
        results_count INTEGER DEFAULT 0,
        clicked_part_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (clicked_part_id) REFERENCES parts(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla search_history:', err);
        else console.log('✓ Tabla search_history creada');
    });

    // Tabla de preferencias de usuario
    db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        theme TEXT DEFAULT 'light',
        preferred_brand_id INTEGER,
        preferred_motorcycle_model TEXT,
        email_notifications INTEGER DEFAULT 1,
        show_onboarding INTEGER DEFAULT 1,
        language TEXT DEFAULT 'es',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (preferred_brand_id) REFERENCES brands(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla user_preferences:', err);
        else console.log('✓ Tabla user_preferences creada');
    });

    // Tabla de notificaciones
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla notifications:', err);
        else console.log('✓ Tabla notifications creada');
    });

    // Agregar campos adicionales a parts
    db.run(`ALTER TABLE parts ADD COLUMN discount_percentage REAL DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna discount_percentage agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN is_featured INTEGER DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna is_featured agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN popularity_score REAL DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna popularity_score agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN tags TEXT`, (err) => {
        if (!err) console.log('✓ Columna tags agregada a parts');
    });

    // Agregar campos adicionales a orders
    db.run(`ALTER TABLE orders ADD COLUMN tracking_status TEXT DEFAULT 'pending'`, (err) => {
        if (!err) console.log('✓ Columna tracking_status agregada a orders');
    });

    db.run(`ALTER TABLE orders ADD COLUMN coupon_code TEXT`, (err) => {
        if (!err) console.log('✓ Columna coupon_code agregada a orders');
    });

    db.run(`ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna discount_amount agregada a orders');
    });

    // Insertar cupones de ejemplo
    setTimeout(() => {
        console.log('\nAgregando cupones de ejemplo...');

        const coupons = [
            { code: 'BIENVENIDO10', description: '10% de descuento para nuevos clientes', discount_type: 'percentage', discount_value: 10, min_purchase: 50000 },
            { code: 'VERANO2025', description: 'Descuento de verano', discount_type: 'percentage', discount_value: 15, min_purchase: 100000 },
            { code: 'PRIMERACOMPRA', description: '$20.000 de descuento en tu primera compra', discount_type: 'fixed', discount_value: 20000, min_purchase: 80000 },
            { code: 'ENVIOGRATIS', description: 'Envío gratis en compras mayores a $150.000', discount_type: 'percentage', discount_value: 5, min_purchase: 150000 },
            { code: 'FRENOS20', description: '20% en sistema de frenos', discount_type: 'percentage', discount_value: 20, min_purchase: 0 }
        ];

        const insertCoupon = db.prepare(`
            INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, min_purchase, max_uses, valid_until)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+3 months'))
        `);

        coupons.forEach(coupon => {
            insertCoupon.run(coupon.code, coupon.description, coupon.discount_type, coupon.discount_value, coupon.min_purchase, 100);
        });

        insertCoupon.finalize();
        console.log('✓ Cupones de ejemplo agregados');
    }, 1000);

    // Agregar productos relacionados automáticamente
    setTimeout(() => {
        console.log('\nGenerando relaciones de productos...');

        db.all('SELECT id, category_id FROM parts', [], (err, parts) => {
            if (err) return;

            const insertRelation = db.prepare(`
                INSERT OR IGNORE INTO related_products (part_id, related_part_id, relation_type, score)
                VALUES (?, ?, ?, ?)
            `);

            parts.forEach(part => {
                // Relacionar con productos de la misma categoría
                const sameCategoryParts = parts.filter(p =>
                    p.category_id === part.category_id && p.id !== part.id
                ).slice(0, 4);

                sameCategoryParts.forEach((related, index) => {
                    const score = 1.0 - (index * 0.1); // Mayor score para los primeros
                    insertRelation.run(part.id, related.id, 'similar', score);
                });
            });

            insertRelation.finalize();
            console.log('✓ Relaciones de productos generadas');
        });
    }, 2000);

    // Marcar algunos productos como destacados
    setTimeout(() => {
        console.log('\nMarcando productos destacados...');

        db.run(`UPDATE parts SET is_featured = 1 WHERE id IN (1, 5, 10, 15, 20, 25, 30)`, (err) => {
            if (!err) console.log('✓ Productos destacados marcados');
        });

        // Agregar algunos descuentos
        db.run(`UPDATE parts SET discount_percentage = 10 WHERE id IN (3, 7, 12, 18, 24)`, (err) => {
            if (!err) console.log('✓ Descuentos aplicados a productos seleccionados');
        });

        // Agregar tags
        db.run(`UPDATE parts SET tags = 'oferta,popular' WHERE discount_percentage > 0`, (err) => {
            if (!err) console.log('✓ Tags agregados a productos');
        });

        db.run(`UPDATE parts SET tags = 'destacado,recomendado' WHERE is_featured = 1`, (err) => {
            if (!err) console.log('✓ Tags agregados a productos destacados');
        });
    }, 3000);

    // Calcular popularidad basada en reviews
    setTimeout(() => {
        console.log('\nCalculando scores de popularidad...');

        db.run(`
            UPDATE parts SET popularity_score =
                (rating_average * 0.4) +
                (CASE WHEN review_count > 0 THEN (review_count * 0.3) ELSE 0 END) +
                (CASE WHEN is_featured = 1 THEN 2.0 ELSE 0 END) +
                (CASE WHEN discount_percentage > 0 THEN 1.5 ELSE 0 END)
        `, (err) => {
            if (!err) console.log('✓ Scores de popularidad calculados');
        });
    }, 4000);
});

setTimeout(() => {
    console.log('\n========================================');
    console.log('✓ Actualización a v4.0 completada!');
    console.log('========================================\n');
    console.log('Nuevas características agregadas:');
    console.log('  • Sistema de comparación de productos');
    console.log('  • Cupones y descuentos');
    console.log('  • Productos relacionados y recomendaciones');
    console.log('  • Historial de búsquedas y autocompletado');
    console.log('  • Preferencias de usuario y temas');
    console.log('  • Sistema de notificaciones');
    console.log('  • Productos destacados y populares');
    console.log('  • Tags y categorización mejorada');
    console.log('========================================\n');

    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Base de datos cerrada');
    });
}, 6000);
