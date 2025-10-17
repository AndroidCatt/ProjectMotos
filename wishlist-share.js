// Wishlist Share System - Sistema de Listas de Deseos Compartidas v8.0
// Permite crear, compartir y colaborar en listas de productos deseados

class WishlistShareSystem {
    constructor() {
        this.wishlists = this.loadWishlists();
        this.sharedWishlists = this.loadSharedWishlists();
        this.baseURL = window.location.origin + window.location.pathname;
    }

    // ============================================
    // CARGAR/GUARDAR DATOS
    // ============================================

    loadWishlists() {
        const saved = localStorage.getItem('user_wishlists');
        if (saved) return JSON.parse(saved);

        // Wishlist por defecto
        return {
            default: {
                id: 'default',
                name: 'Mi Lista de Deseos',
                description: 'Productos que me interesan',
                products: [],
                isPublic: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                owner: null,
                collaborators: [],
                views: 0
            }
        };
    }

    saveWishlists() {
        localStorage.setItem('user_wishlists', JSON.stringify(this.wishlists));
    }

    loadSharedWishlists() {
        const saved = localStorage.getItem('shared_wishlists');
        return saved ? JSON.parse(saved) : {};
    }

    saveSharedWishlists() {
        localStorage.setItem('shared_wishlists', JSON.stringify(this.sharedWishlists));
    }

    // ============================================
    // CREAR Y GESTIONAR WISHLISTS
    // ============================================

    createWishlist(name, description = '', isPublic = false, userId = null) {
        const wishlistId = 'wl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const wishlist = {
            id: wishlistId,
            name: name.trim(),
            description: description.trim(),
            products: [],
            isPublic,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            owner: userId,
            collaborators: [],
            views: 0,
            shareToken: this.generateShareToken()
        };

        this.wishlists[wishlistId] = wishlist;
        this.saveWishlists();

