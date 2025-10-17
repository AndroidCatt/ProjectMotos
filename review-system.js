// Review System - Sistema de Reseñas y Calificaciones v8.0
// Permite a usuarios dejar reviews, calificaciones y comentarios en productos

class ReviewSystem {
    constructor() {
        this.reviews = this.loadReviews();
        this.userReviews = this.loadUserReviews();
        this.moderationQueue = this.loadModerationQueue();
        this.reportedReviews = this.loadReportedReviews();
    }

    // ============================================
    // CARGAR/GUARDAR DATOS
    // ============================================

    loadReviews() {
        const saved = localStorage.getItem('product_reviews');
        if (saved) return JSON.parse(saved);

        // Reviews de ejemplo
        return {
            'custom_1': [
                {
                    id: 'rev_1',
                    productId: 'custom_1',
                    userId: 'demo',
                    userName: 'Usuario Demo',
                    rating: 5,
                    title: 'Excelente producto',
                    comment: 'Muy buena calidad, llegó rápido y funciona perfecto. Lo recomiendo.',
                    verified: true,
                    helpful: 12,
                    notHelpful: 1,
                    images: [],
                    createdAt: '2025-10-10T10:30:00Z',
                    status: 'approved',
                    response: null
                }
            ]
        };
    }

    saveReviews() {
        localStorage.setItem('product_reviews', JSON.stringify(this.reviews));
    }

    loadUserReviews() {
        const saved = localStorage.getItem('user_reviews_map');
        return saved ? JSON.parse(saved) : {};
    }

    saveUserReviews() {
        localStorage.setItem('user_reviews_map', JSON.stringify(this.userReviews));
    }

    loadModerationQueue() {
        const saved = localStorage.getItem('review_moderation_queue');
        return saved ? JSON.parse(saved) : [];
    }

    saveModerationQueue() {
        localStorage.setItem('review_moderation_queue', JSON.stringify(this.moderationQueue));
    }

    loadReportedReviews() {
        const saved = localStorage.getItem('reported_reviews');
        return saved ? JSON.parse(saved) : [];
    }

    saveReportedReviews() {
        localStorage.setItem('reported_reviews', JSON.stringify(this.reportedReviews));
    }

    // ============================================
    // CREAR RESEÑA
    // ============================================

    submitReview(reviewData) {
        const {
            productId,
            userId,
            userName,
            rating,
            title,
            comment,
            images = [],
            verified = false
        } = reviewData;

        // Validaciones
        if (!productId || !userId || !rating) {
            return {
                success: false,
                message: 'Datos incompletos: productId, userId y rating son requeridos'
            };
        }

        if (rating < 1 || rating > 5) {
            return {
                success: false,
                message: 'El rating debe estar entre 1 y 5'
            };
        }

        if (!comment || comment.trim().length < 10) {
            return {
                success: false,
                message: 'El comentario debe tener al menos 10 caracteres'
            };
        }

        // Verificar si el usuario ya dejó review en este producto
        const userKey = `${userId}_${productId}`;
        if (this.userReviews[userKey]) {
            return {
                success: false,
                message: 'Ya has dejado una reseña para este producto. Puedes editarla desde tu perfil.'
            };
        }

        // Crear review
        const review = {
            id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            productId,
            userId,
            userName: userName || 'Usuario Anónimo',
            rating: parseInt(rating),
            title: title ? title.trim() : '',
            comment: comment.trim(),
            verified: verified,
            helpful: 0,
            notHelpful: 0,
            images: images.slice(0, 5), // Máximo 5 imágenes
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'pending', // pending, approved, rejected
            response: null,
            reports: 0
        };

        // Moderación automática básica
        const moderationResult = this.autoModerate(review);

        if (moderationResult.approved) {
            review.status = 'approved';

            // Agregar a las reviews del producto
            if (!this.reviews[productId]) {
                this.reviews[productId] = [];
            }
            this.reviews[productId].push(review);
            this.saveReviews();
        } else {
            // Agregar a cola de moderación
            review.moderationReason = moderationResult.reason;
            this.moderationQueue.push(review);
            this.saveModerationQueue();
        }

        // Registrar que el usuario hizo review
        this.userReviews[userKey] = review.id;
        this.saveUserReviews();

        return {
            success: true,
            message: review.status === 'approved'
                ? '¡Reseña publicada exitosamente!'
                : 'Reseña enviada. Será revisada antes de publicarse.',
            review: review
        };
    }

    // ============================================
    // MODERACIÓN AUTOMÁTICA
    // ============================================

