document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS DE PRODUCTOS (SIMULADA) ---
    // En una aplicación real, esto vendría de una API
    const products = [
        { id: 1, name: 'Guantes FOX', price: 45000, image: 'IMG/Casco 1.jpg', stock: 5 },
        { id: 2, name: 'Casco BELL', price: 120000, image: 'IMG/CHAQUETA 1.jpg', stock: 1 },
        { id: 3, name: 'Chaqueta de aventura', price: 180000, image: 'IMG/GUANTES 1.webp', stock: 4 }
    ];

    // --- ESTADO DEL CARRITO ---
    let cart = JSON.parse(localStorage.getItem('francoElViajeroCart')) || [];

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // --- EVENT LISTENERS ---
    cartIcon.addEventListener('click', () => {
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        renderCart();
        cartModal.show();
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();
            renderCart(); // Actualizar el modal si está abierto
        }
    });

    checkoutBtn.addEventListener('click', () => {
        alert('¡Gracias por tu compra! (Esta es una simulación). En una tienda real, serías redirigido al proceso de pago.');
        cart = [];
        saveCartToLocalStorage();
        updateCartUI();
        bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });
    
    // Delegación de eventos para botones de cantidad y eliminar dentro del carrito
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-increase') || target.classList.contains('btn-decrease')) {
            const productId = parseInt(target.closest('.cart-item').dataset.productId);
            const change = target.classList.contains('btn-increase') ? 1 : -1;
            updateQuantity(productId, change);
        }
        if (target.classList.contains('btn-remove')) {
            const productId = parseInt(target.closest('.cart-item').dataset.productId);
            removeFromCart(productId);
        }
    });


    // --- FUNCIONES DEL CARRITO ---

    function addToCart(productId) {
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            if (existingItem.quantity < productToAdd.stock) {
                existingItem.quantity++;
            } else {
                alert(`No hay más stock de ${productToAdd.name}.`);
                return;
            }
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }

        saveCartToLocalStorage();
        updateCartUI();
        // Animación de feedback
        cartIcon.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => cartIcon.classList.remove('animate__animated', 'animate__pulse'), 1000);
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCartToLocalStorage();
        updateCartUI();
        renderCart(); // Re-renderizar el modal para que desaparezca el producto
    }

    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                const productStock = products.find(p => p.id === productId).stock;
                if (item.quantity > productStock) {
                    item.quantity = productStock;
                    alert(`No hay más stock de este producto.`);
                }
                saveCartToLocalStorage();
                updateCartUI();
                renderCart();
            }
        }
    }

    function updateCartUI() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
            cartTotal.textContent = '$0.00';
            return;
        }

        let total = 0;
        const cartHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h5>${item.name}</h5>
                        <p>Precio: $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="btn btn-sm btn-secondary btn-decrease">-</button>
                        <input type="number" value="${item.quantity}" min="1" readonly>
                        <button class="btn btn-sm btn-secondary btn-increase">+</button>
                    </div>
                    <div class="cart-item-total">
                        $${itemTotal.toFixed(2)}
                    </div>
                    <button class="btn btn-sm btn-danger btn-remove ms-3">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        cartItemsContainer.innerHTML = cartHTML;
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('francoElViajeroCart', JSON.stringify(cart));
    }

    // --- INICIALIZACIÓN ---
    updateCartUI();

});