// Base de datos de marcas colombianas de motos y sus repuestos
const motorcycleData = {
    brands: {
        "Auteco": {
            models: ["Discover 125", "Pulsar NS 200", "Pulsar NS 160", "Victory 100"],
            commonParts: {
                motor: ["Kit de arrastre", "Filtro de aceite", "Bujía", "Empaque de motor", "Pistón"],
                suspension: ["Amortiguador delantero", "Amortiguador trasero", "Resortes", "Horquilla"],
                frenos: ["Pastillas de freno delanteras", "Pastillas de freno traseras", "Disco de freno", "Cable de freno"],
                electrico: ["Batería", "Regulador de voltaje", "Bobina de encendido", "CDI", "Switch de encendido"],
                transmision: ["Cadena", "Piñón", "Corona", "Embrague", "Cable de clutch"],
                otros: ["Llanta delantera", "Llanta trasera", "Filtro de aire", "Espejos", "Maniguetas"]
            }
        },
        "AKT": {
            models: ["NKD 125", "TTR 200", "CR5 180", "AK 125"],
            commonParts: {
                motor: ["Kit de arrastre", "Filtro de aceite", "Bujía", "Empaque de motor", "Pistón", "Cilindro"],
                suspension: ["Amortiguador delantero", "Amortiguador trasero", "Resortes"],
                frenos: ["Pastillas de freno", "Disco de freno", "Bomba de freno", "Cable de freno"],
                electrico: ["Batería", "Regulador", "Bobina", "Estator", "Rectificador"],
                transmision: ["Cadena", "Piñón", "Corona", "Embrague"],
                otros: ["Llanta delantera", "Llanta trasera", "Filtro de aire", "Espejos"]
            }
        },
        "TVS": {
            models: ["Apache RTR 160", "Apache RTR 200", "Sport 100"],
            commonParts: {
                motor: ["Filtro de aceite", "Bujía", "Empaque de motor", "Kit de pistón"],
                suspension: ["Amortiguador delantero", "Amortiguador trasero"],
                frenos: ["Pastillas de freno delanteras", "Pastillas de freno traseras", "Disco de freno"],
                electrico: ["Batería", "Regulador de voltaje", "Bobina"],
                transmision: ["Cadena", "Piñón", "Corona", "Cable de clutch"],
                otros: ["Filtro de aire", "Espejos", "Llantas"]
            }
        },
        "Boxer": {
            models: ["BM 150", "BM 125", "CT 100"],
            commonParts: {
                motor: ["Kit de arrastre", "Filtro de aceite", "Bujía", "Empaque de motor"],
                suspension: ["Amortiguador trasero", "Horquilla delantera"],
                frenos: ["Pastillas de freno", "Cable de freno"],
                electrico: ["Batería", "Regulador", "Bobina"],
                transmision: ["Cadena", "Piñón", "Corona"],
                otros: ["Filtro de aire", "Espejos", "Llantas"]
            }
        }
    }
};

class ChatBot {
    constructor() {
        this.conversationState = {
            step: 'greeting',
            selectedBrand: null,
            selectedModel: null,
            selectedCategory: null
        };
    }

    processMessage(userMessage) {
        const message = userMessage.toLowerCase().trim();

        switch(this.conversationState.step) {
            case 'greeting':
                return this.handleGreeting(message);
            case 'brand_selection':
                return this.handleBrandSelection(message);
            case 'model_selection':
                return this.handleModelSelection(message);
            case 'category_selection':
                return this.handleCategorySelection(message);
            case 'recommendation':
                return this.handleRecommendation(message);
            default:
                return this.reset();
        }
    }

    handleGreeting(message) {
        if (message.includes('hola') || message.includes('buenos') || message.includes('ayuda') || message === '') {
            this.conversationState.step = 'brand_selection';
            return {
                response: `¡Bienvenido al sistema de recomendación de repuestos para motos colombianas! 🏍️`,
                card: {
                    header: '¿Para qué marca de moto necesitas repuestos?',
                    text: 'Selecciona la marca de tu motocicleta:',
                    type: 'brand',
                    options: [
                        { label: 'Auteco', value: 'auteco', icon: '🏍️' },
                        { label: 'AKT', value: 'akt', icon: '🏍️' },
                        { label: 'TVS', value: 'tvs', icon: '🏍️' },
                        { label: 'Boxer', value: 'boxer', icon: '🏍️' }
                    ]
                },
                state: this.conversationState
            };
        }
        return {
            response: `¡Hola! Soy tu asistente para recomendación de repuestos de motos colombianas. Escribe "hola" para comenzar.`,
            state: this.conversationState
        };
    }

    handleBrandSelection(message) {
        const brands = Object.keys(motorcycleData.brands);
        let selectedBrand = null;

        // Buscar por número
        if (message === '1') selectedBrand = 'Auteco';
        else if (message === '2') selectedBrand = 'AKT';
        else if (message === '3') selectedBrand = 'TVS';
        else if (message === '4') selectedBrand = 'Boxer';
        // Buscar por nombre
        else {
            selectedBrand = brands.find(brand =>
                message.includes(brand.toLowerCase())
            );
        }

        if (selectedBrand) {
            this.conversationState.selectedBrand = selectedBrand;
            this.conversationState.step = 'model_selection';

            const models = motorcycleData.brands[selectedBrand].models;
            const modelOptions = models.map(model => ({
                label: model,
                value: model.toLowerCase(),
                icon: '🏍️'
            }));

            return {
                response: `Excelente, seleccionaste ${selectedBrand}.`,
                card: {
                    header: `¿Qué modelo de ${selectedBrand} tienes?`,
                    text: 'Selecciona tu modelo:',
                    type: 'model',
                    options: modelOptions
                },
                state: this.conversationState
            };
        }

        return {
            card: {
                header: 'Marca no reconocida',
                text: 'Por favor selecciona una de las siguientes marcas:',
                type: 'brand',
                options: [
                    { label: 'Auteco', value: 'auteco', icon: '🏍️' },
                    { label: 'AKT', value: 'akt', icon: '🏍️' },
                    { label: 'TVS', value: 'tvs', icon: '🏍️' },
                    { label: 'Boxer', value: 'boxer', icon: '🏍️' }
                ]
            },
            state: this.conversationState
        };
    }

