# 🏥 बिमल फार्मेसी | BIMAL PHARMACY - Official Website

[![Website Status](https://img.shields.io/badge/Status-Live-brightgreen)](https://juction4love.github.io/bimalpharmacy)
[![DDA Reg](https://img.shields.io/badge/DDA%20Reg-१७२२३%2F२०६३-blue)](https://www.bimalpharmacy.com.np)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **"तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता"**  
> Official responsive website for **Bimal Pharmacy**, located in Bharatpur-7, Chitwan, Nepal.  
> Serving cancer patients with quality medicines, cold-chain storage, and compassionate care for **20+ years**.

---

## 🌐 Live Website

🔗 **[https://juction4love.github.io/bimalpharmacy](https://juction4love.github.io/bimalpharmacy)**  
🔗 **[https://www.bimalpharmacy.com.np](https://www.bimalpharmacy.com.np)**

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Medicine Search** | Information-only filtering by brand, generic name, strength, and category |
| 📱 **Android Ordering** | Customer medicine orders are completed through the Bimal Pharmacy Android app |
| 📵 **No-Call Policy** | Explicit warnings — voice calls not accepted to maintain pharmacy operations |
| 📢 **Sticky Notice Bar** | Urgent scrolling marquee for important announcements |
| ⚠️ **Payment Notice** | Dedicated page (`notice.html`) for clearing outstanding credit (बक्यौता रकम) |
| 🧊 **Cold Chain** | 2°C–8°C refrigerated storage for cancer injections |
| 🚚 **Home Delivery** | Safe, discreet delivery within Bharatpur and major Nepal cities |
| 🛡️ **IME Life Insurance** | Official agent — Bimal Lamichhane for life insurance consultation |
| 🌙 **Dark Mode** | Automatic dark/light mode based on system preference |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop |

---

## 📂 Project Structure
bimalpharmacy/
├── index.html # Homepage with medicine search & features
├── about.html # About Bimal Lamichhane & pharmacy mission
├── medical-guide.html # Medicine usage guide (antibiotics, oncology, diagnostics)
├── knowledge.html # Health & insurance knowledge center
├── service.html # List of healthcare services provided
├── emergency.html # Emergency contacts, first aid & blood donors
├── insurance.html # IME Life Insurance guide & premium calculator
├── notice.html # Urgent credit payment notice with QR codes
├── order.html # Android app ordering guide
├── vendor-order.html # Smart supplier purchase order slip with WhatsApp sharing
├── contact.html # Location and phone contacts
├── thanks.html # Thank you page after form submission
├── privacy-policy.html # Privacy policy
├── disclaimer.html # Medical disclaimer
├── terms.html # Terms of service
├── style.css # Complete design system (2200+ lines)
├── script.js # Search, back-to-top, lazy loading & UX scripts
├── components.js # Reusable header, footer & mobile nav components
├── logo.svg # Pharmacy logo
├── medicine-search/ # Generated lazy-loaded public search index
├── tools/build-medicine-index.py # Reproducible catalogue generator
├── robots.txt # SEO robots file
├── sitemap.xml # XML sitemap
├── ads.txt # Google AdSense verification
├── CNAME # Custom domain config
├── SECURITY.md # Security policy
└── README.md # Project documentation

---

## 🛠 Tech Stack

| Technology | Usage |
|------------|-------|
| **HTML5** | Semantic, accessible markup |
| **CSS3** | Glassmorphism design, CSS variables, animations, dark mode |
| **JavaScript (Vanilla)** | Search, components, form handling, PDF generation |
| **Font Awesome 6** | Icons throughout the site |
| **jsPDF** | Client-side PDF generation for vendor orders |
| **Formspree** | Contact form backend |
| **GitHub Pages** | Free hosting & deployment |

## 🔄 Rebuilding the Medicine Search Index

The public search index is generated from the canonical medicine catalog in the local `data/` folder. Source databases and raw source unions are build inputs and are intentionally excluded from Git because they contain redundant and source-only fields. The generated `medicine-search/` directory is required by the static website and is committed.

From the repository root, run:

```powershell
python tools/build-medicine-index.py
```

The standard-library-only generator validates the available catalogs, selects the newest intact canonical version, normalizes public medicine fields, excludes prices/importer/internal source data, and writes deterministic term and detail shards plus `manifest.json` and `build-report.json`. Run it twice and confirm the second run produces no Git diff before publishing.

---

## 🎨 Design System

- **Colors:** Emerald Green (`#10b981`), Medical Blue (`#0ea5e9`), Amber (`#f59e0b`), Red (`#ef4444`)
- **Typography:** Mukta (body), Poppins (headings)
- **Effects:** Glassmorphism cards, hover lift animations, smooth gradients
- **Dark Mode:** Automatic based on `prefers-color-scheme`
- **Responsive:** Breakpoints at 1024px, 768px, 480px

---

## 📞 Contact & Inquiries

| Method | Detail |
|--------|--------|
| 📞 **Landline** | 056-593288 |
| 📍 **Location** | Bharatpur-7, Cancer Hospital Road, Chitwan, Nepal |
| 🏥 **Nearby** | B.P. Koirala Memorial Cancer Hospital |
| 📋 **DDA Reg No** | १७२२३/२०६३ |

> Customer medicine ordering is available through the **Bimal Pharmacy Android app**. The website medicine search provides information only.

---

## 👨‍⚕️ About the Founder

**Bimal Lamichhane** — Pharmacist, Google Developer (Flutter Expert), and IME Life Insurance Agent.  
20+ years of service with over **40 लाख+** in humanitarian medicine credit support for cancer patients.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **B.P. Koirala Memorial Cancer Hospital** — for collaboration in patient care
- **IME Life Insurance** — for trusted insurance partnership
- **Dr. Lal PathLabs** — for outsourced diagnostic services
- All our **10,000+ satisfied patients** who trust Bimal Pharmacy

---

<p align="center">
  <strong>© 2026 बिमल फार्मेसी | Managed by Bimal Lamichhane</strong><br>
  <em>"सेवा नै परमो धर्म"</em>
</p>
