document.querySelectorAll('.product .btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const product = btn.closest('.product');
    const imgSrc = product.querySelector('img').src;
    const title = product.querySelector('.product-title').innerText;
    const price = product.querySelector('.product-price').innerText;
    document.getElementById('popupImage').src = imgSrc;
    document.getElementById('popupTitle').innerText = title;
    document.getElementById('popupPrice').innerText = price;
    document.getElementById('popupDescription').innerText = "This is a beautiful product with high-quality fabric, made with care. Perfect for your wardrobe.";
    document.getElementById('quickViewPopup').style.display = 'flex';
  });
});

// Close popup
document.querySelector('.close-popup').addEventListener('click', () => {
  document.getElementById('quickViewPopup').style.display = 'none';
});

// Zoom on image
const zoomImg = document.getElementById('popupImage');
const zoomContainer = document.querySelector('.zoom-container');
zoomContainer.addEventListener('mousemove', function(e) {
  const { left, top, width, height } = zoomContainer.getBoundingClientRect();
  const x = (e.clientX - left) / width * 100;
  const y = (e.clientY - top) / height * 100;
  zoomImg.style.transformOrigin = `${x}% ${y}%`;
  zoomImg.style.transform = 'scale(6)';
});
zoomContainer.addEventListener('mouseleave', function() {
  zoomImg.style.transform = 'scale(1)';
  zoomImg.style.transformOrigin = 'center center';
});

// Cart functionality with database integration
let cart = [];

// Load cart data when page loads
async function loadCart() {
    cart = await DBHandler.getCart();
    updateCartDisplay();
}

// Save cart data to database
async function saveCart() {
    await DBHandler.updateCart(cart);
}

// Initialize cart on page load
loadCart();

// Open cart
document.querySelector('.fa-shopping-cart').addEventListener('click', () => {
    document.querySelector('.cart-sidebar').classList.add('active');
    document.querySelector('.cart-overlay').classList.add('active');
});

// Close cart
document.querySelector('.close-cart').addEventListener('click', () => {
    document.querySelector('.cart-sidebar').classList.remove('active');
    document.querySelector('.cart-overlay').classList.remove('active');
});
document.querySelector('.cart-overlay').addEventListener('click', () => {
    document.querySelector('.cart-sidebar').classList.remove('active');
    document.querySelector('.cart-overlay').classList.remove('active');
});

// Add to cart
async function addToCart(product)  {
    const quantity = parseInt(document.querySelector('#quantity').value);
    const existingItem = cart.find(item => item.title === product.title);
    const price = parseFloat(product.price.replace('$', '')); 
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * price;
    } else {
        cart.push({
            ...product,
            quantity: quantity,
            basePrice: price,
            totalPrice: quantity * price
        });
    }
    await saveCart();
    updateCartDisplay();
    showNotification (`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
}

// Update quantity
async function updateItemQuantity(index, newQuantity) {
    if (newQuantity < 1) return;
    const item = cart[index];
    item.quantity = newQuantity;
    item.totalPrice = item.basePrice * newQuantity;
    await saveCart();
    updateCartDisplay();
}

// Remove from cart
async function removeFromCart(index) {
    cart.splice(index, 1);
    await saveCart();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.totalPrice || (item.basePrice * item.quantity);
        total += itemTotal;
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-meta">
                        <div class="cart-item-price">
                            $${item.basePrice.toFixed(2)} x ${item.quantity}
                        </div>
                        <div class="cart-item-total">
                            Total: $${itemTotal.toFixed(2)}
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="updateItemQuantity(${index}, ${item.quantity - 1})" 
                                ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateItemQuantity(${index}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart(${index})">×</div>
            </div>`;
    });
    document.querySelector('.total-amount').textContent = `$${total.toFixed(2)}`;
}

// Add to cart from popup
document.querySelectorAll('.popup-buttons .btn.black').forEach(btn => {
    btn.addEventListener('click', () => {
        const popup = document.getElementById('quickViewPopup');
        const productData = {
            image: popup.querySelector('#popupImage').src,
            title: popup.querySelector('#popupTitle').textContent,
            price: popup.querySelector('#popupPrice').textContent
        };
        addToCart(productData);
        popup.style.display = 'none';
    });
});

