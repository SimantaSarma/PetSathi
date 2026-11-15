# Practo for Animals — Discovery & Emergency Care Network

> **A high-trust discovery and emergency platform for veterinary clinics, animal hospitals, boarding, diagnostics, ambulances, and rescue NGOs across India.**

Built as a Staff Product Designer & Senior Front-End Engineer candidate assignment. Adheres strictly to the **Warm Clinical** design system, mobile-first low-end device constraints, WCAG 2.2 AA accessibility standards, and deliberate CTA architecture.

---

## 🚀 Quick Start (Zero Config)

```bash
# 1. Install dependencies
pnpm install

# 2. Run local development server
pnpm dev

# 3. Production build & preview
pnpm build
pnpm preview
```

Open `http://localhost:5173` in any browser or mobile simulator (tested at 390px and 360px viewport widths).

---

## 🏛️ The Five Moments of Animal Discovery

Every screen, hierarchy, and interaction in this directory was architected around one of five specific moments:

1. **EMERGENCY — *"My dog is hurt, who is open right now?"***
   - **Route:** `/emergency` (and compact strip on `/search`)
   - **Design Solution:** Red alert header button on every route. Fast GPS geolocation gate with an 8-second timeout fallback to 6-digit postal pincodes. Lists open 24×7 hospitals and oxygen-fitted ambulances with prominent **≥ 56px one-tap call buttons**. Auto-widens radius from 15 km to 30 km if local coverage is sparse.
2. **PLANNED — *Vaccinations, check-ups, holiday boarding, pathology***
   - **Route:** `/search`, `/provider/:slug`
   - **Design Solution:** Multi-facet filters, indicative fee tables with "confirm with provider" notice, species pictograms, and 24-hour visual timeline bars with live Kolkata time indicators.
3. **RESCUE — *"I found an injured stray dog on the road"***
   - **Route:** `/search?type=ngo&emergency=1`
   - **Design Solution:** Dedicated NGO rescue shelter discovery, street first-aid posts, animal birth control (ABC) tags, and 80G donation badges.
4. **SUPPLY — *A veterinarian or boarding owner wants to list***
   - **Route:** `/list-your-business`
   - **Design Solution:** 4-step stepper (Basics → Services & animals → Hours & contact → Review & verify) with automatic `localStorage` draft saving, "Resume draft" banner, and real-time duplicate check against existing listings.
5. **DATA QUALITY — *A user spots an outdated telephone number or closed clinic***
   - **Global Dialog & Footer:** "Submit a Correction"
   - **Design Solution:** Honeypot-shielded modal, 10–500 character counter, mock image/PDF proof upload (≤ 5 MB), unique reference IDs (e.g., `COR-2041`), and a committed 2-working-day review turnaround. In a directory, **trust is the product**.

---

## 🎯 Strict CTA Hierarchy

| CTA Level | Label / Action | Locations & Rules |
| :--- | :--- | :--- |
| **Primary CTA** | Dynamic by category: *"Find a Vet"*, *"Find a Hospital"*, *"Find Boarding"*, *"Find a Lab"*, *"Find an Ambulance"*, *"Find an NGO"*. On listings: **"Call"**. | **One filled primary button per viewport region** (moss-700 fill, white text). |
| **Secondary CTAs** | *"Directions"* (Google Maps turn-by-turn), *"WhatsApp"* (direct prefilled enquiry), *"Explore Services"*. | Sand-100 or outline buttons; never competing with primary. |
| **Supply CTA** | *"List Your Business"* | Header outline, home hero band, and footer. |
| **Data Quality CTA** | *"Submit a Correction"* | Present on every provider card, detail page, and global footer. |
| **Emergency CTA** | Red *"Emergency"* button | **Header of every route** (the single permitted system exception). |

Every CTA is instrumented with a structured `track(event, props)` console stub and persisted to `sessionStorage` for inspection on `/about-prototype`.

---

## 🎨 Design System: "Warm Clinical"

Implemented via custom Tailwind tokens and CSS custom properties:

```css
/* Color Tokens (Contrast Verified ≥ 4.5:1) */
--color-paper:        #FAF7F2; /* Page background */
--color-surface:      #FFFFFF; /* Elevated cards */
--color-sand-100:     #F2EDE4; /* Secondary surfaces & chips */
--color-sand-200:     #E6DFD2; /* Decorative dividers only */
--color-ink-900:      #16211F; /* High-contrast text */
--color-ink-700:      #3E4A47; /* Body & headings */
--color-ink-500:      #5B6865; /* Metadata */
--color-ink-400:      #7C8985; /* Input borders (≥ 3:1) */
--color-moss-800:     #0A4A3C;
--color-moss-700:     #0D5C4B; /* Primary brand */
--color-moss-600:     #11705B;
--color-moss-100:     #DDF0E9;
--color-moss-50:      #EEF8F4;
--color-saffron-500:  #F2A93B; /* Accent fill (ink-900 text only) */
--color-saffron-100:  #FDEFD3;
--color-alert-700:    #B3261E; /* Emergency fill (white text) */
--color-alert-100:    #FCE8E6;
--color-amber-800:    #7A4B00; /* "Closing soon" text */
--color-amber-100:    #FFF1D6; /* "Closing soon" surface */
```

