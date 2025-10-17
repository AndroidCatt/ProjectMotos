// Voice and Export System - Sistema de Voz y Exportación v6.0

// Sistema de reconocimiento de voz (Speech-to-Text)
class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.synthesis = window.speechSynthesis;
        this.initializeVoiceRecognition();
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'es-CO'; // Español de Colombia

            this.recognition.onstart = () => {
                this.isListening = true;
                this.onListeningStart();
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                this.onTranscript(transcript, event.results[0].isFinal);
            };

            this.recognition.onerror = (event) => {
                console.error('Error de reconocimiento de voz:', event.error);
                this.onError(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.onListeningEnd();
            };
        } else {
            console.warn('Reconocimiento de voz no soportado en este navegador');
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    speak(text) {
        if (this.synthesis) {
            // Cancelar cualquier síntesis en curso
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-CO';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Buscar voz en español
            const voices = this.synthesis.getVoices();
            const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
            if (spanishVoice) {
                utterance.voice = spanishVoice;
            }

            this.synthesis.speak(utterance);
        }
    }

    // Callbacks (serán sobrescritos por la implementación)
    onListeningStart() {
        console.log('🎤 Escuchando...');
    }

    onListeningEnd() {
        console.log('🎤 Dejó de escuchar');
    }

    onTranscript(text, isFinal) {
        console.log('Transcript:', text, 'Final:', isFinal);
    }

    onError(error) {
        console.error('Error:', error);
    }
}

// Sistema de exportación a PDF
class PDFExporter {
    constructor() {
        this.jsPDFLoaded = false;
        this.loadJSPDF();
    }

