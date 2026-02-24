# Broken Links & Indexing Report

**Checked:** All HTML pages, sitemap, robots.txt, canonicals, meta robots.

---

## 1. Broken Links

### 🔴 Confirmed broken (will 404)

| Page | Link | Issue |
|------|------|--------|
| **privacy_policy.html** | `docs/privacy_policy.pdf` | No `docs/` folder in project; file does not exist |
| **child_safety.html** | `docs/child_safety.pdf` | Same |
| **child_policy.html** | `docs/childpolicy.pdf` | Same |
| **faqs.html** | `docs/faqs.pdf` | Same |

**Fix applied:** These “Download PDF” links have been changed to **mailto:support@wibeit.co** with a subject line so users can request the PDF. No more 404s. When you add the PDFs under `docs/`, you can switch the links back to the files.

### ✅ Internal links verified

- **Anchors on index:** `#home`, `#about`, `#how`, `#features`, `#showcase`, `#contact`, `#main-content` — all exist on index.html.
- **Policy pages:** `#policy` exists on privacy_policy, child_safety, child_policy, legal. faqs.html uses `#faq` (exists).
- **Cross-page:** `index.html`, `index.html#home`, `faqs.html`, `privacy_policy.html`, `child_safety.html`, `child_policy.html`, `legal.html` — all target existing files.
- **Assets:** `css/styles.css`, `js/script.js`, `images/...` — paths are correct (ensure image files exist in `images/` and `docs/` if you restore PDF links).

### ⚠️ Misleading (not broken)

- **“Blog”** in footer links to `index.html#home` or `#home`. There is no blog page. Consider removing the link or pointing to a “Coming soon” / blog URL when you have one.

---

## 2. Indexing Status

### ✅ Correct setup

| Item | Status |
|------|--------|
| **robots.txt** | `Allow: /`; `Disallow: /private/`; `Sitemap: https://wibeit.co/sitemap.xml` |
| **index.html** | `robots: index, follow`; canonical `https://wibeit.co/` |
| **privacy_policy.html** | `robots: index, follow`; canonical `https://wibeit.co/privacy_policy.html` |
| **child_safety.html** | `robots: index, follow`; canonical `https://wibeit.co/child_safety.html` |
| **child_policy.html** | `robots: index, follow`; canonical `https://wibeit.co/child_policy.html` |
| **legal.html** | `robots: index, follow`; canonical `https://wibeit.co/legal.html` |
| **faqs.html** | `robots: index, follow`; canonical `https://wibeit.co/faqs.html` |
| **404.html** | `robots: noindex, follow` (error page should not be indexed) |

### ✅ Sitemap

- **sitemap.xml** includes: `/`, `privacy_policy.html`, `legal.html`, `faqs.html`, `child_safety.html`, `child_policy.html`.
- **404** is not in the sitemap (correct).

### ⚠️ Optional

- **Canonical consistency:** All canonicals use `https://wibeit.co/`. If the site is also served over `http://` or `www`, ensure redirects to the chosen canonical (e.g. https + non-www) so indexing is consistent.
- **Index vs index.html:** Canonical for the homepage is `https://wibeit.co/`. Ensure the server serves the same content for `/` and `/index.html` (or redirects one to the other) so crawlers don’t see duplicate content.

---

## 3. Summary

- **Broken links:** 4 PDF links under `docs/` were broken; they are now mailto links so nothing 404s.
- **Indexing:** No issues found. All main pages are indexable; 404 is noindex; sitemap and robots.txt are correct.
- **Next steps:** (1) Add PDFs under `docs/` and restore file links if you want direct download. (2) Fix or remove the “Blog” link. (3) Ensure HTTPS and canonical redirects on the server.
