document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form submission handler
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Here you would normally send this data to your backend
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }
    
    // Project rating form AJAX submission
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Create form data from the form
            const formData = new FormData(this);
            
            // Get project ID from the form action URL
            const projectId = this.action.split('/').pop();
            
            // Set header for AJAX request
            const headers = new Headers({
                'X-Requested-With': 'XMLHttpRequest'
            });
            
            // Send the form data
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: headers
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Create new rating element
                    const newRating = createRatingElement(data.rating);
                    
                    // Add to the ratings list
                    const ratingsList = document.querySelector('.ratings-list');
                    if (ratingsList) {
                        // Insert at the beginning
                        ratingsList.insertBefore(newRating, ratingsList.firstChild);
                        
                        // If no ratings yet, create the section
                        const previousRatingsSection = document.querySelector('.previous-ratings');
                        if (!previousRatingsSection) {
                            createPreviousRatingsSection(data.rating);
                        }
                    }
                    
                    // Show success message
                    showFlashMessage('Thank you for your rating!');
                    
                    // Reset the form
                    this.reset();
                    
                    // Set default star rating to 5
                    document.getElementById('star5').checked = true;
                    
                    // Update the average rating and analytics
                    updateRatingAnalytics();
                } else {
                    showFlashMessage(data.message || 'Error submitting rating. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showFlashMessage('Error submitting rating. Please try again.', 'error');
            });
        });
    }
    
    // Project Screenshots Carousel Functionality
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const slides = carousel.querySelector('.carousel-container');
        const slideItems = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const dots = carousel.querySelectorAll('.dot');
        
        let currentIndex = 0;
        const slideCount = slideItems.length;
        
        // Initialize carousel
        updateCarousel();
        
        // Event Listeners
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateCarousel();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        });
        
        // Add click events to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // Update carousel display
        function updateCarousel() {
            // Update slide position
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // Auto-advance the carousel every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        }, 5000);
    }
    
    // Helper functions for rating system
    function createRatingElement(rating) {
        const ratingItem = document.createElement('div');
        ratingItem.className = 'rating-item';
        
        const ratingHeader = document.createElement('div');
        ratingHeader.className = 'rating-header';
        
        const ratingUser = document.createElement('div');
        ratingUser.className = 'rating-user';
        ratingUser.textContent = rating.name;
        
        const ratingDate = document.createElement('div');
        ratingDate.className = 'rating-date';
        ratingDate.textContent = rating.date;
        
        ratingHeader.appendChild(ratingUser);
        ratingHeader.appendChild(ratingDate);
        
        const ratingStars = document.createElement('div');
        ratingStars.className = 'rating-stars';
        
        // Add stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = i < rating.rating ? 'star filled' : 'star';
            star.textContent = i < rating.rating ? '★' : '☆';
            ratingStars.appendChild(star);
        }
        
        ratingItem.appendChild(ratingHeader);
        ratingItem.appendChild(ratingStars);
        
        // Add animation class
        ratingItem.classList.add('new-rating-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            ratingItem.classList.remove('new-rating-animation');
        }, 1000);
        
        return ratingItem;
    }
    
    function createPreviousRatingsSection(rating) {
        const mainContainer = document.querySelector('.project-container');
        const ratingSection = document.querySelector('.rating-section');
        
        const previousRatingsSection = document.createElement('section');
        previousRatingsSection.className = 'previous-ratings';
        
        const heading = document.createElement('h2');
        heading.textContent = 'Customer Reviews';
        
        const ratingsList = document.createElement('div');
        ratingsList.className = 'ratings-list';
        
        // Add the first rating
        ratingsList.appendChild(createRatingElement(rating));
        
        previousRatingsSection.appendChild(heading);
        previousRatingsSection.appendChild(ratingsList);
        
        // Insert before the back link
        const backLink = document.querySelector('.back-link');
        mainContainer.insertBefore(previousRatingsSection, backLink);
    }
    
    function showFlashMessage(message, type = 'success') {
        // Check if flash messages container exists
        let flashContainer = document.querySelector('.flash-messages');
        
        // If not, create one
        if (!flashContainer) {
            flashContainer = document.createElement('div');
            flashContainer.className = 'flash-messages';
            
            // Insert after the heading in rating section
            const ratingHeading = document.querySelector('.rating-section h2');
            ratingHeading.parentNode.insertBefore(flashContainer, ratingHeading.nextSibling);
        }
        
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Add to container
        flashContainer.innerHTML = ''; // Clear previous messages
        flashContainer.appendChild(messageDiv);
        
        // Scroll to the message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove after delay
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => {
                if (flashContainer.contains(messageDiv)) {
                    flashContainer.removeChild(messageDiv);
                }
            }, 500);
        }, 3000);
    }
    
    function updateRatingAnalytics() {
        // Reload the page to update analytics
        // In a more sophisticated setup, we would update the DOM directly
        location.reload();
    }
}); 