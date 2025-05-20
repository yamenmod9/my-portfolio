document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simple form handling
            console.log('Form submitted:', { name, email, message });
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }

    // Initialize carousels on project pages
    initCarousels();
});

function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
        const container = carousel.querySelector('.carousel-container');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const dots = carousel.querySelectorAll('.dot');
        
        let currentIndex = 0;
        const slideCount = slides.length;
        
        function updateCarousel() {
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateCarousel();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // Auto-advance every 5 seconds
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        }, 5000);
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            clearInterval(interval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateCarousel();
            }, 5000);
        });
        
        // Initialize
        updateCarousel();
    });
}

// Load project info from JSON files
function loadProjectInfo() {
    const projectInfoElements = document.querySelectorAll('[data-project-info]');
    
    projectInfoElements.forEach(element => {
        const projectName = element.getAttribute('data-project-info');
        fetch(`projects/${projectName}/info.json`)
            .then(response => {
                if (!response.ok) throw new Error('Info not found');
                return response.json();
            })
            .then(data => {
                element.innerHTML = `
                    <h2>${data.title || 'Project Details'}</h2>
                    ${data.description ? `<p>${data.description}</p>` : ''}
                    ${data.technologies ? `<p><strong>Technologies:</strong> ${data.technologies}</p>` : ''}
                    ${data.date ? `<p><strong>Date:</strong> ${data.date}</p>` : ''}
                `;
            })
            .catch(error => {
                console.error('Error loading project info:', error);
                element.innerHTML = '<p>Project details could not be loaded.</p>';
            });
    });
}

// Load project images for carousel
function loadProjectImages() {
    const carousels = document.querySelectorAll('[data-project-carousel]');
    
    carousels.forEach(carousel => {
        const projectName = carousel.getAttribute('data-project-carousel');
        const container = carousel.querySelector('.carousel-container');
        const dotsContainer = carousel.querySelector('.dots');
        
        // This would need to be replaced with actual image loading logic
        // For GitHub Pages, you would need to know the exact image names
        const imageCount = 3; // Default number of images
        
        // Clear existing content
        container.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        // Create slides and dots
        for (let i = 1; i <= imageCount; i++) {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="projects/${projectName}/Screenshot_${i}.jpg" alt="Project Screenshot ${i}">`;
            container.appendChild(slide);
            
            // Create dot
            const dot = document.createElement('span');
            dot.className = `dot ${i === 1 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                const carouselInstance = dot.closest('.carousel');
                const slides = carouselInstance.querySelectorAll('.carousel-slide');
                const index = Array.from(slides).indexOf(slide);
                currentIndex = index;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProjectInfo();
    loadProjectImages();
    initCarousels();
});