    autoModerate(review) {
        // Palabras prohibidas (simple blacklist)
        const blacklist = [
            'spam', 'fake', 'estafa', 'robo', 'scam',
            'idiota', 'estúpido', 'basura', 'mierda'
        ];

        const text = (review.title + ' ' + review.comment).toLowerCase();

        for (const word of blacklist) {
            if (text.includes(word)) {
                return {
                    approved: false,
                    reason: `Contiene palabra prohibida: ${word}`
                };
            }
        }

        // Verificar spam (texto muy corto o repetitivo)
        if (review.comment.length < 10) {
            return {
                approved: false,
                reason: 'Comentario muy corto'
            };
        }

        // Verificar URLs sospechosas
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlPattern) || [];
        if (urls.length > 2) {
            return {
                approved: false,
                reason: 'Contiene múltiples enlaces'
            };
        }

        // Verificar caracteres repetidos (ej: "aaaaaa")
        const repeatedPattern = /(.)\1{5,}/;
        if (repeatedPattern.test(text)) {
            return {
                approved: false,
                reason: 'Caracteres repetidos sospechosos'
            };
        }

        // Aprobar si pasa todas las validaciones
        return { approved: true };
    }

    // ============================================
    // OBTENER RESEÑAS
    // ============================================

    getProductReviews(productId, filters = {}) {
        const reviews = this.reviews[productId] || [];

        // Filtrar solo aprobadas por defecto
        let filtered = reviews.filter(r => r.status === 'approved');

        // Aplicar filtros
        if (filters.rating) {
            filtered = filtered.filter(r => r.rating === parseInt(filters.rating));
        }

        if (filters.verified) {
            filtered = filtered.filter(r => r.verified === true);
        }

        if (filters.hasImages) {
            filtered = filtered.filter(r => r.images && r.images.length > 0);
        }

        // Ordenar
        const sortBy = filters.sortBy || 'recent';

        switch (sortBy) {
            case 'recent':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'helpful':
                filtered.sort((a, b) => b.helpful - a.helpful);
                break;
            case 'rating_high':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating_low':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
        }

        return filtered;
    }

    getReviewById(reviewId) {
        for (const productId in this.reviews) {
            const review = this.reviews[productId].find(r => r.id === reviewId);
            if (review) return review;
        }
        return null;
    }

    getUserReviews(userId) {
        const userReviews = [];

        for (const productId in this.reviews) {
            const reviews = this.reviews[productId].filter(r => r.userId === userId);
            userReviews.push(...reviews);
        }

        // Ordenar por fecha (más recientes primero)
        userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return userReviews;
    }

    // ============================================
    // ESTADÍSTICAS DE PRODUCTO
    // ============================================

    getProductRatingStats(productId) {
        const reviews = this.getProductReviews(productId);

        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                verifiedReviews: 0,
                recommendationRate: 0
            };
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviews.length;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            distribution[r.rating]++;
        });

        const verifiedReviews = reviews.filter(r => r.verified).length;

        // Calcular tasa de recomendación (reviews 4-5 estrellas)
        const positiveReviews = reviews.filter(r => r.rating >= 4).length;
        const recommendationRate = (positiveReviews / reviews.length) * 100;

        return {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews.length,
            ratingDistribution: distribution,
            verifiedReviews,
            recommendationRate: parseFloat(recommendationRate.toFixed(1))
        };
    }

    // ============================================
    // EDITAR/ELIMINAR RESEÑA
    // ============================================

    updateReview(reviewId, userId, updates) {
        const review = this.getReviewById(reviewId);

        if (!review) {
            return { success: false, message: 'Reseña no encontrada' };
        }

        if (review.userId !== userId) {
            return { success: false, message: 'No tienes permiso para editar esta reseña' };
        }

        // Actualizar campos permitidos
        if (updates.rating && updates.rating >= 1 && updates.rating <= 5) {
            review.rating = parseInt(updates.rating);
        }

        if (updates.title !== undefined) {
            review.title = updates.title.trim();
        }

        if (updates.comment && updates.comment.trim().length >= 10) {
            review.comment = updates.comment.trim();
        }

        if (updates.images) {
            review.images = updates.images.slice(0, 5);
        }

        review.updatedAt = new Date().toISOString();

        // Re-moderar si cambió el contenido
        const moderationResult = this.autoModerate(review);
        if (!moderationResult.approved) {
            review.status = 'pending';
            this.moderationQueue.push({ ...review, moderationReason: moderationResult.reason });
            this.saveModerationQueue();
        }

        this.saveReviews();

        return {
            success: true,
            message: 'Reseña actualizada exitosamente',
            review: review
        };
    }

    deleteReview(reviewId, userId) {
        for (const productId in this.reviews) {
            const index = this.reviews[productId].findIndex(r => r.id === reviewId);

            if (index !== -1) {
                const review = this.reviews[productId][index];

                if (review.userId !== userId) {
                    return { success: false, message: 'No tienes permiso para eliminar esta reseña' };
                }

                this.reviews[productId].splice(index, 1);
                this.saveReviews();

                // Eliminar del mapa de usuario
                const userKey = `${userId}_${productId}`;
                delete this.userReviews[userKey];
                this.saveUserReviews();

                return { success: true, message: 'Reseña eliminada exitosamente' };
            }
        }

        return { success: false, message: 'Reseña no encontrada' };
    }

    // ============================================
    // MARCAR COMO ÚTIL/NO ÚTIL
    // ============================================

    markHelpful(reviewId, userId, helpful = true) {
        const review = this.getReviewById(reviewId);

        if (!review) {
            return { success: false, message: 'Reseña no encontrada' };
        }

        // Verificar si el usuario ya votó
        const voteKey = `vote_${userId}_${reviewId}`;
        const existingVote = localStorage.getItem(voteKey);

        if (existingVote) {
            return { success: false, message: 'Ya has votado en esta reseña' };
        }

        // Registrar voto
        if (helpful) {
            review.helpful++;
        } else {
            review.notHelpful++;
        }

        localStorage.setItem(voteKey, helpful ? 'helpful' : 'not_helpful');
        this.saveReviews();

        return {
            success: true,
            message: helpful ? 'Marcado como útil' : 'Marcado como no útil',
            helpful: review.helpful,
            notHelpful: review.notHelpful
        };
    }

    // ============================================
    // REPORTAR RESEÑA
    // ============================================

    reportReview(reviewId, userId, reason) {
        const review = this.getReviewById(reviewId);

        if (!review) {
            return { success: false, message: 'Reseña no encontrada' };
        }

        const report = {
            id: 'report_' + Date.now(),
            reviewId,
            reportedBy: userId,
            reason,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        this.reportedReviews.push(report);
        review.reports = (review.reports || 0) + 1;

        // Auto-ocultar si tiene muchos reportes
        if (review.reports >= 5) {
            review.status = 'pending';
        }

        this.saveReportedReviews();
        this.saveReviews();

        return {
            success: true,
            message: 'Reseña reportada. Será revisada por nuestro equipo.'
        };
    }

    // ============================================
    // RESPONDER RESEÑA (VENDEDOR/ADMIN)
    // ============================================

    addResponse(reviewId, responseText, responderId, responderName) {
        const review = this.getReviewById(reviewId);

        if (!review) {
            return { success: false, message: 'Reseña no encontrada' };
        }

        if (review.response) {
            return { success: false, message: 'Esta reseña ya tiene una respuesta' };
        }

        review.response = {
            text: responseText.trim(),
            responderId,
            responderName,
            createdAt: new Date().toISOString()
        };

        this.saveReviews();

        return {
            success: true,
            message: 'Respuesta agregada exitosamente',
            response: review.response
        };
    }

    // ============================================
    // MODERACIÓN MANUAL (ADMIN)
    // ============================================

    approveReview(reviewId) {
        // Buscar en cola de moderación
        const queueIndex = this.moderationQueue.findIndex(r => r.id === reviewId);

        if (queueIndex === -1) {
            return { success: false, message: 'Reseña no encontrada en cola de moderación' };
        }

        const review = this.moderationQueue[queueIndex];
        review.status = 'approved';
        delete review.moderationReason;

        // Mover a reviews aprobadas
        if (!this.reviews[review.productId]) {
            this.reviews[review.productId] = [];
        }

        this.reviews[review.productId].push(review);
        this.moderationQueue.splice(queueIndex, 1);

        this.saveReviews();
        this.saveModerationQueue();

        return { success: true, message: 'Reseña aprobada' };
    }

    rejectReview(reviewId, reason) {
        const queueIndex = this.moderationQueue.findIndex(r => r.id === reviewId);

        if (queueIndex === -1) {
            return { success: false, message: 'Reseña no encontrada' };
        }

        this.moderationQueue[queueIndex].status = 'rejected';
        this.moderationQueue[queueIndex].rejectionReason = reason;

        this.saveModerationQueue();

        return { success: true, message: 'Reseña rechazada' };
    }

    getModerationQueue() {
        return this.moderationQueue.filter(r => r.status === 'pending');
    }

    getReportedReviews() {
        return this.reportedReviews.filter(r => r.status === 'pending');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReviewSystem = ReviewSystem;
}
