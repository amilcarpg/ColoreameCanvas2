const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("siteNav");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const trackLinks = document.querySelectorAll("[data-track]");
const faqItems = document.querySelectorAll(".faq-item");

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

function toggleMenu(forceOpen) {
  if (!menuToggle || !siteNav) return;
  const shouldOpen =
    typeof forceOpen === "boolean"
      ? forceOpen
      : menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  siteNav.classList.toggle("is-open", shouldOpen);
}

function updateActiveLink() {
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      return { link, section: document.querySelector(id) };
    })
    .filter(Boolean);

  const marker = window.scrollY + 140;
  let active = sections[0];

  sections.forEach((item) => {
    if (item.section && item.section.offsetTop <= marker) {
      active = item;
    }
  });

  navLinks.forEach((link) => link.classList.remove("active"));
  if (active?.link) {
    active.link.classList.add("active");
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    toggleMenu();
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    toggleMenu(false);
  });
});

trackLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const label = link.getAttribute("data-track");
    if (!label) return;
    trackEvent("select_content", {
      content_type: "home_interaction",
      item_id: label,
    });
  });
});

faqItems.forEach((item, index) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    trackEvent("faq_open", {
      item_id: `faq_${index + 1}`,
      question: item.querySelector("summary")?.textContent || "",
    });
  });
});

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    toggleMenu(false);
  }
});

updateActiveLink();
