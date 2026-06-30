/* ================================================================
   utils.js — Shared utility functions
   ================================================================ */

const Utils = {
  /**
   * Format an ISO date string to a human-readable form.
   */
  formatDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour ago
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return mins <= 1 ? "Just now" : `${mins} min ago`;
    }

    // Less than 24 hours ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 7 days ago
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return days === 1 ? "Yesterday" : `${days} days ago`;
    }

    // Otherwise regular format
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Format date for header display.
   */
  formatHeaderDate() {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Truncate text to a max length.
   */
  truncate(text, maxLength = 160) {
    if (!text) return "";
    // Remove the NewsDataHub truncation message if present
    text = text.replace(/\[Truncated.*?\]/gi, "").trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "…";
  },

  /**
   * Escape HTML special characters.
   */
  escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Capitalize first letter of each word.
   */
  capitalize(str) {
    if (!str) return "";
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  },

  /**
   * Get URL search params.
   */
  getParam(name) {
    const params = new URLSearchParams(window.location.search);
    let val = params.get(name);

    // Fallback to hash if not found in search params
    if (!val && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      val = hashParams.get(name);
    }
    return val;
  },

  /**
   * Generate a deterministic hash-based article ID for localStorage.
   */
  articleKey(article) {
    return article.id || article.article_link || article.title;
  },

  /**
   * Get image URL with fallback.
   */
  getImageUrl(article) {
    return article.media_url || CONFIG.PLACEHOLDER_IMAGE;
  },

  /**
   * Build article page URL.
   * We store the article data in sessionStorage and navigate.
   */
  getArticleUrl(article) {
    // Use hash instead of query param to avoid server redirection issues dropping params
    return `article.html#id=${encodeURIComponent(article.id)}`;
  },

  /**
   * Store article data in sessionStorage for the article page.
   */
  storeArticle(article) {
    try {
      sessionStorage.setItem(`article_${article.id}`, JSON.stringify(article));
    } catch (e) {
      console.warn("Could not store article:", e);
    }
  },

  /**
   * Retrieve article data from sessionStorage.
   */
  getStoredArticle(id) {
    try {
      const data = sessionStorage.getItem(`article_${id}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Show an error banner in a parent element.
   */
  showError(parentEl, message) {
    const banner = document.createElement("div");
    banner.className = "error-banner";
    banner.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>${Utils.escapeHtml(message)}</span>
        `;
    parentEl.prepend(banner);
  },

  /**
   * Convert technical errors into clear, user-facing messages.
   */
  getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
    if (!err) return fallback;

    const status = Number(err.status || 0);
    const rawMessage = String(err.message || "").trim();
    const normalized = rawMessage.toLowerCase();

    if (status === 429 || normalized.includes("rate limit")) {
      return "Too many requests right now. Please wait a moment and try again.";
    }

    if (
      status === 401 ||
      status === 403 ||
      normalized.includes("api key") ||
      normalized.includes("unauthorized") ||
      normalized.includes("forbidden") ||
      normalized.includes("authentication")
    ) {
      return "We could not complete your request right now. Please try again shortly.";
    }

    if (status === 404 || normalized.includes("cannot get /api/news")) {
      return "The service is temporarily unavailable. Please refresh and try again.";
    }

    if (
      normalized.includes("failed to fetch") ||
      normalized.includes("networkerror") ||
      normalized.includes("load failed")
    ) {
      return "Connection issue detected. Please check your internet and try again.";
    }

    if (
      status >= 500 ||
      normalized.includes("server api key is not configured") ||
      normalized.includes("failed to reach upstream")
    ) {
      return "News service is temporarily unavailable. Please try again shortly.";
    }

    const safeMessage = rawMessage.replace(/^api error \d+:\s*/i, "").trim();
    const hasTechnicalTerms =
      /(api|endpoint|token|key|server|upstream|vercel|auth|401|403|404|500|unauthorized|forbidden|cors)/i.test(
        safeMessage,
      );
    if (
      safeMessage &&
      safeMessage.length <= 200 &&
      !/<[a-z][\s\S]*>/i.test(safeMessage) &&
      !hasTechnicalTerms
    ) {
      return safeMessage;
    }

    return fallback;
  },
};

/* ================================================================
   Init common header elements
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Set header date
  const headerDate = document.getElementById("header-date");
  if (headerDate) {
    headerDate.textContent = Utils.formatHeaderDate();
  }

  // Mobile search toggle
  const searchToggle = document.getElementById("mobile-search-toggle");
  const searchBar = document.getElementById("header-search");
  if (searchToggle && searchBar) {
    searchToggle.addEventListener("click", () => {
      searchBar.classList.toggle("open");
      if (searchBar.classList.contains("open")) {
        searchBar.querySelector("input").focus();
      }
    });
  }

  // Nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navList = document.getElementById("nav-list");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  // Highlight active nav link
  const currentUrl = window.location.href;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (
      link.href === currentUrl ||
      currentUrl.includes(link.getAttribute("href"))
    ) {
      link.classList.add("active");
    }
  });
});
