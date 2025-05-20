/**
 * Portfolio Website - Main JavaScript File
 * Contains all functionality for:
 * - Main portfolio page
 * - Project pages with carousels
 * - Form handling
 * - Smooth scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // Shared Functionality
    // ======================
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without page jump
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    } else {
                        location.hash = targetId;
                    }
                }
            });
        });
    }

    // Contact form handling
    function handleContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('#name').value.trim(),
                email: this.querySelector('#email').value.trim(),
                message: this.querySelector('#message').value.trim()
            };

            // Simple validation
            if (!formData.name || !formData.email || !formData.message) {
                showFlashMessage('Please fill in all fields', 'error');
                return;
            }

            // In a real implementation, you would send this to a server
            // For GitHub Pages, you could use Formspree or similar service
            console.log('Form submission:', formData);
            
            // Show success message
            showFlashMessage('Thank you for your message! I will get back to you soon.', 'success');
            this.reset();
            
            // For actual form submission (uncomment and replace with your endpoint):
            /*
            try {
                const response = await fetch('https://formspree.io/f/your-form-id', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    showFlashMessage('Thank you for your message! I will get back to you soon.', 'success');
                    this.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showFlashMessage('There was an error sending your message. Please try again.', 'error');
            }
            */
        });
    }

    // Flash message notification
    function showFlashMessage(message, type = 'success') {
        let flashContainer = document.querySelector('.flash-messages');
        
        if (!flashContainer) {
            flashContainer = document.createElement('div');
            flashContainer.className = 'flash-messages';
            
            // Insert after the first h2 or at top of body
            const firstHeading = document.querySelector('h2');
            if (firstHeading) {
                firstHeading.insertAdjacentElement('afterend', flashContainer);
            } else {
                document.body.insertAdjacentElement('afterbegin', flashContainer);
            }
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `flash-message ${type}`;
        messageDiv.textContent = message;
        
        // Add to container and animate in
        flashContainer.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.classList.add('visible');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            messageDiv.classList.remove('visible');
            setTimeout(() => {
                messageDiv.remove();
                if (flashContainer.children.length === 0) {
                    flashContainer.remove();
                }
            }, 300);
        }, 5000);
    }

    // ======================
    // Project Page Specific
    // ======================
    
    // Initialize project carousels
    async function initProjectCarousels() {
        const carousels = document.querySelectorAll('[data-project-carousel]');
        if (!carousels.length) return;

        for (const carousel of carousels) {
            const projectName = carousel.getAttribute('data-project-carousel');
            const container = carousel.querySelector('.carousel-container');
            const dotsContainer = carousel.querySelector('.dots');
            const prevBtn = carousel.querySelector('.prev');
            const nextBtn = carousel.querySelector('.next');
            
            try {
                // Try to load image data
                const response = await fetch(`../projects/${projectName}/info.json`);
                if (!response.ok) throw new Error('Project info not found');
                
                const projectData = await response.json();
                const imageCount = projectData.images || 3; // Default to 3 if not specified
                
                // Create carousel items
                const { slides, dots } = createCarouselItems(container, dotsContainer, projectName, imageCount);
                
                // Initialize carousel controls
                setupCarouselControls(container, slides, dots, prevBtn, nextBtn);
                
            } catch (error) {
                console.error(`Error loading carousel for ${projectName}:`, error);
                container.innerHTML = '<p class="carousel-error">Could not load project images</p>';
            }
        }
    }

    // Create carousel slides and dots
    function createCarouselItems(container, dotsContainer, projectName, imageCount) {
        container.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        const slides = [];
        const dots = [];
        
        // Supported image extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        for (let i = 1; i <= imageCount; i++) {
            // Create slide element
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            // Try multiple naming patterns
            const img = document.createElement('img');
            img.alt = `${projectName} screenshot ${i}`;
            img.loading = 'lazy';
            
            // Set src to first found image
            let imgSrc = '';
            for (const ext of extensions) {
                const potentialPaths = [
                    `../projects/${projectName}/Screenshot_${i}.${ext}`,
                    `../projects/${projectName}/screenshot${i}.${ext}`,
                    `../projects/${projectName}/image${i}.${ext}`,
                    `../projects/${projectName}/${i}.${ext}`
                ];
                
                // Check if image exists (this would need server-side verification in a real app)
                // For static site, we'll just use the first pattern
                imgSrc = potentialPaths[0];
                break;
            }
            
            img.src = imgSrc;
            slide.appendChild(img);
            container.appendChild(slide);
            slides.push(slide);
            
            // Create navigation dot
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.index = i - 1;
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }
        
        return { slides, dots };
    }

    // Set up carousel navigation controls
    function setupCarouselControls(container, slides, dots, prevBtn, nextBtn) {
        let currentIndex = 0;
        let autoAdvanceInterval;
        
        function updateCarousel() {
            // Update slide position
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update active dot
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
        
        // Button event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Dot navigation
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
        
        // Auto-advance
        function startAutoAdvance() {
            autoAdvanceInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoAdvance() {
            clearInterval(autoAdvanceInterval);
        }
        
        startAutoAdvance();
        
        // Pause on hover
        container.parentElement.addEventListener('mouseenter', stopAutoAdvance);
        container.parentElement.addEventListener('mouseleave', startAutoAdvance);
        
        // Touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        container.parentElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoAdvance();
        }, { passive: true });
        
        container.parentElement.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoAdvance();
        }, { passive: true });
        
        function handleSwipe() {
            const threshold = 50; // Minimum swipe distance
            const diff = touchStartX - touchEndX;
            
            if (diff > threshold) {
                nextSlide(); // Swipe left
            } else if (diff < -threshold) {
                prevSlide(); // Swipe right
            }
        }
        
        // Initialize
        updateCarousel();
    }

    // Back button animation
    function setupBackButton() {
        const backButton = document.querySelector('.back-button');
        if (!backButton) return;
        
        backButton.addEventListener('mouseenter', () => {
            backButton.style.transform = 'translateX(-5px)';
        });
        
        backButton.addEventListener('mouseleave', () => {
            backButton.style.transform = 'translateX(0)';
        });
        
        backButton.addEventListener('click', (e) => {
            // Add slight delay for animation
            setTimeout(() => {
                window.location.href = backButton.href;
            }, 200);
        });
    }

    // ======================
    // Initialization
    // ======================
    
    // Initialize all components
    initSmoothScrolling();
    handleContactForm();
    setupBackButton();
    
    // Check if we're on a project page
    if (document.querySelector('[data-project-carousel]')) {
        initProjectCarousels();
    }
    
    // Add CSS class for touch devices
    function detectTouch() {
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            document.documentElement.classList.add('touch-device');
        } else {
            document.documentElement.classList.add('no-touch-device');
        }
    }
    
    detectTouch();
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
