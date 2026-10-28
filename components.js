// =========================================
// BIMAL PHARMACY - COMPONENTS SYSTEM
// =========================================
//
// ── ANALYTICS & TRACKING INTEGRATION POINTS ──────────────────────────────────
//
// STEP 1 — Google Search Console verification
//   After GSC ownership is verified, add the meta tag to each page <head> OR
//   inject it from this file by appending to document.head once per page.
//   Owner action: go to search.google.com/search-console → verify via HTML tag →
//   copy the content="..." value and replace OWNER_VERIFICATION_TOKEN below.
//
// const gscMeta = document.createElement('meta');
// gscMeta.name = 'google-site-verification';
// gscMeta.content = 'OWNER_VERIFICATION_TOKEN';  // ← replace with real token
// document.head.appendChild(gscMeta);
//
// STEP 2 — Google Tag Manager (recommended: manages GA4 + Ads via one snippet)
//   Owner action: create container at tagmanager.google.com → copy GTM-XXXXXX →
//   replace GTM_CONTAINER_ID below → uncomment both blocks.
//
// (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),
// event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),
// dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
// 'https://www.googletagmanager.com/gtm.js?id='+i+dl;
// f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM_CONTAINER_ID');
//
// After the GTM head snippet is active, configure these tags INSIDE GTM:
//   • GA4 Configuration tag  (Measurement ID: G-XXXXXXXXXX)
//   • Google Ads Conversion Linker
//   • Google Ads Conversion tag  (Conversion ID: AW-XXXXXXXXXX, Label: ...)
//   • Event tags: page_view, search (medicine search), cta_click, download_click
//
// STEP 3 — GTM body noscript (paste at top of <body> in each page, or via this file)
// const gtmNs = document.createElement('noscript');
// const gtmIframe = document.createElement('iframe');
// gtmIframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM_CONTAINER_ID';
// gtmIframe.height = '0'; gtmIframe.width = '0';
// gtmIframe.style.cssText = 'display:none;visibility:hidden';
// gtmNs.appendChild(gtmIframe);
// document.body.prepend(gtmNs);
//
// NOTE: Do NOT load GA4 directly AND via GTM — that creates duplicate events.
//       Use GTM as the single entry point for all Google tags.
//
// ─────────────────────────────────────────────────────────────────────────────

// --- Header & Navigation Component ---
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="branding-header">
        <a href="index.html" class="header-logo-link">
          <div class="logo-container">
            <img src="logo.svg" alt="Bimal Pharmacy Logo">
          </div>
          <div class="brand-text">
            <div class="site-name">बिमल फार्मेसी</div>
            <p>गुणस्तरीय औषधी र भरपर्दो सेवा | भरतपुर-७, चितवन</p>
          </div>
        </a>
        <button class="hamburger-toggle" id="hamburgerBtn" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNav">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <nav class="navbar" id="mainNav" aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="index.html">गृहपृष्ठ</a></li>
          <li><a href="medical-guide.html">औषधी गाइड</a></li>
          <li><a href="knowledge.html">स्वास्थ्य ज्ञान</a></li>
          <li><a href="service.html">सेवाहरू</a></li>
          <li><a href="/bipro-pharmaone">BIPRO PharmaOne</a></li>
          <li><a href="about.html">हाम्रो बारेमा</a></li>
          <li><a href="emergency.html">आकस्मिक सेवा</a></li>
          <li><a href="insurance.html">बीमा सुविधा</a></li>
          <li><a href="notice.html">सूचना</a></li>
          <li><a href="order.html">अर्डर गर्नुहोस्</a></li>
          <li><a href="contact.html">सम्पर्क</a></li>
        </ul>
      </nav>

      <div class="drawer-overlay" id="drawerOverlay" aria-hidden="true"></div>
    `;

    // Auto-highlight active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const cleanCurrent = currentPage.replace(/\.html$/, '') || 'index';
    const navLinks = this.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const cleanHref = href.split('/').pop().replace(/\.html$/, '');
      if (cleanHref === cleanCurrent) {
        link.classList.add('active');
      }
    });

    // Hamburger Menu Toggle
    const hamburger = this.querySelector('#hamburgerBtn');
    const nav = this.querySelector('#mainNav');
    const overlay = this.querySelector('#drawerOverlay');

    function openDrawer() {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      nav.classList.add('open');
      overlay.classList.add('active');
      document.body.classList.add('drawer-open');
    }

    function closeDrawer() {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      overlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    if (hamburger && nav && overlay) {
      hamburger.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      overlay.addEventListener('click', closeDrawer);

      // Close drawer when a nav link is clicked
      navLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
      });

      // Close drawer on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          closeDrawer();
          hamburger.focus();
        }
      });
    }
  }
}
customElements.define('site-header', SiteHeader);


// --- Footer Component ---
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer-brand">
          <strong>बिमल फार्मेसी</strong><br>
          भरतपुर-७, चितवन | DDA दर्ता नं: १७२२३/२०६३
        </div>
        <div class="footer-links">
          <a href="index.html">गृहपृष्ठ</a>
          <span class="footer-separator">|</span>
          <a href="/bipro-pharmaone">BIPRO PharmaOne</a>
          <span class="footer-separator">|</span>
          <a href="about.html">About Us</a>
          <span class="footer-separator">|</span>
          <a href="privacy-policy.html">Privacy Policy</a>
          <span class="footer-separator">|</span>
          <a href="terms.html">Terms</a>
          <span class="footer-separator">|</span>
          <a href="disclaimer.html">Disclaimer</a>
          <span class="footer-separator">|</span>
          <a href="contact.html">Contact Us</a>
        </div>
        <p class="footer-copy">© 2026 बिमल फार्मेसी | Managed by: Bimal Lamichhane</p>
      </footer>

      <nav class="mobile-nav">
        <a href="index.html" class="nav-item"><i class="fas fa-home"></i><span>होम</span></a>
        <a href="medical-guide.html" class="nav-item"><i class="fas fa-book-medical"></i><span>गाइड</span></a>
        <a href="order.html" class="nav-item"><i class="fas fa-shopping-cart"></i><span>अर्डर</span></a>
        <a href="emergency.html" class="nav-item"><i class="fas fa-ambulance"></i><span>Emergency</span></a>
        <a href="contact.html" class="nav-item"><i class="fas fa-phone"></i><span>सम्पर्क</span></a>
      </nav>
      <button id="backToTop" title="Back to top" aria-label="Back to top">&#8679;</button>
    `;

    // Auto-highlight active link for mobile nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const cleanCurrent = currentPage.replace(/\.html$/, '') || 'index';
    const mobileLinks = this.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const cleanHref = href.split('/').pop().replace(/\.html$/, '');
      if (cleanHref === cleanCurrent) {
        link.classList.add('active');
      }
    });

    // Back to Top Button Functionality
    const backToTopBtn = this.querySelector('#backToTop');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
      });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}
customElements.define('site-footer', SiteFooter);

