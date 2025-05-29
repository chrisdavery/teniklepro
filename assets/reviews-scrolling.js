document.querySelectorAll('.review-scrollings').forEach((scrollingElement) => {
  let isDragging = false;
  let startX;
  let scrollLeft;
  let dragSpeed = 1.2; // Adjust this for speed sensitivity
  let scrollInterval;
  const autoScrollSpeed = Number(scrollingElement.dataset.speed); // Adjust this for marquee speed

  // Autoplay function
  const startAutoScroll = () => {
    stopAutoScroll(); // Prevent multiple intervals
    scrollInterval = setInterval(() => {
      scrollingElement.scrollLeft += autoScrollSpeed;
      // Reset scroll to the start if it reaches the end
      if (scrollingElement.scrollLeft >= scrollingElement.scrollWidth - scrollingElement.clientWidth) {
        scrollingElement.scrollLeft = 0;
      }
    }, 16); // Approximately 60fps
  };

  const stopAutoScroll = () => {
    clearInterval(scrollInterval);
  };

  // Mouse and touch events for dragging
  scrollingElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    stopAutoScroll();
    startX = e.pageX - scrollingElement.offsetLeft;
    scrollLeft = scrollingElement.scrollLeft;
    scrollingElement.style.cursor = 'grabbing';
  });

  scrollingElement.addEventListener('mouseleave', () => {
    isDragging = false;
    scrollingElement.style.cursor = 'default';
    startAutoScroll();
  });

  scrollingElement.addEventListener('mouseup', () => {
    isDragging = false;
    scrollingElement.style.cursor = 'default';
    startAutoScroll();
  });

  scrollingElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollingElement.offsetLeft;
    const walk = (x - startX) * dragSpeed;
    scrollingElement.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  scrollingElement.addEventListener('touchstart', (e) => {
    isDragging = true;
    stopAutoScroll();
    startX = e.touches[0].pageX - scrollingElement.offsetLeft;
    scrollLeft = scrollingElement.scrollLeft;
  });

  scrollingElement.addEventListener('touchend', () => {
    isDragging = false;
    startAutoScroll();
  });

  scrollingElement.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollingElement.offsetLeft;
    const walk = (x - startX) * dragSpeed;
    scrollingElement.scrollLeft = scrollLeft - walk;
  });

  // Start autoplay on page load
  startAutoScroll();
});