    loadJSPDF() {
        // Verificar si jsPDF ya está cargado
        if (typeof window.jspdf !== 'undefined') {
            this.jsPDFLoaded = true;
            return;
        }

        // Cargar jsPDF desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            this.jsPDFLoaded = true;
            console.log('✅ jsPDF cargado correctamente');
        };
        script.onerror = () => {
            console.error('❌ Error al cargar jsPDF');
        };
        document.head.appendChild(script);
    }

    async exportCart(cart, total, userInfo = {}) {
        if (!this.jsPDFLoaded) {
            await this.waitForJSPDF();
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configuración
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(102, 126, 234);
        doc.text('COTIZACIÓN - REPUESTOS DE MOTOS', margin, yPosition);

        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margin, yPosition);
        doc.text(`Cotización #${Date.now().toString().slice(-6)}`, pageWidth - margin - 40, yPosition);

        // Línea separadora
        yPosition += 5;
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        // Información del cliente (si existe)
        if (userInfo.name) {
            yPosition += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Cliente: ${userInfo.name}`, margin, yPosition);
            if (userInfo.email) {
                yPosition += 6;
                doc.text(`Email: ${userInfo.email}`, margin, yPosition);
            }
            if (userInfo.phone) {
                yPosition += 6;
                doc.text(`Teléfono: ${userInfo.phone}`, margin, yPosition);
            }
            yPosition += 5;
        }

        // Tabla de productos
        yPosition += 10;
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text('PRODUCTOS', margin, yPosition);

        yPosition += 8;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Headers de tabla
        const colX = {
            item: margin,
            cantidad: margin + 90,
            precio: margin + 120,
            descuento: margin + 150,
            total: pageWidth - margin - 30
        };

        doc.setFont(undefined, 'bold');
        doc.text('Producto', colX.item, yPosition);
        doc.text('Cant.', colX.cantidad, yPosition);
        doc.text('Precio', colX.precio, yPosition);
        doc.text('Desc.', colX.descuento, yPosition);
        doc.text('Total', colX.total, yPosition);

        yPosition += 2;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        // Productos
        yPosition += 6;
        doc.setFont(undefined, 'normal');

        let subtotal = 0;
        let totalDescuento = 0;

        cart.forEach((item, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            const precioUnitario = item.price;
            const descuento = (precioUnitario * item.discount) / 100;
            const precioFinal = precioUnitario - descuento;
            const totalItem = precioFinal * item.quantity;

            subtotal += precioUnitario * item.quantity;
            totalDescuento += descuento * item.quantity;

            // Nombre del producto (truncar si es muy largo)
            const nombreCorto = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
            doc.text(nombreCorto, colX.item, yPosition);
            doc.text(item.quantity.toString(), colX.cantidad, yPosition);
            doc.text(this.formatPrice(precioUnitario), colX.precio, yPosition);
            doc.text(`${item.discount}%`, colX.descuento, yPosition);
            doc.text(this.formatPrice(totalItem), colX.total, yPosition);

            // Marca y modelo (más pequeño)
            yPosition += 4;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`${item.brand} - ${item.model || 'Compatible'}`, colX.item + 2, yPosition);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            yPosition += 8;
        });

        // Línea antes del total
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        // Totales
        yPosition += 8;
        const totalsX = pageWidth - margin - 60;

        doc.text('Subtotal:', totalsX, yPosition);
        doc.text(this.formatPrice(subtotal), totalsX + 30, yPosition);

        yPosition += 6;
        doc.setTextColor(244, 67, 54);
        doc.text('Descuentos:', totalsX, yPosition);
        doc.text('-' + this.formatPrice(totalDescuento), totalsX + 30, yPosition);

        yPosition += 8;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(76, 175, 80);
        doc.text('TOTAL:', totalsX, yPosition);
        doc.text(this.formatPrice(total), totalsX + 30, yPosition);

        // Footer
        yPosition = doc.internal.pageSize.height - 30;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Repuestos de Motos Colombianas', margin, yPosition);
        doc.text('www.repuestosmotos.co', margin, yPosition + 5);
        doc.text('WhatsApp: +57 300 123 4567', margin, yPosition + 10);

        doc.setTextColor(102, 126, 234);
        doc.text('Cotización válida por 15 días', pageWidth - margin - 50, yPosition + 5);

        // Generar y descargar
        const fileName = `Cotizacion_${Date.now().toString().slice(-6)}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    async exportFavorites(favorites) {
        if (!this.jsPDFLoaded) {
            await this.waitForJSPDF();
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(244, 67, 54);
        doc.text('❤️ MIS FAVORITOS', margin, yPosition);

        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margin, yPosition);
        doc.text(`Total: ${favorites.length} productos`, pageWidth - margin - 40, yPosition);

        yPosition += 10;

        favorites.forEach((item, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${item.name}`, margin, yPosition);

            yPosition += 6;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`Marca: ${item.brand} | Precio: ${this.formatPrice(item.price)}`, margin + 5, yPosition);

            yPosition += 6;
            doc.text(`Rating: ${'⭐'.repeat(Math.floor(item.rating))} ${item.rating.toFixed(1)}`, margin + 5, yPosition);

            yPosition += 10;
        });

        const fileName = `Favoritos_${Date.now().toString().slice(-6)}.pdf`;
        doc.save(fileName);

        return fileName;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    waitForJSPDF() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.jsPDFLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
}

// Sistema de gráficos y visualización
class ChartSystem {
    constructor() {
        this.chartJSLoaded = false;
        this.loadChartJS();
    }

    loadChartJS() {
        if (typeof window.Chart !== 'undefined') {
            this.chartJSLoaded = true;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            this.chartJSLoaded = true;
            console.log('✅ Chart.js cargado correctamente');
        };
        script.onerror = () => {
            console.error('❌ Error al cargar Chart.js');
        };
        document.head.appendChild(script);
    }

    async createPriceComparisonChart(canvasId, products) {
        if (!this.chartJSLoaded) {
            await this.waitForChartJS();
        }

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const data = {
            labels: products.map(p => p.name),
            datasets: [{
                label: 'Precio (COP)',
                data: products.map(p => p.price),
                backgroundColor: [
                    'rgba(102, 126, 234, 0.6)',
                    'rgba(118, 75, 162, 0.6)',
                    'rgba(240, 147, 251, 0.6)',
                    'rgba(76, 175, 80, 0.6)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(240, 147, 251, 1)',
                    'rgba(76, 175, 80, 1)'
                ],
                borderWidth: 2
            }]
        };

        return new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparación de Precios'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async createRatingChart(canvasId, products) {
        if (!this.chartJSLoaded) {
            await this.waitForChartJS();
        }

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: products.map(p => p.name),
                datasets: [{
                    label: 'Rating',
                    data: products.map(p => p.rating),
                    backgroundColor: 'rgba(255, 167, 38, 0.2)',
                    borderColor: 'rgba(255, 167, 38, 1)',
                    pointBackgroundColor: 'rgba(255, 167, 38, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 167, 38, 1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }

    waitForChartJS() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.chartJSLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.VoiceAssistant = VoiceAssistant;
    window.PDFExporter = PDFExporter;
    window.ChartSystem = ChartSystem;
}
