/* =========================================================
   MAIN — rendering + interaction engine
   ========================================================= */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const DEFAULT_ACCENT = "#f0b429";

  /* ---------- helpers ---------- */

  const pad2 = (n) => String(n).padStart(2, "0");

  function hexToRgb(hex) {
    const m = hex.replace("#", "");
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16),
    };
  }

  function setAccent(hex) {
    const { r, g, b } = hexToRgb(hex);
    const s = document.documentElement.style;
    s.setProperty("--accent", hex);
    s.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  }

  /* ---------- mock UI templates ---------- */

  const MOCKS = {
    privaj: () => `
      <div class="mock mock--privaj">
        <div class="mock__side">
          <span class="mock__sidedot mock__sidedot--on"></span>
          <span class="mock__sidedot"></span>
          <span class="mock__sidedot"></span>
          <span class="mock__sidedot"></span>
        </div>
        <div class="mock__chat">
          <div class="bubble bubble--in">
            <span class="skl" style="width:78%"></span>
            <span class="skl" style="width:52%"></span>
          </div>
          <div class="bubble bubble--out">
            <span class="skl skl--lt" style="width:64%"></span>
            <span class="redact" style="width:44%"></span>
            <span class="skl skl--lt" style="width:70%"></span>
          </div>
          <div class="bubble bubble--in">
            <span class="skl" style="width:60%"></span>
            <span class="redact" style="width:36%"></span>
          </div>
          <div class="bubble bubble--in bubble--typing">
            <span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>
          </div>
          <div class="mock__hint mono">memory: local &middot; data: yours</div>
        </div>
      </div>`,

    claimforge: () => `
      <div class="mock mock--claimforge">
        <div class="voice">
          <span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span><span class="vbar"></span>
          <span class="voice__label mono">listening&hellip;</span>
        </div>
        <div class="doc">
          <div class="doc__head">
            <span class="skl skl--strong" style="width:42%"></span>
            <span class="doc__badge mono">CLAIM 1</span>
          </div>
          <div class="doc__row"><span class="skl skl--lt" style="width:24%"></span><span class="skl" style="width:56%"></span></div>
          <div class="doc__row"><span class="skl skl--lt" style="width:30%"></span><span class="skl" style="width:44%"></span></div>
          <div class="doc__row"><span class="skl skl--lt" style="width:20%"></span><span class="skl" style="width:62%"></span></div>
          <div class="doc__progress"><span class="doc__fill"></span></div>
          <div class="doc__foot mono">interview &rarr; draft &rarr; verify &rarr; export</div>
          <div class="stamp mono">EVIDENCE &#10003;</div>
        </div>
      </div>`,

    inboxpilot: () => `
      <div class="mock mock--inboxpilot">
        <div class="mail">
          <div class="mail__row">
            <span class="mail__dot"></span>
            <span class="mail__lines"><span class="skl" style="width:52%"></span><span class="skl skl--lt" style="width:80%"></span></span>
          </div>
          <div class="mail__row mail__row--hot">
            <span class="mail__dot mail__dot--hot"></span>
            <span class="mail__lines"><span class="skl skl--strong" style="width:60%"></span><span class="skl skl--lt" style="width:72%"></span></span>
            <span class="chip mono">AI &middot; drafted</span>
          </div>
          <div class="mail__row">
            <span class="mail__dot"></span>
            <span class="mail__lines"><span class="skl" style="width:44%"></span><span class="skl skl--lt" style="width:66%"></span></span>
            <span class="chip chip--dim mono">summary</span>
          </div>
          <div class="mail__compose">
            <span class="skl skl--lt" style="width:34%"></span>
            <span class="typing-line"><span class="skl" style="width:58%"></span><span class="caret"></span></span>
          </div>
        </div>
      </div>`,

    dashy: () => `
      <div class="mock mock--dashy">
        <div class="brief">
          <span class="brief__label mono">Today</span>
          <span class="skl skl--strong" style="width:88%"></span>
          <span class="skl skl--lt" style="width:66%"></span>
          <span class="dpower mono"><span class="dpower__dot"></span>live</span>
        </div>
        <div class="dgrid">
          <div class="dcard">
            <span class="dcard__top"><span class="dcard__dot"></span><span class="skl" style="width:40%"></span><span class="chip mono">AI</span></span>
            <span class="skl skl--lt" style="width:82%"></span>
            <span class="skl skl--lt" style="width:58%"></span>
          </div>
          <div class="dcard">
            <span class="dcard__top"><span class="dcard__dot"></span><span class="skl" style="width:52%"></span><span class="chip mono">AI</span></span>
            <span class="skl skl--lt" style="width:70%"></span>
            <span class="skl skl--lt" style="width:64%"></span>
          </div>
          <div class="dcard">
            <span class="dcard__top"><span class="dcard__dot"></span><span class="skl" style="width:46%"></span><span class="chip mono">AI</span></span>
            <span class="skl skl--lt" style="width:76%"></span>
            <span class="skl skl--lt" style="width:50%"></span>
          </div>
          <div class="dcard dcard--connect">
            <span class="dcard__plus">+</span>
            <span class="skl skl--lt" style="width:54%"></span>
          </div>
        </div>
        <div class="mock__hint mono">local model &middot; refreshed 2m ago</div>
      </div>`,

    cma: () => `
      <div class="mock mock--cma">
        <div class="cmd mono"><span class="cmd__slash">/cma</span>&nbsp;123 Main St<span class="caret"></span></div>
        <div class="cma__map">
          <span class="pin" style="left:26%;top:38%"></span>
          <span class="pin pin--hot" style="left:55%;top:52%"></span>
          <span class="pin" style="left:72%;top:30%"></span>
          <span class="pin" style="left:42%;top:68%"></span>
          <span class="pricecard mono">$412,400</span>
        </div>
        <div class="cma__chart">
          <span class="bar" style="--h:38%"></span>
          <span class="bar" style="--h:52%"></span>
          <span class="bar" style="--h:46%"></span>
          <span class="bar bar--hot" style="--h:74%"></span>
          <span class="bar" style="--h:60%"></span>
          <span class="cma__label mono">comps &middot; auto-selected</span>
        </div>
      </div>`,

    generic: () => `
      <div class="mock mock--generic">
        <span class="skl skl--strong" style="width:52%"></span>
        <span class="skl" style="width:78%"></span>
        <span class="skl" style="width:64%"></span>
        <span class="skl skl--lt" style="width:70%"></span>
      </div>`,
  };

  /* ---------- render chapters ---------- */

  function renderChapters() {
    const host = $("#chapters");
    if (!host) return;

    host.innerHTML = PROJECTS.map((p, i) => {
      const idx = pad2(i + 1);
      const logoTile = p.brand
        ? `<span class="plogo plogo--img${p.brand.bg === "light" ? " plogo--lightbg" : ""}" data-logo>
             <img src="${p.brand.src}" alt="${p.name} logo" loading="lazy" />
           </span>`
        : `<span class="plogo plogo--mark" data-logo>${LOGOS[p.logo] || p.logo || ""}</span>`;
      const visual = p.image
        ? `<img class="window__shot" src="${p.image}" alt="${p.name} screenshot" loading="lazy" />`
        : (MOCKS[p.mock] || MOCKS.generic)();

      const action = p.link
        ? `<a class="btn btn--ghost" href="${p.link}" target="_blank" rel="noopener" data-cursor="link" data-magnetic>
             <span>Visit ${p.name}</span>
             <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
           </a>`
        : `<span class="badge mono" title="Not publicly available">private build</span>`;

      return `
      <article class="chapter ${i % 2 ? "chapter--flip" : ""}" id="${p.id}" data-accent="${p.accent}" style="--pa:${p.accent}">
        <div class="chapter__inner">
          <div class="chapter__info">
            <p class="chapter__meta mono" data-reveal>
              <span class="chapter__idx">${idx}</span>
              <span class="chapter__sep" aria-hidden="true"></span>
              <span>${p.domain}</span>
            </p>
            <div class="chapter__identity" data-reveal>
              ${logoTile}
              <h3 class="chapter__name">${p.name}</h3>
            </div>
            <p class="chapter__headline" data-reveal>${p.headline}</p>
            <p class="chapter__desc" data-reveal>${p.description}</p>
            <ul class="chapter__features">
              ${p.features.map((f, fi) => `<li data-reveal style="--i:${fi}"><span class="tick" aria-hidden="true"></span>${f}</li>`).join("")}
            </ul>
            <div class="chapter__foot" data-reveal>
              <div class="chapter__tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
              <div class="chapter__actions">
                ${action}
                <span class="status mono"><span class="status__dot" aria-hidden="true"></span>${p.status}</span>
              </div>
            </div>
          </div>
          <div class="chapter__visual" data-reveal>
            <span class="chapter__bignum" aria-hidden="true">${idx}</span>
            <div class="window" data-tilt>
              <div class="window__bar">
                <span class="window__dot"></span><span class="window__dot"></span><span class="window__dot"></span>
                <span class="window__title mono">${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.app</span>
              </div>
              <div class="window__body">${visual}</div>
              <div class="window__glow" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- spine nav ---------- */

  function buildSpine() {
    const host = $("#spineNodes");
    if (!host) return;
    host.innerHTML = PROJECTS.map(
      (p, i) => `
      <li>
        <a href="#${p.id}" class="spine__node" data-spine="${p.id}" data-cursor="link" aria-label="${p.name}">
          <span class="spine__tip">${p.name}</span>
        </a>
      </li>`
    ).join("");
  }

  /* ---------- scroll progress (spine fill) ---------- */

  function initProgress() {
    const fill = $(".spine__fill");
    if (!fill) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      fill.style.transform = `scaleY(${Math.min(1, Math.max(0, p))})`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- reveal on scroll ---------- */

  function initReveals() {
    const els = $$("[data-reveal]");
    if (prefersReduced) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- split section titles ---------- */

  function initSplitTitles() {
    const titles = $$(".split-title");
    titles.forEach((t) => {
      const text = t.textContent;
      t.setAttribute("aria-label", text);
      t.innerHTML = [...text]
        .map((ch, i) =>
          ch === " "
            ? `<span class="sp"> </span>`
            : `<span class="ch" aria-hidden="true" style="--ci:${i}">${ch}</span>`
        )
        .join("");
    });
    if (prefersReduced) { titles.forEach((t) => t.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.4 }
    );
    titles.forEach((t) => io.observe(t));
  }

  /* ---------- logo draw-in ---------- */

  function initLogoDraw() {
    const logos = $$("[data-logo]");
    if (prefersReduced) { logos.forEach((l) => l.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    logos.forEach((l) => io.observe(l));
  }

  /* ---------- accent switching per chapter ---------- */

  function initAccentSwitch() {
    const zones = [
      ...$$(".chapter"),
      // anything outside chapters resets to default:
      ...["#hero", "#process", "#contact"].map((s) => $(s)).filter(Boolean),
    ];
    const spineNodes = $$(".spine__node");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const accent = e.target.dataset.accent || DEFAULT_ACCENT;
          setAccent(accent);
          spineNodes.forEach((n) =>
            n.classList.toggle("active", n.dataset.spine === e.target.id)
          );
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    zones.forEach((z) => io.observe(z));
  }

  /* ---------- manifesto: words light up as you scroll ---------- */

  function initManifesto() {
    const el = $("#manifestoText");
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="mword">${w}</span>`).join(" ");
    const spans = $$(".mword", el);
    if (prefersReduced) { spans.forEach((s) => s.classList.add("lit")); return; }

    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0 -> 1 as the block travels from 85% to 35% of viewport
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
      const lit = Math.floor(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- counters ---------- */

  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || "";
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const t0 = performance.now();
      const dur = 900;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- nav behavior ---------- */

  function initNav() {
    const nav = $("#nav");
    if (!nav) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle("nav--scrolled", y > 40);
      if (y > 420 && y > lastY + 4) nav.classList.add("nav--hidden");
      else if (y < lastY - 4 || y < 420) nav.classList.remove("nav--hidden");
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ---------- custom cursor ---------- */

  function initCursor() {
    const cursor = $(".cursor");
    if (!cursor || !finePointer || prefersReduced) {
      if (cursor) cursor.remove();
      return;
    }
    document.documentElement.classList.add("has-cursor");
    const dot = $(".cursor__dot", cursor);

    window.addEventListener("pointermove", (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursor.classList.add("cursor--on");
    }, { passive: true });

    document.addEventListener("pointerover", (e) => {
      if (e.target.closest("[data-cursor]")) cursor.classList.add("cursor--hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("[data-cursor]")) cursor.classList.remove("cursor--hover");
    });
    document.addEventListener("pointerdown", () => cursor.classList.add("cursor--down"));
    document.addEventListener("pointerup", () => cursor.classList.remove("cursor--down"));
    window.addEventListener("blur", () => cursor.classList.remove("cursor--on"));
  }

  /* ---------- magnetic buttons ---------- */

  function initMagnetic() {
    if (!finePointer || prefersReduced) return;
    $$("[data-magnetic]").forEach((el) => {
      const strength = 14;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- tilt on project windows ---------- */

  function initTilt() {
    if (!finePointer || prefersReduced) return;
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        el.style.transform =
          `perspective(900px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- hero constellation canvas ---------- */

  function initConstellation() {
    const canvas = $("#constellation");
    const hero = $("#hero");
    if (!canvas || !hero || prefersReduced) { if (canvas) canvas.remove(); return; }

    const ctx = canvas.getContext("2d");
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    let particles = [];
    let pulses = [];
    let mouse = { x: -9999, y: -9999 };
    let running = false;
    let raf = null;
    let lastPulse = 0;

    const LINK_DIST = 130;
    const MOUSE_R = 150;

    function resize() {
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.min(130, Math.floor((W * H) / 15000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.6,
      }));
    }

    function step(t) {
      ctx.clearRect(0, 0, W, H);

      // occasionally spawn a pulse ring on a random particle
      if (t - lastPulse > 1700 && particles.length) {
        lastPulse = t;
        const p = particles[(Math.random() * particles.length) | 0];
        pulses.push({ x: p.x, y: p.y, r: 0, a: 0.55 });
      }

      // links
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.34;
            ctx.strokeStyle = `rgba(240, 180, 41, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // particles
      for (const p of particles) {
        // gentle mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = ((MOUSE_R - d) / MOUSE_R) * 0.6;
          p.vx += (dx / d) * f * 0.12;
          p.vy += (dy / d) * f * 0.12;
        }
        // speed cap + damping
        p.vx *= 0.985; p.vy *= 0.985;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.12) { p.vx += (Math.random() - 0.5) * 0.04; p.vy += (Math.random() - 0.5) * 0.04; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        ctx.fillStyle = "rgba(236, 230, 219, 0.72)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // pulses
      pulses = pulses.filter((pl) => pl.a > 0.01);
      for (const pl of pulses) {
        pl.r += 1.4;
        pl.a *= 0.955;
        ctx.strokeStyle = `rgba(240, 180, 41, ${pl.a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (running) raf = requestAnimationFrame(step);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    io.observe(hero);

    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start()
    );

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });

    resize();
  }

  /* ---------- contact + footer ---------- */

  function initContact() {
    const btn = $("#contactBtn");
    const label = $("#contactEmail");
    if (btn && SITE.email) {
      btn.href = `mailto:${SITE.email}`;
      if (label) label.textContent = SITE.email;
    }
    const phone = $("#contactPhone");
    const phoneText = $("#contactPhoneText");
    if (phone && SITE.phone) {
      phone.href = `tel:${SITE.phoneHref || SITE.phone.replace(/\s+/g, "")}`;
      if (phoneText) phoneText.textContent = SITE.phone;
    }
    // any element tagged data-email / data-phone (used on the About page)
    $$("[data-email]").forEach((el) => {
      el.href = `mailto:${SITE.email}`;
      if (el.dataset.email === "text") el.textContent = SITE.email;
    });
    $$("[data-phone]").forEach((el) => {
      el.href = `tel:${SITE.phoneHref || SITE.phone.replace(/\s+/g, "")}`;
      if (el.dataset.phone === "text") el.textContent = SITE.phone;
    });
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- boot ---------- */

  renderChapters();
  buildSpine();
  initProgress();
  initReveals();
  initSplitTitles();
  initLogoDraw();
  initAccentSwitch();
  initManifesto();
  initCounters();
  initNav();
  initCursor();
  initMagnetic();
  initTilt();
  initConstellation();
  initContact();

  setAccent(DEFAULT_ACCENT);
  document.documentElement.classList.add("ready");
})();
