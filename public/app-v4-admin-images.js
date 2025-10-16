// ==================== MÓDULO DE ADMINISTRACIÓN DE IMÁGENES V4.1 ====================

// Mostrar gestor de imágenes para un producto
window.showImageManager = async function(partId) {
    console.log('📸 Abriendo gestor de imágenes para producto:', partId);

    // Verificar autenticación admin
    if (!auth.user || !auth.user.is_admin) {
        addMessage('❌ Solo los administradores pueden gestionar imágenes', false);
        return;
    }

    if (!auth.token) {
        addMessage('❌ No se encontró el token de autenticación', false);
        return;
    }

    try {
        // Obtener info del producto desde el array app.parts
        const part = app.parts.find(p => p.id === partId);
        if (!part) {
            addMessage(`❌ Producto con ID ${partId} no encontrado`, false);
            return;
        }

        // Obtener imágenes del producto
        const imagesResponse = await fetch(`http://localhost:3000/api/parts/${partId}/images`);
        if (!imagesResponse.ok) {
            throw new Error(`HTTP ${imagesResponse.status}`);
        }
        const images = await imagesResponse.json();

        let html = `
            <div class="image-manager-container">
                <h3>🖼️ Gestión de Imágenes</h3>
                <div class="product-name-badge">${part.name}</div>

                <div class="image-upload-section">
                    <h4>📤 Subir Nuevas Imágenes</h4>
                    <p style="font-size: 13px; color: #7f8c8d; margin-bottom: 10px;">
                        Puedes subir hasta 5 imágenes a la vez (máximo 5MB por imagen)
                    </p>
                    <div class="image-upload-dropzone" id="dropzone-${partId}" onclick="document.getElementById('file-input-${partId}').click()">
                        <div class="dropzone-content">
                            <span style="font-size: 48px;">📁</span>
                            <p style="margin: 10px 0 5px 0; font-weight: 600;">Haz clic o arrastra imágenes aquí</p>
                            <p style="font-size: 13px; color: #7f8c8d;">JPEG, PNG, GIF, WebP (máx. 5MB)</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        id="file-input-${partId}"
                        accept="image/*"
                        multiple
                        style="display: none;"
                        onchange="uploadImages(${partId}, this.files)"
                    >
                    <div id="upload-preview-${partId}" class="upload-preview"></div>
                </div>

                <div class="existing-images-section">
                    <h4>🖼️ Imágenes Actuales (${images.length})</h4>
                    <div class="images-grid" id="images-grid-${partId}">
                        ${images.length > 0 ? renderImagesGrid(images, partId) : '<p style="color: #95a5a6; text-align: center; padding: 30px;">No hay imágenes para este producto</p>'}
                    </div>
                </div>
            </div>
        `;

        // Crear modal para mostrar el gestor
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                ${html}
            </div>
        `;
        document.body.appendChild(modal);

        // Setup drag & drop
        setupDragAndDrop(partId);

    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al cargar el gestor de imágenes', false);
    }
};

// Renderizar grid de imágenes
function renderImagesGrid(images, partId) {
    return images.map(image => `
        <div class="image-grid-item" id="image-item-${image.id}">
            <div class="image-wrapper">
                <img src="${image.image_url}" alt="Imagen del producto" onerror="this.src='https://via.placeholder.com/200'">
                ${image.is_primary ? '<div class="primary-badge">⭐ Principal</div>' : ''}
            </div>
            <div class="image-actions">
                ${!image.is_primary ? `<button onclick="setPrimaryImage(${partId}, ${image.id})" class="btn-sm btn-primary" title="Establecer como principal">⭐ Principal</button>` : '<button class="btn-sm btn-secondary" disabled>✅ Principal</button>'}
                <button onclick="deleteImage(${partId}, ${image.id})" class="btn-sm btn-danger" title="Eliminar">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Setup drag & drop
function setupDragAndDrop(partId) {
    const dropzone = document.getElementById(`dropzone-${partId}`);
    if (!dropzone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('dropzone-active');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('dropzone-active');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        uploadImages(partId, files);
    });
}

// Subir imágenes
window.uploadImages = async function(partId, files) {
    if (!files || files.length === 0) return;

    // Validar cantidad
    if (files.length > 5) {
        addMessage('❌ Máximo 5 imágenes por vez', false);
        return;
    }

    // Validar tamaños
    for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
            addMessage(`❌ La imagen "${file.name}" excede el límite de 5MB`, false);
            return;
        }
    }

    const preview = document.getElementById(`upload-preview-${partId}`);
    preview.innerHTML = '<div class="upload-progress">📤 Subiendo imágenes...</div>';

    const formData = new FormData();
    for (let file of files) {
        formData.append('images', file);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/admin/parts/${partId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            preview.innerHTML = `<div class="upload-success">✅ ${result.message}</div>`;

            // Recargar grid de imágenes
            const imagesResponse = await fetch(`http://localhost:3000/api/parts/${partId}/images`);
            const images = await imagesResponse.json();
            document.getElementById(`images-grid-${partId}`).innerHTML = renderImagesGrid(images, partId);

            // Limpiar preview después de 2 segundos
            setTimeout(() => {
                preview.innerHTML = '';
                document.getElementById(`file-input-${partId}`).value = '';
            }, 2000);
        } else {
            preview.innerHTML = `<div class="upload-error">❌ ${result.error}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        preview.innerHTML = '<div class="upload-error">❌ Error al subir imágenes</div>';
    }
};

// Establecer imagen como principal
window.setPrimaryImage = async function(partId, imageId) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/parts/${partId}/images/${imageId}/primary`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            addMessage('✅ Imagen principal actualizada', false);

            // Recargar grid de imágenes
            const imagesResponse = await fetch(`http://localhost:3000/api/parts/${partId}/images`);
            const images = await imagesResponse.json();
            document.getElementById(`images-grid-${partId}`).innerHTML = renderImagesGrid(images, partId);
        } else {
            addMessage(`❌ ${result.error}`, false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al actualizar imagen principal', false);
    }
};

// Eliminar imagen
window.deleteImage = async function(partId, imageId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admin/parts/${partId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            addMessage('✅ Imagen eliminada', false);

            // Remover del DOM con animación
            const imageItem = document.getElementById(`image-item-${imageId}`);
            if (imageItem) {
                imageItem.style.opacity = '0';
                imageItem.style.transform = 'scale(0.8)';
                setTimeout(() => imageItem.remove(), 300);
            }
        } else {
            addMessage(`❌ ${result.error}`, false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al eliminar imagen', false);
    }
};

// Agregar botón de gestión de imágenes en las tarjetas de productos
window.addImageManagementToCards = function() {
    // Esta función se puede llamar después de renderizar productos en el dashboard
    const partCards = document.querySelectorAll('.part-card-v3');
    partCards.forEach(card => {
        const partId = card.dataset.partId;
        if (partId && auth.user && auth.user.is_admin) {
            const actionsDiv = card.querySelector('.part-actions');
            if (actionsDiv && !actionsDiv.querySelector('.btn-manage-images')) {
                const imageBtn = document.createElement('button');
                imageBtn.className = 'btn-sm btn-secondary btn-manage-images';
                imageBtn.innerHTML = '🖼️ Imágenes';
                imageBtn.title = 'Gestionar imágenes';
                imageBtn.onclick = () => showImageManager(partId);
                actionsDiv.appendChild(imageBtn);
            }
        }
    });
};

// Ver galería de imágenes de un producto (para usuarios)
window.viewProductImages = async function(partId) {
    console.log('🖼️ Abriendo galería de imágenes para producto:', partId);

    try {
        // Obtener info del producto desde el array app.parts
        const part = app.parts.find(p => p.id === partId);
        if (!part) {
            addMessage(`❌ Producto con ID ${partId} no encontrado`, false);
            return;
        }

        // Obtener imágenes del producto
        const imagesResponse = await fetch(`http://localhost:3000/api/parts/${partId}/images`);
        if (!imagesResponse.ok) {
            throw new Error(`HTTP ${imagesResponse.status}`);
        }
        const images = await imagesResponse.json();

        if (images.length === 0) {
            addMessage('Este producto no tiene imágenes adicionales', false);
            return;
        }

        // Crear modal con galería de imágenes
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="image-gallery-container">
                    <h3>🖼️ ${part.name}</h3>
                    <p style="color: #7f8c8d; margin-bottom: 20px;">Galería de imágenes (${images.length})</p>

                    <div class="image-gallery-main">
                        <img id="gallery-main-image" src="${images[0].image_url}" alt="${part.name}" style="width: 100%; max-height: 500px; object-fit: contain; border-radius: 12px; background: #f8f9fa;">
                    </div>

                    <div class="image-gallery-thumbs">
                        ${images.map((img, index) => `
                            <div class="gallery-thumb ${index === 0 ? 'active' : ''}" onclick="changeGalleryImage('${img.image_url}', this)">
                                <img src="${img.image_url}" alt="Imagen ${index + 1}">
                                ${img.is_primary ? '<span class="thumb-badge">⭐</span>' : ''}
                            </div>
                        `).join('')}
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <div class="part-price" style="font-size: 24px; font-weight: 700; color: #27ae60; margin-bottom: 10px;">$${formatPrice(part.price)}</div>
                        <button onclick="addToCart(${partId}); this.parentElement.parentElement.parentElement.parentElement.remove();" class="btn-primary" style="padding: 12px 30px; font-size: 16px;">🛒 Agregar al Carrito</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al cargar las imágenes', false);
    }
};

// Cambiar imagen principal en la galería
window.changeGalleryImage = function(imageUrl, thumbElement) {
    document.getElementById('gallery-main-image').src = imageUrl;

    // Remover clase active de todos los thumbs
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });

    // Agregar clase active al thumb seleccionado
    thumbElement.classList.add('active');
};

console.log('✅ Módulo de administración de imágenes V4.0 cargado');