    handleModelSelection(message) {
        const models = motorcycleData.brands[this.conversationState.selectedBrand].models;
        let selectedModel = null;

        // Buscar por número
        const modelIndex = parseInt(message) - 1;
        if (modelIndex >= 0 && modelIndex < models.length) {
            selectedModel = models[modelIndex];
        } else {
            // Buscar por nombre
            selectedModel = models.find(model =>
                message.includes(model.toLowerCase())
            );
        }

        if (selectedModel) {
            this.conversationState.selectedModel = selectedModel;
            this.conversationState.step = 'category_selection';

            return {
                response: `Perfecto, tienes una ${this.conversationState.selectedBrand} ${selectedModel}.`,
                card: {
                    header: '¿Qué tipo de repuesto necesitas?',
                    text: 'Selecciona la categoría:',
                    type: 'category',
                    options: [
                        { label: 'Motor', value: 'motor', icon: '⚙️' },
                        { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                        { label: 'Frenos', value: 'frenos', icon: '🛑' },
                        { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                        { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                        { label: 'Otros', value: 'otros', icon: '🔩' }
                    ]
                },
                state: this.conversationState
            };
        }

        const modelOptions = models.map(model => ({
            label: model,
            value: model.toLowerCase(),
            icon: '🏍️'
        }));

        return {
            card: {
                header: 'Modelo no reconocido',
                text: 'Por favor selecciona uno de los siguientes modelos:',
                type: 'model',
                options: modelOptions
            },
            state: this.conversationState
        };
    }

    handleCategorySelection(message) {
        const categoryMap = {
            '1': 'motor',
            '2': 'suspension',
            '3': 'frenos',
            '4': 'electrico',
            '5': 'transmision',
            '6': 'otros',
            'motor': 'motor',
            'suspension': 'suspension',
            'suspensión': 'suspension',
            'frenos': 'frenos',
            'freno': 'frenos',
            'electrico': 'electrico',
            'eléctrico': 'electrico',
            'transmision': 'transmision',
            'transmisión': 'transmision',
            'otros': 'otros',
            'otro': 'otros'
        };

        let selectedCategory = null;
        for (let key in categoryMap) {
            if (message.includes(key)) {
                selectedCategory = categoryMap[key];
                break;
            }
        }

        if (selectedCategory) {
            this.conversationState.selectedCategory = selectedCategory;
            this.conversationState.step = 'recommendation';

            const parts = motorcycleData.brands[this.conversationState.selectedBrand].commonParts[selectedCategory];
            const categoryNames = {
                motor: 'Motor',
                suspension: 'Suspensión',
                frenos: 'Frenos',
                electrico: 'Sistema Eléctrico',
                transmision: 'Transmisión',
                otros: 'Otros'
            };

            return {
                response: `Repuestos recomendados para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}:`,
                card: {
                    header: `Repuestos de ${categoryNames[selectedCategory]}`,
                    text: `Para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}:`,
                    parts: parts,
                    actions: [
                        { label: 'Buscar otra categoría', value: 'si', type: 'primary' },
                        { label: 'Reiniciar', value: 'reiniciar', type: 'secondary' }
                    ]
                },
                state: this.conversationState
            };
        }

        return {
            card: {
                header: 'Categoría no reconocida',
                text: 'Por favor selecciona una de las siguientes categorías:',
                type: 'category',
                options: [
                    { label: 'Motor', value: 'motor', icon: '⚙️' },
                    { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                    { label: 'Frenos', value: 'frenos', icon: '🛑' },
                    { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                    { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                    { label: 'Otros', value: 'otros', icon: '🔩' }
                ]
            },
            state: this.conversationState
        };
    }

    handleRecommendation(message) {
        if (message.includes('si') || message.includes('sí') || message.includes('otra')) {
            this.conversationState.step = 'category_selection';
            return {
                response: `¿Qué otra categoría necesitas para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}?`,
                card: {
                    header: 'Selecciona otra categoría',
                    text: 'Elige la categoría de repuestos:',
                    type: 'category',
                    options: [
                        { label: 'Motor', value: 'motor', icon: '⚙️' },
                        { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                        { label: 'Frenos', value: 'frenos', icon: '🛑' },
                        { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                        { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                        { label: 'Otros', value: 'otros', icon: '🔩' }
                    ]
                },
                state: this.conversationState
            };
        } else if (message.includes('reiniciar') || message.includes('no')) {
            return this.reset();
        }

        return {
            card: {
                header: '¿Qué deseas hacer?',
                text: 'Selecciona una opción:',
                actions: [
                    { label: 'Buscar otra categoría', value: 'si', type: 'primary' },
                    { label: 'Reiniciar', value: 'reiniciar', type: 'secondary' }
                ]
            },
            state: this.conversationState
        };
    }

    reset() {
        this.conversationState = {
            step: 'greeting',
            selectedBrand: null,
            selectedModel: null,
            selectedCategory: null
        };
        return this.handleGreeting('hola');
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.ChatBot = ChatBot;
}
