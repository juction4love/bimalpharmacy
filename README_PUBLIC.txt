================================================================================
BIPRO PharmaOne — Free Retail Pharmacy Management Software
Edition: Public Clean Free Edition
Version: 1.0.0
Platform: Windows x64 (Windows 10 / 11 / Windows Server)
Architecture: Offline Local PostgreSQL Database Engine
================================================================================

ABOUT BIPRO PHARMAONE
---------------------
BIPRO PharmaOne is a keyboard-first, high-performance retail pharmacy management 
and double-entry accounting software system designed specifically for pharmacies 
operating in Nepal.

It runs locally on your PC with full offline capabilities, ensuring fast transaction
speeds, data privacy, and continuous operations without requiring an active internet
connection.


CORE FEATURES
-------------
• Cash Sales & Credit Sales with instant FEFO batch allocations
• Purchase entry with supplier discount and wholesale/retail pack conversion
• Sales & Purchase Returns with exact batch costing traceability
• Cash & Bank Receipts, Supplier Payments, and Operating Expense tracking
• Comprehensive Double-Entry General Ledger, Trial Balance, Profit & Loss, Balance Sheet
• Customer and Supplier Account Statements with transaction drill-down
• Nepali Bikram Sambat (BS) date picker and conversion across all screens
• F1 Quick Calculator with instant decimal financial arithmetic
• Supplier Expiry and Breakage Claim Register with credit note / replacement recovery
• Fast continuous medicine search without mouse dependency
• Enter-first keyboard workflow for high-volume retail billing
• Thermal (58mm / 80mm) and A4 Challan / Bill printing with customizable headers
• Instant verified local PostgreSQL backup and restore tools


SYSTEM REQUIREMENTS
-------------------
• Operating System: 64-bit Windows 10, Windows 11, or Windows Server 2019+
• Processor: x64 compatible processor
• Database: PostgreSQL 17 (must be installed on localhost prior to running setup)
• Storage: Local disk space for application files, PostgreSQL database, and backups


INSTALLATION INSTRUCTIONS
-------------------------
1. Install PostgreSQL 17 for Windows:
   - Download the official PostgreSQL 17 Windows installer from: https://www.postgresql.org/download/windows/
   - Run the PostgreSQL installer with default settings (port 5432, user 'postgres').
   - Keep note of your administrative postgres password.
   - Note: The BIPRO PharmaOne setup requires PostgreSQL to be present before installation begins.

2. Run BIPRO PharmaOne Installer:
   - Download 'BIPRO_PharmaOne_Free_Setup_v1.0.0.exe' from the official GitHub Release (https://github.com/juction4love/bimalpharmacy/releases/tag/v1.0.0) or https://www.bimalpharmacy.com.np/bipro-pharmaone.html.
   - Run 'BIPRO_PharmaOne_Free_Setup_v1.0.0.exe' as Administrator.
   - The installer verifies PostgreSQL presence, copies application binaries, provisions the local database schema, and securely configures credentials in Windows Credential Manager.

3. First-Run Setup:
   - Launch BIPRO PharmaOne from the Desktop shortcut or Start Menu.
   - On first launch, enter your pharmacy name, address, phone number, and optional PAN/DDA details.
   - Your local pharmacy system is immediately ready for use!


DATA SAFETY & BACKUP RESPONSIBILITY
-----------------------------------
All pharmacy business data (medicines, stock, sales, accounts) is stored 100% locally
on your machine inside your local PostgreSQL database. 

It is the sole responsibility of the pharmacy operator to maintain regular backups.
You can create instant backups anytime directly inside BIPRO PharmaOne via 
Settings / Backup or by pressing the Backup button.

We strongly recommend copying your backup files regularly to a secure external USB 
drive or external storage device.


SUPPORT & UPDATES
-----------------
For documentation, user guides, and new releases, visit:
https://bipro.com.np
