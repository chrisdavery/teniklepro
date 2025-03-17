


class UpsellAddons extends HTMLElement {
    constructor() {
        super();

        window.items = window.items || [];

        const _this = this
        // Select all upsell items and attach the event handler
        // _this.querySelectorAll('.upsell-item-100:not(.has-options)').forEach(item => {
        //     item.addEventListener('click', () => this.handleItemClick(item));
        // });

        _this.querySelector('.button-addon-upsell')?.addEventListener('click', (evt) => {
            window.location = '/checkout';
            this.classList.add('loading');
            this.querySelector('.loading-overlay__spinner').classList.remove('hidden');
        });
        
        _this.querySelectorAll('.add-button-upsell').forEach(item => {
            item.addEventListener('click', () => this.handleItemClick(item.closest('.upsell-item-100')));
        });

        _this.querySelectorAll('.add-button-cta-full').forEach(item => {
            item.addEventListener('click', () => this.handleItemClick(item.closest('.upsell-item-100')));
        });

        _this.querySelectorAll('.upsell-item-100 .quantity__input').forEach(qty => {
            qty.addEventListener('change', () => _this.handleQtyChange(qty));
        });

        _this.querySelector('.button-add-all button')?.addEventListener('click', (evt) => {
            this.classList.toggle('active');
            this.classList.add('loading');
            this.querySelector('.loading-overlay__spinner').classList.remove('hidden');
            _this.querySelectorAll('.upsell-item-100').forEach(item => item.classList.add('active'));
            _this.addAllItemsToCart();
        });

        _this.querySelectorAll('.addon-product-select').forEach(sel => {
            sel.addEventListener('change', (evt) => {
                _this.updateCustomSelected(evt.detail.selectedValue)
            });
        });

        if ( _this.querySelectorAll('.addon-product-select').length > 0 ) {
            const firstOpt = _this.querySelectorAll('.addon-product-select')[0]

            _this.updateCustomSelected(firstOpt.querySelectorAll('.custom-select__option:not([disabled])')[0])
        }

        _this.querySelectorAll('.addon-select [name="id"]').forEach(sel => {
            sel.addEventListener('change', () => this.updateSelectedItem(sel));
        });

        if (this.querySelector('.countdown-midnight') != null) {
            this.countdownMidnight();
        }
    }

    countdownMidnight() {
        const endTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // Set end time 4 hours from now

        const updateCountdown = () => {
            const now = new Date();
            const diff = endTime - now;
        
            if (diff <= 0) {
                document.querySelector('.countdown-midnight').textContent = "00:00:00";
                clearInterval(interval);
                return;
            }
        
            const hours = String(Math.floor((diff / (1000 * 60 * 60)))).padStart(2, '0');
            const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        
            document.querySelector('.countdown-midnight').textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        
    };



    updateItemsArray() {
        window.items = window.items || [];
        Array.from(this.querySelectorAll('.upsell-item-100.active')).forEach(item => {
            const id = Number(item.getAttribute('data-id'));
            const qtyVal = Number(item.querySelector('.quantity__input').value)

            if (!window.items.some(existingItem => existingItem.id === id)) {
                window.items.push({
                    'quantity': qtyVal,
                    'id': id,
                    'properties': { '_Status': 'Addons' }
                });
            }
        });
    }

    handleItemClick(item) {

        const qtyVal = Number(item.querySelector('.quantity__input').value)
        const itemId = Number(item.dataset.id);
        const itempId = Number(item.dataset.productId);
        item.classList.toggle('active');
        this.updateItemsArray();

        if (item.classList.contains('active')) {
            this.addToCart(item, itemId, itempId, qtyVal);
        } else {
            this.removeFromCart(itemId);
        }
    }

    addToCart(item,itemId, itempId, qtyVal) {

        const formData = {
            'items': [{
                'quantity': qtyVal,
                'id': itemId,
                'properties': { '_Status': 'Addons' }
            }]
        };

        // Conditionally add 'selling_plan' if it exists
        if (item.dataset.sellingPlan !== undefined) {
            formData.items[0]['selling_plan'] = Number(item.dataset.sellingPlan);
        }

        fetch('/cart.js').then(response => response.json())
            .then(cartData => {
                const cartItems = cartData.items;

                const alreadyInCart = cartItems.some(item => item.product_id === itempId);
                const cartSamePid = cartItems.filter(item => ((item.product_id === itempId) && (item.variant_id === itemId)));

                if (alreadyInCart) {
                    const updates = {};
                    updates[itemId] = 0;

                    if (cartSamePid[0]?.id && cartSamePid[0]?.id == itemId) {
                        updates[cartSamePid[0].id] = qtyVal;
                    } else {
                        updates[itemId] = 1;
                    }
                    return this.updateCart(updates);
                } else {
                    return this.addItemToCart(formData);
                }
            });
    }

    handleQtyChange(qty) {
        const parent = qty.closest('.upsell-item-100')
        const itemId = Number(parent.dataset.id);
        const itempId = Number(parent.dataset.productId);

        const qtyParent = qty.closest('.quantity')
        const loadingEl = qtyParent.querySelector('.loading__spinner')

        fetch('/cart.js').then(response => response.json())
        .then(cartData => {
            const cartItems = cartData.items;

            const alreadyInCart = cartItems.some(item => item.product_id === itempId);
            const cartSamePid = cartItems.filter(item => ((item.product_id === itempId) && (item.variant_id === itemId)));

            const qtyVal = Number(qty.value)

            if (alreadyInCart) {
                
                qtyParent.classList.add('loading')
                loadingEl.classList.remove('hidden')

                const updates = {};
                updates[itemId] = 0;
                if (cartSamePid[0]?.id && cartSamePid[0]?.id == itemId) {
                    updates[cartSamePid[0].id] = qtyVal;
                } else {
                    updates[itemId] = 1;
                }
                return this.updateCart(updates);
            }
        });
    }

    removeFromCart(itemId) {
        window.items = window.items.filter(item => item.id !== itemId);
        const updates = { [itemId]: 0 };
        this.updateCart(updates);
    }

    updateCart(updates) {
        fetch(window.Shopify.routes.root + 'cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
        }).then(() => {
            this.refreshDom();
        });
    }

