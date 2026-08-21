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
    let searchManifest = null;
    let medicineLoadState = "loading";
    let requestSequence = 0;
    const termChunkCache = new Map();
    const recordChunkCache = new Map();

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

    function normalizeSearchText(value) {
      return String(value || "")
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .replace(/\s+/g, " ");
    }

    function searchBucket(token) {
      const prefix = token.slice(0, 2);
      return /^[a-z0-9]{1,2}$/.test(prefix) ? prefix.padEnd(2, "_") : "other";
    }

    async function fetchJson(path, description) {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`${description} request failed with status ${response.status}`);
      }
      return response.json();
    }

    async function loadSearchManifest() {
      resultsBox.setAttribute("aria-busy", "true");
      showSearchMessage("🔄 औषधी खोज तयार हुँदैछ...");

      try {
        const startTime = performance.now();
        const manifest = await fetchJson("./medicine-search/manifest.json", "Medicine search manifest");
        if (!manifest || !manifest.termChunks || !manifest.recordChunks || !Array.isArray(manifest.recordBucketNames)) {
          throw new Error("Medicine search manifest has an invalid structure");
        }

        searchManifest = manifest;
        medicineLoadState = "ready";
        const loadTime = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Medicine search ready: ${manifest.recordCount} records (${loadTime}s)`);
        resultsBox.setAttribute("aria-busy", "false");
        resultsBox.replaceChildren();
        resultsBox.style.display = "none";
      } catch (error) {
        searchManifest = null;
        medicineLoadState = "error";
        console.error("❌ Failed to initialize medicine search", error);
        resultsBox.setAttribute("aria-busy", "false");
        showSearchMessage("⚠️ डाटा लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।", "search-item search-no-result");
      }
    }

    function loadTermChunk(bucket) {
      if (!termChunkCache.has(bucket)) {
        const entry = searchManifest.termChunks[bucket];
        termChunkCache.set(bucket, entry ? fetchJson(`./medicine-search/${entry.file}`, `Search index ${bucket}`) : Promise.resolve({ terms: [] }));
      }
      return termChunkCache.get(bucket);
    }

    function loadRecordChunk(bucket) {
      if (!recordChunkCache.has(bucket)) {
        const entry = searchManifest.recordChunks[bucket];
        recordChunkCache.set(bucket, entry ? fetchJson(`./medicine-search/${entry.file}`, `Medicine records ${bucket}`) : Promise.resolve({ records: [] }));
      }
      return recordChunkCache.get(bucket);
    }

    loadSearchManifest();

    // Debounce for performance
    function debounce(fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    searchInput.addEventListener("input", debounce(async function () {
      const query = this.value.trim();
      const normalizedQuery = normalizeSearchText(query);
      const currentRequest = ++requestSequence;

      if (!normalizedQuery) {
        resultsBox.replaceChildren();
        resultsBox.style.display = "none";
        return;
      }

      if (normalizedQuery.length < 2) {
        showSearchMessage("कम्तिमा २ अक्षर लेख्नुहोस्...");
        return;
      }

      if (medicineLoadState === "error") {
        showSearchMessage("⚠️ डाटा लोड गर्न सकिएन। कृपया पछि प्रयास गर्नुहोस्।", "search-item search-no-result");
        return;
      }

      if (medicineLoadState === "loading") {
        showSearchMessage("🔄 औषधी खोज तयार हुँदैछ... कृपया पर्खनुहोस्");
        return;
      }

      resultsBox.setAttribute("aria-busy", "true");
      showSearchMessage("🔄 परिणाम खोजिँदैछ...");
      try {
        const items = await searchMedicines(normalizedQuery);
        if (currentRequest === requestSequence) {
          renderResults(items, query);
        }
      } catch (error) {
        console.error("❌ Medicine search failed", error);
        if (currentRequest === requestSequence) {
          showSearchMessage("⚠️ खोज पूरा गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।", "search-item search-no-result");
        }
      } finally {
        if (currentRequest === requestSequence) {
          resultsBox.setAttribute("aria-busy", "false");
        }
      }
    }, 250));

    async function searchMedicines(normalizedQuery) {
      const tokens = [...new Set(normalizedQuery.split(" ").filter(Boolean))];
      const buckets = [...new Set(tokens.map(searchBucket))];
      const chunks = await Promise.all(buckets.map(loadTermChunk));
      const chunkByBucket = new Map(buckets.map((bucket, index) => [bucket, chunks[index]]));
      const candidates = new Map();

      tokens.forEach((token, tokenIndex) => {
        const chunk = chunkByBucket.get(searchBucket(token));
        for (const [term, postings] of chunk.terms || []) {
          if (!term.includes(token)) continue;
          const termScore = term === token ? 120 : term.startsWith(token) ? 80 : 40;
          for (const [id, recordBucketId, fieldMask] of postings) {
            const candidate = candidates.get(id) || { id, recordBucketId, fieldMask: 0, tokenMatches: new Set(), termScore: 0 };
            candidate.fieldMask |= fieldMask;
            candidate.tokenMatches.add(tokenIndex);
            candidate.termScore += termScore;
            candidates.set(id, candidate);
          }
        }
      });

      const preliminary = [...candidates.values()]
        .sort((left, right) =>
          right.tokenMatches.size - left.tokenMatches.size ||
          Number(right.tokenMatches.size === tokens.length) - Number(left.tokenMatches.size === tokens.length) ||
          Number(Boolean(right.fieldMask & 1)) - Number(Boolean(left.fieldMask & 1)) ||
          Number(Boolean(right.fieldMask & 2)) - Number(Boolean(left.fieldMask & 2)) ||
          right.termScore - left.termScore ||
          left.id - right.id
        )
        .slice(0, 120);

      const recordBuckets = [...new Set(preliminary.map(candidate => searchManifest.recordBucketNames[candidate.recordBucketId]))];
      const recordChunks = await Promise.all(recordBuckets.map(loadRecordChunk));
      const wantedIds = new Set(preliminary.map(candidate => candidate.id));
      const records = [];
      for (const chunk of recordChunks) {
        for (const record of chunk.records || []) {
          if (wantedIds.has(record[0])) records.push(record);
        }
      }

      return records
        .map(record => ({ record, score: rankRecord(record, normalizedQuery, tokens) }))
        .filter(item => item.score > 0)
        .sort((left, right) => right.score - left.score || left.record[1].localeCompare(right.record[1]) || left.record[0] - right.record[0])
        .slice(0, 50)
        .map(item => item.record);
    }

    function rankRecord(record, query, tokens) {
      const brand = normalizeSearchText(record[1]);
      const generic = normalizeSearchText(record[2]);
      const strength = normalizeSearchText(record[3]);
      const category = normalizeSearchText(record[4]);
      const dosageForm = normalizeSearchText(record[5]);
      const manufacturer = normalizeSearchText(record[6]);
      const packSize = normalizeSearchText(record[7]);
      const allText = [brand, generic, strength, category, dosageForm, manufacturer, packSize].join(" ");
      const tokenMatches = tokens.filter(token => allText.includes(token)).length;
      if (tokenMatches === 0) return 0;

      let score = tokenMatches * 100;
      if (tokenMatches === tokens.length) score += 500;
      if (brand === query) score += 1000;
      else if (brand.startsWith(query)) score += 800;
      if (generic === query) score += 700;
      else if (generic.startsWith(query)) score += 600;
      if (brand.includes(query)) score += 500;
      if (generic.includes(query)) score += 400;
      if ([strength, category, dosageForm, manufacturer, packSize].some(value => value.includes(query))) score += 200;
      return score;
    }

    function renderResults(items, query) {
      if (!items || items.length === 0) {
        const noResult = createSearchItem("search-item search-no-result", "");
        const message = document.createElement("div");
        message.textContent = `🔍 “${query}” को लागि कुनै औषधी फेला परेन`;
        const suggestion = document.createElement("small");
        suggestion.textContent = "अर्को brand, generic name, strength वा spelling प्रयास गर्नुहोस्। यो नतिजाले pharmacy availability जनाउँदैन।";
        noResult.append(message, suggestion);
        resultsBox.replaceChildren(noResult);
        resultsBox.style.display = "block";
        return;
      }

      const fragment = document.createDocumentFragment();

      items.slice(0, 20).forEach((item) => {
        const [, brand, generic, strength, category, dosageForm, manufacturer, packSize] = item;

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
        genericName.textContent = `🧬 ${generic || "Generic information not listed"}`;
        resultItem.append(header, genericName);

        if (strength) {
          const strengthValue = document.createElement("span");
          strengthValue.className = "search-strength";
          strengthValue.textContent = `📦 ${strength}`;
          resultItem.append(strengthValue);
        }

        if (dosageForm) {
          const formValue = document.createElement("span");
          formValue.className = "search-meta";
          formValue.textContent = `💠 Form: ${dosageForm}`;
          resultItem.append(formValue);
        }

        if (manufacturer) {
          const manufacturerValue = document.createElement("span");
          manufacturerValue.className = "search-meta";
          manufacturerValue.textContent = `🏭 Manufacturer: ${manufacturer}`;
          resultItem.append(manufacturerValue);
        }

        if (packSize) {
          const packValue = document.createElement("span");
          packValue.className = "search-meta";
          packValue.textContent = `📦 Pack: ${packSize}`;
          resultItem.append(packValue);
        }

        fragment.append(resultItem);
      });

      const footer = createSearchItem("search-footer", `शीर्ष ${Math.min(items.length, 20)} जानकारीमूलक परिणाम`);
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
