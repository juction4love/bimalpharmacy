class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="branding-header">
        <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 20px; width: 100%;">
          <div class="logo-container">
            <img src="https://raw.githubusercontent.com/juction4love/bimalpharmacy/7f3b99114723f8e765d48999f353830f21cbcce3/logo.svg" alt="Bimal Pharmacy Logo">
          </div>
          <div class="brand-text">
            <h1 style="color: var(--primary);">बिमल फार्मेसी</h1>
            <p style="color: #555;">गुणस्तरीय औषधी र भरपर्दो सेवा | भरतपुर-७, चितवन</p>
          </div>
        </a>
      </header>

      <nav class="navbar">
        <ul class="nav-links">
          <li><a href="index.html">गृहपृष्ठ</a></li>
          <li><a href="medical-guide.html">औषधी गाइड</a></li>
          <li><a href="knowledge.html">स्वास्थ्य ज्ञान</a></li>
          <li><a href="service.html">सेवाहरू</a></li>
          <li class="dropdown">
            <a href="#" aria-haspopup="true" aria-expanded="false">थप जानकारी <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></a>
            <ul class="dropdown-content">
              <li><a href="about.html">हाम्रो बारेमा</a></li>
              <li><a href="emergency.html">आकस्मिक सेवा</a></li>
              <li><a href="insurance.html">बीमा सुविधा</a></li>
              <li><a href="notice.html">सूचना</a></li>
            </ul>
          </li>
          <li><a href="order.html">अर्डर गर्नुहोस्</a></li>
          <li><a href="contact.html">सम्पर्क</a></li>
        </ul>
      </nav>
    `;

    // Auto-highlight active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = this.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }
}
customElements.define('site-header', SiteHeader);

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <strong>बिमल फार्मेसी</strong><br>
        भरतपुर-७, चितवन | DDA दर्ता नं: १७२२३/२०६३<br>
        <div class="footer-links">
          <a href="index.html">गृहपृष्ठ</a> | 
          <a href="about.html">About Us</a> | 
          <a href="privacy-policy.html">Privacy Policy</a> | 
          <a href="disclaimer.html">Disclaimer</a> | 
          <a href="contact.html">Contact Us</a>
        </div>
        <p>© 2026 बिमल फार्मेसी | Managed by: Bimal Lamichhane</p>
      </footer>

      <nav class="mobile-nav">
        <a href="index.html" class="nav-item"><i class="fas fa-home"></i> होम</a>
        <a href="medical-guide.html" class="nav-item"><i class="fas fa-book-medical"></i> गाइड</a>
        <a href="order.html" class="nav-item"><i class="fas fa-shopping-cart"></i> अर्डर</a>
        <a href="emergency.html" class="nav-item"><i class="fas fa-ambulance"></i> Emergency</a>
        <a href="contact.html" class="nav-item"><i class="fas fa-phone"></i> सम्पर्क</a>
      </nav>

      <a href="https://wa.me/9779855065327" class="whatsapp-float" target="_blank" aria-label="WhatsApp">
        <i class="fab fa-whatsapp"></i>
      </a>
      <button id="backToTop" title="Back to top">&#8679;</button>
    `;

    // Auto-highlight active link for mobile nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const mobileLinks = this.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }
}
customElements.define('site-footer', SiteFooter);
