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
  const searchInput = document.getElementById("medicineSearch");
  const resultsBox = document.getElementById("searchResults");

  if (searchInput && resultsBox) {
    let medicines = [];
    let medicineLoadState = "loading";

    function createSearchItem(classNames, text) {
      const item = document.createElement("div");
      item.className = classNames;
      item.setAttribute("role", "listitem");
      item.textContent = text;
      return item;
    }

    function showSearchMessage(text, classNames = "search-item search-status") {
      resultsBox.replaceChildren(createSearchItem(classNames, text));
      resultsBox.style.display = "block";
    }

    async function loadMedicines() {
      resultsBox.setAttribute("aria-busy", "true");
      showSearchMessage("🔄 औषधी डाटा लोड हुँदैछ...");

      try {
        const startTime = performance.now();
        const response = await fetch("./medicines.json");
        if (!response.ok) {
          throw new Error(`Medicine data request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Medicine data is not an array");
        }

        medicines = data;
        medicineLoadState = "ready";
        const loadTime = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Medicines loaded: ${medicines.length} (${loadTime}s)`);
        resultsBox.setAttribute("aria-busy", "false");
        resultsBox.replaceChildren();
        resultsBox.style.display = "none";
      } catch (error) {
        medicines = [];
        medicineLoadState = "error";
        console.error("❌ Failed to load medicine data", error);
        resultsBox.setAttribute("aria-busy", "false");
        showSearchMessage("⚠️ डाटा लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।", "search-item search-no-result");
      }
    }

    loadMedicines();

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
        resultsBox.replaceChildren();
        resultsBox.style.display = "none";
        return;
      }

      if (query.length < 2) {
        showSearchMessage("कम्तिमा २ अक्षर लेख्नुहोस्...");
        return;
      }

      if (medicineLoadState === "error") {
        showSearchMessage("⚠️ डाटा लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।", "search-item search-no-result");
        return;
      }

      if (medicineLoadState === "loading") {
        showSearchMessage("🔄 डाटा लोड हुँदैछ... कृपया पर्खनुहोस्");
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
        const noResult = createSearchItem("search-item search-no-result", "");
        const message = document.createElement("div");
        message.textContent = `🔍 “${query}” को लागि कुनै औषधी फेला परेन`;
        const suggestion = document.createElement("small");
        suggestion.textContent = "कृपया अर्को नामले प्रयास गर्नुहोस्";
        noResult.append(message, suggestion);
        resultsBox.replaceChildren(noResult);
        resultsBox.style.display = "block";
        return;
      }

      const fragment = document.createDocumentFragment();

      items.slice(0, 20).forEach((item) => {
        const brand = item["Brand Name "] || "Unknown";
        const generic = item["Generic Name"] || "N/A";
        const strength = item["Strength"] || "";
        const category = item["category"] || "General";

        const resultItem = createSearchItem("search-item", "");
        const header = document.createElement("div");
        header.className = "search-item-header";

        const brandName = document.createElement("strong");
        brandName.className = "search-brand-name";
        brandName.textContent = `💊 ${brand}`;

        const categoryTag = document.createElement("span");
        categoryTag.className = "search-category-tag";
        categoryTag.textContent = category;
        header.append(brandName, categoryTag);

        const genericName = document.createElement("small");
        genericName.className = "search-generic-name";
        genericName.textContent = `🧬 ${generic}`;
        resultItem.append(header, genericName);

        if (strength) {
          const strengthValue = document.createElement("span");
          strengthValue.className = "search-strength";
          strengthValue.textContent = `📦 ${strength}`;
          resultItem.append(strengthValue);
        }

        fragment.append(resultItem);
      });

      const footer = createSearchItem("search-footer", `कुल ${items.length} परिणाम | माथि २० देखाइएको`);
      fragment.append(footer);
      resultsBox.replaceChildren(fragment);
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
      if (this.value.trim().length >= 2 && resultsBox.childElementCount > 0) {
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
