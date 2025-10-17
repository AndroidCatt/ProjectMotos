// Blockchain Payments - Sistema de Pagos con Criptomonedas v11.0
// Bitcoin, Ethereum, USDT integration simulado

class BlockchainPaymentSystem {
    constructor() {
        this.supportedCurrencies = ['BTC', 'ETH', 'USDT', 'BNB'];
        this.walletAddress = this.generateWalletAddress();
        this.transactions = this.loadTransactions();
        this.exchangeRates = {};
        this.blockchain = new SimpleBlockchain();

        this.updateExchangeRates();
        setInterval(() => this.updateExchangeRates(), 60000); // Actualizar cada minuto

        console.log('[Blockchain] Payment system initialized');
    }

    // ============================================
    // WALLET MANAGEMENT
    // ============================================

    generateWalletAddress() {
        const saved = localStorage.getItem('crypto_wallet');
        if (saved) {
            return JSON.parse(saved);
        }

        const wallet = {
            BTC: '1' + this.generateRandomHash(33),
            ETH: '0x' + this.generateRandomHash(40),
            USDT: '0x' + this.generateRandomHash(40),
            BNB: 'bnb' + this.generateRandomHash(39)
        };

        localStorage.setItem('crypto_wallet', JSON.stringify(wallet));
        return wallet;
    }

