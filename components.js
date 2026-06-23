// --- Header & Navigation Component ---
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="branding-header">
        <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 20px; width: 100%;">
          <div class="logo-container">
            <img src="logo.svg" alt="Bimal Pharmacy Logo">
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
          <li><a href="about.html">हाम्रो बारेमा</a></li>
          <li><a href="medical-guide.html">औषधी गाइड</a></li>
          <li><a href="knowledge.html">स्वास्थ्य ज्ञान</a></li>
          <li><a href="service.html">सेवाहरू</a></li>
          <li><a href="contact.html">सम्पर्क</a></li>
        </ul>
      </nav>
    `;

    // Automatically add the 'active' class to the current page's link
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

// --- Footer Component ---
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <p><strong>बिमल फार्मेसी</strong> | भरतपुर-७, चितवन, नेपाल</p>
        <div class="footer-links" style="margin-top: 15px;">
          <a href="index.html">गृहपृष्ठ</a> | 
          <a href="privacy-policy.html">Privacy Policy</a> | 
          <a href="disclaimer.html">Disclaimer</a> | 
          <a href="contact.html">Contact Us</a>
        </div>
        <p style="margin-top: 20px; opacity: 0.7;">© 2026 बिमल फार्मेसी। सबै अधिकार सुरक्षित।</p>
        <p style="font-size: 0.7rem; color: #666;">Design & Developed by: Bimal Lamichhane (Google Developer)</p>
      </footer>

      <a href="https://wa.me/9779855065327" class="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
        <i class="fab fa-whatsapp"></i>
      </a>
    `;
  }
}
customElements.define('site-footer', SiteFooter);