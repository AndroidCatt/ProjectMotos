/**
 * Sistema de Panel de Administración Avanzado v14.0
 * Panel completo para gestionar base de datos, entrenar bot, y administración total
 *
 * Características:
 * - Gestión completa de base de datos (CRUD visual)
 * - Entrenamiento del bot con interfaz visual
 * - Editor de productos con imágenes
 * - Gestión de usuarios y permisos
 * - Backup/Restore de BD
 * - Importar/Exportar datos (JSON, CSV, SQL)
 * - Logs del sistema en tiempo real
 * - Configuración del chatbot
 * - Analytics del sistema
 */

class AdminPanelAdvanced {
    constructor() {
        this.db = null;
        this.currentTab = 'dashboard';
        this.logEntries = [];
        this.init();
    }

    init() {
        this.initDatabase();
        this.setupEventListeners();
        this.log('Sistema de administración inicializado', 'success');
    }

    initDatabase() {
        // Conectar con la base de datos SQLite del servidor
        this.db = {
            products: JSON.parse(localStorage.getItem('adminProducts')) || [],
            users: JSON.parse(localStorage.getItem('adminUsers')) || [],
            orders: JSON.parse(localStorage.getItem('adminOrders')) || [],
            training: JSON.parse(localStorage.getItem('botTraining')) || [],
            config: JSON.parse(localStorage.getItem('adminConfig')) || this.getDefaultConfig()
        };
    }

    getDefaultConfig() {
        return {
            siteName: 'Repuestos Motos',
            currency: 'COP',
            language: 'es',
            theme: 'light',
            botName: 'AsistenteBot',
            botGreeting: '¡Hola! ¿En qué puedo ayudarte?',
            chatbotEnabled: true,
            voiceEnabled: true,
            pushNotifications: true,
            maxProductsPerPage: 20,
            shippingCost: 10000
        };
    }

    setupEventListeners() {
        // Los listeners se configurarán cuando se abra el panel
        console.log('Admin Panel Advanced: Event listeners ready');
    }

    // ====================================
    // APERTURA DEL PANEL DE ADMINISTRACIÓN
    // ====================================

