const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos existente
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos para actualizar a v3.5');
});

db.serialize(() => {
    console.log('Iniciando actualización a versión 3.5...');

    // Tabla de imágenes de productos
    db.run(`CREATE TABLE IF NOT EXISTS part_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (part_id) REFERENCES parts(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla part_images:', err);
        else console.log('✓ Tabla part_images creada');
    });

    // Tabla de reviews y calificaciones
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (part_id) REFERENCES parts(id),
        UNIQUE(user_id, part_id)
    )`, (err) => {
        if (err) console.error('Error creando tabla reviews:', err);
        else console.log('✓ Tabla reviews creada');
    });

    // Mejorar tabla de conversaciones agregando user_id
    db.run(`CREATE TABLE IF NOT EXISTS conversation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT NOT NULL,
        user_message TEXT,
        bot_response TEXT,
        intent TEXT,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('Error creando tabla conversation_history:', err);
        else console.log('✓ Tabla conversation_history creada');
    });

    // Tabla de estadísticas (para el dashboard admin)
    db.run(`CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creando tabla statistics:', err);
        else console.log('✓ Tabla statistics creada');
    });

    // Agregar columnas adicionales a la tabla parts si no existen
    db.run(`ALTER TABLE parts ADD COLUMN image_url TEXT`, (err) => {
        if (!err) console.log('✓ Columna image_url agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN rating_average REAL DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna rating_average agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN review_count INTEGER DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna review_count agregada a parts');
    });

    db.run(`ALTER TABLE parts ADD COLUMN views INTEGER DEFAULT 0`, (err) => {
        if (!err) console.log('✓ Columna views agregada a parts');
    });

    // Insertar imágenes por defecto para algunos productos
    setTimeout(() => {
        console.log('\nAgregando imágenes de ejemplo...');

        const defaultImages = [
            'https://via.placeholder.com/300x300/3498db/ffffff?text=Motor',
            'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Frenos',
            'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Suspension',
            'https://via.placeholder.com/300x300/f39c12/ffffff?text=Electrico',
            'https://via.placeholder.com/300x300/9b59b6/ffffff?text=Transmision',
            'https://via.placeholder.com/300x300/1abc9c/ffffff?text=Repuesto'
        ];

        db.all('SELECT id, category_id FROM parts LIMIT 50', [], (err, parts) => {
            if (err) {
                console.error('Error obteniendo parts:', err);
                return;
            }

            const insertImage = db.prepare(`
                INSERT INTO part_images (part_id, image_url, is_primary) VALUES (?, ?, 1)
            `);

            parts.forEach(part => {
                const imageUrl = defaultImages[(part.category_id - 1) % defaultImages.length];
                insertImage.run(part.id, imageUrl);
            });

            insertImage.finalize();
            console.log('✓ Imágenes de ejemplo agregadas');
        });

        // Actualizar la columna image_url en parts
        db.all('SELECT id, category_id FROM parts', [], (err, parts) => {
            if (err) return;

            const updatePart = db.prepare(`UPDATE parts SET image_url = ? WHERE id = ?`);

            parts.forEach(part => {
                const imageUrl = defaultImages[(part.category_id - 1) % defaultImages.length];
                updatePart.run(imageUrl, part.id);
            });

            updatePart.finalize();
            console.log('✓ URLs de imágenes actualizadas en parts');
        });
    }, 1000);

    // Insertar algunos reviews de ejemplo
    setTimeout(() => {
        console.log('\nAgregando reviews de ejemplo...');

        const sampleReviews = [
            { user_id: 1, part_id: 1, rating: 5, comment: 'Excelente calidad, muy recomendado' },
            { user_id: 1, part_id: 2, rating: 4, comment: 'Buen producto, llegó rápido' },
            { user_id: 1, part_id: 3, rating: 5, comment: 'Original y de buena calidad' },
            { user_id: 1, part_id: 4, rating: 4, comment: 'Cumple con lo esperado' },
            { user_id: 1, part_id: 5, rating: 5, comment: 'Perfectamente compatible con mi moto' }
        ];

        const insertReview = db.prepare(`
            INSERT OR IGNORE INTO reviews (user_id, part_id, rating, comment) VALUES (?, ?, ?, ?)
        `);

        sampleReviews.forEach(review => {
            insertReview.run(review.user_id, review.part_id, review.rating, review.comment);
        });

        insertReview.finalize();
        console.log('✓ Reviews de ejemplo agregados');

        // Actualizar rating_average y review_count en parts
        db.run(`
            UPDATE parts SET
                rating_average = (SELECT AVG(rating) FROM reviews WHERE reviews.part_id = parts.id),
                review_count = (SELECT COUNT(*) FROM reviews WHERE reviews.part_id = parts.id)
        `, (err) => {
            if (!err) console.log('✓ Calificaciones promedio actualizadas');
        });
    }, 2000);
});

setTimeout(() => {
    console.log('\n========================================');
    console.log('✓ Actualización a v3.5 completada!');
    console.log('========================================\n');
    console.log('Nuevas características agregadas:');
    console.log('  • Sistema de imágenes de productos');
    console.log('  • Sistema de reviews y calificaciones');
    console.log('  • Historial de conversaciones mejorado');
    console.log('  • Estadísticas para dashboard admin');
    console.log('========================================\n');

    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Base de datos cerrada');
    });
}, 4000);