// Add Buy Now functionality
document.querySelector('.popup-buttons .btn.white').addEventListener('click', async () => {
    const popup = document.getElementById('quickViewPopup');
    const quantity = parseInt(document.querySelector('#quantity').value);
    const productData = {
        image: popup.querySelector('#popupImage').src,
        title: popup.querySelector('#popupTitle').textContent,
        price: popup.querySelector('#popupPrice').textContent,
        quantity: quantity,
        basePrice: parseFloat(popup.querySelector('#popupPrice').textContent.replace('$', '')),
        totalPrice: quantity * parseFloat(popup.querySelector('#popupPrice').textContent.replace('$', ''))
    };

    // Clear existing cart and add this item
    cart = [productData];
    await saveCart();
    updateCartDisplay();
    
    // Close quick view popup and open checkout
    popup.style.display = 'none';
    updateCheckoutSummary();
    checkoutPopup.style.display = 'flex';
});

// Quantity controls in popup
document.querySelector('.quantity-btn.minus').addEventListener('click', () => {
    const input = document.querySelector('#quantity');
    const value = parseInt(input.value) - 1;
    input.value = value < 1 ? 1 : value;
});

document.querySelector('.quantity-btn.plus').addEventListener('click', () => {
    const input = document.querySelector('#quantity');
    const value = parseInt(input.value) + 1;
    input.value = value > 99 ? 99 : value;
});

// Notification system
document.body.insertAdjacentHTML('beforeend', '<div class="notification"></div>');
function showNotification(message) {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Checkout functionality
const checkoutPopup = document.getElementById('checkoutPopup');
const checkoutForm = document.getElementById('checkoutForm');
document.querySelector('.checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Please add items to your cart before checkout');
        return;
    }
    updateCheckoutSummary();
    checkoutPopup.style.display = 'flex';
});
document.querySelector('#checkoutPopup .close-popup').addEventListener('click', () => {
    checkoutPopup.style.display = 'none';
    checkoutForm.reset();
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
});

// Cancel checkout button functionality
document.querySelector('.cancel-checkout').addEventListener('click', () => {
    checkoutPopup.style.display = 'none';
    checkoutForm.reset();
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
});

// Close checkout when clicking overlay
checkoutPopup.addEventListener('click', (e) => {
    if (e.target === checkoutPopup) {
        checkoutPopup.style.display = 'none';
        checkoutForm.reset();
        document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    }
});
function updateCheckoutSummary() {
    const checkoutItems = document.querySelector('.checkout-items');
    const checkoutAmount = document.querySelector('.checkout-amount');
    let total = 0; 
    checkoutItems.innerHTML = cart.map(item => {
        total += item.totalPrice;
        return `
            <div class="checkout-item">
                <span>${item.title}</span>
                <span>${item.quantity} x $${item.basePrice.toFixed(2)}</span>
                <span>$${item.totalPrice.toFixed(2)}</span>
            </div>`;
    }).join('');
    checkoutAmount.textContent = `$${total.toFixed(2)}`;
}
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.totalPrice, 0)
    };

    // Validate form
    let isValid = true;
    Object.entries(formData).forEach(([key, value]) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            const input = document.getElementById(key);
            if (input) {
                input.nextElementSibling.textContent = `Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
                isValid = false;
            }
        }
    });
    if (!isValid) return;
    try {
        // Send email using email service
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: 'service_7p1ufso',
                template_id: 'template_ii7l8nh',
                user_id: '1x7NQXromfH7CNRIF',
                template_params: {
                    to_email: 'muhammadmoazmdmz@gmail.com',
                    from_name: formData.name,
                    message: `
                        New Order Details:
                        Name: ${formData.name}
                        Phone: ${formData.phone}
                        Address: ${formData.address}
                        City: ${formData.city}
                        Postal Code: ${formData.postalCode}
                        
                        Order Items:
                        ${cart.map(item => `${item.title} - ${item.quantity}x $${item.basePrice}`).join('\n')}
                        
                        Total: $${formData.total}`
                }
            })
        });
        if (response.ok) {
            showNotification('Order placed successfully!');
            cart = [];
            await saveCart();
            updateCartDisplay();
            checkoutPopup.style.display = 'none';
            checkoutForm.reset();
        } else {
            throw new Error('Failed to send order');
        }
    } catch (error) {
        showNotification('Failed to place order. Please try again.');
    }
});