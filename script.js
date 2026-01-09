/* BIMAL PHARMACY - FINAL PROJECT SCRIPT 2026
   Handles Search, UI Effects, and Navigation
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. MEDICINE & SERVICE SEARCH FILTER
    // This logic works specifically with the 'search.html' page
    const searchInput = document.getElementById('medicineSearch');
    const searchItems = document.querySelectorAll('.search-item');

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase();

            searchItems.forEach(item => {
                const keywords = item.getAttribute('data-name').toLowerCase();
                const content = item.textContent.toLowerCase();
                
                // If the search term is found in data-name or card text
                if (keywords.includes(query) || content.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 2. ACTIVE NAVIGATION HIGHLIGHTING
    // Automatically highlights the current page link in the menu
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
            link.style.borderBottom = "3px solid #ffffff";
            link.style.paddingBottom = "5px";
        }
    });

    // 3. IMAGE ERROR HANDLING
    // If photo1.jpg or photo2.jpg is missing, this prevents a broken look
    const galleryImages = document.querySelectorAll('.photo-gallery img');
    galleryImages.forEach(img => {
        img.onerror = function() {
            this.style.display = 'none'; // Hides the image if it fails to load
            console.warn("Bimal Pharmacy Warning: Image " + this.src + " failed to load.");
        };
    });

    console.log("Bimal Pharmacy: All scripts initialized successfully.");
});