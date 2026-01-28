/* =========================================
   विमल फार्मेसी - मुख्य स्क्रिप्ट २०२६
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // १. सक्रिय मेनु हाइलाइट गर्ने (FIXED: Improved matching for sub-pages)
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
            // 'style.css' को भेरिएबल अनुसार सुनौलो रङ दिने
            link.style.borderBottom = "3px solid var(--accent)"; 
            link.style.color = "var(--accent)";
        } else {
            link.classList.remove('active');
            // Reset styles for non-active links
            link.style.borderBottom = "none";
            link.style.color = "";
        }
    });

    // २. साना कार्डहरूको लागि लोकल फिल्टर (Small Local Filter)
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

    // ३. फोटो लोड नभएमा डिफल्ट लोगो राख्ने (Error Handling)
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        img.onerror = function() {
            // औषधीको फोटो नभएमा एउटा जेनेरिक फार्मेसी आइकन देखाउन सकिन्छ
            this.src = 'assets/placeholder-med.png'; 
            console.warn("विमल फार्मेसी: फोटो भेटिएन -> " + this.src);
        };
    });

    // ४. स्मूथ स्क्रोल
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    console.log("%cविमल फार्मेसी २०२६: सुचारु छ।", "color: #2e7d32; font-weight: bold;");
});

/* ५. ग्लोबल व्हाट्सएप फङ्सन - Updated with your real number */
function quickWhatsApp(prodName) {
    const waNumber = "9779855065327"; // Bimal Pharmacy Mobile
    const msg = `नमस्ते विमल फार्मेसी, मलाई यो औषधीको बारेमा जानकारी चाहिएको थियो: ${prodName}`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}
