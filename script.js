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
      
      // For keyboard navigation
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

  async function loadMedicines() {
    try {
      const res = await fetch("./medicines.json");
      medicines = await res.json();
      console.log("Medicines loaded:", medicines.length);
    } catch (err) {
      console.error("Failed to load medicines.json", err);
    }
  }

  loadMedicines();

  const searchInput = document.getElementById("medicineSearch");
  const resultsBox = document.getElementById("searchResults");

  if (searchInput && resultsBox) {
    // Performance Upgrade: Debounce to prevent browser freezing on large datasets
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

      const filtered = medicines.filter(m => {
        return (
          (m["Brand Name "] && m["Brand Name "].toLowerCase().includes(query)) ||
          (m["Generic Name"] && m["Generic Name"].toLowerCase().includes(query)) ||
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.category && m.category.toLowerCase().includes(query)) ||
          (m.brand && m.brand.toLowerCase().includes(query))
        );
      }).slice(0, 50);

      renderResults(filtered);
    }, 200));

    function renderResults(items) {
      if (!items || items.length === 0) {
        resultsBox.innerHTML = `<div class="search-item search-no-result">औषधी फेला परेन</div>`;
        resultsBox.style.display = "block";
        return;
      }

      resultsBox.innerHTML = items.slice(0, 20).map(item => `
        <div class="search-item">
          <strong class="search-brand-name">${item["Brand Name "] || item.name || "Unknown"}</strong>
          <small class="search-generic-name">${item["Generic Name"] || item.category || "N/A"}</small>
          <span class="search-strength">💊 ${item.Strength || item.dosage || ""}</span>
        </div>
      `).join("");
      
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
      if (this.value.trim() && resultsBox.innerHTML) {
        resultsBox.style.display = "block";
      }
    });
  }

  // ३. इमेज एरर ह्यान्डलिङ र लेजी लोडिङ
  document.querySelectorAll('img').forEach(img => {
    // Performance सुधार गर्न लेजी लोडिङ थप्ने
    img.setAttribute('loading', 'lazy');
    
    img.onerror = function() {
      // Fallback image if original fails to load
      this.src = 'placeholder.png';
      this.alt = 'Image not available';
      this.classList.add('img-error');
    };
  });

  // ४. Back-to-Top Button Functionality
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
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
