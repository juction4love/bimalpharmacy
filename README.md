# 🏥 बिमल फार्मेसी | BIMAL PHARMACY - Official Website

[![Website Status](https://img.shields.io/badge/Status-Live-brightgreen)](https://www.bimalpharmacy.com.np)
[![DDA Reg](https://img.shields.io/badge/DDA%20Reg-१७२२३%2F२०६३-blue)](https://www.bimalpharmacy.com.np)
[![BIPRO License](https://img.shields.io/badge/BIPRO%20License-EULA-blue)](LICENSE.txt)

> **"तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता"**  
> Official responsive website for **Bimal Pharmacy**, located in Bharatpur-7, Chitwan, Nepal.  
> Serving cancer patients with quality medicines, cold-chain storage, and compassionate care for **20+ years**.

---

## 🌐 Live Website

🔗 **[https://www.bimalpharmacy.com.np](https://www.bimalpharmacy.com.np)**

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Medicine Search** | Information-only filtering by brand, generic name, strength, and category |
| 💻 **[BIPRO PharmaOne](https://www.bimalpharmacy.com.np/bipro-pharmaone.html)** | Free Windows pharmacy management software with sales, purchase, inventory, accounting, BS dates, expiry tracking and reports |
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

## 💻 BIPRO PharmaOne Free

BIPRO PharmaOne is a free Windows desktop pharmacy management and accounting application for local/offline single-PC use.

- **Product Page:** [https://www.bimalpharmacy.com.np/bipro-pharmaone.html](https://www.bimalpharmacy.com.np/bipro-pharmaone.html)
- **Current Version:** `v1.0.0`
- **Official GitHub Release:** [v1.0.0 Release](https://github.com/juction4love/bimalpharmacy/releases/tag/v1.0.0)
- **Installer Download:** [`BIPRO_PharmaOne_Free_Setup_v1.0.0.exe`](https://github.com/juction4love/bimalpharmacy/releases/download/v1.0.0/BIPRO_PharmaOne_Free_Setup_v1.0.0.exe)
- **Installer Size:** `76,313,415 bytes` (~72.78 MB)
- **SHA-256 Checksum:** `7C558F6465749B33A5E6DA365C4B197F3ADB7E1ACA425175777D8373EB19B0CC`
- **System Prerequisite:** PostgreSQL 17 must be installed locally before running the BIPRO PharmaOne installer.
- **Database & Architecture:** Uses local PostgreSQL storage; normal daily operation is 100% offline.
- **Document Terminology:** Current sales documents are **CHALLAN**. *(Note: Not an IRD-approved, DDA-approved, CBMS-certified, government-approved, or authorized tax invoice system).*

---

## 📂 Project Structure

```text
bimalpharmacy/
├── index.html                    # Homepage with medicine search & features
├── about.html                    # About Bimal Lamichhane & pharmacy mission
├── bipro-pharmaone.html          # BIPRO PharmaOne product/download page
├── medical-guide.html            # Medicine usage guide (antibiotics, oncology, diagnostics)
├── knowledge.html                # Health & insurance knowledge center
├── service.html                  # List of healthcare services provided
├── emergency.html                # Emergency contacts, first aid & blood donors
├── insurance.html                # IME Life Insurance guide & premium calculator
├── notice.html                   # Urgent credit payment notice with QR codes
├── order.html                    # Android app ordering guide
├── vendor-order.html             # Smart supplier purchase order slip with WhatsApp sharing
├── contact.html                  # Location and phone contacts
├── thanks.html                   # Thank you page after form submission
├── privacy-policy.html           # Privacy policy
├── disclaimer.html               # Medical disclaimer
├── terms.html                    # Terms of service
├── README_PUBLIC.txt             # BIPRO public installation documentation
├── LICENSE.txt                   # BIPRO PharmaOne end-user license agreement
├── SHA256SUMS.txt                # BIPRO release integrity checksums
├── style.css                     # Complete design system
├── script.js                     # Search, back-to-top, lazy loading & UX scripts
├── components.js                 # Reusable header, footer & mobile nav components
├── logo.svg                      # Pharmacy logo
├── medicine-search/              # Generated lazy-loaded public search index
├── functions/                    # Cloudflare Pages Functions
│   └── api/order.js              # Order dispatch backend endpoint
├── tools/build-medicine-index.py # Reproducible catalogue generator
├── tools/test-medicine-index.py  # Medicine search index regression suite
├── robots.txt                    # SEO robots file
├── sitemap.xml                   # XML sitemap
├── ads.txt                       # Google AdSense verification
├── CNAME                         # Custom domain config
├── SECURITY.md                   # Security policy
└── README.md                     # Project documentation
```

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
| **Cloudflare Pages** | Production website deployment and edge functions |
| **GitHub** | Source code repository |
| **GitHub Releases** | BIPRO PharmaOne installer distribution |

---

## 🔄 Rebuilding the Medicine Search Index

The public search index is generated from the canonical medicine catalog in the local `data/` folder. Source databases and raw source unions are build inputs and are intentionally excluded from Git because they contain redundant and source-only fields. The generated `medicine-search/` directory is required by the static website and is committed.

From the repository root, run:

```powershell
python tools/build-medicine-index.py
```

The standard-library-only generator validates the available catalogs, selects the newest intact canonical version, normalizes public medicine fields (including compact strength units such as `500mg`), excludes prices/importer/internal source data, and writes deterministic search assets. Large term groups are adaptively split from two to three or four characters, broad short queries use bounded summaries, and final ranking reads small 64-record detail blocks. The browser keeps bounded Promise/LRU caches so sequential queries reuse parsed shards without retaining the full catalogue. Run the generator twice and confirm the second run produces no Git diff before publishing.

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

## 📜 License Information

- **BIPRO PharmaOne Application:** Distributed under the **BIPRO PharmaOne End User License Agreement** — see [`LICENSE.txt`](LICENSE.txt) for terms of use.
- **Website Content & Source:** Managed by Bimal Pharmacy.

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
