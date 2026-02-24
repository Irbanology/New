# SEO Checklist — WibeIt (2026 Standards)

Use this list to track implementation and ongoing tasks. Items marked **Done** are implemented in the codebase; **You do** are actions for you (e.g. in Google Search Console).

---

## 1. Crawlability & Indexing

| Task | Status | Notes |
|------|--------|--------|
| **XML Sitemaps** | Done | `sitemap.xml` includes all canonical pages (home, privacy_policy, legal, faqs, child_safety, child_policy). Only indexable URLs; no 404s or redirects. |
| **Submit sitemap** | You do | Submit `https://wibeit.co/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters). |
| **Robots.txt** | Done | Configured with `Allow: /`, explicit `Allow` for `/css/`, `/js/`, `/images/`. Only `Disallow: /private/`. Sitemap URL included. |
| **Indexing issues (GSC)** | You do | In GSC → **Pages**, fix any "Crawled - currently not indexed" or "Blocked by robots.txt". |
| **Index bloat** | Done | No low-value/duplicate pages in sitemap. Verification file `googlecfcec5c73d7ae950.html` is not in sitemap (keep crawlable for verification). |
| **Orphan pages** | Done | All pages linked: **Child Policy** added to footer on every page; Legal, Privacy, FAQs, Child Safety already linked. |

---

## 2. Website Architecture & Structure

| Task | Status | Notes |
|------|--------|--------|
| **Logical hierarchy** | Done | Flat structure: home + 5 inner pages (all within 1–2 clicks). |
| **Breadcrumbs** | Done | Visible breadcrumb nav + **BreadcrumbList** JSON-LD on legal, privacy_policy, faqs, child_safety, child_policy. |
| **Internal linking** | Done | Footer links on all pages; primary nav links to index sections; Child Policy linked in foot-legal. |
| **URL structure** | Done | Clean, descriptive URLs with hyphens (e.g. `privacy_policy.html`, `child_safety.html`). |
| **HTTPS** | You do | Ensure the live site is served over HTTPS (hosting/SSL configuration). |

---

## 3. Page Experience & Core Web Vitals (2026)

| Task | Status | Notes |
|------|--------|--------|
| **LCP (≤2.5s)** | Done | Hero image preloaded (`<link rel="preload" href="images/Splash.png" as="image">`); LCP image has `fetchpriority="high"`. |
| **INP (≤200ms)** | Done | Minimal JS; no heavy blocking. Monitor in GSC / PageSpeed Insights. |
| **CLS (<0.1)** | Done | Images have explicit `width` and `height` (hero, logos, footer, showcase, social icons, mail). |
| **Mobile-friendly** | Done | Responsive layout; viewport meta; mobile nav. Content and links match desktop. |
| **No intrusive interstitials** | Done | No full-page pop-ups covering main content. |

---

## 4. Technical Content & Meta

| Task | Status | Notes |
|------|--------|--------|
| **Canonical tags** | Done | Self-referencing canonicals on all pages: `index` → `https://wibeit.co/`, others → `https://wibeit.co/<page>.html`. |
| **Duplicate content** | You do | Enforce one canonical host (www vs non-www, HTTP→HTTPS) via server redirects. |
| **Unique Title & Meta Description** | Done | Every page has a unique, descriptive title and meta description (under ~160 chars). |
| **Broken links** | You do | Periodically check internal and external links (e.g. store URLs, docs PDFs). |
| **Redirect chains** | You do | In hosting/CDN, point any redirects directly to final URL (avoid A→B→C). |

---

## 5. Advanced Technical SEO (2026)

| Task | Status | Notes |
|------|--------|--------|
| **Structured Data (Schema)** | Done | **Organization**, **WebSite**, **MobileApplication**, **FAQPage** (index); **BreadcrumbList** on all inner pages. |
| **Validate schema** | You do | Use [Google Rich Results Test](https://search.google.com/test/rich-results) on key URLs. |
| **JavaScript rendering** | Done | Content is in initial HTML; no SPA/framework that hides content from crawlers. |
| **Hreflang** | N/A | Single language (en); add hreflang if you add more languages. |
| **AI-friendly formatting** | Done | Clear headings (h1/h2/h3), lists, and structure. Consider BLUF in key policy/FAQ sections if you expand content. |
| **Image optimization** | Partial | Dimensions and `loading="lazy"` on below-fold images. **You do:** compress images; consider WebP/AVIF and `<picture>` for critical images. |

---

## Quick reference

- **Sitemap:** `https://wibeit.co/sitemap.xml`
- **Canonical base:** `https://wibeit.co/`
- **Submit to:** [Google Search Console](https://search.google.com/search-console) · [Bing Webmaster Tools](https://www.bing.com/webmasters)
- **Schema validation:** [Rich Results Test](https://search.google.com/test/rich-results)
