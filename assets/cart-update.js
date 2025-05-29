
subscribe('cart-update', (eventData) => {
    if (eventData.source == 'cart-items') {
        eventCartChange(eventData)
    }
});

function eventCartChange(eventData) {
    const addonIds = [];
    const cartItems = eventData.cartData.items
    const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

    const cartRemoved = eventData.cartData.items_removed[0]

    if ( cartRemoved ) {
        cartItems.forEach(item => {
            const properties = item.properties;

            Object.keys(properties).forEach(key => {
                if (key.includes('_freegift') && properties[key] == cartRemoved.variant_id ) {
                    const parentExists = cartItems.filter(e=> e.id == properties[key])

                    if (parentExists.length > 0) {
                        addonIds.push({ [item.variant_id]: parentExists[0].quantity });
                    } else {
                        addonIds.push({ [item.variant_id]: 0 });
                    }
                }
            });
        });
    } else {
        cartItems.forEach(item => {
            const properties = item.properties;
            Object.keys(properties).forEach(key => {
                if (key.includes('_offer')) {
                    addonIds.push({ [properties[key]]: item.quantity });
                }
            });
        });
    }

    if (addonIds.length == 0) return;

    var formData = new FormData();
    
    addonIds.forEach(addon => {
        Object.entries(addon).forEach(([id, quantity]) => {
            console.log(`updates[${id}] ${quantity}`);
            formData.append(`updates[${id}]`, quantity);
        });
    });

    if (cart) {
        formData.append(
            'sections',
            cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
    }

    fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then((response) => {
        cart.renderContents(response);

        if (response.items.length == 0) {
            if (cart) cart.classList.add('is-empty');
        }
    }).finally(() => {

    });
}