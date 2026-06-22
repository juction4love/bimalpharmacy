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

  // Dropdown Accessibility Toggle
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
        return;
      }

      const filtered = medicines.filter(m => {
        // Modified slightly to match the actual JSON keys + user's keys
        return (
          (m["Brand Name "] && m["Brand Name "].toLowerCase().includes(query)) ||
          (m["Generic Name"] && m["Generic Name"].toLowerCase().includes(query)) ||
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.category && m.category.toLowerCase().includes(query)) ||
          (m.brand && m.brand.toLowerCase().includes(query))
        );
      }).slice(0, 50); // Kept slice to protect DOM rendering

      renderResults(filtered);
    }, 200));

    function renderResults(items) {
      if (!items || items.length === 0) {
        resultsBox.innerHTML = "<div class='search-item' style='padding:10px; text-align:center; color:red;'>No medicine found</div>";
        return;
      }

      resultsBox.innerHTML = items.slice(0, 20).map(item => `
        <div class="search-item" style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;">
          <strong style="color: var(--primary);">${item["Brand Name "] || item.name || "Unknown"}</strong><br>
          <small style="color: #666;">${item["Generic Name"] || item.category || "N/A"}</small><br>
          <span style="font-size: 13px;">💊 ${item.Strength || item.dosage || ""}</span>
        </div>
      `).join("");
    }
  }

  // ३. इमेज एरर ह्यान्डलिङ र लेजी लोडिङ
  document.querySelectorAll('img').forEach(img => {
    // Performance सुधार गर्न लेजी लोडिङ थप्ने
    img.setAttribute('loading', 'lazy');
    
    img.onerror = function()
