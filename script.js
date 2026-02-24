document.addEventListener("DOMContentLoaded", function () {

    // --- 1. Swiper Slider Init ---
    if (document.querySelector('.hero-swiper')) {
        const swiper = new Swiper('.hero-swiper', {
            loop: true,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }

    // --- 2. Mobile Menu & Sticky Header ---
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        revealElements();
    });

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars-staggered');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars-staggered');
        }
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.querySelector('i').classList.remove('fa-xmark');
            mobileToggle.querySelector('i').classList.add('fa-bars-staggered');
        });
    });

    // --- 3. Intersection Observer Reveal ---
    const reveals = document.querySelectorAll('.reveal');
    function revealElements() {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    }
    // Initial reveal check
    revealElements();

    // --- 4. Portfolio / Shop Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            products.forEach(product => {
                product.classList.remove('reveal'); // reset reveal anim
                product.classList.remove('active'); // reset reveal anim
                product.style.display = 'none';

                if (filterValue === 'all' || product.getAttribute('data-category') === filterValue) {
                    product.style.display = 'block';
                    // Re-trigger animation
                    setTimeout(() => {
                        product.classList.add('reveal', 'active');
                    }, 50);
                }
            });
        });
    });

    // --- 5. Functional Shopping Cart ---
    let cart = [];
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const orderModal = document.getElementById('orderModal');
    const badge = document.querySelector('.cart-badge');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimeout;

    // Open/Close Cart
    function toggleCart(show) {
        if (show) {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('show');
        } else {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
        }
    }

    cartBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    // Collection items scroll to shop and filter
    const collectionItems = document.querySelectorAll('.collection-item');
    collectionItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetFilter = item.getAttribute('data-filter-target');
            if (targetFilter) {
                e.preventDefault();
                // Trigger the filter button click
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${targetFilter}"]`);
                if (filterBtn) filterBtn.click();

                // Scroll to the shop section
                const shopSection = document.getElementById('shop');
                if (shopSection) {
                    shopSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Add to Cart Logic
    const addBtns = document.querySelectorAll('.add-to-cart');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            const image = btn.getAttribute('data-image');

            // Find if item exists in cart
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ id, name, price, image, qty: 1 });
            }

            updateCartUI();

            // Button visual feedback
            const originalBg = btn.style.backgroundColor;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> تمت الإضافة (${price} ج.م)`;
            btn.style.backgroundColor = '#d4af37'; // Gold

            // Show Toast
            toastMsg.textContent = `تم إضافة ${name} إلى السلة بنجاح.`;
            clearTimeout(toastTimeout);
            toast.classList.add('show');
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);

            // Pop Badge
            badge.style.transform = 'scale(1.5)';
            setTimeout(() => badge.style.transform = 'scale(1)', 300);

            // Reset Button after delay
            setTimeout(() => {
                btn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> إضافة للسلة`;
                btn.style.backgroundColor = originalBg;
            }, 2000);
        });
    });

    // Update Cart UI
    function updateCartUI() {
        // Calculate totals
        let totalQty = 0;
        let totalPrice = 0;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>سلتك فارغة الأناقة حالياً!</p>
                </div>
            `;
            badge.textContent = '0';
            cartTotalValue.textContent = '0';
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
            return;
        }

        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';

        cart.forEach((item, index) => {
            totalQty += item.qty;
            totalPrice += item.price * item.qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} ج.م</p>
                    <div class="cart-qty-ctrl">
                        <button class="qty-btn minus" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.qty}</span>
                        <button class="qty-btn plus" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="cart-remove" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        badge.textContent = totalQty;
        cartTotalValue.textContent = totalPrice.toLocaleString();

        // Attach listeners to dynamically created buttons
        attachCartListeners();
    }

    function attachCartListeners() {
        // Minus buttons
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (cart[idx].qty > 1) {
                    cart[idx].qty--;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });

        // Plus buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cart[idx].qty++;
                updateCartUI();
            });
        });

        // Remove buttons
        document.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    // Checkout → Open Order Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            toggleCart(false);
            toggleModal(orderModal, true);
        }
    });

    // Build WhatsApp message from cart items
    function buildWhatsAppMessage(name, phone, address) {
        let msg = `🌸 *طلب جديد من جاردينيا الفاخرة* 🌸\n\n`;
        msg += `👤 *الاسم:* ${name}\n`;
        msg += `📞 *الهاتف:* ${phone}\n`;
        msg += `📍 *العنوان:* ${address}\n\n`;
        msg += `🛒 *تفاصيل الطلب:*\n`;
        msg += `━━━━━━━━━━━━━━━━\n`;
        let total = 0;
        cart.forEach((item, i) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            msg += `${i + 1}. ${item.name}\n   الكمية: ${item.qty}   |   الإجمالي: ${itemTotal.toLocaleString()} ج.م\n`;
        });
        msg += `━━━━━━━━━━━━━━━━\n`;
        msg += `💰 *المجموع الكلي: ${total.toLocaleString()} ج.م*\n\n`;
        msg += `شكراً لتسوقكم معنا! 🌺`;
        return encodeURIComponent(msg);
    }

    // Submit order via WhatsApp
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('orderName').value.trim();
            const phone = document.getElementById('orderPhone').value.trim();
            const address = document.getElementById('orderAddress').value.trim();

            const shopPhone = '201234567890'; // رقم واتساب المحل
            const message = buildWhatsAppMessage(name, phone, address);
            const whatsappURL = `https://wa.me/${shopPhone}?text=${message}`;

            // Clear cart
            cart = [];
            updateCartUI();
            toggleModal(orderModal, false);

            // Show success toast
            toastMsg.innerHTML = '<b>تم إرسال طلبك!</b> سيتم تحويلك للواتساب لتأكيد الطلب...';
            clearTimeout(toastTimeout);
            toast.classList.add('show');
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 4000);

            // Open WhatsApp after short delay
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 1000);
        });
    }

    // --- 6. Modals Logic (Search & Profile) ---
    const searchBtn = document.getElementById('searchBtn');
    const profileBtn = document.getElementById('profileBtn');
    const searchModal = document.getElementById('searchModal');
    const profileModal = document.getElementById('profileModal');
    const closeSearch = document.getElementById('closeSearch');
    const closeProfile = document.getElementById('closeProfile');

    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('show');
            // Auto focus input if exists
            setTimeout(() => {
                const input = modal.querySelector('input');
                if (input) input.focus();
            }, 100);
        } else {
            modal.classList.remove('show');
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', () => toggleModal(searchModal, true));
    if (profileBtn) profileBtn.addEventListener('click', () => toggleModal(profileModal, true));
    if (closeSearch) closeSearch.addEventListener('click', () => toggleModal(searchModal, false));
    if (closeProfile) closeProfile.addEventListener('click', () => toggleModal(profileModal, false));

    const closeOrder = document.getElementById('closeOrder');
    if (closeOrder) closeOrder.addEventListener('click', () => toggleModal(orderModal, false));

    // Close on overlay click
    window.addEventListener('click', (e) => {
        if (e.target === searchModal) toggleModal(searchModal, false);
        if (e.target === profileModal) toggleModal(profileModal, false);
        if (e.target === orderModal) toggleModal(orderModal, false);
    });

});
