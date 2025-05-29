var main = {
    preventDefaultForHashLinks: function() {
        // Get all anchor elements
        var anchorElements = document.querySelectorAll('a[href^="#"]');

        // Loop through the anchor elements
        anchorElements.forEach(function(anchor) {
            // Check if the href attribute contains #
            anchor.addEventListener('click', function(event) {
                event.preventDefault();

                // Get the target ID from the href
                var targetId = anchor.getAttribute('href').substring(1); // Remove the #

                // Check if an element with the target ID exists in the DOM
                var targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Define an offset (adjust this value as needed)
                    var offsetTop = 100; // Change this to your desired offset

                    // Scroll to the target element with the specified offset
                    window.scrollTo({
                        top: offset(targetElement).top - offsetTop,
                        behavior: 'smooth' // You can change this to 'auto' for an instant scroll
                    });
                }

                function offset(el) {
                    var rect = el.getBoundingClientRect(),
                    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
                }
            });
        });
    },
    autoPlayVideos: function() {
        document.querySelectorAll('video[autoplay][muted]').forEach(function(video) {
            video.play();
        });
    },
    sectionDivider: function() {
        const dividers = document.querySelectorAll('.divider-wrapper')

        const setDividerHeight = () => {
            dividers.forEach(e => {
            e.style.setProperty('--height', `${e.offsetHeight}px`);
            });
        };

        setDividerHeight();
        window.addEventListener('resize', setDividerHeight);
    },
    slideAdapt: function() {
        function slideAdapt(e) {
            let contentHeight = 0;
            let slideList = 0;
    
            if (typeof e.currentElement !== "undefined") {
                contentHeight = e.currentElement?.querySelector('.slider__slide > *').offsetHeight;
                slideList = e.currentElement.closest('.slider');
            } else {
                contentHeight = e.querySelector('.slider__slide > *').offsetHeight;
                slideList = e.closest('.slider');
            }
    
            if (slideList) {
                slideList.style.height = contentHeight + 'px';
            }
        }
    
        document.querySelectorAll('.slide-adaptable').forEach(e => {
            e.addEventListener('slideChanged', function(evt) {
                slideAdapt(evt.detail);
            });
    
            const contentHeight = e.querySelector('.slider__slide > *').offsetHeight;
            const slideList = e.querySelector('.slider');
    
            if (contentHeight && slideList) {
                slideList.style.height = contentHeight + 'px';
            }
        });
    
        // Remove height when resizing back to desktop
        function handleResize() {
            if (window.innerWidth >= 1024) { // Adjust breakpoint as needed
                document.querySelectorAll('.slider').forEach(slider => {
                    slider.style.removeProperty('height'); // Explicitly remove height
                });
            }
        }
    
        window.addEventListener('resize', handleResize);
    
        // Run once on load in case the page starts on desktop
        handleResize();
    },
    jsToggles: function() {
        var linkToggle = document.querySelectorAll('.js-toggle');

        for(i = 0; i < linkToggle.length; i++) {
        linkToggle[i].addEventListener('click', function(event) {
        
        event.preventDefault();
        
        var container = document.getElementById(this.dataset.container);
        
        if (!container.classList.contains('active')) {
            this.classList.add('is-open');
            container.classList.add('active');
            container.style.height = 'auto';
        
            var height = container.clientHeight + 'px';
        
            container.style.height = '0px';
        
            var parentContainer = container.closest('.sub-parent')
        
        
            setTimeout(function () {
            container.style.height = height;
                if (parentContainer != undefined && parentContainer.clientHeight > 0) {
                setTimeout( function() {
                    parentContainer.style.height = 'auto';
                    var parentHeight = parentContainer.clientHeight + 'px';
            
                    parentContainer.style.height = '0px';
        
                    parentContainer.style.height = parentHeight;
                }, 100)
                }
            }, 0);
            
        } else {
            this.classList.remove('is-open');
            
            container.style.height = '0px';
        
            if (container.classList.contains('no-trans')) {
            container.classList.remove('active');
            } else {
            container.addEventListener('transitionend', function () {
                container.classList.remove('active');
            }, {
                once: true
            });
            }
            
            setTimeout(function () {
            var parentContainer = container.closest('.sub-parent')
            var innerSub = container.closest('.inner-sub')
        
            if (innerSub != null) {
                parentContainer.style.height = innerSub.clientHeight + 'px';
            }
            }, 100);
        }
        
        });
        
        }
    },
    headerHeight: function() {
        if (document.querySelector('sticky-header') == null && document.querySelector('.header-wrapper') != null) {
            setHeaderHeight();

            window.matchMedia('(max-width: 990px)').addEventListener('change', setHeaderHeight.bind(this));
        }

        function setHeaderHeight() {
            document.documentElement.style.setProperty('--header-height', `${document.querySelector('.header-wrapper').offsetHeight}px`);
        }
    }
} 

main.preventDefaultForHashLinks();
main.autoPlayVideos();
main.sectionDivider();
main.slideAdapt();
main.jsToggles();
main.headerHeight();

