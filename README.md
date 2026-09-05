# Sri Venkateswara Screen & Textile Printing Works

The standalone website for **Sri Venkateswara Screen & Textile Printing
Works**, a screen-printing and textile business in Anakapalle, Visakhapatnam
district, Andhra Pradesh.

- **Site repository:** <https://github.com/itsmehara/venkateswara-site>
- **Production workspace:** <https://github.com/itsmehara/venkateswara-workspace>

This repository is the complete deployable site. It uses plain HTML, CSS, and
JavaScript with no framework, backend, database, production dependency, or
build step. The files in this repository are served directly.

## Run locally

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/>. Use an HTTP server rather than opening the files
through `file://`.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Seven-slide responsive hero, services, featured work, jute promotion, promises, and calls to action |
| `services.html` | Seven services, bulk-order process, print/embroidery comparison, couple tees, and jute-bag workflow |
| `work.html` | Filterable eighteen-project gallery with provenance labels, full-size viewing, and enquiry actions |
| `sketchbook.html` | Pearl Linen Design Book with one portfolio project per spread and responsive page-turn behavior |
| `about.html` | Workshop, working approach, promises, and proprietor introduction |
| `contact.html` | Contact details, quote checklist, WhatsApp actions, and map search |

## Project structure

```text
assets/css/style.css        Shared visual system and responsive components
assets/css/sketchbook.css   Design Book layout, material, and turn presentation
assets/js/data.js           Business details, 7 services, 18 projects, promises
assets/js/site.js           Navigation, hero, gallery, lightbox, enquiry, bindings
assets/js/sketchbook.js     Design Book rendering and page-turn interactions
assets/img/                 36 files: .webp for every photo actually served,
                             plus one .jpg (homepage-hero-core-products.jpg,
                             kept for WhatsApp/Facebook link-preview crawlers
                             that don't render webp) and the brand logo .png.
                             Original higher-res .jpg source files live in
                             the workspace repo's images/site-jpg-originals/,
                             not here — see that folder's README.
*.html                      Six directly served pages
robots.txt                  Crawler rules and sitemap location
sitemap.xml                 Six-page sitemap; final domain still required
.nojekyll                   Prevents GitHub Pages from applying Jekyll
```

## Main features

- Responsive navigation, layout, images, and typography.
- Seven-slide homepage hero with separate desktop/mobile sources and deferred
  loading after the first slide.
- Central data model shared by services, gallery, enquiry, and Design Book.
- Filterable work gallery and keyboard-accessible lightbox.
- Browser-local enquiry shortlist that prepares a WhatsApp message; nothing is
  transmitted until the visitor chooses to send it.
- Honest **Delivered work** and **Sample** labels driven by each project's
  `provenance` field.
- Eighteen-project Design Book with Pearl Linen pages, desktop book turns,
  mobile upward turns, direct project index, progress indicator, full-size
  viewing, keyboard controls, and reduced-motion support.
- Skip link, semantic landmarks, visible focus states, usable touch targets,
  image alternative text, and `prefers-reduced-motion` handling.

## Updating content

Most editable content lives in [`assets/js/data.js`](assets/js/data.js):

- `business` — identity, contact details, address, and WhatsApp number
- `services` — service descriptions and related images
- `work` — portfolio content, categories, provenance, notes, and image paths
- `promises` — reusable trust statements
- `sketchbook` — derived automatically from work items that have images

Do not maintain a separate Design Book list. Add or update the item in `work`.
Keep these fields accurate:

- `provenance: "real"` — work delivered to a customer
- `provenance: "mock"` — a demonstration/sample presentation
- `whatsapp` — country code and digits only, suitable for `wa.me`

The shared page shell is maintained in the workspace repository's
`scripts/build-pages.py`. Running that script rewrites its generated HTML pages;
always review the resulting diff. `index.html` is hand-maintained.

## Hero image loading

The first hero image loads eagerly with high fetch priority. Later slides keep
their URLs in `data-src` and `data-srcset`; `assets/js/site.js` loads the next
slide shortly before it is shown. Preserve that pattern when adding another
slide. Native `loading="lazy"` is not sufficient because all absolutely
positioned slides appear in the visible hero container.

## Design Book

The final page material is
[`assets/img/sketchbook/linen-bg.jpg`](assets/img/sketchbook/linen-bg.jpg), a
repeatable warm Pearl Linen texture. It is tiled on both leaves and page edges,
not stretched. Project numbering uses **Project NN / MM** on the information
page and **NN / MM** in the progress indicator; the former “Plate” terminology
has been removed from visible UI.

The Design Book reads the same `work` array used by the gallery. Its enquiry
button uses the shared local-storage list, and its full-size action uses the
shared lightbox.

## Deployment

### GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select the published branch (currently `master`) and `/ (root)`.

The included `.nojekyll` file ensures the static files are served unchanged.

### Other static hosts

Upload the repository contents as-is to Netlify, Cloudflare Pages, Vercel,
cPanel, or another static host. There is no build command; the publish directory
is the repository root.

## Before public launch

- Replace `REPLACE-WITH-YOUR-DOMAIN` in `robots.txt` and `sitemap.xml`.
- Add canonical URLs after the final domain is known.
- Convert each relative `og:image` value to an absolute production URL.
- Confirm the opening hours, founding year, and exact Google Maps pin.
- Owner-proof customer artwork, dates, and small lettering in reconstructed
  portfolio images.
- Test every page, hero slide, filter, lightbox, enquiry action, phone/email
  link, WhatsApp message, keyboard flow, and mobile layout on the deployed site.

## Privacy and external services

The site has no server-side form, user account, analytics package, or database.
The enquiry list and optional name/note remain in the visitor's browser until
they open WhatsApp. The browser may contact Google Fonts, Google Maps, and
WhatsApp when their resources or links are used; those services have their own
terms and privacy policies.

## Licensing

This is a proprietary business website, not an open-source template. See
[`LICENSE.md`](LICENSE.md) for the All Rights Reserved notice and
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for Google Fonts and other
materials that remain under their respective licences.