    addItemToCart(formData) {

        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(response => {
            if (window._learnq != undefined) {
                var _learnq = window._learnq || [];
                _learnq.push(['track', 'Added to Cart', response]);
            }
            this.refreshDom();
        });
    }

    addAllItemsToCart() {
        const _this = this
        fetch('/cart.js').then(response => response.json())
            .then(cartData => {
                const items = [];
                _this.querySelectorAll('.upsell-item-100').forEach(item => {
                    const id = Number(item.dataset.id);
                    if (!cartData.items.some(cartItem => cartItem.id === id)) {
                        items.push({
                            'quantity': 1,
                            'id': id,
                            'properties': { '_Status': 'Addons' }
                        });
                    }
                });

                const formData = { items };
                fetch(window.Shopify.routes.root + 'cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }).then(() => {
                    window.location = '/checkout';
                });
            });
    }

    updateSelectedItem(sel) {
        const id = Number(sel.value);
        const parent = sel.closest('.upsell-item-100');
        const itempId = Number(parent.dataset.productId);
        const qty = parent.querySelector('.quantity__input')
        
        parent.setAttribute('data-id', id);
        parent.classList.toggle('active', id !== Number(parent.dataset.id));

        if (sel.options[sel.selectedIndex].dataset.image && parent.querySelector('.upsell-image img')) {
            parent.querySelector('.upsell-image img').src = sel.options[sel.selectedIndex].dataset.image;
        }

        fetch('/cart.js').then(response => response.json())
        .then(cartData => {
            const cartItems = cartData.items;

            const cartSamePid = cartItems.filter(item => ((item.product_id === itempId) && (item.variant_id === id)));

            if (cartSamePid.length > 0) {
                qty.value = cartSamePid[0].quantity
            }
        });
    }

    updateCustomSelected(option) {
        const id = Number(option.dataset.variantId);
        const parent = option.closest('.upsell-item-100');
        const itempId = Number(parent.dataset.productId);
        const qty = parent.querySelector('.quantity__input')
        
        parent.setAttribute('data-id', id);
        parent.classList.toggle('active', id !== Number(parent.dataset.id));

        if (option.dataset.image && parent.querySelector('.upsell-image img')) {
            parent.querySelector('.upsell-image img').src = option.dataset.image;
        }

        if (option.dataset.sellingPlan != undefined) {
            parent.setAttribute('data-selling-plan',)
        }

        fetch('/cart.js').then(response => response.json())
        .then(cartData => {
            const cartItems = cartData.items;

            const cartSamePid = cartItems.filter(item => ((item.product_id === itempId) && (item.variant_id === id)));

            if (cartSamePid.length > 0) {
                qty.value = cartSamePid[0].quantity

                if ( cartSamePid[0].quantity > 0 ) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
            } else {
                qty.value = qty.dataset.min
                parent.classList.remove('active');
            }
        });
    }

    refreshDom() {
        const _this = this

        var url = `${_this.dataset.url}?sections=${_this.dataset.sectionId}`

        if (document.querySelector('.shipping-msg-bar') != null) {
            url += `,${_this.dataset.sectionId + ',' + document.querySelector('.shipping-msg-bar').dataset.sectionId}`
        }

        fetch(url)
            .then(response => response.text())
            .then(responseText => {

                const parsedState = JSON.parse(responseText);
                const totalDestination = _this.querySelector('.summary-field');
                const installDestination = _this.querySelector('.installment-msg');
                const shipMsgDestination = document.querySelector('.shipping-msg-bar');
                const qtyDestination = document.querySelectorAll('.upsell-item-100 .quantity__input');

                const qtysFetch = () => {
                    const doc = new DOMParser().parseFromString(parsedState[_this.dataset.sectionId], 'text/html');
                    return doc.querySelectorAll('.upsell-item-100 .quantity__input'); // Returns a NodeList
                };

                // Call qtySource and store the result in a variable
                const qtySource = qtysFetch();

                const installSource = _this.getSectionInnerHTML(
                    parsedState[_this.dataset.sectionId],
                    '.installment-msg'
                );

                const totalSource = _this.getSectionInnerHTML(
                    parsedState[_this.dataset.sectionId],
                    '.summary-field'
                );

                var shipMsgSource = null

                if (shipMsgDestination) {
                    shipMsgSource = _this.getSectionInnerHTML(
                        parsedState[document.querySelector('.shipping-msg-bar').dataset.sectionId],
                        '.shipping-msg-bar'
                    );
                }


                if (totalSource && totalDestination) {
                    totalDestination.innerHTML = totalSource
                }

                if (installSource && installDestination) {
                    installDestination.innerHTML = installSource
                }

                if (shipMsgSource && shipMsgDestination) {
                    shipMsgDestination.innerHTML = shipMsgSource
                }

                
                fetch('/cart.js').then(response => response.json())
                .then(cartData => {
                    console.log(cartData)
                    const cartItems = cartData.items;
                    const parents = document.querySelectorAll('.upsell-item-100')

                        parents.forEach(p=> {
                            const red = p.querySelector('.discount-addon')
                            const redApplied = p.querySelector('.discount-applied')
                            const couponPrice = p.dataset.couponPrice
                            const origPrice = p.dataset.originalPrice

                            red?.setAttribute('hidden','')
                            redApplied?.setAttribute('hidden','')

                            if ( !cartItems.some(item => item.discounts.length > 0 && p.dataset.discountCode != undefined && item.discounts[0].title == p.dataset.discountCode) ) {
                                red?.removeAttribute('hidden')
                                redApplied?.setAttribute('hidden','')
                            }

                            if ( red != null && cartItems.some(item => item.product_title == p.dataset.title) && cartItems.some(item => item.discounts.length > 0 && p.dataset.discountCode != undefined && item.discounts[0].title == p.dataset.discountCode) ) {
                                red?.setAttribute('hidden','')
                                redApplied?.removeAttribute('hidden')
                            }

                            if (couponPrice != undefined &&  origPrice != undefined) {
                                if ( cartItems.some(item => item.discounts.length > 0 && p.dataset.discountCode != undefined && item.discounts[0].title == p.dataset.discountCode) ) {
                                    p.querySelector('.price').classList.remove('price--on-sale')
                                    p.querySelector('.price .price__regular .price-item--regular').textContent = origPrice
                                } else {
                                    p.querySelector('.price').classList.add('price--on-sale')
                                    p.querySelector('.price s.price-item--regular').textContent = origPrice
                                    p.querySelector('.price .price-item--sale').textContent = couponPrice
                                }
                            }

                        })
                });

                qtyDestination.forEach(qty => {
                    const id = qty.id
                    const qtyMatch = Array.from(qtySource).filter(q => q.id == id )
                    const parent = qty.closest('.upsell-item-100')
                    const select = parent.querySelector('.addon-product-select')
                    
                    const qtyParent = qty.closest('.quantity')
                    const loadingEl = qtyParent.querySelector('.loading__spinner')

                    if (qtyMatch.length > 0) {

                        if ( Number(qtyMatch[0].value) <= 1 && select != null) {

                            fetch('/cart.js').then(response => response.json())
                            .then(cartData => {
                                const cartItems = cartData.items;
                    
                                if (cartItems == undefined) return;
                                
                                const cartSameVid = cartItems.filter(item => (item.variant_id === id));
                    
                                if ( cartSameVid.length > 0) {
                                    qty.value = cartSameVid[0].quantity
                                }

                                qtyParent.classList.remove('loading')
                                loadingEl.classList.add('hidden')
                            });
                        }
                    } else {
                        qty.value = qtyMatch[0].value

                        qtyParent.classList.remove('loading')
                        loadingEl.classList.add('hidden')
                    }

                    qtyParent.classList.remove('loading')
                    loadingEl.classList.add('hidden')
                })

            });
    }

    getSectionInnerHTML(html, selector) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const element = doc.querySelector(selector);
        return element ? element.innerHTML : null; // Return innerHTML or null if not found
    }

    moneyFormatter(number) {
        return (number / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

customElements.define('upsell-addons', UpsellAddons);