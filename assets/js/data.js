/* =========================================================================
   Sri Venkateswara Screen & Textile Printing Works — site data
   -------------------------------------------------------------------------
   Every piece of content the pages read lives here, so there is one list to
   keep in step rather than the same product typed into four HTML files.

   `provenance` is not decoration. The owner's real photographs and the
   generated demonstration mockups are both used on this site, and the two
   are never allowed to look like the same claim:

     "real"  — a photograph of work actually delivered to a customer.
     "mock"  — a demonstration of what a finished order looks like.

   Anything marked "mock" is captioned as a sample on the page. Do not
   change a mock to real without a real photograph to replace it with.
   ========================================================================= */
window.SV = (function () {
  "use strict";

  /* ---- The shop ---------------------------------------------------------- */
  var business = {
    name: "Sri Venkateswara",
    nameFull: "Sri Venkateswara Screen & Textile Printing Works",
    tagline: "Screen &amp; Textile Printing Works",
    owner: "Venkatesh",
    since: null,                    /* not recorded yet — ask the owner */

    phone: "+91 98481 71762",
    phoneAlt: "+91 90301 71762",
    whatsapp: "919848171762",       /* wa.me form: country code, no symbols */
    email: "venkysmavuri@gmail.com",

    address: {
      line1: "Near Sambashiva Temple, Chinarajupeta",
      line2: "Perugu Bazar",
      city: "Anakapalle",
      pin: "531 001",
      district: "Visakhapatnam",
      state: "Andhra Pradesh"
    },

    /* Not confirmed by the owner yet. Shown with an honest note until it is. */
    hours: null
  };

  /* ---- What the shop does ------------------------------------------------ */
  var services = [
    {
      id: "tshirts",
      label: "T-Shirts &amp; Garments",
      title: "T-Shirt &amp; Garment Printing",
      short: "Screen printing on tees, polos and jerseys",
      blurb: "Single colour or full multi-colour artwork, printed to hold its " +
             "shape through wash after wash. Event tees, team kits, college " +
             "batches, family functions.",
      icon: "tshirt",
      image: "assets/img/products/tshirt-legends-flatlay_a.webp",
      points: [
        "Screen printing in one colour or many",
        "Front, back, sleeve and pocket placements",
        "Event, college, team and family orders",
        "Small runs through to bulk quantity"
      ]
    },
    {
      id: "uniforms",
      label: "Uniforms",
      title: "Bulk Uniform Stitching",
      short: "Stitched to measure, branded, delivered",
      blurb: "Bulk orders taken end to end: uniforms custom stitched to your " +
             "sizes, branded with your logo, and delivered as a finished order. " +
             "Branding is embroidered or screen printed, whichever you prefer.",
      icon: "uniform",
      image: "assets/img/products/uniform-thadi-tigers-studio.webp",
      points: [
        "Custom stitched to your measurements",
        "Your logo embroidered or screen printed",
        "Schools, factories, shops, sports teams",
        "Delivered as one completed order"
      ]
    },
    {
      id: "caps",
      label: "Caps &amp; Hats",
      title: "Custom Caps &amp; Hats",
      short: "Stitched to spec, then branded",
      blurb: "Caps and wide-brim hats stitched in the colours you need, then " +
             "branded to match the rest of your uniform. Ordered in bulk for " +
             "staff, events and promotions.",
      icon: "cap",
      image: "assets/img/products/caps-custom-color-lineup.webp",
      points: [
        "Six-panel caps and wide-brim hats",
        "Stitched in your choice of colour",
        "Embroidered or printed branding",
        "Matched to your uniform order"
      ]
    },
    {
      id: "flags",
      label: "Cloth Flags",
      title: "Cloth Flags",
      short: "Printed cloth flags, any size",
      blurb: "Cloth flags printed for parties, associations, temples, schools " +
             "and campaigns — made in the size and quantity the occasion needs.",
      icon: "flag",
      image: null,
      points: [
        "Printed on cloth, not paper",
        "Party, association and temple flags",
        "Made to the size you need",
        "Bulk quantities for events"
      ]
    },
    {
      id: "jute-bags",
      label: "Jute Bags",
      title: "Jute Bag Printing",
      short: "Printed jute bags for weddings &amp; events",
      blurb: "Jute bags printed with your own design &mdash; the whole invitation on the " +
             "bag itself, the way housewarming and wedding invites are often given here, " +
             "or a plain carry bag branded for a shop or institution. Natural or coloured " +
             "jute, your wording in Telugu or English.",
      icon: "bag",
      image: "assets/img/products/jute-wedding-pair-studio.webp",
      points: [
        "Wedding, housewarming and celebration bags",
        "Institutional and event branding",
        "Multiple jute colours and edge bindings",
        "Bulk orders, packed and delivered"
      ]
    },
    {
      id: "print",
      label: "Cards &amp; Stamps",
      title: "Cards, Books &amp; Stamps",
      short: "Visiting cards, book works, rubber stamps",
      blurb: "The everyday printing a business runs on — visiting cards, bill " +
             "books and registers, and rubber stamps made to order.",
      icon: "card",
      image: null,
      points: [
        "Visiting cards",
        "Book works — bill books, registers",
        "Rubber stamps made to order",
        "Quick turnaround on repeat orders"
      ]
    }
  ];

  /* ---- Work you can look through, and add to an enquiry ------------------ */
  /* `provenance` drives the badge on every card. See the note at the top. */
  var work = [
    {
      id: "tee-legends",
      title: "Event T-Shirt — Multi-Colour Print",
      category: "tshirts",
      image: "assets/img/products/tshirt-legends-flatlay_a.webp",
      provenance: "real",
      alt: "Black T-shirt printed with a white and yellow birthday design",
      note: "Black cotton tee, multi-colour screen print across the chest.",
      spec: "Printed for a customer's event order."
    },
    {
      id: "jersey-sekhar",
      title: "Sports Jersey — Name &amp; Number",
      category: "uniforms",
      image: "assets/img/products/uniform-jersey-sekhar-143.webp",
      provenance: "real",
      alt: "Mint green sports jersey printed with a name and the number 143",
      note: "Mint jersey with black piping, name and number on the back.",
      spec: "Team kit, printed and delivered."
    },
    {
      id: "polo-thadi",
      title: "Team Polo — Chest Logo",
      category: "uniforms",
      image: "assets/img/products/uniform-thadi-tigers-studio.webp",
      provenance: "real",
      alt: "Light green polo shirt with black contrast panels and a tiger crest",
      note: "Light green polo, black contrast panels, printed crest.",
      spec: "Supplied as a bulk team order."
    },
    {
      id: "polo-cheyutha",
      title: "Foundation Uniform Polo",
      category: "uniforms",
      image: "assets/img/products/uniform-orange-cheyutha-studio.webp",
      provenance: "real",
      alt: "Orange piqué polo shirt printed with a foundation's logo",
      note: "Orange piqué polo printed for a foundation's field staff.",
      spec: "Bulk uniform order with chest branding."
    },
    {
      id: "hat-wide-brim",
      title: "Wide-Brim Hat — Stitched In-House",
      category: "caps",
      image: "assets/img/products/cap-wide-brim-studio.webp",
      provenance: "real",
      alt: "Plain white wide-brim cotton hat with concentric brim stitching",
      note: "Stitched in the workshop, shown blank before branding.",
      spec: "Branding added to order — printed or embroidered."
    },
    {
      id: "caps-bulk-white",
      title: "Blank Caps — Bulk Stock",
      category: "caps",
      image: "assets/img/products/caps-bulk-white-studio-grid.webp",
      provenance: "mock",
      alt: "Twelve blank white six-panel caps arranged in three rows",
      note: "Six-panel caps held blank, ready for your branding.",
      spec: "Sample presentation of a bulk cap order."
    },
    {
      id: "caps-colour-range",
      title: "Cap Colour Range",
      category: "caps",
      image: "assets/img/products/caps-custom-color-lineup.webp",
      provenance: "mock",
      alt: "A row of caps in black, white, red and navy, some carrying a logo",
      note: "Black, white, red and navy — matched to your uniform.",
      spec: "Sample showing colour options and logo placement."
    },
    {
      id: "caps-embroidered",
      title: "Embroidered Cap Branding",
      category: "caps",
      image: "assets/img/products/caps-custom-embroidered-stack.webp",
      provenance: "mock",
      alt: "A stack of black, red and white caps with embroidered front logos",
      note: "Stitched thread branding, raised and hard-wearing.",
      spec: "Sample of embroidered branding on a bulk order."
    },
    {
      id: "caps-services",
      title: "Print &amp; Embroidery Together",
      category: "caps",
      image: "assets/img/products/caps-custom-services-flatlay.webp",
      provenance: "mock",
      alt: "A flat-lay of caps in several colours, centre ones carrying a logo",
      note: "Both finishes, side by side, on one order.",
      spec: "Sample showing print and embroidery options."
    },
    {
      id: "jute-wedding-pair",
      title: "Wedding Invitation Bags",
      category: "jute-bags",
      image: "assets/img/products/jute-wedding-pair-studio.webp",
      provenance: "real",
      alt: "Two natural jute bags with tan handles, printed with a Telugu housewarming invitation in burgundy",
      note: "Natural jute, tan binding and handles, printed with a full housewarming invitation.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "jute-pink-custom",
      title: "Custom-Colour Wedding Bag",
      category: "jute-bags",
      image: "assets/img/products/jute-pink-custom-studio.webp",
      provenance: "real",
      alt: "Bright pink jute bag printed with a Telugu wedding invitation in white",
      note: "Bright pink jute, printed wedding invitation in white across the front.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "jute-bulk-dispatch",
      title: "Bulk Order, Packed for Dispatch",
      category: "jute-bags",
      image: "assets/img/products/jute-finished-bulk-dispatch.webp",
      provenance: "mock",
      /* The bags and the printed event artwork are genuine — a real
         completed order — but the tidy banded stacks and cartons are a
         presentation arrangement, not a photograph of an actual dispatch
         floor. Said plainly rather than left to look like a documentary
         shot of a facility that hasn't been shown to exist. */
      alt: "Stacks of jute bags banded by colour, printed for a teachers' association anniversary event, beside plain cartons",
      note: "Bags and printing are from a genuine completed order; shown here organised for presentation.",
      spec: "Sample presentation of a real bulk order, not a photograph of a packing facility."
    },
    {
      id: "couple-together-forever",
      title: "Coordinated Couple Tees",
      category: "tshirts",
      image: "assets/img/products/couple-tshirts-together-forever.webp",
      provenance: "real",
      alt: "Two white T-shirts with matching navy and orange silhouette artwork, reading Let's Be Together and Let's Be Forever",
      note: "A matched pair, one design split across two shirts to read as a couple.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "couple-wedding-lastname",
      title: "Wedding &amp; Engagement Pair",
      category: "tshirts",
      image: "assets/img/products/couple-tshirts-stole-heart-last-name.webp",
      provenance: "real",
      alt: "Two white T-shirts printed in black and red, reading I Stole Her Heart and So I'm Stealing His Last Name",
      note: "A wedding-announcement pair, printed with a shared joke across both shirts.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "couple-heartbeat",
      title: "Anniversary Print Pair",
      category: "tshirts",
      image: "assets/img/products/couple-tshirts-heartbeat-him-her.webp",
      provenance: "real",
      alt: "Two black T-shirts with mirrored gold heartbeat-and-heart artwork, reading My Heart Belong to Him and My Heart Belong to Her",
      note: "Mirrored artwork on black cotton, printed to mark an anniversary.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "couple-trapped-trap",
      title: "Custom Full-Colour Couple Tees",
      category: "tshirts",
      image: "assets/img/products/couple-tshirts-trapped-trap.webp",
      provenance: "real",
      alt: "Two white T-shirts with full-colour graphic panels reading I Am Trapped and I Am The Trap, each dated Since 29 12 2021",
      note: "Full-colour artwork with a personalised date, printed panel to panel across the pair.",
      spec: "Photographed from a real customer order."
    },
    {
      id: "print-detail",
      title: "Textile Print Detail",
      category: "tshirts",
      image: "assets/img/products/textile-print-detail.webp",
      provenance: "real",
      alt: "Close view of a multicolour print on woven textile",
      note: "Multi-colour print sitting into the weave of the cloth.",
      spec: "Close detail from a finished piece."
    },
    {
      id: "caps-gcl",
      title: "Cap Order — Delivered",
      category: "caps",
      image: "assets/img/products/caps-gcl-bulk-order.webp",
      provenance: "real",
      alt: "Printed caps packed together from a completed bulk order",
      note: "A completed cap order, packed for the customer.",
      spec: "Photograph from a real delivered order."
    }
  ];

  /* Appended rather than written inline above, so the seven-service list
     above stays the original set the site launched with, and this one reads
     as what it is: added afterwards, once the owner mentioned the skill. */
  services.push({
    id: "invitations",
    label: "Wedding Cards",
    title: "Wedding Cards &amp; Invitations",
    short: "Invitations, built and printed",
    blurb: "Wedding and function invitations built from scratch &mdash; the layout, " +
           "the printing and the card construction itself, not just run off a fixed " +
           "template. Matched jute-bag invitations are made on request.",
    icon: "card",
    image: null,
    points: [
      "Wedding and housewarming invitations",
      "Custom layout, not a fixed template",
      "Multi-fold and inset card construction",
      "Matched jute-bag invitations on request"
    ]
  });

  /* ---- The sketchbook ---------------------------------------------------- */
  /* One spread per plate: the piece on the left, its notes on the right.
     Reuses the work list so there is no second catalogue to maintain. */
  var sketchbook = work.filter(function (w) { return !!w.image; });

  /* ---- Why people come back ---------------------------------------------- */
  var promises = [
    {
      title: "One shop, start to finish",
      body: "Stitching, printing and embroidery all happen under the same roof, " +
            "so a uniform order is one conversation, not three."
    },
    {
      title: "Your artwork, printed faithfully",
      body: "The design you approve is the design that goes on the cloth — " +
            "same colours, same placement, across every piece in the run."
    },
    {
      title: "Bulk without the drop in quality",
      body: "Fifty pieces or five hundred, each one is checked before it is " +
            "packed. Quantity is not an excuse."
    },
    {
      title: "Talk to the owner directly",
      body: "Venkatesh takes the enquiry, quotes the job and sees it through. " +
            "There is no counter staff to explain it to twice."
    }
  ];

  return {
    business: business,
    services: services,
    work: work,
    sketchbook: sketchbook,
    promises: promises
  };
})();
