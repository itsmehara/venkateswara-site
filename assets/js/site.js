/* =========================================================================
   Sri Venkateswara Screen & Textile Printing Works — site behaviour
   -------------------------------------------------------------------------
   Header nav, hero slideshow, scroll reveals, the lightbox, and the quote
   list that turns a browse into a WhatsApp enquiry.

   Written to fail quietly. Every page here is readable and usable with this
   file blocked: the nav is a plain list, the hero shows its first slide, and
   the phone number is a link. Nothing on this site is only reachable
   through JavaScript.
   ========================================================================= */
(function () {
  "use strict";

  var D = window.SV;
  if (!D) return;

  var STORE_KEY = "sv-quote-v1";

  /* ---- Small helpers ----------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* Everything from data.js is written by us, but it still passes through
     innerHTML, so anything user-facing gets escaped on the way. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Titles in data.js carry their own entities (&amp;), so they are already
     markup. This strips them back to plain text for WhatsApp and alt text. */
  function plain(html) {
    var d = document.createElement("div");
    d.innerHTML = String(html == null ? "" : html);
    return d.textContent || "";
  }

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Storage is unavailable in some private modes, and throws rather than
     returning null. The quote list is a convenience, never load-bearing. */
  function readStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var v = raw ? JSON.parse(raw) : [];
      return Array.isArray(v) ? v : [];
    } catch (err) { return []; }
  }
  function writeStore(ids) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(ids)); } catch (err) { /* fine */ }
  }

  function itemById(id) {
    for (var i = 0; i < D.work.length; i++) if (D.work[i].id === id) return D.work[i];
    return null;
  }

  /* ---- Language ------------------------------------------------------------ */
  /* English is the site's actual markup — it is never fetched or replaced,
     only left alone. Telugu, Hindi and Spanish are separate JSON files
     (assets/i18n/<locale>.json), each holding just that one language's
     strings, so a visitor only ever downloads the one language they asked
     for. A missing key at any point below falls back to whatever English
     text is already in the DOM or in data.js — never a raw lookup key. */
  var LOCALE_KEY = "sv-language-v1";
  var LOCALES = {
    en: { name: "English",  dir: "ltr" },
    te: { name: "తెలుగు",   dir: "ltr" },
    hi: { name: "हिन्दी",    dir: "ltr" },
    es: { name: "Español",  dir: "ltr" }
  };
  var I18N = null;      /* the loaded dictionary, or null for English */
  var LOCALE = "en";

  function savedLocale() {
    try {
      var v = localStorage.getItem(LOCALE_KEY);
      return LOCALES[v] ? v : null;
    } catch (err) { return null; }
  }
  function saveLocale(loc) {
    try { localStorage.setItem(LOCALE_KEY, loc); } catch (err) { /* fine */ }
  }

  /* Reads a dotted path ("pages.home.headline1") out of the loaded
     dictionary. Returns null (never throws, never returns a lookup key) if
     the path is missing or the value is not a translated string. */
  function tr(path) {
    if (!I18N) return null;
    var parts = path.split(".");
    var v = I18N;
    for (var i = 0; i < parts.length; i++) {
      if (v == null || typeof v !== "object") return null;
      v = v[parts[i]];
    }
    return typeof v === "string" ? v : null;
  }
  /* Same lookup, with {placeholder} substitution for the handful of runtime
     strings that carry one (a slide number, a project count, a title). */
  function trf(path, vars) {
    var s = tr(path);
    if (s == null) return null;
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] != null ? vars[k] : m;
    });
  }

  /* Applies every [data-i18n] element on the current page. Telugu/Devanagari
     need their own typefaces — the Latin display face this site otherwise
     uses does not cover those scripts — so a class carrying the right
     font-family is toggled on <html> alongside the lang attribute rather
     than duplicated per element. */
  /* Fetched only the first time a script that needs it is selected — an
     English or Spanish visitor never pays for these, matching how the
     locale JSON itself only loads for the language actually chosen. */
  var SCRIPT_FONTS = {
    te: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700;800&display=swap",
    hi: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap"
  };
  var loadedScriptFonts = {};
  function ensureScriptFont(loc) {
    var href = SCRIPT_FONTS[loc];
    if (!href || loadedScriptFonts[loc]) return;
    loadedScriptFonts[loc] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function applyStaticI18n() {
    document.documentElement.lang = LOCALE;
    document.documentElement.classList.toggle("lang-te", LOCALE === "te");
    document.documentElement.classList.toggle("lang-hi", LOCALE === "hi");
    ensureScriptFont(LOCALE);

    /* Switching locale back to English has no JSON to read — tr() always
       returns null — so English is restored from a snapshot of each
       element's own original value taken the first time it's ever touched,
       rather than by trying to re-derive "the English" from nothing. */
    $$("[data-i18n]").forEach(function (el) {
      if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.textContent;
      el.textContent = tr(el.getAttribute("data-i18n")) || el.dataset.i18nEn;
    });
    /* A handful of headings carry a line break as a literal newline in the
       translation JSON (matching how they're written in the te/hi source
       bundle) rather than markup — data-i18n-html holds its own path (not a
       modifier on data-i18n) and means "this key may contain one of those",
       so it gets turned into a real <br> here instead of asking every
       translated string to carry HTML. */
    $$("[data-i18n-html]").forEach(function (el) {
      if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.innerHTML;
      var val = tr(el.getAttribute("data-i18n-html"));
      el.innerHTML = val != null ? esc(val).replace(/\n/g, "<br>") : el.dataset.i18nEn;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      var spec = el.getAttribute("data-i18n-attr").split(":");
      if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.getAttribute(spec[0]) || "";
      el.setAttribute(spec[0], tr(spec[1]) || el.dataset.i18nEn);
    });
    /* The hero's per-slide captions live in a data-caption attribute (read
       by initHero()'s show()), not in text content, so they need their own
       pass rather than the generic [data-i18n] walk above. */
    var captions = I18N && I18N.pages && I18N.pages.home && I18N.pages.home.heroCaptions;
    $$(".hero-slide").forEach(function (s, n) {
      if (s.dataset.captionEn == null) s.dataset.captionEn = s.getAttribute("data-caption") || "";
      s.setAttribute("data-caption", (captions && captions[n]) || s.dataset.captionEn);
    });
    var activeCap = $(".hero-slide.is-active");
    var capEl = $(".hero-caption");
    if (activeCap && capEl) capEl.textContent = activeCap.getAttribute("data-caption") || "";
    $$(".hero-dots button").forEach(function (b, n) {
      var label = $(".visually-hidden", b);
      if (label) label.textContent = trf("runtime.heroSlide", { index: n + 1 }) || ("Slide " + (n + 1));
    });
  }

  function buildLangSwitch() {
    var host = $("[data-lang-switch]");
    if (!host) return;
    host.innerHTML = Object.keys(LOCALES).map(function (code) {
      return '<button type="button" data-lang="' + code + '" aria-pressed="' + (code === LOCALE) + '" lang="' + code + '">' +
        esc(LOCALES[code].name) + '</button>';
    }).join("");
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]");
      if (!b) return;
      var code = b.getAttribute("data-lang");
      if (code === LOCALE) return;
      saveLocale(code);
      switchLocale(code);
    });
  }
  function syncLangSwitch() {
    $$("[data-lang-switch] [data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === LOCALE));
    });
  }

  /* Loads a locale's JSON (or clears it, for English) and hands back to
     `done` once LOCALE/I18N are ready to read — for both success and
     failure (a fetch error on a slow or offline connection should leave
     the page in English, not stuck on a spinner). Pure load: no rendering,
     so this is safe to call before any of the page's one-time setup runs. */
  function loadLocaleData(loc, done) {
    LOCALE = LOCALES[loc] ? loc : "en";
    if (LOCALE === "en") { I18N = null; done(); return; }
    fetch("assets/i18n/" + LOCALE + ".json", { cache: "force-cache" })
      .then(function (r) { if (!r.ok) throw new Error("locale fetch failed"); return r.json(); })
      .then(function (json) { I18N = json; done(); })
      .catch(function () { I18N = null; done(); });
  }

  /* Re-renders everything that reads from I18N. Used after the initial load
     (once, as part of the page's normal render) and again on every language
     switch — re-rendering in place rather than reloading the page keeps the
     enquiry list, any typed quote-form input, and scroll position intact. */
  function retranslate() {
    applyStaticI18n();
    renderServices();
    renderPromises();
    renderWork();
    Quote.render();
    if (window.SVSketchbook) window.SVSketchbook.rerender();
    syncLangSwitch();
  }

  /* The language-switcher entry point: only this one re-runs render after
     load, because only this one fires after the page's one-time setup
     (event listeners, the hero's timer) already happened once. */
  function switchLocale(loc) {
    loadLocaleData(loc, retranslate);
  }

  /* ---- Header ------------------------------------------------------------ */
  function initHeader() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    var nav = $(".site-nav");

    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-stuck", window.scrollY > 8);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    /* Following a link should close the panel behind you. */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---- Hero slideshow ---------------------------------------------------- */
  function initHero() {
    var slides = $$(".hero-slide");
    if (slides.length < 2) return;

    var hero = $(".hero");
    var wrap = hero ? $(".wrap", hero) : null;
    var body = $(".hero-body");
    var dotsWrap = $(".hero-dots");
    var caption = $(".hero-caption");
    var i = 0, timer = null;
    /* 3.8s — the owner tried 2.8s live and it read as rushed; this is
       where it landed. */
    var HOLD = 3800;

    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map(function (s, n) {
        return '<button type="button" data-slide="' + n + '">' +
          '<span class="visually-hidden">' + esc(trf("runtime.heroSlide", { index: n + 1 }) || ("Slide " + (n + 1))) + '</span></button>';
      }).join("");
    }

    /* Most slides have the open ground on the right of the photograph, so
       the copy sits at its natural left position — no transform needed. A
       few (the caps and uniform slides) have the product on the left
       instead, so the block slides across to sit over the empty side. The
       distance is measured rather than guessed, because the wrap's width is
       responsive and the block's own width changes with the copy inside it. */
    function positionBody() {
      if (!body || !wrap) return;
      var wantsRight = slides[i].getAttribute("data-text-side") === "right";
      if (hero) hero.classList.toggle("is-text-right", wantsRight);

      if (!wantsRight || window.matchMedia("(max-width: 760px)").matches) {
        body.style.transform = "translateX(0)";
        return;
      }
      var shift = wrap.getBoundingClientRect().width - body.getBoundingClientRect().width;
      body.style.transform = "translateX(" + Math.max(0, shift) + "px)";
    }

    /* Six of the seven slide images ship as data-src/data-srcset, not
       src/srcset — native loading="lazy" cannot help here, because every
       slide is position:absolute inside .hero-slides, which is always
       geometrically inside the viewport on page load even while a slide
       sits at opacity 0. The browser has no way to know six of the seven
       photos are invisible, so it was downloading all 2.3MB of them
       immediately on every visit regardless of the lazy attribute — real
       weight on a slow connection for photos most visitors would never
       even reach. This loads a slide's real image only once it is about to
       be shown. */
    function loadSlide(idx) {
      var slide = slides[idx];
      if (!slide || slide.dataset.loaded) return;
      slide.dataset.loaded = "1";
      var source = slide.querySelector("source[data-srcset]");
      if (source) { source.srcset = source.dataset.srcset; delete source.dataset.srcset; }
      var img = slide.querySelector("img[data-src]");
      if (img) { img.src = img.dataset.src; delete img.dataset.src; }
    }

    function show(n) {
      i = (n + slides.length) % slides.length;
      loadSlide(i);
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      if (dotsWrap) {
        $$("button", dotsWrap).forEach(function (b, k) {
          if (k === i) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      }
      if (caption) caption.textContent = slides[i].getAttribute("data-caption") || "";
      positionBody();
      /* Loaded a beat after showing the current slide, so a slow connection
         still prioritises what is on screen right now — but by the time the
         auto-advance timer fires, the next photo is usually already there,
         so the crossfade does not stall on a still-loading image. */
      setTimeout(function () { loadSlide((i + 1) % slides.length); }, 400);
    }

    /* The measurement only has to be right, not continuous — recompute on
       resize (e.g. rotating a tablet, resizing a desktop window) rather than
       tracking every frame. */
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(positionBody, 120);
    }, { passive: true });

    function play() {
      if (reduceMotion()) return;
      stop();
      timer = setInterval(function () { show(i + 1); }, HOLD);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    if (dotsWrap) {
      dotsWrap.addEventListener("click", function (e) {
        var b = e.target.closest("[data-slide]");
        if (!b) return;
        show(Number(b.getAttribute("data-slide")));
        play();
      });
    }

    /* A slideshow that keeps moving while you are reading a slide is rude,
       so it pauses on hover and on keyboard focus. The bug this used to have:
       focusin stopped it, but nothing ever started it again — tabbing to (or
       on a phone, simply tapping) "See our work" or the WhatsApp link set
       focus inside .hero and silently killed the slideshow for the rest of
       the visit. focusout resumes it, but only once focus has actually left
       the hero section entirely — not on every hop between the two buttons
       inside it, which would otherwise restart the timer on every tab press. */
    /* mouseenter/mouseleave are a real hover pause on a mouse, but on a
       touchscreen mobile browsers still synthesise mouseenter on tap (for
       legacy compatibility) while mouseleave frequently never fires — there
       is no cursor actually leaving. That left the slideshow stopped, with
       nothing to resume it, after literally any tap inside the hero: the
       image, a button, anywhere. This was very likely the "hangs" reported —
       intermittent because it depended on whether that particular tap
       happened to land somewhere that also triggered focus (which does
       reliably resume, below) or not. Hover pause is now wired up only on
       devices that actually have hover, which a touchscreen answers no to
       regardless of how it synthesises mouse events. */
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hero) {
      if (canHover) {
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
      }
      hero.addEventListener("focusin", stop);
      hero.addEventListener("focusout", function (e) {
        if (!hero.contains(e.relatedTarget)) play();
      });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });

    show(0);
    /* A page can start out hidden (opened in a background tab, a bfcache
       restore, a prerender) — visibilitychange only fires on a transition,
       so it never announces that starting state. Without this check play()
       would arm a timer no one can see tick, which either wastes a
       background timer or, worse, silently skips several slides before the
       tab is ever brought forward. */
    if (!document.hidden) play();
  }

  /* ---- Scroll reveal ------------------------------------------------------ */
  function initReveal() {
    var targets = $$("[data-reveal]");
    if (!targets.length) return;

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });

    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- Lightbox ----------------------------------------------------------- */
  var Lightbox = (function () {
    var box = null, items = [], index = 0, lastFocus = null;

    function build() {
      box = document.createElement("div");
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Larger view");
      box.setAttribute("data-i18n-attr", "aria-label:runtime.lightbox.largerView");
      box.innerHTML =
        '<button type="button" class="lightbox-close" data-close>' +
          '<span aria-hidden="true">&times;</span>' +
          '<span class="visually-hidden" data-i18n="common.actions.close">Close</span></button>' +
        '<button type="button" class="lightbox-nav lightbox-nav--prev" data-prev>' +
          '<span aria-hidden="true">&lsaquo;</span>' +
          '<span class="visually-hidden" data-i18n="common.actions.previous">Previous</span></button>' +
        '<button type="button" class="lightbox-nav lightbox-nav--next" data-next>' +
          '<span aria-hidden="true">&rsaquo;</span>' +
          '<span class="visually-hidden" data-i18n="common.actions.next">Next</span></button>' +
        '<figure class="lightbox-figure">' +
          '<img data-img decoding="async" src="" alt="">' +
          '<figcaption data-cap></figcaption>' +
        '</figure>';
      document.body.appendChild(box);
      applyStaticI18n();   /* built lazily, may happen after a locale switch */

      box.addEventListener("click", function (e) {
        if (e.target.closest("[data-close]") || e.target === box) return close();
        if (e.target.closest("[data-prev]")) return step(-1);
        if (e.target.closest("[data-next]")) return step(1);
      });
      document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }

    function render() {
      var it = items[index];
      if (!it) return;
      var title = tr("work." + it.id + ".title") || it.title;
      var alt   = tr("work." + it.id + ".alt")   || it.alt;
      var note  = tr("work." + it.id + ".note")  || it.note;
      $("[data-img]", box).src = it.image;
      $("[data-img]", box).alt = alt || plain(title);
      $("[data-cap]", box).textContent =
        plain(title) + (note ? " — " + plain(note) : "") +
        (it.provenance === "mock" ? "  " + (tr("runtime.lightbox.sampleSuffix") || "(Sample presentation, not a photograph of stock.)") : "");
      var many = items.length > 1;
      $("[data-prev]", box).hidden = !many;
      $("[data-next]", box).hidden = !many;
    }

    function step(n) { index = (index + n + items.length) % items.length; render(); }

    function open(list, at) {
      if (!box) build();
      items = list; index = at || 0;
      lastFocus = document.activeElement;
      render();
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      $("[data-close]", box).focus();
    }

    function close() {
      if (!box) return;
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    return { open: open, close: close };
  })();

  /* ---- The quote list ----------------------------------------------------- */
  /* Pick out the pieces that are close to what you want, then send the lot to
     Venkatesh on WhatsApp as one message. It is an enquiry, not an order: nothing
     is priced here, because every job is quoted on quantity, cloth and the
     artwork. Saying otherwise on the page would be a promise the shop has
     not made. */
  var Quote = (function () {
    var ids = [];
    var panel, list, count, fab, noteField, nameField;

    function save() { writeStore(ids); }

    function waLink() {
      var b = D.business;
      var lines = [(tr("runtime.whatsappMessage.greeting") || "Hello Sri Venkateswara Printing Works,"), ""];

      if (ids.length) {
        lines.push(tr("runtime.whatsappMessage.quoteFor") || "I would like a quotation for:");
        ids.forEach(function (id, n) {
          var it = itemById(id);
          if (it) lines.push((n + 1) + ". " + plain(tr("work." + id + ".title") || it.title));
        });
      } else {
        lines.push(tr("runtime.whatsappMessage.general") || "I would like to ask about your printing work.");
      }

      var who = nameField && nameField.value.trim();
      var note = noteField && noteField.value.trim();
      if (note) { lines.push("", (tr("runtime.whatsappMessage.details") || "Details:") + " " + note); }
      if (who)  { lines.push("", (tr("runtime.whatsappMessage.myName") || "My name:") + " " + who); }

      lines.push("", tr("runtime.whatsappMessage.sentFromSite") || "(Sent from your website)");

      return "https://wa.me/" + b.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
    }

    function render() {
      if (!list) return;

      if (!ids.length) {
        list.innerHTML =
          '<li class="quote-empty"><strong>' + esc(tr("runtime.enquiry.emptyTitle") || "Nothing added yet") + '</strong>' +
          esc(tr("runtime.enquiry.emptyBody") ||
            'Browse the work and press “Add to enquiry” on anything close to ' +
            'what you need. Send them all to Venkatesh in one message.') + '</li>';
      } else {
        list.innerHTML = ids.map(function (id) {
          var it = itemById(id);
          if (!it) return "";
          var title = tr("work." + id + ".title") || it.title;
          var provLabel = it.provenance === "mock" ? (tr("common.provenance.sample") || "Sample")
                                                     : (tr("common.provenance.real") || "Delivered work");
          return '<li class="quote-item">' +
            '<img src="' + esc(it.image) + '" alt="" loading="lazy" decoding="async">' +
            '<div><div class="quote-item-name">' + title + '</div>' +
              '<div class="quote-item-meta">' + esc(provLabel) + '</div></div>' +
            '<button type="button" class="quote-remove" data-remove="' + esc(id) + '">' +
              '<span aria-hidden="true">&times;</span>' +
              '<span class="visually-hidden">' + esc(trf("runtime.enquiry.removeAria", { title: plain(title) }) || ("Remove " + plain(title))) + '</span></button>' +
          '</li>';
        }).join("");
      }

      if (count) count.textContent = String(ids.length);
      if (fab) fab.setAttribute("data-empty", String(!ids.length));

      /* Every add button on the page reflects what is in the list. */
      $$("[data-add]").forEach(function (b) {
        var on = ids.indexOf(b.getAttribute("data-add")) !== -1;
        b.setAttribute("aria-pressed", String(on));
        var label = $(".btn-add-text", b);
        if (label) label.textContent = on ? (tr("common.actions.added") || "Added")
                                           : (tr("common.actions.addEnquiry") || "Add to enquiry");
      });

      var send = $("[data-send]");
      if (send) send.href = waLink();
    }

    function add(id) {
      if (ids.indexOf(id) !== -1) { remove(id); return; }
      ids.push(id);
      save(); render();
      if (fab) {
        fab.classList.remove("is-bumped");
        void fab.offsetWidth;            /* restart the animation */
        fab.classList.add("is-bumped");
      }
      var it = itemById(id);
      var title = plain((it && (tr("work." + id + ".title") || it.title)) || "");
      announce(trf("runtime.enquiry.addedAnnouncement", { title: title }) || (title + " added to your enquiry."));
    }

    function remove(id) {
      ids = ids.filter(function (x) { return x !== id; });
      save(); render();
    }

    function announce(msg) {
      var live = $("[data-quote-live]");
      if (live) live.textContent = msg;
    }

    function toggle(open) {
      if (!panel) return;
      var next = typeof open === "boolean" ? open : !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", next);
      if (fab) fab.setAttribute("aria-expanded", String(next));
      if (next) {
        var first = $("button, a, textarea, input", panel);
        if (first) first.focus();
      }
    }

    function init() {
      panel = $(".quote-panel");
      fab = $(".quote-fab");
      if (!panel || !fab) return;

      list = $(".quote-items", panel);
      count = $(".quote-count");
      noteField = $("[data-quote-note]", panel);
      nameField = $("[data-quote-name]", panel);

      /* Only keep ids that still exist in the catalogue — a saved list from
         before a product was retired should not render blank rows. */
      ids = readStore().filter(function (id) { return !!itemById(id); });

      fab.addEventListener("click", function () { toggle(); });
      $("[data-quote-close]", panel).addEventListener("click", function () {
        toggle(false); fab.focus();
      });

      panel.addEventListener("click", function (e) {
        var rm = e.target.closest("[data-remove]");
        if (rm) remove(rm.getAttribute("data-remove"));
      });

      /* The message is built from the fields as they are typed, so the link
         is always current by the time it is followed. */
      panel.addEventListener("input", function () {
        var send = $("[data-send]", panel);
        if (send) send.href = waLink();
      });

      document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-add]");
        if (b) { e.preventDefault(); add(b.getAttribute("data-add")); }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("is-open")) {
          toggle(false); fab.focus();
        }
      });

      render();
    }

    return { init: init, add: add, render: render, open: function () { toggle(true); } };
  })();

  /* ---- Rendering the shared furniture -------------------------------------- */
  /* The header, footer and dock are built here rather than pasted into every
     page, so the phone number lives in exactly one place. */
  function waIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/>' +
      '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z"/></svg>';
  }

  function renderDock() {
    if ($(".dock")) return;                 /* a page may supply its own */
    var b = D.business;

    var dock = document.createElement("div");
    dock.className = "dock";
    dock.innerHTML =
      '<a class="wa-fab" data-wa-link href="#" target="_blank" rel="noopener">' +
        '<span class="fab-label" data-i18n="runtime.whatsappDock.chat">Chat on WhatsApp</span>' + waIcon() +
        '<span class="visually-hidden" data-i18n="runtime.whatsappDock.aria">Chat with us on WhatsApp (opens WhatsApp)</span></a>' +

      '<button type="button" class="quote-fab" data-empty="true" aria-expanded="false" ' +
        'aria-controls="quote-panel">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>' +
          '<path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<span class="fab-text" data-i18n="runtime.enquiry.myEnquiry">My enquiry</span>' +
        '<span class="quote-count">0</span>' +
        '<span class="visually-hidden" data-i18n="runtime.enquiry.openList">Open your enquiry list</span>' +
      '</button>';

    var panel = document.createElement("div");
    panel.className = "quote-panel";
    panel.id = "quote-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Your enquiry list");
    panel.setAttribute("data-i18n-attr", "aria-label:runtime.enquiry.listTitle");
    panel.innerHTML =
      '<div class="quote-head">' +
        '<h2 data-i18n="runtime.enquiry.listTitle">Your enquiry</h2>' +
        '<button type="button" class="quote-close" data-quote-close>' +
          '<span aria-hidden="true">&times;</span>' +
          '<span class="visually-hidden" data-i18n="common.actions.close">Close</span></button>' +
      '</div>' +
      '<ul class="quote-items"></ul>' +
      '<div class="quote-foot">' +
        '<div>' +
          '<label for="q-name" data-i18n="runtime.enquiry.nameLabel">Name (optional)</label>' +
          '<input id="q-name" type="text" data-quote-name autocomplete="name" ' +
                 'placeholder="So Venkatesh knows who is asking" ' +
                 'data-i18n-attr="placeholder:runtime.enquiry.nameHint">' +
        '</div>' +
        '<div>' +
          '<label for="q-note" data-i18n="runtime.enquiry.detailsLabel">Qty, sizes, colours</label>' +
          '<textarea id="q-note" rows="1" data-quote-note ' +
            'placeholder="e.g. 60 polos, mixed sizes, logo on chest" ' +
            'data-i18n-attr="placeholder:runtime.enquiry.detailsExample"></textarea>' +
        '</div>' +
        '<a class="btn btn--block quote-send" data-send href="#" target="_blank" rel="noopener">' +
          waIcon() + '<span data-i18n="runtime.enquiry.send">Send on WhatsApp</span></a>' +
        '<p class="quote-disclaimer muted" data-i18n="runtime.enquiry.privacy">Opens WhatsApp — nothing sends until you press it there.</p>' +
      '</div>' +
      '<p class="visually-hidden" role="status" aria-live="polite" data-quote-live></p>';

    document.body.appendChild(dock);
    document.body.appendChild(panel);
  }

  /* ---- Bits every page fills in ------------------------------------------- */
  function fillCommon() {
    var b = D.business;

    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    $$("[data-tel]").forEach(function (el) {
      el.textContent = b.phone;
      if (el.tagName === "A") el.href = "tel:" + b.phone.replace(/\s/g, "");
    });
    $$("[data-tel-alt]").forEach(function (el) {
      el.textContent = b.phoneAlt;
      if (el.tagName === "A") el.href = "tel:" + b.phoneAlt.replace(/\s/g, "");
    });
    $$("[data-email]").forEach(function (el) {
      el.textContent = b.email;
      if (el.tagName === "A") el.href = "mailto:" + b.email;
    });
    $$("[data-address]").forEach(function (el) {
      var a = b.address;
      el.innerHTML = esc(a.line1) + "<br>" + esc(a.line2) + "<br>" +
        esc(a.city) + " &ndash; " + esc(a.pin) + "<br>" +
        esc(a.district) + " dist., " + esc(a.state);
    });
    $$("[data-wa-link]").forEach(function (el) {
      el.href = "https://wa.me/" + b.whatsapp + "?text=" + encodeURIComponent(
        tr("runtime.whatsappMessage.generalDock") || "Hello Sri Venkateswara Printing Works, I have an enquiry.");
    });
  }

  /* ---- Work cards ---------------------------------------------------------- */
  /* Used by the home page (a few) and the work page (all of them). */
  function workCard(it) {
    var isMock = it.provenance === "mock";
    var title = tr("work." + it.id + ".title") || it.title;
    var alt   = tr("work." + it.id + ".alt")   || it.alt;
    var note  = tr("work." + it.id + ".note")  || it.note;
    var spec  = tr("work." + it.id + ".spec")  || it.spec;
    var provLabel = isMock ? (tr("common.provenance.sample") || "Sample")
                            : (tr("common.provenance.real") || "Delivered work");
    return '<article class="card" data-cat="' + esc(it.category) + '" data-reveal>' +
      '<div class="card-media grain">' +
        '<span class="badge badge--' + (isMock ? "mock" : "real") + '">' + esc(provLabel) + '</span>' +
        '<img src="' + esc(it.image) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" ' +
             'data-zoom="' + esc(it.id) + '">' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + title + '</h3>' +
        '<p class="small muted">' + esc(note) + '</p>' +
        '<div class="card-foot">' +
          '<span class="small muted">' + esc(spec) + '</span>' +
          '<button type="button" class="btn-add" data-add="' + esc(it.id) + '" ' +
                  'aria-pressed="false">' +
            '<span aria-hidden="true">+</span>' +
            '<span class="btn-add-text">' + esc(tr("common.actions.addEnquiry") || "Add to enquiry") + '</span></button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderWork() {
    var host = $("[data-work-grid]");
    if (!host) return;

    var limit = Number(host.getAttribute("data-limit")) || 0;
    var items = limit ? D.work.slice(0, limit) : D.work;

    host.innerHTML = items.map(workCard).join("");

    /* Clicking the photograph opens it big; the button below adds it. */
    host.addEventListener("click", function (e) {
      var img = e.target.closest("[data-zoom]");
      if (!img) return;
      var id = img.getAttribute("data-zoom");
      var visible = $$("[data-cat]", host).filter(function (c) { return !c.hidden; })
        .map(function (c) { return itemById($("[data-zoom]", c).getAttribute("data-zoom")); })
        .filter(Boolean);
      var at = visible.findIndex(function (x) { return x.id === id; });
      Lightbox.open(visible, at < 0 ? 0 : at);
    });

    /* Filters, if the page asked for them. */
    var filters = $("[data-work-filters]");
    if (!filters) return;

    var cats = [{ id: "all", title: tr("pages.work.everything") || "Everything" }].concat(
      D.services.filter(function (s) {
        return D.work.some(function (w) { return w.category === s.id; });
      }).map(function (s) { return { id: s.id, title: tr("services." + s.id + ".label") || s.label }; })
    );

    filters.innerHTML = cats.map(function (c, n) {
      return '<button type="button" class="filter" data-filter="' + esc(c.id) + '" ' +
        'aria-pressed="' + (n === 0) + '">' + c.title + "</button>";
    }).join("");

    filters.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      var want = b.getAttribute("data-filter");
      $$("[data-filter]", filters).forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      $$("[data-cat]", host).forEach(function (card) {
        card.hidden = want !== "all" && card.getAttribute("data-cat") !== want;
      });
    });
  }

  /* ---- Services ------------------------------------------------------------ */
  function renderServices() {
    var host = $("[data-services]");
    if (!host) return;
    var limit = Number(host.getAttribute("data-limit")) || 0;
    var items = limit ? D.services.slice(0, limit) : D.services;

    host.innerHTML = items.map(function (s, n) {
      var title = tr("services." + s.id + ".title") || s.title;
      var blurb = tr("services." + s.id + ".blurb") || s.blurb;
      var points = (I18N && I18N.services && I18N.services[s.id] && I18N.services[s.id].points) || s.points;
      return '<article class="service" data-n="' + (n < 9 ? "0" : "") + (n + 1) + '" ' +
             'id="' + esc(s.id) + '" data-reveal data-reveal-delay="' + (n % 4) + '">' +
        '<h3>' + title + '</h3>' +
        '<p class="small muted">' + blurb + '</p>' +
        '<ul>' + points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + '</ul>' +
      '</article>';
    }).join("");
  }

  function renderPromises() {
    var host = $("[data-promises]");
    if (!host) return;
    var items = (I18N && I18N.promises) || D.promises;
    host.innerHTML = items.map(function (p, n) {
      return '<div class="promise" data-reveal data-reveal-delay="' + (n % 4) + '">' +
        "<h3>" + esc(p.title) + "</h3><p>" + esc(p.body) + "</p></div>";
    }).join("");
  }

  /* ---- Get a Quote form (contact.html) -------------------------------------- */
  /* A structured way to send the same kind of enquiry the floating drawer
     sends. There is no backend anywhere on this site, so this never submits
     to a server — it only assembles a WhatsApp message from the fields and
     opens wa.me with it, same as every other enquiry path on the site. */
  function initQuoteForm() {
    var form = $("[data-quote-form]");
    if (!form) return;

    var select = $("[data-service-select]", form);
    if (select) {
      select.insertAdjacentHTML("beforeend", D.services.map(function (s) {
        var title = plain(tr("services." + s.id + ".title") || s.title);
        return '<option value="' + esc(title) + '">' + esc(title) + '</option>';
      }).join("") + '<option value="Something else">' + esc(tr("runtime.quoteForm.somethingElse") || "Something else") + '</option>');
    }

    var REQUIRED = ["name", "phone", "service", "quantity"];

    function field(name) { return form.elements[name]; }
    function errorEl(name) { return $('[data-error-for="' + name + '"]', form); }

    function setError(name, on) {
      var f = field(name);
      var err = errorEl(name);
      if (f && f.closest(".field")) f.closest(".field").classList.toggle("has-error", on);
      if (err) err.hidden = !on;
      if (f) f.setAttribute("aria-invalid", String(on));
    }

    function validate() {
      var firstInvalid = null;
      var ok = true;
      REQUIRED.forEach(function (name) {
        var f = field(name);
        var val = f ? String(f.value || "").trim() : "";
        var bad = !val || (name === "phone" && val.replace(/\D/g, "").length < 7);
        setError(name, bad);
        if (bad) { ok = false; firstInvalid = firstInvalid || f; }
      });
      if (firstInvalid) firstInvalid.focus();
      return ok;
    }

    /* YYYY-MM-DD straight out of <input type=date>, reformatted without ever
       constructing a Date object — new Date("YYYY-MM-DD") parses as UTC
       midnight, which can print as the previous day in an India-evening
       browser. Splitting the string sidesteps the whole timezone question. */
    function formatDeadline(iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
      return m ? (m[3] + "/" + m[2] + "/" + m[1]) : iso;
    }

    function waLink() {
      var b = D.business;
      var v = {};
      ["name", "phone", "service", "quantity", "sizes", "colours", "artwork", "deadline", "notes"]
        .forEach(function (name) { var f = field(name); v[name] = f ? String(f.value || "").trim() : ""; });

      var lines = [(tr("runtime.whatsappMessage.greeting") || "Hello Sri Venkateswara Printing Works,"), "",
        (tr("runtime.whatsappMessage.quoteFor") || "I would like a quotation for:")];
      lines.push((tr("runtime.quoteForm.itemLabel") || "Item/service:") + " " + v.service);
      lines.push((tr("runtime.quoteForm.quantityLabel") || "Quantity:") + " " + v.quantity);
      if (v.sizes)    lines.push((tr("runtime.quoteForm.sizesLabel") || "Sizes:") + " " + v.sizes);
      if (v.colours)  lines.push((tr("runtime.quoteForm.coloursLabel") || "Colours:") + " " + v.colours);
      if (v.artwork)  lines.push((tr("runtime.quoteForm.artworkLabel") || "Artwork:") + " " + v.artwork);
      if (v.deadline) lines.push((tr("runtime.quoteForm.deadlineLabel") || "Deadline:") + " " + formatDeadline(v.deadline));
      if (v.notes)    lines.push((tr("runtime.quoteForm.notesLabel") || "Notes:") + " " + v.notes);
      lines.push("", (tr("runtime.whatsappMessage.myName") || "My name:") + " " + v.name,
        (tr("runtime.quoteForm.myPhoneLabel") || "My phone:") + " " + v.phone);
      lines.push("", tr("runtime.whatsappMessage.sentFromSite") || "(Sent from your website)");

      return "https://wa.me/" + b.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
    }

    function announce(msg) {
      var live = $("[data-quote-form-live]", form);
      if (live) live.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        announce(tr("runtime.quoteForm.invalidAnnounce") || "Please fill in the highlighted fields before sending.");
        return;
      }
      announce(tr("runtime.quoteForm.openingAnnounce") || "Opening WhatsApp with your quote request.");
      window.open(waLink(), "_blank", "noopener");
    });

    /* Clear a field's error as soon as it stops being the problem, rather
       than making someone re-submit to find out they fixed it. */
    form.addEventListener("input", function (e) {
      var name = e.target && e.target.name;
      if (name && REQUIRED.indexOf(name) !== -1) {
        var val = String(e.target.value || "").trim();
        var stillBad = !val || (name === "phone" && val.replace(/\D/g, "").length < 7);
        if (!stillBad) setError(name, false);
      }
    });
  }

  /* ---- Go ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    buildLangSwitch();
    loadLocaleData(savedLocale() || "en", function () {
      fillCommon();
      renderDock();
      initHeader();
      renderServices();
      renderPromises();
      renderWork();
      initHero();
      Quote.init();
      initQuoteForm();
      initReveal();
      applyStaticI18n();
      /* The Design Book (sketchbook.js) registers its own DOMContentLoaded
         listener and always runs its first render before this fetch can
         possibly resolve — English every time, saved locale or not — so a
         saved non-English locale needs one explicit correction pass here,
         same as switchLocale() already does for a later, user-triggered
         change. window.SVSketchbook is guaranteed set by this point: fetch
         callbacks never run until the synchronous DOMContentLoaded dispatch
         (which is what sets it) has fully finished. */
      if (window.SVSketchbook) window.SVSketchbook.rerender();
      syncLangSwitch();
    });
  });

  /* The sketchbook loads after this file and needs the same helpers. */
  window.SVUI = {
    esc: esc, plain: plain, $: $, $$: $$,
    reduceMotion: reduceMotion,
    Lightbox: Lightbox,
    Quote: Quote,
    tr: tr, trf: trf, applyStaticI18n: applyStaticI18n,
    currentLocale: function () { return LOCALE; }
  };
})();
