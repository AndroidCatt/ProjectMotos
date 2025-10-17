// App V11.0 - Integración AI Chatbot, Blockchain, Video Llamadas
// Funcionalidades avanzadas nivel 11

// Inicializar sistemas del nivel 11
let aiChatbot;
let blockchainPayments;
let videoCallSystem;

// ============================================
// INICIALIZACIÓN NIVEL 11
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[V11] Inicializando funcionalidades del nivel 11...');

    // Inicializar AI Chatbot Avanzado
    aiChatbot = window.aiChatbot;

    // Inicializar Blockchain Payments
    blockchainPayments = window.blockchainPayments;

    // Inicializar Video Call System
    videoCallSystem = window.videoCallSystem;

    // Configurar integraciones
    setupAIChatbot();
    setupBlockchainPayments();
    setupVideoCall();

    console.log('[V11] Nivel 11 inicializado correctamente');
    console.log('[V11] Sistemas activos:', {
        AIChatbot: !!aiChatbot,
        Blockchain: !!blockchainPayments,
        VideoCall: !!videoCallSystem
    });
});

// ============================================
// AI CHATBOT INTEGRATION
// ============================================

function setupAIChatbot() {
    // Interceptar mensajes del chatbot original
    const originalSendBtn = document.getElementById('send-btn');
    if (!originalSendBtn) return;

    originalSendBtn.addEventListener('click', async () => {
        const input = document.getElementById('user-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Procesar con AI
        const response = await aiChatbot.processMessage(message);

        console.log('[AI Response]:', response);

        // Mostrar respuesta mejorada
        if (response.confidence > 0.7) {
            displayAIResponse(response);
        }
    });
}

function displayAIResponse(response) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message ai-enhanced';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="ai-badge">🤖 AI Enhanced</div>
            <p>${response.text}</p>
            ${response.confidence ? `<small>Confianza: ${(response.confidence * 100).toFixed(0)}%</small>` : ''}
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showConversationAnalytics() {
    const history = aiChatbot.getConversationHistory();
    const sentiments = history
        .filter(msg => msg.role === 'user')
        .map(msg => aiChatbot.sentimentAnalyzer.analyze(msg.message));

    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'ai-analytics-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🤖 Análisis de Conversación con IA</h2>
                <button class="modal-close" onclick="closeModal('ai-analytics-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Mensajes</h3>
                        <div class="stat-value">${history.length}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Sentimiento Promedio</h3>
                        <div class="stat-value sentiment-${avgSentiment > 0 ? 'positive' : avgSentiment < 0 ? 'negative' : 'neutral'}">
                            ${avgSentiment > 0 ? '😊 Positivo' : avgSentiment < 0 ? '😞 Negativo' : '😐 Neutral'}
                        </div>
                    </div>
                </div>

                <h3>Historial de Conversación</h3>
                <div class="conversation-history">
                    ${history.map(msg => `
                        <div class="history-item ${msg.role}">
                            <strong>${msg.role === 'user' ? 'Tú' : 'Bot'}:</strong> ${msg.message}
                        </div>
                    `).join('')}
                </div>

                <div class="modal-actions">
                    <button class="btn-primary" onclick="exportConversation()">
                        Exportar Conversación
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function exportConversation() {
    const text = aiChatbot.exportConversation('text');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${Date.now()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Conversación exportada', 'success');
}

// ============================================
// BLOCKCHAIN PAYMENTS
// ============================================

function setupBlockchainPayments() {
    // Agregar opción de pago con cripto en checkout
    window.addEventListener('checkout_ready', () => {
        addCryptoPaymentOption();
    });

    // Monitorear transacciones
    blockchainPayments.on('transaction_update', (data) => {
        console.log('[Blockchain] Transaction update:', data);
        showNotification(`Transacción: ${data.confirmations}/6 confirmaciones`, 'info');
    });
}

function addCryptoPaymentOption() {
    const paymentMethods = document.querySelector('.payment-methods');
    if (!paymentMethods) return;

    const cryptoOption = document.createElement('div');
    cryptoOption.className = 'payment-option';
    cryptoOption.innerHTML = `
        <input type="radio" id="crypto" name="payment" value="crypto">
        <label for="crypto">
            <span class="payment-icon">₿</span>
            <span class="payment-name">Criptomonedas</span>
            <span class="payment-desc">BTC, ETH, USDT, BNB</span>
        </label>
    `;

    paymentMethods.appendChild(cryptoOption);

    // Handler para selección
    cryptoOption.querySelector('input').addEventListener('change', () => {
        showCryptoPaymentModal();
    });
}

async function showCryptoPaymentModal() {
    // Obtener orden actual
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}');

    // Crear solicitud de pago
    const paymentRequest = await blockchainPayments.createPaymentRequest({
        id: 'order_' + Date.now(),
        total: cart.total
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'crypto-payment-modal';
    modal.style.display = 'block';

    const currencies = Object.keys(paymentRequest.cryptoOptions);

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>₿ Pagar con Criptomonedas</h2>
                <button class="modal-close" onclick="closeModal('crypto-payment-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="crypto-tabs">
                    ${currencies.map((currency, i) => `
                        <button class="crypto-tab ${i === 0 ? 'active' : ''}" data-currency="${currency}">
                            ${currency}
                        </button>
                    `).join('')}
                </div>

                <div class="crypto-payment-info">
                    ${currencies.map((currency, i) => `
                        <div class="crypto-content ${i === 0 ? 'active' : ''}" data-currency="${currency}">
                            <div class="amount-display">
                                <h3>${paymentRequest.cryptoOptions[currency].amount} ${currency}</h3>
                                <p>≈ $${cart.total.toLocaleString()} COP</p>
                            </div>

                            <div class="qr-section">
                                <img src="${paymentRequest.cryptoOptions[currency].qrCode}" alt="QR Code" class="qr-code">
                                <p class="wallet-address">${paymentRequest.cryptoOptions[currency].address}</p>
                                <button class="btn-secondary" onclick="copyToClipboard('${paymentRequest.cryptoOptions[currency].address}')">
                                    📋 Copiar Dirección
                                </button>
                            </div>

                            <div class="payment-instructions">
                                <h4>Instrucciones:</h4>
                                <ol>
                                    <li>Escanea el código QR o copia la dirección</li>
                                    <li>Envía exactamente ${paymentRequest.cryptoOptions[currency].amount} ${currency}</li>
                                    <li>Espera la confirmación (6 bloques)</li>
                                </ol>
                            </div>

                            <div class="transaction-input">
                                <label>Hash de Transacción:</label>
                                <input type="text" id="tx-hash-${currency}" placeholder="0x...">
                                <button class="btn-primary" onclick="verifyPayment('${paymentRequest.id}', '${currency}')">
                                    Verificar Pago
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="expiry-timer">
                    ⏰ Esta solicitud expira en: <span id="timer">30:00</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup tabs
    modal.querySelectorAll('.crypto-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const currency = tab.dataset.currency;
            modal.querySelectorAll('.crypto-tab').forEach(t => t.classList.remove('active'));
            modal.querySelectorAll('.crypto-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            modal.querySelector(`.crypto-content[data-currency="${currency}"]`).classList.add('active');
        });
    });

    // Timer
    startExpiryTimer(paymentRequest.expiresAt);
}

async function verifyPayment(paymentRequestId, currency) {
    const txHash = document.getElementById(`tx-hash-${currency}`).value;

    if (!txHash) {
        showNotification('Ingresa el hash de transacción', 'error');
        return;
    }

    showNotification('Verificando transacción...', 'info');

    const result = await blockchainPayments.processPayment(paymentRequestId, currency, txHash);

    if (result.success) {
        closeModal('crypto-payment-modal');
        showNotification('¡Pago confirmado! 🎉', 'success');

        // Mostrar confirmación de pedido
        showOrderConfirmation(result.transaction);
    } else {
        showNotification('Error: ' + result.error, 'error');
    }
}

function startExpiryTimer(expiresAt) {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;

    const interval = setInterval(() => {
        const remaining = expiresAt - Date.now();

        if (remaining <= 0) {
            clearInterval(interval);
            timerEl.textContent = 'EXPIRADO';
            showNotification('Solicitud de pago expirada', 'error');
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function showBlockchainStats() {
    const stats = blockchainPayments.getStatistics();
    const chainValid = blockchainPayments.blockchain.isChainValid();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'blockchain-stats-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>⛓️ Estadísticas Blockchain</h2>
                <button class="modal-close" onclick="closeModal('blockchain-stats-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Transacciones</h3>
                        <div class="stat-value">${stats.totalTransactions}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Valor Total</h3>
                        <div class="stat-value">$${stats.totalValueCOP.toLocaleString()}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Bloques</h3>
                        <div class="stat-value">${blockchainPayments.blockchain.chain.length}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Cadena Válida</h3>
                        <div class="stat-value">${chainValid ? '✅' : '❌'}</div>
                    </div>
                </div>

                <h3>Por Criptomoneda</h3>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Moneda</th>
                            <th>Transacciones</th>
                            <th>Monto Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(stats.byCurrency).map(([currency, data]) => `
                            <tr>
                                <td>${currency}</td>
                                <td>${data.count}</td>
                                <td>${data.totalAmount.toFixed(8)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// VIDEO CALL
// ============================================

function setupVideoCall() {
    // Agregar botón de videollamada en soporte
    const supportSection = document.querySelector('.support-section');
    if (supportSection) {
        const videoBtn = document.createElement('button');
        videoBtn.className = 'btn-primary';
        videoBtn.innerHTML = '📹 Videollamada con Soporte';
        videoBtn.onclick = initiateVideoCall;
        supportSection.appendChild(videoBtn);
    }

    // Event listeners
    videoCallSystem.on('remote_stream', (stream) => {
        displayRemoteVideo(stream);
    });

    videoCallSystem.on('call_ended', () => {
        closeVideoCallModal();
        showNotification('Llamada finalizada', 'info');
    });
}

async function initiateVideoCall() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'video-call-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-fullscreen">
            <div class="modal-header">
                <h2>📹 Videollamada con Soporte</h2>
                <button class="modal-close" onclick="endVideoCall()">✕</button>
            </div>
            <div class="modal-body video-call-container">
                <div class="remote-video-wrapper">
                    <video id="remote-video" autoplay playsinline></video>
                    <div class="video-label">Agente de Soporte</div>
                </div>
                <div class="local-video-wrapper">
                    <video id="local-video" autoplay muted playsinline></video>
                    <div class="video-label">Tú</div>
                </div>

                <div class="video-controls">
                    <button id="toggle-video-btn" class="control-btn" onclick="toggleVideoCall()">
                        📹 Video
                    </button>
                    <button id="toggle-audio-btn" class="control-btn" onclick="toggleAudioCall()">
                        🎤 Audio
                    </button>
                    <button id="share-screen-btn" class="control-btn" onclick="shareScreen()">
                        🖥️ Compartir Pantalla
                    </button>
                    <button id="end-call-btn" class="control-btn end-call" onclick="endVideoCall()">
                        📞 Finalizar
                    </button>
                </div>

                <div class="call-status">
                    <span id="call-status">Conectando...</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Iniciar llamada
    const result = await videoCallSystem.initiateCall('support_agent_1');

    if (result.success) {
        // Mostrar video local
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = videoCallSystem.localStream;

        document.getElementById('call-status').textContent = 'Llamando...';
    } else {
        showNotification('Error al iniciar llamada: ' + result.error, 'error');
        closeModal('video-call-modal');
    }
}

function displayRemoteVideo(stream) {
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
        document.getElementById('call-status').textContent = 'Conectado';
    }
}

function toggleVideoCall() {
    const enabled = videoCallSystem.toggleVideo();
    const btn = document.getElementById('toggle-video-btn');
    btn.textContent = enabled ? '📹 Video' : '📹 Video (Off)';
    btn.classList.toggle('disabled', !enabled);
}

function toggleAudioCall() {
    const enabled = videoCallSystem.toggleAudio();
    const btn = document.getElementById('toggle-audio-btn');
    btn.textContent = enabled ? '🎤 Audio' : '🎤 Audio (Muted)';
    btn.classList.toggle('disabled', !enabled);
}

async function shareScreen() {
    const result = await videoCallSystem.startScreenSharing();
    if (result.success) {
        showNotification('Compartiendo pantalla', 'success');
        const btn = document.getElementById('share-screen-btn');
        btn.textContent = '🖥️ Detener Pantalla';
        btn.onclick = stopSharingScreen;
    } else {
        showNotification('Error al compartir pantalla', 'error');
    }
}

function stopSharingScreen() {
    videoCallSystem.stopScreenSharing();
    const btn = document.getElementById('share-screen-btn');
    btn.textContent = '🖥️ Compartir Pantalla';
    btn.onclick = shareScreen;
}

function endVideoCall() {
    videoCallSystem.endCall();
    closeModal('video-call-modal');
}

function closeVideoCallModal() {
    const modal = document.getElementById('video-call-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copiado al portapapeles', 'success');
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Hacer funciones globales
window.showConversationAnalytics = showConversationAnalytics;
window.exportConversation = exportConversation;
window.showCryptoPaymentModal = showCryptoPaymentModal;
window.verifyPayment = verifyPayment;
window.showBlockchainStats = showBlockchainStats;
window.initiateVideoCall = initiateVideoCall;
window.toggleVideoCall = toggleVideoCall;
window.toggleAudioCall = toggleAudioCall;
window.shareScreen = shareScreen;
window.endVideoCall = endVideoCall;
window.copyToClipboard = copyToClipboard;

console.log('[V11] app-v11.js cargado completamente');
