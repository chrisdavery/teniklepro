console.log( Number(document.querySelector('[data-random]').dataset.maxStock))
console.log( Number(document.querySelector('[data-random]').dataset.minStock))

// Function to generate a random odd number under 100
function getRandomOddNumber() {
    let maxStock = Number(document.querySelector('[data-random]').dataset.maxStock);
    
    // Ensure it starts at 393, which is already an odd number
    return maxStock;
}

let dealsRemaining = getRandomOddNumber();
document.querySelector('[data-random]').textContent = `${dealsRemaining}`;

function decreaseDeals() {
    // Random interval between 1 to 5 seconds
    let interval = Math.floor(Math.random() * 5000) + 1000;

    setTimeout(() => {
        if (dealsRemaining > Number(document.querySelector('[data-random]').dataset.minStock)) { // Fixed syntax error here
            dealsRemaining -= Math.floor(Math.random() * 5) + 1;
            document.querySelector('[data-random]').textContent = `${dealsRemaining}`;

            // Call the function again to continue the countdown
            decreaseDeals();
        }
    }, interval);
}

// Initialize the countdown on page load
window.onload = () => {
    if (document.querySelector('[data-random]') == null) return;

    // Set the initial random odd number
    document.querySelector('[data-random]').textContent = `${dealsRemaining}`;
    decreaseDeals();
};