# Sri Venkateswara Screen &amp; Textile Printing Works

The website for Sri Venkateswara Screen &amp; Textile Printing Works — screen
printing, bulk uniform stitching, custom caps, cloth flags and jute bag
printing in Anakapalle, Visakhapatnam district, Andhra Pradesh. Proprietor:
Venkatesh.

**This folder is the whole site.** It is plain HTML, CSS and JavaScript with no
build step, no framework and no dependencies. What is here is exactly what gets
served — deploy the folder as it stands.

## Deploying

### GitHub Pages

1. Push this folder as the root of a repository.
2. Repository → Settings → Pages → Source: *Deploy from a branch*,
   branch `main`, folder `/ (root)`.
3. The `.nojekyll` file is already here so GitHub serves the files as they are.

### Anywhere else

Upload the folder to any static host — Netlify, Cloudflare Pages, Vercel, or
ordinary cPanel hosting. There is nothing to install or compile.

### After the first deploy

Replace `REPLACE-WITH-YOUR-DOMAIN` in `robots.txt` and `sitemap.xml` with the
real address, and change the `og:image` and canonical addresses in each page's
`<head>` to absolute URLs so link previews work when the site is shared.

## Running it locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. Opening the `.html` files directly with
`file://` will not work — the pages load their assets by relative path.

## Layout

```
index.html          Home — hero slideshow (7 slides), jute promo banner, services, featured work
services.html       Every service, how a bulk order runs, print vs embroidery,
                     a couple-tees showcase, and the jute bag process story
work.html           Filterable gallery; each piece can be added to an enquiry
sketchbook.html     The design book, one spread per piece, with a page turn
about.html          The workshop and the man who runs it
contact.html        Phone, WhatsApp, email, address, what to send for a quote

assets/css/style.css       The entire design system
assets/css/sketchbook.css  Only the design book needs this
assets/js/data.js          All content: business details, services, work list
assets/js/site.js          Nav, hero, reveals, lightbox, the enquiry list
assets/js/sketchbook.js    The page turn
assets/img/                Web-sized images (originals live outside this folder)
```

### The hero slideshow loads images just-in-time, not all at once

Every `.hero-slide` after the first ships with `data-src`/`data-srcset` instead
of `src`/`srcset` — native `loading="lazy"` does not work here (every slide is
`position: absolute` inside an always-visible container, so the browser
considers all of them "in view" regardless of the attribute). `site.js`'s
`loadSlide()` swaps in the real attributes only when a slide is about to be
shown. **If you add an 8th slide, copy this pattern** — a slide shipped with a
plain `src` will simply download immediately on every page load, which is the
exact problem this was built to avoid. The one exception is the first slide,
which keeps `src`/`srcset`/`fetchpriority="high"` and loads eagerly on purpose.

## Changing the content

Almost everything the pages display comes from **`assets/js/data.js`** — the
phone numbers, the address, the service list and the work gallery. Edit that one
file and every page updates. There is no second list to keep in step.

The shared header and footer are stamped into each page by
`../scripts/build-pages.py` (which lives outside this folder, with the project
working files). Run it after editing that script, then commit the generated
`.html` files like any other source. The site itself never runs it.

## Two things to keep honest

**1. Real work versus samples.** Every item in `data.js` carries a `provenance`
field:

- `"real"` — a photograph of work actually delivered to a customer.
- `"mock"` — a demonstration of what a finished order looks like.

The gallery, the design book and the enquiry list all label these differently,
on purpose. Several images in this site are generated presentations rather than
photographs of stock, and a customer must never be led to think otherwise. Do
not change a `"mock"` to `"real"` without a real photograph to replace it with.

An item may also carry `bookFit: "fill"`. That is a *display* setting for the
design book only: a piece far taller than the book's leaf gives up its margins
and is cropped top and bottom, rather than sitting in a column of empty paper.
The gallery card and the full-size view always show the whole piece uncut, so
nothing is hidden from the customer — use it for shape, never to hide a flaw.

**2. Things we do not know yet.** The shop's founding year and opening hours are
deliberately absent, and the pages say so rather than guessing. The Google Maps
link searches for the bazar instead of dropping a pin. Fill these in from
`data.js` (`business.hours`, `business.since`) once Venkatesh confirms them.

## Design Book texture — currently CSS, may become a real image

`sketchbook.css`'s `.sb-leaf` background is a red "Rosso Levanto" marble look
built entirely from gradients — no image file. It's a placeholder for a real
photographed or AI-generated marble texture the owner is sourcing; see
`REGISTRY.md` section 3m/"Start here" for the exact swap instructions and
where the candidate image lands (`images/processed/batch-marble-texture/`,
outside this deployed folder).

## The enquiry list

Pressing "Add to enquiry" on any piece stores its id in `localStorage`, and the
floating panel builds a `wa.me` link containing the list, the visitor's name and
their note. Nothing is sent until the visitor presses send in WhatsApp itself —
the site has no server and collects nothing.

The destination number is `business.whatsapp` in `data.js`, in `wa.me` form:
country code, digits only, no `+` or spaces.

## Licensing

This is a proprietary business website, not an open-source template. See
[`LICENSE.md`](LICENSE.md) for the All Rights Reserved notice and
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for fonts and other materials
that remain under their respective licences.