    generateRandomHash(length) {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < length; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    getWalletAddress(currency) {
        return this.walletAddress[currency];
    }

    // ============================================
    // EXCHANGE RATES
    // ============================================

    async updateExchangeRates() {
        // En producción, esto haría fetch a una API real como CoinGecko o Binance
        // Por ahora, simulamos precios realistas
        this.exchangeRates = {
            BTC: {
                USD: 43500 + (Math.random() * 1000 - 500),
                COP: (43500 + (Math.random() * 1000 - 500)) * 4100
            },
            ETH: {
                USD: 2300 + (Math.random() * 100 - 50),
                COP: (2300 + (Math.random() * 100 - 50)) * 4100
            },
            USDT: {
                USD: 1,
                COP: 4100
            },
            BNB: {
                USD: 310 + (Math.random() * 10 - 5),
                COP: (310 + (Math.random() * 10 - 5)) * 4100
            }
        };

        console.log('[Blockchain] Exchange rates updated');
    }

    getExchangeRate(currency, fiat = 'COP') {
        return this.exchangeRates[currency]?.[fiat] || 0;
    }

    convertToFiat(amount, currency, fiat = 'COP') {
        const rate = this.getExchangeRate(currency, fiat);
        return amount * rate;
    }

    convertToCrypto(fiatAmount, currency, fiat = 'COP') {
        const rate = this.getExchangeRate(currency, fiat);
        return fiatAmount / rate;
    }

    // ============================================
    // PAYMENT PROCESSING
    // ============================================

    async createPaymentRequest(order) {
        const paymentRequest = {
            id: 'pay_' + Date.now(),
            orderId: order.id,
            amount: order.total,
            currency: 'COP',
            cryptoOptions: {},
            status: 'pending',
            expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutos
            createdAt: Date.now()
        };

        // Calcular equivalente en cada criptomoneda
        this.supportedCurrencies.forEach(crypto => {
            const cryptoAmount = this.convertToCrypto(order.total, crypto);
            paymentRequest.cryptoOptions[crypto] = {
                amount: cryptoAmount.toFixed(8),
                address: this.walletAddress[crypto],
                qrCode: this.generateQRCode(this.walletAddress[crypto], cryptoAmount)
            };
        });

        // Guardar solicitud
        const requests = this.loadPaymentRequests();
        requests.push(paymentRequest);
        this.savePaymentRequests(requests);

        console.log('[Blockchain] Payment request created:', paymentRequest.id);

        return paymentRequest;
    }

    async processPayment(paymentRequestId, selectedCurrency, txHash) {
        const requests = this.loadPaymentRequests();
        const request = requests.find(r => r.id === paymentRequestId);

        if (!request) {
            return { success: false, error: 'Payment request not found' };
        }

        if (request.status !== 'pending') {
            return { success: false, error: 'Payment already processed' };
        }

        if (Date.now() > request.expiresAt) {
            return { success: false, error: 'Payment request expired' };
        }

        // Simular verificación de transacción en blockchain
        const verification = await this.verifyTransaction(txHash, selectedCurrency);

        if (!verification.valid) {
            return { success: false, error: 'Transaction verification failed' };
        }

        // Crear transacción
        const transaction = {
            id: 'tx_' + Date.now(),
            paymentRequestId: paymentRequestId,
            orderId: request.orderId,
            currency: selectedCurrency,
            amount: request.cryptoOptions[selectedCurrency].amount,
            txHash: txHash,
            status: 'confirmed',
            confirmations: 0,
            blockNumber: verification.blockNumber,
            timestamp: Date.now()
        };

        this.transactions.push(transaction);
        this.saveTransactions();

        // Actualizar estado de la solicitud
        request.status = 'completed';
        request.transactionId = transaction.id;
        this.savePaymentRequests(requests);

        // Agregar al blockchain
        this.blockchain.addBlock({
            type: 'payment',
            data: transaction
        });

        console.log('[Blockchain] Payment processed:', transaction.id);

        return {
            success: true,
            transaction: transaction
        };
    }

    async verifyTransaction(txHash, currency) {
        // En producción, esto verificaría la transacción en la blockchain real
        // Por ahora simulamos verificación exitosa

        await this.simulateDelay(2000);

        return {
            valid: true,
            blockNumber: Math.floor(Math.random() * 1000000),
            confirmations: Math.floor(Math.random() * 10) + 1,
            from: '0x' + this.generateRandomHash(40),
            to: this.walletAddress[currency],
            value: 0,
            timestamp: Date.now()
        };
    }

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // TRANSACTION MONITORING
    // ============================================

    async monitorTransaction(txHash) {
        // Simular monitoreo de confirmaciones
        const updates = [];

        for (let confirmations = 0; confirmations <= 6; confirmations++) {
            await this.simulateDelay(10000); // 10 segundos por confirmación

            updates.push({
                confirmations,
                status: confirmations >= 6 ? 'confirmed' : 'pending',
                timestamp: Date.now()
            });

            // Emitir evento
            this.emit('transaction_update', {
                txHash,
                confirmations,
                status: confirmations >= 6 ? 'confirmed' : 'pending'
            });
        }

        return updates;
    }

    getTransaction(txId) {
        return this.transactions.find(tx => tx.id === txId);
    }

    getTransactionsByOrder(orderId) {
        return this.transactions.filter(tx => tx.orderId === orderId);
    }

    // ============================================
    // QR CODE GENERATION
    // ============================================

    generateQRCode(address, amount) {
        // En producción, usar librería como qrcode.js
        // Por ahora retornamos URL de datos
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(address)}`;
    }

    // ============================================
    // REFUNDS
    // ============================================

    async processRefund(transactionId) {
        const transaction = this.getTransaction(transactionId);

        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        if (transaction.status === 'refunded') {
            return { success: false, error: 'Already refunded' };
        }

        const refund = {
            id: 'refund_' + Date.now(),
            transactionId: transactionId,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'processing',
            createdAt: Date.now()
        };

        // Simular procesamiento de reembolso
        await this.simulateDelay(3000);

        refund.status = 'completed';
        refund.txHash = 'refund_' + this.generateRandomHash(64);

        // Actualizar transacción original
        transaction.status = 'refunded';
        transaction.refundId = refund.id;
        this.saveTransactions();

        // Agregar al blockchain
        this.blockchain.addBlock({
            type: 'refund',
            data: refund
        });

        console.log('[Blockchain] Refund processed:', refund.id);

        return {
            success: true,
            refund: refund
        };
    }

    // ============================================
    // STORAGE
    // ============================================

    loadTransactions() {
        const saved = localStorage.getItem('crypto_transactions');
        return saved ? JSON.parse(saved) : [];
    }

    saveTransactions() {
        localStorage.setItem('crypto_transactions', JSON.stringify(this.transactions));
    }

    loadPaymentRequests() {
        const saved = localStorage.getItem('payment_requests');
        return saved ? JSON.parse(saved) : [];
    }

    savePaymentRequests(requests) {
        localStorage.setItem('payment_requests', JSON.stringify(requests));
    }

    // ============================================
    // EVENT EMITTER
    // ============================================

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('blockchain_' + event, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener('blockchain_' + event, (e) => callback(e.detail));
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStatistics() {
        const total = this.transactions.reduce((sum, tx) => {
            const fiatValue = this.convertToFiat(parseFloat(tx.amount), tx.currency);
            return sum + fiatValue;
        }, 0);

        const byCurrency = {};
        this.transactions.forEach(tx => {
            if (!byCurrency[tx.currency]) {
                byCurrency[tx.currency] = {
                    count: 0,
                    totalAmount: 0
                };
            }
            byCurrency[tx.currency].count++;
            byCurrency[tx.currency].totalAmount += parseFloat(tx.amount);
        });

        return {
            totalTransactions: this.transactions.length,
            totalValueCOP: total,
            byCurrency,
            averageTransaction: total / this.transactions.length || 0
        };
    }
}

// ============================================
// SIMPLE BLOCKCHAIN
// ============================================

class SimpleBlockchain {
    constructor() {
        this.chain = this.loadChain();
        this.difficulty = 2;

        if (this.chain.length === 0) {
            this.chain.push(this.createGenesisBlock());
            this.saveChain();
        }

        console.log('[Blockchain] Chain initialized with', this.chain.length, 'blocks');
    }

    createGenesisBlock() {
        return {
            index: 0,
            timestamp: Date.now(),
            data: { message: 'Genesis Block' },
            previousHash: '0',
            hash: this.calculateHash(0, Date.now(), { message: 'Genesis Block' }, '0', 0),
            nonce: 0
        };
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const newBlock = {
            index: previousBlock.index + 1,
            timestamp: Date.now(),
            data: data,
            previousHash: previousBlock.hash,
            nonce: 0
        };

        newBlock.hash = this.mineBlock(newBlock);
        this.chain.push(newBlock);
        this.saveChain();

        console.log('[Blockchain] Block mined:', newBlock.index, 'Hash:', newBlock.hash);

        return newBlock;
    }

    mineBlock(block) {
        while (true) {
            const hash = this.calculateHash(
                block.index,
                block.timestamp,
                block.data,
                block.previousHash,
                block.nonce
            );

            if (hash.substring(0, this.difficulty) === '0'.repeat(this.difficulty)) {
                return hash;
            }

            block.nonce++;
        }
    }

    calculateHash(index, timestamp, data, previousHash, nonce) {
        return this.sha256(index + timestamp + JSON.stringify(data) + previousHash + nonce);
    }

    sha256(data) {
        // Simulación simple de SHA-256
        // En producción usar CryptoJS o crypto-js
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(64, '0');
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verificar hash
            const recalculatedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.previousHash,
                currentBlock.nonce
            );

            if (currentBlock.hash !== recalculatedHash) {
                return false;
            }

            // Verificar enlace
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    loadChain() {
        const saved = localStorage.getItem('blockchain_chain');
        return saved ? JSON.parse(saved) : [];
    }

    saveChain() {
        localStorage.setItem('blockchain_chain', JSON.stringify(this.chain));
    }

    getBlockByIndex(index) {
        return this.chain.find(b => b.index === index);
    }

    getBlocksByData(dataFilter) {
        return this.chain.filter(block => {
            return JSON.stringify(block.data).includes(JSON.stringify(dataFilter));
        });
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.BlockchainPaymentSystem = BlockchainPaymentSystem;
    window.SimpleBlockchain = SimpleBlockchain;
    window.blockchainPayments = new BlockchainPaymentSystem();
}
