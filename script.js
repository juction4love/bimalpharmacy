/* ============================================================
   बिमल फार्मेसी - मुख्य स्क्रिप्ट २०२६ (AdSense & UX Optimized)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // १. सक्रिय मेनु हाइलाइट गर्ने (Desktop & Mobile Navigation)
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a, .nav-item');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add('active');
            // Inline styling for immediate visual feedback
            if(link.tagName === 'A') {
                link.style.color = "var(--accent)";
            }
        }
    });

    // २. औषधी खोज्ने मेकानिजम (With "No Results" Message)
    const searchInput = document.getElementById('medicineSearchLocal'); 
    const searchItems = document.querySelectorAll('.search-item, .card, .item-card');
    const container = document.querySelector('.container');

    if (searchInput) {
        // 'No Result' म्यासेज एलिमेन्ट सिर्जना गर्ने
        const noResultMsg = document.createElement('p');
        noResultMsg.id = 'no-result';
        noResultMsg.style.display = 'none';
        noResultMsg.style.textAlign = 'center';
        noResultMsg.style.padding = '20px';
        noResultMsg.innerHTML = '<i class="fas fa-search-minus"></i> माफ गर्नुहोला, तपाईंले खोज्नुभएको औषधी भेटिएन।';
        
        if(container) container.appendChild(noResultMsg);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            let foundCount = 0;

            searchItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                    foundCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // यदि केही भेटिएन भने सूचना देखाउने
            noResultMsg.style.display = (foundCount === 0 && query !== "") ? 'block' : 'none';
        });
    }

    // ३. इमेज एरर ह्यान्डलिङ र लेजी लोडिङ
    document.querySelectorAll('img').forEach(img => {
        // Performance सुधार गर्न लेजी लोडिङ थप्ने
        img.setAttribute('loading', 'lazy');
        
        img.onerror = function() {
            // Placeholder इमेजको पाथ सुनिश्चित गर्नुहोस्
            this.src = 'logo.svg'; 
            this.style.opacity = "0.6";
            this.title = "Image not available";
        };
    });

    // ४. स्मूथ स्क्रोल (Internal Links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ५. डाइन्यामिक कन्सोल म्यासेज (Developer Profile)
    console.log("%cबिमल फार्मेसी २०२६: सिस्टम सुचारु छ।", "color: #2e7d32; font-weight: bold; font-size: 14px;");
    console.log("%cDeveloped by: Bimal Lamichhane (Google Developer)", "color: #1565c0; font-size: 12px;");
});

/* ६. ग्लोबल व्हाट्सएप फङ्सन (Enhanced Logic) */
function quickWhatsApp(prodName, price = 0) {
    const waNumber = "9779855065327"; 
    let msg = "";

    // मूल्य उपलब्ध छ कि छैन चेक गर्ने (प्रिमियम वा अर्डरको लागि)
    if (!price || parseFloat(price) <= 0) {
        msg = `नमस्ते बिमल फार्मेसी, मलाई '${prodName}' को मूल्य र उपलब्धताको बारेमा जानकारी चाहिएको थियो।`;
    } else {
        msg = `नमस्ते बिमल फार्मेसी, मलाई यो औषधी अर्डर गर्नु थियो: ${prodName} (मूल्य: रु ${price})`;
    }
    
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}
