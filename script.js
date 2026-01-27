/* विमल फार्मेसी - मुख्य स्क्रिप्ट २०२६
   यसले खोज (Search), युआई इफेक्ट र नेभिगेसन नियन्त्रण गर्दछ।
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // १. औषधी र सेवा खोज्ने फिल्टर (Search Filter)
    // यो विशेष गरी 'search.html' पेजको लागि तयार गरिएको हो
    const searchInput = document.getElementById('medicineSearch');
    const searchItems = document.querySelectorAll('.search-item');

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase();

            searchItems.forEach(item => {
                const keywords = item.getAttribute('data-name').toLowerCase();
                const content = item.textContent.toLowerCase();
                
                // यदि खोजिएको शब्द 'data-name' वा कार्डको 'text' मा फेला पर्यो भने
                if (keywords.includes(query) || content.includes(query)) {
                    item.style.display = 'block';
                    // कार्ड देखिँदा हल्का एनिमेसन थप्न सकिन्छ
                    item.style.animation = "fadeIn 0.5s ease";
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // २. सक्रिय मेनु हाइलाइट गर्ने (Active Navigation Highlighting)
    // हाल कुन पेज खुल्ला छ, त्यसलाई मेनुमा सुनौलो रङले हाइलाइट गर्दछ
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // यदि लिङ्क र हालको पेजको नाम मिल्छ भने
        if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add('active'); // CSS मा भएको .active क्लास थप्छ
            
            // नयाँ स्टाइल अनुसार सुनौलो बोर्डर थपिएको छ
            link.style.borderBottom = "3px solid #FFD700"; 
            link.style.color = "#FFD700";
        }
    });

    // ३. फोटो नभेटिएमा सम्हाल्ने (Image Error Handling)
    // यदि कुनै फोटो लोड हुन सकेन भने यसले 'broken icon' देखाउनुको सट्टा फोटोलाई लुकाइदिन्छ
    const galleryImages = document.querySelectorAll('.photo-gallery img');
    galleryImages.forEach(img => {
        img.onerror = function() {
            this.style.display = 'none'; 
            console.warn("विमल फार्मेसी चेतावनी: फोटो लोड हुन सकेन -> " + this.src);
        };
    });

    // ब्राउजरको कन्सोलमा स्वागत सन्देश
    console.log("%cविमल फार्मेसी: सबै स्क्रिप्टहरू सफलतापूर्वक सुचारु भए।", "color: #4CAF50; font-weight: bold; font-size: 14px;");

});