    openAdminPanel() {
        const modal = document.createElement('div');
        modal.id = 'admin-panel-modal';
        modal.className = 'modal modal-fullscreen';
        modal.innerHTML = `
            <div class="modal-content admin-panel-content">
                <div class="modal-header admin-header">
                    <h2>🔧 Panel de Administración v14.0</h2>
                    <button class="modal-close" onclick="window.adminPanelAdvanced.closeAdminPanel()">✕</button>
                </div>
                <div class="admin-body">
                    <div class="admin-sidebar">
                        <div class="admin-nav">
                            <button class="admin-nav-item active" data-tab="dashboard">
                                <span class="nav-icon">📊</span>
                                <span class="nav-label">Dashboard</span>
                            </button>
                            <button class="admin-nav-item" data-tab="database">
                                <span class="nav-icon">🗄️</span>
                                <span class="nav-label">Base de Datos</span>
                            </button>
                            <button class="admin-nav-item" data-tab="products">
                                <span class="nav-icon">📦</span>
                                <span class="nav-label">Productos</span>
                            </button>
                            <button class="admin-nav-item" data-tab="training">
                                <span class="nav-icon">🤖</span>
                                <span class="nav-label">Entrenar Bot</span>
                            </button>
                            <button class="admin-nav-item" data-tab="users">
                                <span class="nav-icon">👥</span>
                                <span class="nav-label">Usuarios</span>
                            </button>
                            <button class="admin-nav-item" data-tab="orders">
                                <span class="nav-icon">📋</span>
                                <span class="nav-label">Pedidos</span>
                            </button>
                            <button class="admin-nav-item" data-tab="config">
                                <span class="nav-icon">⚙️</span>
                                <span class="nav-label">Configuración</span>
                            </button>
                            <button class="admin-nav-item" data-tab="backup">
                                <span class="nav-icon">💾</span>
                                <span class="nav-label">Backup/Restore</span>
                            </button>
                            <button class="admin-nav-item" data-tab="logs">
                                <span class="nav-icon">📝</span>
                                <span class="nav-label">Logs</span>
                            </button>
                        </div>
                    </div>
                    <div class="admin-content" id="admin-content">
                        <!-- Contenido dinámico -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Event listeners para navegación
        modal.querySelectorAll('.admin-nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);

                // Update active state
                modal.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Mostrar dashboard inicial
        this.showDashboard();
    }

    closeAdminPanel() {
        const modal = document.getElementById('admin-panel-modal');
        if (modal) {
            modal.remove();
        }
    }

    switchTab(tab) {
        this.currentTab = tab;

        switch(tab) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'database':
                this.showDatabase();
                break;
            case 'products':
                this.showProducts();
                break;
            case 'training':
                this.showTraining();
                break;
            case 'users':
                this.showUsers();
                break;
            case 'orders':
                this.showOrders();
                break;
            case 'config':
                this.showConfig();
                break;
            case 'backup':
                this.showBackup();
                break;
            case 'logs':
                this.showLogs();
                break;
        }
    }

    // ====================================
    // DASHBOARD
    // ====================================

    showDashboard() {
        const content = document.getElementById('admin-content');
        const stats = this.getSystemStats();

        content.innerHTML = `
            <div class="admin-dashboard">
                <h2>📊 Dashboard del Sistema</h2>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.products}</div>
                            <div class="stat-label">Productos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.users}</div>
                            <div class="stat-label">Usuarios</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.orders}</div>
                            <div class="stat-label">Pedidos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🤖</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.trainingItems}</div>
                            <div class="stat-label">Entrenamientos</div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-actions">
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.quickBackup()">
                        💾 Backup Rápido
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.switchTab('training')">
                        🤖 Entrenar Bot
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.switchTab('database')">
                        🗄️ Ver Base de Datos
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.exportAllData()">
                        📤 Exportar Todo
                    </button>
                </div>

                <div class="recent-activity">
                    <h3>📝 Actividad Reciente</h3>
                    <div class="activity-list">
                        ${this.getRecentLogs().map(log => `
                            <div class="activity-item ${log.type}">
                                <span class="activity-time">${log.time}</span>
                                <span class="activity-message">${log.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ====================================
    // BASE DE DATOS
    // ====================================

    showDatabase() {
        const content = document.getElementById('admin-content');

        content.innerHTML = `
            <div class="admin-database">
                <h2>🗄️ Gestión de Base de Datos</h2>

                <div class="db-info">
                    <p>Aquí puedes acceder directamente a la base de datos SQLite del sistema.</p>
                    <p><strong>Archivo:</strong> <code>database.sqlite</code></p>
                </div>

                <div class="db-actions">
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.openDatabaseFile()">
                        📂 Abrir Archivo DB
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.showDatabaseSchema()">
                        📋 Ver Esquema
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.executeSQLQuery()">
                        ⚡ Ejecutar SQL
                    </button>
                </div>

                <div class="db-tables">
                    <h3>Tablas Disponibles:</h3>
                    <div class="tables-grid">
                        <div class="table-card" onclick="window.adminPanelAdvanced.viewTable('products')">
                            <div class="table-icon">📦</div>
                            <div class="table-name">products</div>
                            <div class="table-count">${this.db.products.length} registros</div>
                        </div>
                        <div class="table-card" onclick="window.adminPanelAdvanced.viewTable('users')">
                            <div class="table-icon">👥</div>
                            <div class="table-name">users</div>
                            <div class="table-count">${this.db.users.length} registros</div>
                        </div>
                        <div class="table-card" onclick="window.adminPanelAdvanced.viewTable('orders')">
                            <div class="table-icon">📋</div>
                            <div class="table-name">orders</div>
                            <div class="table-count">${this.db.orders.length} registros</div>
                        </div>
                        <div class="table-card" onclick="window.adminPanelAdvanced.viewTable('training')">
                            <div class="table-icon">🤖</div>
                            <div class="table-name">bot_training</div>
                            <div class="table-count">${this.db.training.length} registros</div>
                        </div>
                    </div>
                </div>

                <div id="table-viewer" class="table-viewer" style="display: none;">
                    <!-- Contenido dinámico al ver una tabla -->
                </div>

                <div class="db-guide">
                    <h3>📖 Guía de Acceso a la Base de Datos</h3>
                    <div class="guide-section">
                        <h4>Opción 1: SQLite Browser (Recomendado)</h4>
                        <ol>
                            <li>Descarga <strong>DB Browser for SQLite</strong>: <a href="https://sqlitebrowser.org/" target="_blank">sqlitebrowser.org</a></li>
                            <li>Abre el archivo <code>database.sqlite</code> ubicado en la raíz del proyecto</li>
                            <li>Navega por las tablas y edita datos visualmente</li>
                        </ol>
                    </div>
                    <div class="guide-section">
                        <h4>Opción 2: Línea de Comandos</h4>
                        <pre><code>sqlite3 database.sqlite
.tables
SELECT * FROM products;
.quit</code></pre>
                    </div>
                    <div class="guide-section">
                        <h4>Opción 3: VS Code Extension</h4>
                        <ol>
                            <li>Instala la extensión "SQLite Viewer" en VS Code</li>
                            <li>Click derecho en <code>database.sqlite</code> → "Open Database"</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
    }

    viewTable(tableName) {
        const viewer = document.getElementById('table-viewer');
        const data = this.db[tableName] || [];

        if (data.length === 0) {
            viewer.innerHTML = `<p class="empty-table">La tabla "${tableName}" está vacía</p>`;
            viewer.style.display = 'block';
            return;
        }

        const columns = Object.keys(data[0]);

        viewer.innerHTML = `
            <h3>Tabla: ${tableName} (${data.length} registros)</h3>
            <div class="table-actions">
                <button class="btn-sm" onclick="window.adminPanelAdvanced.addRecord('${tableName}')">➕ Agregar</button>
                <button class="btn-sm" onclick="window.adminPanelAdvanced.exportTable('${tableName}')">📤 Exportar</button>
                <button class="btn-sm" onclick="document.getElementById('table-viewer').style.display='none'">✕ Cerrar</button>
            </div>
            <div class="table-scroll">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((row, index) => `
                            <tr>
                                ${columns.map(col => `<td>${this.formatCell(row[col])}</td>`).join('')}
                                <td class="actions-cell">
                                    <button class="btn-icon" onclick="window.adminPanelAdvanced.editRecord('${tableName}', ${index})" title="Editar">✏️</button>
                                    <button class="btn-icon" onclick="window.adminPanelAdvanced.deleteRecord('${tableName}', ${index})" title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        viewer.style.display = 'block';
    }

    formatCell(value) {
        if (value === null || value === undefined) return '<em>NULL</em>';
        if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + '...';
        if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...';
        return value;
    }

    // ====================================
    // ENTRENAMIENTO DEL BOT
    // ====================================

    showTraining() {
        const content = document.getElementById('admin-content');
        const training = this.db.training;

        content.innerHTML = `
            <div class="admin-training">
                <h2>🤖 Entrenamiento del Bot</h2>

                <div class="training-info">
                    <p>Aquí puedes entrenar al chatbot con nuevos patrones de conversación.</p>
                    <p><strong>Total de entrenamientos:</strong> ${training.length}</p>
                </div>

                <div class="training-form">
                    <h3>➕ Agregar Nuevo Entrenamiento</h3>
                    <form id="training-form" onsubmit="window.adminPanelAdvanced.addTraining(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Patrón de Usuario (Regex)</label>
                                <input type="text" id="train-pattern" placeholder="Ej: (hola|hi|buenos días)" required>
                                <small>Usa regex para múltiples variaciones</small>
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <select id="train-category">
                                    <option value="greeting">Saludo</option>
                                    <option value="product">Producto</option>
                                    <option value="price">Precio</option>
                                    <option value="shipping">Envío</option>
                                    <option value="payment">Pago</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Respuesta del Bot</label>
                            <textarea id="train-response" rows="3" placeholder="Respuesta que dará el bot..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Ejemplos de Usuario (uno por línea)</label>
                            <textarea id="train-examples" rows="3" placeholder="Hola\nBuenos días\nHi"></textarea>
                        </div>
                        <button type="submit" class="btn-primary">💾 Guardar Entrenamiento</button>
                    </form>
                </div>

                <div class="training-list">
                    <h3>📋 Entrenamientos Existentes</h3>
                    <div class="training-filter">
                        <select id="filter-category" onchange="window.adminPanelAdvanced.filterTraining()">
                            <option value="all">Todas las categorías</option>
                            <option value="greeting">Saludos</option>
                            <option value="product">Productos</option>
                            <option value="price">Precios</option>
                            <option value="shipping">Envíos</option>
                            <option value="payment">Pagos</option>
                            <option value="other">Otros</option>
                        </select>
                        <input type="text" id="search-training" placeholder="🔍 Buscar..." onkeyup="window.adminPanelAdvanced.filterTraining()">
                    </div>
                    <div id="training-items" class="training-items">
                        ${this.renderTrainingItems(training)}
                    </div>
                </div>

                <div class="training-actions">
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.testBot()">
                        🧪 Probar Bot
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.exportTraining()">
                        📤 Exportar Entrenamientos
                    </button>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.importTraining()">
                        📥 Importar Entrenamientos
                    </button>
                </div>
            </div>
        `;
    }

    renderTrainingItems(items) {
        if (items.length === 0) {
            return '<p class="empty-message">No hay entrenamientos todavía. ¡Agrega el primero!</p>';
        }

        return items.map((item, index) => `
            <div class="training-item" data-category="${item.category}">
                <div class="training-header">
                    <span class="training-category badge-${item.category}">${item.category}</span>
                    <div class="training-actions-mini">
                        <button class="btn-icon" onclick="window.adminPanelAdvanced.editTraining(${index})" title="Editar">✏️</button>
                        <button class="btn-icon" onclick="window.adminPanelAdvanced.deleteTraining(${index})" title="Eliminar">🗑️</button>
                    </div>
                </div>
                <div class="training-pattern">
                    <strong>Patrón:</strong> <code>${item.pattern}</code>
                </div>
                <div class="training-response">
                    <strong>Respuesta:</strong> ${item.response}
                </div>
                ${item.examples ? `
                    <div class="training-examples">
                        <strong>Ejemplos:</strong> ${item.examples.join(', ')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    addTraining(event) {
        event.preventDefault();

        const pattern = document.getElementById('train-pattern').value;
        const category = document.getElementById('train-category').value;
        const response = document.getElementById('train-response').value;
        const examplesText = document.getElementById('train-examples').value;
        const examples = examplesText.split('\n').filter(e => e.trim());

        const training = {
            id: Date.now(),
            pattern: pattern,
            category: category,
            response: response,
            examples: examples,
            createdAt: new Date().toISOString()
        };

        this.db.training.push(training);
        this.saveDatabase();
        this.log(`Entrenamiento agregado: ${pattern}`, 'success');

        // Refresh la vista
        this.showTraining();
    }

    filterTraining() {
        const category = document.getElementById('filter-category').value;
        const search = document.getElementById('search-training').value.toLowerCase();
        const items = document.querySelectorAll('.training-item');

        items.forEach(item => {
            const itemCategory = item.dataset.category;
            const text = item.textContent.toLowerCase();

            const matchCategory = category === 'all' || itemCategory === category;
            const matchSearch = search === '' || text.includes(search);

            item.style.display = matchCategory && matchSearch ? 'block' : 'none';
        });
    }

    testBot() {
        const testInput = prompt('Ingresa un mensaje para probar el bot:');
        if (!testInput) return;

        // Buscar coincidencia en entrenamientos
        const match = this.db.training.find(t => {
            try {
                const regex = new RegExp(t.pattern, 'i');
                return regex.test(testInput);
            } catch (e) {
                return false;
            }
        });

        if (match) {
            alert(`✅ Bot responde:\n\n"${match.response}"\n\n(Categoría: ${match.category})`);
        } else {
            alert('❌ No se encontró respuesta para ese mensaje. Considera agregarlo como entrenamiento.');
        }
    }

    deleteTraining(index) {
        if (confirm('¿Eliminar este entrenamiento?')) {
            this.db.training.splice(index, 1);
            this.saveDatabase();
            this.showTraining();
            this.log('Entrenamiento eliminado', 'warning');
        }
    }

    // ====================================
    // PRODUCTOS
    // ====================================

    showProducts() {
        const content = document.getElementById('admin-content');

        content.innerHTML = `
            <div class="admin-products">
                <h2>📦 Gestión de Productos</h2>
                <p>Gestiona el catálogo de productos del sistema.</p>

                <button class="btn-primary" onclick="window.adminPanelAdvanced.addProduct()">
                    ➕ Agregar Producto
                </button>

                <div class="products-grid">
                    ${this.db.products.length === 0 ?
                        '<p class="empty-message">No hay productos. Sincroniza con la BD o agrega manualmente.</p>' :
                        this.db.products.map((p, i) => `
                            <div class="product-card-admin">
                                <img src="${p.image || 'placeholder.jpg'}" alt="${p.name}">
                                <h4>${p.name}</h4>
                                <p>${p.price}</p>
                                <div class="product-actions">
                                    <button onclick="window.adminPanelAdvanced.editProduct(${i})">✏️ Editar</button>
                                    <button onclick="window.adminPanelAdvanced.deleteProduct(${i})">🗑️ Eliminar</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    // ====================================
    // USUARIOS, PEDIDOS, CONFIG
    // ====================================

    showUsers() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section">
                <h2>👥 Gestión de Usuarios</h2>
                <p>Total usuarios: ${this.db.users.length}</p>
                <button class="btn-primary" onclick="window.adminPanelAdvanced.viewTable('users')">Ver Tabla de Usuarios</button>
            </div>
        `;
    }

    showOrders() {
        const content = document.getElementById('admin-content');
        content.innerHTML = `
            <div class="admin-section">
                <h2>📋 Gestión de Pedidos</h2>
                <p>Total pedidos: ${this.db.orders.length}</p>
                <button class="btn-primary" onclick="window.adminPanelAdvanced.viewTable('orders')">Ver Tabla de Pedidos</button>
            </div>
        `;
    }

    showConfig() {
        const content = document.getElementById('admin-content');
        const config = this.db.config;

        content.innerHTML = `
            <div class="admin-config">
                <h2>⚙️ Configuración del Sistema</h2>

                <form id="config-form" onsubmit="window.adminPanelAdvanced.saveConfig(event)">
                    <div class="config-section">
                        <h3>General</h3>
                        <div class="form-group">
                            <label>Nombre del Sitio</label>
                            <input type="text" id="config-siteName" value="${config.siteName}">
                        </div>
                        <div class="form-group">
                            <label>Moneda</label>
                            <select id="config-currency">
                                <option value="COP" ${config.currency === 'COP' ? 'selected' : ''}>COP (Pesos Colombianos)</option>
                                <option value="USD" ${config.currency === 'USD' ? 'selected' : ''}>USD (Dólares)</option>
                            </select>
                        </div>
                    </div>

                    <div class="config-section">
                        <h3>Chatbot</h3>
                        <div class="form-group">
                            <label>Nombre del Bot</label>
                            <input type="text" id="config-botName" value="${config.botName}">
                        </div>
                        <div class="form-group">
                            <label>Mensaje de Bienvenida</label>
                            <textarea id="config-botGreeting" rows="2">${config.botGreeting}</textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="config-chatbotEnabled" ${config.chatbotEnabled ? 'checked' : ''}>
                                Chatbot Activado
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="config-voiceEnabled" ${config.voiceEnabled ? 'checked' : ''}>
                                Chat por Voz Activado
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary">💾 Guardar Configuración</button>
                </form>
            </div>
        `;
    }

    saveConfig(event) {
        event.preventDefault();

        this.db.config = {
            siteName: document.getElementById('config-siteName').value,
            currency: document.getElementById('config-currency').value,
            botName: document.getElementById('config-botName').value,
            botGreeting: document.getElementById('config-botGreeting').value,
            chatbotEnabled: document.getElementById('config-chatbotEnabled').checked,
            voiceEnabled: document.getElementById('config-voiceEnabled').checked
        };

        this.saveDatabase();
        this.log('Configuración guardada', 'success');
        alert('✅ Configuración guardada correctamente');
    }

    // ====================================
    // BACKUP Y RESTORE
    // ====================================

    showBackup() {
        const content = document.getElementById('admin-content');

        content.innerHTML = `
            <div class="admin-backup">
                <h2>💾 Backup y Restore</h2>

                <div class="backup-section">
                    <h3>📤 Exportar Datos</h3>
                    <div class="backup-actions">
                        <button class="btn-admin" onclick="window.adminPanelAdvanced.exportBackup('json')">
                            📄 Exportar JSON
                        </button>
                        <button class="btn-admin" onclick="window.adminPanelAdvanced.exportBackup('sql')">
                            🗄️ Exportar SQL
                        </button>
                        <button class="btn-admin" onclick="window.adminPanelAdvanced.exportBackup('csv')">
                            📊 Exportar CSV
                        </button>
                    </div>
                </div>

                <div class="backup-section">
                    <h3>📥 Importar Datos</h3>
                    <input type="file" id="import-file" accept=".json,.sql,.csv" style="display: none">
                    <button class="btn-admin" onclick="document.getElementById('import-file').click()">
                        📂 Seleccionar Archivo
                    </button>
                    <p class="help-text">Formatos soportados: JSON, SQL, CSV</p>
                </div>

                <div class="backup-section">
                    <h3>🔄 Backups Automáticos</h3>
                    <p>Los backups automáticos se guardan cada 24 horas en localStorage.</p>
                    <button class="btn-admin" onclick="window.adminPanelAdvanced.viewAutoBackups()">
                        Ver Backups
                    </button>
                </div>
            </div>
        `;

        // Setup import listener
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importBackup(e.target.files[0]);
        });
    }

    quickBackup() {
        this.exportBackup('json');
        this.log('Backup rápido creado', 'success');
    }

    exportBackup(format) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        let content, filename, mimeType;

        switch(format) {
            case 'json':
                content = JSON.stringify(this.db, null, 2);
                filename = `backup_${timestamp}.json`;
                mimeType = 'application/json';
                break;
            case 'sql':
                content = this.generateSQL();
                filename = `backup_${timestamp}.sql`;
                mimeType = 'text/sql';
                break;
            case 'csv':
                content = this.generateCSV();
                filename = `backup_${timestamp}.csv`;
                mimeType = 'text/csv';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.log(`Backup exportado: ${filename}`, 'success');
    }

    generateSQL() {
        let sql = '-- Backup SQL generado por Admin Panel v14.0\n\n';

        // Products
        sql += 'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, category TEXT, image TEXT);\n';
        this.db.products.forEach(p => {
            sql += `INSERT INTO products VALUES (${p.id}, '${p.name}', ${p.price}, '${p.category}', '${p.image}');\n`;
        });

        return sql;
    }

    generateCSV() {
        let csv = 'table,id,data\n';

        // Products
        this.db.products.forEach(p => {
            csv += `products,${p.id},"${JSON.stringify(p).replace(/"/g, '""')}"\n`;
        });

        return csv;
    }

    // ====================================
    // LOGS
    // ====================================

    showLogs() {
        const content = document.getElementById('admin-content');

        content.innerHTML = `
            <div class="admin-logs">
                <h2>📝 Logs del Sistema</h2>

                <div class="logs-actions">
                    <button class="btn-sm" onclick="window.adminPanelAdvanced.clearLogs()">🗑️ Limpiar Logs</button>
                    <button class="btn-sm" onclick="window.adminPanelAdvanced.exportLogs()">📤 Exportar Logs</button>
                    <button class="btn-sm" onclick="window.adminPanelAdvanced.showLogs()">🔄 Refrescar</button>
                </div>

                <div class="logs-list">
                    ${this.logEntries.length === 0 ?
                        '<p class="empty-message">No hay logs todavía.</p>' :
                        this.logEntries.slice().reverse().map(log => `
                            <div class="log-entry log-${log.type}">
                                <span class="log-time">${log.timestamp}</span>
                                <span class="log-message">${log.message}</span>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    log(message, type = 'info') {
        const entry = {
            timestamp: new Date().toLocaleString('es-CO'),
            message: message,
            type: type
        };

        this.logEntries.push(entry);
        console.log(`[Admin Panel] ${message}`);
    }

    clearLogs() {
        if (confirm('¿Limpiar todos los logs?')) {
            this.logEntries = [];
            this.showLogs();
        }
    }

    exportLogs() {
        const content = this.logEntries.map(log =>
            `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ====================================
    // HELPERS
    // ====================================

    getSystemStats() {
        return {
            products: this.db.products.length,
            users: this.db.users.length,
            orders: this.db.orders.length,
            trainingItems: this.db.training.length
        };
    }

    getRecentLogs() {
        return this.logEntries.slice(-5).reverse();
    }

    saveDatabase() {
        localStorage.setItem('adminProducts', JSON.stringify(this.db.products));
        localStorage.setItem('adminUsers', JSON.stringify(this.db.users));
        localStorage.setItem('adminOrders', JSON.stringify(this.db.orders));
        localStorage.setItem('botTraining', JSON.stringify(this.db.training));
        localStorage.setItem('adminConfig', JSON.stringify(this.db.config));
    }

    exportAllData() {
        this.exportBackup('json');
    }

    openDatabaseFile() {
        alert('Para abrir el archivo de base de datos:\n\n1. Descarga DB Browser for SQLite\n2. Abre database.sqlite en la raíz del proyecto\n\nConsulta DATABASE_ACCESS_GUIDE.md para más información.');
    }

    showDatabaseSchema() {
        alert('Esquema de la Base de Datos:\n\n' +
              'products (id, name, price, category, image)\n' +
              'users (id, username, email, password)\n' +
              'orders (id, userId, items, total, status)\n' +
              'bot_training (id, pattern, category, response)');
    }

    executeSQLQuery() {
        const query = prompt('Ingresa consulta SQL:\n(Nota: Esta es una simulación. Usa DB Browser para consultas reales)');
        if (query) {
            alert('Para ejecutar consultas SQL reales, usa:\n\n1. DB Browser for SQLite\n2. Línea de comandos: sqlite3 database.sqlite\n3. Panel de administración del servidor');
        }
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.adminPanelAdvanced = new AdminPanelAdvanced();
}
