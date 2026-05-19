(() => {
  const header = document.querySelector("[data-site-header]");
  const nav = document.querySelector("[data-primary-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (!header || !nav || !toggle) {
    return;
  }

  let isMenuOpen;

  const setMenuState = (isOpen) => {
    if (isMenuOpen === isOpen) {
      return;
    }

    isMenuOpen = isOpen;
    header.classList.toggle("is-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close primary navigation" : "Open primary navigation"
    );
  };

  setMenuState(false);

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideHeader = header.contains(event.target);

    if (!clickedInsideHeader) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
      toggle.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 768px)");
  const handleBreakpointChange = (event) => {
    if (event.matches) {
      setMenuState(false);
    }
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", handleBreakpointChange);
  } else {
    desktopQuery.addListener(handleBreakpointChange);
  }

  const currentPath = window.location.pathname.replace(/\/$/, "/index.html");
  const navLinks = nav.querySelectorAll("a[href]");

  navLinks.forEach((link) => {
    const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;
    const isCurrentPage = currentPath === linkPath;
    const isServiceDetail = currentPath.includes("/services/") && linkPath.endsWith("/services.html");

    if (isCurrentPage || isServiceDetail) {
      link.setAttribute("aria-current", "page");
    }
  });

  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    const answerId = question.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;

    if (!answer) {
      return;
    }

    question.addEventListener("click", () => {
      const isExpanded = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });
})();
