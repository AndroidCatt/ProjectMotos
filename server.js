const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// API Endpoints

// Obtener todas las marcas
app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM brands', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obtener modelos por marca
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

// Obtener categorías
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obtener repuestos por marca y categoría
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

// Buscar repuestos por texto
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

// Endpoint para el chatbot con NLP
app.post('/api/chat', (req, res) => {
    const { message, context } = req.body;

    // Aquí implementaremos la lógica del chatbot con NLP
    const response = processChatMessage(message, context);
    res.json(response);
});

// Función para procesar mensajes del chat
function processChatMessage(message, context) {
    const natural = require('natural');
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());

    // Detección de intenciones básica
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

    return {
        intention: detectedIntention,
        tokens: tokens,
        context: context
    };
}

// Guardar conversación
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

// Obtener historial de conversación
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

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
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
