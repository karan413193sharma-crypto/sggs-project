/**
 * SGGS Khalsa College Admission Page JavaScript
 * Contains all interactive functionality
 * ===========================================
 */

// ===========================================
// SMOOTH SCROLL TO SECTION
// ===========================================
/**
 * Scrolls smoothly to a section with given ID
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===========================================
// TOAST NOTIFICATION
// ===========================================
/**
 * Shows a toast notification with title and message
 * @param {string} title - Title of the notification
 * @param {string} message - Message content
 */
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===========================================
// ACCORDION TOGGLE (FAQ)
// ===========================================
/**
 * Toggles accordion item open/close
 * @param {HTMLElement} header - The clicked accordion header element
 */
function toggleAccordion(header) {
    const item = header.parentElement;
    const wasActive = item.classList.contains('active');
    
    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!wasActive) {
        item.classList.add('active');
    }
}

// ===========================================
// DOWNLOAD HANDLER
// ===========================================
/**
 * Handles prospectus download button clicks
 * @param {string} type - Type of document being downloaded
 */
function handleDownload(type) {
    // Show download started notification
    showToast('Download Started', `${type} is being downloaded...`);
    
    // Show download complete notification after 1.5 seconds
    setTimeout(() => {
        showToast('Download Complete', `${type} has been downloaded successfully.`);
    }, 1500);
    
    // NOTE: In production, replace this with actual download logic:
    // Example:
    // window.location.href = '/downloads/prospectus.pdf';
}

// ===========================================
// APPLICATION FORM SUBMIT
// ===========================================
/**
 * Handles application form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const form = document.getElementById('applicationForm');
    const formData = new FormData(form);
    
    // Show success notification
    showToast(
        'Application Submitted Successfully!',
        'We have received your application. Our admission team will contact you soon.'
    );
    
    // Reset the form
    form.reset();
    
    // NOTE: In production, add API call here to submit form data:
    // Example:
    // fetch('/api/submit-application', {
    //     method: 'POST',
    //     body: formData
    // }).then(response => response.json())
    //   .then(data => {
    //       showToast('Success', data.message);
    //   });
}

// ===========================================
// CONTACT FORM SUBMIT
// ===========================================
/**
 * Handles contact form submission
 * @param {Event} event - Form submit event
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    // Show success notification
    showToast(
        'Query Submitted Successfully!',
        'Our admission team will contact you within 24 hours.'
    );
    
    // Reset the form
    form.reset();
    
    // NOTE: In production, add API call here to submit contact form:
    // Example:
    // fetch('/api/submit-query', {
    //     method: 'POST',
    //     body: formData
    // }).then(response => response.json())
    //   .then(data => {
    //       showToast('Success', data.message);
    //   });
}

// ===========================================
// INITIALIZE ON PAGE LOAD
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admission page loaded successfully!');
    
    // Add any initialization code here
    // For example:
    // - Load data from API
    // - Set up event listeners
    // - Initialize third-party libraries
});