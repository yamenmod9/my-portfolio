/**
 * Portfolio Website - Main JavaScript File
 * Contains all functionality for:
 * - Main portfolio page
 * - Project pages with carousels
 * - Form handling
 * - Smooth scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize project carousels with exact image paths
    function initProjectCarousels() {
        const carousels = document.querySelectorAll('[data-project-carousel]');
        if (!carousels.length) return;

        carousels.forEach(carousel => {
            const projectName = carousel.getAttribute('data-project-carousel');
            const container = carousel.querySelector('.carousel-container');
            const dotsContainer = carousel.querySelector('.dots');
            
            // Get the exact image filenames for each project
            const projectImages = getProjectImages(projectName);
            
            if (projectImages.length > 0) {
                createCarouselItems(container, dotsContainer, projectName, projectImages);
                setupCarouselControls(carousel);
            } else {
                container.innerHTML = '<p class="error">No images found for this project</p>';
            }
        });
    }

    // Returns the exact image paths for each project
    function getProjectImages(projectName) {
        // This should match your actual image filenames
        const projectImageMap = {
            'coding_games': [
                'Screenshot 1.png',
                'Screenshot 2.png'
            ],
            'ecommerce': [
                '1.png',
                '2.png',
                '3.png',
                '4.png',
                '5.png',
                '6.png',
                '7.png',
                '8.png',
                '9.png',
                '10.png',
                '11.png'
            ],
            'transcription': [
                '1.png',
                '2.png',
                '3.png',
                '4.png'
            ],
            'finance': [
                '1.png',
                '2.png',
                '3.png',
                '4.png'
            ]
        };

        return projectImageMap[projectName] || [];
    }

    // Create carousel items with exact paths
    function createCarouselItems(container, dotsContainer, projectName, imageFiles) {
        container.innerHTML = '';
        dotsContainer.innerHTML = '';

        imageFiles.forEach((imageFile, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            const img = document.createElement('img');
            img.src = `../projects/${projectName}/${imageFile}`;
            img.alt = `${projectName} screenshot ${index + 1}`;
            img.loading = 'lazy';
            
            slide.appendChild(img);
            container.appendChild(slide);

            // Create dot
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });
    }

    // Carousel controls setup
    function setupCarouselControls(carousel) {
        const container = carousel.querySelector('.carousel-container');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.dot');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        
        let currentIndex = 0;
        let interval;

        function updateCarousel() {
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            updateCarousel();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        // Event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
            });
        });

        // Auto-advance
        function startAutoAdvance() {
            interval = setInterval(nextSlide, 5000);
        }

        function stopAutoAdvance() {
            clearInterval(interval);
        }

        startAutoAdvance();

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoAdvance);
        carousel.addEventListener('mouseleave', startAutoAdvance);

        // Initialize
        updateCarousel();
    }

    // Initialize the carousels
    initProjectCarousels();

    // Rest of your existing code (smooth scrolling, form handling etc.)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            console.log('Form submitted:', { name, email, message });
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }
});

// ======================
// Utility Functions
// ======================

/**
 * Debounce function to limit how often a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

/**
 * Throttle function to limit how often a function can fire
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 100) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
