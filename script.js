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
    function createPromiseCache(limit) {
      const entries = new Map();
      return {
        getOrLoad(key, loader) {
          if (entries.has(key)) {
            const cached = entries.get(key);
            entries.delete(key);
            entries.set(key, cached);
            return cached;
          }
          const pending = Promise.resolve().then(loader);
          entries.set(key, pending);
          pending.catch(() => entries.delete(key));
          while (entries.size > limit) entries.delete(entries.keys().next().value);
          return pending;
        }
      };
    }

    const termChunkCache = createPromiseCache(12);
    const recordChunkCache = createPromiseCache(96);

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
        .replace(/\s+/g, " ")
        .replace(/(\d)\s+(?=(?:mcg|mg|kg|ml|iu|units?|g|l)\b)/g, "$1");
    }

    function searchBucket(token) {
      const prefix = token.slice(0, 2);
      return /^[a-z0-9]{1,2}$/.test(prefix) ? prefix.padEnd(2, "_") : "other";
    }

    function termChunkKey(token) {
      const base = searchBucket(token);
      const children = searchManifest.splitRoutes[base];
      if (!children) return searchManifest.termChunkKeys.includes(base) ? base : null;
      if (token.length === 2) return `${base}-broad`;
      const child = token.slice(0, 3).padEnd(3, "_");
      if (!children.includes(child)) return null;
      const grandchildren = searchManifest.splitRoutesLevelThree[child];
      if (!grandchildren) return child;
      if (token.length === 3) return `${child}-broad`;
      const grandchild = token.slice(0, 4).padEnd(4, "_");
      return grandchildren.includes(grandchild) ? grandchild : null;
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
        if (!manifest || !manifest.splitRoutes || !manifest.splitRoutesLevelThree || !Array.isArray(manifest.termChunkKeys) || !Number.isInteger(manifest.recordBucketCount)) {
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
      return termChunkCache.getOrLoad(bucket || "missing", () => {
        return bucket ? fetchJson(`./medicine-search/terms/terms-${bucket}.json`, `Search index ${bucket}`) : { terms: [] };
      });
    }

    function loadRecordChunk(bucket) {
      return recordChunkCache.getOrLoad(bucket, () => {
        return fetchJson(`./medicine-search/records/records-${bucket}.json`, `Medicine records ${bucket}`);
      });
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

    const runSearch = debounce(async function (rawQuery, currentRequest) {
      const query = rawQuery.trim();
      const normalizedQuery = normalizeSearchText(query);

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
    }, 250);

    searchInput.addEventListener("input", function () {
      const currentRequest = ++requestSequence;
      if (!this.value.trim()) {
        resultsBox.replaceChildren();
        resultsBox.style.display = "none";
        runSearch("", currentRequest);
        return;
      }
      runSearch(this.value, currentRequest);
    });

    async function searchMedicines(normalizedQuery) {
      const tokens = [...new Set(normalizedQuery.split(" ").filter(Boolean))];
      const chunkKeys = tokens.map(termChunkKey);
      const uniqueChunkKeys = [...new Set(chunkKeys)];
      const chunks = await Promise.all(uniqueChunkKeys.map(loadTermChunk));
      const chunkByKey = new Map(uniqueChunkKeys.map((key, index) => [key, chunks[index]]));
      const tokenCandidateMaps = [];

      tokens.forEach((token, tokenIndex) => {
        const chunk = chunkByKey.get(chunkKeys[tokenIndex]);
        const tokenCandidates = new Map();
        for (const [term, postings] of chunk.terms || []) {
          if (!term.includes(token)) continue;
          const termScore = term === token ? 120 : term.startsWith(token) ? 80 : 40;
          for (const [id, recordBucketId, fieldMask, exactMask, prefixMask] of postings) {
            const candidate = tokenCandidates.get(id) || { id, recordBucketId, fieldMask: 0, exactMask: 0, prefixMask: 0, termScore: 0 };
            candidate.fieldMask |= fieldMask;
            candidate.exactMask |= exactMask;
            candidate.prefixMask |= prefixMask;
            candidate.termScore += termScore;
            tokenCandidates.set(id, candidate);
          }
        }
        const bounded = [...tokenCandidates.values()]
          .sort(comparePostingCandidates)
          .slice(0, searchManifest.clientCandidateLimit);
        tokenCandidateMaps.push(new Map(bounded.map(candidate => [candidate.id, candidate])));
      });

      const anchor = tokenCandidateMaps.reduce((smallest, current) => current.size < smallest.size ? current : smallest, tokenCandidateMaps[0]);
      const candidates = [];
      for (const anchorCandidate of anchor.values()) {
        const candidate = { ...anchorCandidate, tokenMatches: 0 };
        for (const tokenCandidates of tokenCandidateMaps) {
          const match = tokenCandidates.get(candidate.id);
          if (!match) continue;
          candidate.tokenMatches += 1;
          candidate.fieldMask |= match.fieldMask;
          candidate.exactMask |= match.exactMask;
          candidate.prefixMask |= match.prefixMask;
          candidate.termScore += match.termScore;
        }
        candidates.push(candidate);
      }

      const preliminary = candidates
        .sort((left, right) =>
          Number(right.tokenMatches === tokens.length) - Number(left.tokenMatches === tokens.length) ||
          Number(Boolean(right.exactMask & 1)) - Number(Boolean(left.exactMask & 1)) ||
          Number(Boolean(right.prefixMask & 1)) - Number(Boolean(left.prefixMask & 1)) ||
          Number(Boolean(right.exactMask & 2)) - Number(Boolean(left.exactMask & 2)) ||
          Number(Boolean(right.prefixMask & 2)) - Number(Boolean(left.prefixMask & 2)) ||
          right.tokenMatches - left.tokenMatches ||
          Number(Boolean(right.fieldMask & 1)) - Number(Boolean(left.fieldMask & 1)) ||
          Number(Boolean(right.fieldMask & 2)) - Number(Boolean(left.fieldMask & 2)) ||
          right.termScore - left.termScore ||
          left.id - right.id
        )
        .slice(0, searchManifest.detailCandidateLimit);

      const recordBuckets = [...new Set(preliminary.map(candidate => candidate.recordBucketId.toString(16).padStart(4, "0")))];
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

    function comparePostingCandidates(left, right) {
      return Number(Boolean(right.exactMask & 1)) - Number(Boolean(left.exactMask & 1)) ||
        Number(Boolean(right.prefixMask & 1)) - Number(Boolean(left.prefixMask & 1)) ||
        Number(Boolean(right.fieldMask & 1)) - Number(Boolean(left.fieldMask & 1)) ||
        Number(Boolean(right.exactMask & 2)) - Number(Boolean(left.exactMask & 2)) ||
        Number(Boolean(right.prefixMask & 2)) - Number(Boolean(left.prefixMask & 2)) ||
        Number(Boolean(right.fieldMask & 2)) - Number(Boolean(left.fieldMask & 2)) ||
        right.termScore - left.termScore ||
        left.id - right.id;
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
