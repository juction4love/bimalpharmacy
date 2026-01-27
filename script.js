/* =========================================
   विमल फार्मेसी - मुख्य स्क्रिप्ट २०२६
   यसले नेभिगेसन, युआई र ग्लोबल फङ्सन नियन्त्रण गर्दछ।
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // १. सक्रिय मेनु हाइलाइट गर्ने (Active Navigation Highlighting)
    // हाल कुन पेज खुल्ला छ, त्यसलाई मेनुमा सुनौलो (Gold) रङले प्रस्ट पार्दछ
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // पेजको नाम मिल्दा .active क्लास थप्ने
        if (linkPath === currentPath) {
            link.classList.add('active');
            // 'style.css' को भेरिएबल अनुसार सुनौलो रङ दिने
            link.style.borderBottom = "3px solid var(--accent)"; 
            link.style.color = "var(--accent)";
        } else {
            // यदि मिल्दैन भने पुरानो एक्टिभ हटाइदिने (क्लिट युआईको लागि)
            link.classList.remove('active');
        }
    });

    // २. औषधी खोज्ने फिल्टर (यदि यो सर्च पेज हो भने मात्र चल्छ)
    // नोट: धेरै औषधीको लागि हामीले 'search.html' मै छुट्टै लोजिक राखेका छौँ, 
    // यो चाहिँ साना इन्भेन्टरी वा कार्डहरूको लागि मात्र हो।
    const searchInput = document.getElementById('medicineSearchLocal'); 
    const searchItems = document.querySelectorAll('.search-item');

    if (searchInput && searchItems.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            searchItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                    item.style.animation = "fadeIn 0.4s ease";
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // ३. फोटो लोड नभएमा सम्हाल्ने (Image Error Handling)
    // यो विशेष गरी प्रिस्क्रिप्सन प्रिभ्यु वा ग्यालरीको लागि उपयोगी छ
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        img.onerror = function() {
            // यदि फोटो भेटिएन भने लुकाइदिने वा डिफल्ट आइकन राख्न सकिन्छ
            this.style.display = 'none'; 
            console.warn("विमल फार्मेसी: फोटो लोड हुन सकेन -> " + this.src);
        };
    });

    // ४. मोबाइलमा क्लिक गर्दा स्मूथ स्क्रोल (Smooth Scroll)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // कन्सोलमा स्वागत सन्देश
    console.log("%cविमल फार्मेसी २०२६: सबै सुविधाहरू सुचारु छन्।", "color: #388E3C; font-weight: bold; font-size: 14px;");

});

/* ५. ग्लोबल व्हाट्सएप अर्डर फङ्सन (कुनै पनि बटनबाट सिधै प्रयोग गर्न सकिने) */
function quickWhatsApp(prodName) {
    const waNumber = "9779855065327";
    const msg = `नमस्ते विमल फार्मेसी, मलाई यो औषधीको बारेमा जानकारी चाहिएको थियो: ${prodName}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}
