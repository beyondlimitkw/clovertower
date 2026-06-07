(async () => {
  "use strict";

  const loadInto = async (selector, candidates) => {
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (res.ok) {
          const html = await res.text();
          const host = document.querySelector(selector);
          if (host) {
            host.innerHTML = html;
            return;
          }
        }
      } catch (error) {
        /* Try the next candidate path. */
      }
    }
    throw new Error(`Failed to load ${selector} from ${candidates.join(", ")}`);
  };

  const navPaths = [
    "../assets/components/navbar.html",
    "assets/components/navbar.html",
    "/assets/components/navbar.html"
  ];
  const footerPaths = [
    "../assets/components/footer.html",
    "assets/components/footer.html",
    "/assets/components/footer.html"
  ];

  await loadInto("#navbar", navPaths);

  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".clover-navbar .nav-link[href]").forEach(link => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href.split("/").pop() === current) link.classList.add("active");
  });

  const isDesktop = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.querySelectorAll(".dropdown-mega").forEach(mega => {
    const toggle = mega.querySelector('[data-bs-toggle="dropdown"]');
    const menu = mega.querySelector(".dropdown-menu");
    if (!toggle || !menu) return;

    let openTimer;
    let closeTimer;

    const open = () => {
      if (!isDesktop()) return;
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("show");
    };

    const close = () => {
      if (!isDesktop()) return;
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("show");
    };

    mega.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      openTimer = setTimeout(open, 80);
    });

    mega.addEventListener("mouseleave", () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(close, 180);
    });

    menu.addEventListener("mouseenter", () => clearTimeout(closeTimer));
    menu.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(close, 180);
    });

    document.addEventListener("click", event => {
      if (!isDesktop()) return;
      if (!event.target.closest(".dropdown-mega")) close();
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
        menu.classList.remove("show");
      });
    }
  });

  const navbarEl = document.querySelector(".clover-navbar, .navbar-glass");
  let lastScrollTop = 0;

  if (navbarEl) {
    window.addEventListener("scroll", () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;

      if (y > 50) navbarEl.classList.add("navbar-scrolled");
      else navbarEl.classList.remove("navbar-scrolled");

      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (y > lastScrollTop && y < maxScroll - 10) {
        navbarEl.style.top = "-100px";
      } else if (y < lastScrollTop - 5) {
        navbarEl.style.top = "0";
      }
      lastScrollTop = y <= 0 ? 0 : y;
    });
  }

  await loadInto("#footer", footerPaths);

  const needsAOS = !!document.querySelector('[class*="aos-"]');
  if (needsAOS) {
    const aosCSS = document.createElement("link");
    aosCSS.rel = "stylesheet";
    aosCSS.href = "https://unpkg.com/aos@2.3.4/dist/aos.css";
    document.head.appendChild(aosCSS);

    const aosJS = document.createElement("script");
    aosJS.src = "https://unpkg.com/aos@2.3.4/dist/aos.js";
    aosJS.onload = () => {
      const aosMap = {
        "aos-fade": "fade",
        "aos-fade-up": "fade-up",
        "aos-fade-down": "fade-down",
        "aos-fade-left": "fade-left",
        "aos-fade-right": "fade-right",
        "aos-zoom-in": "zoom-in",
        "aos-zoom-out": "zoom-out",
        "aos-slide-up": "slide-up",
        "aos-slide-left": "slide-left",
        "aos-slide-right": "slide-right"
      };

      Object.keys(aosMap).forEach(cls => {
        document.querySelectorAll(`.${cls}`).forEach(el => {
          el.setAttribute("data-aos", aosMap[cls]);
        });
      });

      AOS.init({ duration: 700, easing: "ease-out-cubic", once: false });
    };
    document.body.appendChild(aosJS);
  }
})();
