// Facility images data
const facilitiesImages = {
    convention: [
        'https://images.unsplash.com/photo-1643199011202-ef2d00dd8d60?w=800',
        'https://images.pexels.com/photos/3864594/pexels-photo-3864594.jpeg?w=800',
        'https://images.unsplash.com/photo-1553545894-cf4d7f2bf8ac?w=800'
    ],
    library: [
        'https://images.unsplash.com/photo-1689459448455-928ff1f65621?w=800',
        'https://images.unsplash.com/photo-1689459448454-7725b81a304f?w=800',
        'https://images.pexels.com/photos/6550407/pexels-photo-6550407.jpeg?w=800'
    ],
    labs: [
        'https://images.pexels.com/photos/32213421/pexels-photo-32213421.jpeg?w=800',
        'https://images.pexels.com/photos/8531344/pexels-photo-8531344.jpeg?w=800',
        'https://images.pexels.com/photos/8851781/pexels-photo-8851781.jpeg?w=800'
    ],
    sports: [
        'https://images.unsplash.com/photo-1690752795233-3813df6e2760?w=800',
        'https://images.unsplash.com/photo-1635400759226-a93fdb204ba1?w=800',
        'https://images.pexels.com/photos/13811359/pexels-photo-13811359.jpeg?w=800'
    ]
};

// Lightbox functionality
let currentFacility = '';
let currentIndex = 0;

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCounter = document.getElementById('lightboxCounter');
const closeLightbox = document.getElementById('closeLightbox');
const prevImage = document.getElementById('prevImage');
const nextImage = document.getElementById('nextImage');

// Open lightbox
function openLightbox(facility, index) {
    currentFacility = facility;
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightboxHandler() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Update lightbox image
function updateLightboxImage() {
    const images = facilitiesImages[currentFacility];
    if (images && images[currentIndex]) {
        lightboxImage.src = images[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }
}

// Navigate to previous image
function showPrevImage() {
    const images = facilitiesImages[currentFacility];
    currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    updateLightboxImage();
}

// Navigate to next image
function showNextImage() {
    const images = facilitiesImages[currentFacility];
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
}

// Event listeners
closeLightbox.addEventListener('click', closeLightboxHandler);
prevImage.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrevImage();
});
nextImage.addEventListener('click', (e) => {
    e.stopPropagation();
    showNextImage();
});

// Close lightbox when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightboxHandler();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightboxHandler();
    } else if (e.key === 'ArrowLeft') {
        showPrevImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// Add click handlers to all gallery items
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const facility = item.dataset.facility;
        const index = parseInt(item.dataset.index);
        openLightbox(facility, index);
    });

    // Add keyboard support
    item.setAttribute('tabindex', '0');
    item.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const facility = item.dataset.facility;
            const index = parseInt(item.dataset.index);
            openLightbox(facility, index);
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Lazy loading for images (if browser doesn't support loading="lazy")
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe facility sections
document.querySelectorAll('.facility-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Performance: Preload critical images
window.addEventListener('load', () => {
    // Preload first images of each facility
    Object.values(facilitiesImages).forEach(images => {
        if (images[0]) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = images[0];
            document.head.appendChild(link);
        }
    });
});

// Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next image
            showNextImage();
        } else {
            // Swipe right - previous image
            showPrevImage();
        }
    }
}

console.log('%c🎓 SGGS Khalsa College Mahilpur', 'color: #8c1007; font-size: 20px; font-weight: bold;');
console.log('%cExcellence in Education Since 1991', 'color: #666; font-size: 14px;');