(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll + active nav highlight (homepage only)
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const isHomepage = navLinks.length > 0;
  if (!isHomepage) return;

  const linkByHash = new Map();
  for (const a of navLinks) {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) linkByHash.set(href, a);
  }
  const defaultHash = navLinks[0]?.getAttribute("href")?.startsWith("#") ? navLinks[0].getAttribute("href") : "#about";

  const setActive = (hash) => {
    for (const a of navLinks) a.classList.remove("is-active");
    const el = linkByHash.get(hash) || linkByHash.get(defaultHash);
    if (el) el.classList.add("is-active");
  };

  for (const a of navLinks) {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
      setActive(href);
    });
  }

  // IntersectionObserver: highlight section in view
  const sections = Array.from(linkByHash.keys()).map((h) => document.querySelector(h)).filter(Boolean);
  if (sections.length === 0) return;

  // Special-case: keep Homepage active near the very top
  const TOP_Y = 80;
  const onScrollTop = () => {
    if (window.scrollY <= TOP_Y) setActive("#home");
  };
  window.addEventListener("scroll", onScrollTop, { passive: true });

  let ticking = false;
  const io = new IntersectionObserver(
    (entries) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (window.scrollY <= TOP_Y) {
          setActive("#home");
          return;
        }
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (!visible) return;
        const id = visible.target.getAttribute("id");
        if (!id) return;
        setActive(`#${id}`);
      });
    },
    { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.2, 0.3] }
  );

  for (const s of sections) io.observe(s);

  // Initial state
  setActive(location.hash && linkByHash.has(location.hash) ? location.hash : defaultHash);
  onScrollTop();
})();