class offersBlock extends HTMLElement {
    constructor() {
      super();
        this.swatchRows = this.querySelectorAll('.swatch-item-row')
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('.button-offer--submit')
        this.submitButtonText = this.submitButton.querySelector('.button--text')
        
        this.querySelectorAll('.offer-variants input[type="radio"]').forEach((offerBlock) => {
            offerBlock.addEventListener('change', () => {
                this.offerSwitch(offerBlock)
            })

            if (offerBlock.checked) {
                this.offerSwitch(offerBlock)
            }
        })

        this.submitButton?.addEventListener('click', () => {
            
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.classList.add('loading');
            this.submitButton.querySelector('.loading__spinner').classList.remove('hidden');

            if (this.dataset.clear != undefined) {
                fetch('/cart/clear.js', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    // Success
                    this.atc()
                })
                .catch(error => {
                    // Error
                    console.error('Fetch error:', error);
                });
            } else {
                this.atc()
            }
        })
    }

    offerSwitch(e) {
        const salePrice = e.dataset.price
        const comparePrice = e.dataset.comparePrice
        const quantity = e.dataset.qty
        const buttonText = e.dataset.buttonText
        const sectionTitle = e.dataset.dynamicHeading

        const priceEl = document.querySelector(`#price-${this.dataset.section}`)
        const badgeEl = priceEl?.querySelector(`.price__badge-sale`)

        if (salePrice && comparePrice != undefined) {
            priceEl.querySelector('.price').classList.add('price--on-sale')
            priceEl.querySelector('.price-item--last').textContent = salePrice
            priceEl.querySelector('s.price-item--regular').textContent = comparePrice

            badgeEl.textContent = e.dataset.badgeText
        } else {
            priceEl.querySelector('.price__regular .price-item--regular').textContent = salePrice
            priceEl.querySelector('.price').classList.remove('price--on-sale')
        }

        this.swatchRows.forEach((row) => {
            row.classList.remove('swatch-item-row--active')

            if (Number(row.dataset.row) <= Number(quantity)) {
                row.classList.add('swatch-item-row--active')
            }
        })

        if (buttonText != undefined) {
            this.submitButtonText.textContent = buttonText
        } else {
            this.submitButtonText.textContent = window.variantStrings.addToCart
        }

        if ( document.querySelector(`.product__title[data-section=${this.dataset.section}]`) != null ) {
            if ( sectionTitle != undefined) {
                document.querySelector(`.product__title[data-section=${this.dataset.section}]`).textContent = sectionTitle
            } else {
                document.querySelector(`.product__title[data-section=${this.dataset.section}]`).textContent = document.querySelector(`.product__title[data-section=${this.dataset.section}]`).dataset.defaultTitle
            }
        }
    }

    atc() {
        const activeSwatches = this.querySelectorAll('.swatch-item-row--active input[type="radio"]:checked')
        const activeBdl = this.querySelector('.offer-variants input[type="radio"]:checked')
        const jsonData = JSON.parse(activeBdl.dataset.variants)

        var items = [];


        activeSwatches.forEach((swatch) => {
            jsonData.forEach((variant) => {
                if (variant.option1 === swatch.value) {
                    const baseProperties = {
                        '_From': this.submitButton.dataset.from
                    };

                    let item = {
                        'id': Number(variant.id),
                        'quantity': 1,
                        'properties': baseProperties
                    };

                    // if ( this.submitButton.dataset.from != undefined) {
                    //     baseProperties['_addon']: this.submitButton.dataset.from
                    // }
                    items.push(item);
                }
            });
        })

        if ( activeBdl.dataset.freeGift != undefined) {
            const jsonGifts = JSON.parse(activeBdl.dataset.freeGift)
            const jsonGiftQty = JSON.parse(activeBdl.dataset.giftQty)

            jsonGifts.forEach((gift) => {
                let item = {
                    'id': Number(gift.id),
                    'quantity': Number(jsonGiftQty)
                };

                items.push(item);
            });
        }

        // Prepare formData with the selected items
        var formData = {
            'items': items
        };

        if (this.cart) {
            formData.sections = this.cart.getSectionsToRender().map((section) => section.id);
            formData.sections_url = window.location.pathname;
            this.cart.setActiveElement(document.activeElement);
            this.cart.classList.remove('is-empty')
        }

        // Perform the fetch request
        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(response => {
          if (response.status) {
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButtonText.classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            if ( this.dataset.redirect != undefined ) {
                window.location = this.dataset.redirect;
                return;
            } else {
                window.location = window.routes.cart_url;
                return;
            }
          }

          if (!this.error)
            // publish(PUB_SUB_EVENTS.cartUpdate, {
            //   source: 'product-form',
            //   productVariantId: formData.get('id'),
            //   cartData: response,
            // });
          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener(
              'modalClosed',
              () => {
                setTimeout(() => {
                  this.cart.renderContents(response);
                });
              },
              { once: true }
            );
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');

          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.querySelector('.loading__spinner').classList.add('hidden');
        });
    }
}
// Register the custom element
customElements.define('offers-block', offersBlock);

class VideoMedia extends HTMLElement {
    constructor() {
      super();
      this.init();
    }
  
    init() {
      if (this.getAttribute('loaded')) return;

      new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        
        this.loadContent();
        observer.disconnect();
      }, { threshold: 0.1, once: true }).observe(this);
    }
  
    loadContent() {
      this.setAttribute('loaded', true);
      this.querySelector('img')?.remove();
  
      // Extract content from <noscript> and parse it
      const templateString = this.querySelector('noscript')?.textContent.trim();
      if (!templateString) return;
  
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateString, 'text/html');
      const video = doc.querySelector('video');
  
      if (video) {
        this.appendChild(video);
        video.play().catch(err => console.warn("Autoplay failed:", err));
      }
    }
}
  
customElements.define('video-media', VideoMedia);