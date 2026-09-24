/* =========================================================
   Wael Al-Haj — Software Engineer Portfolio
   Vanilla JavaScript
   ========================================================= */

(function () {
    "use strict";

    /* ---------------------------------------------------------
       1. THEME TOGGLE (Dark / Light) with localStorage
       --------------------------------------------------------- */
    const THEME_KEY = "wael-portfolio-theme";
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            /* localStorage may be unavailable (private mode) */
        }
    }

    function getPreferredTheme() {
        let stored = null;
        try {
            stored = localStorage.getItem(THEME_KEY);
        } catch (e) { /* ignore */ }

        if (stored === "dark" || stored === "light") return stored;

        // Default to dark theme per design spec
        return "dark";
    }

    // Initialize theme early
    applyTheme(getPreferredTheme());

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const current = root.getAttribute("data-theme");
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }

    /* ---------------------------------------------------------
       2. MOBILE MENU (Hamburger)
       --------------------------------------------------------- */
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    function closeMenu() {
        if (!navMenu || !menuToggle) return;
        navMenu.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function () {
            const isOpen = navMenu.classList.toggle("open");
            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener("click", function (e) {
            if (!navMenu.classList.contains("open")) return;
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu on Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeMenu();
        });
    }

    /* ---------------------------------------------------------
       3. ACTIVE NAV LINK ON SCROLL (Scroll Spy)
       --------------------------------------------------------- */
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        let currentId = "";

        sections.forEach(function (section) {
            if (scrollPos >= section.offsetTop) {
                currentId = section.id;
            }
        });

        navLinks.forEach(function (link) {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === "#" + currentId);
        });
    }

    /* ---------------------------------------------------------
       4. SMOOTH SCROLLING (with navbar offset fallback)
       --------------------------------------------------------- */
    // Native CSS scroll-behavior is used, but we add JS fallback
    // for browsers that don't support it and to close mobile menu.
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#" || targetId.length < 2) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const navHeight = document.querySelector(".navbar").offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            // Update URL without jumping
            if (history.pushState) {
                history.pushState(null, "", targetId);
            }
        });
    });

    /* ---------------------------------------------------------
       5. DYNAMIC FOOTER YEAR
       --------------------------------------------------------- */
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       6. BACK TO TOP BUTTON
       --------------------------------------------------------- */
    const backToTop = document.getElementById("backToTop");

    function toggleBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle("visible", window.scrollY > 500);
    }

    if (backToTop) {
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ---------------------------------------------------------
       7. SCROLL HANDLER (throttled with rAF)
       --------------------------------------------------------- */
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateActiveLink();
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial run
    updateActiveLink();
    toggleBackToTop();

    /* ---------------------------------------------------------
       8. CV DOWNLOAD — graceful fallback
       --------------------------------------------------------- */
    const cvLinks = document.querySelectorAll('a[download][href$=".pdf"]');
    cvLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            // Try to fetch the PDF to check existence; if missing, show a friendly message.
            fetch(href, { method: "HEAD" })
                .then(function (res) {
                    if (!res.ok) {
                        e.preventDefault();
                        alert(
                            "CV file is not available yet.\n" +
                            "Please place 'Wael-Al-Haj-CV.pdf' inside the assets folder."
                        );
                    }
                })
                .catch(function () {
                    // Network error or file protocol — allow default behavior
                });
        });
    });

    /* ---------------------------------------------------------
       9. REVEAL ON SCROLL (subtle animation)
       --------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        ".skill-card, .project-card, .edu-card, .timeline-content, .contact-card"
    );

    if ("IntersectionObserver" in window && revealTargets.length) {
        // Prepare initial state
        revealTargets.forEach(function (el) {
            el.style.opacity = "0";
            el.style.transform = "translateY(18px)";
            el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        });

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealTargets.forEach(function (el) {
            observer.observe(el);
        });
    }

})();