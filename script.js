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
    }
  });

  // Dropdown Accessibility Toggle (for pages that still have dropdowns)
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggleLink = dropdown.querySelector('a[aria-haspopup="true"]');
    if (toggleLink) {
      dropdown.addEventListener('mouseenter', () => toggleLink.setAttribute('aria-expanded', 'true'));
      dropdown.addEventListener('mouseleave', () => toggleLink.setAttribute('aria-expanded', 'false'));
      
      toggleLink.addEventListener('focus', () => toggleLink.setAttribute('aria-expanded', 'true'));
      dropdown.addEventListener('focusout', (e) => {
        if (!dropdown.contains(e.relatedTarget)) {
          toggleLink.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // २. औषधी खोज्ने मेकानिजम (JSON Fetch API)
  let medicines = [];
  let isLoading = false;

  async function loadMedicines() {
    const resultsBox = document.getElementById("searchResults");
    if (resultsBox) {
      resultsBox.innerHTML = '<div class="search-item" style="text-align:center;padding:15px;">🔄 औषधी डाटा लोड हुँदैछ...</div>';
      resultsBox.style.display = "block";
    }
    
    try {
      const startTime = performance.now();
      const res = await fetch("./medicines.json");
      medicines = await res.json();
      const loadTime = ((performance.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Medicines loaded: ${medicines.length} (${loadTime}s)`);
      
      if (resultsBox) {
        resultsBox.innerHTML = "";
        resultsBox.style.display = "none";
      }
    } catch (err) {
      console.error("❌ Failed to load medicines.json", err);
      if (resultsBox) {
        resultsBox.innerHTML = '<div class="search-item search-no-result">⚠️ डाटा लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।</div>';
      }
    }
  }

  loadMedicines();

  const searchInput = document.getElementById("medicineSearch");
  const resultsBox = document.getElementById("searchResults");

  if (searchInput && resultsBox) {
    
    // Debounce for performance
    function debounce(fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    searchInput.addEventListener("input", debounce(function () {
      const query = this.value.toLowerCase().trim();

      if (!query) {
        resultsBox.innerHTML = "";
        resultsBox.style.display = "none";
        return;
      }

      if (query.length < 2) {
        resultsBox.innerHTML = '<div class="search-item" style="text-align:center;padding:10px;color:#999;">कम्तिमा २ अक्षर लेख्नुहोस्...</div>';
        resultsBox.style.display = "block";
        return;
      }

      if (medicines.length === 0) {
        resultsBox.innerHTML = '<div class="search-item" style="text-align:center;padding:15px;">🔄 डाटा लोड हुँदैछ... कृपया पर्खनुहोस्</div>';
        resultsBox.style.display = "block";
        return;
      }

      // Search in brand name, generic name, category, and strength
      const filtered = medicines.filter(m => {
        const brand = (m["Brand Name "] || "").toLowerCase();
        const generic = (m["Generic Name"] || "").toLowerCase();
        const category = (m["category"] || "").toLowerCase();
        const strength = (m["Strength"] || "").toLowerCase();
        
        return brand.includes(query) || 
               generic.includes(query) || 
               category.includes(query) || 
               strength.includes(query);
      }).slice(0, 50);

      renderResults(filtered, query);
    }, 250));

    function renderResults(items, query) {
      if (!items || items.length === 0) {
        resultsBox.innerHTML = `
          <div class="search-item search-no-result">
            <i class="fas fa-search" style="margin-right:8px;"></i> 
            "${query}" को लागि कुनै औषधी फेला परेन
            <br><small style="color:#999;">कृपया अर्को नामले प्रयास गर्नुहोस्</small>
          </div>`;
        resultsBox.style.display = "block";
        return;
      }

      resultsBox.innerHTML = items.slice(0, 20).map((item, index) => {
        const brand = item["Brand Name "] || "Unknown";
        const generic = item["Generic Name"] || "N/A";
        const strength = item["Strength"] || "";
        const category = item["category"] || "General";
        
        // WhatsApp message
        const waMessage = encodeURIComponent(
          `नमस्ते बिमल फार्मेसी,\n\nमलाई यो औषधीको बारेमा जानकारी चाहियो:\n\n` +
          `💊 औषधी: ${brand}\n` +
          `🧬 साल्ट: ${generic}\n` +
          `📦 ${strength ? 'शक्ति: ' + strength : ''}\n` +
          `📋 श्रेणी: ${category}\n\n` +
          `कृपया उपलब्धता र मूल्य जानकारी दिनुहोस्।`
        );
        
        return `
        <div class="search-item" onclick="window.open('https://wa.me/9779855065327?text=${waMessage}', '_blank')" 
             title="Click for WhatsApp inquiry">
          <div class="search-item-header">
            <strong class="search-brand-name">💊 ${brand}</strong>
            <span class="search-category-tag">${category}</span>
          </div>
          <small class="search-generic-name">🧬 ${generic}</small>
          ${strength ? `<span class="search-strength">📦 ${strength}</span>` : ''}
          <div class="search-wa-hint">
            <i class="fab fa-whatsapp"></i> जानकारी लिन ट्याप गर्नुहोस्
          </div>
        </div>`;
      }).join("");
      
      resultsBox.innerHTML += `<div class="search-footer">कुल ${items.length} परिणाम | माथि २० देखाइएको</div>`;
      resultsBox.style.display = "block";
    }

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
        resultsBox.style.display = "none";
      }
    });

    // Show results when focusing on search
    searchInput.addEventListener('focus', function() {
      if (this.value.trim().length >= 2 && resultsBox.innerHTML) {
        resultsBox.style.display = "block";
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        resultsBox.style.display = "none";
        this.blur();
      }
    });
  }

  // ३. इमेज एरर ह्यान्डलिङ र लेजी लोडिङ
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy');
    
    img.onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23ddd"><rect width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23999" font-size="14">No Image</text></svg>';
      this.alt = 'Image not available';
      this.classList.add('img-error');
    };
  });

  // ४. Back-to-Top Button Functionality
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('show', window.scrollY > 300);
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ५. Smooth Scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ६. Mobile Nav Active State Sync
  const mobileNavItems = document.querySelectorAll('.mobile-nav .nav-item');
  mobileNavItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (itemPath === currentPath || (currentPath === "" && itemPath === "index.html")) {
      item.classList.add('active');
    }
  });

});