### Typography Scale
- **H1–H3 Display:** `Fraunces 600` (Google Fonts, display=swap, preconnect; fallback Georgia). Fluid clamp: `clamp(2.25rem, 5vw, 3.75rem)` at 1.05 line-height.
- **UI & Body:** `Figtree 400/500/600/700` (fallback system-ui). Body 1rem/1.6, mobile inputs strictly 16px to prevent iOS auto-zoom.
- **Tabular Figures:** Prices, distances, and hours formatted with `tabular-nums`.

---

## 🧪 16 Comprehensive Data Edge Cases

All fictional providers across Bengaluru, Mumbai, and Delhi NCR demonstrate specific real-world edge cases:

1. **24×7 hospital with separate OPD hours:** *Sanjivani 24×7 Multi-Speciality Animal Hospital* (`prov-01`)
2. **Clinic closed right now:** *Maruti Pet Care & Vaccination Centre* (`prov-02`)
3. **Night clinic 8 pm–2 am:** *Nocturn Urgent Animal Night Care Clinic* (`prov-03`, overnight schedule support)
4. **Boarding with zero reviews:** *Whiskers & Bark Haven* (`prov-04`, shows "New" badge)
5. **NGO accepting donations:** *Jeev Raksha Stray & Wildlife Welfare Trust* (`prov-05`, 80G tax exemption)
6. **Unverified community listing with no hours:** *Shri Krishna Community First Aid Post* (`prov-06`, "Hours not listed")
7. **Listing with no phone:** *South Delhi Canine Hydrotherapy* (`prov-07`, hides Call button, shows "Phone not listed · Submit a Correction")
8. **70+ character facility name:** *Shrimati Shantabai Patil Memorial Charitable Super-Speciality Hospital...* (`prov-08`, 2-line clamp test)
9. **Temporarily closed:** *Bark & Purr Holistic Pet Wellness* (`prov-09`)
10. **Permanently closed:** *Apex Veterinary Poly Clinic* (`prov-10`, excluded from search results; direct URL renders alert banner with alternatives)
11. **Ambulance with coverage radius:** *Pashu Rakshak 24×7 Ambulance* (`prov-11`, 30 km radius, oxygen-fitted)
12. **Mobile large-animal vet:** *Gramin Pashu Seva Mobile Bovine Clinic* (`prov-12`, farm visits for livestock)
13. **Exotic-birds specialist:** *Dr. Choksi Avian & Exotic Clinic* (`prov-13`, parrots, rabbits, reptiles)
14. **40+ services listing:** *National Animal Diagnostics Centre* (`prov-14`, 42 pathology services with live search)
15. **Listing with no photos:** *Sharma Animal Dispensary* (`prov-15`, tonal pictogram fallback)
16. **Home-visit vet:** *Dr. Anjali Sen Doorstep Veterinary Services* (`prov-16`)

---

## 🛠️ Interactive Demo Controls on `/about-prototype`

Evaluators can test operational mechanics live without altering system clocks:
- **Time Override:** Toggle between Live IST, 10:00 am (Standard morning), 09:00 pm (Closing soon), and 02:00 am (Night triage).
- **City Switcher:** Switch between Bengaluru, Mumbai, and Delhi NCR.
- **Network Simulation:** Toggle Online / Offline mode (tests cached listings and vector SVG map fallback).
- **Latency Slider:** Simulate 0ms, 300ms, and 1000ms delay to inspect zero layout-shift skeleton shimmers.
- **Live Telemetry Stream:** Inspect all `track()` events recorded during your session.

---

## ♿ Quality Bars & Accessibility

- **WCAG 2.2 AA Contrast:** All color pairs verified ≥ 4.5:1. Never conveys status by color alone (always icon + text).
- **Keyboard Navigation:** Full tab-through sequence, visible `moss-700` focus ring with white offset, skip link (`Skip to main content`).
- **Touch Targets:** All clickable actions ≥ 44×44px; emergency call buttons ≥ 56px.
- **Performance:** Route-level code splitting (`React.lazy`), initial gzipped JS bundle only **113 kB** (under 250 kB target).
- **SEO & Structured Data:** `VeterinaryCare` JSON-LD Schema.org injected on provider profiles.
