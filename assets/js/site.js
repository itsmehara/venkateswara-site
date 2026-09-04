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
          '<span class="visually-hidden">Slide ' + (n + 1) + '</span></button>';
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
    play();
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
      box.innerHTML =
        '<button type="button" class="lightbox-close" data-close>' +
          '<span aria-hidden="true">&times;</span>' +
          '<span class="visually-hidden">Close</span></button>' +
        '<button type="button" class="lightbox-nav lightbox-nav--prev" data-prev>' +
          '<span aria-hidden="true">&lsaquo;</span>' +
          '<span class="visually-hidden">Previous</span></button>' +
        '<button type="button" class="lightbox-nav lightbox-nav--next" data-next>' +
          '<span aria-hidden="true">&rsaquo;</span>' +
          '<span class="visually-hidden">Next</span></button>' +
        '<figure class="lightbox-figure">' +
          '<img data-img src="" alt="">' +
          '<figcaption data-cap></figcaption>' +
        '</figure>';
      document.body.appendChild(box);

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
      $("[data-img]", box).src = it.image;
      $("[data-img]", box).alt = it.alt || plain(it.title);
      $("[data-cap]", box).textContent =
        plain(it.title) + (it.note ? " — " + plain(it.note) : "") +
        (it.provenance === "mock" ? "  (Sample presentation, not a photograph of stock.)" : "");
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
      var lines = ["Hello Sri Venkateswara Printing Works,", ""];

      if (ids.length) {
        lines.push("I would like a quotation for:");
        ids.forEach(function (id, n) {
          var it = itemById(id);
          if (it) lines.push((n + 1) + ". " + plain(it.title));
        });
      } else {
        lines.push("I would like to ask about your printing work.");
      }

      var who = nameField && nameField.value.trim();
      var note = noteField && noteField.value.trim();
      if (note) { lines.push("", "Details: " + note); }
      if (who)  { lines.push("", "My name: " + who); }

      lines.push("", "(Sent from your website)");

      return "https://wa.me/" + b.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
    }

    function render() {
      if (!list) return;

      if (!ids.length) {
        list.innerHTML =
          '<li class="quote-empty"><strong>Nothing added yet</strong>' +
          'Browse the work and press “Add to enquiry” on anything close to ' +
          'what you need. Send them all to Venkatesh in one message.</li>';
      } else {
        list.innerHTML = ids.map(function (id) {
          var it = itemById(id);
          if (!it) return "";
          return '<li class="quote-item">' +
            '<img src="' + esc(it.image) + '" alt="" loading="lazy">' +
            '<div><div class="quote-item-name">' + it.title + '</div>' +
              '<div class="quote-item-meta">' +
                (it.provenance === "mock" ? "Sample" : "Delivered work") +
              '</div></div>' +
            '<button type="button" class="quote-remove" data-remove="' + esc(id) + '">' +
              '<span aria-hidden="true">&times;</span>' +
              '<span class="visually-hidden">Remove ' + it.title + '</span></button>' +
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
        if (label) label.textContent = on ? "Added" : "Add to enquiry";
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
      announce(plain((itemById(id) || {}).title) + " added to your enquiry.");
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

    return { init: init, add: add, open: function () { toggle(true); } };
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
      '<a class="wa-fab" href="https://wa.me/' + esc(b.whatsapp) +
         '?text=' + encodeURIComponent("Hello Sri Venkateswara Printing Works, I have an enquiry.") + '" ' +
         'target="_blank" rel="noopener">' +
        '<span class="fab-label">Chat on WhatsApp</span>' + waIcon() +
        '<span class="visually-hidden">Chat with us on WhatsApp (opens WhatsApp)</span></a>' +

      '<button type="button" class="quote-fab" data-empty="true" aria-expanded="false" ' +
        'aria-controls="quote-panel">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>' +
          '<path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<span class="fab-text">My enquiry</span>' +
        '<span class="quote-count">0</span>' +
        '<span class="visually-hidden">Open your enquiry list</span>' +
      '</button>';

    var panel = document.createElement("div");
    panel.className = "quote-panel";
    panel.id = "quote-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Your enquiry list");
    panel.innerHTML =
      '<div class="quote-head">' +
        '<h2>Your enquiry</h2>' +
        '<button type="button" class="quote-close" data-quote-close>' +
          '<span aria-hidden="true">&times;</span>' +
          '<span class="visually-hidden">Close</span></button>' +
      '</div>' +
      '<ul class="quote-items"></ul>' +
      '<div class="quote-foot">' +
        '<div>' +
          '<label for="q-name">Your name (optional)</label>' +
          '<input id="q-name" type="text" data-quote-name autocomplete="name" ' +
                 'placeholder="So Venkatesh knows who is asking">' +
        '</div>' +
        '<div>' +
          '<label for="q-note">Quantity, sizes, colours</label>' +
          '<textarea id="q-note" rows="2" data-quote-note ' +
            'placeholder="e.g. 60 polos, mixed sizes, logo on chest"></textarea>' +
        '</div>' +
        '<a class="btn btn--block quote-send" data-send href="#" target="_blank" rel="noopener">' +
          waIcon() + 'Send on WhatsApp</a>' +
        '<p class="small muted" style="margin:0;text-align:center">' +
          'Opens WhatsApp with your list ready. Nothing is sent until you press send.</p>' +
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
      el.href = "https://wa.me/" + b.whatsapp +
        "?text=" + encodeURIComponent("Hello Sri Venkateswara Printing Works, I have an enquiry.");
    });
  }

  /* ---- Work cards ---------------------------------------------------------- */
  /* Used by the home page (a few) and the work page (all of them). */
  function workCard(it) {
    var isMock = it.provenance === "mock";
    return '<article class="card" data-cat="' + esc(it.category) + '" data-reveal>' +
      '<div class="card-media grain">' +
        '<span class="badge badge--' + (isMock ? "mock" : "real") + '">' +
          (isMock ? "Sample" : "Delivered work") + '</span>' +
        '<img src="' + esc(it.image) + '" alt="' + esc(it.alt) + '" loading="lazy" ' +
             'data-zoom="' + esc(it.id) + '">' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + it.title + '</h3>' +
        '<p class="small muted">' + esc(it.note) + '</p>' +
        '<div class="card-foot">' +
          '<span class="small muted">' + esc(it.spec) + '</span>' +
          '<button type="button" class="btn-add" data-add="' + esc(it.id) + '" ' +
                  'aria-pressed="false">' +
            '<span aria-hidden="true">+</span>' +
            '<span class="btn-add-text">Add to enquiry</span></button>' +
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

    var cats = [{ id: "all", title: "Everything" }].concat(
      D.services.filter(function (s) {
        return D.work.some(function (w) { return w.category === s.id; });
      }).map(function (s) { return { id: s.id, title: s.label }; })
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
      return '<article class="service" data-n="' + (n < 9 ? "0" : "") + (n + 1) + '" ' +
             'id="' + esc(s.id) + '" data-reveal data-reveal-delay="' + (n % 4) + '">' +
        '<h3>' + s.title + '</h3>' +
        '<p class="small muted">' + s.blurb + '</p>' +
        '<ul>' + s.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + '</ul>' +
      '</article>';
    }).join("");
  }

  function renderPromises() {
    var host = $("[data-promises]");
    if (!host) return;
    host.innerHTML = D.promises.map(function (p, n) {
      return '<div class="promise" data-reveal data-reveal-delay="' + (n % 4) + '">' +
        "<h3>" + esc(p.title) + "</h3><p>" + esc(p.body) + "</p></div>";
    }).join("");
  }

  /* ---- Go ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    fillCommon();
    renderDock();
    initHeader();
    renderServices();
    renderPromises();
    renderWork();
    initHero();
    Quote.init();
    initReveal();
  });

  /* The sketchbook loads after this file and needs the same helpers. */
  window.SVUI = {
    esc: esc, plain: plain, $: $, $$: $$,
    reduceMotion: reduceMotion,
    Lightbox: Lightbox,
    Quote: Quote
  };
})();
