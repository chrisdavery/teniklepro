
if (!customElements.get('offer-select')) {
    class OfferSelect extends HTMLElement {
      constructor() {
        super();
        this.button = this.querySelector('.custom-select__btn');
        this.listbox = this.querySelector('.custom-select__listbox');
        this.selectedOption = this.querySelector('[aria-selected="true"]');
  
        // Set the selected option.
        if (!this.selectedOption) {
          this.selectedOption = this.listbox.firstElementChild;
        }
  
        this.setButtonWidth();
        window.initLazyScript(this, this.init.bind(this));
      }
  
      init() {
        this.options = this.querySelectorAll('.custom-select__option')
        this.swatches = 'swatch' in this.options[0].dataset;
        this.focusedClass = 'is-focused';
        this.searchString = '';
        this.listboxOpen = false;
        this.selectedOption = this.querySelector('[aria-selected="true"]');
  
        // Set the selected option.
        if (!this.selectedOption) {
          this.selectedOption = this.listbox.firstElementChild;
        }
  
        this.addEventListener('keydown', this.handleKeydown.bind(this));
        this.button.addEventListener('mousedown', this.handleMousedown.bind(this));
      }
  
      /**
       * Returns the next visible sibling element
       * @param {Element} elem - The element to search
       * @returns {Element}
       */
      static getNextVisibleSibling(elem) {
        let sibling = elem.nextElementSibling;
        while (sibling) {
          if (sibling.style.display !== 'none') return sibling;
          sibling = sibling.nextElementSibling;
        }
        return null;
      }
  
      /**
       * Returns the previous visible sibling element
       * @param {Element} elem - The element to search
       * @returns {Element}
       */
      static getPreviousVisibleSibling(elem) {
        let sibling = elem.previousElementSibling;
        while (sibling) {
          if (sibling.style.display !== 'none') return sibling;
          sibling = sibling.previousElementSibling;
        }
        return null;
      }
  
      /**
       * Adds event listeners when the options list is open.
       */
      addListboxOpenListeners() {
        this.mouseoverHandler = this.handleMouseover.bind(this);
        this.mouseleaveHandler = this.handleMouseleave.bind(this);
        this.clickHandler = this.handleClick.bind(this);
        this.blurHandler = this.handleBlur.bind(this);
  
        this.listbox.addEventListener('mouseover', this.mouseoverHandler);
        this.listbox.addEventListener('mouseleave', this.mouseleaveHandler);
        this.listbox.addEventListener('click', this.clickHandler);
        this.listbox.addEventListener('blur', this.blurHandler);
      }
  
      /**
       * Removes event listeners added when the options list was open.
       */
      removeListboxOpenListeners() {
        this.listbox.removeEventListener('mouseover', this.mouseoverHandler);
        this.listbox.removeEventListener('mouseleave', this.mouseleaveHandler);
        this.listbox.removeEventListener('click', this.clickHandler);
        this.listbox.removeEventListener('blur', this.blurHandler);
      }
  
      /**
       * Handles 'keydown' events on the custom select element.
       * @param {object} evt - Event object.
       */
      handleKeydown(evt) {
        if (this.listboxOpen) {
          this.handleKeyboardNav(evt);
        } else if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === ' ') {
          evt.preventDefault();
          this.showListbox();
        }
      }
  
      /**
       * Handles 'mousedown' events on the button element.
       * @param {object} evt - Event object.
       */
      handleMousedown(evt) {
        if (!this.listboxOpen && evt.button === 0) {
          this.showListbox();
        }
      }
  
      /**
       * Handles 'mouseover' events on the options list.
       * @param {object} evt - Event object.
       */
      handleMouseover(evt) {
        if (evt.target.matches('li')) {
          this.focusOption(evt.target);
        }
      }
  
      /**
       * Handles 'mouseleave' events on the options list.
       */
      handleMouseleave() {
        this.focusOption(this.selectedOption);
      }
  
      /**
       * Handles 'click' events on the custom select element.
       * @param {object} evt - Event object.
       */
      handleClick(evt) {
        this.selectOption(evt.target);
      }
  
      /**
       * Handles 'blur' events on the options list.
       */
      handleBlur() {
        if (this.listboxOpen) {
          this.hideListbox();
        }
      }
  
      /**
       * Handles 'keydown' events on the options list.
       * @param {object} evt - Event object.
       */
      handleKeyboardNav(evt) {
        let optionToFocus;
  
        // Disable tabbing if options list is open (as per native select element).
        if (evt.key === 'Tab') {
          evt.preventDefault();
        }
  
        switch (evt.key) {
          // Focus an option.
          case 'ArrowUp':
          case 'ArrowDown':
            evt.preventDefault();
  
            if (evt.key === 'ArrowUp') {
              optionToFocus = OfferSelect.getPreviousVisibleSibling(this.focusedOption);
            } else {
              optionToFocus = OfferSelect.getNextVisibleSibling(this.focusedOption);
            }
  
            if (optionToFocus && !optionToFocus.classList.contains('is-disabled')) {
              this.focusOption(optionToFocus);
            }
            break;
  
          // Select an option.
          case 'Enter':
          case ' ':
            evt.preventDefault();
            this.selectOption(this.focusedOption);
            break;
  
          // Cancel and close the options list.
          case 'Escape':
            evt.preventDefault();
            this.hideListbox();
            break;
  
          // Search for an option and focus the first match (if one exists).
          default:
            optionToFocus = this.findOption(evt.key);
  
            if (optionToFocus) {
              this.focusOption(optionToFocus);
            }
            break;
        }
      }
  
      /**
       * Sets the button width to the same as the longest option, to prevent
       * the button width from changing depending on the option selected.
       */
      setButtonWidth() {
        // Get the width of an element without side padding.
        const getUnpaddedWidth = (el) => {
          const elStyle = getComputedStyle(el);
          return parseFloat(elStyle.paddingLeft) + parseFloat(elStyle.paddingRight);
        };
  
        const buttonPadding = getUnpaddedWidth(this.button);
        const optionPadding = getUnpaddedWidth(this.selectedOption);
        const buttonBorder = this.button.offsetWidth - this.button.clientWidth;
        const optionWidth = Math.ceil(this.selectedOption.getBoundingClientRect().width);
  
        this.button.style.width = `${optionWidth - optionPadding + buttonPadding + buttonBorder}px`;
      }
  
      /**
       * Shows the options list.
       */
      showListbox() {
        this.listbox.hidden = false;
        this.listboxOpen = true;
  
        this.classList.add('is-open');
        this.button.setAttribute('aria-expanded', 'true');
        this.listbox.setAttribute('aria-hidden', 'false');
  
        // Slight delay required to prevent blur event being fired immediately.
        setTimeout(() => {
          this.focusOption(this.selectedOption);
          this.listbox.focus();
  
          this.addListboxOpenListeners();
        });
      }
  
      /**
       * Hides the options list.
       */
      hideListbox() {
        if (!this.listboxOpen) return;
  
        this.listbox.hidden = true;
        this.listboxOpen = false;
  
        this.classList.remove('is-open');
        this.button.setAttribute('aria-expanded', 'false');
        this.listbox.setAttribute('aria-hidden', 'true');
  
        if (this.focusedOption) {
          this.focusedOption.classList.remove(this.focusedClass);
          this.focusedOption = null;
        }
  
        this.button.focus();
        this.removeListboxOpenListeners();
      }
  
      /**
       * Finds a matching option from a typed string.
       * @param {string} key - Key pressed.
       * @returns {?Element}
       */
      findOption(key) {
        this.searchString += key;
  
        // If there's a timer already running, clear it.
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
  
        // Wait 500ms to see if another key is pressed, if not then clear the search string.
        this.searchTimer = setTimeout(() => {
          this.searchString = '';
        }, 500);
  
        // Find an option that contains the search string (if there is one).
        const matchingOption = Array.from(this.options).find((option) => {
          const label = option.innerText.toLowerCase();
          return label.includes(this.searchString) && !option.classList.contains('is-disabled');
        });
  
        return matchingOption;
      }
  
      /**
       * Focuses an option.
       * @param {Element} option - <li> element of the option to focus.
       */
      focusOption(option) {
        // Remove focus on currently focused option (if there is one).
        if (this.focusedOption) {
          this.focusedOption.classList.remove(this.focusedClass);
        }
  
        // Set focus on the option.
        this.focusedOption = option;
        this.focusedOption.classList.add(this.focusedClass);
  
        // If option is out of view, scroll the list.
        if (this.listbox.scrollHeight > this.listbox.clientHeight) {
          const scrollBottom = this.listbox.clientHeight + this.listbox.scrollTop;
          const optionBottom = option.offsetTop + option.offsetHeight;
  
          if (optionBottom > scrollBottom) {
            this.listbox.scrollTop = optionBottom - this.listbox.clientHeight;
          } else if (option.offsetTop < this.listbox.scrollTop) {
            this.listbox.scrollTop = option.offsetTop;
          }
        }
      }
  
      /**
       * Selects an option.
       * @param {Element} option - Option <li> element.
       */
      selectOption(option) {
        if (option !== this.selectedOption) {
          // Switch aria-selected attribute to selected option.
          option.setAttribute('aria-selected', 'true');
          this.selectedOption.setAttribute('aria-selected', 'false');
  
          // Update swatch colour in the button.
          if (this.swatches) {
            this.button.dataset.swatch = option.dataset.swatch;
            this.button.querySelector('.swatch').style.setProperty('--swatch--background', option.dataset.swatch);
          }
  
          // Update the button text and set the option as active.
          this.button.querySelector('.text-start').textContent = option.querySelector('.text--select-option').textContent;
          this.listbox.setAttribute('aria-activedescendant', option.id);
          this.selectedOption = document.getElementById(option.id);

          const activeOffer = this.closest('offers-dropdown').querySelector('input[type="radio"]:checked')
          const jsonData = JSON.parse(activeOffer.dataset.variants)

          const variant = jsonData.find((v) =>
            v.options.every((val, index) => val === option.dataset.value)
          );

          this.button.setAttribute('data-variant-id', variant.id)
          // Dispatch a 'change' event on the custom select element.
          const detail = { selectedValue: option.dataset.value };
          this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail }));
        }
  
        this.hideListbox();
      }
    }
  
    customElements.define('offer-select', OfferSelect);
}