        return {
            success: true,
            message: 'Lista creada exitosamente',
            wishlist
        };
    }

    updateWishlist(wishlistId, updates, userId = null) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        // Verificar permisos
        if (userId && wishlist.owner && wishlist.owner !== userId) {
            if (!wishlist.collaborators.includes(userId)) {
                return { success: false, message: 'No tienes permiso para editar esta lista' };
            }
        }

        // Actualizar campos
        if (updates.name) {
            wishlist.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            wishlist.description = updates.description.trim();
        }

        if (updates.isPublic !== undefined) {
            wishlist.isPublic = updates.isPublic;
        }

        wishlist.updatedAt = new Date().toISOString();

        this.saveWishlists();

        return {
            success: true,
            message: 'Lista actualizada',
            wishlist
        };
    }

    deleteWishlist(wishlistId, userId = null) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        // Solo el dueño puede eliminar
        if (userId && wishlist.owner && wishlist.owner !== userId) {
            return { success: false, message: 'Solo el dueño puede eliminar esta lista' };
        }

        delete this.wishlists[wishlistId];
        this.saveWishlists();

        return { success: true, message: 'Lista eliminada' };
    }

    // ============================================
    // GESTIÓN DE PRODUCTOS EN WISHLIST
    // ============================================

    addProductToWishlist(wishlistId, product, userId = null) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        // Verificar permisos
        if (!this.canEditWishlist(wishlistId, userId)) {
            return { success: false, message: 'No tienes permiso para editar esta lista' };
        }

        // Verificar si el producto ya está
        const exists = wishlist.products.find(p => p.id === product.id);
        if (exists) {
            return { success: false, message: 'El producto ya está en esta lista' };
        }

        wishlist.products.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            addedAt: new Date().toISOString(),
            addedBy: userId,
            notes: ''
        });

        wishlist.updatedAt = new Date().toISOString();
        this.saveWishlists();

        return {
            success: true,
            message: 'Producto agregado a la lista',
            wishlist
        };
    }

    removeProductFromWishlist(wishlistId, productId, userId = null) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        if (!this.canEditWishlist(wishlistId, userId)) {
            return { success: false, message: 'No tienes permiso para editar esta lista' };
        }

        const index = wishlist.products.findIndex(p => p.id === productId);

        if (index === -1) {
            return { success: false, message: 'Producto no encontrado en la lista' };
        }

        wishlist.products.splice(index, 1);
        wishlist.updatedAt = new Date().toISOString();
        this.saveWishlists();

        return {
            success: true,
            message: 'Producto eliminado de la lista',
            wishlist
        };
    }

    addNoteToProduct(wishlistId, productId, note, userId = null) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        if (!this.canEditWishlist(wishlistId, userId)) {
            return { success: false, message: 'No tienes permiso para editar esta lista' };
        }

        const product = wishlist.products.find(p => p.id === productId);

        if (!product) {
            return { success: false, message: 'Producto no encontrado' };
        }

        product.notes = note.trim();
        wishlist.updatedAt = new Date().toISOString();
        this.saveWishlists();

        return { success: true, message: 'Nota agregada' };
    }

    // ============================================
    // COMPARTIR WISHLIST
    // ============================================

    generateShareToken() {
        return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    }

    getShareURL(wishlistId) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        if (!wishlist.shareToken) {
            wishlist.shareToken = this.generateShareToken();
            this.saveWishlists();
        }

        const shareURL = `${this.baseURL}?wishlist=${wishlist.shareToken}`;

        return {
            success: true,
            url: shareURL,
            token: wishlist.shareToken
        };
    }

    getWishlistByToken(token) {
        for (const wishlistId in this.wishlists) {
            const wishlist = this.wishlists[wishlistId];

            if (wishlist.shareToken === token) {
                // Incrementar views
                wishlist.views++;
                this.saveWishlists();

                return {
                    success: true,
                    wishlist
                };
            }
        }

        // Buscar en listas compartidas globales
        if (this.sharedWishlists[token]) {
            return {
                success: true,
                wishlist: this.sharedWishlists[token]
            };
        }

        return {
            success: false,
            message: 'Lista no encontrada o no disponible'
        };
    }

    shareWishlist(wishlistId, method = 'link') {
        const shareResult = this.getShareURL(wishlistId);

        if (!shareResult.success) {
            return shareResult;
        }

        const wishlist = this.wishlists[wishlistId];

        switch (method) {
            case 'link':
                // Copiar al portapapeles
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareResult.url);
                    return {
                        success: true,
                        message: 'Link copiado al portapapeles',
                        url: shareResult.url
                    };
                }
                return shareResult;

            case 'whatsapp':
                const whatsappText = encodeURIComponent(
                    `Mira mi lista de productos: ${wishlist.name}\n${shareResult.url}`
                );
                window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                return { success: true, message: 'Compartiendo en WhatsApp' };

            case 'email':
                const subject = encodeURIComponent(`Lista de Productos: ${wishlist.name}`);
                const body = encodeURIComponent(
                    `Hola,\n\nTe comparto mi lista de productos:\n\n${wishlist.name}\n${wishlist.description}\n\nVer lista: ${shareResult.url}`
                );
                window.open(`mailto:?subject=${subject}&body=${body}`);
                return { success: true, message: 'Abriendo email' };

            case 'qr':
                // Generar código QR (usando API externa)
                const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareResult.url)}`;
                return {
                    success: true,
                    message: 'Código QR generado',
                    qrURL
                };

            default:
                return shareResult;
        }
    }

    // ============================================
    // COLABORADORES
    // ============================================

    addCollaborator(wishlistId, userId, permissions = 'view') {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        // Verificar si ya es colaborador
        const exists = wishlist.collaborators.find(c => c.userId === userId);
        if (exists) {
            return { success: false, message: 'Usuario ya es colaborador' };
        }

        wishlist.collaborators.push({
            userId,
            permissions, // 'view', 'edit', 'manage'
            addedAt: new Date().toISOString()
        });

        this.saveWishlists();

        return {
            success: true,
            message: 'Colaborador agregado',
            wishlist
        };
    }

    removeCollaborator(wishlistId, userId) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        const index = wishlist.collaborators.findIndex(c => c.userId === userId);

        if (index === -1) {
            return { success: false, message: 'Colaborador no encontrado' };
        }

        wishlist.collaborators.splice(index, 1);
        this.saveWishlists();

        return { success: true, message: 'Colaborador eliminado' };
    }

    canEditWishlist(wishlistId, userId) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) return false;

        // Si no hay owner, cualquiera puede editar (legacy)
        if (!wishlist.owner) return true;

        // Si es el dueño
        if (wishlist.owner === userId) return true;

        // Si es colaborador con permisos
        const collaborator = wishlist.collaborators.find(c => c.userId === userId);
        return collaborator && (collaborator.permissions === 'edit' || collaborator.permissions === 'manage');
    }

    // ============================================
    // UTILIDADES
    // ============================================

    getUserWishlists(userId) {
        const userWishlists = [];

        for (const wishlistId in this.wishlists) {
            const wishlist = this.wishlists[wishlistId];

            // Listas propias
            if (wishlist.owner === userId) {
                userWishlists.push({ ...wishlist, role: 'owner' });
            }
            // Listas colaboradas
            else if (wishlist.collaborators.some(c => c.userId === userId)) {
                const collab = wishlist.collaborators.find(c => c.userId === userId);
                userWishlists.push({ ...wishlist, role: 'collaborator', permissions: collab.permissions });
            }
        }

        return userWishlists;
    }

    getPublicWishlists() {
        const publicWishlists = [];

        for (const wishlistId in this.wishlists) {
            const wishlist = this.wishlists[wishlistId];

            if (wishlist.isPublic) {
                publicWishlists.push(wishlist);
            }
        }

        // Ordenar por views
        publicWishlists.sort((a, b) => b.views - a.views);

        return publicWishlists;
    }

    mergeLists(sourceWishlistId, targetWishlistId, userId = null) {
        const sourceWishlist = this.wishlists[sourceWishlistId];
        const targetWishlist = this.wishlists[targetWishlistId];

        if (!sourceWishlist || !targetWishlist) {
            return { success: false, message: 'Una de las listas no existe' };
        }

        if (!this.canEditWishlist(targetWishlistId, userId)) {
            return { success: false, message: 'No tienes permiso para editar la lista destino' };
        }

        let added = 0;

        sourceWishlist.products.forEach(product => {
            const exists = targetWishlist.products.find(p => p.id === product.id);

            if (!exists) {
                targetWishlist.products.push({
                    ...product,
                    addedAt: new Date().toISOString(),
                    addedBy: userId
                });
                added++;
            }
        });

        targetWishlist.updatedAt = new Date().toISOString();
        this.saveWishlists();

        return {
            success: true,
            message: `${added} productos agregados`,
            wishlist: targetWishlist
        };
    }

    exportWishlist(wishlistId, format = 'json') {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        switch (format) {
            case 'json':
                return {
                    success: true,
                    data: JSON.stringify(wishlist, null, 2),
                    filename: `wishlist_${wishlist.name}_${Date.now()}.json`
                };

            case 'csv':
                let csv = 'Nombre,Marca,Precio,Notas,Fecha Agregado\n';
                wishlist.products.forEach(product => {
                    csv += `"${product.name}","${product.brand}",${product.price},"${product.notes}","${new Date(product.addedAt).toLocaleDateString()}"\n`;
                });
                return {
                    success: true,
                    data: csv,
                    filename: `wishlist_${wishlist.name}_${Date.now()}.csv`
                };

            case 'text':
                let text = `${wishlist.name}\n`;
                text += `${wishlist.description}\n\n`;
                text += `Productos (${wishlist.products.length}):\n\n`;
                wishlist.products.forEach((product, index) => {
                    text += `${index + 1}. ${product.name} - ${product.brand} - $${product.price}\n`;
                    if (product.notes) {
                        text += `   Notas: ${product.notes}\n`;
                    }
                });
                return {
                    success: true,
                    data: text,
                    filename: `wishlist_${wishlist.name}_${Date.now()}.txt`
                };

            default:
                return { success: false, message: 'Formato no soportado' };
        }
    }

    getWishlistStats(wishlistId) {
        const wishlist = this.wishlists[wishlistId];

        if (!wishlist) {
            return { success: false, message: 'Lista no encontrada' };
        }

        const totalProducts = wishlist.products.length;
        const totalValue = wishlist.products.reduce((sum, p) => sum + (p.price || 0), 0);
        const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

        const brands = {};
        wishlist.products.forEach(p => {
            brands[p.brand] = (brands[p.brand] || 0) + 1;
        });

        return {
            success: true,
            stats: {
                totalProducts,
                totalValue,
                averagePrice,
                brandBreakdown: brands,
                views: wishlist.views,
                collaborators: wishlist.collaborators.length,
                createdAt: wishlist.createdAt,
                lastUpdated: wishlist.updatedAt
            }
        };
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.WishlistShareSystem = WishlistShareSystem;
}
