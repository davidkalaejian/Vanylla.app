/* Vanylla — marketing site script. Vanilla JS, no dependencies, no third-party requests, no cookies, no analytics. */

// ---------------------------------------------------------------------------------------------------------------
// The App Store link. This is the ONLY place it lives.
// Every download button reads "Download on the App Store". Set this to the full listing URL, e.g.
// "https://apps.apple.com/app/id0000000000", and every button on every page links there. While it is empty the
// buttons point to the download section of the landing page (set it before the site is shared).
// ---------------------------------------------------------------------------------------------------------------
const APP_STORE_URL = "";

(function () {
  "use strict";
  window.VANYLLA_READY = true;

  var root = document.documentElement;
  var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var finePointer = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : false;
  function reduced() { return reduceQuery.matches; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- Download buttons ---------- */
  function initStore() {
    var url = String(APP_STORE_URL || "").trim();
    var valid = /^https:\/\/[^\s"'<>]+$/.test(url);
    $$("[data-store]").forEach(function (a) {
      a.setAttribute("aria-label", "Download on the App Store");
      if (valid) {
        a.setAttribute("href", url);
        a.setAttribute("rel", "noopener");
      }
      // Otherwise keep the authored in-page target (#download, or index.html#download on other pages).
    });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return null;
    var btn = $("[data-menu]", nav);
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      if (btn) {
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        $(".visually-hidden", btn).textContent = open ? "Close menu" : "Menu";
      }
    }
    if (btn) btn.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    $$(".nav-sheet a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); if (btn) btn.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setOpen(false); });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
    return nav;
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    $$("[data-stagger]").forEach(function (group) {
      $$(".reveal", group).forEach(function (el, i) {
        if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", String(i));
      });
    });
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          entry.target.dispatchEvent(new CustomEvent("reveal"));
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll and pointer effects (transform/opacity/filter only) ---------- */
  function initScrollFx(nav) {
    var hero = $("[data-hero]");
    var heroCopy = $("[data-hero-copy]");
    var depthEls = $$("[data-depth]");
    var washes = $$("[data-shift]");
    var shiftEls = $$("[data-shift-el]");
    var mx = 0, my = 0, ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var vh = window.innerHeight;
      if (nav) nav.classList.toggle("is-scrolled", y > 12);
      root.classList.toggle("at-end", y + vh >= document.documentElement.scrollHeight - 8);
      if (reduced()) return;

      if (hero) {
        var hh = hero.offsetHeight;
        if (y < hh * 1.3) {
          depthEls.forEach(function (el) {
            var d = parseFloat(el.getAttribute("data-depth")) || 0;
            el.style.transform = "translate3d(" + (mx * d * 70).toFixed(2) + "px," + (-y * d * 1.6 + my * d * 40).toFixed(2) + "px,0)";
          });
          if (heroCopy) {
            var p = clamp((y - vh * 0.2) / (vh * 0.55), 0, 1);
            heroCopy.style.opacity = String(1 - p);
            heroCopy.style.transform = p > 0 ? "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)" : "";
            heroCopy.style.filter = p > 0.01 ? "blur(" + (p * 6).toFixed(2) + "px)" : "";
            heroCopy.style.pointerEvents = p > 0.9 ? "none" : "";
          }
        }
      }
      washes.forEach(function (w) {
        var sec = w.parentElement;
        var r = sec.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        var f = parseFloat(w.getAttribute("data-shift")) || 0.1;
        w.style.setProperty("--shift", ((r.top + r.height / 2 - vh / 2) * -f).toFixed(1) + "px");
      });
      shiftEls.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        var f = parseFloat(el.getAttribute("data-shift-el")) || 0.06;
        el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -f).toFixed(1) + "px,0)";
      });
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    if (hero && finePointer) {
      hero.addEventListener("pointermove", function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        request();
      });
      hero.addEventListener("pointerleave", function () { mx = 0; my = 0; request(); });
    }
    var onPref = function () {
      if (reduced()) {
        depthEls.concat(shiftEls).forEach(function (el) { el.style.transform = ""; });
        if (heroCopy) { heroCopy.style.opacity = ""; heroCopy.style.transform = ""; heroCopy.style.filter = ""; heroCopy.style.pointerEvents = ""; }
        washes.forEach(function (w) { w.style.removeProperty("--shift"); });
      }
      request();
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onPref);
    update();
  }

  /* ---------- Segmented thumbs ---------- */
  function moveThumb(seg, btn) {
    if (!seg || !btn || !seg.classList.contains("seg")) return;
    seg.style.setProperty("--x", btn.offsetLeft + "px");
    seg.style.setProperty("--w", btn.offsetWidth + "px");
  }
  function refreshThumbs(instant) {
    $$(".seg").forEach(function (seg) {
      var on = $('[aria-selected="true"], [aria-checked="true"]', seg);
      if (!on) return;
      if (instant === true) seg.classList.add("no-anim");
      moveThumb(seg, on);
      if (instant === true) requestAnimationFrame(function () { requestAnimationFrame(function () { seg.classList.remove("no-anim"); }); });
    });
  }

  /* ---------- Keyboard helpers for tabs and radio groups ---------- */
  function arrowIndex(key, i, n) {
    if (key === "ArrowRight" || key === "ArrowDown") return (i + 1) % n;
    if (key === "ArrowLeft" || key === "ArrowUp") return (i - 1 + n) % n;
    if (key === "Home") return 0;
    if (key === "End") return n - 1;
    return -1;
  }

  function initRadio(group, onChange) {
    var items = $$('[role="radio"]', group);
    function select(item, focus, user) {
      items.forEach(function (it) {
        var on = it === item;
        it.setAttribute("aria-checked", on ? "true" : "false");
        it.tabIndex = on ? 0 : -1;
      });
      if (focus) item.focus();
      moveThumb(group, item);
      onChange(item.getAttribute("data-value"), !!user);
    }
    items.forEach(function (it) { it.addEventListener("click", function () { select(it, false, true); }); });
    group.addEventListener("keydown", function (e) {
      var i = items.indexOf(document.activeElement);
      if (i < 0) return;
      var n = arrowIndex(e.key, i, items.length);
      if (n >= 0) { e.preventDefault(); select(items[n], true, true); }
    });
    return {
      value: function () { var on = items.filter(function (it) { return it.getAttribute("aria-checked") === "true"; })[0]; return on ? on.getAttribute("data-value") : null; }
    };
  }

  function initTabs() {
    var cards = $$("[data-tool]");
    $$("[data-tabs]").forEach(function (list) {
      var tabs = $$('[role="tab"]', list);
      var panel = document.getElementById(tabs[0].getAttribute("aria-controls"));
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.tabIndex = on ? 0 : -1;
        });
        if (panel) {
          panel.setAttribute("aria-labelledby", tab.id);
          $$("[data-panel]", panel).forEach(function (layer) {
            var on = layer.getAttribute("data-panel") === tab.id;
            layer.classList.toggle("is-on", on);
            if (on) layer.removeAttribute("aria-hidden"); else layer.setAttribute("aria-hidden", "true");
          });
        }
        if (focus) tab.focus();
        moveThumb(list, tab);
        cards.forEach(function (c) { c.classList.toggle("is-current", c.getAttribute("data-tool") === tab.id); });
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { select(t, false); }); });
      // Light, Curves, Color wheels and 8-band HSL cards switch the phone to their screen.
      $$("[data-show-tab]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var tab = document.getElementById(btn.getAttribute("data-show-tab"));
          if (!tab || tabs.indexOf(tab) < 0) return;
          select(tab, false);
          if (window.innerWidth <= 1000 && panel) {
            var r = panel.getBoundingClientRect();
            if (r.top < 70 || r.bottom > window.innerHeight) {
              panel.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
            }
          }
        });
      });
      cards.forEach(function (c) { c.classList.toggle("is-current", c.getAttribute("data-tool") === tabs[0].id); });
      list.addEventListener("keydown", function (e) {
        var i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        var n = arrowIndex(e.key, i, tabs.length);
        if (n >= 0) { e.preventDefault(); select(tabs[n], true); }
      });
    });
  }

  /* ---------- Shared look data (real renders of the app's filters) ---------- */
  var LOOKS = {
    "airy-cool": "Shore",
    "golden-warm": "Sundown",
    "moody-blue": "Harbor",
    "clean-vivid": "Lagoon",
    "mono-contrast": "Noir",
    "mono-warm": "Sepia"
  };
  var PHOTOS = {
    beach: { name: "beach", alt: "A woman walking on a beach at golden hour.", w: 896, h: 1200 },
    conv: { name: "convertible", alt: "A vintage convertible parked above the sea.", w: 776, h: 1040 },
    terrace: { name: "terrace", alt: "A terrace table with lemons and flowers above a misty bay.", w: 896, h: 1200 }
  };
  function lookSrc(photo, look) { return "assets/img/looks/" + photo + "-" + look + ".jpg"; }
  function whenReady(imgs) {
    return Promise.all(imgs.map(function (img) {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(function (res) {
        var done = function () { res(); };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        setTimeout(done, 2500);
      });
    }));
  }

  /* ---------- Look lab: filter chips + before/after compare ---------- */
  function initLab() {
    var lab = $("[data-lab]");
    if (!lab) return;
    var stage = $("[data-lab-stage]", lab);
    var orig = $("[data-lab-orig]", lab);
    var looks = $$("[data-lab-looks] img", lab);
    var thumbs = $$("[data-radio=\"look\"] [role=\"radio\"]", lab);
    var nameEl = $("[data-lab-name]", lab);
    var range = $("[data-lab-range]", lab);
    var live = $("[data-lab-live]", lab);
    var state = { photo: "beach", look: "golden-warm" };
    var introCancelled = false;

    function announce() { live.textContent = "Showing " + LOOKS[state.look] + " on the " + PHOTOS[state.photo].name + " photo."; }
    function setPos(v) {
      v = clamp(v, 0, 100);
      stage.style.setProperty("--pos", v + "%");
      range.value = String(Math.round(v));
    }
    function setLook(look) {
      state.look = look;
      looks.forEach(function (img) { img.classList.toggle("is-on", img.getAttribute("data-look") === look); });
      nameEl.textContent = LOOKS[look];
      announce();
    }
    function setPhoto(photo) {
      if (photo === state.photo) return;
      state.photo = photo;
      var p = PHOTOS[photo];
      stage.classList.add("is-swapping");
      setTimeout(function () {
        orig.src = lookSrc(photo, "original");
        orig.alt = p.alt;
        orig.width = p.w; orig.height = p.h;
        looks.forEach(function (img) {
          img.loading = "eager";
          img.src = lookSrc(photo, img.getAttribute("data-look"));
          img.width = p.w; img.height = p.h;
        });
        thumbs.forEach(function (btn) {
          var t = $("[data-thumb]", btn);
          if (t) t.src = "assets/img/looks/thumb-" + photo + "-" + btn.getAttribute("data-value") + ".jpg";
        });
        var current = looks.filter(function (img) { return img.getAttribute("data-look") === state.look; });
        whenReady([orig].concat(current)).then(function () { stage.classList.remove("is-swapping"); announce(); });
      }, reduced() ? 0 : 320);
    }

    initRadio($('[data-radio="look"]', lab), function (v) { setLook(v); });
    initRadio($('[data-radio="photo"]', lab), function (v) { setPhoto(v); });

    range.addEventListener("input", function () { setPos(parseFloat(range.value)); });
    // Pointer drag anywhere on the photo (the range input handles keyboard and assistive tech).
    var dragging = false;
    function fromEvent(e) {
      var r = stage.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    }
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true;
      introCancelled = true;
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    stage.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) {
      stage.addEventListener(t, function () { dragging = false; });
    });

    // First arrival: sweep the look across the photo once.
    lab.addEventListener("reveal", function () {
      if (reduced()) return;
      var start = null, from = 100, to = 50, dur = 1500;
      setPos(from);
      function step(ts) {
        if (introCancelled) return;
        if (start === null) start = ts + 350;
        var t = clamp((ts - start) / dur, 0, 1);
        var e = 1 - Math.pow(1 - t, 3);
        setPos(from + (to - from) * e);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    range.addEventListener("keydown", function () { introCancelled = true; });
  }

  /* ---------- One Recipe, many photos ---------- */
  // Each demo Recipe is a saved edit with its own name; the renders show its filter on three photos.
  var DEMO_RECIPES = {
    "golden-warm": "Beach days",
    "airy-cool": "Sea air",
    "moody-blue": "Blue hour",
    "mono-contrast": "Sunday paper"
  };
  function initPreset() {
    var preset = $("[data-preset]");
    if (!preset) return;
    var targets = $$("[data-targets] .target", preset);
    var nameEl = $("[data-rc-name]", preset);
    var filterEl = $("[data-rc-filter]", preset);
    var swatch = $("[data-rc-swatch]", preset);
    var live = $("[data-preset-live]", preset);
    var applyBtn = $("[data-apply]", preset);
    var recipe = "golden-warm";
    var applied = false, timers = [];

    targets.forEach(function (t) {
      var img = document.createElement("img");
      img.className = "look";
      img.alt = "";
      img.decoding = "async";
      var orig = $(".orig", t);
      img.width = orig.width; img.height = orig.height;
      orig.insertAdjacentElement("afterend", img);
    });
    function setSwatch(look) {
      var img = $('img[data-look="' + look + '"]', swatch);
      if (!img) {
        img = document.createElement("img");
        img.alt = ""; img.decoding = "async";
        img.setAttribute("data-look", look);
        img.src = "assets/img/looks/thumb-beach-" + look + ".jpg";
        swatch.appendChild(img);
      }
      $$("img", swatch).forEach(function (i) { i.classList.toggle("is-on", i === img); });
    }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function reset() {
      targets.forEach(function (t) { $(".look", t).classList.remove("is-on"); t.classList.remove("is-done"); });
    }
    function run() {
      clearTimers();
      var name = DEMO_RECIPES[recipe];
      var wait = applied ? 380 : 0;
      reset();
      preset.classList.remove("is-flowing");
      void preset.offsetWidth;
      timers.push(setTimeout(function () {
        if (!reduced()) preset.classList.add("is-flowing");
        targets.forEach(function (t, i) {
          var photo = t.getAttribute("data-photo");
          var img = $(".look", t);
          $("[data-cap]", t).textContent = name;
          img.src = lookSrc(photo, recipe);
          timers.push(setTimeout(function () {
            whenReady([img]).then(function () {
              img.classList.add("is-on");
              t.classList.add("is-done");
            });
          }, reduced() ? 0 : 520 + i * 170));
        });
        live.textContent = "Applied the " + name + " Recipe to all three photos.";
      }, wait));
      applied = true;
    }
    initRadio($('[data-radio="recipe"]', preset), function (v, user) {
      recipe = v;
      var name = DEMO_RECIPES[v];
      nameEl.classList.add("is-swapping");
      setTimeout(function () { nameEl.textContent = name; filterEl.textContent = LOOKS[v]; nameEl.classList.remove("is-swapping"); }, reduced() ? 0 : 220);
      setSwatch(v);
      if (applied && user) run();
    });
    setSwatch(recipe);
    applyBtn.addEventListener("click", run);
    preset.addEventListener("reveal", function () {
      if (applied) return;
      timers.push(setTimeout(run, reduced() ? 0 : 900));
    });
  }

  /* ---------- House Recipes: what's inside each one (from the app's own Recipe files) ---------- */
  var HOUSE = {
    "warm-morning": { name: "Brunch", alt: "Breakfast on a balcony, edited with the Brunch Recipe.", items: [["Filter · Portre", "75"], ["Shadows", "+15"], ["Highlights", "−5"], ["Contrast", "+5"], ["Vibrance", "+15"]] },
    "soft-cafe": { name: "Bistro", alt: "A café table on a cobbled street, edited with the Bistro Recipe.", items: [["Filter · Fade", "80"], ["Contrast", "+12"], ["Highlights", "−3"], ["Blacks", "−8"], ["Vibrance", "+10"], ["Saturation", "−5"]] },
    "golden-glow": { name: "Golden", alt: "A woman on a beach at sunset, edited with the Golden Recipe.", items: [["Filter · Sundown", "85"], ["Shadows", "+10"], ["Highlights", "−4"], ["Vibrance", "+5"], ["Bloom", "20"], ["Grain", "15"], ["Halation", "20"]] },
    "vivid-coast": { name: "Riviera", alt: "A vintage convertible above the sea, edited with the Riviera Recipe.", items: [["Filter · Lagoon", "90"], ["Contrast", "+5"], ["Whites", "+5"], ["HSL", "Orange, Aqua, Blue"], ["Vignette", "15"]] },
    "city-night": { name: "Neon", alt: "A night street lit by theatre signs, edited with the Neon Recipe.", items: [["Filter · Dusk", "85"], ["Contrast", "+10"], ["Shadows", "+10"], ["Tone curve", ""], ["Bloom", "25"], ["Grain", "20"], ["Halation", "35"]] },
    "pink-soft": { name: "Blush", alt: "A soft portrait in a pink cardigan, edited with the Blush Recipe.", items: [["Filter · Portre", "50"], ["Saturation", "−5"], ["Tone curve", ""], ["Color wheels", ""], ["Bloom", "10"], ["Grain", "10"]] },
    "street-mono": { name: "Gallery", alt: "A laughing woman at a café, in black and white with the Gallery Recipe.", items: [["Filter · Noir", "100"], ["Contrast", "+5"], ["Shadows", "+5"], ["Grain", "30"], ["Vignette", "20"]] },
    "dusk-cool": { name: "Rooftop", alt: "A portrait on a rooftop at dusk, edited with the Rooftop Recipe.", items: [["Filter · Harbor", "85"], ["Vibrance", "+10"], ["Tone curve", ""], ["Grain", "15"], ["Halation", "15"]] }
  };
  function initHouse() {
    var group = $('[data-radio="house"]');
    var card = $("[data-house-card]");
    if (!group || !card) return;
    var img = $("[data-house-img]", card);
    var ing = $("[data-house-ingredients]", card);
    var nameEl = $("[data-house-name]", card);
    var list = $("[data-house-list]", card);
    var live = $("[data-house-live]");
    var token = 0;
    initRadio(group, function (id) {
      var r = HOUSE[id];
      if (!r) return;
      var my = ++token;
      img.classList.add("is-off");
      ing.classList.add("is-swapping");
      setTimeout(function () {
        if (my !== token) return;
        nameEl.textContent = r.name;
        list.textContent = "";
        r.items.forEach(function (pair) {
          var li = document.createElement("li");
          li.appendChild(document.createTextNode(pair[0]));
          if (pair[1]) { var em = document.createElement("em"); em.textContent = pair[1]; li.appendChild(em); }
          list.appendChild(li);
        });
        ing.classList.remove("is-swapping");
        img.src = "assets/img/recipes/recipe-" + id + "-after.jpg";
        img.alt = r.alt;
        whenReady([img]).then(function () { if (my === token) img.classList.remove("is-off"); });
        live.textContent = r.name + ": " + r.items.map(function (p) { return p[0] + (p[1] ? " " + p[1] : ""); }).join(", ") + ".";
      }, reduced() ? 0 : 280);
    });
  }

  /* ---------- Collage layouts ---------- */
  var T = 100 / 3;
  var LAYOUTS = {
    "2": [[0, 0, 50, 100], [50, 0, 50, 100]],
    "3": [[0, 0, T, 100], [T, 0, T, 100], [2 * T, 0, T, 100]],
    "4": [[0, 0, 50, 50], [50, 0, 50, 50], [0, 50, 50, 50], [50, 50, 50, 50]],
    "6": [[0, 0, 2 * T, 2 * T], [2 * T, 0, T, T], [2 * T, T, T, T], [0, 2 * T, T, T], [T, 2 * T, T, T], [2 * T, 2 * T, T, T]],
    "9": [[0, 0, T, T], [T, 0, T, T], [2 * T, 0, T, T], [0, T, T, T], [T, T, T, T], [2 * T, T, T, T], [0, 2 * T, T, T], [T, 2 * T, T, T], [2 * T, 2 * T, T, T]]
  };
  function setFill(input) {
    var min = parseFloat(input.min) || 0, max = parseFloat(input.max) || 100;
    input.style.setProperty("--fill", ((parseFloat(input.value) - min) / (max - min)) * 100 + "%");
  }
  function initCollage() {
    var collage = $("[data-collage]");
    if (!collage) return;
    var cells = $$(".cell", collage);
    initRadio($('[data-radio="layout"]'), function (n) {
      var L = LAYOUTS[n];
      cells.forEach(function (c, i) {
        var r = L[i];
        if (r) {
          c.style.setProperty("--x", r[0].toFixed(3));
          c.style.setProperty("--y", r[1].toFixed(3));
          c.style.setProperty("--cw", r[2].toFixed(3));
          c.style.setProperty("--ch", r[3].toFixed(3));
          c.classList.remove("is-off");
        } else {
          c.classList.add("is-off");
        }
      });
      collage.setAttribute("aria-label", "A collage of " + n + " photos");
    });
    [["[data-collage-gap]", "--gap"], ["[data-collage-radius]", "--r"]].forEach(function (pair) {
      var input = $(pair[0]);
      if (!input) return;
      var out = input.parentElement.querySelector("[data-out]");
      var apply = function () {
        collage.style.setProperty(pair[1], input.value + "px");
        if (out) out.textContent = input.value;
        setFill(input);
      };
      input.addEventListener("input", apply);
      apply();
    });
  }

  /* ---------- Videos: play only while visible, with a pause control ---------- */
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); }
  function initVideos() {
    var reels = $$("[data-reel]");
    var bgs = $$("video[data-reel-bg], video[data-autoplay]");
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target.tagName === "VIDEO" ? entry.target : $("video", entry.target);
        var host = entry.target;
        host._visible = entry.isIntersecting;
        if (entry.isIntersecting && !host._userPaused && !reduced()) play(v, host);
        else if (!entry.isIntersecting && !v.paused) v.pause();
      });
    }, { threshold: 0.3 }) : null;

    function play(v, host) {
      var p = v.play();
      if (p && p.catch) p.catch(function () { if (host.classList) host.classList.add("is-paused"); });
    }

    reels.forEach(function (reel) {
      var v = $("video", reel);
      var btn = $("[data-toggle]", reel);
      var bar = $(".bar i", reel);
      var time = $("time", reel);
      var raf = 0;
      function tick() {
        if (v.duration) {
          bar.style.setProperty("--t", (v.currentTime / v.duration).toFixed(4));
          time.textContent = fmt(v.currentTime);
        }
        raf = requestAnimationFrame(tick);
      }
      v.addEventListener("play", function () {
        reel.classList.remove("is-paused");
        btn.setAttribute("aria-label", "Pause video");
        cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      });
      v.addEventListener("pause", function () {
        reel.classList.add("is-paused");
        btn.setAttribute("aria-label", "Play video");
        cancelAnimationFrame(raf);
      });
      btn.addEventListener("click", function () {
        if (v.paused) { reel._userPaused = false; play(v, reel); }
        else { reel._userPaused = true; v.pause(); }
      });
      reel.classList.add("is-paused");
      btn.setAttribute("aria-label", "Play video");
      if (io) io.observe(reel);
    });
    bgs.forEach(function (v) {
      if (reduced()) { v.removeAttribute("autoplay"); v.pause(); }
      if (io) io.observe(v);
    });
    if (reduceQuery.addEventListener) {
      reduceQuery.addEventListener("change", function () {
        if (reduced()) $$("video").forEach(function (v) { v.pause(); });
      });
    }
  }

  /* ---------- Boot ---------- */
  initStore();
  var nav = initNav();
  initReveal();
  initTabs();
  initLab();
  initPreset();
  initHouse();
  initCollage();
  initVideos();
  initScrollFx(nav);
  // Place thumbs without a slide on first paint, and again (still without one) once fonts have their real widths.
  refreshThumbs(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { refreshThumbs(true); });
  window.addEventListener("resize", function () { refreshThumbs(true); });
  window.addEventListener("load", function () { refreshThumbs(true); });
})();
