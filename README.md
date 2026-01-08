# बिमल फार्मेसी - Medicine Search Website

This repository hosts the **medicine search website** for **Bimal Pharmacy**, Bharatpur-7, Chitwan, Nepal. The website is designed to be **fully Google-indexable**, **SEO optimized**, and provides a **dynamic search experience** for users while keeping all medicines crawlable by search engines.

---

## 📌 Features

- **Google Indexable**: Preloaded HTML fallback (`<noscript>`) ensures all medicines are crawlable.
- **SEO Optimized**: Meta tags, descriptions, structured data (Schema.org for Pharmacy).
- **Dynamic Instant Search**: Search medicines by name, dosage, or other attributes in real-time.
- **Responsive Design**: Mobile-friendly and modern UI.
- **Modal Product Details**: View full medicine details, including price, form, and dosage.
- **WhatsApp & Call Integration**: Directly contact Bimal Pharmacy via WhatsApp or phone.
- **Preloaded Medicines**: Medicines can be loaded from XLSX or JSON file.

---

## 🛠 Technologies Used

- **HTML5 / CSS3**: Semantic markup and responsive styling.
- **JavaScript**: Instant search, modal details, dynamic WhatsApp link generation.
- **XLSX.js**: Load medicines from Excel for dynamic search.
- **Schema.org**: Structured data markup for pharmacy SEO.
- **Google-friendly**: Includes `<noscript>` fallback for search engine crawling.

## ⚡ Usage

1. Clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/bimalpharmacy.git
---

## 🏗 Project Structure
/ ├── index.html           # Homepage ├── search.html          # Medicine search page (main feature) ├── contact.html         # Contact page ├── styles.css           # Optional separate CSS ├── medicines.xlsx       # Source medicine data ├── README.md            # Project documentation └── assets/ ├── bluesky.png      # Background image └── ...other assets