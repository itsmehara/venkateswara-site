/* =========================================================================
   Sri Venkateswara — the design book
   -------------------------------------------------------------------------
   Turns the catalogue in data.js into an open sample book: the piece on the
   left leaf, its notes on the right, and one sheet of paper that lifts from
   one side and lays itself down on the other.

   It reads window.SV.sketchbook, which is the same work list the gallery
   uses — add a piece there and it appears here too, with no second list to
   keep in step.

   The gallery on work.html is the real, filterable listing. This is the
   pleasant way through, so nothing here is the only route to anything.
   ========================================================================= */
(function () {
  "use strict";

  var UI = window.SVUI, D = window.SV;
  if (!UI || !D) return;

  var TURN_MS = 900;
  var TURN_EASE = "cubic-bezier(.36, .06, .28, 1)";

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function init(root, items) {
    var index = 0, turning = false;

    /* ---- Markup ---------------------------------------------------------- */
    root.innerHTML =
      '<div class="sb-desk">' +
        '<div class="sb-stage">' +
          '<div class="sb-book">' +
            '<div class="sb-leaf sb-leaf--left" data-left></div>' +
            '<div class="sb-leaf sb-leaf--right" data-right></div>' +
            '<div class="sb-spine" aria-hidden="true"></div>' +
            '<div class="sb-sheet" data-sheet aria-hidden="true">' +
              '<div class="sb-face sb-face--front" data-face-front>' +
                '<div class="sb-face-shade"></div></div>' +
              '<div class="sb-face sb-face--back" data-face-back>' +
                '<div class="sb-face-shade"></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="sb-nav-row">' +
          '<button type="button" class="sb-nav" data-prev>' +
            '<span aria-hidden="true">&lsaquo;</span>' +
            '<span class="visually-hidden">Previous project</span></button>' +
          '<button type="button" class="sb-nav" data-next>' +
            '<span aria-hidden="true">&rsaquo;</span>' +
            '<span class="visually-hidden">Next project</span></button>' +
        '</div>' +
      '</div>' +

      '<div class="sb-tools">' +
        '<p class="sb-counter" data-counter></p>' +
        '<div class="sb-progress" aria-hidden="true"><span data-progress-fill></span></div>' +
      '</div>' +

      '<p class="sb-hint">Turn the pages with the buttons or the arrow keys. ' +
        'Click a piece to see it full size.</p>' +
      '<p class="visually-hidden" data-announce role="status" aria-live="polite"></p>' +

      '<ol class="sb-index" data-index></ol>';

    var $ = function (sel) { return root.querySelector(sel); };
    var book      = $(".sb-book");
    var leftLeaf  = $("[data-left]");
    var rightLeaf = $("[data-right]");
    var sheet     = $("[data-sheet]");
    var faceFront = $("[data-face-front]");
    var faceBack  = $("[data-face-back]");
    var counter   = $("[data-counter]");
    var progress  = $("[data-progress-fill]");
    var announce  = $("[data-announce]");
    var indexList = $("[data-index]");

    function buildIndex() {
      indexList.innerHTML = items.map(function (it, i) {
        var title = it.title;
        return '<li><button type="button" data-go="' + i + '">' +
          '<span class="n">' + pad(i + 1) + "</span>" +
          "<span>" + title + "</span></button></li>";
      }).join("");
      UI.$$("button", indexList).forEach(function (b, i) {
        if (i === index) b.setAttribute("aria-current", "true");
      });
    }
    buildIndex();

    /* ---- The two faces of a page ----------------------------------------- */
    function plateHTML(i) {
      var it = items[i];
      if (!it) return "";
      var mock = it.provenance === "mock";
      var alt = it.alt;
      var provLabel = mock ? "Sample" : "Delivered work";
      /* No plate number here any more — "Project NN / MM" on the facing page
         already carries it, so a second number on this side was redundant.
         The provenance badge (Delivered work / Sample) is the only thing
         this footer still needs to say. */
      return '<figure class="sb-plate">' +
        '<div class="sb-plate-frame' + (it.bookFit === "fill" ? " is-fill" : "") +
             '" data-frame>' +
          '<img src="' + UI.esc(it.image) + '" alt="' + UI.esc(alt) + '" loading="lazy" decoding="async">' +
        '</div>' +
        '<figcaption class="sb-plate-caption">' +
          '<span class="' + (mock ? "is-mock" : "") + '">' + UI.esc(provLabel) + "</span>" +
        "</figcaption>" +
      "</figure>";
    }

    function notesHTML(i) {
      var it = items[i];
      if (!it) return "";
      var mock = it.provenance === "mock";
      var service = D.services.filter(function (s) { return s.id === it.category; })[0];
      var title = it.title;
      var note  = it.note;
      var spec  = it.spec;
      var serviceTitle = service ? service.title : "&mdash;";
      var projectDesc = mock
        ? "A sample presentation, not a photograph of stock"
        : "A photograph of work delivered to a customer";

      return '<div class="sb-notes">' +
        '<p class="sb-notes-kicker">' +
          UI.esc("Project " + pad(i + 1) + " / " + pad(items.length)) + "</p>" +
        "<h3>" + title + "</h3>" +
        '<hr class="sb-rule">' +
        '<p class="sb-notes-desc">' + UI.esc(note) + "</p>" +
        '<ul class="sb-notes-meta">' +
          '<li><span class="k">' + UI.esc("Service") + '</span><span class="v">' +
            serviceTitle + "</span></li>" +
          '<li><span class="k">' + UI.esc("Project") + '</span><span class="v">' +
            UI.esc(projectDesc) +
          "</span></li>" +
          '<li><span class="k">' + UI.esc("Notes") + '</span><span class="v">' + UI.esc(spec) + "</span></li>" +
        "</ul>" +
        '<div class="sb-notes-actions">' +
          '<button type="button" class="sb-tool" data-open-full>' + UI.esc("View full size") + '</button>' +
          '<button type="button" class="sb-tool sb-tool--primary" data-add="' + UI.esc(it.id) + '" ' +
                  'aria-pressed="false">' +
            '<span aria-hidden="true">+</span> ' +
            '<span class="btn-add-text">' + UI.esc("Add to enquiry") + '</span></button>' +
        "</div>" +
      "</div>";
    }

    function setLeft(i)  { leftLeaf.innerHTML  = plateHTML(i); }
    function setRight(i) { rightLeaf.innerHTML = notesHTML(i); syncAdd(); }

    /* The add button is re-created every time a leaf is swapped, so its
       pressed state has to be read back off the shared quote list. */
    function syncAdd() {
      var btn = rightLeaf.querySelector("[data-add]");
      if (!btn) return;
      var stored = [];
      try { stored = JSON.parse(localStorage.getItem("sv-quote-v1")) || []; }
      catch (err) { stored = []; }
      var on = stored.indexOf(btn.getAttribute("data-add")) !== -1;
      btn.setAttribute("aria-pressed", String(on));
      var label = btn.querySelector(".btn-add-text");
      if (label) label.textContent = on ? "Added" : "Add to enquiry";
    }

    function setChrome() {
      /* Just "NN / MM" here — the fuller "Project NN / MM" phrasing already
         lives on the page itself as the notes kicker, so this bottom
         indicator (and the progress track beside it) stays terse. */
      counter.textContent = pad(index + 1) + " / " + pad(items.length);
      if (progress) progress.style.width = ((index + 1) / items.length * 100) + "%";
      var title = UI.plain(items[index].title);
      announce.textContent = "Project " + (index + 1) + " of " + items.length + ", " + title;
      $("[data-prev]").disabled = turning || index === 0;
      $("[data-next]").disabled = turning || index === items.length - 1;
      UI.$$("button", indexList).forEach(function (b, i) {
        if (i === index) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }

    /* ---- Turning ---------------------------------------------------------- */
    /* One sheet, the way a book actually behaves. Going forward you take the
       right-hand page, sweep it across the spine and lay it down on the left;
       its front is the page you were reading and its back is the plate you
       are turning to. Going back, the same sheet travels the other way.

       While the sheet is upright, the half it came from already shows the
       page beneath it, and the half it is heading for keeps its old page
       until the sheet covers it. That is why the leaves are swapped at two
       different moments rather than both at the start. */
    function go(to, viaIndex) {
      if (turning) return;
      var next = Math.max(0, Math.min(items.length - 1, to));
      if (next === index) return;
      var forward = next > index;

      if (viaIndex) {
        book.scrollIntoView({ block: "nearest", behavior: UI.reduceMotion() ? "auto" : "smooth" });
      }

      /* Reduced motion gets no turn at all — just the new page. */
      if (UI.reduceMotion()) {
        index = next;
        setLeft(index); setRight(index); setChrome();
        return;
      }

      var from = index;
      index = next;
      turning = true;
      setChrome();

      /* On a phone the leaves are stacked, so the sideways turn has no spine
         to hinge on. The plate flips up instead. */
      if (window.matchMedia("(max-width: 760px)").matches) {
        return turnUp(from, next, forward);
      }

      if (forward) {
        setFace(faceFront, notesHTML(from), "right");
        setFace(faceBack,  plateHTML(next), "left");
        setRight(next);                    /* revealed as the sheet lifts */
      } else {
        setFace(faceFront, plateHTML(from), "left");
        setFace(faceBack,  notesHTML(next), "right");
        setLeft(next);
      }

      sheet.classList.add("is-visible", forward ? "from-right" : "from-left");

      var shades = sheet.querySelectorAll(".sb-face-shade");
      var spin = sheet.animate([
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(" + (forward ? -90 : 90) + "deg)", offset: .5 },
        { transform: "rotateY(" + (forward ? -180 : 180) + "deg)" }
      ], { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });

      shades[0].animate([{ opacity: 0 }, { opacity: .5 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });
      shades[1].animate([{ opacity: .5 }, { opacity: 0 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });

      var settled = false;
      var finish = function () {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        try { spin.cancel(); } catch (err) { /* already gone */ }

        /* The half the sheet has just covered catches up underneath it. */
        if (forward) setLeft(next); else setRight(next);

        sheet.classList.remove("is-visible", "from-right", "from-left");
        faceFront.innerHTML = '<div class="sb-face-shade"></div>';
        faceBack.innerHTML  = '<div class="sb-face-shade"></div>';
        turning = false;
        setChrome();
      };
      /* Animations stall in a backgrounded tab. Never strand the book. */
      var guard = setTimeout(finish, TURN_MS + 800);
      spin.finished.then(finish, finish);
    }

    /* ---- The upward turn (phones) ----------------------------------------- */
    /* Only the plate flips: it is the thing you are turning to, the notes
       below it are the caption. The sheet is measured onto the plate leaf
       rather than sized in CSS, because that leaf's height comes from the
       picture inside it and changes from one plate to the next. */
    function turnUp(from, next, forward) {
      var lr = leftLeaf.getBoundingClientRect();
      var br = book.getBoundingClientRect();

      sheet.style.top    = (lr.top - br.top) + "px";
      sheet.style.left   = (lr.left - br.left) + "px";
      sheet.style.width  = lr.width + "px";
      sheet.style.height = lr.height + "px";

      /* Going forward you see the page you were on and it lifts away; going
         back, the page you are returning to falls down over the top. So the
         faces swap and the sweep runs the other way. */
      setFace(faceFront, plateHTML(forward ? from : next), "left");
      setFace(faceBack,  plateHTML(forward ? next : from), "left");

      sheet.classList.add("is-visible", "is-up");

      /* What is underneath is already the destination, so when the sheet
         clears there is nothing left to catch up. */
      setLeft(next);
      setRight(next);

      var shades = sheet.querySelectorAll(".sb-face-shade");
      var frames = forward
        ? [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-180deg)" }]
        : [{ transform: "rotateX(-180deg)" }, { transform: "rotateX(0deg)" }];

      var spin = sheet.animate(frames,
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });
      shades[0].animate([{ opacity: forward ? 0 : .5 }, { opacity: forward ? .5 : 0 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });
      shades[1].animate([{ opacity: forward ? .5 : 0 }, { opacity: forward ? 0 : .5 }],
        { duration: TURN_MS, easing: TURN_EASE, fill: "forwards" });

      var settled = false;
      var done = function () {
        if (settled) return;
        settled = true;
        clearTimeout(guard);
        try { spin.cancel(); } catch (err) { /* already gone */ }

        sheet.classList.remove("is-visible", "is-up");
        sheet.style.top = sheet.style.left = sheet.style.width = sheet.style.height = "";
        faceFront.innerHTML = '<div class="sb-face-shade"></div>';
        faceBack.innerHTML  = '<div class="sb-face-shade"></div>';
        turning = false;
        setChrome();
      };
      var guard = setTimeout(done, TURN_MS + 800);
      spin.finished.then(done, done);
    }

    function setFace(face, html, side) {
      face.innerHTML = '<div class="sb-leaf sb-leaf--' + side + '">' + html + "</div>" +
                       '<div class="sb-face-shade"></div>';
    }

    /* ---- Wiring ----------------------------------------------------------- */
    root.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-prev]")) return go(index - 1);
      if (t.closest("[data-next]")) return go(index + 1);
      if (t.closest("[data-open-full]") || t.closest("[data-frame]")) {
        if (!turning) UI.Lightbox.open(items, index);
        return;
      }
      /* Add-to-enquiry is handled by the delegated listener in site.js; this
         only refreshes the label, since the button lives on a leaf that is
         re-rendered rather than in the shared grid. */
      if (t.closest("[data-add]")) { setTimeout(syncAdd, 0); return; }

      var jump = t.closest("[data-go]");
      if (jump) return go(Number(jump.getAttribute("data-go")), true);
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    });

    setLeft(index);
    setRight(index);
    setChrome();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("sketchbook");
    if (!root) return;

    var items = (D.sketchbook || []).slice();
    if (!items.length) { root.hidden = true; return; }

    init(root, items);
  });
})();
