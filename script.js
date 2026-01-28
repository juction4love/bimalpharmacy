/* =========================================
   विमल फार्मेसी - मुख्य स्क्रिप्ट २०२६
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // १. सक्रिय मेनु हाइलाइट गर्ने (Improved matching)
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Check if current path matches or if it's the home page
        if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add('active');
            link.style.borderBottom = "3px solid var(--accent)"; 
            link.style.color = "var(--accent)";
        }
    });

    // २. साना कार्डहरूको लागि लोकल फिल्टर
    const searchInput = document.getElementById('medicineSearchLocal'); 
    const searchItems = document.querySelectorAll('.search-item');

    if (searchInput && searchItems.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }

    // ३. इमेज एरर ह्यान्डलिङ (Updated with descriptive console)
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = 'assets/placeholder-med.png'; 
            this.style.opacity = "0.7"; // Make placeholder slightly subtle
        };
    });

    // ४. स्मूथ स्क्रोल
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log("%cविमल फार्मेसी २०२६: सिस्टम सुचारु छ।", "color: #2e7d32; font-weight: bold; font-size: 14px;");
});

/* ५. ग्लोबल व्हाट्सएप फङ्सन - Enhanced with Price Context */
function quickWhatsApp(prodName, price = 0) {
    const waNumber = "9779855065327"; 
    
    // If price is 0 or not provided, adjust the message to ask for price
    let msg = `नमस्ते विमल फार्मेसी, मलाई यो औषधीको बारेमा जानकारी चाहिएको थियो: ${prodName}`;
    if (parseFloat(price) <= 0) {
        msg = `नमस्ते विमल फार्मेसी, मलाई '${prodName}' को मूल्य र उपलब्धताको बारेमा जानकारी चाहिएको थियो।`;
    }
    
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}
