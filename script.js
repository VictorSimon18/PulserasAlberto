// ============================================
// SISTEMA DE AUTENTICACIÓN
// ============================================

// Verificar si hay usuario logueado
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.getElementById('loginLink');

    if (currentUser && loginLink) {
        const user = JSON.parse(currentUser);
        loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name}`;
        loginLink.href = '#';
        loginLink.onclick = (e) => {
            e.preventDefault();
            if (confirm('¿Deseas cerrar sesión?')) {
                logout();
            }
        };
    }
}

// Manejar registro de usuario
function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const messageDiv = document.getElementById('registerMessage');

    // Validaciones
    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Las contraseñas no coinciden', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageDiv, 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Verificar si el email ya existe
    if (users.find(u => u.email === email)) {
        showMessage(messageDiv, 'Este correo ya está registrado', 'error');
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // En producción, esto debería estar hasheado
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showMessage(messageDiv, '¡Cuenta creada con éxito! Redirigiendo...', 'success');

    // Login automático
    setTimeout(() => {
        const userForSession = { id: newUser.id, name: newUser.name, email: newUser.email };
        localStorage.setItem('currentUser', JSON.stringify(userForSession));
        window.location.href = 'index.html';
    }, 1500);
}

// Manejar inicio de sesión
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');

    // Obtener usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Buscar usuario
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showMessage(messageDiv, 'Correo o contraseña incorrectos', 'error');
        return;
    }

    showMessage(messageDiv, '¡Bienvenido! Redirigiendo...', 'success');

    // Guardar sesión
    const userForSession = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(userForSession));

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Mostrar mensajes en formularios
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}

// Alternar entre formularios de login y registro
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

// ============================================
// SISTEMA DE CARRITO DE COMPRAS
// ============================================

let cart = [];

// Inicializar carrito
function initCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

// Añadir producto al carrito
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showCartNotification();
}

// Guardar carrito
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Actualizar interfaz del carrito
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    // Actualizar items
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">${item.price.toFixed(2)}€</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalPrice) {
        totalPrice.textContent = total.toFixed(2) + '€';
    }
}

// Actualizar cantidad de un item
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Eliminar item del carrito
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

// Alternar visibilidad del carrito
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

// Notificación al añadir producto
function showCartNotification() {
    // Crear efecto visual en el botón del carrito
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.animation = 'none';
        setTimeout(() => {
            cartBtn.style.animation = 'pulse 0.5s';
        }, 10);
    }
}

// ============================================
// SISTEMA DE PAGO
// ============================================

function checkout() {
    // Verificar si hay usuario logueado
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        alert('Debes iniciar sesión para continuar con la compra');
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear modal de pago
    const paymentModal = document.createElement('div');
    paymentModal.className = 'payment-modal';
    paymentModal.innerHTML = `
        <div class="payment-content">
            <button class="close-payment" onclick="closePaymentModal()">
                <i class="fas fa-times"></i>
            </button>
            <h2><i class="fas fa-credit-card"></i> Finalizar Compra</h2>

            <div class="order-summary">
                <h3>Resumen del Pedido</h3>
                ${cart.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                `).join('')}
                <div class="summary-total">
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}€</strong>
                </div>
            </div>

            <form onsubmit="processPayment(event)" class="payment-form">
                <h3>Información de Envío</h3>

                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Dirección</label>
                    <input type="text" required placeholder="Calle y número">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Ciudad</label>
                        <input type="text" required placeholder="Ciudad">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-mail-bulk"></i> Código Postal</label>
                        <input type="text" required placeholder="CP">
                    </div>
                </div>

                <h3>Información de Pago (Simulado)</h3>

                <div class="form-group">
                    <label><i class="fas fa-credit-card"></i> Número de Tarjeta</label>
                    <input type="text" required placeholder="1234 5678 9012 3456" maxlength="19">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Caducidad</label>
                        <input type="text" required placeholder="MM/AA" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> CVV</label>
                        <input type="text" required placeholder="123" maxlength="3">
                    </div>
                </div>

                <div class="payment-info">
                    <i class="fas fa-info-circle"></i>
                    <p>Este es un pago simulado. No se realizará ningún cargo real.</p>
                </div>

                <button type="submit" class="btn-primary btn-full">
                    <i class="fas fa-check"></i> Confirmar Pedido (${total.toFixed(2)}€)
                </button>
            </form>
        </div>
    `;

    // Añadir estilos para el modal
    if (!document.getElementById('payment-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'payment-modal-styles';
        styles.textContent = `
            .payment-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background-color: rgba(0,0,0,0.7);
                z-index: 3000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                overflow-y: auto;
            }

            .payment-content {
                background-color: white;
                border-radius: 20px;
                padding: 2.5rem;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }

            .close-payment {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: transparent;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--dark-brown);
            }

            .payment-content h2 {
                color: var(--dark-brown);
                margin-bottom: 1.5rem;
                font-size: 1.8rem;
            }

            .payment-content h2 i {
                color: var(--primary-color);
            }

            .order-summary {
                background-color: var(--light-beige);
                padding: 1.5rem;
                border-radius: 10px;
                margin-bottom: 2rem;
            }

            .order-summary h3 {
                color: var(--dark-brown);
                margin-bottom: 1rem;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }

            .summary-total {
                display: flex;
                justify-content: space-between;
                padding-top: 1rem;
                margin-top: 0.5rem;
                border-top: 2px solid var(--primary-color);
                font-size: 1.3rem;
            }

            .payment-form h3 {
                color: var(--dark-brown);
                margin: 1.5rem 0 1rem 0;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

            .payment-info {
                background-color: #E3F2FD;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .payment-info i {
                color: #1976D2;
                font-size: 1.2rem;
            }

            .payment-info p {
                color: #1565C0;
                margin: 0;
                font-size: 0.9rem;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(paymentModal);
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

function processPayment(event) {
    event.preventDefault();

    // Simular procesamiento
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    setTimeout(() => {
        // Guardar pedido
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const order = {
            id: Date.now(),
            user: currentUser,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'confirmed'
        };

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Limpiar carrito
        cart = [];
        saveCart();
        updateCartUI();

        // Cerrar modal
        closePaymentModal();

        // Mostrar confirmación
        showOrderConfirmation(order);
    }, 2000);
}

function showOrderConfirmation(order) {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'payment-modal';
    confirmationModal.innerHTML = `
        <div class="payment-content" style="text-align: center;">
            <div style="font-size: 4rem; color: var(--success-color); margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>¡Pedido Confirmado!</h2>
            <p style="font-size: 1.2rem; color: #666; margin: 1rem 0;">
                Tu pedido #${order.id} ha sido recibido correctamente.
            </p>
            <div style="background-color: var(--light-beige); padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                <p style="margin-bottom: 0.5rem;"><strong>Total:</strong> ${order.total.toFixed(2)}€</p>
                <p style="margin-bottom: 0.5rem;"><strong>Tiempo de elaboración:</strong> 3-5 días laborables</p>
                <p style="margin: 0; color: #666; font-size: 0.95rem;">
                    Recibirás una confirmación en tu correo electrónico.
                </p>
            </div>
            <p style="color: var(--dark-brown); margin: 1.5rem 0;">
                <i class="fas fa-phone"></i> Si tienes alguna duda, llámanos al <strong>640 841 792</strong>
            </p>
            <button onclick="closePaymentModal(); toggleCart();" class="btn-primary">
                <i class="fas fa-home"></i> Volver a la Tienda
            </button>
        </div>
    `;

    document.body.appendChild(confirmationModal);
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito
    initCart();

    // Verificar autenticación
    checkAuth();

    // Smooth scroll para los enlaces del menú
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