/**
 * Adds an observer to initialise a script when an element is scrolled into view.
 * @param {Element} element - Element to observe.
 * @param {Function} callback - Function to call when element is scrolled into view.
 * @param {number} [threshold=500] - Distance from viewport (in pixels) to trigger init.
 */
function initLazyScript(element, callback, threshold = 500) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (typeof callback === 'function') {
              callback();
              observer.unobserve(entry.target);
            }
          }
        });
      }, { rootMargin: `0px 0px ${threshold}px 0px` });
  
      io.observe(element);
    } else {
      callback();
    }
}


class offersDropdown extends HTMLElement {
  constructor() {
    super();
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      this.addToCartButton = this.querySelector('.product-form__submit')
      this.querySelectorAll('.offer-item input[type="radio"]').forEach((offerBlock) => {
          offerBlock.addEventListener('change', () => {
              this.offerSwitch(offerBlock)
          })

          if (offerBlock.checked) {
              this.offerSwitch(offerBlock)
          }
      })

      if (this.querySelector('.offer-item input[type="radio"]:checked') != null) {
        this.offerSwitch(this.querySelector('.offer-item input[type="radio"]:checked'))
      }

      this.addToCartButton.addEventListener('click', () => {
        this.addToCart()
      })
  }

  offerSwitch(e) {
    this.querySelectorAll('.offer-detail').forEach(detail => {
      detail.removeAttribute('open')
    })

    this.addToCartButton.querySelector('span.button--text').textContent = `${window.variantStrings.addToCart} - ${e.dataset.price}`
  }

