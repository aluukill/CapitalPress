/* ================================================================
   category.js — Category page logic
   ================================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const topic = Utils.getParam("topic") || "politics";
  const grid = document.getElementById("category-grid");
  const spinner = document.getElementById("category-spinner");
  const loadMoreWrap = document.getElementById("load-more-wrap");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const noResults = document.getElementById("no-results");
  const titleEl = document.getElementById("category-title");
  const countEl = document.getElementById("category-count");

  // Set page title
  const topicLabel = Utils.capitalize(topic);
  if (titleEl) titleEl.textContent = topicLabel;
  document.title = `${topicLabel} — Capital Press`;

  // Highlight correct nav link
  const updateNavActive = () => {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.href.includes(`topic=${topic}`)) {
        link.classList.add("active");
      }
    });
  };
  updateNavActive();

  // State
  let nextCursor = null;
  let totalResults = 0;
  let isLoading = false;

  // Show skeletons
  if (grid) Components.showSkeletons(grid, 8);

  // Initial load
  async function loadArticles(append = false) {
    if (isLoading) return;
    isLoading = true;

    if (!append) {
      if (spinner) spinner.style.display = "flex";
    }
    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "Loading...";
    }

    try {
      const result = await API.fetchByTopic(
        topic,
        CONFIG.DEFAULT_PER_PAGE,
        nextCursor,
      );

      if (spinner) spinner.style.display = "none";

      nextCursor = result.next_cursor;
      totalResults = result.total_results;

      if (countEl) {
        countEl.textContent = `${totalResults.toLocaleString()} articles found`;
      }

      if (result.data.length > 0) {
        Components.renderCards(grid, result.data, { append, animate: true });

        if (noResults) noResults.style.display = "none";

        // Show/hide load more
        if (nextCursor) {
          loadMoreWrap.style.display = "block";
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load More Articles";
        } else {
          loadMoreWrap.style.display = "none";
        }
      } else if (!append) {
        grid.innerHTML = "";
        if (noResults) noResults.style.display = "block";
        loadMoreWrap.style.display = "none";
      }
    } catch (err) {
      console.error("Category load error:", err);
      if (spinner) spinner.style.display = "none";
      if (!append) {
        grid.innerHTML = "";
        Utils.showError(
          grid.parentElement,
          Utils.getErrorMessage(
            err,
            "Failed to load articles. Please try again.",
          ),
        );
      }
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = "Try Again";
      }
    }

    isLoading = false;
  }

  // Load initial data
  await loadArticles(false);

  // Load more button handler
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      loadArticles(true);
    });
  }
});
