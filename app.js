// Inicializar el chatbot
const bot = new ChatBot();
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const quickSuggestions = document.getElementById('quick-suggestions');

// Historial de conversación
let conversationHistory = [];

// Theme toggle
const toggleThemeBtn = document.getElementById('toggle-theme');
let isDarkMode = false;

toggleThemeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    toggleThemeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    saveToLocalStorage('theme', isDarkMode ? 'dark' : 'light');
});

// Clear chat
document.getElementById('clear-chat').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
        chatMessages.innerHTML = '<div class="welcome-banner"><h2>¡Bienvenido! 👋</h2><p>Soy tu asistente virtual para encontrar repuestos de motos. Puedo ayudarte a:</p><ul><li>✓ Buscar repuestos por marca y modelo</li><li>✓ Recomendar piezas por categoría</li><li>✓ Explorar todo nuestro catálogo</li></ul><p class="start-message">Escribe "hola" para comenzar o usa los botones interactivos 🚀</p></div>';
        conversationHistory = [];
        saveConversationHistory();
    }
});

// Restart chatbot
document.getElementById('restart-btn').addEventListener('click', () => {
    bot.reset();
    addMessage('¡Hola de nuevo! ¿En qué puedo ayudarte?', false);
    const welcomeResponse = bot.processMessage('hola');
    if (welcomeResponse.card) {
        createCard(welcomeResponse.card);
    }
});

// LocalStorage functions
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(`chatbot_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(`chatbot_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

function saveConversationHistory() {
    saveToLocalStorage('history', conversationHistory.slice(-50)); // Guardar últimos 50 mensajes
}

function loadConversationHistory() {
    const history = loadFromLocalStorage('history');
    if (history && history.length > 0) {
        conversationHistory = history;
        // No restaurar visualmente para mantener el chat limpio
    }
}

// Mostrar indicador de escritura
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Función para agregar mensajes al chat
function addMessage(message, isUser = false) {
    // Remover welcome banner si existe
    const welcomeBanner = chatMessages.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);

    // Guardar en historial
    conversationHistory.push({
        message,
        isUser,
        timestamp: new Date().toISOString()
    });
    saveConversationHistory();

    // Scroll automático hacia abajo
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Función para crear tarjetas interactivas
function createCard(data) {
    // Remover welcome banner si existe
    const welcomeBanner = chatMessages.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.remove();
    }

    const cardDiv = document.createElement('div');
    cardDiv.className = 'message bot-message';

    const card = document.createElement('div');
    card.className = 'card';

    // Header de la tarjeta
    if (data.header) {
        const header = document.createElement('div');
        header.className = 'card-header';
        header.textContent = data.header;
        card.appendChild(header);
    }

    // Texto descriptivo
    if (data.text) {
        const text = document.createElement('p');
        text.textContent = data.text;
        text.style.marginBottom = '8px';
        text.style.fontSize = '14px';
        text.style.color = isDarkMode ? '#e4e6eb' : '#666';
        card.appendChild(text);
    }

    // Opciones con botones
    if (data.options && data.options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'card-options';

        data.options.forEach(option => {
            const button = document.createElement('button');
            button.className = `card-button ${data.type || ''}`;
            button.innerHTML = `<span class="card-button-icon">${option.icon || '▸'}</span><span>${option.label}</span>`;
            button.onclick = () => handleButtonClick(option.value);
            optionsDiv.appendChild(button);
        });

        card.appendChild(optionsDiv);
    }

    // Lista de repuestos
    if (data.parts && data.parts.length > 0) {
        const partsList = document.createElement('div');
        partsList.className = 'parts-list';

        data.parts.forEach(part => {
            const partItem = document.createElement('div');
            partItem.className = 'part-item';
            partItem.innerHTML = `<span class="part-item-icon">✓</span><span>${part}</span>`;
            partsList.appendChild(partItem);
        });

        card.appendChild(partsList);
    }

    // Botones de acción
    if (data.actions && data.actions.length > 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';

        data.actions.forEach(action => {
            const button = document.createElement('button');
            button.className = `action-button ${action.type || 'primary'}`;
            button.textContent = action.label;
            button.onclick = () => handleButtonClick(action.value);
            actionsDiv.appendChild(button);
        });

        card.appendChild(actionsDiv);
    }

    cardDiv.appendChild(card);
    chatMessages.appendChild(cardDiv);

    // Scroll automático hacia abajo
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Función para manejar clics en botones
function handleButtonClick(value) {
    // Mostrar el mensaje del usuario
    addMessage(value, true);

    // Limpiar input
    userInput.value = '';

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Obtener respuesta del bot con delay realista
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = bot.processMessage(value);

        // Mostrar respuesta del bot
        if (botResponse.card) {
            createCard(botResponse.card);
        } else if (botResponse.response) {
            addMessage(botResponse.response, false);
        }
    }, 500 + Math.random() * 500); // Delay aleatorio entre 500-1000ms
}

// Función para enviar mensaje
function sendMessage() {
    const message = userInput.value.trim();

    if (message === '') return;

    // Mostrar mensaje del usuario
    addMessage(message, true);

    // Limpiar input
    userInput.value = '';

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Obtener respuesta del bot con delay realista
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = bot.processMessage(message);

        // Mostrar respuesta del bot
        if (botResponse.card) {
            createCard(botResponse.card);
        } else if (botResponse.response) {
            addMessage(botResponse.response, false);
        }
    }, 600 + Math.random() * 600); // Delay aleatorio entre 600-1200ms
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Quick suggestions
quickSuggestions.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
        const message = e.target.getAttribute('data-message');
        userInput.value = message;
        sendMessage();
    }
});

// Auto-resize input
userInput.addEventListener('input', () => {
    // Placeholder para futuras mejoras
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();

    // Cargar tema guardado
    const savedTheme = loadFromLocalStorage('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleThemeBtn.textContent = '☀️';
    }

    // Cargar historial
    loadConversationHistory();
});

// Prevenir recargas accidentales
window.addEventListener('beforeunload', (e) => {
    if (conversationHistory.length > 1) {
        e.preventDefault();
        e.returnValue = '';
    }
});

console.log('%c🤖 ChatBot de Repuestos Inicializado', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cVersión: 5.0 - Mejorado con IA', 'color: #764ba2; font-size: 12px;');
