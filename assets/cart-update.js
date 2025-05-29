
subscribe('cart-update', (eventData) => {
    if (eventData.source == 'cart-items') {
        eventCartChange(eventData)
    }
});

function eventCartChange(eventData) {
    const parser = new DOMParser();
    const cartDrawerString = eventData.cartData.sections['cart-drawer'];
    const doc = parser.parseFromString(cartDrawerString, 'text/html');
    const cartTotalElement = doc.getElementById('cart-json');
    var cartData = JSON.parse(cartTotalElement.textContent);

    const cartItems = cartData.items
    const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    const cartRemoved = eventData.cartData.items_removed[0]

    const cartItemsParent = cartItems
    .filter(item => item.properties && Object.keys(item.properties).some(key => key.includes('_addon')))
    // .flatMap(item =>
    //     Object.keys(item.properties)
    //     .filter(key => key.includes('_addon'))
    //     .map(key => ({ [item.properties[key]]: item.quantity }))
    // );
    var hasCallback = false
    var formData = new FormData();

    if (cartItemsParent.length > 0) {

        if (cartItemsParent.length > 0) {
            const totalQuantity = cartItemsParent.reduce((sum, item) => sum + item.quantity, 0);
            if (totalQuantity < cartItemsParent[0]?.properties['_tier']) {
                cartItemsParent.forEach(addon => {
                    formData.append(`updates[${addon.properties['_addon']}]`, 0);
                });
            } else if ( totalQuantity >= cartItemsParent[0]?.properties['_tier']) {
                const productExists = cartItems.filter(e => e.id == cartItemsParent[0].properties['_addon'])

                if (productExists.length > 0) {
                    cartItemsParent.forEach(addon => {
                        formData.append(`updates[${addon.properties['_addon']}]`, addon.properties['_addon_qty']);
                    });
                }
            }
        }

        hasCallback = true
    } 

    const giftExists = cartItems.filter(item => item.properties && Object.keys(item.properties).some(key => key.includes('_freegift')))
    if (cartRemoved && giftExists.length > 0) {
        giftExists.forEach(e=> {
            formData.append(`updates[${e.id}]`,0);
        })
        hasCallback = true
    }


    let hasUpdates = false;
    for (let key of formData.keys()) {
        if (key.startsWith('updates[')) {
            hasUpdates = true;
            break;
        }
    }

    if (hasCallback == true && hasUpdates) {
        console.log('cart callback')
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
}