  addToCart() {

    const activeBundle = this.querySelector('.offer-item input[type="radio"]:checked + label')
    const activeRadio = this.querySelector('.offer-item input[type="radio"]:checked')

    let formData = {
      items: []
    };

    if(activeBundle) {
      this.addToCartButton.classList.add('loading'); 
      this.addToCartButton.querySelector('.loading__spinner').classList.remove('hidden');

      const activeColors = activeBundle.querySelectorAll('offer-select')

      activeColors.forEach(select=> {
        formData.items.push({
          id: Number(select.querySelector('.custom-select__btn').getAttribute('data-variant-id')),
          quantity: Number(this.querySelector('.offer-item input[type="radio"]').dataset.qty),
          properties: {
            _tier: activeColors.length,
            _offer: activeRadio.value,
            ...(activeRadio.dataset.freeGift !== undefined
              ? {
                  _addon: JSON.parse(activeRadio.dataset.freeGift)[0].id,
                  _addon_qty: Number(JSON.parse(activeRadio.dataset.giftQty))
                }
              : {})
          },
        });
      })

      if ( activeRadio.dataset.freeGift != undefined) {
            const jsonGifts = JSON.parse(activeRadio.dataset.freeGift)
            const jsonGiftQty = JSON.parse(activeRadio.dataset.giftQty)

            jsonGifts.forEach((gift) => {
                let item = {
                    'id': Number(gift.id),
                    'quantity': Number(jsonGiftQty),
                    'properties': {
                        '_tier': activeColors.length,
                        '_offer': activeRadio.value,
                        '_freegift': true
                    }, 
                };

                formData.items.push(item);
            });
        }

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
        publish(PUB_SUB_EVENTS.cartUpdate, {
          form: null,
          source: 'product-form',
          productVariantId: response.items[0].variant_id,
          cartData: response,
          cart: this.cart
        });

        if (!this.cart) {
          window.location = window.routes.cart_url;
          return;
        } else {
          if ( this.dataset.redirect != undefined ) {
            window.location = this.dataset.redirect;
            return;
          } else {
            this.cart.renderContents(response);
          }
        }
      }).finally(() => {
        // if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty');

        this.addToCartButton.classList.remove('loading'); 
        this.addToCartButton.querySelector('.loading__spinner').classList.add('hidden');
      });
    }
  }
}
// Register the custom element
customElements.define('offers-dropdown', offersDropdown);